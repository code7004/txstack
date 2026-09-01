import type { ReactNode } from "react";
import type { ActionFunction, LoaderFunction } from "react-router-dom";

/**
 * 라우트 정의 트리. **이 트리가 단일 출처(SSOT)다.**
 *
 * 키는 소비자가 정하는 식별자이고(`users`, `detail` …), 값이 실제 라우트 정의다.
 * `getNavigableRoutes` 는 이 키를 그대로 보존한다.
 *
 * **선언할 때는 `satisfies` 로 붙인다.**
 *
 * ```ts
 * export const routes = {
 *   main: { path: "/", children: { sub1: { path: "/sub1" } } }
 * } satisfies RouteTree;
 *
 * routes.main.children.sub1.path; // "/sub1" — 에디터가 키까지 짚어 준다
 * ```
 *
 * 타입 주석(`const routes: RouteTree = …`)으로 붙이면 **키가 `string` 으로 넓어져**
 * `routes.main` 부터 자동완성이 죽는다. `satisfies` 는 검사만 하고 리터럴 형태를 남긴다.
 */
export type RouteTree = Record<string, RouteNode>;

/**
 * UI · 접근 제어와 관련된 확장 정보. **실행 계층(React Router)으로 전달되지 않는다.**
 */
export interface RouteMeta {
  label?: string;
  icon?: ReactNode;
  description?: string;
  /** 메뉴 생성에서 제외한다. **라우터에는 그대로 등록된다** — 주소로 직접 접근은 돼야 하기 때문이다. */
  hidden?: boolean;
  /** 접근 권한. 판정은 `getNavigableRoutes` 의 `canAccess` 가 한다. */
  permissions?: string[];
}

interface RouteNodeBase {
  element?: ReactNode;
  loader?: LoaderFunction;
  action?: ActionFunction;
  errorElement?: ReactNode;

  meta?: RouteMeta;
  /** `false` 면 라우터에도 메뉴에도 등록되지 않는다. 기본 `true`. */
  enabled?: boolean;
}

/**
 * 경로를 가진 라우트.
 *
 * **`path` 는 필수다.** 경로 없는 노드가 생기면 메뉴·브레드크럼 생성이 특수 케이스투성이가 된다.
 * 자동화 계층의 일관성을 위해 절대경로로 쓴다.
 */
export interface PathRouteNode extends RouteNodeBase {
  index?: false;
  path: string;
  children?: RouteTree;
}

/**
 * 부모 경로에 붙는 기본 화면(index route).
 *
 * **`path` 와 `children` 을 가질 수 없다.** React Router 는 index route 에 `path` 가 있으면
 * 런타임 에러를 낸다. 타입으로 막아 둔다.
 */
export interface IndexRouteNode extends RouteNodeBase {
  index: true;
  path?: never;
  children?: never;
}

export type RouteNode = PathRouteNode | IndexRouteNode;

/**
 * 메뉴 한 칸. `getNavigableRoutes` 가 주는 형태다.
 *
 * **`RouteNode` 를 그대로 흘리지 않는다.** 메뉴를 그리는 자리에 `element` · `loader` 같은
 * 실행 계층이 섞여 들어오고, 최상위는 배열인데 자식은 키 있는 객체라 재귀가 두 형태를
 * 다뤄야 했다. 여기서는 **위아래가 같은 형태**다 — 자식도 `NavRoute[]`.
 *
 * ```tsx
 * const menu = getNavigableRoutes(routes, canAccess);
 *
 * menu.map((item) => <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} as={NavLink} to={item.path} />);
 * ```
 */
export interface NavRoute {
  /** 트리에 쓴 키 그대로. `React` 의 `key` 로도 쓰고, 트리를 되짚을 때도 쓴다. */
  key: string;
  /** 갈 주소. **index route 는 메뉴에 오르지 않으므로 언제나 있다.** */
  path: string;
  meta?: RouteMeta;
  /** 살아남은 자식. **하나도 없으면 필드가 없다** — 있으면 펼치는 항목이 된다. */
  children?: NavRoute[];
}

/**
 * `buildRouteObjects` 가 각 `RouteObject.handle` 에 심는 값.
 *
 * 라우터는 `handle` 을 해석하지 않고 실어 나르기만 한다. 덕분에 `matchRoutes` 결과에서
 * 원본 `RouteNode` 를 되찾을 수 있고, **경로 매칭을 직접 구현하지 않아도 된다.**
 */
export interface RouteHandle {
  node: RouteNode;
}
