# @txstack/hooks

React 앱에서 반복적으로 쓰게 되는 범용 훅 모음.

```sh
pnpm add @txstack/hooks
```

`react` 는 peerDependency 다. `react-router-dom` 은 **optional** peerDependency 이며 `@txstack/hooks/router` 서브패스를 쓸 때만 필요하다.

## 호환성

- **ESM 전용이다.** CommonJS `require()` 로는 불러올 수 없다 — `ERR_PACKAGE_PATH_NOT_EXPORTED` 가 난다.
  Node 가 내보내는 메시지(`No "exports" main defined`)는 원인을 알려주지 않으니 주의한다.
- TypeScript 의 `moduleResolution` 은 `bundler` · `node16` · `nodenext` 중 하나여야 한다.
  구형 `node` 설정에서는 **루트 엔트리만 해석되고 서브패스는 해석되지 않는다.**
- **TypeScript 5.4 이상**이 필요하다. `useUrlQuery` 의 옵션 타입이 5.4 에서 추가된 `NoInfer` 유틸리티를 쓴다.

## 엔트리

| import                  | 필요한 peer                  | 포함                                  |
| ----------------------- | ---------------------------- | ------------------------------------- |
| `@txstack/hooks`        | `react`                      | `useStateForObject`, `useSafePolling` |
| `@txstack/hooks/router` | `react` + `react-router-dom` | `useUrlQuery` 및 URL 쿼리 헬퍼        |

루트 배럴을 라우터와 분리한 이유는, Next.js·TanStack Router 등 다른 라우터를 쓰는 프로젝트도
`react-router-dom` 설치 없이 이 패키지를 쓸 수 있게 하기 위해서다.

## `useStateForObject`

객체 상태를 부분 갱신할 때 매번 스프레드를 쓰지 않도록 감싼 훅.

```ts
import { useStateForObject } from "@txstack/hooks";

const [filter, setFilter] = useStateForObject({ keyword: "", page: 1 });

setFilter({ page: 2 }); // keyword 는 유지된다
```

## `useObjectChanged`

객체가 바뀌었을 때 **바뀐 필드만** 콜백으로 넘긴다. 첫 렌더에서는 호출되지 않는다.

```ts
import { useObjectChanged } from "@txstack/hooks";

useObjectChanged(filters, (diff) => {
  if ("keyword" in diff) refetch(); // keyword 가 실제로 달라졌을 때만
});
```

콜백은 최신 참조를 쓰므로 인라인 화살표 함수를 그대로 넘겨도 effect 가 헛돌지 않는다.

## `useSafePolling`

이전 실행이 끝나기 전에 다음 tick 이 겹쳐 도는 것을 막는 폴링 훅. 언마운트 시 자동으로 멈춘다.

```ts
import { useSafePolling } from "@txstack/hooks";

const { start, stop } = useSafePolling(async () => {
  await refetch();
}, 3000);
```

- 콜백은 항상 최신 참조를 쓴다 (stale closure 없음).
- 실행 중이면 다음 tick 을 건너뛴다 (중첩 실행 방지).

## `useUrlQuery`

화면 상태(검색어, 페이지, 탭)를 URL query string 에 유지하는 훅. 새로고침·뒤로가기·링크 공유가 그대로 동작한다.

```ts
import { useUrlQuery } from "@txstack/hooks/router";

interface IQuery {
  tab: number;
  keyword: string;
}

const [query, setQuery] = useUrlQuery<IQuery>({
  defaults: { tab: 0, keyword: "" },
  queryTypes: { tab: "number" }
});

setQuery({ tab: 1 }); // ?tab=1
```

옵션:

| 옵션         | 설명                                                             |
| ------------ | ---------------------------------------------------------------- |
| `defaults`   | 기본값. URL 에 없는 키는 이 값으로 채운다.                       |
| `urlKeys`    | URL 에 실을 키를 제한한다.                                       |
| `queryTypes` | 파싱 타입 지정 (`"string" \| "number" \| "boolean"`).            |
| `postParse`  | 파싱 직후 값을 보정한다.                                         |
| `encode`     | 쿼리 전체를 하나의 인코딩된 키로 묶는다. URL 을 짧고 불투명하게. |
| `replace`    | history 를 push 대신 replace 한다. 기본 `true`.                  |

함께 제공되는 헬퍼: `searchQuery`, `getUrlQuery`, `pushUrlQuery`, `updateUrlQuery`.

## 라이선스

MIT
