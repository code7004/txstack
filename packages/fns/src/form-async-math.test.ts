import { describe, expect, it, vi } from "vitest";
import { sleep, withLoading } from "./async";
import { check, checkEmpty, checkPattern } from "./form";
import { lerp, lerpVector, rotate, toDegrees, toRadians } from "./math";

describe("form.checkEmpty", () => {
  it("공백만 있는 문자열 · 빈 배열 · null 은 빈 것", () => {
    expect(checkEmpty({ name: "  " })).toEqual({ name: "name is empty" });
    expect(checkEmpty({ tags: [] })).toEqual({ tags: "tags is empty" });
    expect(checkEmpty({ memo: null })).toEqual({ memo: "memo is empty" });
  });

  it("0 · false 는 값이 있는 것", () => {
    expect(checkEmpty({ age: 0, agree: false })).toBeNull();
  });

  it("첫 번째로 걸린 필드 하나만", () => {
    expect(checkEmpty({ a: "", b: "" })).toEqual({ a: "a is empty" });
  });

  it("optional · message", () => {
    expect(checkEmpty({ name: "", memo: "" }, { optional: ["name", "memo"] })).toBeNull();
    expect(checkEmpty({ name: "" }, { message: (key) => `${key}을(를) 입력하세요` })).toEqual({ name: "name을(를) 입력하세요" });
  });
});

describe("form.checkPattern", () => {
  const rules = { phone: { pattern: /^010-\d{4}-\d{4}$/, message: "전화번호 형식" } };

  it("틀린 필드의 메시지", () => {
    expect(checkPattern({ phone: "010-12" }, rules)).toEqual({ phone: "전화번호 형식" });
    expect(checkPattern({ phone: "010-1234-5678" }, rules)).toBeNull();
  });

  it("빈 필드와 규칙이 없는 필드는 건너뛴다", () => {
    expect(checkPattern({ phone: "", name: "?" }, rules)).toBeNull();
  });

  it("g 플래그 정규식도 매번 처음부터", () => {
    const g = { code: { pattern: /^\d+$/g, message: "숫자만" } };
    expect(checkPattern({ code: "123" }, g)).toBeNull();
    expect(checkPattern({ code: "123" }, g)).toBeNull();
  });
});

describe("form.check", () => {
  it("빈 칸이 먼저, 그다음 형식", () => {
    const rules = { email: { pattern: /@/, message: "이메일 형식" } };
    expect(check({ name: "", email: "x" }, rules)).toEqual({ name: "name is empty" });
    expect(check({ name: "kim", email: "x" }, rules)).toEqual({ email: "이메일 형식" });
    expect(check({ name: "kim", email: "a@b" }, rules)).toBeNull();
  });
});

describe("async.sleep", () => {
  it("ms 뒤에 풀린다", async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    void sleep(500).then(done);
    await vi.advanceTimersByTimeAsync(499);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("async.withLoading", () => {
  it("성공 — true 로 시작해 false 로 끝나고 값을 돌려준다", async () => {
    const onLoading = vi.fn();
    const run = withLoading(async (a: number, b: number) => a + b, { onLoading });
    expect(await run(1, 2)).toBe(3);
    expect(onLoading.mock.calls).toEqual([[true], [false]]);
  });

  it("onError 가 있으면 오류를 거기서 끝낸다", async () => {
    const onLoading = vi.fn();
    const onError = vi.fn();
    const run = withLoading(
      async () => {
        throw new Error("boom");
      },
      { onLoading, onError }
    );
    await expect(run()).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledWith(new Error("boom"));
    expect(onLoading).toHaveBeenLastCalledWith(false);
  });

  it("onError 가 없으면 다시 던진다 — 알림은 패키지가 정하지 않는다", async () => {
    const onLoading = vi.fn();
    const run = withLoading(
      async () => {
        throw new Error("boom");
      },
      { onLoading }
    );
    await expect(run()).rejects.toThrow("boom");
    expect(onLoading).toHaveBeenLastCalledWith(false);
  });
});

describe("math", () => {
  it("lerp", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 1.5)).toBe(15);
    expect(lerpVector({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 });
  });

  it("각도 변환", () => {
    expect(toRadians(180)).toBeCloseTo(Math.PI);
    expect(toDegrees(Math.PI / 2)).toBeCloseTo(90);
  });

  it("rotate — 원점 기준 90도", () => {
    const p = rotate({ x: 10, y: 0 }, { x: 0, y: 0 }, 90);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(10);
  });

  it("rotate — 다른 축", () => {
    const p = rotate({ x: 2, y: 1 }, { x: 1, y: 1 }, 180);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(1);
  });
});
