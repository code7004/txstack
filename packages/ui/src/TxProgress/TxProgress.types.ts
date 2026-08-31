import type { HTMLAttributes, ReactNode } from "react";
import type { TxAlertVariant } from "../TxAlert";

/** 갈래. **`TxAlert` · `TxToast` · `TxTag` 와 같은 어휘다.** */
export type TxProgressVariant = TxAlertVariant;

export interface TxProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 지금 값. `max` 를 넘으면 `max` 로, 0 아래면 0 으로 잘린다. */
  value: number;

  /** 끝값. 기본 `100`. */
  max?: number;

  /** 갈래. 기본 `"info"`. */
  variant?: TxProgressVariant;

  /**
   * 무엇의 진행인지. **스크린리더가 막대의 이름으로 읽는다.**
   *
   * 화면에 글자로 보이지는 않는다 — 옆에 이미 제목이 있다면 그것을 `aria-labelledby` 로
   * 가리키는 편이 낫다.
   */
  label?: string;

  /**
   * 오른쪽에 진행률을 글자로 보여 준다. 기본 `false`.
   *
   * 함수를 주면 그 글자를 직접 만든다 — `(value, max) => \`${value}/${max}\``.
   */
  showValue?: boolean | ((value: number, max: number) => ReactNode);

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { track?: string; bar?: string; value?: string };
}
