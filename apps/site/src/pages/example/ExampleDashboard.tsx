import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";
import { Used } from "../../components/Used";
import { DashboardScreen } from "@demo/features/dashboard/DashboardScreen";
import SCREEN_SOURCE from "@demo/features/dashboard/DashboardScreen.tsx?raw";
import { Packages, QuickGuide, SourceTabs, WholeAppNote, muted } from "./ExampleParts";

export function ExampleDashboard() {
  return (
    <Page title="Dashboard" lead="운영 상황을 한눈에 보는 첫 화면입니다. 숫자를 누르면 그 조건이 걸린 목록으로 이어집니다.">
      <Block title="Try it">
        <QuickGuide
          more={
            <>
              <p>
                카드나 막대, 경로를 누르면{" "}
                <Link to="/example/error-logs" className="underline">
                  Error Logs
                </Link>
                가 그 조건으로 걸러진 채 열립니다.
              </p>
              <p>두 예제는 같은 가짜 서버와 같은 쿼리 캐시를 쓰므로, 거기서 상태를 바꾸고 돌아오면 숫자가 이미 바뀌어 있습니다.</p>
            </>
          }
        >
          카드를 눌러 걸러진 오류 로그로 가 보세요.
        </QuickGuide>
        <Demo>
          <DashboardScreen />
        </Demo>
        <Used names={["TxCard", "TxProgress", "TxTag", "TxEmptyState", "TxSkeleton", "TxButton", "TxAlert"]} />
        <Packages
          items={[
            ["createHttpClient", "/api/axios#createhttpclient"],
            ["parseApiError", "/api/axios#parseapierror"]
          ]}
        />
      </Block>

      <Block title="How it's built">
        <ol className={`flex list-inside list-decimal flex-col gap-2 ${muted}`}>
          <li>
            <strong>옆 화면으로 가는 상대 링크.</strong> <code>../error-logs</code>에 <code>relative="path"</code>를 줍니다. 데모 앱에서는 <code>/dashboard</code> → <code>/error-logs</code>로, 이 사이트에서는 <code>/example/dashboard</code> →{" "}
            <code>/example/error-logs</code>로 갑니다. 같은 코드가 어디에 붙어도 동작합니다.
          </li>
          <li>
            <strong>조건은 쿼리 문자열로.</strong> <code>?status=open</code>처럼 붙여 보내면, 받는 화면이 <code>useUrlQuery</code>로 주소를 읽기 때문에 따로 넘길 것이 없습니다.
          </li>
          <li>
            <strong>캐시를 함께 쓴다.</strong> 요약은 <code>["logs", "summary"]</code> 키로 부릅니다. Error Logs가 상태를 바꾸고 <code>["logs"]</code>를 무효화하면 이 요약도 낡은 것으로 표시되어, 이 화면에 돌아올 때 다시 불립니다.
          </li>
          <li>
            <strong>그리는 것은 모두 컴포넌트와 Tailwind.</strong> 숫자 카드는 <code>TxCard</code>, 비율은 <code>TxProgress</code>, 막대는 높이만 계산한 <code>div</code>입니다. 차트 라이브러리는 쓰지 않았습니다.
          </li>
          <li>
            <strong>새로고침은 버튼 하나로.</strong> <code>refetch()</code>를 기다리는 함수를 <code>onClick</code>에 주면 <code>TxButton</code>이 끝날 때까지 잠깁니다. 연타해도 요청은 한 번입니다.
          </li>
        </ol>
      </Block>

      <Block title="Relative links">
        <CodeBlock title="apps/demo/src/features/dashboard/DashboardScreen.tsx">{`const logsUrl = (query: Record<string, string>) => \`../error-logs?\${new URLSearchParams(query)}\`;

<Link to={logsUrl({ status: "open" })} relative="path">열린 오류</Link>`}</CodeBlock>
        <p className={muted}>
          화면이 어느 주소에 놓일지는 앱의 라우트 트리가 정합니다. 데모 앱의 트리(<code>routes.tsx</code>)는{" "}
          <Link to="/example#run-the-whole-app" className="underline">
            Run the whole app
          </Link>
          에, 트리를 만드는 방법은{" "}
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
        <WholeAppNote />
        <SourceTabs files={[{ name: "DashboardScreen.tsx", path: "apps/demo/src/features/dashboard/DashboardScreen.tsx", source: SCREEN_SOURCE }]} />
      </Block>
    </Page>
  );
}
