import { createContext } from "react";

/** **내부 전용.** 줄이 열림을 하나로 쥐고, 항목은 자기 자리만 그린다. */
export interface TxNavBarShared {
  /** 얹어서 열 수 있는가. `openOn="click"` 이면 아니다. */
  hoverable: boolean;
  /** 지금 열린 항목. 없으면 `null`. */
  openId: string | null;
  /** 열거나 닫는다. 같은 항목을 다시 주면 닫는다. */
  toggle: (id: string, label: string) => void;
  /** 얹어서 여는 길. */
  hover: (id: string, label: string) => void;
}

export const TxNavBarContext = createContext<TxNavBarShared | null>(null);
