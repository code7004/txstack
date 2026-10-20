import { afterEach, describe, expect, it, vi } from "vitest";
import { date, float, int, ip, pick, shortId } from "./rand";

const fixRandom = (value: number) => vi.spyOn(Math, "random").mockReturnValue(value);

afterEach(() => vi.restoreAllMocks());

describe("float · int", () => {
  it("min 이상 max 미만", () => {
    for (let i = 0; i < 200; i++) {
      const n = float(5, 10);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThan(10);
      expect(Number.isInteger(int(5, 10))).toBe(true);
    }
  });

  it("bias 가 없으면 Math.random 을 그대로 늘린다", () => {
    fixRandom(0.5);
    expect(float(0, 10)).toBe(5);
  });

  it("weight 1 이면 늘 bias 자리", () => {
    fixRandom(0.1);
    expect(float(0, 100, 0.9, 1)).toBe(90);
  });

  it("weight 0 이면 bias 를 무시한다", () => {
    fixRandom(0.1);
    expect(float(0, 100, 0.9, 0)).toBe(10);
  });

  it("범위 밖의 bias · weight 는 0~1 로 자른다", () => {
    fixRandom(0);
    expect(float(0, 100, 5, 5)).toBe(100);
    expect(float(0, 100, -1, 1)).toBe(0);
  });
});

describe("date", () => {
  it("범위 안의 날짜", () => {
    const start = new Date(2025, 0, 1);
    const end = new Date(2025, 11, 31);
    const d = date(start, end);
    expect(d.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(d.getTime()).toBeLessThan(end.getTime());
  });
});

describe("pick", () => {
  it("배열의 원소 하나", () => {
    expect(["a", "b", "c"]).toContain(pick(["a", "b", "c"]));
  });

  it("빈 배열이면 undefined", () => {
    expect(pick([])).toBeUndefined();
  });

  it("bias 1 · weight 1 이면 마지막 원소 쪽", () => {
    fixRandom(0);
    expect(pick(["a", "b", "c"], 0.99, 1)).toBe("c");
  });
});

describe("ip", () => {
  it("0~255 네 개", () => {
    const parts = ip().split(".").map(Number);
    expect(parts).toHaveLength(4);
    parts.forEach((part) => expect(part >= 0 && part <= 255).toBe(true));
  });
});

describe("shortId", () => {
  it("같은 밀리초에 여러 번 불러도 겹치지 않는다", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    fixRandom(0.123456);
    const ids = new Set(Array.from({ length: 100 }, () => shortId()));
    expect(ids.size).toBe(100);
  });
});
