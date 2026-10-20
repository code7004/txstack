import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * **API 페이지가 export 를 빠뜨리지 않는가.** 패키지에 export 가 늘었는데 문서가 따라오지
 * 않으면 여기서 깨진다 — 사이트를 만들며 실제로 그렇게 비어 있었다.
 *
 * 패키지를 import 하지 않고 **진입 파일을 글자로 읽는다**(CSS 계약 테스트와 같은 방식).
 * `export *` 와 `export { … } from` 을 따라가며 이름을 모은다.
 */

const root = join(import.meta.dirname, "../../../../..");
const pkg = (path: string) => join(root, "packages", path);
/** 페이지와 그 표의 내용(`data.ts`)을 함께 본다 — 표의 이름은 데이터에 있고 페이지는 그것을 그린다 */
const data = readFileSync(join(import.meta.dirname, "data.ts"), "utf8");

/** `data.ts` 에서 그 패키지 몫만 잘라 낸다 — 다른 패키지의 표에 이름이 있다고 통과하면 안 된다 */
function slice(key: string): string {
  const tables = data.slice(data.indexOf("export const TABLES"));
  const start = tables.indexOf(`\n  ${key}: {`);
  if (start < 0) throw new Error(`data.ts 에 ${key} 가 없다`);
  const end = tables.indexOf("\n  }", start + 1);
  return tables.slice(start, end);
}

const page = (name: string, key: string) => readFileSync(join(import.meta.dirname, `${name}.tsx`), "utf8") + (key === "ui" ? data.slice(data.indexOf("export const CATALOG")) : slice(key));

const stripComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

function resolve(from: string, spec: string): string {
  const base = join(dirname(from), spec);
  const found = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find((path) => existsSync(path));
  if (!found) throw new Error(`못 찾았다: ${spec} (${from})`);
  return found;
}

/** 진입 파일이 내보내는 이름. `values` 면 타입 export 를 뺀다 */
function exportsOf(file: string, values = false): string[] {
  const text = stripComments(readFileSync(file, "utf8"));
  const names = new Set<string>();

  for (const [, spec] of text.matchAll(/export \* from "([^"]+)"/g)) {
    exportsOf(resolve(file, spec!), values).forEach((name) => names.add(name));
  }

  for (const [, typeOnly, body] of text.matchAll(/export (type )?\{([^}]*)\}/g)) {
    if (values && typeOnly) continue;

    for (const raw of body!.split(",")) {
      const part = raw.trim();
      if (!part || (values && part.startsWith("type "))) continue;
      names.add(
        part
          .replace(/^type /, "")
          .split(/\s+as\s+/)
          .pop()!
          .trim()
      );
    }
  }

  const declared = values ? /export (?:function|const|class) (\w+)/g : /export (?:function|const|class|interface|type) (\w+)/g;
  for (const [, name] of text.matchAll(declared)) names.add(name!);

  return [...names];
}

const missing = (names: string[], source: string) => names.filter((name) => !new RegExp(`\\b${name}\\b`).test(source));

describe("API 페이지 — export 를 빠뜨리지 않는다", () => {
  it("@txstack/axios — 루트와 singleton", () => {
    const names = [...exportsOf(pkg("axios/src/index.ts")), ...exportsOf(pkg("axios/src/singleton.ts"))];

    expect(names.length).toBeGreaterThan(10);
    expect(missing(names, page("ApiAxios", "axios"))).toEqual([]);
  });

  it("@txstack/route-meta", () => {
    const names = exportsOf(pkg("route-meta/src/index.ts"));

    expect(names.length).toBeGreaterThan(10);
    expect(missing(names, page("ApiRouteMeta", "routeMeta"))).toEqual([]);
  });

  it("@txstack/hooks — 훅마다 진입점", () => {
    const names = [...exportsOf(pkg("hooks/src/useObjectState.ts")), ...exportsOf(pkg("hooks/src/useUrlQuery.ts"))];

    expect(names).toContain("useUrlQuery");
    expect(missing(names, page("ApiHooks", "hooks"))).toEqual([]);
  });

  it("@txstack/fns — 그룹마다 진입점", () => {
    const groups = ["num", "date", "rand", "str", "obj", "arr", "form", "async", "math", "phone-kr", "browser/cookie", "browser/css", "browser/file"];
    const names = groups.flatMap((group) => exportsOf(pkg(`fns/src/${group}.ts`)));

    expect(names.length).toBeGreaterThan(50);
    expect(missing(names, page("ApiFns", "fns"))).toEqual([]);
  });

  /** props 는 Storybook 이 갖는다. 여기서는 컴포넌트(값 export)가 목록에 다 있는지만 본다 */
  it("@txstack/ui — 루트와 서브패스의 컴포넌트", () => {
    const names = [...exportsOf(pkg("ui/src/index.ts"), true), ...exportsOf(pkg("ui/src/aggrid.ts"), true), ...exportsOf(pkg("ui/src/daypicker.ts"), true)].filter((name) => name.startsWith("Tx"));

    expect(names.length).toBeGreaterThan(40);
    expect(missing(names, page("ApiUi", "ui"))).toEqual([]);
  });
});
