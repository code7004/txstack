/**
 * 이름에서 이니셜을 만든다. **내부 전용이다.**
 *
 * 규칙은 셋이다.
 *
 * 1. **띄어 쓴 이름은 덩어리마다 첫 글자**, 최대 둘 — `"Jaehoon Kim"` → `"JK"`
 * 2. **붙여 쓴 한글·한자·가나 이름은 뒤 두 글자** — `"김재훈"` → `"재훈"`
 * 3. **그 밖의 붙여 쓴 이름은 첫 글자 하나** — `"Jaehoon"` → `"J"`
 *
 * 3번을 따로 두는 이유는 2번을 라틴 글자에 그대로 적용하면 `"Jaehoon"` 이 `"on"` 이 되기
 * 때문이다. 붙여 쓴 이름의 **뒤쪽**이 부르는 이름인 것은 한글 쪽 사정이다.
 *
 * 글자를 코드 포인트로 자른다 — 이모지가 든 이름을 `"?"` 반쪽으로 자르지 않는다.
 */

/** 한글 · 한자 · 가나. 붙여 써도 이름이 여러 글자인 문자들이다. */
const IDEOGRAPHIC = /[ᄀ-ᇿ぀-ヿ㐀-䶿一-鿿ꥠ-꥿가-퟿]/;

export function toInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";

  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => [...word][0])
      .join("")
      .toUpperCase();
  }

  const letters = [...words[0]];
  if (IDEOGRAPHIC.test(letters[0])) return letters.slice(-2).join("");

  return letters[0].toUpperCase();
}
