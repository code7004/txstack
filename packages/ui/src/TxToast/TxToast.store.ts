import { isValidElement } from "react";
import type { TxToastConfig, TxToastInput, TxToastOptions, TxToastPosition } from "./TxToast.types";

/**
 * **내부 전용.** 지금 떠 있는 알림들.
 *
 * React 바깥(axios 인터셉터·유틸 함수)에서 부를 수 있어야 하므로 상태가 컴포넌트 밖에 있다.
 * 화면은 `useSyncExternalStore` 로 이 목록을 본다.
 *
 * **`TxDialog` 와 다른 점은 하나** — 확인창은 한 번에 하나씩 차례로 뜨지만(사용자가 한 번에
 * 하나만 답할 수 있으므로), 알림은 **여럿이 함께 쌓인다.** 답을 받는 것이 아니기 때문이다.
 */

export interface TxToastItem extends Required<Pick<TxToastOptions, "variant" | "duration">> {
  id: number;
  title?: TxToastOptions["title"];
  message: TxToastOptions["message"];
  closeLabel?: string;
}

const DEFAULT_CONFIG: Required<TxToastConfig> = { position: "top-right", duration: 4000, max: 4 };

let config: Required<TxToastConfig> = DEFAULT_CONFIG;
let items: TxToastItem[] = [];
let nextId = 0;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/**
 * 지금 떠 있는 것들. **바뀌지 않았으면 같은 배열을 돌려준다** —
 * `useSyncExternalStore` 는 스냅샷이 매번 새 값이면 무한히 다시 그린다.
 */
export const getItems = () => items;

/** 서버에서는 뜰 것이 없다. */
export const getServerItems: () => TxToastItem[] = () => EMPTY;
const EMPTY: TxToastItem[] = [];

export const getPosition = (): TxToastPosition => config.position;

export function configure(next: TxToastConfig) {
  config = { ...config, ...next };
  emit();
}

/** 문구 하나를 준 것과 옵션 객체를 준 것을 가른다. */
export function toOptions(input: TxToastInput): TxToastOptions {
  if (input == null) return {};
  if (typeof input === "object" && !isValidElement(input) && !Array.isArray(input)) return input as TxToastOptions;

  return { message: input };
}

/**
 * 하나 띄우고 그 번호를 돌려준다. 그 번호로 나중에 직접 닫을 수 있다.
 *
 * **`max` 를 넘으면 가장 오래된 것부터 사라진다.** 화면이 알림으로 덮이면
 * 정작 새로 온 것을 못 본다.
 */
export function add(options: TxToastOptions) {
  const id = (nextId += 1);
  const item: TxToastItem = {
    id,
    variant: options.variant ?? "info",
    duration: options.duration ?? config.duration,
    title: options.title,
    message: options.message,
    closeLabel: options.closeLabel
  };

  items = [...items, item].slice(-config.max);
  emit();

  return id;
}

export function dismiss(id: number) {
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return;

  items = next;
  emit();
}

export function dismissAll() {
  if (items.length === 0) return;

  items = EMPTY;
  emit();
}

/** **테스트 전용.** 떠 있는 것과 설정을 처음으로 되돌린다. */
export function resetForTest() {
  items = EMPTY;
  config = DEFAULT_CONFIG;
  nextId = 0;
  emit();
}
