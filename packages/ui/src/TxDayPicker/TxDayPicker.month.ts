import { useState } from "react";
import { startOfMonth } from "./TxDayPicker.utils";

/** `first` 부터 `count` 달을 펴 놓았을 때, 그 안에 보이는 달인가. */
const isVisible = (target: Date, first: Date, count: number) => target >= first && target < startOfMonth(first, count);

/**
 * 달력이 펴 놓을 달. **내부 전용이다.**
 *
 * `react-day-picker` 에 `month` 로 준다 — 넘기는 것은 `onMonthChange` 로 되받는다.
 *
 * 규칙은 둘이다.
 *
 * 1. **열 때는 값의 달로 맞춘다.** 지난번에 넘겨 놓고 닫은 달이 남아 있으면 안 된다.
 *    아직 고른 것이 없으면 이번 달이다
 * 2. **밖에서 들어온 값이 지금 안 보이는 달이면 그 달로 옮긴다.** "최근 7일" 같은 프리셋이
 *    이 길로 온다 — `ref` 로 넣든 `value` 로 넣든 같다
 *
 * **달력 안에서 고른 것은 화면을 옮기지 않는다.** 이미 보이는 달이라 2번에 걸리지 않는다 —
 * 두 달을 펴 놓고 오른쪽 달에서 시작일을 고를 때 화면이 옆으로 밀리면 고르던 자리가 사라진다.
 */
export function useVisibleMonth(anchor: Date | undefined, open: boolean, numberOfMonths = 1) {
  const [month, setMonth] = useState(() => startOfMonth(anchor ?? new Date()));

  /**
   * 값과 열림이 바뀌었는지 **렌더 중에** 본다. effect 로 미루면 다시 열 때 한 프레임 동안
   * 옛 달이 비쳤다가 넘어간다.
   */
  const [prev, setPrev] = useState({ open, time: anchor?.getTime() });
  const time = anchor?.getTime();

  if (prev.open !== open || prev.time !== time) {
    setPrev({ open, time });

    const target = anchor && startOfMonth(anchor);

    if (open && !prev.open) setMonth(target ?? startOfMonth(new Date()));
    else if (target && !isVisible(target, month, numberOfMonths)) setMonth(target);
  }

  return [month, setMonth] as const;
}
