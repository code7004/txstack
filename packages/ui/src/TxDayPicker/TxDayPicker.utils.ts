/**
 * 날짜 유틸. **내부 전용이다.**
 *
 * 원본은 이 세 가지 때문에 `dayjs` 를 optional peer 로 요구했다. 쓰는 것이
 * 포맷 · 하루 경계 · 일수 차이뿐이라 직접 쓴다 — 소비자가 설치할 것이 하나 줄고,
 * `@txstack/ui/daypicker` 가 `react-day-picker` 하나만 요구하게 된다.
 */

const pad = (value: number, size = 2) => String(value).padStart(size, "0");

/**
 * `YYYY-MM-DD` 같은 패턴을 채운다. 긴 토큰부터 바꿔야 `YYYY` 가 `YY` 두 번으로 쪼개지지 않는다.
 *
 * 쓰는 토큰: `YYYY` `YY` `MM` `DD` `HH` `mm` `ss`
 */
export function formatDate(date: Date, pattern: string): string {
  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    YY: pad(date.getFullYear() % 100),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  };

  return pattern.replace(/YYYY|YY|MM|DD|HH|mm|ss/g, (token) => map[token]);
}

/** 그날 00:00:00.000 */
export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

/** 그날 23:59:59.999 */
export function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * 두 날짜 사이의 **달력 일수** 차이. 시각은 보지 않는다.
 *
 * 밀리초로 나누지 않는다 — 서머타임이 있는 지역에서 하루가 23시간이나 25시간이 되면
 * 결과가 하루씩 어긋난다.
 */
export function diffDays(from: Date, to: Date): number {
  const a = startOfDay(from);
  const b = startOfDay(to);

  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
