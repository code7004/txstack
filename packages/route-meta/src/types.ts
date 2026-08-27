import type { ReactNode } from "react";
import type { ActionFunction, LoaderFunction } from "react-router-dom";

/**
 * 라우트 정의 트리. **이 트리가 단일 출처(SSOT)다.**
 *
 * 키는 소비자가 정하는 식별자이고(`users`, `detail` …), 값이 실제 라우트 정의다.
 * `getNavigableRoutes` 는 이 키를 그대로 보존한다.
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
  onClick?: () => void;
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
 * `buildRouteObjects` 가 각 `RouteObject.handle` 에 심는 값.
 *
 * 라우터는 `handle` 을 해석하지 않고 실어 나르기만 한다. 덕분에 `matchRoutes` 결과에서
 * 원본 `RouteNode` 를 되찾을 수 있고, **경로 매칭을 직접 구현하지 않아도 된다.**
 */
export interface RouteHandle {
  node: RouteNode;
}
