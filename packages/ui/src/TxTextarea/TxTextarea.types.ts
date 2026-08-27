import type { TextareaHTMLAttributes } from "react";

export interface TxTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> {
  value?: string;

  /** 입력값이 바뀔 때마다. `onChange` 와 함께 불린다. `TxInput` 과 같은 이름이다. */
  onChangeText?: (value: string) => void;
  /**
   * 포커스가 빠질 때 그 시점의 값.
   *
   * 원본은 `onChangedText` 하나가 **값 변경 · Enter · blur 세 곳에서** 불렸다.
   * textarea 에서 Enter 는 줄바꿈이라 `change` 로 이미 오는데 한 번 더 왔다.
   */
  onBlurText?: (value: string) => void;

  /**
   * 마운트 시 `true` 면 포커스한다. 이후 `false` → `true` 로 바뀌어도 다시 포커스한다.
   * `TxInput` 과 같다.
   */
  focusOnMount?: boolean;

  /**
   * 내용에 맞춰 높이가 늘어난다. 기본 `false`.
   *
   * 켜면 손으로 늘리는 손잡이(`resize`)가 사라진다 — 둘이 같이 있으면 타이핑할 때마다
   * 사용자가 맞춰 둔 높이가 덮인다. `--tx-textarea-min-height` 아래로는 줄지 않는다.
   */
  autoGrow?: boolean;
}

export interface TxTextareaRef {
  /** **uncontrolled 일 때만 먹는다.** controlled 면 값의 주인은 소비자다. */
  setValue: (value: string) => void;
  getValue: () => string;
  focus: () => void;
  select: () => void;
}
