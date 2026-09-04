import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";

export function ApiRouteMeta() {
  return (
    <Page title="@txstack/route-meta" lead="라우트를 메타데이터 트리 하나로 선언하고 라우터 · 메뉴 · 현재위치를 거기서 파생시킨다.">
      <Block title="무엇을 푸는가">
        <p className="text-slate-600 dark:text-slate-300">
          라우트 정의와 메뉴 정의를 <strong>따로 들고 있으면</strong> 경로를 바꿀 때 두 곳을 고쳐야 하고, 한 곳을 잊으면 메뉴만 죽은 링크가 된다. 권한 필터도 두 벌이 된다.
        </p>

        <CodeBlock language="text" title="트리 하나가 단일 출처">{`RouteTree
   ├─ buildRouteObjects   → React Router 의 RouteObject[]
   ├─ getNavigableRoutes  → 메뉴 (NavRoute[])
   └─ useCurrentRouteNode → 현재 위치 · 브레드크럼`}</CodeBlock>
      </Block>

      <Block title="선언">
        <CodeBlock title="routes.tsx">{`export const routes = {
  home: { path: "/", element: <Home />, meta: { label: "Home" } },

  docs: {
    path: "/docs",
    element: <Outlet />,
    meta: { label: "Documents" },
    children: {
      index: { index: true, element: <DocsHome /> },      // 메뉴에는 안 오른다
      start: { path: "/docs/start", element: <Start />, meta: { label: "Getting Started" } },
      draft: { path: "/docs/draft", element: <Draft />, meta: { label: "Draft", hidden: true } },
      admin: { path: "/docs/admin", element: <Admin />, meta: { permissions: ["admin"] } }
    }
  }
} satisfies RouteTree;`}</CodeBlock>

        <TxAlert variant="warning" title="satisfies 로 붙인다">
          타입 주석(<code>const routes: RouteTree = …</code>)으로 붙이면 키가 <code>string</code> 으로 넓어져 <code>routes.docs.children.start</code> 자동완성이 죽는다. <code>satisfies</code> 는 검사만 하고 리터럴 형태를 남긴다.
        </TxAlert>
      </Block>

      <Block title="두 계층의 필터가 다르다">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--tx-color-border)" }}>
                <th className="py-2 pe-4 text-start font-semibold" />
                <th className="py-2 pe-4 text-start font-semibold">라우터</th>
                <th className="py-2 text-start font-semibold">메뉴</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-300">
              {[
                ["enabled: false", "제외", "제외"],
                ["meta.hidden", "등록", "제외"],
                ["meta.permissions", "등록", "canAccess 판정"],
                ["index route", "등록", "제외 (경로가 없다)"]
              ].map(([row, router, menu]) => (
                <tr key={row} className="border-b" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="py-2 pe-4 font-mono text-xs">{row}</td>
                  <td className="py-2 pe-4">{router}</td>
                  <td className="py-2">{menu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>
            <code>hidden</code> 인 라우트도 주소로는 열려야 한다.
          </strong>{" "}
          메뉴에 안 보일 뿐이다 — 목록에서 버튼으로 들어가는 화면이 그렇다.
        </p>
      </Block>

      <Block title="쓰는 법">
        <CodeBlock title="App.tsx">{`const ROUTE_OBJECTS = buildRouteObjects(routes);   // 모듈 상수로 둔다
const MENU = getNavigableRoutes(routes, canAccess);

function App() {
  const screen = useRoutes(ROUTE_OBJECTS);
  const { matches } = useCurrentRouteNode(routes);   // 브레드크럼은 이걸로

  return <Shell menu={MENU}>{screen}</Shell>;
}`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          메뉴는 <code>NavRoute[]</code> 로 온다 — <code>{"{ key, path, meta, children? }"}</code>. <strong>위아래가 같은 형태</strong>라 재귀가 한 갈래다.
        </p>

        <CodeBlock title="메뉴 그리기">{`const item = (n: NavRoute) => (
  <TxSideNav.Item key={n.key} icon={n.meta?.icon} label={n.meta?.label ?? n.key} as={NavLink} to={n.path}>
    {n.children?.map(item)}
  </TxSideNav.Item>
);`}</CodeBlock>

        <TxAlert variant="info" title="두 패키지는 서로를 모른다">
          <code>@txstack/ui</code> 와 <code>route-meta</code> 는 서로를 import 하지 않는다. <strong>잇는 코드는 소비자 몫</strong>이고, 부품 쪽은 <code>as={"{NavLink}"}</code> 하나만 열어 두면 된다 — 이 사이트의 메뉴가 그 15줄이다.
        </TxAlert>
      </Block>

      <Block title="권한은 판정 함수가 정한다">
        <CodeBlock title="canAccess">{`const menu = getNavigableRoutes(routes, (permissions) =>
  permissions.some((p) => user.roles.includes(p))
);

// 판정 함수를 주지 않으면 권한이 걸린 노드는 전부 빠진다
const publicMenu = getNavigableRoutes(routes);`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          단일 권한이든 다중이든 계층이든 <strong>모델은 앱이 정한다.</strong> <code>canAccess</code> 는 <code>meta.permissions</code> 가 있는 노드에만 불린다.
        </p>
      </Block>
    </Page>
  );
}
