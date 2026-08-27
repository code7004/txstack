/**
 * 입력 문자열을 숫자로 읽는다. 읽을 수 없으면 `undefined`.
 *
 * **내부 전용이다.** 배럴에서 내보내지 않는다.
 */
export function parseTxInputNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;

  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}
