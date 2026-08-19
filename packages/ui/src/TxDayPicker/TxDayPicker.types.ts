import type { DayPickerLocale, Matcher } from "react-day-picker";
import type { DeepPartial } from "../tx-ui.utils";
import type { TxDayPickerTheme } from "./TxDayPicker.theme";

export type TTxDayPickerRangeInputValue = [Date | number | string | undefined, Date | number | string | undefined];
export type TTxDayPickerRangeValue = [Date | undefined, Date | undefined];
export type TTxDayPickerRangeNumsValue = [number | undefined, number | undefined];

export interface ITxDayPickerProps {
  className?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  disableAutoClose?: boolean;
  placeholder?: string;
  format?: string;
  theme?: DeepPartial<typeof TxDayPickerTheme>;
}

export interface ITxDayPickerByRangeProps {
  className?: string;
  value?: TTxDayPickerRangeInputValue;
  onChange?: (range: TTxDayPickerRangeValue) => void;
  onChangeNums?: (range: TTxDayPickerRangeNumsValue) => void;
  onSubmit?: (range: TTxDayPickerRangeValue) => void;
  onSubmitNums?: (range: TTxDayPickerRangeNumsValue) => void;
  placeholder?: string;
  disableAutoClose?: boolean;
  format?: string;
  header?: React.ReactNode | ((params: { value: TTxDayPickerRangeValue; valueNums: TTxDayPickerRangeNumsValue; onChange: (range: TTxDayPickerRangeValue) => void; onChangeNums: (range: TTxDayPickerRangeNumsValue) => void }) => React.ReactNode);
  footer?: React.ReactNode;
  disabled?: Matcher | Matcher[] | undefined;
  diffBlock?: number;
  locale?: Partial<DayPickerLocale> | undefined;
  theme?: DeepPartial<typeof TxDayPickerTheme>;
}
