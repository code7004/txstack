import { matchRoutes, type RouteObject } from "react-router-dom";
import type { Breadcrumb, NavRoute, RouteHandle, RouteNode, RouteTree } from "./types";

/**
 * 정의 계층(`RouteTree`)을 React Router 실행 계층(`RouteObject[]`)으로 변환한다.
 *
 * ```
 * RouteTree → buildRouteObjects → useRoutes → 화면
 * ```
 *
 * - `enabled !== false` 인 노드만 등록한다. **`hidden` 은 보지 않는다** —
 *   메뉴에서만 숨길 뿐 주소로는 접근돼야 하기 때문이다.
 * - `meta` 는 `RouteObject` 최상위로 넘어가지 않는다. 라우터는 `meta` 를 모른다.
 * - 각 `RouteObject.handle` 에 원본 노드와 그 키를 심는다. `useCurrentRoute` · `useBreadcrumbs` 가 이걸로 되찾는다.
 */
export function buildRouteObjects(tree: RouteTree): RouteObject[] {
  return Object.entries(tree)
    .filter(([, node]) => node.enabled !== false)
    .map(([key, node]) => transformNode(node, key));
}

function transformNode(node: RouteNode, key: string): RouteObject {
  const { element, loader, action, errorElement } = node;
  const handle: RouteHandle = { node, key };

  // index route 는 path·children 을 가질 수 없다. 타입으로 막혀 있지만 여기서도 넣지 않는다.
  if (node.index) return { index: true, element, loader, action, errorElement, handle };

  const children = node.children ? buildRouteObjects(node.children) : undefined;

  return { path: node.path, element, loader, action, errorElement, children, handle };
}

/**
 * `meta.permissions` 가 있는 노드를 노출할지 판정한다.
 *
 * **권한이 없는 노드에는 호출되지 않는다.** 그런 노드는 항상 노출된다.
 *
 * @param permissions 해당 노드의 `meta.permissions`
 * @param node        판정 대상 노드. 계층 권한 등 추가 정보가 필요할 때 쓴다
 */
export type CanAccess = (permissions: string[], node: RouteNode) => boolean;

/** 판정 함수를 주지 않으면 권한이 걸린 노드는 노출하지 않는다. */
const DENY_RESTRICTED: CanAccess = () => false;

/**
 * GNB · 사이드 메뉴용 목록을 만든다. **실행 계층과 필터 규칙이 다르다.**
 *
 * | | 라우터 | 메뉴 |
 * | --- | --- | --- |
 * | `enabled: false` | 제외 | 제외 |
 * | `meta.hidden` | **등록** | 제외 |
 * | `meta.permissions` | **등록** | `canAccess` 판정 |
 * | index route | 등록 | 제외 (경로가 없다) |
 *
 * 권한 모델은 **라이브러리가 정하지 않는다.** 단일 권한이든 다중이든 계층이든,
 * `canAccess` 를 주는 쪽이 결정한다.
 *
 * 선언 순서를 지킨다. 메뉴 순서는 트리에 쓴 순서다.
 *
 * @example
 * const menu = getNavRoutes(routes, (perms) => perms.some((p) => user.roles.includes(p)));
 *
 * @example 권한 판정 없이 — permissions 가 걸린 노드는 전부 빠진다
 * const publicMenu = getNavRoutes(routes);
 */
export function getNavRoutes(tree: RouteTree, canAccess: CanAccess = DENY_RESTRICTED): NavRoute[] {
  return Object.entries(tree).flatMap<NavRoute>(([key, node]) => {
    // index route 는 경로가 없어 메뉴 항목이 될 수 없다.
    if (node.index) return [];
    if (node.enabled === false) return [];
    if (node.meta?.hidden) return [];

    const permissions = node.meta?.permissions;
    if (permissions?.length && !canAccess(permissions, node)) return [];

    const item: NavRoute = { key, path: node.path, meta: node.meta };

    // 자식이 전부 걸러졌으면 children 을 달지 않는다. 빈 배열이면 "펼치는 항목" 으로 보인다.
    const children = node.children ? getNavRoutes(node.children, canAccess) : [];
    return [children.length ? { ...item, children } : item];
  });
}

/**
 * 트리마다 라우터 형식은 한 번만 만든다. 트리 객체를 키로 기억하므로 트리는 모듈 상수로 둔다 —
 * 렌더마다 새 트리를 만들면 그때마다 다시 바꾼다(틀리지는 않고 느릴 뿐이다).
 */
const routeObjectsByTree = new WeakMap<RouteTree, RouteObject[]>();

function routeObjectsOf(tree: RouteTree) {
  let routes = routeObjectsByTree.get(tree);
  if (!routes) routeObjectsByTree.set(tree, (routes = buildRouteObjects(tree)));
  return routes;
}

/** 끝 `/` 를 뗀다. `matchRoutes` 는 index · 부모와 같은 경로의 자식에 `/user/` 를 준다. 루트 `/` 는 그대로 둔다. */
const trimTrailingSlash = (path: string) => (path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path);

/**
 * 주소 하나로 경로 칸을 만든다. **라우터 밖에서 쓴다** — 시연 · 렌더 전 · 서버 · 테스트.
 * 라우터 안이라면 지금 주소를 읽는 `useBreadcrumbs` 가 이것을 부른다.
 *
 * ```ts
 * getBreadcrumbs(routes, "/user/dormant");            // 유저관리 / 휴면유저
 * getBreadcrumbs(routes, location.pathname, "/admin"); // 라우터에 basename 을 줬다면 같은 값을
 * ```
 *
 * - `meta.breadcrumb: false` 인 노드는 빠진다(아래 칸은 남는다). 레이아웃만 맡는 루트에 준다
 * - `meta.label` 이 없는 노드는 빠진다. 키는 식별자라 화면에 내지 않는다
 * - **바로 앞 칸과 주소가 같으면 앞 칸을 남긴다.** index 는 부모의 기본 화면이라 부모 이름이 그 자리 이름이다
 * - `hidden` · `permissions` 는 보지 않는다. 메뉴의 규칙이지 경로의 규칙이 아니다
 * - 쿼리 · 조각(`?page=2#top`)은 보지 않는다. 매칭이 없으면 빈 배열이다
 *
 * 매칭은 react-router 의 `matchRoutes` 에 맡긴다 — 화면에 그려지는 라우트와 늘 같은 노드가 나온다.
 * **부를 때마다 새 배열이다.**
 */
export function getBreadcrumbs(tree: RouteTree, pathname: string, basename?: string): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [];

  for (const match of matchRoutes(routeObjectsOf(tree), pathname, basename) ?? []) {
    const handle = match.route.handle as RouteHandle | undefined;
    const meta = handle?.node.meta;
    if (!handle || meta?.breadcrumb === false || !meta?.label) continue;

    const path = trimTrailingSlash(match.pathname);
    if (crumbs.at(-1)?.path === path) continue;

    crumbs.push({ key: handle.key, path, label: meta.label, meta });
  }

  return crumbs;
}
