/**
 * 최근 N일 구간을 `[시작(00:00:00.000), 오늘 끝(23:59:59.999)]` 로 만든다.
 *
 * 원본은 dayjs 를 썼지만, 이 한 함수 때문에 코어 번들에 dayjs 를 넣을 이유가 없어
 * 네이티브 `Date` 로 대체했다. 동작은 동일하다.
 */
export function numberToPeriod(value: number): Date[] {
  const start = new Date();
  start.setDate(start.getDate() - value + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return [start, end];
}
