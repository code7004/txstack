import type { ChangeEvent } from "react";
import type React from "react";
import type { TxTextareaTheme } from "./TxTextarea.theme";
import { type DeepPartial } from "../tx-ui.utils";

export interface ITxTextarea extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "autoComplete"> {
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;

  onChangedText?: (value: string) => void;

  focus?: boolean;
  value?: string;
  defaultValue?: string;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  theme?: DeepPartial<typeof TxTextareaTheme>;
}

export interface ITxTextareaRef {
  setValue: (v: string) => void;
  getValue: () => string;
  focus: () => void;
  select: () => void;
}
