# 001 · RouteTree

> 라우트를 **메타데이터 트리 하나로 선언한다.** 이 패키지의 단일 출처다.

| | |
| --- | --- |
| 진입점 | `@txstack/route-meta` (타입만) |
| 내보내는 것 | `RouteTree` · `RouteNode` · `PathRouteNode` · `IndexRouteNode` · `RouteMeta` · `RouteHandle` |
| 소스 | [`packages/route-meta/src/types.ts`](../../packages/route-meta/src/types.ts) |
| 테스트 | 타입이라 없다 — 쓰는 세 함수의 테스트가 지킨다 |

## 개발 목적

세 프로젝트가 **라우트 정의와 메뉴 정의를 따로** 들고 있었다. 경로를 바꾸면 두 곳을
고쳐야 하고, 한 곳을 잊으면 메뉴만 죽은 링크가 된다. 권한 필터도 라우터와 메뉴에 각각 있었다.

**트리 하나를 단일 출처(SSOT)로 두고 나머지를 함수로 뽑는다.**

## 기능

```tsx
import type { RouteTree } from "@txstack/route-meta";

export const routes = {
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
      home: { index: true, element: <UserList /> }, // 기본 화면. path 를 가질 수 없다
      detail: {
        path: "/users/:id",                          // 절대경로로 쓴다
        element: <UserDetail />,
        meta: { label: "회원 상세", hidden: true }   // 메뉴에는 안 나온다
      }
    }
  },
  legacy: {
    path: "/legacy",
    element: <Legacy />,
    enabled: false // 라우터에도 메뉴에도 없다
  }
} satisfies RouteTree;
```

## `satisfies` 로 붙인다 — 타입 주석으로 붙이지 않는다

**키가 리터럴로 남아야 에디터가 짚어 준다.**

```tsx
routes.users.children.detail.path; // 자동완성이 `detail` 까지 정확히 뜬다
```

`const routes: RouteTree = { … }` 로 붙이면 타입이 `Record<string, RouteNode>` 로 넓어져
`routes.users` 부터 자동완성이 죽고, 키를 틀려도 컴파일이 통과한다. `satisfies` 는 검사만
하고 **리터럴 형태를 남긴다** — 잘못된 노드(예: `index` 와 `path` 를 함께 쓴 것)는 그대로 잡힌다.

`path` 값 자체는 `string` 으로 넓어진다(`satisfies` 가 문맥 타입을 주기 때문). **키가 정확한
것이 목적**이므로 이 편이 낫다 — `as const` 까지 붙이면 `permissions: string[]` 이
`readonly` 가 되어 대입이 막힌다.

이 규약은 [`utils.test.ts`](../../packages/route-meta/src/utils.test.ts) 의 `RouteTree 선언` 이
**타입 단정으로 지킨다.** 키가 넓어지면 `pnpm typecheck` 가 멈춘다.

**`RouteNode` 는 두 종류의 합집합이다.**

| | `PathRouteNode` | `IndexRouteNode` |
| --- | --- | --- |
| `path` | **필수** | **가질 수 없다** |
| `children` | 가능 | **가질 수 없다** |
| 나머지 | `element` · `loader` · `action` · `errorElement` · `meta` · `enabled` | 동일 |

`RouteMeta`: `label` · `icon` · `description` · `hidden` · `permissions`

## 개발 항목

- [x] **타입 정의** — `packages/route-meta/src/types.ts`
- [x] **두 종류를 타입으로 갈랐다** — `{ index: true, path }` 는 React Router 런타임 에러다
- [x] **`RouteMeta.onClick` 을 뺐다.** **"주소로 가는 것" 과 "함수를 실행하는 것" 이 한
      타입에 겹치기 때문**이다. 로그아웃처럼 누르면 실행되는 항목은 라우트가 아니므로,
      소비자가 메뉴에 직접 끼워 넣는다 — `TxSideNav.Item as="button"` 이 이미 그 자리다.

      > 한때 이유를 "직렬화가 안 된다" 로 적었는데 그건 정확하지 않다 — `meta.icon` 도
      > `ReactNode` 라 직렬화되지 않는다. **아이콘은 그려야 하는 데이터이고 핸들러는
      > 동작이다.** 트리는 애초에 `element` 를 들고 있어서 직렬화 대상이 아니다
- [x] **선언은 `satisfies` 로** — 키가 리터럴로 남는 것을 타입 단정으로 못 박았다

## 정한 것 · 고친 것

- **`PathRouteNode` 는 `path` 를 반드시 갖는다.** 절대경로를 쓴다. 경로 없는 노드가 생기면
  메뉴 · 브레드크럼 생성이 특수 케이스투성이가 된다. 원본의 `path?: string` 을
  **필수로 바꿔 정책을 타입으로 강제**했다
- **index route 를 타입으로 지원한다.** 원본은 "index route 를 쓰지 않는다" 는 주석과
  `index` 필드가 **함께** 있었다 — 문서와 코드가 반대였다
- **`meta` 는 실행 계층 최상위로 전달되지 않는다.** 라우터는 `meta` 를 모른다. 다만
  `RouteObject.handle` 에 원본 노드가 실린다 — 라우터가 해석하지 않고 실어 나르기만 하는
  자리이고, 그 덕에 경로 매칭을 직접 구현하지 않아도 된다
  ([004_useCurrentRouteNode](004_useCurrentRouteNode.md))
