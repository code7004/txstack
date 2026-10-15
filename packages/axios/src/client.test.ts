import type { AxiosAdapter } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpClient } from "./client";
import { getHttpClient, initHttpClient, resetHttpClient } from "./singleton";
import type { HttpClientOptions } from "./types";
import { isTokenExpired, parseApiError, removeUndefined } from "./utils";

/**
 * 실제 네트워크를 타지 않도록 axios adapter 를 목으로 교체한다. 이 방식은 인터셉터·설정을
 * 그대로 통과시키므로, 토큰 주입이나 401 처리 같은 "우리 코드" 를 실제로 검증한다.
 */

interface MockCall {
  url?: string;
  authorization?: unknown;
  contentType?: unknown;
  params?: unknown;
}

function makeClient(options?: Partial<HttpClientOptions>) {
  const calls: MockCall[] = [];
  const client = createHttpClient({
    baseURL: "/api",
    unwrap: (data) => (data as { body: unknown }).body,
    ...options
  });

  const adapter: AxiosAdapter = async (config) => {
    calls.push({
      url: config.url,
      authorization: config.headers?.Authorization,
      contentType: config.headers?.["Content-Type"],
      params: config.params
    });

    if (config.url === "/boom") {
      throw Object.assign(new Error("Request failed with status code 401"), {
        isAxiosError: true,
        response: { status: 401, data: { message: "unauthorized" }, statusText: "Unauthorized", headers: {}, config }
      });
    }

    // 응답에 토큰이 실려 오는 자리. 로그인 응답이 정확히 이 모양이다
    if (config.url === "/session") {
      return { data: { accessToken: "eyJhbGciOi", user: { id: 7 } }, status: 200, statusText: "OK", headers: {}, config };
    }

    // 오류 응답에 민감한 값이 실려 오는 자리 — 서버가 받은 요청을 되돌려 주는 422 같은 것
    if (config.url?.startsWith("/leaky-error")) {
      throw Object.assign(new Error("Request failed with status code 422"), {
        isAxiosError: true,
        config,
        response: { status: 422, data: { message: "invalid", echo: { password: "pw-in-error" }, accessToken: "tok-in-error" }, statusText: "Unprocessable", headers: {}, config }
      });
    }

    if (config.url === "/nested") {
      return { data: { user: { profile: { accessToken: "deep-token" } }, items: [{ refreshToken: "arr-token", id: 1 }] }, status: 200, statusText: "OK", headers: {}, config };
    }

    if (config.url === "/binary") {
      return { data: new Uint8Array([1, 2, 3]).buffer, status: 200, statusText: "OK", headers: {}, config };
    }

    return { data: { body: { id: 7, name: "kim" } }, status: 200, statusText: "OK", headers: {}, config };
  };

  client.instance.defaults.adapter = adapter;
  return { client, calls };
}

afterEach(() => {
  resetHttpClient();
  vi.restoreAllMocks();
});

describe("createHttpClient", () => {
  it("baseURL 없이 만들면 즉시 던진다", () => {
    expect(() => createHttpClient({ baseURL: "" })).toThrow(/baseURL is required/);
  });

  it("unwrap 으로 응답 봉투를 벗긴다", async () => {
    const { client } = makeClient();
    await expect(client.get("/users")).resolves.toEqual({ id: 7, name: "kim" });
  });

  it("unwrap 을 주지 않으면 본문을 그대로 준다", async () => {
    const { client } = makeClient({ unwrap: undefined });
    await expect(client.get("/users")).resolves.toEqual({ body: { id: 7, name: "kim" } });
  });

  it("getToken 결과를 Authorization 헤더로 넣는다", async () => {
    const { client, calls } = makeClient({ getToken: () => "tok-123" });
    await client.get("/users");
    expect(calls[0].authorization).toBe("Bearer tok-123");
  });

  it("getToken 이 null 이면 Authorization 을 넣지 않는다", async () => {
    const { client, calls } = makeClient({ getToken: () => null });
    await client.get("/users");
    expect(calls[0].authorization).toBeUndefined();
  });

  it("401 이면 onUnauthorized 를 부른다", async () => {
    const onUnauthorized = vi.fn();
    const { client } = makeClient({ onUnauthorized });
    await expect(client.get("/boom")).rejects.toBeDefined();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("401 이 아니면 onUnauthorized 를 부르지 않는다", async () => {
    const onUnauthorized = vi.fn();
    const { client } = makeClient({ onUnauthorized });
    await client.get("/users");
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("delete 는 params 와 body 를 분리해 보낸다", async () => {
    const { client, calls } = makeClient();
    await client.delete("/users/1", { params: { force: true } });
    expect(calls[0].params).toEqual({ force: true });
  });

  it("getText 는 unwrap 을 우회해 원본 응답을 준다", async () => {
    const { client } = makeClient();
    await expect(client.getText("/file")).resolves.toEqual({ body: { id: 7, name: "kim" } });
  });

  it("setBaseURL 이 인스턴스에 반영된다", () => {
    const { client } = makeClient();
    client.setBaseURL("/v2");
    expect(client.instance.defaults.baseURL).toBe("/v2");
  });
});

describe("기본값 — 라이브러리가 정책을 정하지 않는다", () => {
  it("withCredentials 는 axios 기본값(false)이다", () => {
    const { client } = makeClient();
    expect(client.instance.defaults.withCredentials).toBe(false);
  });

  it("withCredentials 는 명시하면 켜진다", () => {
    const { client } = makeClient({ withCredentials: true });
    expect(client.instance.defaults.withCredentials).toBe(true);
  });

  it("Content-Type 을 기본 헤더로 박아두지 않는다", () => {
    const { client } = makeClient();
    const headers = client.instance.defaults.headers as unknown as Record<string, unknown>;
    expect(headers["Content-Type"]).toBeUndefined();
  });

  /**
   * 최종 Content-Type 이 무엇이 되는지는 환경마다 다르다(axios 사정). 우리가 책임지는 것은
   * **박아둔 헤더를 FormData 일 때 비켜준다**는 것뿐이라, 거기까지만 검증한다.
   */
  it("FormData 를 보내면 명시된 Content-Type 을 비켜준다", async () => {
    const { client, calls } = makeClient({ headers: { "Content-Type": "application/json" } });
    const form = new FormData();
    form.append("file", "x");

    await client.post("/upload", form);
    expect(calls[0].contentType).not.toBe("application/json");
  });

  it("FormData 가 아니면 명시한 Content-Type 을 그대로 쓴다", async () => {
    const { client, calls } = makeClient({ headers: { "Content-Type": "application/json" } });

    await client.post("/users", { name: "kim" });
    expect(calls[0].contentType).toBe("application/json");
  });
});

describe("getBlob — Node 어댑터", () => {
  it("blob 을 모르는 환경에서도 Blob 을 돌려준다", async () => {
    const { client } = makeClient();
    const blob = await client.getBlob("/binary");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(3);
  });
});

describe("로깅 훅", () => {
  it("onRequest / onResponse 를 부르고 durationMs 를 준다", async () => {
    const onRequest = vi.fn();
    const onResponse = vi.fn();
    const { client } = makeClient({ onRequest, onResponse });

    await client.get("/users", { page: 1 });

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest.mock.calls[0][0]).toMatchObject({ method: "GET", url: "/users", params: { page: 1 } });

    expect(onResponse).toHaveBeenCalledTimes(1);
    expect(onResponse.mock.calls[0][0]).toMatchObject({ status: 200, method: "GET" });
    expect(typeof onResponse.mock.calls[0][0].durationMs).toBe("number");
  });

  it("훅에 넘기기 전에 민감한 필드를 가린다", async () => {
    const onRequest = vi.fn();
    const { client } = makeClient({ onRequest });

    await client.post("/login", { id: "kim", password: "secret" });

    expect(onRequest.mock.calls[0][0].data).toEqual({ id: "kim", password: "******" });
  });

  it("maskFields 로 가릴 필드를 바꿀 수 있다", async () => {
    const onRequest = vi.fn();
    const { client } = makeClient({ onRequest, maskFields: ["id"] });

    await client.post("/login", { id: "kim", password: "secret" });

    expect(onRequest.mock.calls[0][0].data).toEqual({ id: "******", password: "secret" });
  });

  /**
   * **응답도 가려야 한다.** 요청만 가리면 반쪽이다 — 토큰은 요청이 아니라 **응답**에
   * 실려 온다. 주입된 로거가 값을 외부로 보낼 수 있으므로 훅에 넘기기 전에 가린다.
   */
  it("응답 로그의 토큰도 가린다", async () => {
    const onResponse = vi.fn();
    const { client } = makeClient({ onResponse, unwrap: undefined });

    await client.get("/session");

    expect(onResponse.mock.calls[0][0].data).toEqual({ accessToken: "******", user: { id: 7 } });
  });

  it("응답에서도 maskFields 를 따른다", async () => {
    const onResponse = vi.fn();
    const { client } = makeClient({ onResponse, unwrap: undefined, maskFields: ["user"] });

    await client.get("/session");

    expect(onResponse.mock.calls[0][0].data).toEqual({ accessToken: "eyJhbGciOi", user: "******" });
  });

  /** 로그로 나가는 글자를 모두 모은다. 이 안에 심어 둔 값이 하나라도 보이면 샌 것이다 */
  const printed = (...spies: { mock: { calls: unknown[][] } }[]) =>
    spies
      .flatMap((spy) => spy.mock.calls.flat())
      .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
      .join("\n");

  it("debug 오류 로그는 응답 본문의 민감한 값을 가린다", async () => {
    const group = vi.spyOn(console, "group").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const { client } = makeClient({ debug: true });
    await expect(client.get("/leaky-error")).rejects.toBeDefined();

    const out = printed(group, error);
    expect(out).toContain("[ERR] 422");
    expect(out).not.toContain("pw-in-error");
    expect(out).not.toContain("tok-in-error");
    expect(out).toContain("invalid");
  });

  it("로그의 URL 은 쿼리의 민감한 값을 가린다 — 요청 · 응답 · 오류 모두", async () => {
    const onRequest = vi.fn();
    const onResponse = vi.fn();
    const group = vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { client } = makeClient({ onRequest, onResponse, debug: true });
    await client.get("/users?token=url-secret&page=2");
    await expect(client.get("/leaky-error?accessToken=url-secret-2")).rejects.toBeDefined();

    expect(onRequest.mock.calls[0][0].url).toBe("/users?token=******&page=2");
    expect(onResponse.mock.calls[0][0].url).toBe("/users?token=******&page=2");
    expect(printed(group)).not.toContain("url-secret-2");
  });

  it("중첩된 객체와 배열 안까지 가린다", async () => {
    const onRequest = vi.fn();
    const onResponse = vi.fn();
    const { client } = makeClient({ onRequest, onResponse, unwrap: undefined });

    await client.post("/signup", { user: { name: "kim", password: "nested-pw" }, devices: [{ token: "device-token" }] });
    await client.get("/nested");

    expect(onRequest.mock.calls[0][0].data).toEqual({ user: { name: "kim", password: "******" }, devices: [{ token: "******" }] });
    const nested = onResponse.mock.calls.map((call) => call[0]).find((log: { url: string }) => log.url === "/nested");
    expect(nested.data).toEqual({ user: { profile: { accessToken: "******" } }, items: [{ refreshToken: "******", id: 1 }] });
  });

  it("JSON 문자열 본문도 가린다", async () => {
    const onRequest = vi.fn();
    const { client } = makeClient({ onRequest });

    await client.post("/raw", JSON.stringify({ password: "string-pw", id: 1 }));

    expect(JSON.stringify(onRequest.mock.calls[0][0].data)).not.toContain("string-pw");
  });

  it("원본은 건드리지 않는다 — 서버로는 원래 값이 나가고, onError 는 원래 오류를 받는다", async () => {
    const onRequest = vi.fn();
    const onError = vi.fn();
    const sent: unknown[] = [];
    const { client } = makeClient({ onRequest, onError });
    const adapter = client.instance.defaults.adapter as AxiosAdapter;
    client.instance.defaults.adapter = (config) => {
      if (typeof config.data === "string") sent.push(JSON.parse(config.data));
      return adapter(config);
    };

    const body = { user: { password: "keep-me" } };
    await client.post("/signup", body);
    await expect(client.get("/leaky-error")).rejects.toBeDefined();

    expect(body.user.password).toBe("keep-me");
    expect(sent[0]).toEqual({ user: { password: "keep-me" } });
    expect((onError.mock.calls[0][0] as { response: { data: { accessToken: string } } }).response.data.accessToken).toBe("tok-in-error");
  });

  /** 순환 본문은 axios 가 설정을 합칠 때 먼저 멈춘다. 순환 값이 로거에 닿는 곳은 응답(직접 만든 adapter 등)이다 */
  it("순환 참조가 있어도 로그가 멈추지 않는다", async () => {
    const onResponse = vi.fn();
    const { client } = makeClient({ onResponse, unwrap: undefined });
    const looped: Record<string, unknown> = { password: "loop-pw", shared: { id: 1 } };
    looped.self = looped;
    looped.again = looped.shared;
    client.instance.defaults.adapter = async (config) => ({ data: looped, status: 200, statusText: "OK", headers: {}, config });

    await client.get("/loop");

    expect(onResponse.mock.calls[0][0].data).toEqual({ password: "******", shared: { id: 1 }, self: "[Circular]", again: { id: 1 } });
  });

  it("debug 없이 훅도 없으면 콘솔에 아무것도 찍지 않는다", async () => {
    const group = vi.spyOn(console, "group").mockImplementation(() => {});
    const collapsed = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const { client } = makeClient();
    await client.get("/users");
    await expect(client.get("/boom")).rejects.toBeDefined();

    expect(group).not.toHaveBeenCalled();
    expect(collapsed).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("debug 는 훅을 안 준 자리에만 기본 콘솔 로거를 붙인다", async () => {
    const group = vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

    const onRequest = vi.fn();
    const { client } = makeClient({ debug: true, onRequest });
    await client.get("/users");

    // 요청은 주입된 훅이 가져가고, 응답만 기본 로거가 찍는다.
    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(group).toHaveBeenCalledTimes(1);
    expect(String(group.mock.calls[0][0])).toContain("[RES]");
  });
});

describe("singleton", () => {
  it("초기화 전 getHttpClient 는 명시적으로 던진다", () => {
    expect(() => getHttpClient()).toThrow();
  });

  it("initHttpClient 후에는 같은 인스턴스를 돌려준다", () => {
    const created = initHttpClient({ baseURL: "/api" });
    expect(getHttpClient()).toBe(created);
  });

  it("다시 초기화하면 새 클라이언트로 교체된다 — 마지막 호출이 이긴다", () => {
    const first = initHttpClient({ baseURL: "/api" });
    const second = initHttpClient({ baseURL: "/v2", withCredentials: true });

    expect(second).not.toBe(first);
    expect(getHttpClient()).toBe(second);
    expect(second.instance.defaults.withCredentials).toBe(true);
  });

  it("resetHttpClient 후에는 다시 던진다", () => {
    initHttpClient({ baseURL: "/api" });
    resetHttpClient();
    expect(() => getHttpClient()).toThrow();
  });
});

describe("utils", () => {
  /**
   * ⚠ 이름과 달리 **공백 문자열도 지운다.** query string 에 빈 파라미터가 붙는 것을 막는
   * 것이 목적이라 의도된 동작이다. 이름이 동작보다 좁게 읽히는 문제는 개선 후보로 남아 있다.
   */
  it("removeUndefined — undefined 와 공백 문자열을 지우고, null·0·false 는 남긴다", () => {
    expect(removeUndefined({ a: 1, b: undefined, c: null, d: "", e: "   ", f: 0, g: false })).toEqual({
      a: 1,
      c: null,
      f: 0,
      g: false
    });
  });

  it("removeUndefined 는 인자가 없으면 빈 객체", () => {
    expect(removeUndefined()).toEqual({});
  });

  it("isTokenExpired — 과거면 true, 미래면 false, undefined 면 true", () => {
    expect(isTokenExpired(Date.now() - 1000)).toBe(true);
    expect(isTokenExpired(Date.now() + 60_000)).toBe(false);
    expect(isTokenExpired(undefined)).toBe(true);
  });

  it("parseApiError 는 어떤 입력이든 message 를 가진 객체로 정규화한다", () => {
    expect(typeof parseApiError(new Error("plain")).message).toBe("string");
    expect(typeof parseApiError("문자열").message).toBe("string");
    expect(typeof parseApiError(undefined).message).toBe("string");
  });
});
