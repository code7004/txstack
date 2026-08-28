import type { ReactNode } from "react";
import type { TxModalSize } from "../TxModal";

/**
 * **바깥을 눌러 닫는 옵션은 없다.** 네이티브 `alert` · `confirm` 이 그렇듯 답하기 전에는
 * 닫히지 않는다 — `confirm` 에서 바깥을 잘못 누르면 조용히 "취소를 골랐다" 가 되어 버린다.
 *
 * Escape 는 그대로 동작한다. 네이티브 `confirm` 도 Escape 를 `false` 로 본다.
 * 바깥 클릭으로 닫히는 창이 필요하면 그건 `TxModal` 의 일이다.
 */
export interface TxDialogOptions {
  /** 창의 제목. 없으면 제목 줄이 비고 닫기 버튼만 남는다. */
  title?: ReactNode;
  /** 본문. **줄바꿈(`\n`)이 그대로 보인다** — 네이티브 `confirm` 과 같다. */
  message?: ReactNode;

  /** 확인 버튼의 글자. 기본은 `TxDialog.configure` 로 정한 값(처음엔 `"확인"`). */
  confirmLabel?: string;
  /** 취소 버튼의 글자. `confirm` 에만 쓴다. 기본 `"취소"`. */
  cancelLabel?: string;

  /**
   * `"danger"` 면 확인 버튼이 붉어진다. **되돌릴 수 없는 동작**에 쓴다.
   *
   * 색만 바꾸는 것이 아니라 "이건 파괴적이다" 를 알리는 자리다.
   */
  tone?: "default" | "danger";

  size?: TxModalSize;
}

/** 앱 전체의 기본 문구. 번역된 글자를 그대로 준다. */
export interface TxDialogLabels {
  /** 기본 `"확인"`. */
  confirm?: string;
  /** 기본 `"취소"`. */
  cancel?: string;
}

export interface TxDialogConfig {
  labels?: TxDialogLabels;
}

/** 문구 하나만 주거나, 옵션 객체를 준다. */
export type TxDialogInput = ReactNode | TxDialogOptions;
