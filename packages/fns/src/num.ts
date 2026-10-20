/**
 * 숫자 판정 · 변환 · 포맷.
 *
 * ```ts
 * import { formatNumber } from "@txstack/fns";
 * formatNumber(1234567); // "1,234,567"
 * ```
 *
 * 포맷 함수는 **빈 값을 0 으로 그린다** — `null` · `undefined` · `NaN` · 숫자가 아닌 문자열 모두.
 * 표나 카드에서 칸이 비는 것보다 덜 어색하다. 다른 글자가 필요하면 `fallback` 을 준다.
 * 로케일은 주지 않으면 실행 환경의 것을 쓴다.
 */

/** 포맷 함수가 받는 값. 숫자 문자열도 받는다 */
export type Numberish = number | string | null | undefined;

/** `Intl.NumberFormat` 옵션에 두 가지를 더했다 */
export type FormatOptions = Intl.NumberFormatOptions & {
  /** 기본은 실행 환경의 로케일 */
  locale?: string;
  /** 값이 비었을 때 0 대신 돌려줄 글자 */
  fallback?: string;
};

/**
 * 유한한 숫자로 읽히는가. 숫자 문자열(`"1.5"` · `"1e3"`)도 참이다.
 * 빈 문자열 · 공백 · 콤마가 든 문자열(`"1,234"`) · 배열은 거짓이다.
 */
export function isNumeric(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string" || value.trim() === "") return false;
  return Number.isFinite(Number(value));
}

/**
 * 숫자로 바꾼다. 바꿀 수 없으면 `fallback`(없으면 `undefined`).
 * `null` 도 바꿀 수 없는 값으로 본다 — `Number(null)` 처럼 0 이 되지 않는다.
 */
export function toNumber(value: unknown): number | undefined;
export function toNumber(value: unknown, fallback: number): number;
export function toNumber(value: unknown, fallback?: number): number | undefined {
  return isNumeric(value) ? Number(value) : fallback;
}

/** 포맷용 — 빈 값이면 `undefined` */
function read(value: Numberish): number | undefined {
  return toNumber(value);
}

function intl(value: number, options: FormatOptions, defaults: Intl.NumberFormatOptions = {}): string {
  const { locale, fallback: _fallback, ...rest } = options;
  return new Intl.NumberFormat(locale, { ...defaults, ...rest }).format(value);
}

/**
 * 자릿수 구분 기호를 넣는다. 옵션은 `Intl.NumberFormat` 의 것을 그대로 받는다.
 *
 * @example
 * format(1234.5678)                                      // "1,234.568"
 * format(1234.5678, { maximumFractionDigits: 2 })        // "1,234.57"
 * format(12345, { style: "currency", currency: "KRW" })  // "₩12,345"
 * format(null)                                           // "0"
 * format(null, { fallback: "-" })                        // "-"
 */
export function formatNumber(value: Numberish, options: FormatOptions = {}): string {
  const n = read(value);
  if (n === undefined && options.fallback !== undefined) return options.fallback;
  return intl(n ?? 0, options);
}

/**
 * 비율(0~1)을 백분율로. 소수 자릿수는 **고정**이다 — `0.5` 는 `"50.0%"`.
 *
 * @example
 * percent(0.1234)     // "12.3%"
 * percent(0.1234, 2)  // "12.34%"
 */
export function formatPercent(ratio: Numberish, digits: number = 1, options: FormatOptions = {}): string {
  const n = read(ratio);
  if (n === undefined && options.fallback !== undefined) return options.fallback;
  return intl(n ?? 0, options, { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/**
 * 큰 수를 짧게. 단위는 로케일을 따른다 — `ko-KR` 이면 만 · 억, `en-US` 면 K · M.
 *
 * @example
 * compact(12000, { locale: "ko-KR" })  // "1.2만"
 * compact(12000, { locale: "en-US" })  // "12K"
 */
export function formatCompact(value: Numberish, options: FormatOptions = {}): string {
  const n = read(value);
  if (n === undefined && options.fallback !== undefined) return options.fallback;
  return intl(n ?? 0, options, { notation: "compact", maximumFractionDigits: 1 });
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

/**
 * 바이트 수를 읽기 쉽게. 1024 기준이고 PB 에서 멈춘다. 소수 끝의 0 은 지운다.
 * 음수와 빈 값은 `"0 B"`. 로케일을 쓰지 않는다 — 소수점은 늘 `.` 이다.
 *
 * @example
 * bytes(1536)       // "1.5 KB"
 * bytes(5_300_000)  // "5.05 MB"
 */
export function formatBytes(value: Numberish, decimals: number = 2): string {
  const n = read(value);
  if (n === undefined || n <= 0) return "0 B";

  // 로그로 자릿수를 구하면 1024 의 거듭제곱 경계에서 부동소수 오차로 한 단계 아래가 나올 수 있다
  let index = 0;
  let scaled = n;
  while (scaled >= 1024 && index < BYTE_UNITS.length - 1) {
    scaled /= 1024;
    index++;
  }
  return `${parseFloat(scaled.toFixed(decimals))} ${BYTE_UNITS[index]}`;
}
