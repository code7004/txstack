/**
 * `@txstack/ui/aggrid` — ag-grid 를 필요로 하는 컴포넌트.
 *
 * `ag-grid-community` / `ag-grid-react` 는 **optional peerDependency** 다.
 * 이 서브패스를 import 하는 소비자만 설치하면 된다.
 *
 * **모듈 등록은 소비 앱이 한다.** 라이브러리가 대신 하면 필요한 모듈만 고르거나
 * enterprise 모듈을 쓰는 선택지를 뺏는다.
 *
 * ```tsx
 * import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
 * ModuleRegistry.registerModules([AllCommunityModule]);
 * ```
 *
 * 쪽 번호(`TxPagination`)는 여기 없다 — 그리드와 무관해서 **루트 배럴**이 갖는다.
 *
 * **루트 배럴(`src/index.ts`)에서 이 파일을 참조하지 않는다.** 참조하는 순간 분리가 무너진다.
 */

export { TxAgGrid, TxAgGridProvider } from "./TxAgGrid";

export type { TxAgGridColumn, TxAgGridColumnDef, TxAgGridColumnFilter, TxAgGridField, TxAgGridOption, TxAgGridPagination, TxAgGridProps, TxAgGridProviderProps, TxAgGridSort, TxAgGridSortValue } from "./TxAgGrid";
