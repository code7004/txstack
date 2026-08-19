import { TxClassBorder, TxClassFocus } from "../TxTheme";

export const TxTextareaTheme = {
  wrapper: `w-full min-h-24 flex rounded-md shadow-sm ${TxClassBorder} `,
  focus: `${TxClassFocus}`,
  textarea: `w-full min-h-full resize-y border-0 outline-0 px-3 py-2 bg-transparent text-base text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-0 disabled:opacity-50`,
  readOnly: `opacity-50`
};
