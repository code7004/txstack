import type { TxDropdownData, TxDropdownItem } from "./TxDropdown.types";

/** 원시값이든 객체든 `TxDropdownItem` 한 모양으로 맞춘다. **내부 전용이다.** */
export function toItems(data: TxDropdownData | undefined): TxDropdownItem<unknown>[] {
  if (!data) return [];

  return data.map((entry) => (typeof entry === "object" && entry !== null ? entry : { name: String(entry), value: entry }));
}

/**
 * 고른 값을 타입에 맞는 콜백으로 흘려보낸다. **내부 전용이다.**
 *
 * 값이 `undefined` 면 **주어진 콜백 전부**에 `undefined` 를 준다. 어느 타입을 기대하는지
 * 알 수 없고, 선택이 풀렸다는 것은 모든 자리에 알려야 하기 때문이다.
 */
export function emitByType(value: unknown, cb: { text?: (v: string | undefined) => void; number?: (v: number | undefined) => void; bool?: (v: boolean | undefined) => void }) {
  if (value === undefined) {
    cb.text?.(undefined);
    cb.number?.(undefined);
    cb.bool?.(undefined);
    return;
  }

  if (typeof value === "string") cb.text?.(value);
  else if (typeof value === "number") cb.number?.(value);
  else if (typeof value === "boolean") cb.bool?.(value);
}
