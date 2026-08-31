import type { HTMLAttributes, ReactNode } from "react";

/** 어느 쪽으로 그은 선인가. */
export type TxDividerOrientation = "horizontal" | "vertical";

export interface TxDividerProps extends HTMLAttributes<HTMLElement> {
  /** 기본 `"horizontal"`. 세로로 그으면 놓인 자리의 높이만큼 늘어난다. */
  orientation?: TxDividerOrientation;

  /**
   * 선 가운데에 놓을 글자. **주면 선이 글자를 비켜 간다.**
   *
   * `또는` · `여기까지 읽었습니다` 처럼 **선이 나누는 이유를 말해 줄 때** 쓴다.
   * 안 주면 네이티브 `<hr>` 하나로 끝난다.
   */
  children?: ReactNode;
}
