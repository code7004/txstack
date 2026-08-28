import type { Meta, StoryObj } from "@storybook/react-vite";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeBalham, themeQuartz } from "ag-grid-community";
import { useMemo, useState } from "react";
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
          "```tsx",
          'import { TxAgGrid } from "@txstack/ui/aggrid";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxAgGrid",
          "  rowData={data?.rows}",
          "  isLoading={isLoading}",
          "  offset={offset}",
          "  defaultColDef={{ flex: 1 }}",
          '  option={{ headers: ["id", "name"], editColumns: ["name"] }}',
          "  pagination={{ currentPage, totalRows, pageSize: 50, onChangePage }}",
          "/>;",
          "```",
          "",
          "- 열을 **필드 이름만으로** 만든다(`option.headers`). 안 주면 첫 행의 키에서 만든다",
          "- `offset` 을 주면 맨 앞에 순번(`#`) 열이 붙는다. **넘긴 행 객체는 그대로다**",
          "- `pagination` 을 주면 아래에 쪽 번호가 붙는다 (`TxPagination`)",
          "- 그 밖의 props 는 **ag-grid 로 그대로 간다** — `defaultColDef` · `onCellValueChanged` · `onSelectionChanged` 등",
          "",
          "> **모듈 등록은 소비 앱이 한다.** 라이브러리가 대신 하면 필요한 모듈만 고르거나",
          "> enterprise 모듈을 쓰는 선택지를 뺏는다.",
          ">",
          "> ```tsx",
          '> import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";',
          "> ModuleRegistry.registerModules([AllCommunityModule]);",
          "> ```",
          "",
          "**줄·헤더·셀의 겉모습은 ag-grid 의 테마가 소유한다.** 우리 CSS 는 바깥 틀과",
          "우리가 얹은 것(순번 열·편집 표시)만 맡는다 — 같은 것을 두 곳이 정하면 어긋난다.",
          "",
          "그래서 **다크모드도 ag-grid 테마가 정한다.** `--tx-*` 토큰을 뒤집어도 표 안쪽은 따라오지 않는다.",
          "앱의 테마 상태를 `TxAgGridProvider` 에 물리면 된다.",
          "",
          "```tsx",
          "<TxAgGridProvider theme={dark ? themeQuartz.withPart(colorSchemeDark) : themeQuartz}>",
          "```",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
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

/** 그리드는 남는 높이를 채운다. 스토리에서는 감싸는 상자가 높이를 정한다. */
const Frame = ({ children }: { children: React.ReactNode }) => <div className="flex h-[26rem] flex-col p-4">{children}</div>;

export const Playground: Story = {
  args: { isLoading: false, offset: 0, className: "" },
  // args 를 통째로 펴지 않는다. 컨트롤로 만지는 것만 골라 넘긴다 — 나머지는 이 스토리가 정한다
  render: ({ isLoading, offset, className }) => (
    <Frame>
      <TxAgGrid<Member> rowData={pageOf(1)} isLoading={isLoading} offset={offset} className={className} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role", "active"] }} />
    </Frame>
  )
};

/**
 * **가장 흔한 모양.** 서버가 한 쪽씩 주고, 순번은 `offset` 으로 이어진다.
 *
 * 쪽을 넘겨 보라 — 순번이 11, 21… 로 이어지고 행 데이터에는 순번이 없다.
 */
export const ServerPaging: Story = {
  parameters: noControls,
  render: function ServerPagingStory() {
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

/** 열을 안 주면 **첫 행의 키**로 만든다. 개발 중에 빠르게 붙일 때 쓴다. */
export const ColumnsFromData: Story = {
  parameters: noControls,
  render: () => (
    <Frame>
      <TxAgGrid<Member> rowData={pageOf(1)} defaultColDef={{ flex: 1 }} />
    </Frame>
  )
};

/**
 * `option` 으로 열을 고른다.
 *
 * - `headers` — 보여 줄 필드와 **순서**
 * - `hiddenHeaders` — 빼고 싶은 필드. `headers` 보다 세다
 * - `customColumnDefs` — `field` 로 찾아 폭·렌더러·포맷을 덮는다
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
 * **고칠 수 있는 열**은 헤더에 점이 붙는다. 셀을 두 번 눌러 값을 바꿔 보라 —
 * `onCellValueChanged` 로 바뀐 행이 온다.
 */
export const Editable: Story = {
  parameters: noControls,
  render: function EditableStory() {
    const [last, setLast] = useState("—");

    return (
      <Frame>
        <TxAgGrid<Member> rowData={pageOf(1)} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role"], editColumns: ["name", "role"] }} onCellValueChanged={(event) => setLast(`${event.colDef.field} → ${String(event.newValue)}`)} />
        <div className="pt-2 font-mono text-sm text-slate-500 dark:text-slate-400">마지막 변경: {last}</div>
      </Frame>
    );
  }
};

/**
 * **서버 정렬.** 헤더를 누르면 화살표만 움직이고 행 순서는 그대로다 —
 * 다시 조회한 결과를 `rowData` 로 주는 것이 소비자의 일이다.
 *
 * 여기서는 그 자리에서 직접 정렬해 서버 응답을 흉내 낸다.
 */
export const ServerSort: Story = {
  parameters: noControls,
  render: function ServerSortStory() {
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
        <div className="pt-2 font-mono text-sm text-slate-500 dark:text-slate-400">
          onChangeSort → {sort.key ?? "-"} / {sort.value}
        </div>
      </Frame>
    );
  }
};

/** 선택 열이 있으면 순번은 고정하지 않는다 — 고정 자리를 다투기 때문이다. */
export const RowSelection: Story = {
  parameters: noControls,
  render: function RowSelectionStory() {
    const [count, setCount] = useState(0);

    return (
      <Frame>
        <TxAgGrid<Member> rowData={pageOf(1)} offset={0} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name", "role"], rowSelection: { mode: "multiRow" } }} onSelectionChanged={(event) => setCount(event.api.getSelectedRows().length)} />
        <div className="pt-2 font-mono text-sm text-slate-500 dark:text-slate-400">고른 행: {count}</div>
      </Frame>
    );
  }
};

/** `isLoading` 은 그리드 위에 덮개를 씌운다. 화면을 비우지 않아 자리가 흔들리지 않는다. */
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
 * 테마는 **ag-grid 것을 그대로** 쓴다. 앞에서 한 번 정하려면 `TxAgGridProvider` 다.
 *
 * ```tsx
 * import { themeQuartz, colorSchemeDarkBlue } from "ag-grid-community";
 *
 * <TxAgGridProvider theme={themeQuartz.withPart(colorSchemeDarkBlue)}>
 * ```
 *
 * 한 그리드만 다르게 하려면 그 그리드에 `theme` 을 준다 — 아래 두 번째가 그렇다.
 */
export const Theme: Story = {
  parameters: noControls,
  render: () => (
    <TxAgGridProvider theme={themeQuartz.withPart(colorSchemeDarkBlue)}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex h-56 flex-col">
          <div className="pb-2 text-xs font-bold text-slate-500 dark:text-slate-400">Provider 의 테마</div>
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
