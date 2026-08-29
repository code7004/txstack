import type { HTMLAttributes, ReactNode } from "react";

export interface TxTooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** 띄울 것. **요소도 그대로 들어간다** — 표 안에서 JSON 트리를 띄우는 자리가 그렇다. */
  tip: ReactNode;

  /** 이 위에 올리거나 포커스하면 뜬다. */
  children: ReactNode;

  /**
   * 마우스를 올리고 이만큼 지나야 뜬다. 기본 `300`(ms).
   *
   * **포커스로 열 때는 기다리지 않는다** — 키보드로 온 사람은 이미 그것을 보려고 온 것이다.
   */
  openDelay?: number;
  /**
   * 벗어나고 이만큼 지나야 닫힌다. 기본 `100`(ms).
   *
   * **0 이면 트리거에서 툴팁으로 마우스를 옮기는 사이에 닫힌다** — 원본이 그랬다.
   */
  closeDelay?: number;

  /** 최대 폭. 기본 `"20rem"`. 넘치면 줄을 바꾼다. */
  maxWidth?: number | string;

  /**
   * 최대 높이. 기본 `"20rem"`. **넘치면 툴팁 안에서 스크롤된다.**
   *
   * 툴팁 위로 마우스를 올려도 닫히지 않으므로 긴 내용도 끝까지 읽을 수 있다.
   */
  maxHeight?: number | string;

  /** 툴팁만 끈다. 감싼 내용은 그대로 나온다. */
  disabled?: boolean;

  /** 안쪽 슬롯. 바깥 겉(감싸개)은 `className` 이 맡는다. */
  classNames?: { tip?: string };
}
