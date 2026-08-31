import { createContext, useContext } from "react";

/** **내부 전용.** 묶음이 항목에 내려보내는 것. */
export interface TxRadioGroupContextValue {
  name: string;
  value?: string;
  disabled?: boolean;
  onPick: (value: string) => void;
}

export const TxRadioGroupContext = createContext<TxRadioGroupContextValue | null>(null);

/** 묶음 밖에서도 홀로 쓸 수 있어야 하므로 `null` 을 그대로 돌려준다. */
export const useTxRadioGroup = () => useContext(TxRadioGroupContext);
