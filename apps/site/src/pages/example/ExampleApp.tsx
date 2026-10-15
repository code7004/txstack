import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { Used } from "../../components/Used";
import APP_SOURCE from "./app/App.tsx?raw";
import { Packages, muted } from "./ExampleParts";

/** Dashboard · Accounts · Error Logs 를 앱 하나로 묶는 App.tsx. 화면 코드가 아니라 앱의 틀이다 */
export function ExampleApp() {
  return (
    <Page title="App" lead="Dashboard · Accounts · Error Logs 세 화면을 앱 하나로 묶는 App.tsx입니다. TxAppShell이 머리 줄 · 왼쪽 메뉴 · 본문 자리를 잡고, 세 화면에 필요한 Provider를 한 번 감쌉니다.">
      <Block title="Source">
        <p className={muted}>
          메뉴와 화면은{" "}
          <Link to="/example/routes" className="underline">
            Routes
          </Link>
          의 라우트 트리에서 나옵니다. 나머지(<code>main.tsx</code> · 스타일시트)는{" "}
          <Link to="/docs/tutorial#run-it-as-an-app" className="underline">
            Tutorial › Run it as an app
          </Link>
          과 같습니다.
        </p>
        <CodeBlock title="src/App.tsx" maxHeight="40rem">
          {APP_SOURCE}
        </CodeBlock>
        <Used names={["TxAppShell", "TxSideNav", "TxButton"]} />
        <Packages
          items={[
            ["getNavigableRoutes", "/api/route-meta#getnavigableroutes"],
            ["useCurrentRouteNode", "/api/route-meta#usecurrentroutenode"],
            ["RouteRenderer", "/api/route-meta#routerenderer"]
          ]}
        />
      </Block>

      <Block title="How it's built">
        <ol className={`flex list-inside list-decimal flex-col gap-2 ${muted}`}>
          <li>
            <strong>틀은 TxAppShell 하나.</strong> 머리 줄 · 왼쪽 메뉴 · 본문 자리를 잡고, 좁은 화면에서는 메뉴가 서랍으로 들어갑니다. 자세한 것은{" "}
            <Link to="/docs/guide/layout" className="underline">
              Layout
            </Link>
            에 있습니다.
          </li>
          <li>
            <strong>메뉴와 제목은 트리에서.</strong> <code>getNavigableRoutes</code>가 메뉴를, <code>useCurrentRouteNode</code>가 지금 화면의 이름과 설명을 꺼내고, <code>RouteRenderer</code>가 화면을 그립니다. 화면을 더해도 이 파일은 고치지 않습니다.
          </li>
          <li>
            <strong>권한은 메뉴에서 거른다.</strong> <code>getNavigableRoutes</code>의 두 번째 인자가 각 화면의 <code>permissions</code>를 판정합니다. 주소로 직접 들어오는 것까지 막으려면 서버가 거절해야 합니다.
          </li>
          <li>
            <strong>Provider 는 앱에서 한 번.</strong> <code>QueryClientProvider</code>와 ag-grid 모듈 등록 · 테마(<code>TxAgGridProvider</code>)를 여기서 하므로 화면 코드에는 없습니다.
          </li>
        </ol>
      </Block>
    </Page>
  );
}
