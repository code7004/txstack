import { useMemo, useState, type ReactNode } from "react";
import { Link, NavigationType, UNSAFE_LocationContext } from "react-router-dom";
import { getNavRoutes, useBreadcrumbs, type Breadcrumb, type NavRoute, type RouteTree } from "@txstack/route-meta";
import { TxBreadcrumb, TxButton, TxNavBar, TxSideNav } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";

/**
 * **라우트 트리 하나로 GNB · 사이드바 · 경로 표시를 함께 그린다**(docs/008 4.5).
 *
 * 결과 옆(좁으면 아래)의 코드는 그 화면이 쓰는 **같은 트리 객체를 글자로 옮긴 것**이다 — 메뉴 배열도 경로 칸도 따로 적어 두지 않는다.
 * - 메뉴: `getNavRoutes(tree, canAccess)` → TxNavBar · TxSideNav
 * - 경로: `useBreadcrumbs(tree)` → TxBreadcrumb `items`
 *
 * 사이트는 이미 라우터 안이라 라우터를 하나 더 두지 않는다. 그래서 메뉴는 링크 대신 버튼이고, 주소는 이 판 안의
 * 상태다 — 시연을 눌러도 사이트의 주소와 메뉴는 그대로다. `useBreadcrumbs` 는 주소를 라우터에서 읽으므로
 * **이 판 안에서만 주소를 바꿔 끼운다**(`LocationContext`). 앱에서는 이 자리가 필요 없다.
 */

const base = {
  dashboard: { path: "/dashboard", meta: { label: "대시보드" } },
  members: {
    path: "/members",
    meta: { label: "회원" },
    children: {
      list: { path: "/members/list", meta: { label: "목록" } },
      invites: { path: "/members/invites", meta: { label: "초대" } }
    }
  },
  settings: {
    path: "/settings",
    meta: { label: "설정", permissions: ["admin"] },
    children: {
      roles: { path: "/settings/roles", meta: { label: "권한" } },
      billing: { path: "/settings/billing", meta: { label: "결제" } }
    }
  }
} satisfies RouteTree;

/** 미리 준비한 설정 바꾸기. 자유 편집 대신 고르면 코드와 메뉴가 함께 바뀐다 */
const PRESETS: { name: string; tree: RouteTree }[] = [
  { name: "기본", tree: base },
  {
    name: "메뉴 추가",
    tree: {
      ...base,
      reports: { path: "/reports", meta: { label: "리포트" } }
    }
  },
  {
    name: "이름 변경",
    tree: {
      ...base,
      members: { ...base.members, meta: { label: "사용자" } }
    }
  }
];

/** 트리를 보이는 코드로. 이 판이 다루는 모양(path · meta · children)만 옮긴다 */
function toSource(tree: RouteTree, depth = 1): string {
  const pad = "  ".repeat(depth);
  const entries = Object.entries(tree).map(([key, node]) => {
    if (node.index) return `${pad}${key}: { index: true }`;
    const meta = node.meta ? `{ label: "${node.meta.label}"${node.meta.permissions ? `, permissions: [${node.meta.permissions.map((p) => `"${p}"`).join(", ")}]` : ""} }` : "";
    if (!node.children) return `${pad}${key}: { path: "${node.path}", meta: ${meta} }`;
    return `${pad}${key}: {\n${pad}  path: "${node.path}",\n${pad}  meta: ${meta},\n${pad}  children: {\n${toSource(node.children, depth + 2)}\n${pad}  }\n${pad}}`;
  });
  return entries.join(",\n");
}

/** 기본 설정에서 무엇이 달라졌나. 더해진 메뉴와 이름이 바뀐 메뉴의 키 */
function changesOf(tree: RouteTree) {
  const added = Object.keys(tree).filter((key) => !(key in base));
  const renamed = Object.keys(tree).filter((key) => key in base && tree[key]!.meta?.label !== base[key as keyof typeof base].meta.label);
  return { added, renamed };
}

/** 코드에서 그 글자가 든 줄 번호(1부터) */
const linesWith = (source: string, needle: string) =>
  source
    .split("\n")
    .map((line, index) => (line.includes(needle) ? index + 1 : 0))
    .filter(Boolean);

/** 이 판 안의 주소를 라우터의 지금 주소로 준다. 사이트의 주소는 건드리지 않는다 */
function DemoLocation({ path, children }: { path: string; children: ReactNode }) {
  const value = useMemo(() => ({ location: { pathname: path, search: "", hash: "", state: null, key: path }, navigationType: NavigationType.Pop }), [path]);
  return <UNSAFE_LocationContext.Provider value={value}>{children}</UNSAFE_LocationContext.Provider>;
}

/** 경로 칸. 앱에서 쓰는 한 줄 그대로다 — 칸을 적지 않는다. 바뀐 칸에만 표식을 단다 */
function DemoCrumbs({ tree, mark, go }: { tree: RouteTree; mark: (crumb: Breadcrumb) => ReactNode; go: (path: string) => void }) {
  const crumbs = useBreadcrumbs(tree).map((crumb) => ({ ...crumb, label: mark(crumb) }));
  return (
    <>
      <TxBreadcrumb items={crumbs} itemAs="button" itemProps={(item) => ({ className: "cursor-pointer hover:underline", onClick: () => item.path && go(item.path) })} style={{ "--tx-breadcrumb-font-size": "1rem" } as React.CSSProperties} />
      <h4 className="text-lg font-semibold">{crumbs.at(-1)?.label}</h4>
    </>
  );
}

/** 결과 판의 자리 이름. 무엇이 트리에서 나왔는지 짚는다 */
const Slot = ({ name, from }: { name: string; from: string }) => (
  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
    <span className="rounded px-1 font-semibold" style={{ backgroundColor: "color-mix(in oklab, var(--tx-color-primary) 15%, transparent)", color: "var(--tx-color-primary-strong)" }}>
      {name}
    </span>
    <code>{from}</code>
  </span>
);

/** 묶음은 첫 자식 화면으로 간다 */
const firstLeaf = (item: NavRoute): string => (item.children?.length ? firstLeaf(item.children[0]!) : item.path);

export function RouteMenuDemo() {
  const [preset, setPreset] = useState(PRESETS[0]!);
  const [role, setRole] = useState<"admin" | "viewer">("admin");
  const [path, setPath] = useState("/members/list");

  const tree = preset.tree;
  // 같은 트리에서 메뉴와 라우트를 함께 만든다
  const menu = useMemo(() => getNavRoutes(tree, (permissions) => permissions.includes(role)), [tree, role]);

  // 메뉴에 남아 있는 화면인가. 권한으로 빠졌으면 첫 메뉴의 화면을 보인다(상태는 그대로 두고 보이는 값만)
  const inMenu = (items: NavRoute[], target: string): boolean => items.some((item) => item.path === target || (!!item.children && inMenu(item.children, target)));
  const shown = inMenu(menu, path) ? path : menu[0] ? firstLeaf(menu[0]) : path;

  // 무엇이 바뀌었는지 — 코드의 그 줄, 두 메뉴의 그 항목, 한 줄 안내가 함께 가리킨다
  const { added, renamed } = changesOf(tree);
  const source = `export const routes = {\n${toSource(tree)}\n} satisfies RouteTree;`;
  const marked = [...added.flatMap((key) => linesWith(source, `${key}: {`)), ...renamed.flatMap((key) => linesWith(source, `label: "${tree[key]!.meta?.label}"`)), ...(role === "viewer" ? linesWith(source, "permissions:") : [])];
  /** 바뀐 메뉴는 이름 앞에 표식을 단다(＋ 더함 · ✎ 이름 바꿈). 색이 아니라 글자로 보인다 */
  const markOf = (key: string) => (added.includes(key) ? "＋ " : renamed.includes(key) ? "✎ " : "");
  const labelOf = (item: NavRoute) => `${markOf(item.key)}${item.meta?.label ?? item.key}`;
  const nameOf = (key: string) => tree[key]?.meta?.label ?? key;
  const status =
    role === "viewer"
      ? '뷰어로 보면 permissions가 "admin"인 설정 메뉴가 GNB와 사이드바에서 함께 빠집니다. 메뉴만 거르는 것이고, 주소로 들어오는 것을 막는 일은 앱과 서버가 합니다.'
      : added.length
        ? `코드에 ${added.join(", ")} 항목을 더했더니 GNB와 사이드바에 “＋ ${added.map(nameOf).join(", ")}”가 함께 생겼습니다. 눌러 보면 경로도 따라옵니다.`
        : renamed.length
          ? `label 하나를 “${renamed.map(nameOf).join(", ")}”로 바꿨더니 GNB · 사이드바 · 경로 표시가 함께 바뀌었습니다(✎ 표시).`
          : "설정을 바꿔 보세요. 코드 한 곳이 바뀌면 GNB · 사이드바 · 경로가 함께 바뀝니다.";

  const go = (item: NavRoute) => setPath(firstLeaf(item));
  const here = (item: NavRoute) => (shown === item.path || shown.startsWith(`${item.path}/`) ? "page" : undefined);

  const sideItem = (item: NavRoute) =>
    item.children ? (
      <TxSideNav.Item key={item.key} label={labelOf(item)} defaultOpen>
        {item.children.map(sideItem)}
      </TxSideNav.Item>
    ) : (
      <TxSideNav.Item key={item.key} label={labelOf(item)} as="button" type="button" aria-current={shown === item.path ? "page" : undefined} onClick={() => setPath(item.path)} />
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500 dark:text-slate-400">설정 바꾸기</span>
        {PRESETS.map((item) => (
          <TxButton key={item.name} label={item.name} variant={item.name === preset.name ? "primary" : "secondary"} aria-pressed={item.name === preset.name} onClick={() => setPreset(item)} />
        ))}
        <TxButton label={role === "admin" ? "뷰어로 보기" : "관리자로 보기"} variant="ghost" onClick={() => setRole((prev) => (prev === "admin" ? "viewer" : "admin"))} />
      </div>
      {/* 바뀐 결과를 한 줄로. 화면 낭독기도 읽는다 — 포커스는 누른 버튼에 그대로 둔다 */}
      <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
        {status}
      </p>

      {/*
       * **결과가 먼저, 코드가 다음이다.** 한 열이 되는 좁은 화면에서 설정을 바꾼 결과를 긴 코드 아래로 밀어내지 않는다.
       * 화면 순서만 CSS 로 바꾸지 않고 DOM 순서를 바꾼다 — 키보드 · 낭독기가 읽는 순서도 같아야 한다.
       */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* 같은 트리로 그린 작은 앱. 라우터 대신 이 판의 상태가 주소다. 세 자리에 무엇이 그렸는지 이름을 붙인다 */}
        <div className="flex h-full flex-col overflow-hidden rounded-lg border" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
          <div className="flex items-center gap-2 border-b px-2" style={{ borderColor: "var(--tx-color-border)" }}>
            <Slot name="GNB" from="getNavRoutes" />
            <TxNavBar aria-label="샘플 상단 메뉴">
              {menu.map((item) => (
                <TxNavBar.Item key={item.key} label={labelOf(item)} as="button" type="button" aria-current={here(item)} onClick={() => go(item)} />
              ))}
            </TxNavBar>
          </div>
          <div className="flex min-h-56 flex-1 flex-col sm:flex-row">
            <div className="flex flex-col gap-1 border-b p-2 sm:w-44 sm:shrink-0 sm:border-e sm:border-b-0" style={{ borderColor: "var(--tx-color-border)" }}>
              <Slot name="사이드바" from="getNavRoutes" />
              <TxSideNav aria-label="샘플 사이드바">{menu.map(sideItem)}</TxSideNav>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <Slot name="경로" from="useBreadcrumbs" />
              <DemoLocation path={shown}>
                <DemoCrumbs tree={tree} mark={(crumb) => `${markOf(crumb.key)}${crumb.label}`} go={setPath} />
              </DemoLocation>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{shown}</p>
            </div>
          </div>
        </div>

        {/* 고를 때마다 새로 그려 짚은 줄이 다시 한 번 밝게 뜬다 */}
        <CodeBlock key={`${preset.name}-${role}`} title="routes.tsx — 이 판이 쓰는 설정 그대로(메뉴 부분)" maxHeight="26rem" marked={marked}>
          {source}
        </CodeBlock>
      </div>

      <CodeBlock title="App.tsx — 연결 부분만 발췌">{`// 같은 트리 하나에서 세 가지
const router = buildRouteObjects(routes);                           // 라우터  → useRoutes(router)
const menu = getNavRoutes(routes, (perms) => perms.includes(role));   // 메뉴    → GNB · 사이드바

<TxNavBar>{menu.map(barItem)}</TxNavBar>
<TxSideNav>{menu.map(sideItem)}</TxSideNav>
<TxBreadcrumb items={useBreadcrumbs(routes)} itemAs={NavLink} />     // 경로    → 칸을 적지 않는다`}</CodeBlock>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        위 두 코드는 줄인 발췌입니다 — 화면(<code>element</code>)과 <code>role</code> · <code>barItem</code> · <code>sideItem</code> 정의가 빠져 있습니다. 그대로 돌아가는 완성 코드는{" "}
        <Link to="/example/routes" className="underline">
          Example › Routes
        </Link>
        (화면까지 등록한 트리)와{" "}
        <Link to="/example/app" className="underline">
          Example › App
        </Link>
        (권한 · 메뉴 · 레이아웃 연결)에 있습니다.
      </p>
    </div>
  );
}
