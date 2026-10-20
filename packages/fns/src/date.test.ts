import { describe, expect, it } from "vitest";
import { dayRange, elapsed, isoWeek, lastDays, localTimeZone, parseTimestamps, parseYmd, splitSeconds } from "./date";

const now = new Date(2025, 5, 18, 15, 30); // 2025-06-18 15:30 (로컬)

describe("dayRange · lastDays", () => {
  it("from 일째 0시부터 to 일째 23:59:59.999 까지", () => {
    const [start, end] = dayRange(-1, -1, now);
    expect(start).toEqual(new Date(2025, 5, 17, 0, 0, 0, 0));
    expect(end).toEqual(new Date(2025, 5, 17, 23, 59, 59, 999));
  });

  it("lastDays 는 오늘을 포함한다 — 옛 numberToStartEndDate(-14, 0) 과 같다", () => {
    const [start, end] = lastDays(14, now);
    expect(start).toEqual(new Date(2025, 5, 5));
    expect(end).toEqual(new Date(2025, 5, 18, 23, 59, 59, 999));
  });

  it("lastDays(1) 은 오늘 하루", () => {
    expect(lastDays(1, now)).toEqual(dayRange(0, 0, now));
  });

  it("달을 넘어간다", () => {
    expect(lastDays(30, new Date(2025, 2, 5))[0]).toEqual(new Date(2025, 1, 4));
  });
});

describe("localTimeZone", () => {
  it("IANA 이름", () => {
    expect(localTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });
});

describe("parseYmd", () => {
  it("그날 0시", () => {
    expect(parseYmd("20251231")).toEqual(new Date(2025, 11, 31));
  });

  it.each(["2025123", "2025-12-31", "abcdefgh", "20250230", "20251301", ""])("%j → null", (value) => expect(parseYmd(value)).toBeNull());
});

describe("isoWeek", () => {
  it("12월 말이 다음 해 1주차일 수 있다", () => {
    expect(isoWeek("20251231")).toEqual({ year: 2026, week: 1, key: "2026-W01" });
  });

  it("1월 초가 전년도 마지막 주일 수 있다", () => {
    expect(isoWeek("20210101")).toEqual({ year: 2020, week: 53, key: "2020-W53" });
  });

  it("Date 도 받는다", () => {
    expect(isoWeek(new Date(2025, 5, 18))?.key).toBe("2025-W25");
  });

  it("잘못된 값이면 null", () => {
    expect(isoWeek("nope")).toBeNull();
    expect(isoWeek(new Date(NaN))).toBeNull();
  });
});

describe("parseTimestamps", () => {
  it("밀리초 두 개 → [시작, 끝]", () => {
    expect(parseTimestamps("1716300000000,1718700000000")).toEqual([new Date(1716300000000), new Date(1718700000000)]);
  });

  it("URL 인코딩된 채로 넘겨도 된다", () => {
    expect(parseTimestamps("1716300000000%2C1718700000000")).toEqual([new Date(1716300000000), new Date(1718700000000)]);
  });

  it.each([null, undefined, "", "1716300000000", "a,b", "1,2,3", ",1"])("%j → null", (value) => expect(parseTimestamps(value)).toBeNull());
});

describe("splitSeconds", () => {
  it("일 · 시 · 분 · 초", () => {
    expect(splitSeconds(90061)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1, formatted: "1d 01:01:01" });
  });

  it("하루 미만이면 시계만", () => {
    expect(splitSeconds(3723).formatted).toBe("01:02:03");
  });

  it("dayLabel · pad", () => {
    expect(splitSeconds(90061, { dayLabel: "일 " }).formatted).toBe("1일 01:01:01");
    expect(splitSeconds(61, { pad: false }).formatted).toBe("0:1:1");
  });

  it("소수는 버리고 음수 · NaN 은 0", () => {
    expect(splitSeconds(59.9).seconds).toBe(59);
    expect(splitSeconds(-5).formatted).toBe("00:00:00");
    expect(splitSeconds(NaN).formatted).toBe("00:00:00");
  });
});

describe("elapsed", () => {
  it("한 시간 미만은 두 단위", () => {
    expect(elapsed(6.5, { decimals: 1 })).toBe("6.5s");
    expect(elapsed(90)).toBe("1m 30s");
    expect(elapsed(120)).toBe("2m");
  });

  it("하루 미만은 시 · 분", () => {
    expect(elapsed(3665)).toBe("1h 1m");
    expect(elapsed(7200)).toBe("2h");
  });

  it("그 위는 한 단위 — 달은 30일, 해는 12달", () => {
    expect(elapsed(86400 * 3)).toBe("3d");
    expect(elapsed(86400 * 45)).toBe("1mo");
    expect(elapsed(86400 * 400)).toBe("1y");
  });

  it("음수는 just_now, NaN 은 빈 글자", () => {
    expect(elapsed(-1)).toBe("just now");
    expect(elapsed(NaN)).toBe("");
  });

  it("t 로 단위 글자를 바꾼다 — i18n 의 키를 그대로 받는다", () => {
    const ko: Record<string, string> = { minute: "분", second: "초", just_now: "방금" };
    const t = (key: string) => ko[key] ?? key;
    expect(elapsed(90, { t })).toBe("1분 30초");
    expect(elapsed(-1, { t })).toBe("방금");
  });
});
