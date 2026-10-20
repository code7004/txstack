/**
 * 쿠키 읽기 · 쓰기. **브라우저 전용**이다(`document.cookie`).
 *
 * ```ts
 * import { getCookie, setCookie } from "@txstack/fns";
 * setCookie("filters", ["soccer", "baseball"]);
 * getCookie("filters", [] as string[]);
 * ```
 *
 * 값은 JSON 으로 저장한다 — 문자열 `"00123"` 을 넣으면 문자열 `"00123"` 이 돌아온다.
 * JSON 이 아닌 값(다른 코드가 쓴 쿠키)은 문자열 그대로 읽는다.
 */

export interface SetCookieOptions {
  /** 유지 기간(일). 기본 30 */
  days?: number;
  /** 기본 `"/"` */
  path?: string;
  /** 기본 `"Lax"` */
  sameSite?: "Strict" | "Lax" | "None";
  /** `sameSite: "None"` 이면 브라우저가 요구하므로 자동으로 켠다 */
  secure?: boolean;
}

/** 값을 JSON 으로 저장한다 */
export function setCookie(name: string, value: unknown, options: SetCookieOptions = {}): void {
  const { days = 30, path = "/", sameSite = "Lax", secure = sameSite === "None" } = options;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(JSON.stringify(value ?? null))}`, `expires=${expires}`, `path=${path}`, `SameSite=${sameSite}`];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

function readRaw(name: string): string | undefined {
  const key = encodeURIComponent(name);
  for (const part of document.cookie.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === key) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/**
 * 저장한 값을 읽는다. 없으면 `fallback`. 타입은 `fallback` 을 따르지만 **검사하지는 않는다** —
 * 다른 모양으로 저장된 값이 올 수 있다.
 */
export function getCookie<T>(name: string, fallback: T): T {
  const raw = readRaw(name);
  if (raw === undefined) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as T;
  }
}

/** 지운다. 저장할 때 `path` 를 바꿨으면 같은 값을 준다 */
export function removeCookie(name: string, options: Pick<SetCookieOptions, "path"> = {}): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${options.path ?? "/"}`;
}
