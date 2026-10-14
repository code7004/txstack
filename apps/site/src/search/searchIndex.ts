import type { RouteNode, RouteTree } from "@txstack/route-meta";
import { isValidElement } from "react";
import { anchorsOf } from "../lib/slug";
import { API_PAGES, CATALOG, TABLES, type ApiTable } from "../pages/api/data";
import { routes } from "../routes";
import { entry, type SearchEntry } from "./rank";

export { search, type SearchEntry, type SearchKind } from "./rank";

/**
 * **사이트 검색의 색인.** DB 없이 이미 코드에 있는 것을 모은다 —
 *
 * 1. 페이지: 라우트 트리의 `label` · `description` (메뉴와 같은 출처)
 * 2. 섹션: 각 페이지 소스의 `<Block title="…">` 제목. 소스를 글자로 읽어(`?raw`) 뽑는다
 * 3. API 항목: `pages/api/data.ts` 의 표 — API 페이지가 그리는 것과 같은 데이터
 *
 * 그래서 문서를 고치면 검색도 같이 고쳐진다. 손으로 관리하는 키워드가 없다.
 *
 * 섹션은 페이지 소스 전체를 읽어야 해서 **처음 검색할 때 한 번만** 만든다(`loadIndex`).
 * 그 전까지는 페이지와 API 항목만으로 돈다.
 */

/* --- 1. 페이지 --------------------------------------------------------------------------- */

interface Place {
  node: RouteNode;
  path: string;
  trail: string[];
}

/** 트리를 펴서 화면 하나하나의 주소와 위치를 얻는다. 첫 화면(index)은 부모의 주소를 쓴다 */
function places(tree: RouteTree, parent?: Place): Place[] {
  return Object.values(tree).flatMap((node) => {
    if (node.enabled === false || node.path === "*") return [];

    const path = node.index ? (parent?.path ?? "/") : node.path;
    const label = node.meta?.label;
    const trail = node.index || !label ? (parent?.trail ?? []) : [...(parent?.trail ?? []), label];
    const here: Place = { node, path, trail };

    return [here, ...(node.children ? places(node.children, here) : [])];
  });
}

const PLACES = places(routes);

const pageEntries = (): SearchEntry[] => PLACES.filter(({ node }) => !node.index && node.meta?.label && !node.meta.hidden).map(({ node, path, trail }) => entry(node.meta!.label!, trail.slice(0, -1), path, "page", node.meta?.description));

/* --- 3. API 항목 -------------------------------------------------------------------------- */

const apiEntries = (): SearchEntry[] => [
  ...(Object.keys(TABLES) as (keyof typeof TABLES)[]).flatMap((key) =>
    (Object.values(TABLES[key]) as ApiTable[])
      .filter((table) => table.searchable)
      .flatMap((table) => {
        const [anchor] = anchorsOf([table.section]);
        const where = ["API", API_PAGES[key].label, table.label ?? table.section];

        return table.rows.map(([name, , , description]) => entry(name, where, `${API_PAGES[key].path}#${anchor}`, "api", typeof description === "string" ? description : undefined));
      })
  ),
  ...CATALOG.flatMap(([category, items]) => items.flatMap((item) => [item.name, ...(item.also ?? [])].map((name) => entry(name, ["API", "ui", category], "/api/ui#components-by-category", "component", item.desc))))
];

/* --- 2. 섹션 ------------------------------------------------------------------------------ */

/**
 * 섹션을 뽑지 않는 화면. Home 은 목차가 없어 제목에 앵커가 붙지 않고,
 * Profile 의 섹션은 내용을 채워야 나타난다.
 */
const NO_SECTIONS = new Set(["/", "/about/profile"]);

const SECTION_TITLE = /<Block\s+title="([^"]+)"/g;

async function sectionEntries(): Promise<SearchEntry[]> {
  // 소스(글자)와 모듈(컴포넌트). 둘 다 지연 로드라 처음 검색할 때 받는다
  const sources = import.meta.glob<string>("../pages/**/*.tsx", { query: "?raw", import: "default" });
  const modules = import.meta.glob<Record<string, unknown>>("../pages/**/*.tsx");

  const files = await Promise.all(Object.keys(modules).map(async (file) => ({ file, exports: Object.values(await modules[file]!()), source: await sources[file]!() })));

  return PLACES.flatMap(({ node, path, trail }) => {
    if (NO_SECTIONS.has(path) || !isValidElement(node.element)) return [];

    // 라우트의 화면 컴포넌트를 내보내는 파일을 찾는다. **참조로 견준다** — 이름은 빌드하면 압축된다.
    // 개발 서버는 고친 파일을 `?t=…` 를 붙여 다시 불러와서 라우터와 여기가 다른 사본을 쥘 수 있다.
    // 그때만 이름으로 한 번 더 견준다(개발 중에는 이름이 살아 있다)
    const type = node.element.type;
    const sameName = (value: unknown) => import.meta.env.DEV && typeof value === "function" && typeof type === "function" && value.name === type.name;
    const found = files.find(({ exports }) => exports.includes(type)) ?? files.find(({ exports }) => exports.some(sameName));
    if (!found) return [];

    const titles = [...found.source.matchAll(SECTION_TITLE)].map(([, title]) => title!);
    const anchors = anchorsOf(titles);

    return titles.map((title, index) => entry(title, trail, `${path}#${anchors[index]}`, "section"));
  });
}

/* --- 색인 ------------------------------------------------------------------------------ */

let index: SearchEntry[] = [...pageEntries(), ...apiEntries()];
let loading: Promise<SearchEntry[]> | null = null;

/** 섹션까지 넣은 색인을 만든다. 여러 번 불러도 한 번만 만든다 */
export function loadIndex(): Promise<SearchEntry[]> {
  loading ??= sectionEntries().then((sections) => (index = [...pageEntries(), ...sections, ...apiEntries()]));
  return loading;
}

/** 지금 가진 색인. `loadIndex` 가 끝나기 전에는 섹션이 없다 */
export const currentIndex = () => index;
