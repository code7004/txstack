import { createContext } from "react";

/** **내부 전용.** 접힘은 줄이 쥐고, 항목은 그 상태를 읽어 자기 모습을 바꾼다. */
export interface TxSideNavShared {
  /** 아이콘만 남은 상태인가. */
  collapsed: boolean;
  /**
   * 줄을 펼친다. **접힌 채로 하위메뉴를 열 수는 없어서** — 아이콘 줄에 하위 목록을
   * 밀어 넣을 자리가 없다 — 하위가 있는 항목을 누르면 먼저 줄을 펼친다.
   */
  expand: () => void;
}

export const TxSideNavContext = createContext<TxSideNavShared | null>(null);
