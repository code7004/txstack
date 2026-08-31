/**
 * **내부 전용.** 숫자를 화면 글자로, 화면 글자를 숫자로.
 *
 * 두 방향을 한 파일에 두는 이유는 **규칙이 하나이기 때문**이다 — 끊는 자리와 읽는 자리가
 * 갈리면 `1,000` 을 넣고 `1` 을 얻는 일이 생긴다.
 */

/** `step` 에서 소수 자릿수를 짐작한다. `0.01` 이면 2. */
export function precisionOf(step: number) {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot < 0 ? 0 : text.length - dot - 1;
}

/** 화면 글자에서 숫자를 읽는다. 콤마와 공백은 버린다. */
export function parseNumber(text: string): number | undefined {
  const cleaned = text.replace(/[,\s]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return undefined;

  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
}

/** 숫자를 화면 글자로. */
export function formatNumber(value: number, { precision, thousandSeparator }: { precision: number; thousandSeparator: boolean }) {
  const fixed = value.toFixed(precision);
  if (!thousandSeparator) return fixed;

  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fraction == null ? grouped : `${grouped}.${fraction}`;
}

/**
 * 범위 안으로 가둔다. **`min` 이 `max` 보다 큰 것도 받아 준다** —
 * 밖에서 온 값이 뒤집혀 있을 때 화면이 깨지면 안 된다.
 */
export function clamp(value: number, min?: number, max?: number) {
  let next = value;
  if (min != null && next < min) next = min;
  if (max != null && next > max) next = max;
  return next;
}

/**
 * `step` 만큼 움직인 값. **부동소수 오차를 자릿수로 잘라 낸다** —
 * `0.1 + 0.2` 가 `0.30000000000000004` 로 나오면 화면에 그대로 뜬다.
 */
export function stepBy(value: number, step: number, precision: number) {
  return Number((value + step).toFixed(precision));
}
