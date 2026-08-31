import type { HTMLAttributes } from "react";

/** 값. 손잡이가 둘이면 `[시작, 끝]` 이다. */
export type TxSliderValue = number | [number, number];

export interface TxSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** 값. **주면 controlled** 다. 배열을 주면 손잡이가 둘이 된다. */
  value?: TxSliderValue;

  /** 처음 값. controlled 일 때는 무시된다. 기본 `0`. */
  defaultValue?: TxSliderValue;

  /** 값이 바뀔 때. 준 모양 그대로 온다 — 배열을 줬으면 배열로. */
  onChange?: (value: TxSliderValue) => void;

  min?: number;
  max?: number;
  step?: number;

  /** 잠근다. */
  disabled?: boolean;

  /** 값을 막대 위에 글자로 보여 준다. 함수를 주면 그 글자를 직접 만든다. */
  showValue?: boolean | ((value: TxSliderValue) => string);

  /**
   * 손잡이의 이름. 스크린리더가 읽는다.
   *
   * 손잡이가 둘이면 `["최소", "최대"]` 처럼 둘을 준다 — **둘 다 "값" 이라고만 하면
   * 어느 쪽을 잡고 있는지 알 수 없다.**
   */
  label?: string | [string, string];
}
