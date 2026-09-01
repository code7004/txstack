import type { HTMLAttributes, ReactNode } from "react";

export interface TxTickerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * **가로로 끊임없이 흐른다.** 안 주면 세로로 한 줄씩 올라간다.
   *
   * 흐르는 쪽은 `interval` 대신 `speed` 를 본다.
   */
  flow?: boolean;

  /** 한 줄이 머무는 시간(ms). 기본 `4000`. 세로일 때만 쓴다. */
  interval?: number;

  /**
   * 초당 몇 픽셀 흐르는가. 기본 `40`. 가로일 때만 쓴다.
   *
   * 시간이 아니라 속도로 받는다 — 항목이 늘어도 **읽는 속도가 그대로**여야 한다.
   */
  speed?: number;

  /**
   * 멈춤 버튼을 **화면에 그린다.** 기본 `true`.
   *
   * `false` 여도 **없어지지는 않는다** — 화면에서만 감추고, 초점이 오면 나타난다.
   * 저절로 움직이는 것에는 멈출 수단이 있어야 하므로(WCAG 2.2.2) 키보드와 스크린리더
   * 쪽 길은 남긴다. 얹거나 초점이 가면 멈추는 것도 그대로다.
   */
  controls?: boolean;

  /** 도는 중에 보이는 버튼 이름. 기본 `"멈춤"`. */
  pauseLabel?: string;
  /** 멈춰 있을 때 보이는 버튼 이름. 기본 `"재생"`. */
  playLabel?: string;

  /** 항목들. **자식 하나가 항목 하나다.** */
  children?: ReactNode;
}
