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
  "DEV_GUIDE_DIFF.md": ["docs/rules/00_DEV_GUIDE_DIFF.md"],
  prettierignore: [".prettierignore"]
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

describe("@txstack/dev-guide — 설정 프리셋", () => {
  it("exports 의 서브패스가 config/ 의 파일을 가리킨다", () => {
    const exportsMap = JSON.parse(read(join(pkgDir, "package.json"))).exports as Record<string, string>;
    for (const name of ["prettier", "commitlint", "lint-staged", "eslint"]) {
      expect(exportsMap[`./${name}`]).toBe(`./config/${name}.js`);
      expect(existsSync(join(pkgDir, "config", `${name}.js`)), name).toBe(true);
    }
  });

  it("prettier — 큰따옴표 · 끝 쉼표 없음 · 줄 폭 250", async () => {
    const { format } = await import("prettier");
    const { default: options } = await import("../packages/dev-guide/config/prettier.js");
    const out = await format("const a = { b: 'x', c: [1, 2,], };\n", { ...options, parser: "typescript" });
    expect(out).toBe('const a = { b: "x", c: [1, 2] };\n');
  });

  it("eslint — React 화면의 훅 규칙 · 타입 import · 쓰지 않는 이름을 잡는다", async () => {
    const { ESLint } = await import("eslint");
    const { base, react, node } = await import("../packages/dev-guide/config/eslint.js");
    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: [...base({ ignores: ["vendor/**"] }), ...react({ files: ["fixture/web/**/*.tsx"] }), ...node({ files: ["fixture/api/**/*.ts"] })]
    });
    const tsx = [
      'import { useState } from "react";',
      'import { Props } from "./types";',
      "export function App(props: Props) {",
      "  if (props.on) {",
      "    const [v] = useState(0);",
      "    return <p>{v}</p>;",
      "  }",
      "  const _unused = 1;",
      "  const unused = 2;",
      "  return <ul>{[1, 2].map((n) => <li>{n}</li>)}</ul>;",
      "}",
      ""
    ].join("\n");
    const [web] = await eslint.lintText(tsx, { filePath: join(root, "fixture/web/App.tsx") });
    const rules = web.messages.map((m) => m.ruleId);
    expect(rules).toContain("react-hooks/rules-of-hooks");
    expect(rules).toContain("@typescript-eslint/consistent-type-imports");
    expect(rules).toContain("react/jsx-key");
    // 접근성 규칙은 recommended 그대로(오류) — recommended 가 끈 규칙은 그대로 꺼져 있다
    const a11y = await eslint.calculateConfigForFile(join(root, "fixture/web/App.tsx"));
    expect(a11y.rules["jsx-a11y/click-events-have-key-events"]?.[0]).toBe(2);
    expect(a11y.rules["jsx-a11y/label-has-for"]?.[0]).toBe(0);
    expect(web.messages.filter((m) => m.ruleId === "@typescript-eslint/no-unused-vars").map((m) => m.message.split("'")[1])).toEqual(["unused"]);

    // node 조각 — process 를 전역으로 안다. 무시 경로는 검사하지 않는다
    const [api] = await eslint.lintText("export const port = process.env.PORT;\n", { filePath: join(root, "fixture/api/main.ts") });
    expect(api.messages).toEqual([]);
    expect(await eslint.isPathIgnored(join(root, "vendor/x.ts"))).toBe(true);
    // eslint 와 플러그인 넷을 처음 불러오는 데 시간이 든다 — 전체 테스트를 함께 돌리면 10초를 넘긴다
  }, 30_000);

  it("commitlint · lint-staged — 모양", async () => {
    const { default: commitlint } = await import("../packages/dev-guide/config/commitlint.js");
    expect(commitlint.extends).toEqual(["@commitlint/config-conventional"]);
    expect(commitlint.rules["subject-case"]).toEqual([0]);
    const { default: lintStaged } = await import("../packages/dev-guide/config/lint-staged.js");
    expect(Object.values(lintStaged).flat()).toEqual(["eslint --fix", "prettier --write", "prettier --write"]);
  });
});
