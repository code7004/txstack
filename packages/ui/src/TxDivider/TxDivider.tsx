import { cm } from "../tx-ui.utils";
import type { TxDividerProps } from "./TxDivider.types";

/**
 * 가르는 선.
 *
 * @example
 * ```tsx
 * <TxDivider />
 * <TxDivider orientation="vertical" />
 * <TxDivider>또는</TxDivider>
 * ```
 *
 * **글자가 없으면 네이티브 `<hr>` 하나다.** 브라우저가 이미 "가르는 것" 으로 읽어 주므로
 * `role` 을 손으로 달 이유가 없다. 글자를 주면 그 글자가 내용이 되고 **선은 장식이 되어**
 * 좌우(또는 위아래)로 갈라진다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-divider { --tx-divider-spacing: 2rem }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxDivider = ({ orientation = "horizontal", className, children, ...props }: TxDividerProps) => {
  // 글자가 없으면 <hr> 로 끝난다. void 요소라 자식을 담지 못하므로 있을 때만 갈린다
  if (children == null) {
    return <hr {...props} data-tag="TxDivider" data-orientation={orientation} className={cm("tx-divider", className)} aria-orientation={orientation === "vertical" ? "vertical" : undefined} />;
  }

  return (
    <div {...props} data-tag="TxDivider" data-orientation={orientation} data-labeled className={cm("tx-divider", className)}>
      {/* 선은 `::before` · `::after` 가 그린다 — 장식이라 읽히지 않아야 한다 */}
      <span className="tx-divider__label">{children}</span>
    </div>
  );
};
