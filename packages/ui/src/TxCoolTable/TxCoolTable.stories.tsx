import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxCoolTable } from "./TxCoolTable";

interface IRow extends Record<string, unknown> {
  status: string;
  username: string;
  amount: number;
}

const ROWS: IRow[] = [
  { status: "active", username: "alex", amount: 1250000 },
  { status: "pending", username: "mika", amount: 840000 },
  { status: "blocked", username: "june", amount: 3120000 }
];

const meta = {
  title: "Data/TxCoolTable (deprecated)",
  component: TxCoolTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "> ## ⚠ deprecated",
          ">",
          "> **새 코드에서는 쓰지 않는다. `TxAgGrid` 를 쓴다.**",
          "> 이관 시점의 호환을 위해 남겨 둔 것이며, 렌더할 때마다 콘솔에 경고가 찍힌다.",
          "",
          "순수 DOM `<table>` 기반 표. ag-grid 없이 가벼운 표가 필요할 때 쓰던 것이다.",
          "",
          "- `options.headers` 로 표시할 열과 순서를 정한다. 없으면 데이터의 키를 그대로 쓴다.",
          "- `defaultSort` 는 **정렬 상태를 표시만** 한다. 실제 정렬은 하지 않으며, `onClickHeader` 로 상위에 올려 서버 재조회에 쓴다.",
          "- `fixables` 로 특정 열을 sticky 로 고정한다."
        ].join("\n")
      }
    }
  },
  args: { data: ROWS },
  argTypes: {
    data: { control: false },
    options: { control: false },
    caption: { control: "text" },
    tableLayout: { control: "inline-radio", options: ["auto", "fixed"] },
    theme: { control: false }
  }
} satisfies Meta<typeof TxCoolTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 데이터만 주면 키에서 열이 만들어진다. */
export const 기본: Story = {};

/** `options.headers` 로 열과 순서를 고른다. */
export const 열_선택: Story = { args: { options: { headers: ["username", "amount"] } } };

/** `defaultSort` 는 표시만 한다 — 실제 정렬은 서버가 한 것으로 가정한다. */
export const 정렬_표시: Story = { args: { defaultSort: { key: "amount", order: "desc" }, options: { sortColumns: "*" } } };

/** `caption` 을 주면 표 위에 제목이 붙는다. */
export const 제목: Story = { args: { caption: "결제 내역" } };
