# 003 · `@txstack/hooks`

**의존이 거의 없는 범용 React 훅.**

`react` 만 있으면 되는 훅은 루트 배럴에, `react-router-dom` 이 필요한 훅은 `/router` 서브패스에 둔다.
루트를 라우터와 분리해야 Next.js·TanStack Router 를 쓰는 소비자도 이 패키지를 설치할 수 있다.

**이식 완료.** 아래는 초안이 아니라 실제 공개 API 다.

## 진입점

| 진입점                  | 내용                | 추가 peer 의존     |
| ----------------------- | ------------------- | ------------------ |
| `@txstack/hooks`        | `useStateForObject` | 없음               |
| `@txstack/hooks/router` | `useUrlQuery`       | `react-router-dom` |

훅은 두 개다. temp 에 있던 `useObjectChanged` · `useSafePolling` 은 **가져오지 않았다.**

## `useStateForObject`

객체 상태를 **부분 병합(patch)** 으로 다룬다. form · filter · 검색 조건처럼 일부 필드만
고치는 자리에 쓴다.

```ts
import { useStateForObject } from "@txstack/hooks";

const [filter, setFilter] = useStateForObject({ keyword: "", page: 1 });

setFilter({ keyword: "kim" }); // page 는 유지된다
setFilter((prev) => ({ page: prev.page + 1 })); // 함수형 업데이트
```

두 번째 인자 `postParse` 는 병합 직후 호출되어 추가 패치를 반환한다. 상호 의존 필드를 정리한다.

```ts
const [filter, setFilter] = useStateForObject(
  { keyword: "", page: 1 },
  (next) => (next.keyword ? { page: 1 } : {}) // 검색어가 바뀌면 첫 페이지로
);
```

- 병합 결과가 이전 상태와 **얕은 비교로 같으면 같은 참조를 돌려** 리렌더를 건너뛴다.
- `setFilter` 의 identity 는 **항상 고정**이다. `postParse` 를 인라인으로 넘겨도 바뀌지 않으므로
  `useEffect` 의존성에 그대로 넣어도 된다.

## `useUrlQuery`

**URL 쿼리스트링을 화면 상태처럼 쓴다.** 필터 값이 주소에 남으므로 새로고침·공유·즐겨찾기가
그대로 복원된다.

```tsx
import { useUrlQuery } from "@txstack/hooks/router";

const [query, setQuery] = useUrlQuery({ defaults: { a: 10, b: 20 } });

query.a; // 10 — 문자열이 아니라 숫자로 복원된다
setQuery({ a: 20 }); // 주소창이 ?a=20&b=20 으로 바뀐다
```

### 이 훅이 지키는 세 가지

**① 새로고침해도 그대로다.** `?a=10&b=20` 로 들어오면 그 값이 상태다.

**② 주소에 기재만 하고 페이지를 이동시키지 않는다.** `setQuery` 는 같은 경로의 쿼리만
갈아끼운다. 라우트 매칭 결과가 같으므로 컴포넌트는 언마운트되지 않고, `replace` 기본값이
`true` 라 히스토리도 쌓이지 않는다.

**③ 객체로 바로 쓴다.** `defaults` 값의 타입이 복원 규칙이 된다 — `page: 1` 이면
`?page=2` 를 문자열이 아니라 숫자 `2` 로 읽는다.

### URL 이 단일 출처다

상태를 따로 들지 않고 `useSearchParams` 에서 매번 파생시킨다. **URL 로 되쓰는 `useEffect` 가
없고, 쓰기는 `setQuery` 를 부를 때만 일어난다.**

이게 원본과 가장 크게 달라진 점이고, 무한 반복이 났던 이유이기도 하다 — 아래 "이식하며 고친 것" 참고.

### 옵션

```tsx
const [query, setQuery] = useUrlQuery({
  defaults: { page: 1, size: 20, keyword: "" },

  urlKeys: ["status"], // defaults 에 없지만 URL 에서 읽을 키
  queryTypes: { status: "number" }, // 기본값이 없어 복원 규칙을 직접 줘야 하는 키
  postParse: (q) => (q.keyword ? { page: 1 } : {}),

  encode: true, // 쿼리 전체를 base64url 한 덩어리로 감춘다 → ?_q=eyJ...
  encodeKey: "_q", // 그때 쓸 키 이름. 기본 "_q"
  replace: true // 기본값. false 면 필터를 만질 때마다 히스토리가 쌓인다
});
```

배열은 `key[]` 로 읽고 쓴다 — `?ids[]=1&ids[]=2` → `{ ids: [1, 2] }`.

### 반환값 identity

`setQuery` 는 **항상 같은 함수**고, `query` 는 **URL 이 바뀔 때만 새 객체**가 된다.

`defaults` 를 인라인으로 넘겨도(`{ defaults: { a: 10 } }`) 매 렌더 새 객체가 만들어지지
않는다. 옵션을 ref 로 붙잡고 의존성을 `searchParams` 하나로 두기 때문이다. 그래서 둘 다
`useEffect` 의존성에 그대로 넣어도 루프가 나지 않는다.

### 알아둘 것 — data router

`loader` 를 쓰는 라우트에서는 로케이션이 바뀌면 loader 가 다시 돈다. 필터를 loader 로 읽고
있다면 의도한 동작일 것이고, 아니라면 그 라우트에서 `shouldRevalidate` 를 조정한다.

## 이식하며 고친 것

| 원본                                                        | 지금                           | 왜                                                                         |
| ----------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| 상태 변경마다 URL 로 되쓰는 `useEffect`                     | 제거. URL 이 단일 출처         | **무한 반복의 원인.** 아래 설명                                            |
| 마운트 시 `defaults` 를 전부 URL 에 기록                    | 마운트 시 주소를 건드리지 않음 | 들어가기만 해도 히스토리가 replace 되고 기본값이 주소창에 노출됐다         |
| 옵션이 매 렌더 새 객체 → 반환값 identity 불안정             | 옵션을 ref 로 붙잡음           | 소비자는 `defaults` 를 거의 항상 인라인으로 넘긴다. 소비자 쪽 루프의 원인  |
| `searchQuery`·`getUrlQuery`·`pushUrlQuery`·`updateUrlQuery` | 삭제                           | `window.history` 를 직접 만져 라우터 상태와 어긋난다. 요청 범위에도 없었다 |
| `decodeObject` 실패 시 `console.error`                      | 조용히 defaults 로             | 주소를 손으로 고친 것뿐인데 라이브러리가 앱 콘솔을 더럽힐 이유가 없다      |
| `afterParse`                                                | 삭제                           | 원본에서 이미 `@deprecated` 였다                                           |
| `ENCODED_QUERY_KEY = "encioesode"`                          | `encodeKey` 옵션 (기본 `_q`)   | 오타처럼 보이는 매직 문자열이 공개 URL 에 노출되는데 소비자가 못 바꿨다    |
| `useStateForObject` 의 `useCallback(..., [postParse])`      | ref 로 붙잡고 deps 비움        | 인라인 `postParse` 면 매 렌더 새 함수가 됐다                               |
| `T extends Record<string, any>`                             | `T extends object`             | `any` 를 걷어냈다                                                          |

### 무한 반복이 났던 이유

```ts
useEffect(() => {
  writeQuery(state, setSearchParams, encode, replace);
}, [encode, replace, setSearchParams, state]);
```

`setSearchParams` 를 부르면 → `searchParams` 가 바뀌고 → **`setSearchParams` 의 identity 도
바뀌어** → effect 가 다시 돌고 → 또 쓴다.

URL 을 단일 출처로 만들면 이 effect 자체가 필요 없어진다. 쓰기는 `setQuery` 호출 시 한 번뿐이다.

## 가져오지 않은 것

- **`useObjectChanged`** — 객체가 바뀌면 바뀐 필드만 콜백으로 주던 훅.
- **`useSafePolling`** — 이전 호출이 끝나기 전에 겹치지 않는 폴링.

둘 다 temp 에 남아 있다. 필요해지면 그때 같은 방식으로 옮긴다.

## 검증

테스트 25개. `vitest` 의 `dom` 프로젝트(jsdom)에서 `MemoryRouter` 로 실제 주소 변화를 관찰한다.
"마운트만으로 주소를 건드리지 않는다" 와 "인라인 `defaults` 에도 identity 가 유지된다" 를
회귀 테스트로 못 박았다 — 둘 다 무한 반복으로 이어지던 지점이다.

## 남은 것

- [ ] 훅이 두 개고 루트 배럴에는 하나뿐이다. 이대로 독립 패키지를 유지할지, 아니면
      `useStateForObject` 를 `ui` 로 넣고 `useUrlQuery` 만 남길지는 `ui` 이식 때 다시 본다.
- [ ] `urlKeys` 로 읽은 키는 `T` 에 없어 타입이 따라오지 않는다. 쓰는 자리가 생기면 다시 본다.
