import { useEffect, useRef } from "react";

/** 순환 참조 없는 값 기준의 깊은 비교. lodash `isEqual` 을 끌어오지 않기 위한 최소 구현. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }

  const aKeys = Object.keys(a as Record<string, unknown>);
  const bKeys = Object.keys(b as Record<string, unknown>);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

function diffOf<T extends Record<string, unknown>>(prev: Partial<T>, next: T): Partial<T> {
  const diff: Partial<T> = {};

  for (const key of Object.keys(next) as (keyof T)[]) {
    if (!deepEqual(prev[key], next[key])) diff[key] = next[key];
  }

  return diff;
}

/**
 * 객체가 바뀌었을 때 **바뀐 필드만** 콜백으로 넘긴다.
 *
 * 필터/쿼리 객체를 상위에서 내려받아, 실제로 달라진 항목에 대해서만 재조회하는 용도다.
 * 첫 렌더에서는 호출되지 않는다 (초기값은 "변경"으로 보지 않는다).
 *
 * 콜백은 최신 참조를 쓰므로 인라인 화살표 함수를 그대로 넘겨도 된다.
 *
 * @example
 * useObjectChanged(filters, (diff) => {
 *   if ("keyword" in diff) refetch();
 * });
 */
export function useObjectChanged<T extends Record<string, unknown>>(value: T, callback?: (diff: Partial<T>) => void): void {
  const mounted = useRef(false);
  const prev = useRef<Partial<T>>({});

  // 인라인 콜백이 매 렌더 새 참조여도 effect 가 헛돌지 않도록 최신 참조만 갱신한다.
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      prev.current = value;
      return;
    }

    const diff = diffOf(prev.current, value);
    prev.current = value;

    if (Object.keys(diff).length > 0) callbackRef.current?.(diff);
  }, [value]);
}
