import type { DialogHTMLAttributes, ReactNode } from "react";

/** 어느 가장자리에서 밀려 나오는가. */
export type TxSlidePanelSide = "left" | "right" | "top" | "bottom";

/**
 * 크기를 무엇이 정하는가. `"auto"` 면 **내용이** 정한다 — `TxModal` 의 `size="auto"` 와 같은 뜻.
 * 안 주면 `--tx-slide-panel-size` 다.
 */
export type TxSlidePanelSize = "auto";

export interface TxSlidePanelProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "title" | "onClose"> {
  open: boolean;

  /**
   * 닫힐 때. **닫는 길이 전부 여기로 모인다** — 닫기 버튼 · 바깥 클릭 · Escape.
   *
   * 값의 주인은 소비자다. 이 콜백을 받고도 `open` 을 안 내리면 패널은 열린 채로 남는다.
   */
  onClose: () => void;

  /** 어느 쪽에서 나오는가. 기본 `"right"`. */
  side?: TxSlidePanelSide;

  /**
   * `"auto"` 면 **내용이 크기를 정한다** — 위아래면 높이, 좌우면 폭. 화면을 넘으면 거기서 멈추고 본문이 굴러간다.
   * 모바일 하단 시트(`side="bottom" size="auto"`)에 쓴다. 안 주면 `--tx-slide-panel-size` 다.
   */
  size?: TxSlidePanelSize;

  /** 제목. 스크린리더가 패널의 이름으로 읽는다. */
  title?: ReactNode;

  /** 바깥(어두운 바탕)을 눌러 닫는다. 기본 `true`. */
  closeOnBackdrop?: boolean;

  /**
   * Escape 로 닫는다. 기본 `true`.
   *
   * **끄면 Escape 를 눌러도 아무 일이 없다.** 닫는 길을 전부 막지는 말 것 —
   * 버튼이든 무엇이든 하나는 남겨 둔다.
   */
  closeOnEscape?: boolean;

  /** 닫기 버튼의 이름. 스크린리더가 읽는다. 기본 `"닫기"`. */
  closeLabel?: string;

  /**
   * 오른쪽 위 닫기 버튼을 없앤다. 기본 `false`.
   *
   * **닫는 길을 따로 마련한 패널에만 쓴다.** 켜도 Escape 와 바깥 클릭은 그대로 동작한다.
   */
  hideCloseButton?: boolean;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { panel?: string; header?: string; body?: string };

  children?: ReactNode;
}
