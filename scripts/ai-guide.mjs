/**
 * **AI 가이드를 만든다** — 소비자 프로젝트의 AI 코딩 도구가 txstack 부품을 먼저 쓰게 하는 문서 묶음.
 *
 * 원본은 이미 있는 문서다. 손으로 따로 관리하는 큰 문서를 두지 않는다.
 *
 * - `docs/013_ai_guide.md` 의 `ai-guide:end` 표시 위쪽 → `rules.md` (결정표 · 원시 요소 · 토큰 · 한계 · 시작 묶음)
 * - `docs/{001_ui,002_route_meta,003_hooks,004_axios,012_fns}/*.md` → `docs/…` (폴더 구조 그대로)
 * - `packages/<이름>/README.md` → `packages/…`
 * - `llms.txt` — 목차. 부품 목록은 각 장의 제목 · 첫 인용문 · 진입점 줄에서 뽑는다
 * - `llms-full.txt` — 위 전부를 한 파일로
 *
 * 두 곳이 쓴다. 놓이는 자리만 다르고 내용은 같다.
 *
 *   node scripts/ai-guide.mjs <폴더>      `@txstack/ui` 의 build — 전부 `<폴더>/` 아래 (`layout: "package"`)
 *   apps/site/vite.config.ts               사이트 — `llms*.txt` 는 루트, 나머지는 `ai/` 아래 (`layout: "site"`)
 *
 * 배럴에서 내보내지 않는 부품(내부 전용 · 아직 공개 전)의 장은 싣지 않는다 — AI 가 그 이름을 쓰게 된다.
 * 그 장을 가리키는 링크는 GitHub 의 원본으로 바꾼다.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GITHUB = "https://github.com/code7004/txstack";

/** 실을 패키지 문서 폴더와 그 패키지. 차례가 곧 `llms.txt` · `llms-full.txt` 의 차례다 */
const SECTIONS = [
  { dir: "docs/001_ui", pkg: "ui" },
  { dir: "docs/002_route_meta", pkg: "route-meta" },
  { dir: "docs/003_hooks", pkg: "hooks" },
  { dir: "docs/004_axios", pkg: "axios" },
  { dir: "docs/012_fns", pkg: "fns" }
];

/** 문서 폴더 안이지만 싣지 않는 장 — 이유는 docs/013_ai_guide.md 의 "이 장을 고칠 때" */
const EXCLUDE = new Set(["docs/012_fns/001_proposal.md"]);

const RULES_SOURCE = "docs/013_ai_guide.md";
const RULES_END = /^<!-- ai-guide:end/m;

const read = (root, path) => readFileSync(join(root, path), "utf8");

/** `@txstack/ui` 의 배럴(루트 · 서브패스)이 내보내는 부품 폴더 이름 — `TxMenu` 처럼 폴더가 곧 장의 이름이다 */
function exportedFolders(root) {
  const barrels = ["index.ts", "aggrid.ts", "daypicker.ts"].map((file) => read(root, `packages/ui/src/${file}`)).join("\n");
  return new Set([...barrels.matchAll(/from "\.\/(Tx\w+)/g)].map((match) => match[1]));
}

/**
 * 장 하나의 목차 정보. 제목은 `# 001 · TxButton` 의 뒷부분, 요약은 제목 바로 아래 문단(대개 인용문)의
 * 첫 문장, 진입점 · 내보내는 것은 머리 표(두 칸짜리 줄)에서 읽는다.
 */
export function describeDoc(markdown) {
  const title = (markdown.match(/^# (?:\d+ · )?(.+)$/m)?.[1] ?? "").replace(/`/g, "").trim();
  const lead = (markdown.match(/^# .+\n+((?:[^\n]+\n?)+)/)?.[1] ?? "")
    .split("\n")
    .map((text) => text.replace(/^>\s?/, ""))
    .join(" ");
  const plain = lead.replace(/\*\*/g, "").replace(/\\\*/g, "*").replace(/\s+/g, " ").trim();
  const summary = (plain.match(/^.+?\.(?=\s|$)/)?.[0] ?? plain).trim();
  const row = (name) => markdown.match(new RegExp(`^\\|\\s*${name}\\s*\\|\\s*([^|]+?)\\s*\\|$`, "m"))?.[1];
  return { title, summary, entry: row("진입점"), exports: row("내보내는 것") };
}

/** 실을 문서 전부 — `{ source, out, section }`. `source` 는 저장소 경로, `out` 은 가이드 안의 경로다 */
function collect(root) {
  const exported = exportedFolders(root);
  const docs = [];

  for (const section of SECTIONS) {
    for (const file of readdirSync(join(root, section.dir))
      .filter((name) => name.endsWith(".md"))
      .sort()) {
      const source = `${section.dir}/${file}`;
      if (EXCLUDE.has(source)) continue;

      // 부품 장은 배럴이 내보낼 때만 싣는다. 000_README · 900_common 같은 장은 늘 싣는다
      const component = file.match(/^\d+_(Tx\w+)\.md$/)?.[1];
      if (section.pkg === "ui" && component && !exported.has(component)) continue;

      docs.push({ source, out: source, section, component });
    }
  }

  const readmes = SECTIONS.map(({ pkg }) => ({ source: `packages/${pkg}/README.md`, out: `packages/${pkg}/README.md`, pkg }));
  return { docs, readmes };
}

/**
 * 링크를 가이드 안에서 통하게 고친다. 가이드에 실린 문서를 가리키면 **가이드 안의 상대 경로**로,
 * 그 밖(소스 · 실리지 않은 장 · 앱)을 가리키면 GitHub 의 원본으로.
 */
function rewriteLinks(markdown, source, out, included, root) {
  return markdown.replace(/\]\((<[^>]+>|[^)\s]+)\)/g, (whole, raw) => {
    const target = raw.replace(/^<|>$/g, "");
    if (/^(?:[a-z]+:|#|\/)/i.test(target)) return whole;

    const [path, hash] = target.split("#");
    const resolved = posix.normalize(posix.join(posix.dirname(source), decodeURI(path)));
    const anchor = hash === undefined ? "" : `#${hash}`;

    const inside = included.get(resolved);
    if (inside) return `](${posix.relative(posix.dirname(out), inside) || posix.basename(inside)}${anchor})`;

    const absolute = join(root, resolved);
    const kind = existsSync(absolute) && statSync(absolute).isDirectory() ? "tree" : "blob";
    return `](${GITHUB}/${kind}/main/${encodeURI(resolved)}${anchor})`;
  });
}

function revision(root) {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

/** `rules.md` 의 "네 가지 원칙" 목록 — `llms.txt` 머리에 그대로 옮긴다. 같은 글을 두 곳에 쓰지 않으려고 */
function principles(rules) {
  const section = rules.match(/^## 1\..*\n([\s\S]*?)^## /m)?.[1] ?? "";
  return section.trim();
}

/**
 * 가이드 파일 전부를 `Map<경로, 내용>` 으로 돌려준다.
 *
 * @param {{ root?: string, layout?: "package" | "site" }} [options]
 *   `package` — 전부 한 폴더 아래(`node_modules/@txstack/ui/ai/`).
 *   `site` — `llms.txt` · `llms-full.txt` 는 사이트 루트, 나머지는 `ai/` 아래. 관례상 `/llms.txt` 가 루트에 있어야 찾는다.
 */
export function buildAiGuide({ root = ROOT, layout = "package" } = {}) {
  const prefix = layout === "site" ? "ai/" : "";
  const version = JSON.parse(read(root, "packages/ui/package.json")).version;
  const rev = revision(root);
  const stamp = `@txstack/ui ${version}${rev ? ` · 커밋 ${rev}` : ""}`;

  const { docs, readmes } = collect(root);
  const entries = [{ source: RULES_SOURCE, out: "rules.md" }, ...docs, ...readmes];
  const included = new Map(entries.map((entry) => [entry.source, `${prefix}${entry.out}`]));

  const files = new Map();
  const bodies = [];

  for (const entry of entries) {
    let markdown = read(root, entry.source);
    if (entry.source === RULES_SOURCE) {
      const end = markdown.search(RULES_END);
      if (end < 0) throw new Error(`${RULES_SOURCE} 에 ai-guide:end 표시가 없다`);
      markdown = `${markdown.slice(0, end).trimEnd()}\n`;
    }

    const out = `${prefix}${entry.out}`;
    const body = rewriteLinks(markdown, entry.source, out, included, root);
    files.set(out, entry.source === RULES_SOURCE ? `${body}\n---\n\n_${stamp} 과 같은 버전이다._\n` : body);
    bodies.push({ out, body });
  }

  const rules = files.get(`${prefix}rules.md`);
  const link = (path) => `${prefix}${path}`;
  const line = (doc) => {
    const info = describeDoc(read(root, doc.source));
    const index = doc.out.endsWith("/000_README.md");
    const title = index ? `${info.title} 문서 목차` : info.title;
    const names = info.exports && info.exports.replace(/`/g, "") !== info.title ? ` (${info.exports.replace(/`/g, "")})` : "";
    const entry = !index && info.entry && info.entry !== "`@txstack/ui`" ? ` — ${info.entry}` : "";
    return `- [${title}${names}](${link(doc.out)}): ${info.summary}${entry}`;
  };

  const llms = [
    "# txstack",
    "",
    `> 관리 화면과 서비스를 위한 React 라이브러리 세트 — \`@txstack/ui\` · \`route-meta\` · \`hooks\` · \`axios\` · \`fns\`. 이 가이드는 ${stamp} 과 같은 버전이다.`,
    "",
    `화면 요소를 만들기 전에 [규칙](${link("rules.md")})을 읽는다 — 만들려는 것마다 쓸 부품을 정한 결정표가 거기 있다. 부품을 쓰기 전에는 그 부품의 장을 읽는다.`,
    "",
    principles(rules),
    "",
    "## 규칙",
    "",
    `- [txstack 우선 규칙](${link("rules.md")}): 결정표 · 직접 만들지 말 원시 요소 · 토큰 커스터마이징 · 부품이 못 하는 것 · CLAUDE.md 문단과 eslint 설정`,
    `- [전체 본문](llms-full.txt): 규칙과 아래 문서 전부를 한 파일로`,
    ...SECTIONS.flatMap((section) => {
      const chapters = docs.filter((doc) => doc.section === section);
      const parts = section.pkg === "ui" ? [chapters.filter((doc) => !doc.component), chapters.filter((doc) => doc.component)] : [chapters];
      return ["", `## @txstack/${section.pkg}`, "", `- [README](${link(`packages/${section.pkg}/README.md`)}): 설치 · 진입점 · 짧은 예제`, ...parts.flat().map(line)];
    }),
    ""
  ].join("\n");

  const full = [
    `# txstack — AI 가이드 전체 본문`,
    "",
    `> ${stamp}. 규칙(rules.md) 다음에 패키지 문서가 이어진다. 각 문서 앞의 \`source\` 주석이 가이드 안의 경로다.`,
    "",
    ...bodies.map(({ out, body }) => `<!-- source: ${out} -->\n\n${body.trimEnd()}\n`)
  ].join("\n");

  files.set("llms.txt", llms);
  files.set("llms-full.txt", full);
  return files;
}

/** 폴더를 비우고 가이드를 쓴다. 지운 장이 남지 않게 늘 새로 쓴다 */
export function writeAiGuide(outDir, options) {
  rmSync(outDir, { recursive: true, force: true });
  const files = buildAiGuide(options);
  for (const [path, content] of files) {
    const file = join(outDir, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  return files;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = process.argv[2];
  if (!out) throw new Error("쓸 폴더를 준다: node scripts/ai-guide.mjs <폴더>");
  const files = writeAiGuide(resolve(out));
  console.log(`AI 가이드 ${files.size}개 → ${relative(process.cwd(), resolve(out)) || "."}`);
}
