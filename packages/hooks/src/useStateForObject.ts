import { useCallback, useRef, useState } from "react";

/**
 * 얕은 비교. key/value 가 모두 같으면 true. 중첩 객체까지 들어가지 않는다.
 */
function shallowEqual<T extends object>(a: T, b: T): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key as keyof T] !== b[key as keyof T]) return false;
  }

  return true;
}

/**
 * 객체 상태를 **부분 병합(patch)** 으로 다루는 훅. form · filter · 검색 조건처럼
 * 일부 필드만 고치는 자리에 쓴다.
 *
 * - `Partial<T>` 또는 함수형 업데이트를 받는다
 * - 병합 결과가 이전 상태와 **얕은 비교로 같으면 리렌더를 건너뛴다**
 * - `postParse` 로 병합 결과를 후보정한다 (값 정규화, 상호 의존 필드 정리)
 *
 * `update` 의 identity 는 **항상 고정이다.** `postParse` 를 인라인으로 넘겨도 바뀌지 않으므로,
 * `useEffect` 의존성에 그대로 넣어도 안전하다.
 *
 * @param initialValue 초기값. `postParse` 가 있으면 초기값에도 적용된다.
 * @param postParse    병합 직후 호출되어 추가 패치를 반환한다.
 *
 * @example
 * const [filter, setFilter] = useStateForObject({ keyword: "", page: 1 });
 *
 * setFilter({ keyword: "kim" });                  // page 는 유지된다
 * setFilter((prev) => ({ page: prev.page + 1 })); // 함수형 업데이트
 *
 * @example 상호 의존 필드 — 검색어가 바뀌면 페이지를 되돌린다
 * const [filter, setFilter] = useStateForObject(
 *   { keyword: "", page: 1 },
 *   (next) => (next.keyword !== "" ? { page: 1 } : {})
 * );
 */
export function useStateForObject<T extends object>(initialValue: T, postParse?: (next: T) => Partial<T>) {
  // 인라인으로 넘어오는 postParse 가 update 의 identity 를 흔들지 않도록 ref 로 붙잡는다.
  const postParseRef = useRef(postParse);
  postParseRef.current = postParse;

  const [state, setState] = useState<T>(() => ({ ...initialValue, ...postParse?.(initialValue) }));

  const update = useCallback((patch: Partial<T> | ((prev: T) => Partial<T>)) => {
    setState((prev) => {
      const nextPatch = typeof patch === "function" ? patch(prev) : patch;
      const merged = { ...prev, ...nextPatch };
      const next = { ...merged, ...postParseRef.current?.(merged) };

      // 값이 그대로면 같은 참조를 돌려 리렌더를 막는다.
      return shallowEqual(prev, next) ? prev : next;
    });
  }, []);

  return [state, update] as const;
}
