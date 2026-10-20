import ts from "typescript";
import { describe, expect, it } from "vitest";
import * as fns from "../../../../../packages/fns/src/index";
import { TABLES } from "./data";
import { FNS_EXAMPLES } from "./fnsExamples";

/**
 * **API › fns 의 예제는 거짓말을 하지 않는다.**
 *
 * 1. 함수마다 예제가 하나씩 있다 — 함수가 늘었는데 예제가 없으면 깨진다
 * 2. 예제가 가져오는 이름은 루트에 실제로 있다
 * 3. `식; // → 값` 줄이 있는 덩어리를 실제로 실행해 값을 비교한다. 브라우저 그룹은 빼고
 *
 * 예제는 TypeScript 라 `typescript` 로 JS 로 바꿔 돌린다. 덩어리는 빈 줄로 나뉘고, `// →` 가 없는
 * 덩어리(화면 · 앱 안에서의 쓰임새)는 실행하지 않는다.
 */

const functions = Object.entries(fns)
  .filter(([, value]) => typeof value === "function")
  .map(([name]) => name);

const examples = Object.entries(FNS_EXAMPLES).flatMap(([group, byName]) => Object.entries(byName).map(([name, code]) => ({ group, name, code })));

const CHECK = /^(\s*)(.+?);\s*\/\/ → (.+)$/;

/** 실행할 덩어리만 — `// →` 줄을 비교 호출로 바꾼다 */
function runnable(code: string): string {
  const body = code.replace(/^import .*$/gm, "").trim();
  return body
    .split(/\n\s*\n/)
    .filter((block) => block.split("\n").some((line) => CHECK.test(line)))
    .map((block) =>
      block
        .split("\n")
        .map((line) => {
          const match = CHECK.exec(line);
          return match ? `${match[1]}__check(${JSON.stringify(match[2].trim())}, await (${match[2]}), () => (${match[3]}));` : line;
        })
        .join("\n")
    )
    .join("\n\n");
}

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (...args: string[]) => (...values: unknown[]) => Promise<void>;

describe("API › fns 예제", () => {
  it("함수마다 예제가 하나씩, 없는 함수의 예제는 없다", () => {
    expect(examples.map((example) => example.name).sort()).toEqual([...functions].sort());
  });

  it("표에 있는 함수의 예제다 — 예제 순서가 표 순서를 따른다", () => {
    const tableNames = Object.values(TABLES.fns).flatMap((table) => table.rows.map(([name]) => name));
    expect(examples.map((example) => example.name).filter((name) => !tableNames.includes(name))).toEqual([]);
  });

  it.each(examples)("$group · $name — 루트에서 가져오고, 가져온 이름이 있다", ({ name, code }) => {
    const imports = [...code.matchAll(/^import \{([^}]+)\} from "([^"]+)";$/gm)];
    expect(imports.map(([, , from]) => from)).toEqual(["@txstack/fns"]);

    const names = imports[0]![1]!.split(",").map((part) => part.trim());
    expect(names).toContain(name);
    for (const imported of names) expect(fns, imported).toHaveProperty(imported);
  });

  it.each(examples.filter(({ group }) => !group.startsWith("browser/")))("$group · $name — // → 의 값이 맞다", async ({ code }) => {
    const source = runnable(code);
    expect(source, "실행해 볼 줄(// →)이 하나는 있어야 한다").toContain("__check(");

    const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve } }).outputText;
    const checks: { expression: string; actual: unknown; expected: unknown }[] = [];
    const __check = (expression: string, actual: unknown, expected: () => unknown) => checks.push({ expression, actual, expected: expected() });

    await new AsyncFunction(...Object.keys(fns), "__check", js)(...Object.values(fns), __check);

    for (const { expression, actual, expected } of checks) expect(actual, expression).toEqual(expected);
  });
});
