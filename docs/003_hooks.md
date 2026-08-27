# 003 · `@txstack/hooks`

**의존이 거의 없는 범용 React 훅.**

`react` 만 있으면 되는 훅은 루트 배럴에, `react-router-dom` 이 필요한 훅은 `/router` 서브패스에 둔다.
루트를 라우터와 분리해야 Next.js·TanStack Router 를 쓰는 소비자도 이 패키지를 설치할 수 있다.

## 공개 API (초안 — temp 구현 기준)

### 루트 — `@txstack/hooks`

```ts
import { useObjectChanged, useSafePolling, useStateForObject } from "@txstack/hooks";
```

**`useStateForObject`** — 객체 상태를 필드 단위로 다룬다.

```ts
const [filter, setFilter] = useStateForObject(
  { page: 1, keyword: "", status: "ALL" },
  (next) => (next.keyword !== "" ? { page: 1 } : {}) // 파싱 후 보정
);
```

**`useObjectChanged`** — 객체가 바뀌면 **바뀐 필드만** 콜백으로 준다.

```ts
useObjectChanged(filter, (diff) => {
  console.log("변경된 필드", diff); // Partial<typeof filter>
});
```

**`useSafePolling`** — 이전 호출이 끝나기 전에 다음 호출이 겹치지 않는 폴링.

```ts
useSafePolling(async () => {
  await refetch();
}, 5_000);
```

### 서브패스 — `@txstack/hooks/router`

`react-router-dom` 은 **optional peerDependency** 다. 이 서브패스를 쓰는 소비자만 설치한다.

**`useUrlQuery`** — URL 쿼리스트링을 `useState` 처럼 쓴다. 새로고침·뒤로가기가 그냥 된다.

```ts
import { useUrlQuery } from "@txstack/hooks/router";

const [query, setQuery] = useUrlQuery({
  defaults: { page: 1, size: 20, keyword: "" },
  queryTypes: { page: "number", size: "number" }, // URL 은 전부 문자열이라 복원 규칙이 필요
  urlKeys: { keyword: "q" },                       // 상태 keyword ↔ URL ?q=
  postParse: (next) => ({ ... }),                  // 파싱 직후 보정
  afterParse: (next) => { ... },                   // 파싱 완료 후 부수효과
  encode: false,                                   // 값 encodeURIComponent 여부
  replace: true,                                   // history push 대신 replace
});

setQuery({ page: 2 });
```

훅 밖에서 쓰는 함수들:

```ts
import { searchQuery, getUrlQuery, pushUrlQuery, updateUrlQuery } from "@txstack/hooks/router";

searchQuery(); // 현재 URL 쿼리 → 레코드
getUrlQuery({ page: 2 }); // → "page=2" 문자열
pushUrlQuery({ page: 2 }); // history.push
updateUrlQuery({ page: 2 }); // history.replace
```

## 결정할 것

- [ ] `useUrlQuery` 의 옵션이 7개다. 실제로 다 쓰이는지 temp 원본 사용처를 확인하고 줄일지 판단.
- [ ] `postParse` 와 `afterParse` 의 차이가 이름만으로 안 드러난다. 이름을 바꿀지.
- [ ] `pushUrlQuery` / `updateUrlQuery` 가 `window.history` 를 직접 만지는지, 라우터를 거치는지 확인 필요.
      직접 만진다면 React Router 의 상태와 어긋날 수 있다.
- [ ] `useStateForObject` 의 `T extends Record<string, any>` 에서 `any` 를 걷어낼 수 있는지.
