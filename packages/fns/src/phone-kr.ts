/**
 * 한국 전화번호 — 정규화 · 휴대폰 판정 · 마스킹 · 대량 처리.
 *
 * ```ts
 * import { maskPhone, parseMobile } from "@txstack/fns";
 * parseMobile("+82 10-1234-5678"); // "01012345678"
 * maskPhone("01012345678");        // "010****5678"
 * ```
 *
 * **정규화한 값(숫자만)으로 비교 · 저장한다.** 하이픈 · 공백 · `+82` 가 섞인 원본끼리 비교하면
 * 같은 번호를 다르게 본다.
 *
 * 대량 함수(`validatePhones` · `dedupePhones` · `excludePhones`)는 1만 건마다 이벤트 루프에 양보한다 —
 * 수십만 건을 붙여 넣어도 화면이 굳지 않는다.
 */

/**
 * 숫자만 남기고 휴대폰 번호 꼴로 맞춘다. 휴대폰인지는 보지 않는다 — 판정은 `parseMobile`.
 *
 * - `+82 10 1234 5678` · `82-10-1234-5678` · `82-010-1234-5678` → `01012345678`
 * - `1012345678` → `01012345678` (앞 0 생략)
 * - `12345678` → `01012345678` (010 생략, 7~8자리만 들어온 경우)
 */
export function normalizePhone(input: string | null | undefined): string {
  if (!input) return "";

  let digits = String(input).replace(/\D/g, "");
  if (/^82010\d{7,8}$/.test(digits)) digits = digits.slice(2);
  if (/^8210\d{7,8}$/.test(digits)) digits = "0" + digits.slice(2);
  if (/^10\d{7,8}$/.test(digits)) digits = "0" + digits;
  if (/^\d{7,8}$/.test(digits)) digits = "010" + digits;
  return digits;
}

/** 정규화해서 `010` 휴대폰 번호면 그 값(숫자만), 아니면 `null` */
export function parseMobile(input: string | null | undefined): string | null {
  const digits = normalizePhone(input);
  return /^010\d{7,8}$/.test(digits) ? digits : null;
}

/**
 * 가운데 자리를 `*` 로 가린다. 숫자가 10~11자리가 아니면 원본을 그대로 돌려준다.
 * 개발 중에 가리지 않으려면 부르는 쪽에서 분기한다 — 패키지는 환경을 보지 않는다.
 *
 * @example
 * mask("010-1234-5678") // "010****5678"
 * mask("0212345678")    // "02****5678"
 * mask("0311234567")    // "031***4567"
 */
export function maskPhone(input: string | null | undefined): string {
  if (!input) return "";

  const digits = String(input).replace(/\D/g, "");
  const hide = (head: string, middle: string, tail: string) => head + "*".repeat(middle.length) + tail;

  if (digits.length === 11) return hide(digits.slice(0, 3), digits.slice(3, 7), digits.slice(7));
  if (digits.length === 10) {
    const head = digits.startsWith("02") ? 2 : 3;
    return hide(digits.slice(0, head), digits.slice(head, 6), digits.slice(6));
  }
  return String(input);
}

/** 전화번호처럼 보이면(휴대폰 · 지역번호) 가리고, 아니면 그대로. 검색어를 화면 · 로그에 남길 때 쓴다 */
export function maskIfPhone(keyword: string | null | undefined): string {
  if (!keyword) return "";

  const value = String(keyword).trim();
  const digits = value.replace(/\D/g, "");
  return /^01\d{8,9}$/.test(digits) || /^0\d{8,10}$/.test(digits) ? maskPhone(value) : value;
}

const CHUNK = 10000;

/** `items` 를 `CHUNK` 개씩 돌고 사이마다 이벤트 루프에 양보한다 */
function chunked<T>(items: readonly T[], visit: (item: T) => void): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    const step = () => {
      const end = Math.min(index + CHUNK, items.length);
      for (; index < end; index++) visit(items[index]!);
      if (index < items.length) setTimeout(step, 0);
      else resolve();
    };
    step();
  });
}

/**
 * 휴대폰 번호 목록을 가른다. `valid` 는 정규화한 값, `invalid` 는 원본이다.
 * `null` 이나 배열이 아닌 값을 넘기면 둘 다 빈 목록이다.
 */
export async function validatePhones(numbers: readonly string[] | null | undefined): Promise<{ valid: string[]; invalid: string[] }> {
  const valid: string[] = [];
  const invalid: string[] = [];
  if (!Array.isArray(numbers)) return { valid, invalid };

  await chunked(numbers, (input) => {
    const parsed = parseMobile(input);
    if (parsed) valid.push(parsed);
    else invalid.push(input);
  });
  return { valid, invalid };
}

/**
 * 중복을 걸러 낸다. 처음 나온 것은 `uniques` 에, 두 번째부터는 `duplicates` 에 간다.
 * 앞뒤 공백은 지우고, 빈 값은 버린다. **정규화는 하지 않는다** — 먼저 `validatePhones` 를 거친다.
 */
export async function dedupePhones(numbers: readonly string[] | null | undefined): Promise<{ uniques: string[]; duplicates: string[] }> {
  const uniques: string[] = [];
  const duplicates: string[] = [];
  if (!Array.isArray(numbers)) return { uniques, duplicates };

  const seen = new Set<string>();
  await chunked(numbers, (input) => {
    const value = String(input ?? "").trim();
    if (!value) return;
    if (seen.has(value)) duplicates.push(value);
    else {
      seen.add(value);
      uniques.push(value);
    }
  });
  return { uniques, duplicates };
}

/**
 * `source` 에서 `blocked` 에 든 번호를 뺀다. 빠진 것은 `excluded` 에 모인다.
 *
 * @example
 * await exclude(["010…1", "010…2"], ["010…2"]) // { remains: ["010…1"], excluded: ["010…2"] }
 */
export async function excludePhones(source: readonly string[], blocked: Iterable<string>): Promise<{ remains: string[]; excluded: string[] }> {
  const remains: string[] = [];
  const excluded: string[] = [];
  const set = new Set(blocked);

  await chunked(source, (input) => (set.has(input) ? excluded : remains).push(input));
  return { remains, excluded };
}
