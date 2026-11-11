# @txstack/route-meta

관리자 화면에는 라우트 설정과 메뉴 설정이 따로 있는 경우가 많습니다. 그러면 경로 하나를 바꿀 때 두 곳을 고쳐야 하고,
한 곳을 잊으면 메뉴만 없는 주소를 가리키게 됩니다.

`@txstack/route-meta` 는 라우트를 **트리 하나**에 적게 합니다. 경로 옆에 이름 · 아이콘 · 권한 같은 정보를 함께 적어 두면,
라우터 설정 · 메뉴 · 지금 화면의 제목 · 브레드크럼을 모두 그 트리에서 만들어 냅니다.

```sh
npm install @txstack/route-meta
```

`react` 18 이상과 `react-router-dom` 6 이상이 필요합니다.

## 트리 적기

```tsx
import type { RouteTree } from "@txstack/route-meta";

export const routes: RouteTree = {
  dashboard: {
    path: "/dashboard",
    element: <Dashboard />,
    meta: { label: "대시보드", icon: <IconHome /> }
  },
  users: {
    path: "/users",
    element: <UserLayout />,
    meta: { label: "회원", permissions: ["ADMIN"] },
    children: {
      list: { index: true, element: <UserList /> },
      detail: { path: "/users/:id", element: <UserDetail />, meta: { label: "회원 상세", hidden: true } }
    }
  }
};
```

트리는 컴포넌트 밖, 모듈 상수로 두세요. 그래야 아래 훅들이 주소가 바뀌지 않는 동안 같은 결과를 돌려줍니다.

## 트리에서 만들어 내는 것

**라우터** — 트리를 그대로 라우터에 넘깁니다. 둘 중 편한 쪽을 쓰면 됩니다.

```tsx
import { RouteTreeRenderer, buildRouteObjects } from "@txstack/route-meta";

<RouteTreeRenderer tree={routes} />; // <BrowserRouter> 안에서
const router = createBrowserRouter(buildRouteObjects(routes)); // data router 를 쓴다면
```

**메뉴** — 사이드 메뉴나 상단 메뉴에 쓸 목록을 만듭니다. 순서는 트리에 적은 순서 그대로입니다.

```tsx
import { getNavRoutes } from "@txstack/route-meta";

const menu = getNavRoutes(routes, (permissions) => permissions.some((p) => user.roles.includes(p)));
// [{ key: "dashboard", path: "/dashboard", meta }, { key: "users", path: "/users", meta }]
// 회원 상세는 hidden, 목록은 index 라서 메뉴의 children 에 들어가지 않습니다
```

권한을 어떻게 판단할지는 앱이 정합니다. 단일 권한이든 역할 목록이든, 두 번째 인자로 넘기는 함수가 결정합니다.
함수를 넘기지 않으면 `permissions` 가 걸린 항목은 메뉴에서 빠집니다.

**지금 화면** — 화면 제목이나 아이콘을 그릴 때 씁니다.

```tsx
import { useCurrentRoute } from "@txstack/route-meta";

const { meta, params } = useCurrentRoute(routes);
// /users/42 에서 → meta.label === "회원 상세", params.id === "42"
```

매칭은 react-router 에 맡깁니다. 그래서 화면에 실제로 그려진 라우트와 언제나 같은 노드가 나옵니다.
`/users/:id` 와 `/users/new` 가 함께 있어도 라우터와 똑같이 판단합니다.

**브레드크럼** — 지금 주소까지의 경로를 칸 목록으로 돌려줍니다. `@txstack/ui` 의 `TxBreadcrumb` 에 그대로 넘길 수 있습니다.

```tsx
import { useBreadcrumbs } from "@txstack/route-meta";

const crumbs = useBreadcrumbs(routes);
// /users/42 에서 → [{ label: "회원", path: "/users" }, { label: "회원 상세", path: "/users/42" }]

<TxBreadcrumb items={crumbs} itemAs={NavLink} />;
```

라우터 밖에서 주소 하나로 만들어야 할 때(서버, 테스트, 탭 제목 등)는 `getBreadcrumbs(routes, pathname)` 을 씁니다.
레이아웃만 맡는 노드처럼 경로에 보이지 않아야 하는 칸에는 `meta.breadcrumb: false` 를 줍니다.

## 라우터와 메뉴는 거르는 기준이 다릅니다

메뉴에 보이지 않는다고 해서 주소로 들어갈 수 없는 것은 아닙니다. 상세 화면은 메뉴에는 없지만 주소로는 열려야 하니까요.

|                    | 라우터         | 메뉴                   |
| ------------------ | -------------- | ---------------------- |
| `enabled: false`   | 빠집니다       | 빠집니다               |
| `meta.hidden`      | **등록됩니다** | 빠집니다               |
| `meta.permissions` | **등록됩니다** | 권한 함수가 판단합니다 |
| `index` 라우트     | 등록됩니다     | 빠집니다 (경로가 없음) |

`permissions` 는 메뉴에 보일지만 정합니다. 화면 접근 자체를 막으려면 라우트의 `element` 나 `loader` 에서 따로 막아야 합니다.

## 지원 환경

- ESM 전용이고, TypeScript 타입 선언이 들어 있습니다.
- React 18 · 19, react-router-dom 6 · 7 에서 확인했습니다.

## 같은 시리즈

[`@txstack/ui`](https://www.npmjs.com/package/@txstack/ui) · [`@txstack/hooks`](https://www.npmjs.com/package/@txstack/hooks) ·
[`@txstack/axios`](https://www.npmjs.com/package/@txstack/axios) · [`@txstack/fns`](https://www.npmjs.com/package/@txstack/fns)

문서와 예제: <https://code7004.github.io/txstack/>

## 라이선스

MIT
