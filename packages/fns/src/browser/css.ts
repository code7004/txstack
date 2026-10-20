/**
 * 실행 중에 CSS 규칙을 넣고 바꾼다. **브라우저 전용**이다.
 *
 * ```ts
 * import * as css from "@txstack/fns/browser/css";
 * css.inject("brand", ".btn:hover", { backgroundColor: "#2dd4bf" });
 * ```
 *
 * 인라인 `style` 로 안 되는 자리 — `:hover` · `::before` · 미디어 쿼리 밖의 선택자 — 에 쓴다.
 * 정적인 스타일은 CSS 파일에 둔다.
 */

/** 속성 이름은 camelCase(`backgroundColor`)와 CSS 그대로(`background-color` · `--my-var`) 둘 다 받는다 */
export type CssRules = Record<string, string | number>;

const toKebab = (key: string) => (key.startsWith("--") ? key : key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`));

function sheetOf(styleId: string): CSSStyleSheet | null {
  let element = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!element) {
    element = document.createElement("style");
    element.id = styleId;
    document.head.appendChild(element);
  }
  return element.sheet;
}

/**
 * `<style id={styleId}>` 에 `selector` 규칙을 넣는다. 같은 선택자가 이미 있으면 **그 자리에서 바꾼다.**
 * 선택자는 글자 그대로 비교한다 — `.a` 를 넣을 때 `.ab` 를 건드리지 않는다.
 *
 * @returns 넣었으면 `true`. 브라우저가 규칙을 거부하면(잘못된 선택자 등) `false`
 */
export function inject(styleId: string, selector: string, rules: CssRules): boolean {
  const sheet = sheetOf(styleId);
  if (!sheet) return false;

  const body = Object.entries(rules)
    .map(([key, value]) => `${toKebab(key)}: ${value};`)
    .join(" ");
  const text = `${selector} { ${body} }`;

  const existing = Array.from(sheet.cssRules).findIndex((rule) => rule instanceof CSSStyleRule && rule.selectorText === selector);

  try {
    if (existing >= 0) {
      sheet.deleteRule(existing);
      sheet.insertRule(text, existing);
    } else {
      sheet.insertRule(text, sheet.cssRules.length);
    }
    return true;
  } catch {
    return false;
  }
}

/** `inject` 로 만든 `<style>` 을 통째로 지운다 */
export function remove(styleId: string): void {
  document.getElementById(styleId)?.remove();
}
