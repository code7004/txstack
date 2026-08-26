import { TxClassBase, TxClassBorderColor } from "../TxTheme";

export * from "./TxToolTip";

export const TxTooltipTheme = {
  base: `fixed z-50 px-2 py-1 text-sm rounded shadow-md z-[9999] pointer-events-auto 
         whitespace-pre-line break-words ${TxClassBase} border ${TxClassBorderColor}`
};
