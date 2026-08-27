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

const IMPORT = /^[ \t]*@import[ \t]+["']([^"']+)["'](?:[ \t]+layer\(([\w-]+)\))?[ \t]*;[ \t]*$/gm;

const seen = new Set();

/**
 * `@import "./x.css" layer(tx);` 를 펼치면서 **레이어를 블록으로 바꾼다.**
 *
 * `@import ... layer()` 는 브라우저는 알아듣지만, 여기서 import 를 없애 버리므로
 * 그 레이어 지정도 같이 사라진다. 펼친 내용을 `@layer tx { … }` 로 감싸 같은 뜻을 유지한다.
 * **이게 없으면 배포본만 레이어 밖으로 나와** 소비자의 `className` 이 안 먹는다.
 *
 * @param {string} file
 */
function expand(file) {
  if (seen.has(file)) throw new Error(`@import 가 순환한다: ${file}`);
  seen.add(file);

  return readFileSync(file, "utf8").replace(IMPORT, (_, spec, layer) => {
    if (!spec.startsWith(".")) throw new Error(`상대경로 @import 만 지원한다: ${spec} (${file})`);

    const expanded = expand(resolve(dirname(file), spec));
    return layer ? `@layer ${layer} {\n${expanded}\n}` : expanded;
  });
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, expand(entry));

console.log(`dist/styles.css ← ${seen.size}개 파일`);
