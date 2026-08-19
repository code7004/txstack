# route-meta

`route-meta`는 React Router의 라우트 정의와 GNB/Sidebar 같은 메뉴 정의를 하나의 `RouteData`에서 관리하기 위한 작은 라우팅 패턴입니다.

## 호환성

- **ESM 전용이다.** CommonJS `require()` 로는 불러올 수 없다 — `ERR_PACKAGE_PATH_NOT_EXPORTED` 가 난다.
  Node 가 내보내는 메시지(`No "exports" main defined`)는 원인을 알려주지 않으니 주의한다.

## 목적

페이지가 늘어나면 같은 경로가 여러 곳에 흩어지기 쉽습니다.

- `useRoutes` 라우터 설정
- GNB/Sidebar 메뉴 배열
- Header, Dashboard, Table cell의 `navigate`/`Link`
- 권한별 메뉴 노출 조건
- 현재 페이지의 label/description

`route-meta`는 이 정보를 `RouteTree` 하나에 모으고, 실행 라우터와 메뉴 데이터를 거기서 파생시킵니다.

## 구성

- `types.ts`: `RouteTree`, `RouteNode`, `RouteMeta` 타입
- `utils.ts`: `RouteTree`를 React Router `RouteObject[]`로 변환하고 메뉴용 라우트를 필터링
- `renderer.ts`: `RouteRenderer` 컴포넌트
- `hooks.ts`: 현재 URL과 매칭되는 `RouteNode` 조회

## 기본 구조

```tsx
import type { RouteTree } from "@txstack/route-meta";
import { Navigate } from "react-router-dom";

export const RouteData = {
  Login: { path: "/login", element: <LoginPage />, meta: { label: "Login", hidden: true } },
  Contents: {
    path: "/",
    element: <Layout />,
    meta: { label: "Contents", hidden: true },
    children: {
      Index: { index: true, path: "/", element: <Navigate to="/dashboard" replace />, meta: { label: "Dashboard", hidden: true } },
      Dashboard: { path: "/dashboard", element: <DashboardPage />, meta: { label: "Dashboard" } },
      Users: {
        path: "/users",
        element: <UsersLayout />,
        meta: { label: "Users" },
        children: {
          UserList: { path: "/users/list", element: <UserListPage />, meta: { label: "User List" } }
        }
      }
    }
  },
  NotFound: { path: "*", element: <NotFoundPage />, meta: { label: "Not Found", hidden: true } }
} satisfies RouteTree;
```

## 라우터 연결

기존 `useRoutes([...])` 대신 `RouteRenderer`를 사용합니다.

```tsx
import { RouteRenderer } from "@txstack/route-meta";
import { RouteData } from "./config/RouteData";

const Routes = () => {
  return <RouteRenderer data={RouteData} />;
};

export default Routes;
```

## 메뉴 생성

GNB나 Sidebar는 `getNavigableRoutes`로 생성합니다.

```tsx
import { getNavigableRoutes } from "@txstack/route-meta";
import { RouteData } from "./config/RouteData";

const menus = getNavigableRoutes(RouteData.Contents.children ?? {}, auth.role);
```

필터 규칙은 다음과 같습니다.

- `enabled: false`면 라우터와 메뉴에서 제외
- `meta.hidden: true`면 메뉴에서 제외
- `meta.permissions`가 있으면 현재 권한과 일치할 때만 메뉴에 노출
- `index: true` 라우트는 메뉴에서 제외

## 경로 재사용

경로 상수 파일을 따로 만들지 말고 `RouteData`에서 alias/helper를 export하는 방식을 권장합니다.

```tsx
export const ContentRoutes = RouteData.Contents.children;
export const DashboardRoutes = ContentRoutes.Dashboard.children;
export const UserRoutes = ContentRoutes.Users.children;

export const LOGIN_PATH = RouteData.Login.path;
export const DASHBOARD_PATH = ContentRoutes.Dashboard.path;
```

사용부에서는 이렇게 씁니다.

```tsx
navigate(ContentRoutes.Users.path);
navigate(`${DashboardRoutes.Search.path}?code=${keyword}`);
```

타입별/상태별로 의미가 있는 이동은 helper로 감쌉니다.

```tsx
export function getUserTypePagePath(type: number) {
  if (type === UserTypes.Real) return UserRoutes.ApprovedUsers.path;
  if (type === UserTypes.Black) return ContentRoutes.BlackUsers.path;
  return ContentRoutes.Users.path;
}
```

## Index Route와 루트 진입

루트 접속 시 대시보드로 보내야 한다면 index route를 둡니다.

```tsx
Index: { index: true, path: "/", element: <Navigate to="/dashboard" replace />, meta: { label: "Dashboard", hidden: true } }
```

이 패턴은 `localhost/` 접속 시 `localhost/dashboard`로 연결하는 데 사용합니다.

## RouteMeta 필드

```ts
interface RouteMeta {
  label?: string;
  icon?: ReactNode;
  description?: string;
  hidden?: boolean;
  permissions?: string[];
  onClick?: () => void;
}
```

권한 타입이 문자열이 아니라면 프로젝트에 맞게 `permissions` 타입을 넓혀도 됩니다.

```ts
permissions?: Array<string | number>;
```

## 적용 순서

1. `pnpm add @txstack/route-meta` 로 설치합니다. (`react`, `react-router-dom` 은 peer 의존입니다.)
2. `config/RouteData.tsx`를 만들고 기존 라우트를 `RouteTree`로 옮깁니다.
3. 기존 `Routes.tsx`의 `useRoutes([...])`를 `RouteRenderer`로 교체합니다.
4. GNB/Sidebar의 하드코딩 메뉴 배열을 `getNavigableRoutes` 기반으로 교체합니다.
5. 흩어진 `navigate`, `Link` 경로를 `RouteData` alias/helper 기반으로 바꿉니다.
6. `tsc --noEmit`으로 라우트 타입과 import 순환 문제를 확인합니다.

## 운영 기준

- 경로 원본은 `RouteData` 하나로 유지합니다.
- 짧은 leaf route는 한 줄로 작성하면 목록성이 좋아집니다.
- `children`이 있는 그룹 route만 펼쳐 작성합니다.
- 메뉴에 보이지 않아야 하는 라우트는 `meta.hidden: true`를 명시합니다.
- 일시적으로 비활성화할 화면은 주석보다 `enabled: false`를 우선 사용합니다.
- URL 구조 변경 시 `RouteData`와 alias/helper만 먼저 바꾸고, 사용처는 검색으로 검증합니다.

## 검색 체크

도입 후에는 하드코딩 경로가 남았는지 확인합니다.

```powershell
rg -n "/OldPrefix|navigate(|<Link|<NavLink" src -g "*.tsx" -g "*.ts"
```

프로젝트별 라우트 prefix를 제거하거나 변경했다면, 남은 문자열이 실제 URL인지 import 경로인지 구분해서 확인합니다.
