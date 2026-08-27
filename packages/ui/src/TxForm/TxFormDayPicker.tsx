import { TxDayPicker, TxDayPickerRange, type TxDayPickerProps, type TxDayPickerRangeProps, type TxDayPickerRangeRef } from "../TxDayPicker";
import { TxFormField, useTxFormControl } from "./TxFormField";
import type { TxFormFieldSlots } from "./TxForm.types";
import { forwardRef, type AriaAttributes } from "react";

/**
 * 날짜 필드. **`@txstack/ui/daypicker` 서브패스에만 있다.**
 *
 * 코어 배럴이 `react-day-picker` 를 import 하면 optional peer 가 성립하지 않으므로
 * `TxForm.DayPicker` 라는 이름으로는 닿지 않는다. 이름 그대로 가져다 쓴다.
 *
 * @example
 * ```tsx
 * import { TxFormDayPicker } from "@txstack/ui/daypicker";
 *
 * <TxForm labelWidth="6rem">
 *   <TxFormDayPicker caption="가입일" onChange={setJoinedAt} />
 * </TxForm>
 * ```
 *
 * 달력 껍데기는 `<button>` 이라 `<label for>` 가 안 먹는다 — 캡션을 `aria-labelledby` 로 잇는다.
 */
export type TxFormDayPickerProps = TxFormFieldSlots & TxDayPickerProps;
export type TxFormDayPickerRangeProps = TxFormFieldSlots & TxDayPickerRangeProps;

type FieldOwn = TxFormFieldSlots & { id?: string; "aria-describedby"?: string; "aria-invalid"?: AriaAttributes["aria-invalid"] };

const split = <T extends FieldOwn>({ caption, warning, error, className, id, "aria-describedby": describedBy, "aria-invalid": invalid, ...rest }: T) => ({
  own: { caption, warning, error, id, describedBy, invalid },
  className,
  rest
});

export const TxFormDayPicker = (props: TxFormDayPickerProps) => {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "labelledby" });

  return (
    <TxFormField {...field} className={className}>
      <TxDayPicker {...rest} {...control} />
    </TxFormField>
  );
};

export const TxFormDayPickerRange = forwardRef<TxDayPickerRangeRef, TxFormDayPickerRangeProps>(function TxFormDayPickerRange(props, ref) {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "labelledby" });

  return (
    <TxFormField {...field} className={className}>
      <TxDayPickerRange ref={ref} {...rest} {...control} />
    </TxFormField>
  );
});
