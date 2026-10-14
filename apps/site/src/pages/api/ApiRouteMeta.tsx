import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";

export function ApiRouteMeta() {
  return (
    <Page title="@txstack/route-meta" lead="라우트를 메타데이터 트리 하나로 선언하고, 라우터와 메뉴, 현재 위치를 모두 이 트리에서 만듭니다.">
      <Block title="The problem it solves">
        <p className="text-slate-600 dark:text-slate-300">
          라우트 정의와 메뉴 정의를 <strong>따로 관리하면</strong> 경로를 바꿀 때 두 곳을 고쳐야 하고, 한 곳을 빠뜨리면 메뉴가 없는 페이지를 가리키게 됩니다. 권한 필터도 두 번 작성해야 합니다.
        </p>

        <CodeBlock language="text" title="트리 하나에서 모두 만듭니다">{`RouteTree
   ├─ buildRouteObjects   → React Router의 RouteObject[]
   ├─ getNavigableRoutes  → 메뉴 (NavRoute[])
   └─ useCurrentRouteNode → 현재 위치 · 브레드크럼`}</CodeBlock>
      </Block>

      <Block title="Declaration">
        <CodeBlock title="routes.tsx">{`export const routes = {
  home: { path: "/", element: <Home />, meta: { label: "Home" } },

  docs: {
    path: "/docs",
    element: <Outlet />,
    meta: { label: "Documents" },
    children: {
      index: { index: true, element: <DocsHome /> },      // 메뉴에는 나오지 않습니다
      start: { path: "/docs/start", element: <Start />, meta: { label: "Getting Started" } },
      draft: { path: "/docs/draft", element: <Draft />, meta: { label: "Draft", hidden: true } },
      admin: { path: "/docs/admin", element: <Admin />, meta: { permissions: ["admin"] } }
    }
  }
} satisfies RouteTree;`}</CodeBlock>

        <TxAlert variant="warning" title="satisfies로 타입을 검사하세요">
          타입 주석(<code>const routes: RouteTree = …</code>)을 쓰면 키가 <code>string</code>으로 넓어져 <code>routes.docs.children.start</code> 같은 자동 완성이 되지 않습니다. <code>satisfies</code>는 타입 검사만 하고 객체의 실제 형태는 그대로
          남깁니다.
        </TxAlert>
      </Block>

      <Block title="Router vs. menu filtering">
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
                ["index route", "등록", "제외 (경로가 없음)"]
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
            <code>hidden</code>인 라우트도 주소로는 열립니다.
          </strong>{" "}
          메뉴에만 보이지 않을 뿐입니다. 목록에서 버튼을 눌러 들어가는 상세 화면 같은 경우에 씁니다.
        </p>
      </Block>

      <Block title="Usage">
        <CodeBlock title="App.tsx">{`const ROUTE_OBJECTS = buildRouteObjects(routes);   // 모듈 상수로 둡니다
const MENU = getNavigableRoutes(routes, canAccess);

function App() {
  const screen = useRoutes(ROUTE_OBJECTS);
  const { matches } = useCurrentRouteNode(routes);   // 브레드크럼은 matches로 만듭니다

  return <Shell menu={MENU}>{screen}</Shell>;
}`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          메뉴는 <code>NavRoute[]</code>로 받습니다 — <code>{"{ key, path, meta, children? }"}</code>. <strong>부모와 자식이 같은 형태</strong>라서 함수 하나를 재귀로 호출해 그리면 됩니다.
        </p>

        <CodeBlock title="메뉴 그리기">{`const item = (n: NavRoute) => (
  <TxSideNav.Item key={n.key} icon={n.meta?.icon} label={n.meta?.label ?? n.key} as={NavLink} to={n.path}>
    {n.children?.map(item)}
  </TxSideNav.Item>
);`}</CodeBlock>

        <TxAlert variant="info" title="두 패키지는 서로 의존하지 않습니다">
          <code>@txstack/ui</code>와 <code>route-meta</code>는 서로를 import하지 않습니다. <strong>둘을 잇는 코드는 앱에서 작성</strong>하고, 컴포넌트에는 <code>as={"{NavLink}"}</code>만 넘기면 됩니다. 이 사이트의 메뉴도 이렇게 짧은 코드로
          연결했습니다.
        </TxAlert>
      </Block>

      <Block title="Permissions via a predicate">
        <CodeBlock title="canAccess">{`const menu = getNavigableRoutes(routes, (permissions) =>
  permissions.some((p) => user.roles.includes(p))
);

// 판정 함수를 넘기지 않으면 권한이 걸린 노드는 모두 빠집니다
const publicMenu = getNavigableRoutes(routes);`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          단일 권한이든 다중 권한이든 계층형이든 <strong>권한 모델은 앱이 정합니다.</strong> <code>canAccess</code>는 <code>meta.permissions</code>가 있는 노드에서만 호출됩니다.
        </p>
      </Block>
    </Page>
  );
}
