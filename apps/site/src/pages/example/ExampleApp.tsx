import { Link } from "react-router-dom";
import { Block, Page } from "../../components/Page";
import { Used } from "../../components/Used";
import APP_SOURCE from "./app/App.tsx?raw";
import ROUTES_SOURCE from "./app/routes.tsx?raw";
import { Packages, SourceTabs, muted } from "./ExampleParts";

/** Dashboard · Accounts · Error Logs 를 앱 하나로 묶는 두 파일. 화면 코드가 아니라 앱의 뼈대다 */
export function ExampleApp() {
  return (
    <Page title="App" lead="Dashboard · Accounts · Error Logs 세 화면을 앱 하나로 묶는 두 파일입니다. 라우트 트리 하나에서 라우터 · 메뉴 · 화면 제목이 나오고, TxAppShell이 화면 틀을 잡습니다.">
      <Block title="Source">
        <p className={muted}>
          <code>routes.tsx</code>에 화면을 등록하면 <code>App.tsx</code>의 왼쪽 메뉴와 제목이 따라옵니다. 세 화면에 필요한 Provider(TanStack Query · ag-grid 테마)도 <code>App.tsx</code>에 있습니다. 나머지(<code>main.tsx</code> · 스타일시트)는{" "}
          <Link to="/docs/tutorial#run-it-as-an-app" className="underline">
            Tutorial › Run it as an app
          </Link>
          과 같습니다.
        </p>
        <SourceTabs
          files={[
            { name: "App.tsx", path: "src/App.tsx", source: APP_SOURCE },
            { name: "routes.tsx", path: "src/routes.tsx", source: ROUTES_SOURCE }
          ]}
        />
        <Used names={["TxAppShell", "TxSideNav", "TxButton"]} />
        <Packages
          items={[
            ["RouteTree", "/api/route-meta#routetree"],
            ["getNavigableRoutes", "/api/route-meta#getnavigableroutes"],
            ["useCurrentRouteNode", "/api/route-meta#usecurrentroutenode"],
            ["RouteRenderer", "/api/route-meta#routerenderer"]
          ]}
        />
      </Block>

      <Block title="How it's built">
        <ol className={`flex list-inside list-decimal flex-col gap-2 ${muted}`}>
          <li>
            <strong>트리 하나가 화면을 정한다.</strong> <code>RouteRenderer</code>가 트리를 라우터에 올리고, <code>getNavigableRoutes</code>가 메뉴를, <code>useCurrentRouteNode</code>가 지금 화면의 이름과 설명을 꺼냅니다. 화면을 더할 때 고칠 곳은
            트리 한 줄입니다.
          </li>
          <li>
            <strong>권한은 메뉴에서 거른다.</strong> 계정 화면의 <code>permissions: ["admin"]</code>를 <code>getNavigableRoutes</code>의 두 번째 인자가 판정합니다. 주소로 직접 들어오는 것까지 막으려면 서버가 거절해야 합니다.
          </li>
          <li>
            <strong>틀은 TxAppShell 하나.</strong> 머리 줄 · 왼쪽 메뉴 · 본문 자리를 잡고, 좁은 화면에서는 메뉴가 서랍으로 들어갑니다. 자세한 것은{" "}
            <Link to="/docs/guide/layout" className="underline">
              Layout
            </Link>
            에 있습니다.
          </li>
          <li>
            <strong>Provider 는 앱에서 한 번.</strong> <code>QueryClientProvider</code>와 ag-grid 모듈 등록 · 테마(<code>TxAgGridProvider</code>)를 여기서 하므로 화면 코드에는 없습니다.
          </li>
        </ol>
      </Block>
    </Page>
  );
}
