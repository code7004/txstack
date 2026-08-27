import { useEffect, useMemo, useRef, useState } from "react";
import type { TxDropdownData, TxDropdownItem, TxDropdownMultiProps, TxDropdownValueOf } from "./TxDropdown.types";
import { toItems } from "./TxDropdown.utils";
import { TxDropdownShell } from "./TxDropdownShell";

const same = (a: readonly unknown[], b: readonly unknown[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * 여럿을 고르는 드롭다운.
 *
 * ```tsx
 * <TxDropdownMulti data={["서울", "부산", "대구"]} onChangeText={setCities} />
 * ```
 *
 * 맨 위에 "전체 선택" 줄이 있고, 고른 개수가 헤더에 나온다.
 *
 * **`onSubmit*` 을 주면 "확인" 버튼이 생기고 `onChange*` 는 불리지 않는다.**
 * 여러 개를 고르는 동안 값이 바뀔 때마다 서버를 치지 않으려는 자리에 쓴다 — 버튼을 누를 때 한 번만 온다.
 * 확인하지 않고 닫으면 열기 전 상태로 되돌아간다.
 *
 * 명세: `docs/001_ui.md`
 */
export function TxDropdownMulti<TData extends TxDropdownData>(props: TxDropdownMultiProps<TData>) {
  const {
    data,
    value,
    defaultAllChecked = false,
    fixedHead,
    placeholder = "선택",
    locale = (t) => t,
    submitLabel,
    onChangeValue,
    onChangeText,
    onChangeNumber,
    onChangeBool,
    onSubmitValue,
    onSubmitText,
    onSubmitNumber,
    onSubmitBool,
    ...shell
  } = props;

  const items = useMemo(() => toItems(data), [data]);
  const isControlled = value !== undefined;
  const useSubmit = Boolean(onSubmitValue || onSubmitText || onSubmitNumber || onSubmitBool);

  const [inner, setInner] = useState<unknown[]>(() => (defaultAllChecked ? items.map((i) => i.value) : []));
  const committed = isControlled ? (value as unknown[]) : inner;

  /**
   * 확인 버튼 모드에서는 **누르기 전까지 밖으로 나가지 않는다.**
   * 그래서 고르는 동안의 값을 따로 들고, 확인하면 넘기고 그냥 닫으면 버린다.
   */
  const [draft, setDraft] = useState<unknown[] | null>(null);
  const current = draft ?? committed;

  // controlled 가 아닌데 data 가 늦게 도착하는 경우가 있다. 그때 한 번만 전체 선택을 적용한다.
  const appliedAll = useRef(false);
  useEffect(() => {
    if (isControlled || !defaultAllChecked || appliedAll.current || items.length === 0) return;
    appliedAll.current = true;
    setInner(items.map((i) => i.value));
  }, [isControlled, defaultAllChecked, items]);

  const shellItems = useMemo(() => items.map((item) => ({ item, selected: current.includes(item.value) })), [items, current]);

  const head = useMemo(() => {
    if (fixedHead) return fixedHead;

    const count = shellItems.filter((i) => i.selected).length;
    if (count === 0) return placeholder;
    if (count === items.length) return `${locale("전체")} ${count}`;
    return `${locale("선택")} ${count}`;
  }, [fixedHead, placeholder, shellItems, items.length, locale]);

  const emit = (values: unknown[], mode: "change" | "submit") => {
    const picked = items.filter((i) => values.includes(i.value)) as TxDropdownItem<TxDropdownValueOf<TData>>[];

    if (mode === "change") onChangeValue?.(picked);
    else onSubmitValue?.(picked);

    /**
     * 값의 타입을 **`data` 의 첫 항목이 아니라 고른 값들에서** 본다.
     * 첫 항목만 보면 섞인 배열에서 틀린 콜백이 불린다.
     */
    const texts = values.filter((v): v is string => typeof v === "string");
    const numbers = values.filter((v): v is number => typeof v === "number");
    const bools = values.filter((v): v is boolean => typeof v === "boolean");

    if (mode === "change") {
      if (onChangeText) onChangeText(texts);
      if (onChangeNumber) onChangeNumber(numbers);
      if (onChangeBool) onChangeBool(bools);
    } else {
      if (onSubmitText) onSubmitText(texts);
      if (onSubmitNumber) onSubmitNumber(numbers);
      if (onSubmitBool) onSubmitBool(bools);
    }
  };

  const apply = (next: unknown[]) => {
    if (useSubmit) {
      setDraft(next);
      return;
    }

    if (!isControlled) setInner(next);
    emit(next, "change");
  };

  const hdPick = (index: number) => {
    const item = items[index];
    if (!item) return;

    const next = current.includes(item.value) ? current.filter((v) => v !== item.value) : [...current, item.value];
    apply(next);
  };

  const hdPickAll = () => {
    const all = items.map((i) => i.value);
    apply(same(current, all) ? [] : all);
  };

  const hdSubmit = () => {
    const next = current;
    setDraft(null);
    if (!isControlled) setInner(next);
    emit(next, "submit");
  };

  // 확인하지 않고 닫으면 고르던 것을 버린다.
  const hdClosed = () => setDraft(null);

  return (
    <TxDropdownShell
      {...shell}
      locale={locale}
      items={shellItems}
      head={head}
      empty={shellItems.every((i) => !i.selected) && fixedHead == null}
      multiple
      onPick={hdPick}
      onPickAll={hdPickAll}
      onSubmit={useSubmit ? hdSubmit : undefined}
      submitLabel={submitLabel}
      onClosed={useSubmit ? hdClosed : undefined}
    />
  );
}
