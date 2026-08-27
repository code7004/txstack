import type { InputHTMLAttributes, KeyboardEvent } from "react";

/** `<input value>` 가 받는 것과 같다. */
export type TxInputValue = string | number | readonly string[] | undefined;

export interface TxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value"> {
  value?: TxInputValue;

  /** 입력값이 바뀔 때마다 문자열로 준다. `onChange` 와 함께 불린다. */
  onChangeText?: (value: string) => void;
  /**
   * 입력값이 바뀔 때마다 숫자로 준다. **숫자로 읽을 수 없으면 `undefined` 를 준다.**
   *
   * 값을 지워도 콜백이 오므로 "비었다" 를 따로 감시하지 않아도 된다.
   */
  onChangeNumber?: (value: number | undefined) => void;

  /** Enter 를 눌렀을 때 그 시점의 값. */
  onSubmitText?: (value: string) => void;
  /** Enter 를 눌렀을 때 그 시점의 값을 숫자로. */
  onSubmitNumber?: (value: number | undefined) => void;
  /** 포커스가 빠질 때 그 시점의 값을 숫자로. */
  onBlurNumber?: (value: number | undefined) => void;

  /** Enter 키. `onSubmitText`·`onSubmitNumber` 보다 먼저 불린다. */
  onEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;

  /**
   * 마운트 시 `true` 면 포커스한다. 이후 `false` → `true` 로 바뀌어도 다시 포커스한다.
   *
   * 임의 시점에 포커스하려면 `ref.focus()` 를 쓴다.
   */
  focusOnMount?: boolean;
}

export interface TxInputRef {
  /** **uncontrolled 일 때만 먹는다.** controlled 면 값의 주인은 소비자다. */
  setValue: (value: string) => void;
  getValue: () => string;
  focus: () => void;
  select: () => void;
}

export interface TxSearchInputProps extends TxInputProps {
  /** 지우기 버튼을 눌렀을 때. 항상 빈 문자열을 준다 — 시그니처를 `onChangeText` 와 맞춘 것이다. */
  onClear?: (value: string) => void;
}

export interface TxSearchInputRef extends TxInputRef {
  clear: () => void;
  submit: () => void;
}
