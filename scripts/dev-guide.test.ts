import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

/**
 * `@txstack/dev-guide` 는 마크다운 묶음이라 빌드도 타입도 없다. 깨지는 자리는 셋이다.
 * - 목차 · 본문이 가리키는 파일이 없거나, 있어도 `files` 에 안 실려 설치본에 없다
 * - README 의 양식 표가 `templates/` 와 어긋난다
 * - 양식 안의 링크는 **복사한 자리 기준**으로 열려야 한다 — 패키지 안에서 열리는지는 상관없다
 *
 * 실제 설치 → README 절차 실행은 `pnpm verify:packages dev-guide` 가 본다.
 */

const root = join(import.meta.dirname, "..");
const pkgDir = join(root, "packages/dev-guide");
const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")) as { files: string[] };

/** 코드 블록 · 인라인 코드 · HTML 주석 밖의 상대 링크. 예제 안의 경로는 소비자 프로젝트의 것이라 뺀다 */
function links(markdown: string) {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/`[^`\n]*`/g, "");
  return [...prose.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1].split("#")[0]).filter((href) => href && !/^[a-z]+:/.test(href));
}

const read = (file: string) => readFileSync(file, "utf8");
const docs = ["README.md", "CHANGELOG.md", "llms.txt", ...["rules", "process"].flatMap((dir) => readdirSync(join(pkgDir, dir)).map((file) => `${dir}/${file}`))];

/** README 「양식」 표의 놓는 곳. 이름의 자리표시(nnn_title · NN_TITLE)를 그대로 파일 이름으로 쓴다 */
const DEST: Record<string, string[]> = {
  "requirements.md": ["docs/requirements/nnn_title.md"],
  "plan.md": ["docs/plans/nnn_title.md"],
  "verification.md": ["docs/verification/nnn_title.md"],
  "report.md": ["docs/reports/nnn_title.md"],
  "rule.md": ["docs/rules/NN_TITLE.md", "docs/project/NN_TITLE.md"],
  "docs-README.md": ["docs/README.md"],
  "CURRENT.md": ["CURRENT.md"],
  "CLAUDE.md": ["CLAUDE.md", "AGENTS.md"],
  "DEV_GUIDE_DIFF.md": ["docs/rules/00_DEV_GUIDE_DIFF.md"]
};

describe("@txstack/dev-guide — 싣는 것", () => {
  it("files 에 적힌 것이 모두 있다", () => {
    for (const entry of pkg.files) expect(existsSync(join(pkgDir, entry)), entry).toBe(true);
  });

  it.each(docs)("%s 의 링크가 패키지 안에서 열리고 설치본에 실린다", (doc) => {
    for (const href of links(read(join(pkgDir, doc)))) {
      const target = resolve(dirname(join(pkgDir, doc)), href);
      const inside = relative(pkgDir, target);
      expect(existsSync(target), `${doc} → ${href}`).toBe(true);
      expect(inside.startsWith(".."), `${doc} → ${href} 가 패키지 밖을 가리킨다`).toBe(false);
      expect(
        pkg.files.some((entry) => inside === entry || inside.startsWith(`${entry}${sep}`)),
        `${doc} → ${href} 가 files 에 없어 설치본에 실리지 않는다`
      ).toBe(true);
    }
  });

  it("llms.txt 가 rules · process · templates 의 모든 장을 가리킨다", () => {
    const listed = new Set(links(read(join(pkgDir, "llms.txt"))));
    for (const dir of ["rules", "process", "templates"]) for (const file of readdirSync(join(pkgDir, dir))) expect(listed.has(`${dir}/${file}`), `${dir}/${file}`).toBe(true);
  });
});

describe("@txstack/dev-guide — 양식", () => {
  const readme = read(join(pkgDir, "README.md"));

  it("README 의 양식 표가 templates/ 와 같고, 놓는 곳이 맞다", () => {
    const rows = [...readme.matchAll(/^\| \[[^\]]+\]\(templates\/([^)]+)\)\s*\|([^|]+)\|/gm)].map((match) => ({ file: match[1], dest: match[2] }));
    expect(rows.map((row) => row.file).sort()).toEqual(readdirSync(join(pkgDir, "templates")).sort());
    expect(Object.keys(DEST).sort()).toEqual(rows.map((row) => row.file).sort());
    for (const row of rows) for (const dest of DEST[row.file]) expect(row.dest, row.file).toContain(dest.split("/").pop());
  });

  const consumer = mkdtempSync(join(tmpdir(), "dev-guide-consumer-"));
  afterAll(() => rmSync(consumer, { recursive: true, force: true }));

  // 소비자 저장소를 흉내 낸다 — 설치본 자리와 README 절차가 만드는 첫 문서
  cpSync(pkgDir, join(consumer, "node_modules/@txstack/dev-guide"), { recursive: true });
  for (const [file, dests] of Object.entries(DEST)) {
    for (const dest of dests) {
      mkdirSync(dirname(join(consumer, dest)), { recursive: true });
      cpSync(join(pkgDir, "templates", file), join(consumer, dest));
    }
  }
  cpSync(join(pkgDir, "templates/rule.md"), join(consumer, "docs/project/01_PROJECT_OVERVIEW.md"));

  it.each(Object.entries(DEST).flatMap(([file, dests]) => dests.map((dest) => [file, dest])))("%s → %s 에 놓으면 링크가 열린다", (file, dest) => {
    const at = join(consumer, dest);
    for (const href of links(read(at))) expect(existsSync(resolve(dirname(at), href)), `${dest} → ${href}`).toBe(true);
  });
});
