import { TxFormBase, TxFormLabel } from "./TxFormBase";
import { TxFormDropdown, TxFormDropdownMulti } from "./TxFormDropdown";
import { TxFormField } from "./TxFormField";
import { TxFormFlex } from "./TxFormFlex";
import { TxFormInput, TxFormSearchInput } from "./TxFormInput";
import { TxFormTextarea } from "./TxFormTextarea";

export * from "./TxForm.hook";
export * from "./TxForm.theme";
export * from "./TxForm.types";

/**
 * `TxForm.DayPicker` / `TxForm.DayPickerRange` 는 여기에 없다.
 *
 * `react-day-picker` 를 optional peer 로 두려면 코어 배럴이 그것을 import 하면 안 되기 때문에,
 * 날짜 필드는 `@txstack/ui/daypicker` 의 `TxFormDayPicker` / `TxFormDayPickerRange` 로 분리했다.
 */
export const TxForm = Object.assign(TxFormBase, {
  Field: TxFormField,
  Flex: TxFormFlex,
  Label: TxFormLabel,
  Input: TxFormInput,
  SearchInput: TxFormSearchInput,
  Textarea: TxFormTextarea,
  Dropdown: TxFormDropdown,
  DropdownMulti: TxFormDropdownMulti
});
