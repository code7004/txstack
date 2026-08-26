import { TxClassBase, TxClassBorderColor } from "../TxTheme";

export const TxModalTheme = {
  overlay: "absolute inset-0 bg-black/40",
  container: `relative rounded-2xl shadow-lg overflow-hidden mx-2 sm:mx-4 ${TxClassBase} border-2 ${TxClassBorderColor}`,
  header: `flex p-2 font-bold text-center border-b ${TxClassBase} ${TxClassBorderColor}`,
  body: `flex flex-col items-center justify-center p-6 ${TxClassBase}`
};
