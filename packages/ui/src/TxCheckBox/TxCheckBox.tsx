import { forwardRef, type ChangeEvent, type MouseEvent } from "react";
import { cm } from "../tx-ui.utils";
import { TxIconCheck } from "../TxIcons";
import type { TxCheckBoxProps } from "./TxCheckBox.types";

/**
 * 고르는 자리. 네모를 눌러 체크한다.
 *
 * ```tsx
 * <TxCheckBox label="동의합니다" onChangeBool={setAgreed} />
 * ```
 *
 * **그 자리에서 바로 켜고 끄는 것은 `TxSwitch` 다.** 체크박스는 "이것을 고르겠다" 를
 * 모아 두었다가 제출하는 자리고, 스위치는 누르는 즉시 반영된다 — 스크린리더도
 * "선택됨" 과 "켜짐/꺼짐" 으로 다르게 읽는다.
 *
 * `checked` 를 주면 controlled, `defaultChecked` 를 주면 uncontrolled 다.
 * `name` · `value` · `disabled` · `required` 같은 표준 속성이 그대로 통과하므로
 * **`<form>` 안에서 그냥 제출된다.**
 *
 * 전체가 하나의 `<label>` 이라 글을 눌러도 토글되고, Tab 으로 도달해 Space 로 켠다.
 *
 * 색·크기는 CSS 변수로 바꾼다 — 앱 전체는 `:root { --tx-color-primary: … }`,
 * 이 컴포넌트만은 `.tx-checkbox { --tx-checkbox-size: … }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxCheckBox = forwardRef<HTMLInputElement, TxCheckBoxProps>(function TxCheckBox({ label, children, className, style, classNames, stopPropagation = false, onChange, onChangeBool, ...props }, ref) {
  const hdChange = (evt: ChangeEvent<HTMLInputElement>) => {
    onChange?.(evt);
    onChangeBool?.(evt.target.checked);
  };

  const hdClick = stopPropagation ? (evt: MouseEvent<HTMLLabelElement>) => evt.stopPropagation() : undefined;

  return (
    /*
      `<label>` 이 전부를 감싼다. 그래서 글을 눌러도 토글되고, `htmlFor` 로 id 를 이을 필요가 없다.
      원본은 `<div onClick>` 이라 키보드로 도달할 수 없었고 폼 제출에도 안 실렸다.
    */
    <label data-tag="TxCheckBox" data-disabled={props.disabled ? "" : undefined} className={cm("tx-checkbox", className)} style={style} onClick={hdClick}>
      {/*
        진짜 `<input>` 이다. 눈에만 안 보이게 하고 포커스는 그대로 받는다 —
        `display: none` 으로 지우면 Tab 으로 갈 수 없고 폼에도 안 실린다.
      */}
      <input {...props} ref={ref} type="checkbox" className="tx-checkbox__input" onChange={hdChange} />

      {/* 보이는 모양. 상태는 CSS 가 `:checked` 로 읽으므로 여기에 상태가 없다 */}
      <span aria-hidden="true" className={cm("tx-checkbox__mark", classNames?.mark)}>
        <TxIconCheck className="tx-checkbox__icon" />
      </span>

      {label != null && <span className={cm("tx-checkbox__label", classNames?.label)}>{label}</span>}
      {children}
    </label>
  );
});
