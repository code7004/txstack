import type { DialogHTMLAttributes, HTMLAttributes, ReactNode } from "react";

/**
 * 폭. `--tx-modal-width` 를 직접 주면 이것과 무관하게 그 값이 쓰인다.
 *
 * `"auto"` 는 **내용 크기를 따른다** — 크기는 안쪽에서 한 번만 정한다. 화면은 넘지 않는다.
 */
export type TxModalSize = "sm" | "md" | "lg" | "auto";

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

  /**
   * Escape 로 닫는다. 기본 `true`.
   *
   * **끄면 Escape 를 눌러도 아무 일이 없다.** 답을 받아야만 하는 창(`TxDialog`)이 그 자리다.
   * 다만 닫는 길을 전부 막지는 말 것 — 버튼이든 무엇이든 하나는 남겨 둔다.
   */
  closeOnEscape?: boolean;

  /**
   * 폭. 기본 `"md"`.
   *
   * - `"sm"` · `"md"` · `"lg"` — 정해진 폭(24 · 32 · 48rem). 높이는 내용이 정한다. 폼처럼 작은 창에 쓴다
   * - `"auto"` — **폭도 높이도 내용이 정한다.** 표 · 미리보기가 든 큰 작업 창에 쓴다.
   *   크기를 안쪽 한 곳에서만 적으면 된다(`<div className="h-[82vh] w-[80vw]">`).
   *   그래도 화면은 넘지 않는다 — 최대 `100vw - 2rem` · `100dvh - 2rem` 이고, 넘치면 본문 안에서 굴러간다
   */
  size?: TxModalSize;

  /** 닫기 버튼의 이름. 스크린리더가 읽는다. 기본 `"닫기"`. */
  closeLabel?: string;

  /**
   * 오른쪽 위 닫기 버튼을 없앤다. 기본 `false`.
   *
   * **닫는 길을 따로 마련한 창에만 쓴다.** 확인·취소 버튼이 답을 받는 자리(`TxDialog`)가
   * 그렇다 — 거기서 X 는 "취소" 와 같은 뜻이라 답이 두 개로 보인다.
   *
   * 켜도 Escape 는 그대로 동작한다. **닫는 길을 전부 없애지는 못한다.**
   */
  hideCloseButton?: boolean;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { panel?: string; header?: string; body?: string };

  children?: ReactNode;
}

export type TxModalFooterProps = HTMLAttributes<HTMLDivElement>;
