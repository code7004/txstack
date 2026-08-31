import type { TxButtonProps } from "../TxButton";

/** `value` 는 버튼의 DOM 속성과 이름이 겹친다. 우리 뜻으로 덮는다. */
export interface TxCopyButtonProps extends Omit<TxButtonProps, "onClick" | "label" | "children" | "value"> {
  /**
   * 복사할 글자. **함수를 주면 누를 때 부른다** —
   * 지금 화면에 있는 값을 그때 읽어야 할 때 쓴다.
   */
  value: string | (() => string);

  /** 평소 글자. 기본 `"복사"`. */
  label?: string;

  /** 복사한 뒤 잠깐 보일 글자. 기본 `"복사했습니다"`. */
  copiedLabel?: string;

  /**
   * 복사하지 못했을 때 보일 글자. 기본 `"복사 실패"`.
   *
   * **기본 세 글자는 모두 같은 폭 안에 든다** — 글자가 바뀌어도 버튼이 안 흔들린다.
   * 더 긴 글자를 주면 그만큼 넓어지므로 `--tx-copy-button-min-width` 를 함께 올린다.
   */
  failedLabel?: string;

  /** 그 글자가 머무는 시간(ms). 기본 `1500`. */
  duration?: number;

  /** 복사한 뒤. 실패하면 오지 않는다. */
  onCopied?: (value: string) => void;
}
