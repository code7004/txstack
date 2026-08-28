import type { DialogHTMLAttributes, HTMLAttributes, ReactNode } from "react";

/** 폭. `--tx-modal-width` 를 직접 주면 이것과 무관하게 그 값이 쓰인다. */
export type TxModalSize = "sm" | "md" | "lg";

export interface TxModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "title" | "onClose"> {
  open: boolean;

  /**
   * 닫힐 때. **닫는 길이 전부 여기로 모인다** — 닫기 버튼 · 바깥 클릭 · Escape.
   *
   * 값의 주인은 소비자다. 이 콜백을 받고도 `open` 을 안 내리면 모달은 열린 채로 남는다.
   */
  onClose: () => void;

  /** 제목. 스크린리더가 모달의 이름으로 읽는다. */
  title?: ReactNode;

  /** 바깥(어두운 바탕)을 눌러 닫는다. 기본 `true`. */
  closeOnBackdrop?: boolean;

  /** 폭. 기본 `"md"`. */
  size?: TxModalSize;

  /** 닫기 버튼의 이름. 스크린리더가 읽는다. 기본 `"닫기"`. */
  closeLabel?: string;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { panel?: string; header?: string; body?: string };

  children?: ReactNode;
}

export type TxModalFooterProps = HTMLAttributes<HTMLDivElement>;
