import { isValidElement, type ReactNode } from "react";
import type { TxDialogInput, TxDialogLabels, TxDialogOptions } from "./TxDialog.types";

/**
 * **내부 전용.** 띄울 창들을 줄 세워 두는 자리.
 *
 * React 바깥(axios 인터셉터·유틸 함수)에서 부를 수 있어야 하므로 상태가 컴포넌트 밖에 있다.
 * 화면은 `useSyncExternalStore` 로 이 줄의 맨 앞을 본다.
 */

export interface TxDialogRequest {
  id: number;
  kind: "alert" | "confirm";
  options: TxDialogOptions;
  settle: (result: boolean) => void;
}

const DEFAULT_LABELS: Required<TxDialogLabels> = { confirm: "확인", cancel: "취소" };

let labels: Required<TxDialogLabels> = DEFAULT_LABELS;
let queue: TxDialogRequest[] = [];
let nextId = 0;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/**
 * 맨 앞의 요청. **같은 요청이면 같은 객체를 돌려준다** —
 * `useSyncExternalStore` 는 스냅샷이 매번 새 값이면 무한히 다시 그린다.
 */
export const getCurrent = () => queue[0] ?? null;

/** 서버에서는 띄울 창이 없다. */
export const getServerCurrent = () => null;

export const getLabels = () => labels;

export function configure(next: { labels?: TxDialogLabels }) {
  if (next.labels) labels = { ...labels, ...next.labels };
}

/** 문구 하나를 준 것과 옵션 객체를 준 것을 가른다. */
export function toOptions(input: TxDialogInput): TxDialogOptions {
  if (input == null) return {};
  if (typeof input === "object" && !isValidElement(input) && !Array.isArray(input)) return input as TxDialogOptions;

  return { message: input as ReactNode };
}

/**
 * 줄 끝에 세우고, 답이 나올 때까지 기다리는 약속을 돌려준다.
 *
 * **겹쳐 띄우지 않는다.** 세 번을 연달아 불러도 하나씩 차례로 뜬다 —
 * 네이티브 `alert` 이 그렇듯 사용자는 한 번에 하나만 답할 수 있다.
 */
export function enqueue(kind: TxDialogRequest["kind"], options: TxDialogOptions) {
  return new Promise<boolean>((resolve) => {
    queue = [...queue, { id: (nextId += 1), kind, options, settle: resolve }];
    emit();
  });
}

/** 맨 앞 요청에 답하고 줄에서 뺀다. */
export function settle(id: number, result: boolean) {
  const request = queue.find((item) => item.id === id);
  if (!request) return;

  queue = queue.filter((item) => item.id !== id);
  emit();
  request.settle(result);
}

/** **테스트 전용.** 남은 요청을 모두 취소로 끝낸다. */
export function resetForTest() {
  const pending = queue;
  queue = [];
  labels = DEFAULT_LABELS;
  emit();
  pending.forEach((request) => request.settle(false));
}
