/**
 * `@txstack/route-meta` — 라우트를 메타데이터 트리 하나로 선언한다.
 *
 * ```
 * RouteTree (단일 출처)
 *    ├─ buildRouteObjects   → React Router 의 RouteObject[]
 *    ├─ getNavRoutes  → GNB / 사이드 메뉴
 *    └─ useCurrentRoute → 현재 위치 · 브레드크럼
 * ```
 *
 * 정의 계층과 실행 계층을 의도적으로 분리한다. **`meta` 는 라우터로 전달되지 않는다.**
 * 설계: docs/002_route_meta/000_README.md
 */
export { buildRouteObjects, getNavRoutes } from "./utils";
export type { CanAccess } from "./utils";

export { useCurrentRoute } from "./hooks";
export type { CurrentRoute } from "./hooks";

export { RouteTreeRenderer } from "./renderer";

export type { IndexRouteNode, NavRoute, PathRouteNode, RouteHandle, RouteMeta, RouteNode, RouteTree } from "./types";
