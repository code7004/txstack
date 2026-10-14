import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { RefLabel, RefTable, Signature } from "../../components/Reference";
import { TABLES } from "./data";

const muted = "text-slate-600 dark:text-slate-300";

export function ApiRouteMeta() {
  return (
    <Page
      title="@txstack/route-meta"
      lead={
        <>
          라우트를 메타데이터 트리 하나로 선언하고, 라우터와 메뉴, 현재 위치를 모두 이 트리에서 만듭니다. 사용법은{" "}
          <Link to="/docs/guide/routing" className="underline">
            Guide › Routing & Menu
          </Link>
          에 있습니다.
        </>
      }
    >
      <Block title="Install">
        <CodeBlock language="bash" title="sh">{`pnpm add @txstack/route-meta react-router-dom`}</CodeBlock>
        <RefTable head={["Entry", "Exports", "Peer", "Description"]} rows={TABLES.routeMeta.installEntry.rows} />
        <CodeBlock language="text" title="트리 하나에서 만들어지는 것">{`RouteTree
 ├─ buildRouteObjects / RouteRenderer → 라우터
 ├─ getNavigableRoutes                → 메뉴 (NavRoute[])
 └─ useCurrentRouteNode               → 현재 위치 · 경로 표시`}</CodeBlock>
      </Block>

      <Block title="RouteTree">
        <Signature>{`type RouteTree = Record<string, RouteNode>;
type RouteNode = PathRouteNode | IndexRouteNode;`}</Signature>
        <p className={muted}>
          키는 메뉴 항목의 <code>key</code>가 되고, 선언한 순서가 메뉴 순서가 됩니다. <code>satisfies RouteTree</code>로 검사하면 <code>routes.docs.children.start</code> 같은 자동 완성이 살아 있습니다.
        </p>

        <RefLabel>PathRouteNode — 주소가 있는 화면</RefLabel>
        <RefTable rows={TABLES.routeMeta.pathroutenode.rows} />

        <RefLabel>IndexRouteNode — 부모 주소의 첫 화면</RefLabel>
        <RefTable rows={TABLES.routeMeta.indexroutenode.rows} />

        <RefLabel>RouteMeta</RefLabel>
        <RefTable rows={TABLES.routeMeta.routemeta.rows} />

        <CodeBlock title="src/routes.tsx">{`export const routes = {
  home: { path: "/", element: <Home />, meta: { label: "홈" } },
  members: {
    path: "/members",
    element: <Outlet />,
    meta: { label: "회원" },
    children: {
      index: { index: true, element: <MemberList /> },
      detail: { path: "/members/:id", element: <MemberDetail />, meta: { label: "회원 상세", hidden: true } }
    }
  },
  settings: { path: "/settings", element: <Settings />, meta: { label: "설정", permissions: ["admin"] } }
} satisfies RouteTree;`}</CodeBlock>
      </Block>

      <Block title="buildRouteObjects">
        <Signature>{`function buildRouteObjects(tree: RouteTree): RouteObject[]`}</Signature>
        <p className={muted}>
          트리를 React Router의 <code>RouteObject[]</code>로 바꿉니다. <code>useRoutes</code>나 <code>createBrowserRouter</code>에 넘깁니다. 각 라우트의 <code>handle</code>에는 원래 노드(<code>{"{ node }"}</code>, <code>RouteHandle</code>)를 실어
          둡니다. 렌더링마다 다시 만들지 않도록 모듈 상수로 두세요.
        </p>
        <CodeBlock title="src/App.tsx">{`const ROUTE_OBJECTS = buildRouteObjects(routes);

export const App = () => useRoutes(ROUTE_OBJECTS);`}</CodeBlock>
      </Block>

      <Block title="RouteRenderer">
        <Signature>{`function RouteRenderer(props: { tree: RouteTree }): ReactElement | null`}</Signature>
        <p className={muted}>
          <code>useRoutes(buildRouteObjects(tree))</code>를 컴포넌트 하나로 감싼 것입니다. <code>tree</code>가 그대로면 다시 변환하지 않습니다.
        </p>
        <CodeBlock title="src/App.tsx">{`<BrowserRouter>
  <RouteRenderer tree={routes} />
</BrowserRouter>`}</CodeBlock>
      </Block>

      <Block title="getNavigableRoutes">
        <Signature>{`function getNavigableRoutes(tree: RouteTree, canAccess?: CanAccess): NavRoute[]

type CanAccess = (permissions: string[], node: RouteNode) => boolean;`}</Signature>
        <p className={muted}>메뉴에 보일 항목만 골라 같은 모양의 배열로 돌려줍니다. 선언 순서를 지킵니다.</p>

        <RefLabel>라우터와 메뉴의 필터 규칙</RefLabel>
        <RefTable head={["Node", "Router", "Menu", "Note"]} rows={TABLES.routeMeta.filterRules.rows} />
        <p className={muted}>
          <code>canAccess</code>는 <code>meta.permissions</code>가 있는 노드에서만 불립니다. 넘기지 않으면 권한이 걸린 노드는 모두 빠집니다. 권한 모델(단일 · 다중 · 계층)은 앱이 이 함수로 정합니다.
        </p>

        <RefLabel>NavRoute</RefLabel>
        <RefTable rows={TABLES.routeMeta.navroute.rows} />
        <CodeBlock title="example">{`const menu = getNavigableRoutes(routes, (permissions) =>
  permissions.some((p) => user.roles.includes(p))
);`}</CodeBlock>
        <TxAlert variant="warning" title="메뉴에서 빼는 것은 보안이 아닙니다">
          메뉴에 없어도 주소를 알면 화면은 열립니다. 실제 접근 제한은 화면이나 서버에서 따로 확인하세요.
        </TxAlert>
      </Block>

      <Block title="useCurrentRouteNode">
        <Signature>{`function useCurrentRouteNode(tree: RouteTree): CurrentRoute`}</Signature>
        <p className={muted}>
          지금 주소에 맞는 노드와, 맨 위에서 거기까지 이어지는 경로를 돌려줍니다. 트리와 주소가 그대로면 같은 객체를 돌려주므로 <code>useEffect</code> 의존성에 넣어도 됩니다. 라우터 안에서 써야 합니다.
        </p>
        <RefLabel>CurrentRoute</RefLabel>
        <RefTable rows={TABLES.routeMeta.currentroute.rows} />
      </Block>

      <Block title="Types">
        <RefTable head={["Type", "Shape", "", "Description"]} rows={TABLES.routeMeta.typeList.rows} />
      </Block>
    </Page>
  );
}
