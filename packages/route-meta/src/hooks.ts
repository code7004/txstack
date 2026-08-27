import { useMemo } from "react";
import { matchRoutes, useLocation, type Params } from "react-router-dom";
import type { RouteHandle, RouteMeta, RouteNode, RouteTree } from "./types";
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
 * const { node, meta, matches } = useCurrentRouteNode(routes);
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
export function useCurrentRouteNode(tree: RouteTree): CurrentRoute {
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
