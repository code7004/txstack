import { forwardRef, type AriaAttributes } from "react";
import { TxCheckBox, type TxCheckBoxProps } from "../TxCheckBox";
import { TxCombobox, type TxComboboxProps } from "../TxCombobox";
import { TxDropdown, TxDropdownMulti, type TxDropdownData, type TxDropdownMultiProps, type TxDropdownProps } from "../TxDropdown";
import { TxInput, TxSearchInput, type TxInputProps, type TxInputRef, type TxSearchInputProps, type TxSearchInputRef } from "../TxInput";
import { TxTextarea, type TxTextareaProps, type TxTextareaRef } from "../TxTextarea";
import { TxFormField, useTxFormControl } from "./TxFormField";
import type { TxFormFieldSlots } from "./TxForm.types";

/**
 * 필드 = 캡션·메시지 자리 + 컨트롤 하나.
 *
 * **감싼 컴포넌트의 props 를 전부 그대로 받는다.** `className` 하나만 필드 상자가 가져간다 —
 * 그리드에 놓는 자리라서다. 컨트롤 자체는 CSS 로 겨냥한다.
 *
 * 명세: `docs/001_ui/014_TxForm.md`
 */

/** 필드가 가져가는 것 + aria 를 손수 주고 싶을 때의 통로. */
type FieldOwn = TxFormFieldSlots & { id?: string; "aria-describedby"?: string; "aria-invalid"?: AriaAttributes["aria-invalid"] };

export type TxFormInputProps = TxFormFieldSlots & TxInputProps;
export type TxFormSearchInputProps = TxFormFieldSlots & TxSearchInputProps;
export type TxFormTextareaProps = TxFormFieldSlots & TxTextareaProps;
export type TxFormCheckBoxProps = TxFormFieldSlots & TxCheckBoxProps;
export type TxFormComboboxProps = TxFormFieldSlots & TxComboboxProps;
export type TxFormDropdownProps<TData extends TxDropdownData = TxDropdownData> = TxFormFieldSlots & TxDropdownProps<TData>;
export type TxFormDropdownMultiProps<TData extends TxDropdownData = TxDropdownData> = TxFormFieldSlots & TxDropdownMultiProps<TData>;

/** 필드가 가져가는 props 와 컨트롤로 흘려보낼 props 를 가른다. */
const split = <T extends FieldOwn>({ caption, warning, error, className, id, "aria-describedby": describedBy, "aria-invalid": invalid, ...rest }: T) => ({
  own: { caption, warning, error, id, describedBy, invalid },
  className,
  rest
});

export const TxFormInput = forwardRef<TxInputRef, TxFormInputProps>(function TxFormInput(props, ref) {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "for" });

  return (
    <TxFormField {...field} className={className}>
      <TxInput ref={ref} {...rest} {...control} />
    </TxFormField>
  );
});

export const TxFormSearchInput = forwardRef<TxSearchInputRef, TxFormSearchInputProps>(function TxFormSearchInput(props, ref) {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "for" });

  return (
    <TxFormField {...field} className={className}>
      <TxSearchInput ref={ref} {...rest} {...control} />
    </TxFormField>
  );
});

export const TxFormTextarea = forwardRef<TxTextareaRef, TxFormTextareaProps>(function TxFormTextarea(props, ref) {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "for" });

  return (
    <TxFormField {...field} className={className}>
      <TxTextarea ref={ref} {...rest} {...control} />
    </TxFormField>
  );
});

export const TxFormCombobox = forwardRef<HTMLInputElement, TxFormComboboxProps>(function TxFormCombobox(props, ref) {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "for" });

  return (
    <TxFormField {...field} className={className}>
      <TxCombobox ref={ref} {...rest} {...control} />
    </TxFormField>
  );
});

/**
 * 체크박스는 **자기 이름을 이미 갖고 있다** — `label` 이 그것이다.
 * 그래서 캡션은 이름이 아니라 **묶음의 제목**으로 두고 컨트롤과 잇지 않는다.
 * 둘 다 이름으로 이으면 스크린리더가 "약관 동의합니다" 처럼 겹쳐 읽는다.
 */
export const TxFormCheckBox = forwardRef<HTMLInputElement, TxFormCheckBoxProps>(function TxFormCheckBox(props, ref) {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "none" });

  return (
    <TxFormField {...field} className={className}>
      <TxCheckBox ref={ref} {...rest} {...control} />
    </TxFormField>
  );
});

/**
 * 드롭다운의 헤드는 `<div role="combobox">` 다. **`<label for>` 가 안 먹어서**
 * 캡션에 `id` 를 주고 `aria-labelledby` 로 잇는다.
 */
export function TxFormDropdown<TData extends TxDropdownData>(props: TxFormDropdownProps<TData>) {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "labelledby" });

  return (
    <TxFormField {...field} className={className}>
      <TxDropdown {...(rest as TxDropdownProps<TData>)} {...control} />
    </TxFormField>
  );
}

export function TxFormDropdownMulti<TData extends TxDropdownData>(props: TxFormDropdownMultiProps<TData>) {
  const { own, className, rest } = split(props);
  const { field, control } = useTxFormControl({ ...own, naming: "labelledby" });

  return (
    <TxFormField {...field} className={className}>
      <TxDropdownMulti {...(rest as TxDropdownMultiProps<TData>)} {...control} />
    </TxFormField>
  );
}
