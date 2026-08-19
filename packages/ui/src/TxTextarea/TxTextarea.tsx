import type { ChangeEvent, KeyboardEvent } from "react";
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { cm, themeMerge } from "../tx-ui.utils";
import { useInput } from "../TxInput";
import { TxTextareaTheme } from "./TxTextarea.theme";
import { type ITxTextarea, type ITxTextareaRef } from "./TxTextarea.types";

const TxTextareaComponent = forwardRef<ITxTextareaRef, ITxTextarea>(({ readOnly = false, id, name, theme, className, focus, autoComplete, value, defaultValue, onChangedText, ...props }, ref) => {
  const stableTheme = useMemo(() => themeMerge(TxTextareaTheme, theme, "override"), [theme]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentValue, inputId, setValue } = useInput({ id, name, value, defaultValue });

  useImperativeHandle(
    ref,
    () => ({
      setValue,
      getValue: () => currentValue,
      focus: () => textareaRef.current?.focus(),
      select: () => textareaRef.current?.select()
    }),
    [currentValue, setValue]
  );

  useEffect(() => {
    if (focus) textareaRef.current?.focus();
  }, [focus]);

  const hdChange = useCallback(
    (evt: ChangeEvent<HTMLTextAreaElement>) => {
      props.onChange?.(evt);

      const text = evt.target.value;
      setValue(text);
      onChangedText?.(text);
    },
    [onChangedText, props, setValue]
  );

  const hdKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLTextAreaElement>) => {
      props.onKeyDown?.(evt);
      if (evt.key !== "Enter") return;

      onChangedText?.(evt.currentTarget.value);
    },
    [onChangedText, props]
  );

  const hdBlur = useCallback(
    (evt: React.FocusEvent<HTMLTextAreaElement>) => {
      props.onBlur?.(evt);

      onChangedText?.(evt.currentTarget.value);
    },
    [onChangedText, props]
  );

  return (
    <div data-tag="TxTextarea" className={cm(stableTheme.wrapper, stableTheme.focus, readOnly && stableTheme.readOnly, className)}>
      <textarea {...props} id={inputId} name={name} ref={textareaRef} readOnly={readOnly} autoComplete={autoComplete} className={cm(stableTheme.textarea)} value={currentValue} onChange={hdChange} onKeyDown={hdKeyDown} onBlur={hdBlur} />
    </div>
  );
});

TxTextareaComponent.displayName = "TxTextarea";

export const TxTextarea = memo(TxTextareaComponent);
