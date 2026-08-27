# 002 · `@txstack/route-meta`

**라우트를 메타데이터 트리 하나로 선언하고, 거기서 라우터·메뉴·현재위치를 전부 파생시킨다.**

`react-router-dom` 은 peerDependency 다.

## 무엇을 해결하는가

세 프로젝트 모두 라우트 정의와 GNB 메뉴 정의를 **따로** 들고 있었다.
경로를 바꾸면 두 곳을 고쳐야 하고, 한 곳을 잊으면 메뉴만 죽은 링크가 된다.
권한 필터도 라우터와 메뉴에 각각 있었다.

그래서 **트리 하나를 단일 출처(SSOT)로 두고** 나머지를 함수로 뽑는다.

```
RouteTree (단일 출처)
   ├─ buildRouteObjects  → React Router 의 RouteObject[]
   ├─ getNavigableRoutes → GNB / 사이드 메뉴
   └─ useCurrentRouteNode → 현재 위치의 노드 (브레드크럼·타이틀)
```

## 공개 API (초안 — temp 구현 기준)

### 정의

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
    meta: { label: "회원", icon: <IconUser />, permissions: ["ADMIN"] },
    children: {
      detail: {
        path: "/users/:id", // 절대경로로 쓴다 (자동화 계층 일관성)
        element: <UserDetail />,
        meta: { label: "회원 상세", hidden: true } // 메뉴에는 안 나온다
      }
    }
  },
  legacy: {
    path: "/legacy",
    element: <Legacy />,
    enabled: false // 라우터에 아예 등록되지 않는다
  }
};
```

`RouteNode` 필드: `path` · `element` · `children` · `index` · `loader` · `action` · `errorElement` · `enabled` · `meta`
`RouteMeta` 필드: `label` · `icon` · `description` · `hidden` · `permissions` · `onClick`

### 실행 — 라우터

```tsx
import { buildRouteObjects } from "@txstack/route-meta";
import { useRoutes } from "react-router-dom";

function App() {
  return useRoutes(buildRouteObjects(routes));
}
```

`RouteRenderer` 를 쓰면 위를 감쌀 수 있다.

```tsx
import { RouteRenderer } from "@txstack/route-meta";

<RouteRenderer data={routes} />;
```

### 내비게이션 — 메뉴

```tsx
import { getNavigableRoutes } from "@txstack/route-meta";

const menu = getNavigableRoutes(routes, user.role);
// hidden: true 와 권한 미달 노드는 빠진다
```

### 런타임 — 현재 위치

```tsx
import { useCurrentRouteNode } from "@txstack/route-meta";

const node = useCurrentRouteNode(routes);
document.title = node?.meta?.label ?? "";
```

## 정책

- **모든 `RouteNode` 는 `path` 를 명시한다.** 절대경로를 쓴다.
- **React Router 의 index route 를 쓰지 않는다.** 의도적이다 — 경로 없는 노드가 생기면
  메뉴·브레드크럼 생성이 특수 케이스투성이가 된다.
- **`meta` 는 실행 계층으로 전달되지 않는다.** 라우터는 `meta` 를 모른다.

## 결정할 것

- [ ] `getNavigableRoutes(tree, permission?)` 가 권한을 **문자열 하나**로 받는다.
      실제로는 사용자가 권한을 여러 개 가질 수 있다. `string[]` 또는 판정 함수 주입으로 바꿀지.
- [ ] `RouteMeta.onClick` 이 여기 있는 게 맞는지. 라우트 메타에 핸들러가 섞이면 직렬화가 안 된다.
- [ ] `RouteRenderer` 와 `buildRouteObjects` 중 하나만 남길지. 둘 다 두면 쓰는 법이 두 가지가 된다.
- [ ] `index?: boolean` 필드가 남아 있는데 "index route 를 쓰지 않는다" 정책과 모순이다. 제거할지.
