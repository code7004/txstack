import { useId, useMemo, useState } from "react";
import { cm } from "../tx-ui.utils";
import { TxRadioGroupContext } from "./TxRadio.context";
import type { TxRadioGroupProps } from "./TxRadio.types";

/**
 * 라디오를 묶는 자리.
 *
 * ```tsx
 * <TxRadioGroup legend="결제 수단" defaultValue="card" onChange={setPay}>
 *   <TxRadio value="card" label="카드" />
 *   <TxRadio value="bank" label="계좌이체" />
 * </TxRadioGroup>
 * ```
 *
 * **`<fieldset>` 과 `<legend>` 다.** 그래서 스크린리더가 항목마다 "결제 수단, 카드,
 * 라디오 버튼, 2개 중 1" 처럼 **묶음 이름과 몇 개 중 몇 번째인지를 함께** 읽어 준다 —
 * `<div role="radiogroup">` 으로는 그 셈이 자동으로 나오지 않는다.
 *
 * **방향키 이동은 브라우저가 한다.** 같은 `name` 을 가진 라디오끼리는 ↑↓←→ 로 옮겨
 * 다니고 Tab 은 묶음을 한 번만 밟는다 — 그것이 이 컴포넌트가 손으로 roving tabindex 를
 * 짜지 않는 이유다.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxRadioGroup = ({ name, legend, value, defaultValue, onChange, inline = false, disabled, className, children, ...props }: TxRadioGroupProps) => {
  const autoName = useId();
  const controlled = value !== undefined;
  const [own, setOwn] = useState(defaultValue);

  const context = useMemo(
    () => ({
      // 이름이 겹치면 다른 묶음과 하나로 묶여 버린다. 안 주면 겹치지 않는 것을 지어낸다
      name: name ?? autoName,
      value: controlled ? value : own,
      disabled,
      onPick: (next: string) => {
        if (!controlled) setOwn(next);
        onChange?.(next);
      }
    }),
    [name, autoName, controlled, value, own, disabled, onChange]
  );

  return (
    <fieldset {...props} data-tag="TxRadioGroup" data-inline={inline ? "" : undefined} disabled={disabled} className={cm("tx-radio-group", className)}>
      {/* 이름이 없으면 `<fieldset>` 이 묶음으로 읽히지 않는다 */}
      {legend != null && <legend className="tx-radio-group__legend">{legend}</legend>}

      <div className="tx-radio-group__items">
        <TxRadioGroupContext.Provider value={context}>{children}</TxRadioGroupContext.Provider>
      </div>
    </fieldset>
  );
};
