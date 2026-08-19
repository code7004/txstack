import { useCallback, useState } from "react";

/**
 * ✅ 얕은 비교 (shallow equal)
 * - key/value가 모두 동일하면 true
 * - 중첩 객체까지 깊게 비교하지는 않음
 */
function shallowEqual<T extends Record<string, any>>(a: T, b: T): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * ✅ useStateForObject
 *
 * 객체 상태를 **부분 병합(patch)** 방식으로 다루는 훅.
 * form, filter, query params 처럼 일부 필드만 고치는 상황에 쓴다.
 *
 * ✅ 주요 기능:
 * - `Partial<T>` 또는 함수형 업데이트 지원
 * - 병합 결과가 이전 상태와 얕은 비교로 동일하면 렌더링을 건너뛴다
 * - `postParse` 로 병합 결과를 후보정할 수 있다 (값 정규화, 상호 의존 필드 정리 등)
 *
 * @param initialValue 초기값. `postParse` 가 있으면 초기값에도 적용된다.
 * @param postParse    병합 직후 호출되어 추가 패치를 반환한다.
 * @returns `[state, update]`
 *
 * @example
 * const [filters, setFilters] = useStateForObject({ keyword: "", page: 1 });
 *
 * setFilters({ keyword: "kim" });                  // page 는 유지된다
 * setFilters((prev) => ({ page: prev.page + 1 })); // 함수형 업데이트
 *
 * @remarks
 * 원본(usertics)의 `useUpdateState` 가 전신이다. 그쪽은 `update` 가 다음 상태를 동기 반환했지만,
 * setState 업데이터 안에서 바깥 변수에 대입하는 방식이라 StrictMode 이중 호출에 취약해 계승하지 않았다.
 */

export function useStateForObject<T extends Record<string, any>>(initialValue: T, postParse?: (next: T) => Partial<T>) {
  const [state, _state] = useState<T>(() => ({ ...initialValue, ...postParse?.(initialValue) }));

  const update = useCallback(
    (patch: Partial<T> | ((prev: T) => Partial<T>)) => {
      _state((prev) => {
        const nextPatch = typeof patch === "function" ? patch(prev) : patch;
        const mergedState = { ...prev, ...nextPatch };
        const nextState = { ...mergedState, ...postParse?.(mergedState) };

        // ✅ 렌더링 최소화를 위해 shallowEqual 사용
        if (shallowEqual(prev, nextState)) return prev;

        return nextState;
      });
    },
    [postParse]
  );

  return [state, update] as const;
}
