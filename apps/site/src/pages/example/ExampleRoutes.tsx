import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import ROUTES_SOURCE from "./app/routes.tsx?raw";
import { Packages, muted } from "./ExampleParts";

/** 세 화면을 등록하는 라우트 트리. 라우터 · 메뉴 · 화면 제목이 모두 여기서 나온다 */
export function ExampleRoutes() {
  return (
    <Page title="Routes" lead="Dashboard · Accounts · Error Logs 세 화면을 등록하는 routes.tsx입니다. 이 트리 하나에서 라우터 · 왼쪽 메뉴 · 화면 제목이 모두 나옵니다.">
      <Block title="Source">
        <p className={muted}>
          트리를 쓰는 쪽은{" "}
          <Link to="/example/app" className="underline">
            App
          </Link>
          의 <code>App.tsx</code>입니다.
        </p>
        <CodeBlock title="src/routes.tsx" maxHeight="40rem">
          {ROUTES_SOURCE}
        </CodeBlock>
        <Packages
          items={[
            ["RouteTree", "/api/route-meta#routetree"],
            ["RouteMeta", "/api/route-meta#routemeta"]
          ]}
        />
      </Block>

      <Block title="What the meta does">
        <ol className={`flex list-inside list-decimal flex-col gap-2 ${muted}`}>
          <li>
            <strong>
              <code>label</code> · <code>description</code>
            </strong>{" "}
            — 왼쪽 메뉴의 이름이 되고, App이 화면 위에 제목과 설명으로 보여 줍니다.
          </li>
          <li>
            <strong>
              <code>permissions</code>
            </strong>{" "}
            — 계정 화면은 <code>["admin"]</code>입니다. App의 <code>getNavigableRoutes</code>가 지금 사용자의 역할로 판정해 메뉴에서 거릅니다.
          </li>
          <li>
            <strong>
              <code>index: true</code>
            </strong>{" "}
            — 경로가 없어 메뉴에 오르지 않습니다. 첫 주소(<code>/</code>)로 들어오면 대시보드로 보냅니다.
          </li>
        </ol>
        <p className={muted}>
          <code>icon</code> · <code>hidden</code> 같은 나머지 값과 트리를 라우터에 붙이는 방법은{" "}
          <Link to="/docs/guide/routing" className="underline">
            Routing & Menu
          </Link>
          에 있습니다.
        </p>
      </Block>
    </Page>
  );
}
