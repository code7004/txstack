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
          메뉴는 트리를 <code>getNavRoutes</code>로 거른 결과를 그리기만 하면 됩니다. 자식도 같은 모양이라 함수 하나가 몇 단이든 그립니다. 메뉴 항목을 손으로 적지 않으므로, 화면을 더할 때는{" "}
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
const menu = getNavRoutes(routes, (permissions) => permissions.includes(role));

<TxSideNav>{menu.map(menuItem)}</TxSideNav>`}</CodeBlock>
      </Block>

      <Block title="Where you are">
        <p className={muted}>
          <code>useBreadcrumbs</code>가 지금 주소까지 온 길을 칸 목록으로 주고, <code>TxBreadcrumb</code>이 그대로 받습니다. <code>useCurrentRoute</code>의 <code>meta</code>는 화면 제목과 탭 제목이 됩니다. 화면마다 제목도 경로도 따로 적지 않습니다.
        </p>
        <CodeBlock title="src/App.tsx — 지금 위치">{`const { meta } = useCurrentRoute(routes);
const crumbs = useBreadcrumbs(routes);   // 운영 / 대시보드

<TxBreadcrumb items={crumbs} itemAs={NavLink} />
<h1>{meta?.label}</h1>`}</CodeBlock>
      </Block>

      <Block title="Same tree, top bar">
        <p className={muted}>왼쪽 메뉴 대신 위쪽 가로 메뉴로 그려도 트리는 그대로입니다. 묶음은 줄의 항목이 되고, 마우스를 올리면 하위 메뉴가 열립니다.</p>
        <CodeBlock title="src/Header.tsx">{`<TxNavBar>
  {menu.map((group) => (
    <TxNavBar.Item key={group.key} label={group.meta?.label ?? group.key}>
      {group.children?.map((item) => (
        <NavLink key={item.key} to={item.path}>{item.meta?.label}</NavLink>
      ))}
    </TxNavBar.Item>
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
            ["getNavRoutes", "/api/route-meta#getnavroutes"],
            ["useCurrentRoute", "/api/route-meta#usecurrentroute"],
            ["RouteTreeRenderer", "/api/route-meta#routetreerenderer"],
            ["NavRoute", "/api/route-meta#navroute"]
          ]}
        />
      </Block>
    </Page>
  );
}
