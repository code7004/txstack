/**
 * `@txstack/dev-guide/commitlint` — 커밋 메시지 프리셋. 규칙의 뜻은 `rules/commits.md`.
 *
 *   // commitlint.config.mjs
 *   export { default } from "@txstack/dev-guide/commitlint";
 *
 * Conventional Commits 를 따르되, 한글 제목과 표 · 목록이 든 본문을 막지 않는다.
 * `@commitlint/cli` · `@commitlint/config-conventional` 은 프로젝트가 설치한다.
 */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 제목은 한글로 쓴다 — 대소문자 규칙이 뜻이 없다
    "subject-case": [0],
    // 본문 · 푸터에 표 · 목록 · 링크를 쓴다
    "body-max-line-length": [0],
    "footer-max-line-length": [0]
  }
};

export default config;
