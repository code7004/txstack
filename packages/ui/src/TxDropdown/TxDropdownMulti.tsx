import { useEffect, useMemo, useRef, useState } from "react";
import type { ITxDropdownData, ITxDropdownItem, InferDropdownValue } from ".";
import { TxDropdownBase } from "./TxDropdownBase";
import { normalizeMulti } from "./utils";

export interface ITxDropdownMultiProps<TData extends ITxDropdownData = ITxDropdownData> {
  value?: InferDropdownValue<TData>[];
  data: TData;

  caption?: string;
  warning?: string;
  error?: string;
  className?: string;
  fixedHead?: string;
  defaultHead?: string;
  maxHeight?: number | string;

  locale?: (k: string) => string;

  defaultAllCheck?: boolean;

  onChangeValue?: (items: ITxDropdownItem<InferDropdownValue<TData>>[]) => void;
  onChangeText?: (values: string[]) => void;
  onChangeNumb?: (values: number[]) => void;
  onChangeBool?: (values: boolean[]) => void;

  onSubmitValue?: (items: ITxDropdownItem<InferDropdownValue<TData>>[]) => void;
  onSubmitText?: (values: string[]) => void;
  onSubmitNumb?: (values: number[]) => void;
  onSubmitBool?: (values: boolean[]) => void;
  onClose?: (values: string[]) => void;
}

export const TxDropdownMulti = <TData extends ITxDropdownData>({ data, value, locale = (k) => k, fixedHead, defaultHead = "Choose", defaultAllCheck = false, ...props }: ITxDropdownMultiProps<TData>) => {
  const [xvalue, _xvalue] = useState<InferDropdownValue<TData>[] | undefined>();
  const { onChangeValue, onChangeText, onChangeNumb, onChangeBool, onSubmitValue, onSubmitText, onSubmitNumb, onSubmitBool, onClose, ...baseProps } = props;

  const actualValue = value !== undefined ? value : xvalue;
  const items = useMemo(() => normalizeMulti(data, actualValue), [data, actualValue]);

  const head = useMemo(() => {
    const checkedItems = items?.filter((i) => i.checked);

    if (!checkedItems) return "";

    if (checkedItems.length === 0) {
      return locale(fixedHead || defaultHead);
    } else if (checkedItems.length === items.length) {
      return fixedHead || `전체 ${checkedItems.length} ${locale("items")}`;
    } else {
      return fixedHead || `선택 ${checkedItems.length} ${locale("items")}`;
    }
  }, [items, fixedHead, defaultHead, locale]);

  const appliedDefaultAllRef = useRef(false);

  useEffect(() => {
    if (appliedDefaultAllRef.current) return;

    if (value === undefined && data?.length > 0 && defaultAllCheck) {
      const allValues = data.map((d) => (typeof d === "object" ? d.value : d)) as InferDropdownValue<TData>[];

      _xvalue(allValues);
      appliedDefaultAllRef.current = true;
    }
  }, [data, value, defaultAllCheck]);

  useEffect(() => {
    if (value !== undefined) {
      _xvalue(value);
    }
  }, [value]);

  function emitItems(items: ITxDropdownItem<InferDropdownValue<TData>>[], mode: "change" | "submit") {
    const values = items.map((i) => i.value) as InferDropdownValue<TData>[];
    const dataSample = data.find((item) => item !== undefined);
    const sampleValue = values[0] ?? (typeof dataSample === "object" && dataSample !== null ? dataSample.value : dataSample);

    if (value === undefined && mode === "change") {
      _xvalue(values);
    }

    if (mode === "change") onChangeValue?.(items);
    if (mode === "submit") onSubmitValue?.(items);

    if (typeof sampleValue === "string") {
      if (mode === "change") onChangeText?.(values as string[]);
      if (mode === "submit") onSubmitText?.(values as string[]);
    }
    if (typeof sampleValue === "number") {
      if (mode === "change") onChangeNumb?.(values as number[]);
      if (mode === "submit") onSubmitNumb?.(values as number[]);
    }
    if (typeof sampleValue === "boolean") {
      if (mode === "change") onChangeBool?.(values as boolean[]);
      if (mode === "submit") onSubmitBool?.(values as boolean[]);
    }
  }

  function hdChange(items: ITxDropdownItem<InferDropdownValue<TData>>[]) {
    emitItems(items, "change");
  }

  function hdSubmit(items: ITxDropdownItem<InferDropdownValue<TData>>[]) {
    emitItems(items, "submit");
  }

  function hdClose(items: ITxDropdownItem<InferDropdownValue<TData>>[]) {
    const values = items.map((i) => i.value) as InferDropdownValue<TData>[];
    onClose?.(values as string[]);
  }

  const hasSubmit = !!onSubmitText || !!onSubmitValue || !!onSubmitNumb || !!onSubmitBool;
  const hasClose = !!onClose;

  return <TxDropdownBase {...baseProps} data={items} locale={locale} head={head} multiple={true} onChangeInternal={hdChange} onSubmitInternal={hasSubmit ? hdSubmit : undefined} onCloseInternal={hasClose ? hdClose : undefined} />;
};
