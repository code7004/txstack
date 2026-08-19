import { TxClassBase, TxClassBorder, TxClassBorderColor, TxClassHover } from "../TxTheme";

export const TxContextMenuTheme = {
  wrapper: `fixed z-50 flex w-60 flex-col overflow-hidden rounded-md shadow-lg ${TxClassBorder} ${TxClassBase}`,
  item: `px-4 py-2 text-sm font-bold cursor-pointer ${TxClassHover}`,
  disabledItem: "cursor-not-allowed opacity-50",
  divider: `my-1 border-t ${TxClassBorderColor}`
};
