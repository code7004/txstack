import type { CSSProperties } from "react";
import { cm } from "../tx-ui.utils";
import type { TxGridItemProps } from "./TxGrid.types";

/**
 * 여러 칸을 차지하는 자리.
 *
 * @example
 * ```tsx
 * <TxGrid columns={2}>
 *   <TxForm.Input caption="이름" />
 *   <TxForm.Input caption="전화" />
 *   <TxGrid.Item span="full">
 *     <TxForm.Textarea caption="메모" />
 *   </TxGrid.Item>
 * </TxGrid>
 * ```
 *
 * **한 칸짜리는 이걸 쓰지 않는다** — 그냥 자식으로 두면 된다.
 */
export const TxGridItem = ({ span = 1, className, style, ...props }: TxGridItemProps) => (
  <div
    {...props}
    data-tag="TxGrid.Item"
    className={cm("tx-grid__item", className)}
    // 접혀서 칸이 줄었을 때 `span 2` 가 남아 있으면 넘쳐서 깨진다. `min()` 이 그것을 막는다
    style={{ gridColumn: span === "full" ? "1 / -1" : `span min(${span}, var(--tx-grid-columns))`, ...style } as CSSProperties}
  />
);
