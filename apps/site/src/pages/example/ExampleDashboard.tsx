import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";
import { Used } from "../../components/Used";
import { DashboardScreen } from "./dashboard/DashboardScreen";
import SCREEN_SOURCE from "./dashboard/DashboardScreen.tsx?raw";
import { Packages, SourceTabs, muted } from "./ExampleParts";

export function ExampleDashboard() {
  return (
    <Page title="Dashboard" lead="운영 상황을 한눈에 보는 첫 화면입니다. 숫자만 보여 주지 않고, 누르면 그 조건이 걸린 목록으로 바로 이어집니다.">
      <Block title="Try it">
        <p className={muted}>
          카드나 막대, 경로를 눌러 보세요.{" "}
          <Link to="/example/error-logs" className="underline">
            Error Logs
          </Link>
          가 그 조건으로 걸러진 채 열립니다. 두 예제는 같은 가짜 서버와 같은 쿼리 캐시를 쓰므로, 거기서 상태를 바꾸고 돌아오면 숫자가 이미 바뀌어 있습니다.
        </p>
        <Demo>
          <DashboardScreen />
        </Demo>
        <Used names={["TxCard", "TxProgress", "TxTag", "TxEmptyState", "TxSkeleton", "TxButton", "TxToast"]} />
        <Packages
          items={[
            ["RouteTree", "/api/route-meta#routetree"],
            ["createHttpClient", "/api/axios#createhttpclient"],
            ["parseApiError", "/api/axios#parseapierror"]
          ]}
        />
      </Block>

      <Block title="How it's built">
        <ol className={`flex list-inside list-decimal flex-col gap-2 ${muted}`}>
          <li>
            <strong>링크의 경로는 라우트 트리에서.</strong> <code>routes.example.children.errorLogs.path</code>처럼 트리의 값을 씁니다. 주소를 바꿔도 트리 한 곳만 고치면 링크가 따라옵니다. 타입이 있으므로 없는 경로를 쓰면 컴파일이 멈춥니다.
          </li>
          <li>
            <strong>조건은 쿼리 문자열로.</strong> <code>?status=open</code>처럼 붙여 보내면, 받는 화면이 <code>useUrlQuery</code>로 주소를 읽기 때문에 따로 넘길 것이 없습니다.
          </li>
          <li>
            <strong>캐시를 함께 쓴다.</strong> 요약은 <code>["logs", "summary"]</code> 키로 부릅니다. Error Logs가 상태를 바꾸고 <code>["logs"]</code>를 무효화하면 이 요약도 낡은 것으로 표시되어, 이 화면에 돌아올 때 다시 불립니다.
          </li>
          <li>
            <strong>그리는 것은 모두 컴포넌트와 Tailwind.</strong> 숫자 카드는 <code>TxCard</code>, 비율은 <code>TxProgress</code>, 막대는 높이만 계산한 <code>div</code>입니다. 차트 라이브러리 없이도 이 정도는 그립니다.
          </li>
          <li>
            <strong>새로고침은 버튼 하나로.</strong> <code>refetch()</code>를 기다리는 함수를 <code>onClick</code>에 주면 <code>TxButton</code>이 끝날 때까지 잠깁니다. 연타해도 요청은 한 번입니다.
          </li>
        </ol>
      </Block>

      <Block title="Links from the route tree">
        <CodeBlock title="src/DashboardScreen.tsx">{`import { routes } from "./routes";

const logsUrl = (query: Record<string, string>) =>
  \`\${routes.example.children.errorLogs.path}?\${new URLSearchParams(query)}\`;

<Link to={logsUrl({ status: "open" })}>열린 오류</Link>   // → /example/error-logs?status=open`}</CodeBlock>
        <p className={muted}>
          라우트 트리를 <code>satisfies RouteTree</code>로 선언하면 이렇게 경로를 값으로 꺼내 쓸 수 있습니다. 트리를 만드는 방법은{" "}
          <Link to="/docs/guide/routing" className="underline">
            Routing & Menu
          </Link>
          에 있습니다.
        </p>
      </Block>

      <Block title="Source">
        <p className={muted}>
          화면 코드 전체입니다. 요청은{" "}
          <Link to="/example/error-logs#source" className="underline">
            Error Logs의 logApi.ts
          </Link>
          를 함께 씁니다.
        </p>
        <SourceTabs files={[{ name: "DashboardScreen.tsx", path: "src/dashboard/DashboardScreen.tsx", source: SCREEN_SOURCE }]} />
      </Block>
    </Page>
  );
}
