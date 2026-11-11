# 001 · useObjectState

> 객체 상태를 **부분 병합(patch)** 으로 다룬다.

|             |                                                                                      |
| ----------- | ------------------------------------------------------------------------------------ |
| 진입점      | `@txstack/hooks/useObjectState`                                                      |
| 내보내는 것 | `useObjectState`                                                                     |
| 소스        | [`packages/hooks/src/useObjectState.ts`](../../packages/hooks/src/useObjectState.ts) |
| 테스트      | 6개                                                                                  |

## 개발 목적

form · filter · 검색 조건처럼 **일부 필드만 고치는 자리**에서 `setState((prev) => ({ ...prev, page: 1 }))`
를 매번 치던 것을 없앤다. 상호 의존 필드(검색어가 바뀌면 첫 페이지로) 정리도 한 자리에서 한다.

## 기능

```ts
import { useObjectState } from "@txstack/hooks/useObjectState";

const [filter, setFilter] = useObjectState({ keyword: "", page: 1 });

setFilter({ keyword: "kim" }); // page 는 유지된다
setFilter((prev) => ({ page: prev.page + 1 })); // 함수형 업데이트
```

두 번째 인자 `postParse` 는 병합 직후 호출되어 **추가 패치**를 반환한다. **언제나 지킬 규칙**을 적는 자리다.

```ts
const [range, setRange] = useObjectState(
  { from: "2026-01-01", to: "2026-01-31" },
  (next) => (next.from > next.to ? { to: next.from } : {}) // 시작일이 종료일을 넘으면 종료일을 따라 옮긴다
);
```

**"검색어가 바뀌면 첫 페이지로" 는 여기 적지 않는다.** `postParse` 는 무엇이 바뀌었는지 모른다 —
`(next) => next.keyword ? { page: 1 } : {}` 로 두면 검색어가 있는 동안 `setFilter({ page: 2 })` 가 다시 1 이 된다.
바꾸는 쪽에서 `setFilter({ keyword, page: 1 })` 로 함께 넘긴다. (2026-11-11, 문서 · 사이트의 예제가 이 함정이었다)

- 병합 결과가 이전 상태와 **얕은 비교로 같으면 같은 참조를 돌려** 리렌더를 건너뛴다
- `setFilter` 의 identity 는 **항상 고정**이다. `postParse` 를 인라인으로 넘겨도 바뀌지 않으므로
  `useEffect` 의존성에 그대로 넣어도 된다

## 개발 항목

- [x] **구현** — `packages/hooks/src/useObjectState.ts`
- [x] **테스트** — 6개 (node 아닌 jsdom 프로젝트에서 돈다)
- [x] **의존 없음** — `react` 만 쓴다. 루트 배럴에 있는 유일한 훅이다

## 정한 것 · 고친 것

**`postParse` 를 `useCallback` 의존성에 넣지 않는다.** 원본은 `useCallback(..., [postParse])`
였는데, 소비자는 그 함수를 거의 항상 인라인으로 넘긴다 — 매 렌더 새 함수가 되어
`setFilter` 의 identity 가 흔들렸다. ref 로 붙잡고 의존성을 비웠다.

`T extends Record<string, any>` 를 `T extends object` 로 바꿔 `any` 를 걷어냈다.
