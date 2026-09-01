/**
 * `@txstack/ui` — 코어 엔트리.
 *
 * **무거운 선택적 의존을 쓰는 컴포넌트는 서브패스로 분리한다.** 이 배럴을 import 해도
 * `ag-grid-*` / `react-day-picker` 는 로드되지 않으므로, 설치하지 않아도 동작한다.
 *
 * - `@txstack/ui/aggrid`    → TxAgGrid        (peer: ag-grid-community, ag-grid-react)
 * - `@txstack/ui/daypicker` → TxDayPicker 계열 (peer: react-day-picker, dayjs)
 *
 * **default export 를 두지 않는다.** 배럴의 `export *` 는 default 를 실어 나르지 않아서,
 * 파일 경로로 직접 import 하던 습관이 패키지에서는 조용히 깨진다.
 *
 * 스타일은 `@txstack/ui/styles.css` 한 파일이다. 설계: docs/001_ui.md
 */
export * from "./TxAccordion";
export * from "./TxAppShell";
export * from "./TxAlert";
export * from "./TxAvatar";
export * from "./TxBadge";
export * from "./TxBreadcrumb";
export * from "./TxButton";
export * from "./TxCapsLockCheck";
export * from "./TxCard";
export * from "./TxCheckBox";
export * from "./TxCollapsible";
export * from "./TxCombobox";
export * from "./TxCopyButton";
export * from "./TxDialog";
export * from "./TxDivider";
export * from "./TxDropdown";
export * from "./TxEmptyState";
export * from "./TxFlex";
export * from "./TxFileUpload";
export * from "./TxForm";
export * from "./TxGrid";
export * from "./TxInput";
export * from "./TxJsonTree";
export * from "./TxLoading";
export * from "./TxMenu";
export * from "./TxModal";
export * from "./TxNumberInput";
export * from "./TxPagination";
export * from "./TxProgress";
export * from "./TxRadio";
export * from "./TxSlidePanel";
export * from "./TxScrollArea";
export * from "./TxSkeleton";
export * from "./TxSlider";
export * from "./TxSwitch";
export * from "./TxSpinner";
export * from "./TxTabs";
export * from "./TxTag";
export * from "./TxTextarea";
export * from "./TxTicker";
export * from "./TxToast";
export * from "./TxTooltip";
