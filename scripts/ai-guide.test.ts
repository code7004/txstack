import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as ui from "../packages/ui/src/index";
import { buildAiGuide, describeDoc } from "./ai-guide.mjs";

/**
 * **AI 가이드의 결정표는 손으로 쓴다** — "무엇을 만들 때 무엇을 고르나" 는 문서에서 뽑을 수 없다.
 * 그래서 손으로 쓴 것이 코드와 어긋나지 않는지를 여기서 지킨다(docs/013_ai_guide.md).
 *
 * - 규칙에 적힌 `Tx*` 이름이 전부 실제로 내보내진다 — 없는 부품을 쓰라고 하면 AI 가 그대로 쓴다
 * - 내보내는 부품이 결정표에서 하나도 빠지지 않는다 — 빠지면 AI 는 그 부품을 모르고 손으로 짠다
 */

const root = join(import.meta.dirname, "..");
const files = buildAiGuide();
const rules = files.get("rules.md") ?? "";

/** 서브패스(`/aggrid` · `/daypicker`)는 ag-grid · react-day-picker 를 불러오므로 import 하지 않고 글자로 읽는다 */
const subpathValues = ["aggrid.ts", "daypicker.ts"].flatMap((file) => [...readFileSync(join(root, "packages/ui/src", file), "utf8").matchAll(/^export \{([^}]+)\}/gm)].flatMap((match) => match[1].split(",").map((name) => name.trim())));
const exported = new Set([...Object.keys(ui), ...subpathValues].filter((name) => /^Tx[A-Z]/.test(name)));

/** 내보내지 않는다고 규칙이 밝혀 둔 이름 */
const NOT_PUBLIC = new Set(["TxSiteMap"]);

describe("AI 가이드 — 규칙과 공개 API", () => {
  it("규칙에 적힌 Tx* 이름은 전부 내보내진다", () => {
    const mentioned = new Set([...rules.matchAll(/\bTx[A-Z]\w*/g)].map((match) => match[0]));
    const missing = [...mentioned].filter((name) => !exported.has(name) && !NOT_PUBLIC.has(name));
    expect(missing, "규칙이 없는 부품을 쓰라고 한다").toEqual([]);
  });

  it("내보내는 부품은 전부 규칙에 한 번 이상 나온다", () => {
    // 부품 장 하나 = 부품 하나. 그 장이 내보내는 이름 중 하나라도 규칙에 있으면 된다(TxRadioGroup 은 TxRadio 로 충분하다)
    const chapters = [...files.keys()].filter((path) => /^docs\/001_ui\/\d+_Tx\w+\.md$/.test(path));
    const absent = chapters.filter((path) => {
      const { title, exports } = describeDoc(files.get(path) ?? "");
      const names = [title, ...(exports ?? "").replace(/`/g, "").split(/[,·]/)].map((name) => name.trim().split(".")[0]);
      return !names.some((name) => new RegExp(`\`${name}\\b`).test(rules));
    });
    expect(absent, "새 부품을 결정표에 더하지 않았다 — docs/013_ai_guide.md 2장").toEqual([]);
  });
});

describe("AI 가이드 — 묶음", () => {
  it("규칙 · 목차 · 전체 본문 · 패키지 README 를 낸다", () => {
    for (const path of ["rules.md", "llms.txt", "llms-full.txt", "docs/001_ui/001_TxButton.md", "docs/001_ui/900_common.md", "packages/ui/README.md", "packages/fns/README.md"]) {
      expect(files.has(path), path).toBe(true);
    }
  });

  it("고치는 사람 몫(ai-guide:end 아래)은 싣지 않는다", () => {
    expect(rules).not.toContain("이 장을 고칠 때");
    expect(files.get("llms-full.txt")).not.toContain("이 장을 고칠 때");
  });

  it("내보내지 않는 부품의 장은 싣지 않는다 — AI 가 그 이름을 쓰게 된다", () => {
    expect(files.has("docs/001_ui/005_TxIcons.md")).toBe(false);
    expect(files.has("docs/001_ui/011_TxPopup.md")).toBe(false);
    expect(files.has("docs/001_ui/050_TxSiteMap.md")).toBe(false);
  });

  it("목차의 링크는 전부 가이드 안의 파일을 가리킨다", () => {
    const links = [...(files.get("llms.txt") ?? "").matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
    expect(links.length).toBeGreaterThan(60);
    expect(links.filter((link) => !files.has(link))).toEqual([]);
  });

  it("문서 사이의 상대 링크는 가이드 안에서 통하고, 그 밖은 GitHub 원본으로 간다", () => {
    for (const [path, body] of files) {
      if (!path.endsWith(".md")) continue;
      for (const [, target] of body.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        const resolved = join(path, "..", target.split("#")[0]);
        expect(files.has(resolved), `${path} → ${target}`).toBe(true);
      }
    }
  });

  it("사이트 배치 — llms*.txt 는 루트, 나머지는 ai/ 아래이고 목차 링크가 그 자리를 가리킨다", () => {
    const site = buildAiGuide({ layout: "site" });
    expect(site.has("llms.txt") && site.has("llms-full.txt") && site.has("ai/rules.md")).toBe(true);
    const links = [...(site.get("llms.txt") ?? "").matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
    expect(links.filter((link) => !site.has(link))).toEqual([]);
  });

  it("목차의 요약은 각 장의 첫 문장이다", () => {
    expect(describeDoc("# 001 · TxButton\n\n> 누르면 뭔가 일어나는 자리. 둘째 문장.\n\n|  |  |\n| 진입점 | `@txstack/ui` |\n")).toEqual({
      title: "TxButton",
      summary: "누르면 뭔가 일어나는 자리.",
      entry: "`@txstack/ui`",
      exports: undefined
    });
  });
});
