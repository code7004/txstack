import type { RouteTree } from "@txstack/route-meta";
import { Shell } from "./Shell";
import { MenuRoutes } from "./menu";

/**
 * playground 의 라우트 정의이자 `@txstack/route-meta` 의 사용 예제.
 *
 * 이 트리 하나에서 라우터(`RouteRenderer`)와 좌측 메뉴(`getNavigableRoutes`)가 모두 파생된다.
 * 메뉴 라벨·설명은 `meta` 에 있고, 실행 계층으로는 전달되지 않는다.
 *
 * 페이지 목록은 `menu.tsx` 에 따로 두었다. Shell 이 메뉴를 그리려면 그 목록을 읽어야 하는데,
 * 한 파일에 합치면 `routes ↔ Shell` 순환 import 가 된다.
 */
export const RouteData: RouteTree = {
  root: {
    path: "/",
    element: <Shell />,
    meta: { hidden: true },
    children: MenuRoutes
  }
};
