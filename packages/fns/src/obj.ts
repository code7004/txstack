/**
 * 객체.
 *
 * ```ts
 * import { diffObject } from "@txstack/fns";
 * diffObject(saved, edited); // 바뀐 필드만
 * ```
 *
 * lodash 에 있는 것(`pick` · `omit` · `isEqual` …)은 두지 않는다. 같은 일을 하는 함수가 두 벌이면
 * 어느 쪽을 써야 할지 헷갈린다.
 */

/**
 * `next` 에서 `prev` 와 다른 필드만 모은다. 수정 화면에서 바뀐 값만 서버에 보낼 때 쓴다.
 *
 * 비교는 기본이 `Object.is` 라 배열 · 객체 필드는 **새로 만들면 다르다고 본다.**
 * 내용으로 비교하려면 깊은 비교 함수를 넘긴다 — lodash 를 쓰면 `_.isEqual`.
 *
 * @example
 * diff({ a: 1, b: 2 }, { a: 1, b: 3 })                  // { b: 3 }
 * diff({ tags: ["x"] }, { tags: ["x"] }, _.isEqual)     // {}
 */
export function diffObject<T extends object>(prev: Partial<T>, next: T, isEqual: (a: unknown, b: unknown) => boolean = Object.is): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(next) as Array<keyof T>) {
    if (!isEqual(prev[key], next[key])) result[key] = next[key];
  }
  return result;
}

/** `undefined` 인 필드를 `null` 로 */
export type UndefinedToNull<T> = { [K in keyof T]-?: undefined extends T[K] ? Exclude<T[K], undefined> | null : T[K] };

/**
 * `undefined` 인 필드를 `null` 로 바꾼 새 객체. JSON 으로 보낼 때 필드가 빠지지 않게 한다.
 *
 * @example
 * undefinedToNull({ a: 1, b: undefined }) // { a: 1, b: null }
 */
export function undefinedToNull<T extends object>(value: T): UndefinedToNull<T> {
  const result: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(value)) result[key] = field === undefined ? null : field;
  return result as UndefinedToNull<T>;
}
