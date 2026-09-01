import { forwardRef, type ChangeEvent } from "react";
import { cm } from "../tx-ui.utils";
import { useTxRadioGroup } from "./TxRadio.context";
import type { TxRadioProps } from "./TxRadio.types";

/**
 * 여럿 중 하나를 고르는 자리.
 *
 * ```tsx
 * <TxRadioGroup legend="결제 수단" defaultValue="card" onChange={setPay}>
 *   <TxRadio value="card" label="카드" />
 *   <TxRadio value="bank" label="계좌이체" />
 * </TxRadioGroup>
 * ```
 *
 * **`TxRadioGroup` 안에 두면 `name` 이 저절로 이어진다.** 그러면 브라우저가 하나만
 * 골라지게 하고, **방향키로 옮겨 다니는 것과 Tab 이 묶음을 한 번만 밟는 것**까지 맡는다 —
 * 손으로 roving tabindex 를 짤 일이 없다.
 *
 * 진짜 `<input type="radio">` 라 `<form>` 안에서 그냥 제출된다.
 *
 * 명세: `docs/001_ui/039_TxRadio.md`
 */
export const TxRadio = forwardRef<HTMLInputElement, TxRadioProps>(function TxRadio({ label, children, className, style, classNames, onChange, onChangeValue, ...props }, ref) {
  const group = useTxRadioGroup();

  // 묶음이 있으면 이름·고름·잠금을 그쪽이 정한다. 홀로 쓰면 넘겨받은 것을 그대로 쓴다
  const name = props.name ?? group?.name;
  const checked = group ? group.value === props.value : props.checked;
  const disabled = props.disabled ?? group?.disabled;

  const hdChange = (evt: ChangeEvent<HTMLInputElement>) => {
    onChange?.(evt);
    onChangeValue?.(evt.target.value);
    if (group) group.onPick(evt.target.value);
  };

  return (
    // `<label>` 이 전부를 감싼다. 그래서 글을 눌러도 골라지고, `htmlFor` 로 id 를 이을 필요가 없다
    <label data-tag="TxRadio" data-disabled={disabled ? "" : undefined} className={cm("tx-radio", className)} style={style}>
      {/*
        진짜 `<input>` 이다. 눈에만 안 보이게 하고 포커스는 그대로 받는다 —
        `display: none` 으로 지우면 방향키 이동도 폼 제출도 안 된다.
      */}
      <input
        {...props}
        ref={ref}
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        className="tx-radio__input"
        // controlled 인데 onChange 가 없으면 React 가 경고한다. 묶음 안에서는 늘 있다
        onChange={hdChange}
      />

      {/* 보이는 모양. 상태는 CSS 가 `:checked` 로 읽으므로 여기에 상태가 없다 */}
      <span aria-hidden="true" className={cm("tx-radio__mark", classNames?.mark)} />

      {label != null && <span className={cm("tx-radio__label", classNames?.label)}>{label}</span>}
      {children}
    </label>
  );
});
