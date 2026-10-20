import { describe, expect, it } from "vitest";
import { dedupe, exclude, mask, maskIfPhone, normalize, parseMobile, validateMany } from "./phone-kr";

describe("normalize", () => {
  it.each([
    ["010-1234-5678", "01012345678"],
    ["+82 10 1234 5678", "01012345678"],
    ["82-10-1234-5678", "01012345678"],
    ["82-010-1234-5678", "01012345678"],
    ["1012345678", "01012345678"],
    ["12345678", "01012345678"],
    ["1234567", "0101234567"],
    ["02-123-4567", "021234567"]
  ])("%s → %s", (input, expected) => expect(normalize(input)).toBe(expected));

  it("빈 값", () => {
    expect(normalize("")).toBe("");
    expect(normalize(null)).toBe("");
  });
});

describe("parseMobile", () => {
  it("010 휴대폰이면 숫자만", () => {
    expect(parseMobile("+82 10-1234-5678")).toBe("01012345678");
  });

  it.each(["02-123-4567", "011-123-4567", "abc", "", null])("%j → null", (input) => expect(parseMobile(input)).toBeNull());
});

describe("mask", () => {
  it.each([
    ["010-1234-5678", "010****5678"],
    ["01012345678", "010****5678"],
    ["0212345678", "02****5678"],
    ["0311234567", "031***4567"]
  ])("%s → %s", (input, expected) => expect(mask(input)).toBe(expected));

  it("10~11자리가 아니면 원본", () => {
    expect(mask("12345")).toBe("12345");
    expect(mask("")).toBe("");
  });
});

describe("maskIfPhone", () => {
  it("전화번호처럼 보일 때만 가린다", () => {
    expect(maskIfPhone(" 010-1234-5678 ")).toBe("010****5678");
    expect(maskIfPhone("kim")).toBe("kim");
    expect(maskIfPhone("12345")).toBe("12345");
  });
});

describe("대량 처리", () => {
  it("validateMany — valid 는 정규화한 값, invalid 는 원본", async () => {
    expect(await validateMany(["010-1234-5678", "nope", "1012345678"])).toEqual({ valid: ["01012345678", "01012345678"], invalid: ["nope"] });
    expect(await validateMany(null)).toEqual({ valid: [], invalid: [] });
  });

  it("dedupe — 처음 것은 uniques, 두 번째부터 duplicates, 빈 값은 버린다", async () => {
    expect(await dedupe(["a", " a ", "b", "", "a"])).toEqual({ uniques: ["a", "b"], duplicates: ["a", "a"] });
  });

  it("exclude", async () => {
    expect(await exclude(["1", "2", "3"], ["2"])).toEqual({ remains: ["1", "3"], excluded: ["2"] });
  });

  it("1만 건을 넘어도 순서를 지킨다", async () => {
    const many = Array.from({ length: 25_000 }, (_, i) => String(i % 20_000));
    const { uniques, duplicates } = await dedupe(many);
    expect(uniques).toHaveLength(20_000);
    expect(uniques[19_999]).toBe("19999");
    expect(duplicates).toHaveLength(5_000);
  });
});
