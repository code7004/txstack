import { cm } from "../tx-ui.utils";
import type { TxBadgeProps } from "./TxBadge.types";

/**
 * 작은 이름표. 상태 · 개수 · 분류를 한 낱말로 붙인다.
 *
 * @example
 * ```tsx
 * <TxBadge>초안</TxBadge>
 * <TxBadge variant="success">완료</TxBadge>
 * <TxBadge variant="warning" dot>대기</TxBadge>
 * <TxBadge variant="danger" appearance="outline">실패</TxBadge>
 * ```
 *
 * 갈래는 **`TxAlert` · `TxToast` 와 같은 어휘**에 `neutral` 하나가 더 있다.
 *
 * **누르는 것이 아니다.** 지우거나 고를 수 있는 이름표가 필요하면 그건 다른 물건이다 —
 * 뱃지는 읽는 것만 한다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-badge { --tx-badge-radius: 0.25rem }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxBadge = ({ variant = "neutral", appearance = "soft", dot = false, className, children, ...props }: TxBadgeProps) => (
  <span {...props} data-tag="TxBadge" data-variant={variant} data-appearance={appearance} className={cm("tx-badge", className)}>
    {/* 점은 갈래를 거드는 표시라 글자가 뜻을 나른다. 스크린리더에는 읽히지 않는다 */}
    {dot && <span className="tx-badge__dot" aria-hidden />}
    {children}
  </span>
);
