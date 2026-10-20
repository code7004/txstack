import { describe, expect, expectTypeOf, it } from "vitest";
import { bytes, compact, format, isNumeric, percent, toNumber } from "./num";

/**
 * 숫자 모양을 보는 테스트는 **로케일을 적는다.** CI · Node 의 기본 로케일은 보통 `en-US` 라
 * 적지 않으면 개발 PC 와 결과가 달라진다. "기본은 환경 로케일" 은 `Intl` 과 같은지로 본다.
 */
const ko = { locale: "ko-KR" } as const;

describe("isNumeric", () => {
  it.each([123, -1.5, 0, "123", "-1.5", "1e3"])("%j → true", (value) => expect(isNumeric(value)).toBe(true));
  it.each(["12abc", "1,234", "abc", "", " ", "\t", NaN, Infinity, -Infinity, null, undefined, [], [1], {}, true])("%j → false", (value) => expect(isNumeric(value)).toBe(false));
});

describe("toNumber", () => {
  it("숫자 · 숫자 문자열은 숫자로", () => {
    expect(toNumber("123")).toBe(123);
    expect(toNumber("-1.5")).toBe(-1.5);
    expect(toNumber(5)).toBe(5);
  });

  it("바꿀 수 없으면 fallback, 없으면 undefined", () => {
    expect(toNumber("abc")).toBeUndefined();
    expect(toNumber(NaN)).toBeUndefined();
    expect(toNumber(undefined)).toBeUndefined();
    expect(toNumber("abc", 0)).toBe(0);
    expect(toNumber(undefined, 7)).toBe(7);
  });

  it("null 은 0 이 아니라 fallback — Number(null) 과 다르다", () => {
    expect(toNumber(null, -1)).toBe(-1);
  });

  it("0 은 fallback 에 먹히지 않는다", () => {
    expect(toNumber("0", 9)).toBe(0);
  });

  it("fallback 을 주면 반환 타입이 number", () => {
    expectTypeOf(toNumber("1", 0)).toEqualTypeOf<number>();
    expectTypeOf(toNumber("1")).toEqualTypeOf<number | undefined>();
  });
});

describe("format", () => {
  it("자릿수 구분", () => {
    expect(format(1234567, ko)).toBe("1,234,567");
    expect(format(-1234.5, ko)).toBe("-1,234.5");
  });

  it("소수부에는 구분 기호가 들어가지 않는다 (옛 numberWithDelimiter 는 '1,234.5,678')", () => {
    expect(format(1234.5678, ko)).toBe("1,234.568");
  });

  it("숫자 문자열도 받는다", () => {
    expect(format("1234.5", ko)).toBe("1,234.5");
  });

  it("Intl 옵션을 그대로 넘긴다", () => {
    expect(format(1234.5678, { ...ko, maximumFractionDigits: 2 })).toBe("1,234.57");
    expect(format(12345, { ...ko, style: "currency", currency: "KRW" })).toBe("₩12,345");
  });

  it.each([null, undefined, NaN, "abc", "1,234"])("빈 값 %j → '0'", (value) => expect(format(value, ko)).toBe("0"));

  it("fallback 을 주면 빈 값에 그 글자", () => {
    expect(format(null, { fallback: "-" })).toBe("-");
    expect(format(undefined, { fallback: "" })).toBe("");
  });

  it("0 은 빈 값이 아니다", () => {
    expect(format(0, { fallback: "-" })).toBe("0");
  });

  it("locale 을 빼면 실행 환경의 로케일", () => {
    expect(format(1234.5)).toBe(new Intl.NumberFormat().format(1234.5));
  });
});

describe("percent", () => {
  it("비율을 받고 자릿수는 고정", () => {
    expect(percent(0.1234, 1, ko)).toBe("12.3%");
    expect(percent(0.1234, 2, ko)).toBe("12.34%");
    expect(percent(0.5, 1, ko)).toBe("50.0%");
    expect(percent(-0.031, 1, ko)).toBe("-3.1%");
    expect(percent(1.5, 1, ko)).toBe("150.0%");
  });

  it("빈 값은 0%, fallback 이 있으면 그 글자", () => {
    expect(percent(null, 1, ko)).toBe("0.0%");
    expect(percent("abc", 1, ko)).toBe("0.0%");
    expect(percent(null, 1, { fallback: "-" })).toBe("-");
  });
});

describe("compact", () => {
  it("로케일의 단위를 따른다", () => {
    expect(compact(12000, ko)).toBe("1.2만");
    expect(compact(1_000_000, ko)).toBe("100만");
    expect(compact(150_000_000, ko)).toBe("1.5억");
    expect(compact(12000, { locale: "en-US" })).toBe("12K");
  });

  it("소수는 한 자리까지, 옵션으로 덮어쓴다", () => {
    expect(compact(12345, ko)).toBe("1.2만");
    expect(compact(12345, { ...ko, maximumFractionDigits: 2 })).toBe("1.23만");
  });

  it("0 과 빈 값", () => {
    expect(compact(0, ko)).toBe("0");
    expect(compact(null, ko)).toBe("0");
  });

  it("locale 을 빼면 실행 환경의 로케일", () => {
    expect(compact(12000)).toBe(new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(12000));
  });
});

describe("bytes", () => {
  it.each([0, null, NaN, -1])("%j → '0 B'", (value) => expect(bytes(value)).toBe("0 B"));

  it("1024 기준", () => {
    expect(bytes(512)).toBe("512 B");
    expect(bytes(1024)).toBe("1 KB");
    expect(bytes(1536)).toBe("1.5 KB");
    expect(bytes(5_300_000)).toBe("5.05 MB");
    expect(bytes(5_300_000, 0)).toBe("5 MB");
  });

  it("거듭제곱 경계에서 한 단계 아래로 떨어지지 않는다", () => {
    expect(bytes(1024 ** 2)).toBe("1 MB");
    expect(bytes(1024 ** 3)).toBe("1 GB");
    expect(bytes(2 ** 40)).toBe("1 TB");
  });

  it("PB 에서 멈춘다 (옛 formatBytes 는 '1 undefined')", () => {
    expect(bytes(2 ** 50)).toBe("1 PB");
    expect(bytes(2 ** 60)).toBe("1024 PB");
  });

  it("소수 끝의 0 은 지운다", () => {
    expect(bytes(1536, 2)).toBe("1.5 KB");
  });
});
