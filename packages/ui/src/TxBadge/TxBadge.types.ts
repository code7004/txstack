import type { HTMLAttributes, ReactNode } from "react";
import type { TxAlertVariant } from "../TxAlert";

/** 갈래. **`TxAlert` · `TxToast` · `TxTag` 와 같은 어휘다.** */
export type TxBadgeVariant = TxAlertVariant;

/** 어느 모서리에 붙는가. */
export type TxBadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface TxBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 몇 개인가. 안 주면 점만 찍는다. */
  count?: number;

  /**
   * 이 수를 넘으면 `99+` 처럼 보인다. 기본 `99`.
   *
   * **넘긴 수를 그대로 그리면 자리를 밀어낸다** — 아이콘 위에 붙는 것이라 커질 자리가 없다.
   */
  max?: number;

  /** `0` 일 때도 보인다. 기본 `false` — 0 이면 알릴 것이 없다. */
  showZero?: boolean;

  /** 수를 감추고 점만 찍는다. 기본 `false`. */
  dot?: boolean;

  /** 갈래. 기본 `"danger"` — 알림은 대개 눈에 띄어야 한다. */
  variant?: TxBadgeVariant;

  /** 어느 모서리에 붙는가. 기본 `"top-right"`. */
  placement?: TxBadgePlacement;

  /**
   * 스크린리더가 읽을 말. 기본은 `"알림 3개"` 처럼 수를 붙여 만든다.
   *
   * **숫자만으로는 무엇의 수인지 알 수 없다** — `"읽지 않은 메일 3개"` 처럼 준다.
   */
  label?: string;

  /**
   * 무엇에 붙는가. **안 주면 홀로 선다.**
   *
   * 아이콘이나 버튼을 감싸면 그 모서리에 얹힌다 — 감싼 것의 자리를 밀지 않는다.
   */
  children?: ReactNode;
}
