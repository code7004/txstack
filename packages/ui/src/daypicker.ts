/**
 * @txstack/ui/daypicker — 날짜/기간 선택 컴포넌트.
 *
 * `react-day-picker` 와 `dayjs` 를 optional peerDependency 로 요구한다.
 * 이 모듈은 `react-day-picker/dist/style.css` 를 import 하므로, 소비자의 번들러가
 * CSS import 를 처리할 수 있어야 한다.
 *
 * ```sh
 * pnpm add @txstack/ui react-day-picker dayjs
 * ```
 *
 * 코어의 `TxForm` 에는 `.DayPicker` 가 붙어 있지 않다. 대신 여기서 `TxFormDayPicker` /
 * `TxFormDayPickerRange` 를 직접 가져다 쓴다.
 */
export * from "./TxDayPicker";
export * from "./TxForm/TxFormDayPicker";
