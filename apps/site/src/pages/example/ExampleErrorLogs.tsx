import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";
import { Used } from "../../components/Used";
import { DemoLoading, Packages, SourceTabs, muted } from "./ExampleParts";
import SCREEN_SOURCE from "./error-logs/ErrorLogsScreen.tsx?raw";
import DETAIL_SOURCE from "./error-logs/LogDetail.tsx?raw";
import API_SOURCE from "./error-logs/logApi.ts?raw";

/** ag-grid 는 무겁다. 이 예제를 열 때만 받는다 */
const ErrorLogsDemo = lazy(() => import("./error-logs/ErrorLogsDemo"));

export function ExampleErrorLogs() {
  return (
    <Page title="Error Logs" lead="서버 오류를 찾아보고, 상태를 바꾸고, 상세를 여는 운영 화면입니다. 검색 · 필터 · 기간이 모두 주소에 담겨서 다른 화면이나 메신저에서 링크 하나로 같은 목록을 열 수 있습니다.">
      <Block title="Try it">
        <p className={muted}>
          메서드 · 상태 · 기간으로 걸러 보세요. 조건은 <strong>이 페이지의 주소</strong>에 담깁니다. 줄을 누르면 스택 트레이스가 담긴 상세가 열리고, 상태 칸은 두 번 눌러 표 안에서 바로 바꿉니다. 삭제는 해결됐고 30일이 지난 로그만 됩니다. 스위치를
          켜면 10초마다 같은 조건으로 다시 불러옵니다.
        </p>
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
            <strong>표 안에서 바로 고치기.</strong> <code>editColumns</code>에 상태 열을 적고 ag-grid의 선택 편집기를 씁니다. 바뀐 값은 <code>onCellValueChanged</code>로 받아 서버에 저장하고, 실패하면 다시 불러와 표를 서버 값으로 되돌립니다.
          </li>
          <li>
            <strong>무거운 것은 열 때만.</strong> 목록에는 스택 트레이스가 없습니다. 줄을 누르면 <code>TxModal</code>을 열고 그때 상세를 따로 불러옵니다. 기다리는 동안은 <code>TxSkeleton</code>이 자리를 지킵니다.
          </li>
          <li>
            <strong>막을 때는 이유를 함께.</strong> 지울 수 없는 로그는 삭제 버튼을 막고 옆에 이유를 적습니다. 같은 규칙(<code>canRemove</code>)을 서버도 검사하므로 화면을 우회해도 409로 거절됩니다.
          </li>
          <li>
            <strong>자동 새로고침.</strong> <code>setInterval</code>로 다시 부르기만 합니다. 조건은 주소에 있으므로 새로 부를 때 따로 챙길 것이 없습니다.
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
        <p className={muted}>위 화면을 그리는 코드 전체입니다. 가짜 서버는 axios의 adapter 자리에 끼워 두었으므로, 그 부분을 지우면 진짜 서버로 요청합니다.</p>
        <SourceTabs
          files={[
            { name: "ErrorLogsScreen.tsx", path: "src/error-logs/ErrorLogsScreen.tsx", source: SCREEN_SOURCE },
            { name: "LogDetail.tsx", path: "src/error-logs/LogDetail.tsx", source: DETAIL_SOURCE },
            { name: "logApi.ts", path: "src/error-logs/logApi.ts", source: API_SOURCE }
          ]}
        />
      </Block>
    </Page>
  );
}
