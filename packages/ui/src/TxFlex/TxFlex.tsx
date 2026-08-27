import type { HTMLAttributes } from "react";
import { cm } from "../tx-ui.utils";

// props 를 늘리지 않는다. 방향·정렬은 소비자가 className 이나 CSS 로 정한다 (Q1).
export interface TxFlexProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * 가로로 늘어놓는 자리. `display: flex` 와 **간격 기본값**을 준다. 그게 전부다.
 *
 * - **`className` 은 기본 클래스를 교체하지 않고 덧붙는다.** 방향을 바꿔도 간격이 남는다
 * - 간격은 CSS 변수로 바꾼다 — `.tx-flex { --tx-flex-gap: 1rem }`
 *
 * @example
 * ```tsx
 * <TxFlex>
 *   <TxButton label="취소" variant="ghost" />
 *   <TxButton label="저장" />
 * </TxFlex>
 *
 * <TxFlex className="flex-col">…</TxFlex>   // 방향은 소비자가 정한다
 * ```
 *
 * 화면 골격은 이 컴포넌트가 하지 않는다 → `TxLayout`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxFlex = ({ className, children, ...props }: TxFlexProps) => (
  // 스타일은 TxFlex.css 가 소유한다. 여기서는 기본 클래스만 걸고 className 을 덧붙인다.
  <div {...props} data-tag="TxFlex" className={cm("tx-flex", className)}>
    {children}
  </div>
);
