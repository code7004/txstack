import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { INSTALL_TITLE, PrePublishNote } from "../../components/PrePublish";
import { Block, Page } from "../../components/Page";
import { RefLabel, RefTable, Signature } from "../../components/Reference";
import { TABLES, tableAnchor } from "./data";

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
        <CodeBlock language="bash" title={INSTALL_TITLE}>{`pnpm add @txstack/route-meta react-router-dom`}</CodeBlock>
        <PrePublishNote />
        <RefTable head={["Entry", "Exports", "Peer", "Description"]} rows={TABLES.routeMeta.installEntry.rows} anchor={tableAnchor(TABLES.routeMeta.installEntry)} />
      </Block>

      <Block title="RouteTree">
        <Signature>{`type RouteTree = Record<string, RouteNode>;
type RouteNode = PathRouteNode | IndexRouteNode;`}</Signature>
        <p className={muted}>
          키는 메뉴 항목의 <code>key</code>가 되고, 선언한 순서가 메뉴 순서가 됩니다. <code>satisfies RouteTree</code>로 검사하면 <code>routes.docs.children.start</code> 같은 자동 완성이 살아 있습니다.
        </p>

        <RefLabel>PathRouteNode — 주소가 있는 화면</RefLabel>
        <RefTable rows={TABLES.routeMeta.pathroutenode.rows} anchor={tableAnchor(TABLES.routeMeta.pathroutenode)} />

        <RefLabel>IndexRouteNode — 부모 주소의 첫 화면</RefLabel>
        <RefTable rows={TABLES.routeMeta.indexroutenode.rows} anchor={tableAnchor(TABLES.routeMeta.indexroutenode)} />

        <RefLabel>RouteMeta</RefLabel>
        <RefTable rows={TABLES.routeMeta.routemeta.rows} anchor={tableAnchor(TABLES.routeMeta.routemeta)} />

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

      <Block title="RouteTreeRenderer">
        <Signature>{`function RouteTreeRenderer(props: { tree: RouteTree }): ReactElement | null`}</Signature>
        <p className={muted}>
          <code>useRoutes(buildRouteObjects(tree))</code>를 컴포넌트 하나로 감싼 것입니다. <code>tree</code>가 그대로면 다시 변환하지 않습니다.
        </p>
        <CodeBlock title="src/App.tsx">{`<BrowserRouter>
  <RouteTreeRenderer tree={routes} />
</BrowserRouter>`}</CodeBlock>
      </Block>

      <Block title="getNavRoutes">
        <Signature>{`function getNavRoutes(tree: RouteTree, canAccess?: CanAccess): NavRoute[]

type CanAccess = (permissions: string[], node: RouteNode) => boolean;`}</Signature>
        <p className={muted}>메뉴에 보일 항목만 골라 같은 모양의 배열로 돌려줍니다. 선언 순서를 지킵니다.</p>

        <RefLabel>Router vs. menu filtering</RefLabel>
        <RefTable head={["Node", "Router", "Menu", "Note"]} rows={TABLES.routeMeta.filterRules.rows} anchor={tableAnchor(TABLES.routeMeta.filterRules)} />
        <p className={muted}>
          <code>canAccess</code>는 <code>meta.permissions</code>가 있는 노드에서만 불립니다. 넘기지 않으면 권한이 걸린 노드는 모두 빠집니다. 권한 모델(단일 · 다중 · 계층)은 앱이 이 함수로 정합니다.
        </p>

        <RefLabel>NavRoute</RefLabel>
        <RefTable rows={TABLES.routeMeta.navroute.rows} anchor={tableAnchor(TABLES.routeMeta.navroute)} />
        <CodeBlock title="example">{`const menu = getNavRoutes(routes, (permissions) =>
  permissions.some((p) => user.roles.includes(p))
);`}</CodeBlock>
        <TxAlert variant="warning" title="메뉴에서 빼는 것은 보안이 아닙니다">
          메뉴에 없어도 주소를 알면 화면은 열립니다. 실제 접근 제한은 화면이나 서버에서 따로 확인하세요.
        </TxAlert>
      </Block>

      <Block title="useCurrentRoute">
        <Signature>{`function useCurrentRoute(tree: RouteTree): CurrentRoute`}</Signature>
        <p className={muted}>
          지금 주소에 맞는 노드와, 맨 위에서 거기까지 이어지는 경로를 돌려줍니다. 트리와 주소가 그대로면 같은 객체를 돌려주므로 <code>useEffect</code> 의존성에 넣어도 됩니다. 라우터 안에서 써야 합니다.
        </p>
        <RefLabel>CurrentRoute</RefLabel>
        <RefTable rows={TABLES.routeMeta.currentroute.rows} anchor={tableAnchor(TABLES.routeMeta.currentroute)} />
      </Block>

      <Block title="useBreadcrumbs">
        <Signature>{`function useBreadcrumbs(tree: RouteTree): Breadcrumb[]`}</Signature>
        <p className={muted}>
          지금 주소까지 온 길을 칸 목록으로 돌려줍니다. 그리지는 않습니다 — <code>TxBreadcrumb</code>의 <code>items</code>에 그대로 넘깁니다. 라우터 안에서 써야 합니다.
        </p>
        <CodeBlock language="tsx">{`<TxBreadcrumb items={useBreadcrumbs(routeTree)} itemAs={NavLink} />`}</CodeBlock>
        <ul className={`list-disc space-y-1 ps-5 ${muted}`}>
          <li>
            <code>meta.breadcrumb: false</code>인 노드는 빠지고 아래 칸은 남습니다. 레이아웃만 맡는 루트에 줍니다
          </li>
          <li>
            <code>meta.label</code>이 없는 노드는 빠집니다
          </li>
          <li>바로 앞 칸과 주소가 같으면(부모의 기본 화면) 앞 칸만 남습니다</li>
          <li>
            <code>hidden</code> · <code>permissions</code>는 보지 않습니다 — 메뉴에 없는 상세 화면도 경로에는 나옵니다
          </li>
        </ul>
        <RefLabel>Breadcrumb</RefLabel>
        <RefTable rows={TABLES.routeMeta.breadcrumb.rows} anchor={tableAnchor(TABLES.routeMeta.breadcrumb)} />
      </Block>

      <Block title="getBreadcrumbs">
        <Signature>{`function getBreadcrumbs(tree: RouteTree, pathname: string, basename?: string): Breadcrumb[]`}</Signature>
        <p className={muted}>
          <code>useBreadcrumbs</code>와 같은 규칙으로, 라우터 밖에서 주소 하나로 칸을 만듭니다. 주소를 상태로 들고 있는 미리보기, 렌더 전의 탭 제목, 서버, 테스트에서 씁니다. 쿼리와 조각은 보지 않고, 부를 때마다 새 배열을 돌려줍니다.
        </p>
        <CodeBlock language="ts">{`getBreadcrumbs(routes, "/user/dormant");                    // 유저관리 / 휴면유저
getBreadcrumbs(routes, window.location.pathname, "/admin");  // 라우터에 basename 을 줬다면 같은 값을`}</CodeBlock>
        <p className={muted}>
          라우터에 <code>basename</code>을 줬다면 같은 값을 넘깁니다. <code>window.location.pathname</code>에는 그것이 붙어 있어서, 그대로 넘기면 아무것도 맞지 않습니다. 칸의 <code>path</code>는 <code>basename</code>을 뗀 주소라 <code>NavLink</code>
          의 <code>to</code>에 그대로 넣습니다.
        </p>
      </Block>

      <Block title="Types">
        <RefTable head={["Type", "Shape", "", "Description"]} rows={TABLES.routeMeta.typeList.rows} anchor={tableAnchor(TABLES.routeMeta.typeList)} />
      </Block>
    </Page>
  );
}
