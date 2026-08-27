import { useMemo } from "react";
import { useRoutes } from "react-router-dom";
import type { RouteTree } from "./types";
import { buildRouteObjects } from "./utils";

/**
 * `RouteTree` 를 React Router 에 연결한다. `useRoutes(buildRouteObjects(tree))` 의 얇은 포장이다.
 *
 * ```tsx
 * <RouteRenderer data={routes} />
 * ```
 *
 * 직접 쓰고 싶다면 `useRoutes(buildRouteObjects(routes))` 를 그대로 불러도 된다.
 *
 * `data` 가 그대로면 변환을 다시 하지 않는다. **트리는 모듈 상수로 둔다** —
 * 인라인으로 만들면 매 렌더 전체 트리를 다시 변환한다.
 */
export function RouteRenderer({ data }: { data: RouteTree }) {
  const routes = useMemo(() => buildRouteObjects(data), [data]);
  return useRoutes(routes);
}
