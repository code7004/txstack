# @txstack/hooks

의존이 거의 없는 범용 React 훅.

| 진입점                  | 내용                | 추가 peer 의존     |
| ----------------------- | ------------------- | ------------------ |
| `@txstack/hooks`        | `useStateForObject` | 없음               |
| `@txstack/hooks/router` | `useUrlQuery`       | `react-router-dom` |

루트를 라우터와 분리해야 Next.js·TanStack Router 를 쓰는 소비자도 설치할 수 있다.

> **아직 npm 에 배포되지 않았다.** 전체 설계는 [docs/003_hooks.md](../../docs/003_hooks.md).

```sh
pnpm add @txstack/hooks react
```

## `useStateForObject`

객체 상태를 부분 병합으로 다룬다. form · filter 처럼 일부 필드만 고치는 자리에 쓴다.

```ts
import { useStateForObject } from "@txstack/hooks";

const [filter, setFilter] = useStateForObject({ keyword: "", page: 1 });

setFilter({ keyword: "kim" }); // page 는 유지된다
setFilter((prev) => ({ page: prev.page + 1 }));
```

병합 결과가 이전 상태와 얕은 비교로 같으면 리렌더를 건너뛴다.
`setFilter` 의 identity 는 항상 고정이다.

## `useUrlQuery`

**URL 쿼리스트링을 화면 상태처럼 쓴다.** 필터 값이 주소에 남아 새로고침·공유가 그대로 복원된다.

```tsx
import { useUrlQuery } from "@txstack/hooks/router";

const [query, setQuery] = useUrlQuery({ defaults: { a: 10, b: 20 } });

query.a; // 10 — 문자열이 아니라 숫자로 복원된다
setQuery({ a: 20 }); // 주소창이 ?a=20&b=20 으로 바뀐다
```

- **주소에 기재만 하고 페이지를 이동시키지 않는다.** 컴포넌트는 언마운트되지 않고,
  `replace` 기본값이 `true` 라 히스토리도 쌓이지 않는다.
- **URL 이 단일 출처다.** 상태를 따로 들지 않아 URL 로 되쓰는 effect 가 없다.
- **`query` 와 `setQuery` 의 identity 가 안정적이다.** `defaults` 를 인라인으로 넘겨도
  매 렌더 새 객체가 만들어지지 않으므로 `useEffect` 의존성에 그대로 넣어도 된다.

```tsx
const [query, setQuery] = useUrlQuery({
  defaults: { page: 1, size: 20, keyword: "" },
  urlKeys: ["status"], // defaults 에 없지만 URL 에서 읽을 키
  queryTypes: { status: "number" }, // 복원 규칙을 직접 줘야 하는 키
  postParse: (q) => (q.keyword ? { page: 1 } : {}),
  encode: true // 쿼리 전체를 감춘다 → ?_q=eyJ...
});
```

배열은 `key[]` 로 읽고 쓴다 — `?ids[]=1&ids[]=2` → `{ ids: [1, 2] }`.
