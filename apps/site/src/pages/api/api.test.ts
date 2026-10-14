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
const page = (name: string) => readFileSync(join(import.meta.dirname, `${name}.tsx`), "utf8");

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
    expect(missing(names, page("ApiAxios"))).toEqual([]);
  });

  it("@txstack/route-meta", () => {
    const names = exportsOf(pkg("route-meta/src/index.ts"));

    expect(names.length).toBeGreaterThan(10);
    expect(missing(names, page("ApiRouteMeta"))).toEqual([]);
  });

  it("@txstack/hooks — 훅마다 진입점", () => {
    const names = [...exportsOf(pkg("hooks/src/useObjectState.ts")), ...exportsOf(pkg("hooks/src/useUrlQuery.ts"))];

    expect(names).toContain("useUrlQuery");
    expect(missing(names, page("ApiHooks"))).toEqual([]);
  });

  /** props 는 Storybook 이 갖는다. 여기서는 컴포넌트(값 export)가 목록에 다 있는지만 본다 */
  it("@txstack/ui — 루트와 서브패스의 컴포넌트", () => {
    const names = [...exportsOf(pkg("ui/src/index.ts"), true), ...exportsOf(pkg("ui/src/aggrid.ts"), true), ...exportsOf(pkg("ui/src/daypicker.ts"), true)].filter((name) => name.startsWith("Tx"));

    expect(names.length).toBeGreaterThan(40);
    expect(missing(names, page("ApiUi"))).toEqual([]);
  });
});
