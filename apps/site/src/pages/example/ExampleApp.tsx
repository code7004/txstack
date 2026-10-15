import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { Used } from "../../components/Used";
import APP_SOURCE from "./app/App.tsx?raw";
import { Packages, muted } from "./ExampleParts";

/** Dashboard · Accounts · Error Logs 를 앱 하나로 묶는 App.tsx. 화면 코드가 아니라 앱의 틀이다 */
export function ExampleApp() {
  return (
    <Page title="App" lead="세 화면을 앱 하나로 묶는 App.tsx입니다. 라우트 트리를 읽어 왼쪽 메뉴와 지금 위치를 그리고, TxAppShell이 화면 틀을, Provider가 세 화면의 공통 설정을 맡습니다.">
      <Block title="The menu in a few lines">
        <p className={muted}>
          메뉴는 트리를 <code>getNavigableRoutes</code>로 거른 결과를 그리기만 하면 됩니다. 자식도 같은 모양이라 함수 하나가 몇 단이든 그립니다. 메뉴 항목을 손으로 적지 않으므로, 화면을 더할 때는{" "}
          <Link to="/example/routes" className="underline">
            Routes
          </Link>
          의 트리에 한 줄만 더합니다.
        </p>
        <CodeBlock title="src/App.tsx — 메뉴 부분">{`const menuItem = (item: NavRoute): ReactNode =>
  item.children ? (
    <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} icon={item.meta?.icon} defaultOpen>
      {item.children.map(menuItem)}
    </TxSideNav.Item>
  ) : (
    <TxSideNav.Item key={item.key} label={item.meta?.label ?? item.key} icon={item.meta?.icon} as={NavLink} to={item.path} />
  );

// 권한 판정은 앱이 정합니다 — 라이브러리는 판정 함수만 받습니다
const menu = getNavigableRoutes(routes, (permissions) => permissions.includes(role));

<TxSideNav>{menu.map(menuItem)}</TxSideNav>`}</CodeBlock>
      </Block>

      <Block title="Where you are">
        <p className={muted}>
          <code>useCurrentRouteNode</code>가 주는 <code>matches</code>는 바깥 묶음부터 지금 화면까지의 사슬입니다. 그대로 경로 표시가 되고, 마지막 노드의 <code>meta</code>가 화면 제목과 탭 제목이 됩니다. 화면마다 제목을 따로 적지 않습니다.
        </p>
        <CodeBlock title="src/App.tsx — 지금 위치">{`const { meta, matches } = useCurrentRouteNode(routes);
const trail = matches.filter((node) => node.meta?.label);   // 운영 › 대시보드

<TxBreadcrumb>
  {trail.map((node, index) => /* 마지막이 아니면 링크 */)}
</TxBreadcrumb>
<h1>{meta?.label}</h1>`}</CodeBlock>
      </Block>

      <Block title="Same tree, top bar">
        <p className={muted}>왼쪽 메뉴 대신 위쪽 가로 메뉴로 그려도 트리는 그대로입니다. 묶음은 줄의 항목이 되고, 마우스를 올리면 하위 메뉴가 열립니다.</p>
        <CodeBlock title="src/Header.tsx">{`<TxNavBar>
  {menu.map((group) => (
    <TxNavBar.Item
      key={group.key}
      label={group.meta?.label ?? group.key}
      panel={group.children?.map((item) => (
        <NavLink key={item.key} to={item.path}>{item.meta?.label}</NavLink>
      ))}
    />
  ))}
</TxNavBar>`}</CodeBlock>
      </Block>

      <Block title="Source">
        <p className={muted}>
          <code>App.tsx</code> 전체입니다. 머리 줄의 버튼으로 역할을 바꾸면 메뉴가 다시 걸러집니다. 나머지(<code>main.tsx</code> · 스타일시트)는{" "}
          <Link to="/docs/tutorial#run-it-as-an-app" className="underline">
            Tutorial › Run it as an app
          </Link>
          과 같습니다.
        </p>
        <CodeBlock title="src/App.tsx" maxHeight="40rem">
          {APP_SOURCE}
        </CodeBlock>
        <Used names={["TxAppShell", "TxSideNav", "TxBreadcrumb", "TxNavBar", "TxButton"]} />
        <Packages
          items={[
            ["getNavigableRoutes", "/api/route-meta#getnavigableroutes"],
            ["useCurrentRouteNode", "/api/route-meta#usecurrentroutenode"],
            ["RouteRenderer", "/api/route-meta#routerenderer"],
            ["NavRoute", "/api/route-meta#navroute"]
          ]}
        />
      </Block>
    </Page>
  );
}
