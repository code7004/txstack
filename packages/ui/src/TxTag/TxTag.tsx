import { cm } from "../tx-ui.utils";
import type { TxTagProps } from "./TxTag.types";

/**
 * 작은 이름표. 상태 · 개수 · 분류를 한 낱말로 붙인다.
 *
 * @example
 * ```tsx
 * <TxTag>초안</TxTag>
 * <TxTag variant="success">완료</TxTag>
 * <TxTag variant="warning" dot>대기</TxTag>
 * <TxTag variant="danger" appearance="outline">실패</TxTag>
 * ```
 *
 * 갈래는 **`TxAlert` · `TxToast` 와 같은 어휘**에 `neutral` 하나가 더 있다.
 *
 * **누르는 것이 아니다.** 태그는 읽는 것만 한다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-tag { --tx-tag-radius: 0.25rem }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxTag = ({ variant = "neutral", appearance = "soft", dot = false, className, children, ...props }: TxTagProps) => (
  <span {...props} data-tag="TxTag" data-variant={variant} data-appearance={appearance} className={cm("tx-tag", className)}>
    {/* 점은 갈래를 거드는 표시라 글자가 뜻을 나른다. 스크린리더에는 읽히지 않는다 */}
    {dot && <span className="tx-tag__dot" aria-hidden />}
    {children}
  </span>
);
