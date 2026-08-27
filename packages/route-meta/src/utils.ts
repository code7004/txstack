import type { RouteObject } from "react-router-dom";
import type { RouteNode, RouteTree } from "./types";

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
 * - 각 `RouteObject.handle` 에 원본 노드를 심는다. `useCurrentRouteNode` 가 이걸로 되찾는다.
 */
export function buildRouteObjects(tree: RouteTree): RouteObject[] {
  return Object.values(tree)
    .filter((node) => node.enabled !== false)
    .map(transformNode);
}

function transformNode(node: RouteNode): RouteObject {
  const { element, loader, action, errorElement } = node;
  const handle = { node };

  // index route 는 path·children 을 가질 수 없다. 타입으로 막혀 있지만 여기서도 넣지 않는다.
  if (node.index) return { index: true, element, loader, action, errorElement, handle };

  const children = node.children
    ? Object.values(node.children)
        .filter((child) => child.enabled !== false)
        .map(transformNode)
    : undefined;

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
 * GNB · 사이드 메뉴용 노드 목록을 만든다. **실행 계층과 필터 규칙이 다르다.**
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
 * @example
 * const menu = getNavigableRoutes(routes, (perms) => perms.some((p) => user.roles.includes(p)));
 *
 * @example 권한 판정 없이 — permissions 가 걸린 노드는 전부 빠진다
 * const publicMenu = getNavigableRoutes(routes);
 */
export function getNavigableRoutes(tree: RouteTree, canAccess: CanAccess = DENY_RESTRICTED): RouteNode[] {
  return filterEntries(tree, canAccess).map(([, node]) => node);
}

/**
 * 원본 트리의 **키를 보존하면서** 필터링한다.
 *
 * 원본은 살아남은 자식을 `path` 를 키로 다시 묶어 `detail` 같은 식별자가 `/users/:id` 로
 * 바뀌었다. 소비자가 키로 접근하고 있었다면 조용히 깨진다.
 */
function filterEntries(tree: RouteTree, canAccess: CanAccess): [string, RouteNode][] {
  return Object.entries(tree).flatMap<[string, RouteNode]>(([key, node]) => {
    // index route 는 경로가 없어 메뉴 항목이 될 수 없다.
    if (node.index) return [];
    if (node.enabled === false) return [];
    if (node.meta?.hidden) return [];

    const permissions = node.meta?.permissions;
    if (permissions?.length && !canAccess(permissions, node)) return [];

    if (!node.children) return [[key, node]];

    const childEntries = filterEntries(node.children, canAccess);

    // 자식이 전부 걸러졌으면 children 을 지운다.
    // 원본은 `{ ...node }` 로 퍼뜨려 **걸러낸 자식이 그대로 남았다.**
    if (childEntries.length === 0) {
      const { children: _dropped, ...rest } = node;
      return [[key, rest]];
    }

    return [[key, { ...node, children: Object.fromEntries(childEntries) }]];
  });
}
