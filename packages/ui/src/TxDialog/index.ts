/**
 * `TxDialogHost` 와 줄 세우기(store)는 내부 부품이라 내보내지 않는다.
 * 소비자가 닿는 것은 `TxDialog` 하나다.
 */
export { TxDialog } from "./TxDialog";

export type { TxDialogConfig, TxDialogInput, TxDialogLabels, TxDialogOptions } from "./TxDialog.types";
