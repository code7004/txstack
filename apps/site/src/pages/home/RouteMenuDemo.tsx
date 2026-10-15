import { useMemo, useState } from "react";
import { Link, matchRoutes } from "react-router-dom";
import { buildRouteObjects, getNavigableRoutes, type NavRoute, type RouteHandle, type RouteNode, type RouteTree } from "@txstack/route-meta";
import { TxBreadcrumb, TxButton, TxNavBar, TxSideNav } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";

/**
 * **라우트 트리 하나로 GNB 와 사이드바를 함께 그린다**(docs/008 4.5).
 *
 * 왼쪽 코드는 오른쪽 화면이 쓰는 **같은 트리 객체를 글자로 옮긴 것**이다 — 메뉴 배열을 따로 적어 두지 않는다.
 * - 메뉴: `getNavigableRoutes(tree, canAccess)` → TxNavBar · TxSideNav
 * - 지금 화면: `buildRouteObjects(tree)` 를 react-router 의 `matchRoutes` 에 넣어 찾는다
 *
 * 사이트는 이미 라우터 안이라 라우터를 하나 더 두지 않는다. 그래서 메뉴는 링크 대신 버튼이고, 주소는 이 판 안의
 * 상태다 — 시연을 눌러도 사이트의 주소와 메뉴는 그대로다.
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

/** 묶음은 첫 자식 화면으로 간다 */
const firstLeaf = (item: NavRoute): string => (item.children?.length ? firstLeaf(item.children[0]!) : item.path);

export function RouteMenuDemo() {
  const [preset, setPreset] = useState(PRESETS[0]!);
  const [role, setRole] = useState<"admin" | "viewer">("admin");
  const [path, setPath] = useState("/members/list");

  const tree = preset.tree;
  // 같은 트리에서 메뉴와 라우트를 함께 만든다
  const menu = useMemo(() => getNavigableRoutes(tree, (permissions) => permissions.includes(role)), [tree, role]);
  const routeObjects = useMemo(() => buildRouteObjects(tree), [tree]);

  // 메뉴에 남아 있는 화면인가. 권한으로 빠졌으면 첫 메뉴의 화면을 보인다(상태는 그대로 두고 보이는 값만)
  const inMenu = (items: NavRoute[], target: string): boolean => items.some((item) => item.path === target || (!!item.children && inMenu(item.children, target)));
  const shown = inMenu(menu, path) ? path : menu[0] ? firstLeaf(menu[0]) : path;

  // 지금 화면 — 라우터가 하는 매칭 그대로. 바깥 묶음부터 지금 화면까지의 사슬이 경로 표시가 된다
  const matches = matchRoutes(routeObjects, shown) ?? [];
  const trail = matches.map((match) => (match.route.handle as RouteHandle | undefined)?.node).filter((node): node is RouteNode => !!node?.meta?.label);
  const current = trail.at(-1);

  // 무엇이 바뀌었는지 — 코드의 그 줄, 두 메뉴의 그 항목, 한 줄 안내가 함께 가리킨다
  const { added, renamed } = changesOf(tree);
  const source = `export const routes = {\n${toSource(tree)}\n} satisfies RouteTree;`;
  const marked = [...added.flatMap((key) => linesWith(source, `${key}: {`)), ...renamed.flatMap((key) => linesWith(source, `label: "${tree[key]!.meta?.label}"`)), ...(role === "viewer" ? linesWith(source, "permissions:") : [])];
  /** 바뀐 메뉴는 이름 앞에 표식을 단다(＋ 더함 · ✎ 이름 바꿈). 색이 아니라 글자로 보인다 */
  const labelOf = (item: NavRoute) => `${added.includes(item.key) ? "＋ " : renamed.includes(item.key) ? "✎ " : ""}${item.meta?.label ?? item.key}`;
  const nameOf = (key: string) => tree[key]?.meta?.label ?? key;
  const status =
    role === "viewer"
      ? '뷰어로 보면 permissions가 "admin"인 설정 메뉴가 GNB와 사이드바에서 함께 빠집니다. 메뉴만 거르는 것이고, 주소로 들어오는 것을 막는 일은 앱과 서버가 합니다.'
      : added.length
        ? `코드에 ${added.join(", ")} 항목을 더했더니 GNB와 사이드바에 “＋ ${added.map(nameOf).join(", ")}”가 함께 생겼습니다.`
        : renamed.length
          ? `label 하나를 “${renamed.map(nameOf).join(", ")}”로 바꿨더니 GNB · 사이드바 · 경로 표시가 함께 바뀌었습니다(✎ 표시).`
          : "설정을 바꿔 보세요. 코드 한 곳이 바뀌면 GNB와 사이드바가 함께 바뀝니다.";

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

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* 고를 때마다 새로 그려 짚은 줄이 다시 한 번 밝게 뜬다 */}
        <CodeBlock key={`${preset.name}-${role}`} title="routes.tsx — 이 판이 쓰는 설정 그대로(메뉴 부분)" maxHeight="26rem" marked={marked}>
          {source}
        </CodeBlock>

        {/* 같은 트리로 그린 작은 앱. 라우터 대신 이 판의 상태가 주소다 */}
        <div className="flex flex-col overflow-hidden rounded-lg border h-full" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
          <div className="border-b px-2" style={{ borderColor: "var(--tx-color-border)" }}>
            <TxNavBar aria-label="샘플 상단 메뉴">
              {menu.map((item) => (
                <TxNavBar.Item key={item.key} label={labelOf(item)} as="button" type="button" aria-current={here(item)} onClick={() => go(item)} />
              ))}
            </TxNavBar>
          </div>
          <div className="flex min-h-56 flex-1 flex-col sm:flex-row">
            <div className="border-b p-2 sm:w-40 sm:shrink-0 sm:border-e sm:border-b-0" style={{ borderColor: "var(--tx-color-border)" }}>
              <TxSideNav aria-label="샘플 사이드바">{menu.map(sideItem)}</TxSideNav>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <TxBreadcrumb>
                {trail.map((node, index) => (
                  <TxBreadcrumb.Item key={node.path} current={index === trail.length - 1}>
                    {node.meta?.label}
                  </TxBreadcrumb.Item>
                ))}
              </TxBreadcrumb>
              <h4 className="text-lg font-semibold">{current?.meta?.label}</h4>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{shown}</p>
            </div>
          </div>
        </div>
      </div>

      <CodeBlock title="App.tsx — 연결 부분만 발췌">{`// 같은 트리 하나에서
const router = buildRouteObjects(routes);                                  // → useRoutes(router) 또는 <RouteRenderer tree={routes} />
const menu = getNavigableRoutes(routes, (perms) => perms.includes(role));  // → 메뉴 데이터

<TxNavBar>{menu.map((item) => <TxNavBar.Item key={item.key} label={item.meta?.label} as={NavLink} to={item.path} />)}</TxNavBar>
<TxSideNav>{menu.map(sideItem)}</TxSideNav>   // sideItem: 자식이 있으면 펼치는 묶음, 없으면 링크`}</CodeBlock>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        위 두 코드는 메뉴를 보이려고 줄인 발췌입니다 — 화면(<code>element</code>)과 <code>role</code> · <code>sideItem</code> 정의가 빠져 있습니다. 그대로 돌아가는 완성 코드는{" "}
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
