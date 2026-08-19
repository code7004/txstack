import { forwardRef } from "react";
import { TxTextarea, type ITxTextarea, type ITxTextareaRef } from "../TxTextarea";
import { TxFormField } from "./TxFormField";
import type { ITxFormFieldProps } from "./TxForm.types";

export const TxFormTextarea = forwardRef<ITxTextareaRef, ITxFormFieldProps & ITxTextarea>(({ caption, warning, error, className, theme, ...textareaProps }, ref) => {
  return (
    <TxFormField data-tag="TxForm.Textarea" caption={caption} warning={warning} error={error} className={className}>
      <TxTextarea ref={ref} {...textareaProps} className="w-full" theme={theme} />
    </TxFormField>
  );
});

TxFormTextarea.displayName = "TxForm.Textarea";
