import { TxIconClose } from "../TxIcons";
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
 *
 * <TxTag variant="info" onRemove={() => drop("서울")}>서울</TxTag>
 * <TxTag onClick={() => filter("vip")}>VIP</TxTag>
 * ```
 *
 * 갈래는 **`TxAlert` · `TxToast` 와 같은 어휘**에 `neutral` 하나가 더 있다.
 *
 * **`onClick` 을 주면 글자가 눌리고, `onRemove` 를 주면 지우기(×)가 붙는다.**
 * 둘 다 안 주면 읽기만 하는 이름표다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-tag { --tx-tag-radius: 0.25rem }`.
 *
 * 명세: `docs/001_ui/029_TxTag.md`
 */
export const TxTag = ({ variant = "neutral", appearance = "soft", dot = false, onClick, onRemove, removeLabel = "지우기", className, children, ...props }: TxTagProps) => (
  <span {...props} data-tag="TxTag" data-variant={variant} data-appearance={appearance} data-interactive={onClick ? "" : undefined} className={cm("tx-tag", className)}>
    {/* 점은 갈래를 거드는 표시라 글자가 뜻을 나른다. 스크린리더에는 읽히지 않는다 */}
    {dot && <span className="tx-tag__dot" aria-hidden />}

    {/*
      **글자만 버튼이 된다.** 지우기도 버튼이라, 태그 전체를 버튼으로 감싸면
      `<button>` 안의 `<button>` 이 되어 못 쓰는 마크업이 나온다.
    */}
    {onClick ? (
      <button type="button" className="tx-tag__body" onClick={onClick}>
        {children}
      </button>
    ) : (
      <span className="tx-tag__body">{children}</span>
    )}

    {onRemove && (
      <button type="button" className="tx-tag__remove" aria-label={removeLabel} onClick={onRemove}>
        <TxIconClose />
      </button>
    )}
  </span>
);
