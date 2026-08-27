import { useMemo, useState } from "react";
import type { TxDropdownData, TxDropdownItem, TxDropdownProps, TxDropdownValueOf } from "./TxDropdown.types";
import { emitByType, toItems } from "./TxDropdown.utils";
import { TxDropdownShell } from "./TxDropdownShell";

const NO_CHOICE: TxDropdownItem<undefined> = { name: "선택 안 함", value: undefined };

/**
 * 하나를 고르는 드롭다운.
 *
 * ```tsx
 * <TxDropdown data={["서울", "부산", "대구"]} onChangeText={setCity} />
 * <TxDropdown data={[1, 2, 3]} value={qty} onChangeNumber={setQty} />
 * ```
 *
 * `data` 는 원시값 배열이나 `{ name, value }` 배열을 받는다. **값의 타입이 `data` 에서 추론되어**
 * 숫자 배열을 주면 `onChangeNumber` 가 숫자를 준다 — 세터를 그대로 꽂아도 된다.
 *
 * `value` 를 주면 controlled 다. **`value={undefined}` 도 값으로 친다** — prop 자체를 생략한 것과
 * 다르게, 값이 `undefined` 인 항목이 골라진 것으로 본다.
 *
 * 목록은 화면 맨 위 층으로 띄운다. `overflow: hidden` 안에 넣어도 잘리지 않고,
 * 아래가 좁으면 위로 뒤집는다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-dropdown { --tx-dropdown-height: … }`.
 *
 * 명세: `docs/001_ui.md`
 */
export function TxDropdown<TData extends TxDropdownData>(props: TxDropdownProps<TData>) {
  const { data, value, addNoChoiceItem, fixedHead, placeholder = "선택", onChangeValue, onChangeText, onChangeNumber, onChangeBool, ...shell } = props;

  // prop 을 아예 안 준 것과 `value={undefined}` 를 준 것을 구분한다.
  const isControlled = Object.hasOwn(props, "value");
  const [inner, setInner] = useState<{ value: unknown } | null>(null);

  /** controlled 면 `{ value }`, uncontrolled 면 아직 안 골랐을 때 `null` 이다. */
  const picked = useMemo(() => (isControlled ? { value } : inner), [isControlled, value, inner]);

  const items = useMemo(() => {
    const base = toItems(data);
    return addNoChoiceItem ? [NO_CHOICE, ...base] : base;
  }, [data, addNoChoiceItem]);

  const shellItems = useMemo(() => items.map((item) => ({ item, selected: picked != null && item.value === picked.value })), [items, picked]);

  const selected = shellItems.find((i) => i.selected)?.item;
  const head = fixedHead ?? selected?.name ?? placeholder;

  const hdPick = (index: number) => {
    const item = items[index];
    if (!item) return;

    if (!isControlled) setInner({ value: item.value });

    onChangeValue?.(item as TxDropdownItem<TxDropdownValueOf<TData> | undefined>);
    emitByType(item.value, { text: onChangeText, number: onChangeNumber, bool: onChangeBool });
  };

  return <TxDropdownShell {...shell} items={shellItems} head={head} empty={selected == null && fixedHead == null} multiple={false} onPick={hdPick} closeOnPick />;
}
