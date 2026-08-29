import type { ReactNode } from "react";
import type { TxAlertVariant } from "../TxAlert";

/** 어느 구석에 쌓이는가. */
export type TxToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface TxToastOptions {
  /** 본문. */
  message?: ReactNode;
  /** 굵은 첫 줄. */
  title?: ReactNode;

  /** 갈래. 기본 `"info"`. **`TxAlert` 과 같은 어휘다.** */
  variant?: TxAlertVariant;

  /**
   * 몇 밀리초 뒤에 사라지나. 기본 `4000`.
   *
   * **`0` 이면 사라지지 않는다** — 사용자가 닫아야 한다. 놓치면 안 되는 오류가 그 자리다.
   */
  duration?: number;

  /** 닫기 버튼의 이름. 스크린리더가 읽는다. */
  closeLabel?: string;
}

/** 문구 하나만 줘도 되고 옵션 객체를 줘도 된다. */
export type TxToastInput = ReactNode | TxToastOptions;

export interface TxToastConfig {
  /** 어느 구석에 쌓을지. 기본 `"top-right"`. */
  position?: TxToastPosition;
  /** 사라지기까지의 기본 시간(ms). 기본 `4000`. */
  duration?: number;
  /**
   * 한 번에 보일 최대 개수. 기본 `4`.
   *
   * 넘으면 **가장 오래된 것부터 사라진다.** 화면이 알림으로 덮이면 정작 새로 온 것을 못 본다.
   */
  max?: number;
}
