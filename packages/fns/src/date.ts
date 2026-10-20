/**
 * 날짜 · 기간 · 경과 시간.
 *
 * ```ts
 * import * as date from "@txstack/fns/date";
 * const [start, end] = date.lastDays(14); // 오늘을 포함한 14일
 * ```
 *
 * 모든 계산은 **실행 환경의 시간대**를 쓴다. `dayjs` 같은 의존 없이 `Date` 만 쓴다.
 */

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(base: Date, offset: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset, 0, 0, 0, 0);
}

function endOfDay(base: Date, offset: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset, 23, 59, 59, 999);
}

/**
 * 오늘을 기준으로 `from` 일째 0시부터 `to` 일째 23:59:59.999 까지.
 *
 * @example
 * dayRange(-1, -1) // 어제 하루
 * dayRange(0, 6)   // 오늘부터 일주일
 */
export function dayRange(from: number, to: number, now: Date = new Date()): [Date, Date] {
  return [startOfDay(now, from), endOfDay(now, to)];
}

/**
 * **오늘을 포함한** 최근 `days` 일. `lastDays(1)` 은 오늘 하루다.
 *
 * @example
 * const [start, end] = lastDays(14);
 * api.search({ startDate: start.getTime(), endDate: end.getTime() });
 */
export function lastDays(days: number, now: Date = new Date()): [Date, Date] {
  return dayRange(1 - days, 0, now);
}

/** 실행 환경의 IANA 시간대 — `"Asia/Seoul"`. 서버에 집계 기준 시간대를 넘길 때 쓴다 */
export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * `"20251231"` → 그날 0시(로컬). 여덟 자리 숫자가 아니거나 없는 날짜(`"20250230"`)면 `null`.
 */
export function parseYmd(ymd: string): Date | null {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(ymd);
  if (!match) return null;

  const [y, m, d] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const result = new Date(y, m, d);
  return result.getFullYear() === y && result.getMonth() === m && result.getDate() === d ? result : null;
}

/** ISO 주차 */
export interface IsoWeek {
  /** ISO 기준 연도. 12월 말이 다음 해 1주차가 될 수 있어 달력 연도와 다를 수 있다 */
  year: number;
  week: number;
  /** `"2026-W01"` */
  key: string;
}

/**
 * ISO 8601 주차(월요일 시작, 그해 첫 목요일이 든 주가 1주차). 문자열은 `"YYYYMMDD"` 로 받는다.
 *
 * @example
 * isoWeek("20251231") // { year: 2026, week: 1, key: "2026-W01" }
 */
export function isoWeek(value: Date | string): IsoWeek | null {
  const local = typeof value === "string" ? parseYmd(value) : value;
  if (!local || Number.isNaN(local.getTime())) return null;

  // 시간대 영향을 없애려고 UTC 로 옮겨 센다
  const day = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday); // 그 주의 목요일

  const year = day.getUTCFullYear();
  const week = Math.ceil(((day.getTime() - Date.UTC(year, 0, 1)) / DAY + 1) / 7);
  return { year, week, key: `${year}-W${String(week).padStart(2, "0")}` };
}

/**
 * `"1716300000000,1718700000000"` 처럼 쉼표로 이은 밀리초 두 개 → `[시작, 끝]`.
 * 주소 쿼리에 기간을 실을 때 쓴다(URL 인코딩된 채로 넘겨도 된다). 형식이 다르면 `null`.
 */
export function parseTimestamps(value: string | null | undefined): [Date, Date] | null {
  if (!value) return null;

  const parts = decodeURIComponent(value).split(",");
  if (parts.length !== 2) return null;

  const dates = parts.map((part) => (part.trim() === "" ? new Date(NaN) : new Date(Number(part))));
  return dates.every((d) => !Number.isNaN(d.getTime())) ? [dates[0]!, dates[1]!] : null;
}

/** `splitSeconds` 의 결과 */
export interface SplitSeconds {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** `"05:03:09"` · 하루를 넘으면 `"1d 05:03:09"` */
  formatted: string;
}

/**
 * 초를 일 · 시 · 분 · 초로 나눈다. 소수점 아래는 버린다.
 *
 * @example
 * splitSeconds(90061)                       // formatted "1d 01:01:01"
 * splitSeconds(90061, { dayLabel: "일 " })  // formatted "1일 01:01:01"
 * splitSeconds(61, { pad: false })          // formatted "0:1:1"
 */
export function splitSeconds(total: number, options: { pad?: boolean; dayLabel?: string } = {}): SplitSeconds {
  const { pad = true, dayLabel = "d " } = options;
  const t = Math.max(0, Math.floor(total || 0));

  const days = Math.floor(t / 86400);
  const hours = Math.floor((t % 86400) / 3600);
  const minutes = Math.floor((t % 3600) / 60);
  const seconds = t % 60;

  const two = (n: number) => (pad ? String(n).padStart(2, "0") : String(n));
  const clock = `${two(hours)}:${two(minutes)}:${two(seconds)}`;

  return { days, hours, minutes, seconds, formatted: days > 0 ? `${days}${dayLabel}${clock}` : clock };
}

/** `elapsed` 가 번역 함수에 넘기는 키 */
export type ElapsedKey = "just_now" | "second" | "minute" | "hour" | "day" | "month" | "year";

const ELAPSED_LABELS: Record<ElapsedKey, string> = { just_now: "just now", second: "s", minute: "m", hour: "h", day: "d", month: "mo", year: "y" };

/**
 * 경과 시간(초)을 사람이 읽는 글로. 한 시간 미만은 두 단위(`"1m 30s"`), 그 위는 한 단위다.
 * 한 달은 30일, 한 해는 12달로 센다. 단위 글자는 `t` 로 바꾼다 — i18n 의 번역 함수를 그대로 넘기면 된다.
 *
 * @example
 * elapsed(90)                                    // "1m 30s"
 * elapsed(3665)                                  // "1h 1m"
 * elapsed(90, { t: (key) => ({ minute: "분", second: "초" })[key] ?? key }) // "1분 30초"
 */
export function elapsed(seconds: number, options: { decimals?: number; t?: (key: ElapsedKey) => string } = {}): string {
  const { decimals = 2, t = (key) => ELAPSED_LABELS[key] } = options;
  if (seconds == null || Number.isNaN(seconds)) return "";
  if (seconds < 0) return t("just_now");

  const min = seconds / 60;
  const hour = min / 60;
  const day = hour / 24;
  const month = day / 30;

  if (seconds < 60) return `${parseFloat(seconds.toFixed(decimals))}${t("second")}`;

  if (min < 60) {
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return s > 0 ? `${m}${t("minute")} ${s}${t("second")}` : `${m}${t("minute")}`;
  }

  if (hour < 24) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return m > 0 ? `${h}${t("hour")} ${m}${t("minute")}` : `${h}${t("hour")}`;
  }

  if (day < 30) return `${Math.floor(day)}${t("day")}`;
  if (month < 12) return `${Math.floor(month)}${t("month")}`;
  return `${Math.floor(month / 12)}${t("year")}`;
}
