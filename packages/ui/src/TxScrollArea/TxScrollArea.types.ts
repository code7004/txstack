import type { CSSProperties, HTMLAttributes } from "react";

/** 어느 쪽으로 구르는가. */
export type TxScrollAreaOrientation = "vertical" | "horizontal";

export interface TxScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** 어느 쪽으로 구르는가. 기본 `"vertical"`. */
  orientation?: TxScrollAreaOrientation;

  /**
   * 구를 수 있는 크기. 세로면 높이, 가로면 폭이다.
   *
   * **안 주면 놓인 자리가 정한다** — flex·grid 안에서는 그쪽이 이미 정해 주므로
   * 여기서 또 정하면 어긋난다.
   */
  size?: CSSProperties["blockSize"];

  /**
   * 스크롤로 도달할 수 있다는 것을 스크린리더에도 알린다. 기본 `true`.
   *
   * 켜면 **키보드로도 굴릴 수 있게** 탭 정거장이 하나 생긴다 — 안 그러면 마우스 없이는
   * 안쪽 내용에 닿을 길이 없는 자리가 나온다. 안에 이미 버튼·링크가 있어 그것들로 닿는다면
   * 꺼도 된다.
   */
  focusable?: boolean;

  /** 스크린리더가 읽을 이름. `focusable` 일 때 쓴다. */
  label?: string;
}
