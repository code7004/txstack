/**
 * @txstack/ui — 코어 엔트리.
 *
 * 무거운 선택적 의존을 쓰는 컴포넌트는 서브패스로 분리되어 있다. 이 배럴을 import 해도
 * `ag-grid-*` / `react-day-picker` 는 로드되지 않으므로, 설치하지 않아도 동작한다.
 *
 * - `@txstack/ui/aggrid`    → TxAgGrid        (peer: ag-grid-community, ag-grid-react)
 * - `@txstack/ui/daypicker` → TxDayPicker 계열 (peer: react-day-picker, dayjs)
 */
export * from "./TxButton";
export * from "./TxCapsLockCheck";
export * from "./TxCard";
export * from "./TxCheckBox";
export * from "./TxClipboardButton";
export * from "./TxContextMenu";
export * from "./TxCoolTable";
export * from "./TxDropdown";
export * from "./TxDropMenu";
export * from "./TxFlex";
export * from "./TxForm";
export * from "./TxHeader";
export * from "./TxIcons";
export * from "./TxInput";
export * from "./TxJsonTree";
export * from "./TxLayout";
export * from "./TxLoading";
export * from "./TxModal";
export * from "./TxSpinner";
export * from "./TxSlidePanel";
export * from "./TxTabs";
export * from "./TxTextarea";
export * from "./TxTheme";
export * from "./TxToolTip";

export * from "./tx-ui.utils";

/**
 * default export 만 있는 컴포넌트들.
 *
 * 원본에서는 소비자가 `@/core/tx-ui/TxSpinner` 처럼 파일 경로로 직접 import 했기 때문에
 * 배럴의 `export *` 가 default 를 실어 나르지 않는다는 점이 드러나지 않았다.
 * 패키지에서는 배럴이 유일한 진입점이므로 이름을 붙여 다시 내보낸다.
 */
export { default as TxClipboardButton } from "./TxClipboardButton";
export { default as TxInputLike } from "./TxInput/TxInputLike";
export { default as TxSpinner } from "./TxSpinner";
