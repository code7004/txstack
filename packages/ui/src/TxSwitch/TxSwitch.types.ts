import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

export interface TxSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** 옆에 붙는 글. 눌러도 켜진다 — 전체가 하나의 `<label>` 이다. */
  label?: ReactNode;

  /** 켜짐 여부만 필요할 때. `onChange` 와 함께 불린다. */
  onChangeBool?: (checked: boolean) => void;

  /**
   * 클릭이 부모로 올라가지 않게 막는다. 기본 `false`.
   *
   * 행 전체가 눌리는 목록·표 안에 넣을 때 켠다.
   */
  stopPropagation?: boolean;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { track?: string; label?: string };

  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}
