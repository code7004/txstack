/**
 * `@txstack/route-meta` — 라우트를 메타데이터 트리 하나로 선언한다.
 *
 * ```
 * RouteTree (단일 출처)
 *    ├─ buildRouteObjects  → React Router 의 RouteObject[]
 *    ├─ getNavigableRoutes → GNB / 사이드 메뉴
 *    └─ useCurrentRouteNode → 현재 위치의 노드
 * ```
 *
 * 정의 계층과 실행 계층을 의도적으로 분리한다. **`meta` 는 라우터로 전달되지 않는다.**
 * 설계: docs/002_route_meta.md
 */

export {};
