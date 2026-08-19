import { TxClassBase, TxClassBorder, TxClassFocus } from "../TxTheme";

// ------------------- Input -------------------
export const TxInputTheme = {
  wrapper: `h-10 flex items-center rounded-md shadow-sm ${TxClassBorder} ${TxClassBase}`,
  focus: `${TxClassFocus}`,
  input: `w-full border-0 outline-0 px-3 bg-transparent text-base placeholder-gray-400 focus:outline-none focus:ring-0 disabled:opacity-50`,
  readOnly: `opacity-50`,
  number: `text-end pr-4`,
  file: `cursor-pointer px-2 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-500 file:px-2 file:py-1 file:font-bold file:text-white hover:file:bg-blue-700`
};

export const TxSearchInputTheme = {
  wrapper: `flex px-3 ${TxInputTheme.wrapper}`,
  focus: `${TxClassFocus}`,
  icon: "w-5 h-5 text-gray-400 cursor-pointer"
};
