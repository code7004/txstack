import type { ClassNames } from "react-day-picker";

/**
 * `react-day-picker` 의 내부 클래스 이름을 우리 것으로 갈아끼운다. **내부 전용이다.**
 *
 * **그쪽 `dist/style.css` 를 import 하지 않는다.** 그러면
 *
 * - 소비자는 여전히 `@txstack/ui/styles.css` 하나만 import 하면 된다
 * - 소비자의 번들러가 `node_modules` 안의 CSS 를 처리할 수 있어야 할 이유가 없다
 * - 그쪽이 버전을 올려 클래스 구조를 바꿔도 우리 규칙이 조용히 깨지지 않는다
 *
 * 대신 **레이아웃까지 우리가 전부 그린다**. 여기 적힌 이름이 곧 `TxDayPicker.css` 의 목차다.
 */
export const CALENDAR_CLASS_NAMES = {
  root: "tx-daypicker__calendar",
  months: "tx-daypicker__months",
  month: "tx-daypicker__month",
  month_caption: "tx-daypicker__caption",
  caption_label: "tx-daypicker__caption-label",
  nav: "tx-daypicker__nav",
  button_previous: "tx-daypicker__nav-button",
  button_next: "tx-daypicker__nav-button",
  chevron: "tx-daypicker__chevron",
  month_grid: "tx-daypicker__grid",
  weekdays: "tx-daypicker__weekdays",
  weekday: "tx-daypicker__weekday",
  week: "tx-daypicker__week",
  day: "tx-daypicker__day",
  day_button: "tx-daypicker__day-button",
  today: "tx-daypicker__day--today",
  outside: "tx-daypicker__day--outside",
  disabled: "tx-daypicker__day--disabled",
  hidden: "tx-daypicker__day--hidden",
  selected: "tx-daypicker__day--selected",
  range_start: "tx-daypicker__day--range-start",
  range_end: "tx-daypicker__day--range-end",
  range_middle: "tx-daypicker__day--range-middle"
} satisfies Partial<ClassNames>;
