import type { ChangeEvent, FieldsetHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export interface TxRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** 옆에 붙는 글. 눌러도 골라진다 — 전체가 하나의 `<label>` 이다. */
  label?: ReactNode;

  /** 골라졌을 때 그 값을 준다. `onChange` 와 함께 불린다. */
  onChangeValue?: (value: string) => void;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { mark?: string; label?: string };

  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}

export interface TxRadioGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  /**
   * 묶음 이름. **안 주면 하나 지어낸다.**
   *
   * 같은 이름을 가진 것끼리 하나만 골라지고, 그 안에서 방향키가 돈다 — 브라우저가 한다.
   */
  name?: string;

  /** 이 묶음이 무엇을 묻는지. 스크린리더가 항목마다 함께 읽는다. */
  legend?: ReactNode;

  /** 고른 값. **주면 controlled** 다. */
  value?: string;

  /** 처음에 고를 값. controlled 일 때는 무시된다. */
  defaultValue?: string;

  /** 고른 값이 바뀔 때. */
  onChange?: (value: string) => void;

  /** 가로로 늘어놓는다. 기본은 세로. */
  inline?: boolean;

  /** 묶음 전체를 잠근다. */
  disabled?: boolean;

  children?: ReactNode;
}
