/**
 * 폼 값 검사 — 빈 칸과 형식. **첫 번째로 걸린 필드 하나**만 알려 준다.
 *
 * ```ts
 * import { checkForm } from "@txstack/fns";
 *
 * const error = checkForm(values, { email: { pattern: /^\S+@\S+$/, message: "이메일 형식이 아닙니다" } }, { optional: ["memo"] });
 * if (error) return toast.error(Object.values(error)[0]);
 * ```
 *
 * `TxForm` 처럼 필드마다 검사를 붙일 수 없는 자리(직접 만든 입력 화면 · 일괄 등록 등)를 위한 것이다.
 */

/** 걸린 필드 하나 → 메시지 */
export type FormError<T extends object> = Partial<Record<keyof T, string>>;

/** 형식 규칙 하나 */
export interface PatternRule {
  pattern: RegExp;
  message: string;
}

/** 필드 이름 → 형식 규칙 */
export type PatternRules<T extends object> = Partial<Record<keyof T & string, PatternRule>>;

export interface CheckEmptyOptions<T extends object> {
  /** 비워도 되는 필드 */
  optional?: ReadonlyArray<keyof T & string>;
  /** 빈 칸 메시지. 기본은 `"<필드> is empty"` */
  message?: (key: keyof T & string) => string;
}

/**
 * 빈 필드를 찾는다. 앞뒤 공백만 있는 문자열과 빈 배열도 빈 것이다. `0` · `false` 는 값이 있는 것이다.
 *
 * @example
 * checkEmpty({ name: " ", age: 0 })                     // { name: "name is empty" }
 * checkEmpty({ name: "", memo: "" }, { optional: ["name", "memo"] }) // null
 */
export function checkEmpty<T extends object>(values: T, options: CheckEmptyOptions<T> = {}): FormError<T> | null {
  const { optional = [], message = (key) => `${key} is empty` } = options;
  const skip = new Set<string>(optional);

  for (const key of Object.keys(values) as Array<keyof T & string>) {
    if (skip.has(key)) continue;

    const value: unknown = values[key];
    const empty = Array.isArray(value) ? value.length === 0 : String(value ?? "").trim() === "";
    if (empty) return { [key]: message(key) } as FormError<T>;
  }
  return null;
}

/**
 * 형식이 틀린 필드를 찾는다. 규칙이 없는 필드와 **비어 있는 필드는 건너뛴다** — 빈 칸은 `checkEmpty` 의 몫이다.
 * 정규식에 `g` 플래그가 있어도 매번 처음부터 검사한다.
 *
 * @example
 * checkPattern({ phone: "010-12" }, { phone: { pattern: /^010-\d{4}-\d{4}$/, message: "전화번호 형식" } })
 * // { phone: "전화번호 형식" }
 */
export function checkPattern<T extends object>(values: T, rules: PatternRules<T>): FormError<T> | null {
  for (const key of Object.keys(values) as Array<keyof T & string>) {
    const rule = rules[key];
    if (!rule) continue;

    const value = String(values[key] ?? "").trim();
    rule.pattern.lastIndex = 0;
    if (value !== "" && !rule.pattern.test(value)) return { [key]: rule.message } as FormError<T>;
  }
  return null;
}

/** 빈 칸을 먼저, 그다음 형식을 본다. 둘 다 통과하면 `null` */
export function checkForm<T extends object>(values: T, rules: PatternRules<T> = {}, options: CheckEmptyOptions<T> = {}): FormError<T> | null {
  return checkEmpty(values, options) ?? checkPattern(values, rules);
}
