import type { AxiosAdapter } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpClient } from "./client";
import { getAxios, getHttpClient, initHttpClient, resetHttpClient } from "./singleton";
import type { HttpClientOptions } from "./types";
import { isTokenExpired, parseApiError, removeUndefined } from "./utils";

/**
 * 1차 검증의 일회성 스모크(§2-4)를 회귀 테스트로 옮긴 것.
 *
 * 실제 네트워크를 타지 않도록 axios adapter 를 목으로 교체한다. 이 방식은 인터셉터·설정을
 * 그대로 통과시키므로, 토큰 주입이나 401 처리 같은 "우리 코드" 를 실제로 검증한다.
 */

interface MockCall {
  url?: string;
  authorization?: unknown;
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
    calls.push({ url: config.url, authorization: config.headers?.Authorization, params: config.params });

    if (config.url === "/boom") {
      throw Object.assign(new Error("Request failed with status code 401"), {
        isAxiosError: true,
        response: { status: 401, data: { message: "unauthorized" }, statusText: "Unauthorized", headers: {}, config }
      });
    }

    return { data: { body: { id: 7, name: "kim" } }, status: 200, statusText: "OK", headers: {}, config };
  };

  client.instance.defaults.adapter = adapter;
  return { client, calls };
}

afterEach(() => resetHttpClient());

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

  it("del 은 params 와 body 를 분리해 보낸다", async () => {
    const { client, calls } = makeClient();
    await client.del("/users/1", { params: { force: true } });
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

describe("singleton", () => {
  it("초기화 전 getHttpClient 는 명시적으로 던진다", () => {
    expect(() => getHttpClient()).toThrow();
  });

  it("initHttpClient 후에는 같은 인스턴스를 돌려준다", () => {
    const created = initHttpClient({ baseURL: "/api" });
    expect(getHttpClient()).toBe(created);
    expect(getAxios()).toBe(created.instance);
  });

  it("resetHttpClient 후에는 다시 던진다", () => {
    initHttpClient({ baseURL: "/api" });
    resetHttpClient();
    expect(() => getHttpClient()).toThrow();
  });
});

describe("utils", () => {
  /**
   * ⚠ 이름과 달리 **공백 문자열도 지운다.** JSDoc 에 명시된 의도된 동작이다
   * (query string 에 빈 파라미터가 붙는 것을 막는 것이 목적).
   * 이름이 동작보다 좁게 읽히는 문제는 001-2 의 개선 후보로 올려 뒀다.
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
