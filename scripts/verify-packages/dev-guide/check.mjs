/**
 * 설치된 @txstack/dev-guide 의 README 에서 「새 프로젝트에 붙이기」의 sh 블록을 꺼내 **그대로** 돌린다.
 * README 의 명령이 틀리면 여기서 깨진다 — 문서가 곧 검증 대상이다.
 *
 * 1. 설치본에 llms.txt 가 가리키는 장이 모두 있다 (`files` 에서 빠지면 여기서 드러난다)
 * 2. 폴더 · 기본 양식 블록이 만든 파일이 모두 있다
 * 3. 같은 블록을 한 번 더 돌려도 고친 파일을 덮어쓰지 않는다
 * 4. 첫 작업 블록이 양식 셋을 놓는다
 * 5. 놓인 문서의 링크가 그 자리에서 열린다 (이름 자리표시 nnn_title · NN_TITLE 은 사람이 고칠 몫이라 뺀다)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const guide = "node_modules/@txstack/dev-guide";
const readme = readFileSync(`${guide}/README.md`, "utf8");
const blocks = [...readme.matchAll(/```sh\n([\s\S]*?)```/g)].map((match) => match[1]);

const pick = (needle) => {
  const block = blocks.find((body) => body.includes(needle));
  if (!block) throw new Error(`README 에 "${needle}" 를 담은 sh 블록이 없다`);
  return block;
};
const run = (script) => execFileSync("bash", ["-e", "-c", script], { encoding: "utf8" });
const fail = (message) => {
  throw new Error(message);
};

// 1. 설치본
const llms = readFileSync(`${guide}/llms.txt`, "utf8");
for (const [, href] of llms.matchAll(/\]\(([^)]+)\)/g)) if (!existsSync(`${guide}/${href}`)) fail(`설치본에 없다: ${href}`);

// 2. 폴더 · 기본 양식
const setup = pick("mkdir -p docs");
run(setup);
const made = ["docs/README.md", "CURRENT.md", "CLAUDE.md", "AGENTS.md", "docs/rules/00_DEV_GUIDE_DIFF.md", "docs/project/01_PROJECT_OVERVIEW.md"];
for (const file of made) if (!existsSync(file)) fail(`만들어지지 않았다: ${file}`);
for (const dir of ["project", "rules", "requirements", "plans", "verification", "reports"]) if (!existsSync(`docs/${dir}`)) fail(`폴더가 없다: docs/${dir}`);

// 3. 덮어쓰지 않는다
writeFileSync("CURRENT.md", "# 고친 내용\n");
const again = run(setup);
if (readFileSync("CURRENT.md", "utf8") !== "# 고친 내용\n") fail("두 번째 실행이 CURRENT.md 를 덮어썼다");
if (!again.includes("CURRENT.md")) fail("이미 있는 파일을 알려 주지 않았다");

// 4. 첫 작업
run(pick("docs/requirements/$n.md"));
const task = ["docs/requirements/001_first_feature.md", "docs/plans/001_first_feature.md", "docs/verification/001_first_feature.md"];
for (const file of task) if (!existsSync(file)) fail(`첫 작업 문서가 없다: ${file}`);

// 5. 링크
const placeholder = /(^|\/)(nnn_title|NN_TITLE)\.md$/;
let checked = 0;
for (const file of [...made.filter((file) => file !== "CURRENT.md"), ...task]) {
  const prose = readFileSync(file, "utf8")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/`[^`\n]*`/g, "");
  for (const [, raw] of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = raw.split("#")[0];
    if (!href || /^[a-z]+:/.test(href) || placeholder.test(href)) continue;
    if (!existsSync(resolve(dirname(file), href))) fail(`${file} → ${href} 가 열리지 않는다`);
    checked++;
  }
}

// 6. 설정 프리셋 — README 의 js 블록 중 첫 줄이 `// <파일 이름>` 인 것을 그 이름으로 그대로 쓴다
const jsBlocks = [...readme.matchAll(/```js\n\/\/ ([^\s]+)\n([\s\S]*?)```/g)];
const written = jsBlocks.map(([, file, body]) => (writeFileSync(file, body), file));
for (const file of ["prettier.config.js", "commitlint.config.mjs", "lint-staged.config.mjs", "eslint.config.js"]) if (!written.includes(file)) fail(`README 에 ${file} 예제가 없다`);

const bin = (name, args, input) => {
  try {
    return { code: 0, out: execFileSync(`node_modules/.bin/${name}`, args, { encoding: "utf8", input, stdio: ["pipe", "pipe", "pipe"] }) };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
};

// eslint — README 예제의 react 경로(apps/web)에서 훅 규칙이 걸리고, node 경로(apps/api)는 process 를 안다
mkdirSync("apps/web/src", { recursive: true });
mkdirSync("apps/api", { recursive: true });
writeFileSync("apps/web/src/App.tsx", 'import { useState } from "react";\n\nexport function App({ on }: { on: boolean }) {\n  if (on) {\n    const [v] = useState(0);\n    return <p>{v}</p>;\n  }\n  return null;\n}\n');
writeFileSync("apps/api/main.ts", "export const port = process.env.PORT;\n");
const lint = bin("eslint", ["--format", "json", "apps"]);
const results = JSON.parse(lint.out.slice(lint.out.indexOf("[")));
const ruleIds = results.flatMap((r) => r.messages.map((m) => m.ruleId));
if (!ruleIds.includes("react-hooks/rules-of-hooks")) fail(`eslint 가 훅 규칙을 잡지 않았다: ${ruleIds.join(", ") || lint.out.slice(0, 400)}`);
const apiMessages = results.find((r) => r.filePath.endsWith("main.ts"))?.messages ?? [];
if (apiMessages.length) fail(`apps/api 에 경고가 있다: ${apiMessages.map((m) => m.ruleId).join(", ")}`);

// prettier — 프리셋 모양(큰따옴표 · 끝 쉼표 없음)은 통과하고, 어긋난 것은 걸린다
writeFileSync("ok.ts", 'export const a = { b: "x" };\n');
writeFileSync("bad.ts", "export const a = { b: 'x', };\n");
if (bin("prettier", ["--check", "ok.ts"]).code !== 0) fail("prettier 가 프리셋 모양의 파일을 거절했다");
if (bin("prettier", ["--check", "bad.ts"]).code === 0) fail("prettier 가 작은따옴표 · 끝 쉼표를 통과시켰다");

// commitlint — 한글 제목 · 긴 본문은 통과, 형식이 틀린 제목은 거절
const longBody = `feat: 한글 제목도 된다\n\n${"표와 목록이 든 긴 본문 ".repeat(20)}\n`;
const good = bin("commitlint", [], longBody);
if (good.code !== 0) fail(`commitlint 가 올바른 메시지를 거절했다: ${good.out}`);
if (bin("commitlint", [], "그냥 고쳤다\n").code === 0) fail("commitlint 가 type 없는 메시지를 통과시켰다");

// lint-staged — 설정 파일이 프리셋을 그대로 불러온다
const { default: staged } = await import(resolve("lint-staged.config.mjs"));
if (!Object.values(staged).flat().includes("eslint --fix")) fail("lint-staged 설정을 불러오지 못했다");

console.log(`README 절차 실행 · 덮어쓰지 않음 · 첫 작업 · 링크 ${checked}개 · 프리셋 넷(eslint · prettier · commitlint · lint-staged)`);
