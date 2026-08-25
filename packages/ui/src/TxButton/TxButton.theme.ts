import { TxClassBorderColor, TxClassHover, TxClassTheme } from "../TxTheme";

/**
 * `base` 는 **모든 variant 가 공유한다.** variant 별 분기에서 건너뛰지 않는다 —
 * 예전에는 `text` 만 base 를 통과하지 않아서 포커스 링과 disabled 스타일을 잃었다.
 *
 * 그래서 표면을 지우는 variant(`ghost` · `text`)는 **지울 것을 명시적으로 되돌린다.**
 * `dark:` 는 별도 variant 라 `bg-transparent` 하나로는 안 지워진다 — `dark:bg-transparent` 를 같이 준다.
 */
export const TxButtonTheme = {
  base: `${TxClassBorderColor} ${TxClassTheme} p-2 font-medium rounded-md shadow-sm cursor-pointer transition-colors justify-center
         disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none`,
  focus: "focus-visible:ring-2 focus-visible:ring-blue-500",

  /** 의미로 고른다. `theme` 으로 키를 추가하면 `variant="brand"` 처럼 그대로 쓸 수 있다 */
  variants: {
    primary: "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
    ghost: `bg-transparent dark:bg-transparent shadow-none ${TxClassHover}`,
    text: `bg-transparent dark:bg-transparent shadow-none underline underline-offset-4 ${TxClassHover}`
  }
};

/** 기본 5종. `theme` 으로 키를 추가하면 그 이름도 그대로 쓸 수 있다 — `(string & {})` 가 자동완성을 살린 채 열어 둔다 */
export type TxButtonVariant = keyof typeof TxButtonTheme.variants | (string & {});

/**
 * `theme` prop 과 `TxThemeProvider` 가 함께 쓰는 덮어쓰기 타입.
 *
 * `variants` 만 `DeepPartial` 을 쓰지 않는다 — **없던 키를 추가할 수 있어야** 하기 때문이다.
 * 나머지는 기존 키만 바꾸면 되므로 좁게 둔다.
 */
export interface TxButtonThemeOverride {
  base?: string;
  focus?: string;
  variants?: Partial<Record<TxButtonVariant, string>>;
}
