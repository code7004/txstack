import { useMemo } from "react";
import { matchRoutes, useLocation, type Params } from "react-router-dom";
import type { Breadcrumb, RouteHandle, RouteMeta, RouteNode, RouteTree } from "./types";
import { buildRouteObjects } from "./utils";

export interface CurrentRoute {
  /** 현재 주소에 매칭된 노드. 매칭이 없으면 `null`. */
  node: RouteNode | null;
  /** `node?.meta` 바로가기. 타이틀·아이콘을 꺼낼 때 쓴다. */
  meta: RouteMeta | undefined;
  /** 루트부터 현재까지의 매칭 사슬. **브레드크럼은 이걸로 만든다.** */
  matches: RouteNode[];
  params: Readonly<Params<string>>;
  pathname: string;
}

const EMPTY_RESULT: CurrentRoute = { node: null, meta: undefined, matches: [], params: {}, pathname: "" };

/**
 * 현재 주소에 해당하는 `RouteNode` 를 찾는다. 타이틀 · 브레드크럼 · 현재 메뉴 표시에 쓴다.
 *
 * ```tsx
 * const { node, meta, matches } = useCurrentRoute(routes);
 *
 * document.title = meta?.label ?? "";
 * const crumbs = matches.map((n) => n.meta?.label).filter(Boolean);
 * ```
 *
 * ## 매칭을 직접 하지 않는다
 *
 * React Router 의 `matchRoutes` 에 위임하고, `handle` 에 심어 둔 원본 노드를 되찾는다.
 * **화면에 렌더된 라우트와 항상 같은 노드가 나온다.**
 *
 * 원본은 자체 정규식으로 매칭해서 라우터와 결과가 갈릴 수 있었다 — 순회 순서에 의존해
 * `/users/:id` 가 `/users/new` 를 가로챘고, 자식 탐색이 실패하면 그 depth 의 `*` 노드가
 * 무조건 잡혔다.
 *
 * ## 반환값 identity
 *
 * `tree` 와 주소가 그대로면 **같은 객체를 돌려준다.** `useEffect` 의존성에 넣어도 된다.
 * 그러려면 `tree` 가 안정적이어야 하므로 **모듈 상수로 둔다** (인라인으로 만들지 않는다).
 */
export function useCurrentRoute(tree: RouteTree): CurrentRoute {
  const location = useLocation();
  const routes = useMemo(() => buildRouteObjects(tree), [tree]);

  return useMemo(() => {
    const matched = matchRoutes(routes, location);
    if (!matched || matched.length === 0) return { ...EMPTY_RESULT, pathname: location.pathname };

    const nodes = matched.map((match) => (match.route.handle as RouteHandle | undefined)?.node).filter((node): node is RouteNode => Boolean(node));

    const leaf = matched[matched.length - 1];

    return {
      node: nodes[nodes.length - 1] ?? null,
      meta: nodes[nodes.length - 1]?.meta,
      matches: nodes,
      params: leaf.params,
      pathname: location.pathname
    };
  }, [routes, location]);
}

/** 끝 `/` 를 뗀다. `matchRoutes` 는 index · 부모와 같은 경로의 자식에 `/user/` 를 준다. 루트 `/` 는 그대로 둔다. */
const trimTrailingSlash = (path: string) => (path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path);

/**
 * 지금 주소까지 온 길을 칸 목록으로 준다. **그리지 않는다** — `TxBreadcrumb` 의 `items` 에 넘긴다.
 *
 * ```tsx
 * <TxBreadcrumb items={useBreadcrumbs(routes)} itemAs={NavLink} />
 * ```
 *
 * - `meta.breadcrumb: false` 인 노드는 빠진다(아래 칸은 남는다). 레이아웃만 맡는 루트에 준다
 * - `meta.label` 이 없는 노드는 빠진다. 키는 식별자라 화면에 내지 않는다
 * - **바로 앞 칸과 주소가 같으면 앞 칸을 남긴다.** index 는 부모의 기본 화면이라 부모 이름이 그 자리 이름이다
 * - `hidden` · `permissions` 는 보지 않는다. 메뉴의 규칙이지 경로의 규칙이 아니다
 *
 * 매칭은 `useCurrentRoute` 와 같이 `matchRoutes` 에 맡긴다. `tree` 와 주소가 그대로면 같은 배열을 돌려준다.
 */
export function useBreadcrumbs(tree: RouteTree): Breadcrumb[] {
  const location = useLocation();
  const routes = useMemo(() => buildRouteObjects(tree), [tree]);

  return useMemo(() => {
    const crumbs: Breadcrumb[] = [];

    for (const match of matchRoutes(routes, location) ?? []) {
      const handle = match.route.handle as RouteHandle | undefined;
      const meta = handle?.node.meta;
      if (!handle || meta?.breadcrumb === false || !meta?.label) continue;

      const path = trimTrailingSlash(match.pathname);
      if (crumbs.at(-1)?.path === path) continue;

      crumbs.push({ key: handle.key, path, label: meta.label, meta });
    }

    return crumbs;
  }, [routes, location]);
}
