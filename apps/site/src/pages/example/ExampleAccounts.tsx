import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";
import { Used } from "../../components/Used";
import { DemoLoading, Packages, QuickGuide, SourceTabs, WholeAppNote, muted } from "./ExampleParts";
import FORM_SOURCE from "@demo/features/accounts/AccountForm.tsx?raw";
import API_SOURCE from "@demo/features/accounts/accountApi.ts?raw";
import SCREEN_SOURCE from "@demo/features/accounts/AccountsScreen.tsx?raw";
import MOCK_SOURCE from "@demo/mock/accounts.ts?raw";

/** ag-grid 는 무겁다. 이 예제를 열 때만 받는다 */
const AccountsDemo = lazy(() => import("./AccountsDemo"));

export function ExampleAccounts() {
  return (
    <Page title="Accounts" lead="계정을 찾고, 만들고, 고치고, 여러 개를 한꺼번에 지우는 관리 화면입니다.">
      <Block title="Try it">
        <QuickGuide
          more={
            <>
              <p>
                역할이나 상태로 거르고, 아이디 · 이름 머리를 눌러 정렬해 보세요. 조건은 <strong>이 페이지의 주소</strong>에 담깁니다.
              </p>
              <p>줄 끝의 수정을 누르면 옆 패널에서 고칩니다. 줄 앞의 칸을 골라 한꺼번에 지울 수 있습니다.</p>
              <p>첫 줄의 소유자 계정을 함께 지우려 하면 서버가 거절(403)하고, 이미 있는 아이디로 새 계정을 만들면 서버의 오류(409)가 폼 위에 뜹니다.</p>
            </>
          }
        >
          필터 · 정렬 · 수정 · 선택 삭제를 직접 해 보세요.
        </QuickGuide>
        <Demo>
          <Suspense fallback={<DemoLoading />}>
            <AccountsDemo />
          </Suspense>
        </Demo>
        <Used names={["TxAgGrid", "TxSlidePanel", "TxForm", "TxDropdown", "TxSearchInput", "TxTag", "TxButton", "TxDialog", "TxToast", "TxAlert"]} />
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
            <strong>조건은 주소에, 요청은 TanStack Query에.</strong> 검색어 · 역할 · 상태 · 정렬 · 페이지를 <code>useUrlQuery</code> 하나로 다루고, 그 값을 그대로 <code>useQuery</code>의 쿼리 키로 씁니다. 주소가 바뀌면 다시 부르고, 받는 동안에는{" "}
            <code>keepPreviousData</code>로 이전 페이지를 그대로 보여 줍니다.
          </li>
          <li>
            <strong>정렬은 서버가.</strong> 페이지로 나눠 받으므로 <code>serverSortColumns</code>로 정렬 화살표만 표가 그리고, 바뀐 정렬로 다시 조회합니다.
          </li>
          <li>
            <strong>골라서 한꺼번에.</strong> <code>rowSelection</code>으로 줄을 고르고 <code>onSelectionChanged</code>로 받습니다. 지우기 전에 <code>TxDialog.confirm</code>으로 묻고, 지운 뒤에는 <code>invalidateQueries</code>로 목록을 다시 부릅니다.
          </li>
          <li>
            <strong>목록을 둔 채 옆에서 편집.</strong> 새 계정 버튼과 줄 끝의 수정 버튼은 같은 폼을 <code>TxSlidePanel</code>에 엽니다. 비밀번호 칸은 새로 만들 때만 보이고, 열 때마다 <code>key</code>를 바꿔 이전 입력이 남지 않게 합니다.
          </li>
          <li>
            <strong>서버의 거절은 알맞은 자리에.</strong> <code>parseApiError</code>가 오류를 한 형태로 바꿔 줍니다. 아이디 중복(409)은 <code>useMutation</code>의 <code>error</code>로 폼 위에, 소유자 삭제 거절(403)은 <code>onError</code>에서 알림으로
            보여 줍니다.
          </li>
        </ol>
      </Block>

      <Block title="Show it to admins only">
        <p className={muted}>
          이런 화면은 보통 관리자만 봅니다. 라우트에 권한을 적어 두면 <code>getNavigableRoutes</code>가 권한이 없는 사람의 메뉴에서 이 항목을 뺍니다. 자세한 방법은{" "}
          <Link to="/docs/guide/routing#5-filter-the-menu-by-permission" className="underline">
            Routing & Menu
          </Link>
          에 있습니다.
        </p>
        <CodeBlock title="src/routes.tsx">{`settings: {
  path: "/settings",
  meta: { label: "설정" },
  children: {
    accounts: { path: "/settings/accounts", element: <AccountsScreen />, meta: { label: "계정", permissions: ["admin"] } }
  }
}`}</CodeBlock>
      </Block>

      <Block title="Source">
        <p className={muted}>위 화면을 그리는 코드 전체입니다. 화면에서 돌아가는 파일을 그대로 보여 줍니다.</p>
        <WholeAppNote />
        <SourceTabs
          files={[
            { name: "AccountsScreen.tsx", path: "apps/demo/src/features/accounts/AccountsScreen.tsx", source: SCREEN_SOURCE },
            { name: "AccountForm.tsx", path: "apps/demo/src/features/accounts/AccountForm.tsx", source: FORM_SOURCE },
            { name: "accountApi.ts", path: "apps/demo/src/features/accounts/accountApi.ts", source: API_SOURCE },
            { name: "mock/accounts.ts", path: "apps/demo/src/mock/accounts.ts", source: MOCK_SOURCE }
          ]}
        />
      </Block>
    </Page>
  );
}
