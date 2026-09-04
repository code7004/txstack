# 001 · useStateForObject

> 객체 상태를 **부분 병합(patch)** 으로 다룬다.

|             |                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------ |
| 진입점      | `@txstack/hooks`                                                                           |
| 내보내는 것 | `useStateForObject`                                                                        |
| 소스        | [`packages/hooks/src/useStateForObject.ts`](../../packages/hooks/src/useStateForObject.ts) |
| 테스트      | 6개                                                                                        |

## 개발 목적

form · filter · 검색 조건처럼 **일부 필드만 고치는 자리**에서 `setState((prev) => ({ ...prev, page: 1 }))`
를 매번 치던 것을 없앤다. 상호 의존 필드(검색어가 바뀌면 첫 페이지로) 정리도 한 자리에서 한다.

## 기능

```ts
import { useStateForObject } from "@txstack/hooks";

const [filter, setFilter] = useStateForObject({ keyword: "", page: 1 });

setFilter({ keyword: "kim" }); // page 는 유지된다
setFilter((prev) => ({ page: prev.page + 1 })); // 함수형 업데이트
```

두 번째 인자 `postParse` 는 병합 직후 호출되어 **추가 패치**를 반환한다.

```ts
const [filter, setFilter] = useStateForObject(
  { keyword: "", page: 1 },
  (next) => (next.keyword ? { page: 1 } : {}) // 검색어가 바뀌면 첫 페이지로
);
```

- 병합 결과가 이전 상태와 **얕은 비교로 같으면 같은 참조를 돌려** 리렌더를 건너뛴다
- `setFilter` 의 identity 는 **항상 고정**이다. `postParse` 를 인라인으로 넘겨도 바뀌지 않으므로
  `useEffect` 의존성에 그대로 넣어도 된다

## 개발 항목

- [x] **구현** — `packages/hooks/src/useStateForObject.ts`
- [x] **테스트** — 6개 (node 아닌 jsdom 프로젝트에서 돈다)
- [x] **의존 없음** — `react` 만 쓴다. 루트 배럴에 있는 유일한 훅이다

## 정한 것 · 고친 것

**`postParse` 를 `useCallback` 의존성에 넣지 않는다.** 원본은 `useCallback(..., [postParse])`
였는데, 소비자는 그 함수를 거의 항상 인라인으로 넘긴다 — 매 렌더 새 함수가 되어
`setFilter` 의 identity 가 흔들렸다. ref 로 붙잡고 의존성을 비웠다.

`T extends Record<string, any>` 를 `T extends object` 로 바꿔 `any` 를 걷어냈다.
