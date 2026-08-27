import type { FormHTMLAttributes, HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

export interface TxFormProps extends FormHTMLAttributes<HTMLFormElement> {
  /**
   * 캡션의 너비. **CSS 길이**를 준다 — `"8rem"` · `"120px"`.
   *
   * 주면 캡션이 컨트롤 **왼쪽**으로 가고 그 너비로 정렬된다. 안 주면 컨트롤 **위**에 쌓인다.
   * 값은 `--tx-form-label-width` 로 내려가므로 Context 도 리렌더도 없다 —
   * CSS 로 주고 싶으면 prop 대신 그 변수를 직접 덮어도 된다.
   */
  labelWidth?: string;
}

/** 모든 `TxForm.*` 필드가 함께 받는 것. */
export interface TxFormFieldSlots {
  /** 컨트롤의 이름. **진짜 `<label>` 이라** 눌러도 컨트롤로 포커스가 간다. */
  caption?: ReactNode;
  /** 알림 한 줄. `error` 가 있으면 가려진다 — 자리가 하나다. */
  warning?: ReactNode;
  /** 오류 한 줄. 컨트롤에 `aria-invalid` 와 `aria-describedby` 를 걸어 준다. */
  error?: ReactNode;
  /**
   * **필드 상자**에 붙는다 — 그리드에 놓는 자리다.
   *
   * 컨트롤 자체를 겨냥하려면 CSS 로 한 겹 들어간다: `.my-field .tx-input { … }`.
   */
  className?: string;
}

export interface TxFormFieldProps extends TxFormFieldSlots, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * 캡션이 가리킬 컨트롤의 `id`.
   *
   * **주면 캡션이 `<label>`, 안 주면 `<span>` 이다** — 가리키는 곳이 없는 `htmlFor` 를 만들지 않는다.
   * `<div>`·`<button>` 으로 된 컨트롤은 `htmlFor` 대신 `captionId` + `aria-labelledby` 로 잇는다.
   */
  htmlFor?: string;
  /** 캡션 요소의 `id`. `aria-labelledby` 로 이을 때 쓴다. */
  captionId?: string;
  /**
   * 메시지 요소의 `id`. 안 주면 `htmlFor` 에서 `` `${htmlFor}-message` `` 로 만든다 —
   * 손수 짜는 컨트롤도 이 규칙만 알면 `aria-describedby` 를 직접 걸 수 있다.
   */
  messageId?: string;
  children?: ReactNode;
}

export type TxFormLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export type TxFormFlexProps = HTMLAttributes<HTMLDivElement>;
