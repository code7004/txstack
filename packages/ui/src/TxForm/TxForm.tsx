import type { CSSProperties } from "react";
import { cm } from "../tx-ui.utils";
import { TxFormCheckBox, TxFormCombobox, TxFormDropdown, TxFormDropdownMulti, TxFormInput, TxFormSearchInput, TxFormTextarea } from "./TxFormControls";
import { TxFormField } from "./TxFormField";
import { TxFormFlex } from "./TxFormFlex";
import { TxFormLabel } from "./TxFormLabel";
import type { TxFormProps } from "./TxForm.types";

/**
 * 폼의 바깥 껍데기. `<form>` 하나에 **줄 간격**과 **캡션 배치**를 준다.
 *
 * - `onSubmit` 은 `preventDefault` 가 이미 걸려 있다. 소비자가 다시 부를 필요가 없다
 * - `labelWidth` 를 주면 **모든 필드의 캡션이 왼쪽으로 가고** 그 너비로 정렬된다
 *
 * @example
 * ```tsx
 * <TxForm labelWidth="6rem" onSubmit={() => save(form)}>
 *   <TxForm.Input caption="이름" value={name} onChangeText={setName} />
 *   <TxForm.Dropdown caption="나이" data={AGES} value={age} onChangeNumber={setAge} />
 *   <TxForm.Flex>
 *     <TxButton type="submit" label="저장" />
 *     <TxButton type="reset" label="초기화" variant="secondary" />
 *   </TxForm.Flex>
 * </TxForm>
 * ```
 *
 * 명세: `docs/001_ui.md`
 */
export const TxFormBase = ({ labelWidth, className, style, onSubmit, children, ...props }: TxFormProps) => {
  /*
    핸들러를 useCallback 으로 감싸지 않는다. 소비자는 onSubmit 을 인라인으로 주는 것이 보통이라
    deps 가 매 렌더 바뀌고, <form> 은 memo 된 자식도 아니라 안정화해서 얻는 것이 없다.
    원본은 여기에 useMemo 둘과 useCallback 하나를 뒀는데 셋 다 같은 이유로 헛일이었다.
  */
  const hdSubmit: NonNullable<TxFormProps["onSubmit"]> = (evt) => {
    evt.preventDefault();
    onSubmit?.(evt);
  };

  return (
    <form
      {...props}
      className={cm("tx-form", className)}
      // 배치는 CSS 가 정한다. 값을 변수로 내려보내므로 Context 도 리렌더도 없다.
      style={labelWidth == null ? style : ({ ...style, "--tx-form-label-width": labelWidth } as CSSProperties)}
      data-tag="TxForm"
      data-label-width={labelWidth == null ? undefined : ""}
      onSubmit={hdSubmit}
    >
      {children}
    </form>
  );
};

/**
 * `TxForm.DayPicker` / `TxForm.DayPickerRange` 는 **여기에 없다.**
 *
 * 코어 배럴이 `react-day-picker` 를 import 하면 optional peer 가 성립하지 않는다.
 * 날짜 필드는 `@txstack/ui/daypicker` 의 `TxFormDayPicker` · `TxFormDayPickerRange` 다.
 */
export const TxForm = Object.assign(TxFormBase, {
  Field: TxFormField,
  Flex: TxFormFlex,
  Label: TxFormLabel,
  Input: TxFormInput,
  SearchInput: TxFormSearchInput,
  Textarea: TxFormTextarea,
  Dropdown: TxFormDropdown,
  DropdownMulti: TxFormDropdownMulti,
  CheckBox: TxFormCheckBox,
  Combobox: TxFormCombobox
});
