import { useState, type ButtonHTMLAttributes, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { cm } from "../tx-ui.utils";
import { TxSpinner } from "../TxSpinner";
import { useTxTheme } from "../TxTheme";
import { TxButtonTheme, type TxButtonThemeOverride, type TxButtonVariant } from "./TxButton.theme";

export interface TxButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** 버튼 텍스트. `children` 을 써도 된다 (`label` 이 우선) */
  label?: string;
  /** 의미 기반 스타일. 기본 `"primary"`. `theme` 으로 키를 추가하면 그 이름도 쓸 수 있다 */
  variant?: TxButtonVariant;
  /** 로딩 중 보여줄 엘리먼트. 기본은 장식용 스피너 */
  loading?: ReactElement;
  /** 이 인스턴스만의 부분 테마. 전역은 `TxThemeProvider` 로 준다 */
  theme?: TxButtonThemeOverride;
  /** Promise 를 반환하면 해제될 때까지 자동으로 로딩 상태가 되고 중복 클릭이 막힌다 */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  children?: ReactNode;
}

const isThenable = (value: unknown): value is Promise<unknown> => typeof (value as Promise<unknown> | undefined)?.then === "function";

/**
 * Tailwind 기반 버튼.
 *
 * - `onClick` 이 **Promise 를 반환하면** 해제될 때까지 스피너가 뜨고 버튼이 잠긴다. 연타해도 한 번만 실행된다
 * - 동기 `onClick` 은 로딩 상태로 들어가지 않는다 — 스피너가 깜빡이지 않는다
 * - **`type` 기본값은 `"button"`** 이다. 폼 제출 버튼은 `type="submit"` 을 명시한다
 *
 * @example
 * ```tsx
 * <TxButton label="확인" />
 * <TxButton label="삭제" variant="danger" onClick={async () => { await remove(); }} />
 * <TxButton type="submit" label="제출" />
 * ```
 *
 * 명세: `docs/001_ui/components/02_TxButton.md`
 */
export const TxButton = ({ label, theme, variant = "primary", className, children, loading = <TxSpinner decorative />, disabled, onClick, type = "button", ...props }: TxButtonProps) => {
  const stableTheme = useTxTheme("TxButton", TxButtonTheme, theme);
  const [isLoading, _isLoading] = useState(false);

  // variants 에 없는 이름을 주면 아무 스타일도 안 붙는다. theme 으로 키를 추가한 경우가 그렇고,
  // 그때는 추가한 쪽 문자열이 여기로 들어온다.
  const variantClass = (stableTheme.variants as Record<string, string | undefined>)[variant];

  const hdClick = (evt: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    const result = onClick(evt);

    // 동기 핸들러까지 로딩으로 감싸면 스피너가 한 프레임 깜빡인다. Promise 일 때만 잠근다.
    if (!isThenable(result)) return;

    _isLoading(true);
    void result
      .catch((err: unknown) => {
        // 삼키지 않으면 unhandled rejection 이 되고, 삼키면 소비자가 못 잡는다.
        // 지금은 로그만 남긴다 — 대안(onError prop)은 합의 전이다. 명세 §4 D6 참고.
        console.error(err);
      })
      .finally(() => _isLoading(false));
  };

  return (
    <button data-tag="TxButton" type={type} className={cm(stableTheme.base, stableTheme.focus, variantClass, "relative active:opacity-50", isLoading && "cursor-wait", className)} disabled={disabled || isLoading} onClick={hdClick} {...props}>
      {isLoading && <span className="absolute inset-0 flex items-center justify-center">{loading}</span>}
      <span className={isLoading ? "opacity-30" : undefined}>{label || children}</span>
    </button>
  );
};
