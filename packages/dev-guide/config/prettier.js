/**
 * `@txstack/dev-guide/prettier` — 포맷 프리셋.
 *
 *   // prettier.config.js
 *   export { default } from "@txstack/dev-guide/prettier";
 *
 * 줄 폭은 넓게 두고 줄바꿈은 사람이 정한다. 큰따옴표 · 끝 쉼표 없음.
 * 무시할 파일은 프리셋으로 줄 수 없다(prettier 가 패키지에서 읽지 않는다) — `templates/prettierignore` 를 복사한다.
 *
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 250,
  singleQuote: false,
  semi: true,
  trailingComma: "none"
};

export default config;
