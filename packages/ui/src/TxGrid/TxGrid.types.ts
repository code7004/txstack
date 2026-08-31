import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface TxGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 몇 칸인가. 기본 `2`.
   *
   * **좁아지면 한 칸으로 접힌다** — 칸 하나의 최소 폭(`--tx-grid-min`)보다 좁아지면
   * 브라우저가 알아서 줄인다. 화면 크기를 재거나 미디어 쿼리를 쓰지 않는다.
   */
  columns?: number;

  /** 칸 사이. 기본 `1rem`. 세로·가로를 따로 주려면 CSS 변수를 쓴다. */
  gap?: CSSProperties["gap"];

  children?: ReactNode;
}

export interface TxGridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** 몇 칸을 차지할지. `"full"` 이면 한 줄을 통째로 쓴다. 기본 `1`. */
  span?: number | "full";

  children?: ReactNode;
}
