import { forwardRef, type ChangeEvent, type MouseEvent } from "react";
import { cm } from "../tx-ui.utils";
import type { TxSwitchProps } from "./TxSwitch.types";

/**
 * 그 자리에서 바로 켜고 끄는 자리.
 *
 * ```tsx
 * <TxSwitch label="알림 받기" defaultChecked onChangeBool={setPush} />
 * ```
 *
 * **`TxCheckBox` 와 하는 말이 다르다.** 체크박스는 "이것을 고르겠다" 를 **모아 두었다가
 * 제출**하는 자리고, 스위치는 **누르는 즉시 켜지고 꺼진다.** 스크린리더도 "선택됨" 이
 * 아니라 "켜짐 / 꺼짐" 으로 읽는다(`role="switch"`).
 *
 * 그래서 **확인 버튼이 뒤따르는 폼에는 체크박스**를 쓴다. 눌러 놓고 저장을 안 눌렀는데
 * 켜진 것처럼 보이면 거짓말이 된다.
 *
 * 진짜 `<input type="checkbox">` 라 Tab 으로 도달해 Space 로 켜지고, `name` · `value` ·
 * `disabled` 가 그대로 통하므로 **`<form>` 안에서 그냥 제출된다.**
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-switch { --tx-switch-track-width: 3rem }`.
 *
 * 명세: `docs/001_ui/041_TxSwitch.md`
 */
export const TxSwitch = forwardRef<HTMLInputElement, TxSwitchProps>(function TxSwitch({ label, children, className, style, classNames, stopPropagation = false, onChange, onChangeBool, ...props }, ref) {
  const hdChange = (evt: ChangeEvent<HTMLInputElement>) => {
    onChange?.(evt);
    onChangeBool?.(evt.target.checked);
  };

  const hdClick = stopPropagation ? (evt: MouseEvent<HTMLLabelElement>) => evt.stopPropagation() : undefined;

  return (
    // `<label>` 이 전부를 감싼다. 그래서 글을 눌러도 켜지고, `htmlFor` 로 id 를 이을 필요가 없다
    <label data-tag="TxSwitch" data-disabled={props.disabled ? "" : undefined} className={cm("tx-switch", className)} style={style} onClick={hdClick}>
      {/*
        진짜 `<input>` 이다. 눈에만 안 보이게 하고 포커스는 그대로 받는다 —
        `display: none` 으로 지우면 Tab 으로 갈 수 없고 폼에도 안 실린다.

        `role="switch"` 라야 "선택됨" 이 아니라 "켜짐/꺼짐" 으로 읽힌다.
      */}
      <input {...props} ref={ref} type="checkbox" role="switch" className="tx-switch__input" onChange={hdChange} />

      {/* 보이는 모양. 상태는 CSS 가 `:checked` 로 읽으므로 여기에 상태가 없다 */}
      <span aria-hidden="true" className={cm("tx-switch__track", classNames?.track)}>
        <span className="tx-switch__thumb" />
      </span>

      {label != null && <span className={cm("tx-switch__label", classNames?.label)}>{label}</span>}
      {children}
    </label>
  );
});
