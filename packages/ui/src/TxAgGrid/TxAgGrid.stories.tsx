import type { Meta, StoryObj } from "@storybook/react-vite";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeBalham, themeQuartz } from "ag-grid-community";
import { useMemo, useState, type ReactNode } from "react";
import { TxButton } from "../TxButton";
import { TxAgGrid } from "./TxAgGrid";
import { TxAgGridProvider } from "./TxAgGrid.context";
import type { TxAgGridSort } from "./TxAgGrid.types";

/**
 * **모듈 등록은 소비 앱의 일이다.** 스토리북도 소비자라 여기서 한 번 한다.
 * 라이브러리가 대신 하면 필요한 모듈만 고르거나 enterprise 모듈을 쓰는 선택지를 뺏는다.
 */
ModuleRegistry.registerModules([AllCommunityModule]);

interface Member {
  id: number;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const ROLES = ["admin", "manager", "viewer"];

const MEMBERS: Member[] = Array.from({ length: 137 }, (_, index) => ({
  id: index + 1,
  name: `사용자 ${index + 1}`,
  role: ROLES[index % ROLES.length],
  active: index % 4 !== 0,
  createdAt: `2026-0${(index % 9) + 1}-1${index % 9}`
}));

const PAGE_SIZE = 10;

/** 스토리 안에서 서버 페이징을 흉내 낸다. 실제로는 이 자리에 fetch 가 온다. */
const pageOf = (page: number, rows: Member[] = MEMBERS) => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

const meta = {
  title: "Data/TxAgGrid",
  component: TxAgGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "ag-grid 위에 **목록 화면에서 늘 하는 일**을 얹은 표.",
          "",
          "**이 페이지는 쓰는 순서로 서 있다.** 위에서 아래로 따라가면 목록 화면 하나가 완성된다.",
          "",
          "| 순서 | 이야기 | 얻는 것 |",
          "| --- | --- | --- |",
          "| 1 | `Setup` | 표가 화면에 뜬다 (설치 · 모듈 등록 · 높이) |",
          "| 2 | `Columns` | 보여 줄 열과 그 순서 · 폭 · 포맷 |",
          "| 3 | `SortInBrowser` | 지금 있는 데이터를 브라우저가 세운다 |",
          "| 4 | `SortOnServer` | 정렬을 서버에 맡긴다 |",
          "| 5 | `Editing` | 셀을 고쳐 넣는다 |",
          "| 6 | `RowNumberAndPaging` | 순번(`#`)과 쪽 번호 |",
          "| 7 | `Selection` | 행을 고른다 |",
          "| 8 | `Loading` | 다시 불러오는 동안 |",
          "| 9 | `Theme` | 겉모습과 다크모드 |",
          "",
          "`Playground` 는 맨 아래에 있다 — 컨트롤 패널이 동작하는 것은 그것 하나다.",
          "",
          "### 먼저 알아 둘 세 가지",
          "",
          "**① 무거운 부품이라 서브패스에 있다.** `ag-grid-community` · `ag-grid-react` 는",
          "**설치하는 쪽이 고르는** optional peer 다.",
          "",
          "```sh",
          "pnpm add ag-grid-community ag-grid-react",
          "```",
          "",
          "**② 모듈 등록은 앱이 한다.** 라이브러리가 대신 하면 필요한 모듈만 고르거나",
          "enterprise 모듈을 쓰는 선택지를 뺏는다. 앱 진입점에서 한 번이다.",
          "",
          "```tsx",
          'import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";',
          "",
          "ModuleRegistry.registerModules([AllCommunityModule]);",
          "```",
          "",
          "**③ 표는 남는 높이를 채운다.** 높이는 이 컴포넌트의 CSS 가 갖고 있으므로",
          "**감싸는 자리가 높이를 정해 줘야** 보인다 — 안 그러면 0px 로 접힌다.",
          "",
          "```tsx",
          '<div className="flex h-[26rem] flex-col">',
          "  <TxAgGrid … />",
          "</div>",
          "```",
          "",
          "### 안 보이거나 이상할 때",
          "",
          "| 이런 일이 | 이유 |",
          "| --- | --- |",
          "| 표가 아예 안 보인다 | 감싸는 자리에 **높이가 없다**. 위 ③ |",
          "| 빈 표에 에러만 난다 | **모듈 등록**을 안 했다. 위 ② |",
          "| `option.headers` 가 무시된다 | `columnDefs` 를 함께 줬다 — **직접 만든 열이 이긴다** |",
          "| 화살표만 움직이고 순서가 안 바뀐다 | `serverSortColumns` 를 쓴 것이다. 다시 조회한 결과를 `rowData` 로 주는 것이 소비자 몫(`SortOnServer`) |",
          "| 쪽을 넘겼는데 순번이 1부터 | `offset` 을 새 쪽 값으로 갱신하지 않았다 |",
          "| `--tx-*` 를 뒤집었는데 다크모드가 안 따라온다 | **표 안쪽은 ag-grid 테마가 소유한다**(`Theme`) |",
          "",
          "그 밖의 props 는 **ag-grid 로 그대로 간다** — `defaultColDef` · `onCellValueChanged` ·",
          "`onSelectionChanged` · `getRowId` 등 `AgGridReact` 가 받는 것은 다 받는다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    rowData: { control: false },
    columnDefs: { control: false },
    option: { control: false },
    pagination: { control: false },
    isLoading: { control: "boolean" },
    offset: { control: "number", description: "그 쪽의 첫 행 번호. 주면 `#` 열이 붙는다" },
    className: { control: "text", description: "`.tx-ag-grid` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxAgGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

/** 표는 남는 높이를 채운다. 스토리에서는 이 상자가 높이를 정한다. */
const Frame = ({ children }: { children: ReactNode }) => <div className="flex h-[26rem] flex-col p-4">{children}</div>;

const Note = ({ children }: { children: ReactNode }) => <div className="pt-2 font-mono text-sm text-slate-500 dark:text-slate-400">{children}</div>;

/**
 * ## 1. 표를 띄운다
 *
 * **줄 데이터만 주면 뜬다.** 열은 첫 행의 키에서 만들어진다 — 개발 중에 빠르게 붙일 때 이대로 쓴다.
 *
 * ```tsx
 * import { TxAgGrid } from "@txstack/ui/aggrid";
 * import "@txstack/ui/styles.css"; // 앱에서 한 번
 *
 * <div className="flex h-[26rem] flex-col">
 *   <TxAgGrid rowData={rows} defaultColDef={{ flex: 1 }} />
 * </div>;
 * ```
 *
 * `defaultColDef={{ flex: 1 }}` 는 **ag-grid 것이 그대로 간다** — 열이 남는 폭을 나눠 갖는다.
 * 안 주면 열마다 기본 폭(200px)이라 표 오른쪽에 빈자리가 남는다.
 */
export const Setup: Story = {
  parameters: noControls,
  render: () => (
    <Frame>
      <TxAgGrid<Member> rowData={pageOf(1)} defaultColDef={{ flex: 1 }} />
    </Frame>
  )
};

/**
 * ## 2. 열을 고른다
 *
 * `option` 하나로 정한다. **필드 이름만 쓰면 되고, 그 순서가 화면 순서다.**
 *
 * ```tsx
 * option={{
 *   headers: ["id", "name", "role", "createdAt"],   // 보여 줄 것과 순서
 *   addHeaders: ["active"],                          // 뒤에 덧붙일 것
 *   hiddenHeaders: ["createdAt"],                    // 뺄 것 — headers 보다 세다
 *   customColumnDefs: [                              // field 로 찾아 덮어쓴다
 *     { field: "id", headerName: "번호", width: 80, flex: 0 },
 *     { field: "active", headerName: "상태", valueFormatter: ({ value }) => (value ? "사용" : "정지") }
 *   ]
 * }}
 * ```
 *
 * `customColumnDefs` 는 **ag-grid `colDef` 그대로**다 — 폭 · 렌더러 · 포맷 · 정렬 · 고정을
 * 여기서 준다. 열 전체를 직접 짜고 싶으면 `columnDefs` 를 주면 되고, 그때 `headers` 계열은
 * 쓰이지 않는다.
 */
export const Columns: Story = {
  parameters: noControls,
  render: () => (
    <Frame>
      <TxAgGrid<Member>
        rowData={pageOf(1)}
        defaultColDef={{ flex: 1 }}
        option={{
          headers: ["id", "name", "role", "createdAt"],
          hiddenHeaders: ["createdAt"],
          addHeaders: ["active"],
          customColumnDefs: [
            { field: "id", headerName: "번호", width: 80, flex: 0 },
            { field: "active", headerName: "상태", valueFormatter: ({ value }) => (value ? "사용" : "정지") }
          ]
        }}
      />
    </Frame>
  )
};

/**
 * ## 3. 브라우저가 정렬한다
 *
 * **지금 화면에 있는 데이터를 세운다.** 한 번에 다 받아 오는 목록이면 이쪽이다 — 서버를 다시
 * 부르지 않으므로 누르는 즉시 바뀐다.
 *
 * ```tsx
 * option={{ headers: ["id", "name", "role"], sortColumns: "*" }}
 * ```
 *
 * `"*"` 는 전부, `"none"` 은 없음, 배열이면 그 필드만이다. 머리글을 눌러 보라 —
 * **행 순서가 실제로 바뀐다.**
 */
export const SortInBrowser: Story = {
  parameters: noControls,
  render: () => (
    <Frame>
      <TxAgGrid<Member> rowData={pageOf(1)} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role", "createdAt"], sortColumns: "*" }} />
    </Frame>
  )
};

/**
 * ## 4. 서버가 정렬한다
 *
 * 쪽을 나눠 받는 목록은 **한 쪽만 세워 봐야 의미가 없다.** 그래서 이쪽은 화살표만 그리고
 * 행 순서를 건드리지 않는다 — 다시 조회한 결과를 `rowData` 로 주는 것이 소비자의 일이다.
 *
 * ```tsx
 * const [sort, setSort] = useState<TxAgGridSort<Member>>({ value: "none" });
 * const { data } = useMembers({ page, sort });      // 서버로 보낸다
 *
 * <TxAgGrid
 *   rowData={data?.rows}
 *   option={{ headers: ["id", "name", "role"], serverSortColumns: "*" }}
 *   sortState={sort}
 *   onChangeSort={setSort}
 * />;
 * ```
 *
 * `sortState` 를 함께 주는 이유는 **되돌아왔을 때 화살표가 맞아야** 하기 때문이다 —
 * 주소나 저장된 조건에서 정렬을 복원하는 화면이 그렇다.
 */
export const SortOnServer: Story = {
  parameters: noControls,
  render: function SortOnServerStory() {
    const [sort, setSort] = useState<TxAgGridSort<Member>>({ value: "none" });

    const rows = useMemo(() => {
      if (!sort.key || sort.value === "none") return pageOf(1);

      const key = sort.key as keyof Member;
      const sorted = [...MEMBERS].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));
      return (sort.value === "desc" ? sorted.reverse() : sorted).slice(0, PAGE_SIZE);
    }, [sort]);

    return (
      <Frame>
        <TxAgGrid<Member> rowData={rows} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role"], serverSortColumns: "*" }} sortState={sort} onChangeSort={setSort} />
        <Note>서버로 보낼 것 — key: {sort.key ?? "-"} / value: {sort.value}</Note>
      </Frame>
    );
  }
};

/**
 * ## 5. 셀을 고친다
 *
 * `editColumns` 를 준 열은 **머리글에 점이 붙어** 고칠 수 있다는 것을 알린다.
 * 셀을 두 번 누르거나 `Enter` 로 들어가 값을 바꿔 보라.
 *
 * ```tsx
 * <TxAgGrid
 *   rowData={rows}
 *   option={{ headers: ["id", "name", "role"], editColumns: ["name", "role"] }}
 *   onCellValueChanged={({ data, colDef, newValue }) => save(data.id, colDef.field, newValue)}
 * />
 * ```
 *
 * **저장은 소비자가 한다.** `onCellValueChanged` 는 ag-grid 이벤트 그대로라 바뀐 행 · 열 ·
 * 옛 값 · 새 값이 다 실려 온다. `"*"` 를 주면 모든 열이 고쳐진다.
 */
export const Editing: Story = {
  parameters: noControls,
  render: function EditingStory() {
    const [last, setLast] = useState("—");

    return (
      <Frame>
        <TxAgGrid<Member> rowData={pageOf(1)} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role"], editColumns: ["name", "role"] }} onCellValueChanged={(event) => setLast(`${event.colDef.field} → ${String(event.newValue)}`)} />
        <Note>마지막 변경: {last}</Note>
      </Frame>
    );
  }
};

/**
 * ## 6. 순번과 쪽 번호
 *
 * **가장 흔한 목록 화면의 모양이다.** `offset` 은 그 쪽의 첫 행 번호다 — 2쪽 10개씩이면 `10`.
 *
 * ```tsx
 * const [page, setPage] = useState(1);
 * const { data } = useMembers({ page });
 *
 * <TxAgGrid
 *   rowData={data?.rows}
 *   offset={(page - 1) * PAGE_SIZE}
 *   pagination={{ currentPage: page, totalRows: data?.total ?? 0, pageSize: PAGE_SIZE, onChangePage: setPage }}
 * />;
 * ```
 *
 * 쪽을 넘겨 보라 — 순번이 `11` · `21` 로 **이어진다.** 그러면서도 **넘긴 행 객체에는 순번이
 * 없다**(번호는 그릴 때 행 위치에서 계산한다). 쪽 번호는 `TxPagination` 이 그리므로
 * 카드 목록에서도 같은 부품을 쓴다.
 */
export const RowNumberAndPaging: Story = {
  parameters: noControls,
  render: function RowNumberAndPagingStory() {
    const [page, setPage] = useState(1);
    const rows = useMemo(() => pageOf(page), [page]);

    return (
      <Frame>
        <TxAgGrid<Member>
          rowData={rows}
          offset={(page - 1) * PAGE_SIZE}
          defaultColDef={{ flex: 1 }}
          option={{ headers: ["id", "name", "role", "active", "createdAt"] }}
          pagination={{ currentPage: page, totalRows: MEMBERS.length, pageSize: PAGE_SIZE, onChangePage: setPage }}
        />
      </Frame>
    );
  }
};

/**
 * ## 7. 행을 고른다
 *
 * `rowSelection` 은 **ag-grid 것 그대로**라 그쪽 옵션을 다 쓸 수 있다.
 *
 * ```tsx
 * <TxAgGrid
 *   rowData={rows}
 *   option={{ headers: ["id", "name"], rowSelection: { mode: "multiRow" } }}
 *   onSelectionChanged={({ api }) => setPicked(api.getSelectedRows())}
 * />
 * ```
 *
 * 선택 열이 맨 앞에 서므로, **그때 순번 열은 고정하지 않는다** — 고정 자리를 다투면
 * 가로 스크롤에서 두 열이 겹쳐 보인다.
 */
export const Selection: Story = {
  parameters: noControls,
  render: function SelectionStory() {
    const [count, setCount] = useState(0);

    return (
      <Frame>
        <TxAgGrid<Member> rowData={pageOf(1)} offset={0} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role"], rowSelection: { mode: "multiRow" } }} onSelectionChanged={(event) => setCount(event.api.getSelectedRows().length)} />
        <Note>고른 행: {count}</Note>
      </Frame>
    );
  }
};

/**
 * ## 8. 다시 불러오는 동안
 *
 * `isLoading` 은 표 위에 덮개를 씌운다. **화면을 비우지 않아** 자리가 흔들리지 않는다.
 *
 * ```tsx
 * <TxAgGrid rowData={data?.rows} isLoading={isLoading} />
 * ```
 *
 * 서버 훅이 주는 이름(`isLoading`)을 그대로 꽂을 수 있게 이 이름을 쓴다. ag-grid 의
 * `loading` 을 직접 줘도 되고, 그쪽이 우선한다.
 */
export const Loading: Story = {
  parameters: noControls,
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);

    return (
      <Frame>
        <TxAgGrid<Member> rowData={pageOf(1)} isLoading={loading} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role"] }} />
        <div className="pt-2">
          <TxButton label={loading ? "다 불러왔다" : "다시 불러온다"} variant="secondary" onClick={() => setLoading((prev) => !prev)} />
        </div>
      </Frame>
    );
  }
};

/**
 * ## 9. 겉모습과 다크모드
 *
 * **표 안쪽(줄 · 머리글 · 셀)은 ag-grid 의 테마가 소유한다.** 우리 CSS 는 바깥 틀과 우리가
 * 얹은 것(순번 열 · 편집 점)만 맡는다 — 같은 것을 두 곳이 정하면 어긋난다.
 *
 * **그래서 `--tx-*` 를 뒤집어도 표 안쪽은 따라오지 않는다.** 앱의 테마 상태를 여기에 물린다.
 *
 * ```tsx
 * import { colorSchemeDark, themeQuartz } from "ag-grid-community";
 *
 * const theme = useMemo(() => (dark ? themeQuartz.withPart(colorSchemeDark) : themeQuartz), [dark]);
 *
 * <TxAgGridProvider theme={theme}>
 *   <App />           // 화면 안의 모든 그리드가 이것을 쓴다
 * </TxAgGridProvider>;
 * ```
 *
 * 이름을 우리가 다시 짓지 않아서 `withPart` 조합이 그대로 살아 있다. 한 그리드만 다르게
 * 하려면 그 그리드에 `theme` 을 준다 — 아래 두 번째가 그렇다. 감싸지 않으면 Quartz 다.
 */
export const Theme: Story = {
  parameters: noControls,
  render: () => (
    <TxAgGridProvider theme={themeQuartz.withPart(colorSchemeDarkBlue)}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex h-56 flex-col">
          <div className="pb-2 text-xs font-bold text-slate-500 dark:text-slate-400">Provider 의 테마 — 화면 안 전부</div>
          <TxAgGrid<Member> rowData={pageOf(1, MEMBERS.slice(0, 4))} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role"] }} />
        </div>
        <div className="flex h-56 flex-col">
          <div className="pb-2 text-xs font-bold text-slate-500 dark:text-slate-400">이 그리드만 Balham</div>
          <TxAgGrid<Member> rowData={pageOf(1, MEMBERS.slice(0, 4))} theme={themeBalham} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role"] }} />
        </div>
      </div>
    </TxAgGridProvider>
  )
};

/** 직접 만져 보는 자리. **컨트롤 패널이 동작하는 것은 이 이야기 하나다.** */
export const Playground: Story = {
  args: { isLoading: false, offset: 0, className: "" },
  // args 를 통째로 펴지 않는다. 컨트롤로 만지는 것만 골라 넘긴다 — 나머지는 이 스토리가 정한다
  render: ({ isLoading, offset, className }) => (
    <Frame>
      <TxAgGrid<Member> rowData={pageOf(1)} isLoading={isLoading} offset={offset} className={className} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role", "active"] }} />
    </Frame>
  )
};
