import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";
import { Used } from "../../components/Used";
import { DemoLoading, Packages, QuickGuide, SourceTabs, WholeAppNote, muted } from "./ExampleParts";
import SCREEN_SOURCE from "@demo/features/error-logs/ErrorLogsScreen.tsx?raw";
import DETAIL_SOURCE from "@demo/features/error-logs/LogDetail.tsx?raw";
import API_SOURCE from "@demo/features/error-logs/logApi.ts?raw";
import MOCK_SOURCE from "@demo/mock/logs.ts?raw";

/** ag-grid 는 무겁다. 이 예제를 열 때만 받는다 */
const ErrorLogsDemo = lazy(() => import("./ErrorLogsDemo"));

export function ExampleErrorLogs() {
  return (
    <Page title="Error Logs" lead="서버 오류를 찾아보고, 상태를 바꾸고, 상세를 여는 운영 화면입니다. 조건이 모두 주소에 담겨 링크 하나로 같은 목록을 열 수 있습니다.">
      <Block title="Try it">
        <QuickGuide
          more={
            <>
              <p>
                메서드 · 상태 · 기간으로 걸러 보세요. 조건은 <strong>이 페이지의 주소</strong>에 담깁니다.
              </p>
              <p>줄을 누르면 스택 트레이스가 담긴 상세가 열립니다. 상태 칸은 두 번 눌러 표 안에서 바로 바꿉니다.</p>
              <p>삭제는 해결됐고 30일이 지난 로그만 됩니다. 스위치를 켜면 10초마다 같은 조건으로 다시 불러옵니다.</p>
            </>
          }
        >
          줄을 눌러 상세를 열고, 상태 칸을 두 번 눌러 바꿔 보세요.
        </QuickGuide>
        <Demo>
          <Suspense fallback={<DemoLoading />}>
            <ErrorLogsDemo />
          </Suspense>
        </Demo>
        <Used names={["TxAgGrid", "TxDayPickerRange", "TxModal", "TxDropdown", "TxSearchInput", "TxSwitch", "TxTag", "TxCopyButton", "TxSkeleton", "TxDialog", "TxToast"]} />
        <Packages
          items={[
            ["useUrlQuery", "/api/hooks#useurlquery"],
            ["createHttpClient", "/api/axios#createhttpclient"],
            ["parseApiError", "/api/axios#parseapierror"]
          ]}
        />
      </Block>

      <Block title="How it's built">
        <ol className={`flex list-inside list-decimal flex-col gap-2 ${muted}`}>
          <li>
            <strong>링크 하나로 같은 목록.</strong> 기간까지 <code>useUrlQuery</code>로 주소에 담습니다. 주소에는 <code>2026-10-14</code>처럼 날짜 글자로 적고, 달력(<code>TxDayPickerRange</code>)에는 <code>Date</code>로 바꿔 줍니다.{" "}
            <Link to="/example/dashboard" className="underline">
              Dashboard
            </Link>
            의 카드는 이 주소에 조건을 붙여 이리로 보냅니다.
          </li>
          <li>
            <strong>표 안에서 바로 고치기.</strong> <code>editColumns</code>에 상태 열을 적고 ag-grid의 선택 편집기를 씁니다. 바뀐 값은 <code>onCellValueChanged</code>로 받아 <code>useMutation</code>으로 저장합니다. 성공하든 실패하든{" "}
            <code>onSettled</code>에서 <code>["logs"]</code>를 무효화해 표를 서버 값으로 맞춥니다.
          </li>
          <li>
            <strong>무거운 것은 열 때만.</strong> 목록에는 스택 트레이스가 없습니다. 줄을 누르면 <code>TxModal</code>을 열고 그때 상세를 따로 불러옵니다(<code>enabled</code>). 한 번 연 로그는 캐시에 남아 다시 열면 바로 뜹니다. 기다리는 동안은{" "}
            <code>TxSkeleton</code>이 자리를 지킵니다.
          </li>
          <li>
            <strong>막을 때는 이유를 함께.</strong> 지울 수 없는 로그는 삭제 버튼을 막고 옆에 이유를 적습니다. 같은 규칙(<code>canRemove</code>)을 서버도 검사하므로 화면을 우회해도 409로 거절됩니다.
          </li>
          <li>
            <strong>자동 새로고침.</strong> <code>refetchInterval: live ? 10_000 : false</code> 한 줄입니다. 조건은 쿼리 키(주소)에 있으므로 새로 부를 때 따로 챙길 것이 없습니다.
          </li>
        </ol>
      </Block>

      <Block title="Date picker is a separate entry">
        <p className={muted}>
          달력은 <code>react-day-picker</code>를 쓰므로 별도 진입점에 있습니다. 쓸 때만 함께 설치합니다. 스타일은 <code>@txstack/ui/styles.css</code>에 이미 들어 있습니다.
        </p>
        <CodeBlock language="bash" title="sh">{`pnpm add react-day-picker`}</CodeBlock>
        <CodeBlock title="src/ErrorLogsScreen.tsx">{`import { TxDayPickerRange } from "@txstack/ui/daypicker";`}</CodeBlock>
      </Block>

      <Block title="Source">
        <p className={muted}>위 화면을 그리는 코드 전체입니다. 화면에서 돌아가는 파일을 그대로 보여 줍니다.</p>
        <WholeAppNote />
        <SourceTabs
          files={[
            { name: "ErrorLogsScreen.tsx", path: "apps/demo/src/features/error-logs/ErrorLogsScreen.tsx", source: SCREEN_SOURCE },
            { name: "LogDetail.tsx", path: "apps/demo/src/features/error-logs/LogDetail.tsx", source: DETAIL_SOURCE },
            { name: "logApi.ts", path: "apps/demo/src/features/error-logs/logApi.ts", source: API_SOURCE },
            { name: "mock/logs.ts", path: "apps/demo/src/mock/logs.ts", source: MOCK_SOURCE }
          ]}
        />
      </Block>
    </Page>
  );
}
