import { TxDayPickerRange, TxDayPicker, type ITxDayPickerByRangeProps, type ITxDayPickerProps } from "../TxDayPicker";
import type { ITxFormFieldProps } from "./TxForm.types";
import { TxFormField } from "./TxFormField";

export const TxFormDayPicker = (props: ITxFormFieldProps & ITxDayPickerProps) => {
  const { caption, warning, error, ...rest } = props;

  return (
    <TxFormField data-tag="TxForm.DayPicker" caption={caption} warning={warning} error={error}>
      <TxDayPicker {...rest} />
    </TxFormField>
  );
};

TxFormDayPicker.displayName = "TxForm.DayPicker";

export const TxFormDayPickerRange = (props: ITxFormFieldProps & ITxDayPickerByRangeProps) => {
  const { caption, warning, error, ...rest } = props;

  return (
    <TxFormField data-tag="TxForm.DayPickerRange" caption={caption} warning={warning} error={error}>
      <TxDayPickerRange {...rest} />
    </TxFormField>
  );
};

TxFormDayPickerRange.displayName = "TxForm.DayPickerRange";
