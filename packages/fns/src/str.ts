/**
 * 문자열 · 문자열에서 만든 색.
 *
 * ```ts
 * import * as str from "@txstack/fns/str";
 * str.hashColor("kim@example.com"); // 같은 글자면 늘 같은 색
 * ```
 */

/**
 * 문자열에서 늘 같은 `#rrggbb` 색을 만든다. 사용자 아바타 · 태그처럼 "이름마다 다른 색" 이 필요할 때 쓴다.
 * 빈 문자열이면 `#407adf`. 앞 여섯 글자만 본다 — 앞이 같은 긴 문자열은 같은 색이 된다.
 */
export function hashColor(value: string): string {
  if (!value) return "#407adf";

  const source = value.replace(".", "");
  let hex = "";
  for (let i = 0; i < 6; i++) {
    if (i >= source.length) {
      hex += "0";
      continue;
    }
    // 글자 코드의 16진 두 자리를 더해 접는다. 옛 구현은 이 두 자리를 10진으로 읽어 `k`(0x6b) 같은 글자에서
    // "NaN" 이 섞인 색을 만들었다. 16진으로 읽으면 숫자로만 된 자리는 결과가 같고, NaN 이던 자리만 고쳐진다
    const code = source.charCodeAt(i).toString(16);
    hex += (parseInt(code[0] || "0", 16) + parseInt(code[1] || "0", 16)).toString(16);
  }
  return "#" + hex.slice(0, 6);
}

/** `paletteColor` 가 고르는 열다섯 색 (Tailwind 500 계열) */
export const PALETTE = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F97316", "#22D3EE", "#14B8A6", "#84CC16", "#EAB308", "#0EA5E9", "#A855F7", "#6EE7B7"] as const;

/**
 * 숫자로 `PALETTE` 에서 색 하나. 넘치면 처음으로 돈다. 차트 계열 · 순번 있는 목록에 쓴다.
 *
 * @example
 * paletteColor(3)  // "#3B82F6"
 * paletteColor(15) // "#EF4444"
 */
export function paletteColor(index: number): string {
  const i = Number.isFinite(index) ? Math.abs(Math.trunc(index)) : 0;
  return PALETTE[i % PALETTE.length]!;
}

/**
 * 이메일의 `@` 앞부분. `@` 가 없으면 그대로 돌려준다.
 *
 * @example
 * emailLocalPart("kim@example.com") // "kim"
 */
export function emailLocalPart(email: string): string {
  const at = email.indexOf("@");
  return at < 0 ? email : email.slice(0, at);
}

/** 영문 · 숫자 · 공백 · 밑줄이 아닌 키보드 특수문자(`!@#$%^&*` 등)가 들어 있는가 */
export function hasSpecialChars(value: string): boolean {
  return /[!@#%^&*()\-=+{};:'"\\|,.<>/?`~$[\]]/.test(value);
}

/** ASCII 밖의 글자(한글 · 이모지 · 전각 문자 등)가 들어 있는가. 비밀번호 검사에 쓴다 */
export function hasNonAscii(value: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /[^\x00-\x7F]/.test(value);
}
