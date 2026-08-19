/**
 * @txstack/ui/aggrid — ag-grid 기반 데이터 그리드.
 *
 * `ag-grid-community` 와 `ag-grid-react` 를 optional peerDependency 로 요구한다.
 * 코어 엔트리(`@txstack/ui`)와 분리된 이유는, 그리드를 쓰지 않는 소비자에게
 * 1MB 가까운 ag-grid 설치를 강요하지 않기 위해서다.
 *
 * ```sh
 * pnpm add @txstack/ui ag-grid-community ag-grid-react
 * ```
 */
export * from "./TxAgGrid";
export { default as TxAgGrid } from "./TxAgGrid/TxAgGrid";
