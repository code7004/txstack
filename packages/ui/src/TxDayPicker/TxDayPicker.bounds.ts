import type { Matcher } from "react-day-picker";
import { startOfDay, startOfMonth } from "./TxDayPicker.utils";

/**
 * `min` · `max` 를 달력이 막을 날로. **내부 전용이다.**
 *
 * 둘을 한 matcher(`{ before, after }`)에 담지 않는다 — `react-day-picker` 는 두 끝을 함께 받으면
 * 순서에 따라 "사이를 막기" 로 읽기도 한다. 따로 담으면 늘 "밖을 막기" 다.
 * 비교는 날짜 단위다(라이브러리가 달력 일수로 잰다) — 그날은 고를 수 있다.
 */
export function boundMatchers(min: Date | undefined, max: Date | undefined): Matcher[] {
  const matchers: Matcher[] = [];
  if (min) matchers.push({ before: startOfDay(min) });
  if (max) matchers.push({ after: startOfDay(max) });
  return matchers;
}

/**
 * 펴 놓을 첫 달을 범위 안으로 당긴다. **달 `count` 개가 모두 범위 안에 들도록** 한다 —
 * 두 달을 펴 놓을 때 첫 달이 `max` 의 달이면 둘째 달이 범위 밖이 된다.
 */
export function clampFirstMonth(month: Date, count: number, min: Date | undefined, max: Date | undefined): Date {
  let first = month;
  if (max) {
    const last = startOfMonth(max, -(count - 1));
    if (first > last) first = last;
  }
  if (min) {
    const start = startOfMonth(min);
    if (first < start) first = start;
  }
  return first;
}
