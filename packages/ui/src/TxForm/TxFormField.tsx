import { forwardRef, memo } from "react";
import { cm } from "../tx-ui.utils";
import { useFormField } from "./TxForm.hook";
import type { ITxFormFieldProps } from "./TxForm.types";

export const TxFormField = memo(
  forwardRef<HTMLDivElement, ITxFormFieldProps>(({ caption, warning, error, children, className, theme, ...props }, ref) => {
    const stableTheme = useFormField(theme);

    return (
      <div ref={ref} data-tag="TxForm.Field" className={cm(stableTheme.container, className)} {...props}>
        {caption && <div className={stableTheme.caption}>{caption}</div>}
        {children}
        {warning && <div className={stableTheme.warning}>warning {warning}</div>}
        {error && <div className={stableTheme.error}>error {error}</div>}
      </div>
    );
  })
);

TxFormField.displayName = "TxForm.Field";
