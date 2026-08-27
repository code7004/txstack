import { useCallback, useId, useState } from "react";
import type { TxInputValue } from "./TxInput.types";

interface UseInputParams {
  id?: string;
  name?: string;
  value?: TxInputValue;
  defaultValue?: TxInputValue;
}

/**
 * controlled / uncontrolled 를 한 자리에서 다룬다. **내부 전용이다.**
 *
 * `value` 를 주면 controlled 로 보고 내부 상태를 쓰지 않는다. 그래서 `setValue` 는
 * uncontrolled 일 때만 먹는다 — controlled 인데 내부에서 바꾸면 소비자 상태와 어긋난다.
 */
export function useInput({ id, name, value, defaultValue }: UseInputParams) {
  const reactId = useId();
  const inputId = id ?? name ?? reactId;
  const isControlled = value != null;

  const [innerValue, setInnerValue] = useState<string>(() => String(defaultValue ?? value ?? ""));
  const currentValue = isControlled ? String(value) : innerValue;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) setInnerValue(nextValue);
    },
    [isControlled]
  );

  return { currentValue, inputId, isControlled, setValue };
}
