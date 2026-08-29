/**
 * `TxMenuShell` 은 두 메뉴가 함께 쓰는 속이라 내보내지 않는다.
 * 항목과 구분선은 `TxDropMenu.Item` · `TxContextMenu.Item` 으로 닿는다 — **같은 부품이다.**
 */
export { TxContextMenu } from "./TxContextMenu";
export { TxDropMenu } from "./TxDropMenu";

export type { TxContextMenuProps, TxDropMenuProps, TxMenuDividerProps, TxMenuItemProps } from "./TxMenu.types";
