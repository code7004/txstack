import { TxAlert, TxSpinner } from "@txstack/ui";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";

const muted = "text-slate-600 dark:text-slate-300";

/** ag-grid 는 무겁다. 이 장을 열 때만 받는다 */
const MemberGrid = lazy(() => import("./tables/MemberGrid"));

export function GuideTables() {
  return (
    <Page title="Tables & Lists" lead="목록을 보여 주는 방법을 고르고, 큰 표는 TxAgGrid로 만듭니다. 정렬 · 페이지 · 편집을 서버와 주소에 맞물리는 방법까지 다룹니다.">
      <Block title="Pick the right list">
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
          <table className="site-stack-table w-full text-sm">
            <tbody className={muted}>
              {[
                ["직접 그린 표 · 카드 목록 + TxPagination", "한 페이지에 수십 줄, 정렬이나 편집이 필요 없을 때. 추가 설치가 없습니다", "Tutorial의 회원 목록"],
                ["TxAgGrid", "열 정렬 · 크기 조절 · 셀 편집 · 행 선택이 필요하거나 줄이 많을 때. ag-grid를 함께 설치합니다", "관리자 화면의 데이터 표"],
                ["TxEmptyState", "결과가 없을 때 빈 표 대신 보여 주는 안내", "검색 결과 없음, 첫 항목 만들기"]
              ].map(([name, when, example]) => (
                <tr key={name} className="border-t align-top first:border-t-0" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-[color:var(--tx-color-text)]">{name}</td>
                  <td className="px-3 py-2">{when}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={muted}>
          <code>TxPagination</code>은 표와 상관없이 쓸 수 있어서 기본 진입점에 있습니다. 직접 그린 목록은{" "}
          <Link to="/docs/tutorial" className="underline">
            Tutorial
          </Link>
          에서 처음부터 끝까지 만들어 봅니다. 이 장은 <code>TxAgGrid</code>를 다룹니다.
        </p>
      </Block>

      <Block title="Try it">
        <p className={muted}>
          120명을 10명씩 보여 주는 표입니다. 이름 · 팀 · 가입일 머리를 눌러 정렬하고, 아래에서 페이지를 넘기고, 역할 칸을 두 번 눌러 고쳐 보세요. 정렬과 페이지는 <strong>이 페이지의 주소</strong>에 담깁니다.
        </p>
        <Demo>
          <Suspense
            fallback={
              <span className={`inline-flex items-center gap-2 text-sm ${muted}`}>
                <TxSpinner decorative /> 표를 불러오는 중…
              </span>
            }
          >
            <MemberGrid />
          </Suspense>
        </Demo>
      </Block>

      <Block title="1. Install and register">
        <p className={muted}>
          <code>TxAgGrid</code>는 무거워서 별도 진입점(<code>@txstack/ui/aggrid</code>)에 있습니다. 쓸 때만 ag-grid를 함께 설치하고, 앱 진입점에서 ag-grid 모듈을 한 번 등록합니다. 어떤 모듈을 쓸지는 앱이 고릅니다.
        </p>
        <CodeBlock language="bash" title="sh">{`pnpm add ag-grid-community ag-grid-react`}</CodeBlock>
        <CodeBlock title="src/main.tsx">{`import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);`}</CodeBlock>
        <TxAlert variant="warning" title="표가 보이지 않는다면">
          표는 감싸는 자리의 높이를 채웁니다. 감싸는 요소에 높이가 없으면 0px로 접혀 보이지 않습니다. <code>{`<div className="flex h-[30rem] flex-col">`}</code>처럼 높이를 주세요. 빈 표에 오류만 난다면 모듈 등록을 빠뜨린 경우입니다.
        </TxAlert>
      </Block>

      <Block title="2. Columns">
        <p className={muted}>
          보여 줄 필드 이름만 나열하면 열이 만들어집니다. 안 주면 첫 행의 키로 만듭니다. 폭 · 포맷 · 렌더러는 <code>customColumnDefs</code>에서 필드 이름으로 찾아 덮어씁니다.
        </p>
        <CodeBlock title="src/MemberGrid.tsx">{`import { TxAgGrid } from "@txstack/ui/aggrid";

<div className="flex h-[30rem] flex-col">
  <TxAgGrid<Member>
    rowData={rows}
    defaultColDef={{ flex: 1 }}
    option={{
      headers: ["id", "name", "role", "team", "joinedAt"],
      customColumnDefs: [{ field: "id", maxWidth: 120 }]
    }}
  />
</div>`}</CodeBlock>
        <p className={muted}>
          <code>{"<TxAgGrid<Member>"}</code>는 제네릭 컴포넌트에 행의 타입을 직접 넘기는 TSX 문법입니다(<code>{"useState<Member[]>()"}</code>와 같은 원리). 그러면 <code>headers</code> · <code>customColumnDefs</code>의 필드 이름이 그 타입으로 검사되고
          자동완성됩니다. <code>rowData</code>에서 추론되므로 생략해도 됩니다.
        </p>
        <p className={muted}>
          <code>columnDefs</code>를 직접 넘기면 그쪽이 이기고 <code>option.headers</code>는 무시됩니다. 그 밖의 props(<code>getRowId</code>, <code>onSelectionChanged</code> 등)는 ag-grid로 그대로 전달됩니다.
        </p>
      </Block>

      <Block title="3. Sort in the browser or on the server">
        <p className={muted}>
          지금 가진 데이터만 정렬하면 되면 <code>sortColumns</code>를 줍니다. 페이지로 나눠 받는 목록은 <strong>서버가 전체를 정렬</strong>해야 하므로 <code>serverSortColumns</code>를 주고, 바뀐 정렬로 다시 조회한 결과를 <code>rowData</code>로
          넘깁니다.
        </p>
        <CodeBlock title="서버 정렬">{`const [sort, setSort] = useState<TxAgGridSort<Member>>({ value: "none" });

<TxAgGrid<Member>
  rowData={rows}                         // sort가 바뀌면 다시 조회한 결과
  option={{ headers, serverSortColumns: ["name", "joinedAt"] }}
  sortState={sort}                       // 다시 그릴 때 화살표가 맞도록
  onChangeSort={setSort}
/>`}</CodeBlock>
      </Block>

      <Block title="4. Paging and row numbers">
        <p className={muted}>
          <code>pagination</code>을 주면 표 아래에 <code>TxPagination</code>이 붙습니다. <code>offset</code>을 주면 맨 앞에 순번(#) 열이 생기고, 2페이지부터는 11, 12, …로 이어집니다. 행 데이터는 건드리지 않습니다.
        </p>
        <CodeBlock title="src/MemberGrid.tsx">{`const [query, setQuery] = useUrlQuery({ defaults: { page: 1, sort: "", order: "none" } });

<TxAgGrid<Member>
  rowData={rows}
  offset={(query.page - 1) * 10}
  pagination={{ currentPage: query.page, totalRows: total, pageSize: 10, onChangePage: (page) => setQuery({ page }) }}
  sortState={{ key: query.sort || undefined, value: query.order }}
  onChangeSort={(next) => setQuery({ sort: next.key ?? "", order: next.value, page: 1 })}
/>`}</CodeBlock>
        <p className={muted}>
          위 예제처럼 페이지와 정렬을 <code>useUrlQuery</code>로 주소에 담으면 새로고침하거나 상세 화면에서 돌아와도 같은 자리가 열립니다. 자세한 내용은{" "}
          <Link to="/docs/guide/url-state" className="underline">
            URL State
          </Link>
          에 있습니다.
        </p>
      </Block>

      <Block title="5. Editing">
        <p className={muted}>
          고칠 수 있는 열을 <code>editColumns</code>에 적습니다. 바뀐 값은 ag-grid의 <code>onCellValueChanged</code>로 받아 서버에 저장합니다.
        </p>
        <CodeBlock title="src/MemberGrid.tsx">{`<TxAgGrid<Member>
  rowData={rows}
  option={{ headers, editColumns: ["role"] }}
  onCellValueChanged={(event) => api.patch(\`/members/\${event.data.id}\`, { role: event.newValue })}
/>`}</CodeBlock>
      </Block>

      <Block title="6. Loading and dark mode">
        <p className={muted}>
          다시 불러오는 동안에는 <code>isLoading</code>을 주면 표 위에 불러오는 중 표시가 뜹니다. 표 안쪽의 색은 ag-grid 테마가 그려서 <code>--tx-*</code> 토큰을 따르지 않습니다. 다크 모드는 <code>TxAgGridProvider</code>에 ag-grid 테마를 넘겨
          맞춥니다. 위 예제는 사이트의 다크 모드를 따라 테마를 바꿉니다.
        </p>
        <CodeBlock title="src/App.tsx">{`import { TxAgGridProvider } from "@txstack/ui/aggrid";
import { colorSchemeDarkBlue, themeQuartz } from "ag-grid-community";

<TxAgGridProvider theme={dark ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz}>
  <App />
</TxAgGridProvider>`}</CodeBlock>
      </Block>

      <p className={muted}>
        예제를 단계별로 쌓아 가는 이야기(설치 → 열 → 정렬 → 편집 → 페이지 → 선택 → 로딩 → 테마)는 Storybook의{" "}
        <Link to="/api/ui#component-txaggrid" className="underline">
          TxAgGrid
        </Link>{" "}
        문서에 있습니다.
      </p>
    </Page>
  );
}
