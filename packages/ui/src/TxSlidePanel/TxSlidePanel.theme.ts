import { TxClassBase, TxClassBorder } from "../TxTheme";

export const TxSlidePanelTheme = {
  root: "fixed inset-0 z-50 flex",
  overlay: "absolute inset-0 bg-black/35",
  panel: `relative z-10 flex flex-col shadow-2xl ${TxClassBase} ${TxClassBorder}`,
  positions: {
    left: "h-screen self-start border-r",
    right: "ml-auto h-screen self-start border-l",
    top: "w-screen self-start border-b",
    bottom: "mt-auto w-screen self-end border-t"
  },
  header: "flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700",
  title: "flex-1 text-sm font-semibold",
  closeButton: "cursor-pointer text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
  body: "flex-1 overflow-auto"
};
