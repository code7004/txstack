# @txstack/route-meta

**라우트를 메타데이터 트리 하나로 선언하고, 거기서 라우터·메뉴·현재위치를 전부 파생시킨다.**

라우트 정의와 메뉴 정의를 따로 들고 있으면 경로를 바꿀 때 두 곳을 고쳐야 하고,
한 곳을 잊으면 메뉴만 죽은 링크가 된다. 그래서 단일 출처를 둔다.

> **아직 npm 에 배포되지 않았다.** 전체 설계는 [docs/002_route_meta.md](../../docs/002_route_meta.md).

```sh
pnpm add @txstack/route-meta react react-router-dom
```

## 쓰기

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
      home: { index: true, element: <UserList /> },
      detail: { path: "/users/:id", element: <UserDetail />, meta: { label: "회원 상세", hidden: true } }
    }
  }
};
```

```tsx
// 실행 — 라우터
useRoutes(buildRouteObjects(routes));

// 내비게이션 — 메뉴. 권한 판정은 앱이 정한다
const menu = getNavigableRoutes(routes, (perms) => perms.some((p) => user.roles.includes(p)));

// 런타임 — 현재 위치 · 브레드크럼
const { node, meta, matches, params } = useCurrentRouteNode(routes);
```

## 두 계층의 필터 규칙이 다르다

|                    | 라우터   | 메뉴             |
| ------------------ | -------- | ---------------- |
| `enabled: false`   | 제외     | 제외             |
| `meta.hidden`      | **등록** | 제외             |
| `meta.permissions` | **등록** | `canAccess` 판정 |
| index route        | 등록     | 제외             |

`hidden` 인 라우트도 **주소로는 접근돼야 한다.** 메뉴에 안 보일 뿐이다.

## 매칭은 라우터에 위임한다

`buildRouteObjects` 가 각 `RouteObject.handle` 에 원본 노드를 심고,
`useCurrentRouteNode` 는 `matchRoutes` 결과에서 그걸 되찾는다.
**화면에 렌더된 라우트와 항상 같은 노드가 나온다.**

`useCurrentRouteNode` 에 넘기는 트리는 **모듈 상수로 둔다.** 그러면 주소가 그대로일 때
같은 객체를 돌려주므로 `useEffect` 의존성에 넣어도 된다.
