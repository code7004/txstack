/**
 * 랜덤 값 · 짧은 ID. 주로 목업 데이터를 만들 때 쓴다.
 *
 * ```ts
 * import { randomInt, randomPick } from "@txstack/fns";
 * randomInt(0, 10);
 * randomPick(["a", "b", "c"], 0.9); // 뒤쪽이 더 자주 나온다
 * ```
 *
 * **암호용이 아니다.** `Math.random` 을 쓴다. 토큰 · 비밀번호에는 `crypto.getRandomValues` 를 쓴다.
 *
 * `bias` 와 `weight` 로 결과를 한쪽으로 쏠리게 할 수 있다 — `_.random` 에 없는 기능이다.
 * - `bias` — 쏠릴 자리. 0 이면 `min` 쪽, 1 이면 `max` 쪽, 0.5 면 가운데
 * - `weight` — 쏠리는 정도. 0 이면 고르게, 1 이면 늘 `bias` 자리 (기본 0.8)
 */

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** `min` 이상 `max` 미만의 실수 */
export function randomFloat(min: number, max: number, bias?: number, weight: number = 0.8): number {
  const t = Math.random();
  if (bias === undefined) return min + (max - min) * t;

  const skewed = t * (1 - clamp01(weight)) + clamp01(bias) * clamp01(weight);
  return min + (max - min) * skewed;
}

/** `min` 이상 `max` 미만의 정수 */
export function randomInt(min: number, max: number, bias?: number, weight?: number): number {
  return Math.floor(randomFloat(min, max, bias, weight));
}

/** `start` 이상 `end` 미만의 날짜 */
export function randomDate(start: Date, end: Date, bias?: number, weight?: number): Date {
  return new Date(randomInt(start.getTime(), end.getTime(), bias, weight));
}

/** 배열에서 하나. 빈 배열이면 `undefined` */
export function randomPick<T>(items: readonly T[], bias?: number, weight?: number): T | undefined {
  if (items.length === 0) return undefined;
  return items[randomInt(0, items.length, bias, weight)];
}

/** `"x.x.x.x"` 꼴의 IPv4 주소 */
export function randomIp(): string {
  return Array.from({ length: 4 }, () => randomInt(0, 256)).join(".");
}

let counter = 0;

/**
 * 짧은 ID — 현재 시각(36진수) + 랜덤 네 글자 + 호출 순번.
 * 같은 밀리초에 여러 번 불러도 순번이 달라 겹치지 않는다. 화면 안에서 쓰는 키 용도다.
 *
 * @example
 * shortId() // "mgx3k2a1f9qz1"
 */
export function shortId(): string {
  counter = (counter + 1) % 10000;
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + counter.toString(36);
}
