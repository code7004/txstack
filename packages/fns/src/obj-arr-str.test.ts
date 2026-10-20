import { describe, expect, it } from "vitest";
import { sortByOrder } from "./arr";
import { diffObject, undefinedToNull } from "./obj";
import { PALETTE, emailLocalPart, hasNonAscii, hasSpecialChars, hashColor, paletteColor } from "./str";

describe("diffObject", () => {
  it("next 에서 바뀐 필드만", () => {
    expect(diffObject({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual({ b: 3 });
  });

  it("prev 에 없던 필드는 바뀐 것", () => {
    expect(diffObject<{ a: number; b?: number }>({ a: 1 }, { a: 1, b: 2 })).toEqual({ b: 2 });
  });

  it("기본 비교는 Object.is — 새로 만든 배열은 다르다", () => {
    expect(diffObject({ tags: ["x"] }, { tags: ["x"] })).toEqual({ tags: ["x"] });
  });

  it("비교 함수를 넘기면 내용으로 본다", () => {
    const deep = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    expect(diffObject({ tags: ["x"] }, { tags: ["x"] }, deep)).toEqual({});
  });

  it("NaN 은 NaN 과 같다", () => {
    expect(diffObject({ a: NaN }, { a: NaN })).toEqual({});
  });
});

describe("obj.undefinedToNull", () => {
  it("undefined 만 null 로", () => {
    expect(undefinedToNull({ a: 1, b: undefined, c: null, d: 0, e: "" })).toEqual({ a: 1, b: null, c: null, d: 0, e: "" });
  });

  it("원본은 그대로", () => {
    const source = { a: undefined };
    undefinedToNull(source);
    expect(source).toEqual({ a: undefined });
  });
});

describe("arr.sortByOrder", () => {
  const rows = [{ p: "low" }, { p: "x" }, { p: "high" }, { p: "a" }, { p: "medium" }];

  it("정해 준 순서, 없는 값은 뒤에서 글자 순", () => {
    expect(sortByOrder(rows, ["high", "medium", "low"], "p").map((r) => r.p)).toEqual(["high", "medium", "low", "a", "x"]);
  });

  it("desc 는 순서를 뒤집고, 없는 값은 여전히 뒤", () => {
    expect(sortByOrder(rows, ["high", "medium", "low"], "p", "desc").map((r) => r.p)).toEqual(["low", "medium", "high", "x", "a"]);
  });

  it("값을 꺼내는 함수도 받는다", () => {
    expect(sortByOrder(rows, ["x"], (r) => r.p)[0]).toEqual({ p: "x" });
  });

  it("원본을 바꾸지 않고, 필드를 섞어 넣지 않는다", () => {
    const copy = rows.map((r) => ({ ...r }));
    const sorted = sortByOrder(rows, ["high"], "p");
    expect(rows).toEqual(copy);
    expect(Object.keys(sorted[0]!)).toEqual(["p"]);
  });
});

describe("str.hashColor", () => {
  it("같은 글자는 같은 색, #rrggbb", () => {
    expect(hashColor("kim@example.com")).toBe(hashColor("kim@example.com"));
    expect(hashColor("kim@example.com")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("옛 계산과 같은 결과 — 숫자로만 된 글자 코드", () => {
    // "1" = 0x31 → 3+1=4, "2" = 0x32 → 5 … 옛 stringToHex 도 같은 값을 냈다
    expect(hashColor("123456")).toBe("#456789");
  });

  it("글자 코드에 a~f 가 있어도 NaN 이 섞이지 않는다", () => {
    expect(hashColor("kkkkkk")).toBe("#111111"); // k = 0x6b → 6+11=17 → "11"
  });

  it("짧으면 0 으로 채우고, 빈 값은 기본색", () => {
    expect(hashColor("1")).toBe("#400000");
    expect(hashColor("")).toBe("#407adf");
  });
});

describe("str.paletteColor", () => {
  it("넘치면 처음으로 돈다", () => {
    expect(paletteColor(0)).toBe(PALETTE[0]);
    expect(paletteColor(3)).toBe("#3B82F6");
    expect(paletteColor(15)).toBe(PALETTE[0]);
    expect(paletteColor(-1)).toBe(PALETTE[1]);
  });

  it("소수 · NaN 에도 색을 준다", () => {
    expect(paletteColor(2.7)).toBe(PALETTE[2]);
    expect(paletteColor(NaN)).toBe(PALETTE[0]);
  });
});

describe("str 판정", () => {
  it("emailLocalPart", () => {
    expect(emailLocalPart("kim@example.com")).toBe("kim");
    expect(emailLocalPart("no-at")).toBe("no-at");
  });

  it("hasSpecialChars — 밑줄 · 공백은 특수문자가 아니다", () => {
    expect(hasSpecialChars("abc@123")).toBe(true);
    expect(hasSpecialChars("a[b]")).toBe(true);
    expect(hasSpecialChars("hello_world 1")).toBe(false);
  });

  it("hasNonAscii", () => {
    expect(hasNonAscii("password1!")).toBe(false);
    expect(hasNonAscii("비밀번호")).toBe(true);
    expect(hasNonAscii("pass🙂")).toBe(true);
  });
});
