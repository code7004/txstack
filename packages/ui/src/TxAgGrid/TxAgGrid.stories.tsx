import type { Meta, StoryObj } from "@storybook/react-vite";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useMemo, useState } from "react";
import TxAgGrid from "./TxAgGrid";
import type { ITxAgGridOption, ITxAgGridSortChange } from "./TxAgGrid.types";

/**
 * ⚠ ag-grid 모듈 등록은 **소비 앱의 책임**이다. 라이브러리가 대신 하지 않는다.
 * 빠뜨리면 그리드가 빈 화면으로 뜨고 콘솔에 ag-grid error #272 가 찍힌다.
 */
ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
  status: string;
  username: string;
  amount: number;
  createdAt: string;
}

const ROWS: IRow[] = [
  { status: "active", username: "alex", amount: 1250000, createdAt: "2026-07-16 09:12" },
  { status: "pending", username: "mika", amount: 840000, createdAt: "2026-07-15 18:44" },
  { status: "blocked", username: "june", amount: 3120000, createdAt: "2026-07-14 11:05" }
];

const meta = {
  title: "Data/TxAgGrid ↗",
  component: TxAgGrid,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ag-grid 기반 데이터 그리드. **`@txstack/ui/aggrid` 서브패스**에 있다.",
          "",
          "```sh",
          "pnpm add @txstack/ui ag-grid-community ag-grid-react",
          "```",
          "",
          "- `ag-grid-community` · `ag-grid-react` 는 **optional peerDependency** 다. 이 서브패스를 쓸 때만 설치한다.",
          "- **모듈 등록은 소비 앱이 한다** — `ModuleRegistry.registerModules([AllCommunityModule])`. 라이브러리가 대신 하면 필요한 모듈만 고르거나 enterprise 모듈을 쓰는 선택지를 뺏는다.",
          "- `option` 으로 헤더 선택·정렬 가능 컬럼·컬럼 정의를 한 곳에서 준다. `columnDefs` 를 직접 줄 수도 있다.",
          "- `serverSortColumns` 는 정렬을 **클라이언트에서 하지 않고** `onChangeSort` 로 올려보낸다. 서버 페이징과 맞물릴 때 쓴다."
        ].join("\n")
      }
    }
  },
  args: { rowData: ROWS },
  argTypes: {
    rowData: { control: false },
    option: { control: false },
    pagination: { control: false },
    isLoading: { control: "boolean" },
    theme: { control: false }
  }
} satisfies Meta<typeof TxAgGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }) => <div style={{ height: 260 }}>{children}</div>;

/** 데이터만 주면 키에서 컬럼이 만들어진다. */
export const 기본: Story = {
  render: (args) => (
    <Frame>
      <TxAgGrid {...args} />
    </Frame>
  )
};

/** `option` 으로 표시할 헤더와 컬럼 정의를 준다. 금액은 `valueFormatter` 로 천단위 구분한다. */
const WithOption = () => {
  const option = useMemo<ITxAgGridOption<IRow>>(
    () => ({
      headers: ["status", "username", "amount", "createdAt"],
      customColumnDefs: [
        { field: "status", width: 120 },
        { field: "username", width: 140 },
        { field: "amount", cellClass: "text-end", valueFormatter: (p) => (p.value ? Number(p.value).toLocaleString() : "0") }
      ]
    }),
    []
  );
  return (
    <Frame>
      <TxAgGrid rowData={ROWS} option={option} />
    </Frame>
  );
};
export const 컬럼_정의: Story = { render: () => <WithOption /> };

/**
 * `serverSortColumns` 를 주면 클라이언트에서 정렬하지 않고 `onChangeSort` 로 상태만 올린다.
 * 헤더를 눌러 아래 값이 바뀌는 것을 확인한다.
 */
const ServerSort = () => {
  const [sort, setSort] = useState<ITxAgGridSortChange<IRow>>();
  const option = useMemo<ITxAgGridOption<IRow>>(() => ({ headers: ["status", "username", "amount"], serverSortColumns: "*" }), []);
  return (
    <div className="flex flex-col gap-2">
      <Frame>
        <TxAgGrid rowData={ROWS} option={option} sortState={sort} onChangeSort={setSort} />
      </Frame>
      <p className="text-xs text-slate-500 dark:text-slate-400">sortState: {JSON.stringify(sort ?? null)}</p>
    </div>
  );
};
export const 서버_정렬: Story = { render: () => <ServerSort /> };

/** `isLoading` 중에는 오버레이가 덮인다. */
export const 로딩: Story = {
  args: { isLoading: true },
  render: (args) => (
    <Frame>
      <TxAgGrid {...args} />
    </Frame>
  )
};
