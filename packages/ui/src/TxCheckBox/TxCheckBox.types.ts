import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

export interface TxCheckBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** 옆에 붙는 글. 눌러도 토글된다 — 전체가 하나의 `<label>` 이다. */
  label?: ReactNode;

  /**
   * 모양. 기본 `"checkbox"`.
   *
   * `"toggle"` 은 스위치로 읽힌다(`role="switch"`) — 스크린리더가 "선택됨" 이 아니라
   * "켜짐/꺼짐" 으로 안내한다. 설정을 즉시 켜고 끄는 자리에 쓴다.
   */
  variant?: "checkbox" | "toggle";

  /** 체크 여부만 필요할 때. `onChange` 와 함께 불린다. */
  onChangeBool?: (checked: boolean) => void;

  /**
   * 클릭이 부모로 올라가지 않게 막는다. 기본 `false`.
   *
   * 행 전체가 눌리는 목록·표 안에 체크박스를 넣을 때 켠다.
   */
  stopPropagation?: boolean;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { mark?: string; label?: string };

  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}
