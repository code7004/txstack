/**
 * `@txstack/dev-guide/lint-staged` — 커밋할 때 스테이징한 파일만 고친다. 훅은 `rules/commits.md` 5장.
 *
 *   // lint-staged.config.mjs
 *   export { default } from "@txstack/dev-guide/lint-staged";
 *
 * 전체 검사(`pnpm check`)는 여기 두지 않는다 — 느리면 사람이 훅을 끈다.
 */
const config = {
  "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": ["eslint --fix", "prettier --write"],
  "*.{json,md,mdx,css,scss,yaml,yml}": ["prettier --write"]
};

export default config;
