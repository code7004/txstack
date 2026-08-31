import type { InputHTMLAttributes } from "react";

export interface TxNumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"> {
  /** 값. **주면 controlled** 다. 비었을 때는 `undefined`. */
  value?: number;

  /** 처음 값. controlled 일 때는 무시된다. */
  defaultValue?: number;

  /** 값이 바뀔 때. 비면 `undefined` 가 온다. */
  onChange?: (value: number | undefined) => void;

  min?: number;
  max?: number;

  /** 증감 버튼과 방향키가 한 번에 움직이는 크기. 기본 `1`. */
  step?: number;

  /**
   * 소수 자릿수. 주면 **포커스가 빠질 때 그 자리까지 맞춘다** — `2` 면 `3` 이 `3.00` 이 된다.
   *
   * 안 주면 `step` 에서 짐작한다 (`0.1` → 1자리).
   */
  precision?: number;

  /**
   * 천 단위를 끊어 보여 준다. 기본 `true`.
   *
   * **타이핑하는 동안에는 끊지 않는다** — 커서가 튀기 때문이다. 포커스가 빠질 때 끊는다.
   */
  thousandSeparator?: boolean;

  /** 값 뒤에 붙는 글자. `원` · `%` 처럼. 스크린리더도 함께 읽는다. */
  suffix?: string;

  /** 증감 버튼을 없앤다. 기본 `false`. */
  hideStepper?: boolean;
}
