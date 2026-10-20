import { afterEach, describe, expect, it, vi } from "vitest";
import * as cookie from "./cookie";
import * as css from "./css";
import * as file from "./file";

afterEach(() => {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
  document.head.innerHTML = "";
  vi.restoreAllMocks();
});

describe("cookie", () => {
  it.each([
    ["page", 2],
    ["dark", true],
    ["filters", ["soccer", "baseball"]],
    ["profile", { id: 1, name: "kim" }],
    ["nothing", null]
  ])("%s 의 타입이 그대로 돌아온다", (name, value) => {
    cookie.set(name, value);
    expect(cookie.get(name, "fallback" as unknown)).toEqual(value);
  });

  it("숫자처럼 보이는 문자열도 문자열로 (옛 getCookie 는 '00123' → 123)", () => {
    cookie.set("code", "00123");
    cookie.set("flag", "true");
    expect(cookie.get("code", "")).toBe("00123");
    expect(cookie.get("flag", "")).toBe("true");
  });

  it("없으면 fallback", () => {
    expect(cookie.get("missing", 7)).toBe(7);
  });

  it("JSON 이 아닌 쿠키는 글자 그대로", () => {
    document.cookie = "legacy=hello; path=/";
    expect(cookie.get("legacy", "")).toBe("hello");
  });

  it("값에 = ; 가 있어도", () => {
    cookie.set("q", "a=b; c");
    expect(cookie.get("q", "")).toBe("a=b; c");
  });

  it("remove", () => {
    cookie.set("x", 1);
    cookie.remove("x");
    expect(cookie.get("x", 0)).toBe(0);
  });
});

describe("css.inject", () => {
  const rulesOf = (id: string) => Array.from((document.getElementById(id) as HTMLStyleElement).sheet!.cssRules).map((rule) => rule.cssText);

  it("camelCase · CSS 변수 이름을 받는다", () => {
    expect(css.inject("t", ".btn", { backgroundColor: "red", "--gap": "4px" })).toBe(true);
    const [text] = rulesOf("t");
    expect(text).toContain("background-color: red");
    expect(text).toContain("--gap: 4px");
  });

  it("같은 선택자는 그 자리에서 바꾼다", () => {
    css.inject("t", ".a", { color: "red" });
    css.inject("t", ".b", { color: "red" });
    css.inject("t", ".a", { color: "blue" });
    const texts = rulesOf("t");
    expect(texts).toHaveLength(2);
    expect(texts[0]).toContain("blue");
  });

  it(".a 를 넣을 때 .ab 를 건드리지 않는다 (옛 createCSS 는 startsWith 로 지웠다)", () => {
    css.inject("t", ".ab", { color: "red" });
    css.inject("t", ".a", { color: "blue" });
    expect(rulesOf("t")).toHaveLength(2);
  });

  it("가상 선택자", () => {
    expect(css.inject("t", ".btn:hover", { color: "red" })).toBe(true);
  });

  // "브라우저가 거부하면 false" 는 여기서 못 본다 — jsdom 의 CSSOM 은 잘못된 선택자도 받아 준다

  it("remove 는 style 을 통째로 지운다", () => {
    css.inject("t", ".a", { color: "red" });
    css.remove("t");
    expect(document.getElementById("t")).toBeNull();
  });
});

describe("file", () => {
  it("readText", async () => {
    expect(await file.readText(new Blob(["안녕\nhello"]))).toBe("안녕\nhello");
  });

  it("download — 배열은 다듬어 줄로 잇는다", async () => {
    // jsdom 에는 createObjectURL 이 없다
    const created: Blob[] = [];
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      created.push(blob as Blob);
      return "blob:x";
    };
    URL.revokeObjectURL = () => {};
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    expect(file.download("n.txt", [" 010 ", "", "011"])).toBe(true);
    expect(click).toHaveBeenCalledOnce();
    expect(await file.readText(created[0]!)).toBe("010\n011");
  });

  it("download — 내용이 없으면 false", () => {
    expect(file.download("n.txt", [])).toBe(false);
    expect(file.download("n.txt", "")).toBe(false);
  });
});
