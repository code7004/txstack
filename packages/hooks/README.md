# @txstack/hooks

목록 화면을 만들 때마다 손이 가는 상태 관리를 덜어 주는 React 훅입니다. 지금은 두 가지가 들어 있습니다.

- **`useObjectState`** — 검색 조건이나 폼처럼 여러 필드를 가진 객체를, 바꿀 필드만 넘겨서 고칩니다.
- **`useUrlQuery`** — 필터 값을 주소창에 담습니다. 새로고침하거나 링크를 공유해도 같은 화면이 다시 열립니다.

```sh
npm install @txstack/hooks
```

`react` 18 이상이 필요합니다. `useUrlQuery` 를 쓴다면 `react-router-dom` 6 이상도 필요합니다.

## 가져오는 방법

훅마다 진입점이 따로 있습니다. 경로가 곧 훅 이름이라 외울 것이 없고, 쓰지 않는 훅이 요구하는 패키지는 설치하지 않아도 됩니다.

```ts
import { useObjectState } from "@txstack/hooks/useObjectState"; // react 만 있으면 됩니다
import { useUrlQuery } from "@txstack/hooks/useUrlQuery"; // react-router-dom 이 필요합니다
```

`@txstack/hooks` 루트에서는 가져올 수 없습니다. 덕분에 Next.js 나 TanStack Router 를 쓰는 앱도 `useObjectState` 는 그대로 쓸 수 있습니다.

## useObjectState

`useState` 로 객체를 다루면 `setFilter({ ...filter, keyword })` 처럼 매번 나머지 필드를 펼쳐 넣어야 합니다.
`useObjectState` 는 바꿀 필드만 받아서 합쳐 줍니다.

```ts
import { useObjectState } from "@txstack/hooks/useObjectState";

const [filter, setFilter] = useObjectState({ keyword: "", page: 1 });

setFilter({ keyword: "kim" }); // page 는 그대로 1
setFilter((prev) => ({ page: prev.page + 1 })); // 이전 값을 보고 고칠 수도 있습니다
setFilter({ keyword: "lee", page: 1 }); // 검색어를 바꾸면서 첫 페이지로 — 함께 바뀌는 필드는 한 번에 넘깁니다
```

두 번째 인자로 **항상 지켜야 할 규칙**을 줄 수 있습니다. 값이 합쳐질 때마다 불리고, 돌려준 필드가 한 번 더 덮어씁니다.

```ts
// 시작일이 종료일보다 뒤로 가면 종료일을 따라 옮깁니다
const [range, setRange] = useObjectState({ from: "2026-01-01", to: "2026-01-31" }, (next) => (next.from > next.to ? { to: next.from } : {}));
```

합친 결과가 이전과 같으면 다시 그리지 않습니다(얕은 비교). `setFilter` 는 항상 같은 함수라서
`useEffect` 의존성 배열에 넣어도 안전합니다.

## useUrlQuery

목록 화면의 검색 조건을 `useState` 에 두면, 새로고침하거나 주소를 공유할 때 조건이 사라집니다.
`useUrlQuery` 는 그 조건을 주소창의 쿼리스트링에 담고, 주소를 읽어 다시 객체로 돌려줍니다.

```tsx
import { useUrlQuery } from "@txstack/hooks/useUrlQuery";

const [query, setQuery] = useUrlQuery({ defaults: { page: 1, size: 20, keyword: "" } });

query.page; // 1 — 주소가 ?page=3 이면 3. 기본값이 숫자라서 문자열이 아니라 숫자로 읽습니다
setQuery({ keyword: "kim", page: 1 }); // 주소가 ?page=1&size=20&keyword=kim 으로 바뀝니다
```

- **페이지를 이동하지 않습니다.** 같은 경로에서 쿼리만 바꾸므로 화면이 다시 마운트되지 않습니다.
- **뒤로 가기 기록을 쌓지 않습니다.** 필터를 바꿀 때마다 기록이 쌓이길 원한다면 `replace: false` 를 줍니다.
- **주소가 유일한 원본입니다.** 상태를 따로 들고 있지 않아서, 주소와 화면이 어긋날 일이 없습니다.
- **`useEffect` 의존성에 그대로 넣어도 됩니다.** `query` 는 주소가 바뀔 때만 새 객체가 되고, `setQuery` 는 항상 같은 함수입니다.
  `defaults` 를 매번 새 객체로 넘겨도 마찬가지입니다.

### 기본값이 없는 키 읽기

선택 필터처럼 기본값을 두고 싶지 않은 키는 `urlKeys` 에 적습니다. 이때는 타입을 직접 적어 주세요.
`defaults` 에 없는 키는 추론으로 알 수 없기 때문입니다.

```tsx
interface Query {
  page: number;
  keyword?: string;
  status?: number;
}

const [query, setQuery] = useUrlQuery<Query>({
  defaults: { page: 1 },
  urlKeys: ["keyword", "status"], // Query 에 없는 이름을 쓰면 타입 오류가 납니다
  queryTypes: { status: "number" } // 기본값이 없으니 숫자로 읽으라고 알려 줍니다
});

query.status; // number | undefined
```

### 그 밖의 옵션

| 옵션        | 하는 일                                                                          | 기본값  |
| ----------- | -------------------------------------------------------------------------------- | ------- |
| `postParse` | 주소를 읽은 직후 값을 바로잡습니다 (`useObjectState` 의 두 번째 인자와 같습니다) | —       |
| `encode`    | 쿼리 전체를 한 덩어리로 감춥니다 → `?_q=eyJ...`                                  | `false` |
| `encodeKey` | `encode` 에 쓸 키 이름                                                           | `"_q"`  |
| `replace`   | 주소를 바꿀 때 뒤로 가기 기록을 쌓지 않습니다                                    | `true`  |

배열은 `?ids[]=1&ids[]=2` 처럼 `[]` 를 붙이거나 같은 키를 여러 번 적으면 `{ ids: [1, 2] }` 로 읽습니다.
`?q=a,b` 처럼 콤마가 있어도 쪼개지 않고 문자열 `"a,b"` 그대로 둡니다.

## 지원 환경

- ESM 전용이고, TypeScript 타입 선언이 들어 있습니다.
- React 18 · 19, react-router-dom 6 · 7 에서 확인했습니다.

## 같은 시리즈

[`@txstack/ui`](https://www.npmjs.com/package/@txstack/ui) · [`@txstack/route-meta`](https://www.npmjs.com/package/@txstack/route-meta) ·
[`@txstack/axios`](https://www.npmjs.com/package/@txstack/axios) · [`@txstack/fns`](https://www.npmjs.com/package/@txstack/fns)

문서와 예제: <https://code7004.github.io/txstack/>

## 라이선스

MIT
