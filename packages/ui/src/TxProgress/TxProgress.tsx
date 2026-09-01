import { cm } from "../tx-ui.utils";
import type { TxProgressProps } from "./TxProgress.types";

/**
 * 얼마나 왔는지 보여 주는 막대.
 *
 * @example
 * ```tsx
 * <TxProgress value={72} label="업로드" />
 * <TxProgress value={3} max={5} variant="success" showValue />
 * ```
 *
 * **얼마나 왔는지 아는 것만 그린다.** 끝이 언제인지 모르는 기다림은 `TxLoading` ·
 * `TxSpinner` 가 맡는다 — 진행률을 모르는데 막대를 그리면 **어디까지 왔는지 아는 척**이 된다.
 *
 * 갈래는 `TxAlert` · `TxToast` · `TxTag` 와 같은 어휘다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-progress { --tx-progress-height: 0.5rem }`.
 *
 * 명세: `docs/001_ui/036_TxProgress.md`
 */
export const TxProgress = ({ value, max = 100, variant = "info", label, showValue = false, className, classNames, ...props }: TxProgressProps) => {
  // 끝값이 0 이하면 비율을 낼 수 없다. 0% 로 두고 화면이 깨지지 않게 한다
  const safeMax = max > 0 ? max : 0;
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const ratio = safeMax > 0 ? safeValue / safeMax : 0;

  const text = typeof showValue === "function" ? showValue(safeValue, safeMax) : `${Math.round(ratio * 100)}%`;

  return (
    <div {...props} data-tag="TxProgress" data-variant={variant} className={cm("tx-progress", className)}>
      {/*
        `<progress>` 를 쓰지 않는다. 브라우저마다 겉모습을 바꾸는 길이 달라서
        토큰 하나로 맞출 수가 없다 — 값은 role 과 aria-value* 로 그대로 전한다.
      */}
      <div
        className={cm("tx-progress__track", classNames?.track)}
        role="progressbar"
        aria-label={label}
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        // 퍼센트가 아니라 "3/5" 처럼 읽어야 할 때가 있다
        aria-valuetext={typeof showValue === "function" ? String(text) : undefined}
      >
        <div className={cm("tx-progress__bar", classNames?.bar)} style={{ inlineSize: `${ratio * 100}%` }} />
      </div>

      {/* 막대가 이미 값을 알리므로 이 글자는 눈으로 보는 사람 몫이다 */}
      {showValue !== false && (
        <span className={cm("tx-progress__value", classNames?.value)} aria-hidden>
          {text}
        </span>
      )}
    </div>
  );
};
