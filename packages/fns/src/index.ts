/**
 * **루트 진입점 — 함수를 전부 여기서 가져온다.** 함수 이름이 패키지 안에서 겹치지 않게 지었으므로
 * 이름으로 가져와도(`import { formatNumber } …`) 네임스페이스로 받아도(`import * as fns …`) 된다.
 *
 * `sideEffects: false` 라 쓰지 않은 함수는 번들에서 빠진다. `browser/` 의 함수도 여기 있지만
 * 불러오는 것만으로는 `document` 를 건드리지 않는다 — Node 에서 루트를 import 해도 된다
 * (부르면 깨진다). 그룹 진입점(`@txstack/fns/num` 등)도 그대로 둔다.
 */
export * from "./arr";
export * from "./async";
export * from "./browser/cookie";
export * from "./browser/css";
export * from "./browser/file";
export * from "./date";
export * from "./form";
export * from "./math";
export * from "./num";
export * from "./obj";
export * from "./phone-kr";
export * from "./rand";
export * from "./str";
