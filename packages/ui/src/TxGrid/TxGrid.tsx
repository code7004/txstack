import type { CSSProperties } from "react";
import { cm } from "../tx-ui.utils";
import type { TxGridProps } from "./TxGrid.types";
import { TxGridItem } from "./TxGridItem";

/**
 * 칸을 나눠 담는 자리. 폼을 2단·3단으로 앉힐 때 쓴다.
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
 * **좁아지면 알아서 한 칸으로 접힌다.** 칸 하나가 `--tx-grid-min`(기본 `14rem`)보다
 * 좁아질 상황이면 브라우저가 칸 수를 줄인다 — **화면 크기를 재거나 미디어 쿼리를 쓰지 않으므로**
 * 컴포넌트가 놓인 자리의 폭에 반응한다. 사이드바 안에 넣어도 맞는다.
 *
 * 한 줄로만 늘어놓을 것이면 `TxFlex` 다. 이쪽은 **칸이 맞아떨어져야 할 때**다.
 *
 * 명세: `docs/001_ui/035_TxGrid.md`
 */
export const TxGridBase = ({ columns = 2, gap, className, style, ...props }: TxGridProps) => (
  <div
    {...props}
    data-tag="TxGrid"
    className={cm("tx-grid", className)}
    style={{ "--tx-grid-columns": columns, gap, ...style } as CSSProperties}
  />
);

export const TxGrid = Object.assign(TxGridBase, { Item: TxGridItem });
