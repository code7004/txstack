import { useState, type ButtonHTMLAttributes, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { cm } from "../tx-ui.utils";
import { TxSpinner } from "../TxSpinner";

/** 기본 5종. 소비자가 CSS 로 늘릴 수 있게 열려 있다 — `(string & {})` 가 자동완성을 살린 채 임의 문자열도 받는다 */
export type TxButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "text" | (string & {});

export interface TxButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** 버튼 텍스트. `children` 을 써도 된다 (`label` 이 우선) */
  label?: string;
  /** 의미 기반 스타일. 기본 `"primary"`. `data-variant` 로 나가므로 CSS 에서 새 이름을 늘릴 수 있다 */
  variant?: TxButtonVariant;
  /** 로딩 중 보여줄 엘리먼트. 기본은 장식용 스피너 */
  loading?: ReactElement;
  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다 */
  classNames?: { label?: string };
  /** Promise 를 반환하면 해제될 때까지 자동으로 로딩 상태가 되고 중복 클릭이 막힌다 */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  children?: ReactNode;
}

const isThenable = (value: unknown): value is Promise<unknown> => typeof (value as Promise<unknown> | undefined)?.then === "function";

/**
 * 누르면 뭔가 일어나는 자리.
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
 * 색·반경은 CSS 변수로 바꾼다 — 앱 전체는 `:root { --tx-color-primary: … }`,
 * 이 컴포넌트만은 `.tx-button { --tx-button-bg: … }`.
 *
 * 명세: `docs/001_ui/components/02_TxButton.md`
 */
export const TxButton = ({ label, variant = "primary", className, classNames, children, loading = <TxSpinner decorative />, disabled, onClick, type = "button", ...props }: TxButtonProps) => {
  const [isLoading, _isLoading] = useState(false);

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
    <button
      // 통과 props 를 먼저 편다. 아래 계약 속성(data-*·type·disabled)은 덮이면 안 된다 —
      // 특히 data-loading 이 밖에서 뒤집히면 화면과 실제 상태가 어긋난다.
      {...props}
      data-tag="TxButton"
      data-variant={variant}
      // 값 없는 불리언 속성. CSS 는 `[data-loading]` 으로 잡는다 (20_design §3)
      data-loading={isLoading ? "" : undefined}
      type={type}
      // 스타일은 TxButton.css 가 소유한다. 여기서는 기본 클래스만 걸고 className 을 덧붙인다.
      className={cm("tx-button", className)}
      disabled={disabled || isLoading}
      onClick={hdClick}
    >
      {isLoading && <span className="tx-button__loading">{loading}</span>}
      <span className={cm("tx-button__label", classNames?.label)}>{label || children}</span>
    </button>
  );
};
