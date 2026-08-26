/**
 * `src/styles.css` 의 `@import` 를 펼쳐 `dist/styles.css` 하나로 낸다.
 *
 * 번들러를 쓰지 않는 이유: 이 패키지의 CSS 는 **우리가 쓴 것뿐**이라 처리할 게 없다.
 * 벤더 프리픽스도 minify 도 소비자 빌드가 한다.
 *
 * `@import` 는 상대경로만 지원한다. 그게 이 파일이 처리하는 전부다 —
 * 여기서 CSS 문법을 해석하기 시작하면 그때는 번들러를 붙여야 한다.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = resolve(root, "src/styles.css");
const out = resolve(root, "dist/styles.css");

const IMPORT = /^[ \t]*@import[ \t]+["']([^"']+)["'][ \t]*;[ \t]*$/gm;

const seen = new Set();

/** @param {string} file */
function expand(file) {
  if (seen.has(file)) throw new Error(`@import 가 순환한다: ${file}`);
  seen.add(file);

  return readFileSync(file, "utf8").replace(IMPORT, (_, spec) => {
    if (!spec.startsWith(".")) throw new Error(`상대경로 @import 만 지원한다: ${spec} (${file})`);
    return expand(resolve(dirname(file), spec));
  });
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, expand(entry));

console.log(`dist/styles.css \u2190 ${seen.size}개 파일`);
