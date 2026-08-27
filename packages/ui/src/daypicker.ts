/**
 * `@txstack/ui/daypicker` — 날짜와 기간을 고르는 컴포넌트.
 *
 * `react-day-picker` 는 **optional peerDependency** 다. 이 서브패스를 import 하는 소비자만
 * 설치하면 된다.
 *
 * ```sh
 * pnpm add @txstack/ui react-day-picker
 * ```
 *
 * **스타일은 따로 import 하지 않는다.** `@txstack/ui/styles.css` 에 달력까지 들어 있다 —
 * `react-day-picker` 의 CSS 를 쓰지 않고 우리가 직접 그리기 때문이다.
 *
 * **루트 배럴(`src/index.ts`)에서 이 파일을 참조하지 않는다.** 참조하는 순간 분리가 무너진다.
 */
export { TxDayPicker, TxDayPickerRange } from "./TxDayPicker";
export type { TxDateRange, TxDayPickerProps, TxDayPickerRangeProps, TxDayPickerRangeRef } from "./TxDayPicker";
