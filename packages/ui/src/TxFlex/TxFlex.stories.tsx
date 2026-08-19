import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxFlex } from ".";

const meta = {
  title: "Layout/TxFlex",
  component: TxFlex,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "`display: flex` 와 기본 간격만 얹은 얇은 래퍼. **`className` 을 주면 기본 `gap-2` 를 대체한다.**",
          "",
          "- 나머지는 전부 평범한 `div` 다. 방향·정렬은 Tailwind 클래스로 준다.",
          "- 이 컴포넌트의 값은 '간격 기본값이 있는 flex' 하나뿐이다. 복잡한 배치는 `TxLayout` 을 쓴다."
        ].join("\n")
      }
    }
  },
  argTypes: { className: { control: "text" } }
} satisfies Meta<typeof TxFlex>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ n }: { n: number }) => <div className="rounded bg-slate-200 px-4 py-2 text-sm dark:bg-slate-700">{n}</div>;
const items = [1, 2, 3];

/** 기본값은 가로 배치 + `gap-2`. */
export const 기본: Story = {
  render: (args) => (
    <TxFlex {...args}>
      {items.map((n) => (
        <Box key={n} n={n} />
      ))}
    </TxFlex>
  )
};

/** `className` 으로 방향과 간격을 바꾼다. */
export const 방향: Story = {
  render: () => (
    <div className="flex gap-8">
      <TxFlex className="flex-col gap-1">
        {items.map((n) => (
          <Box key={n} n={n} />
        ))}
      </TxFlex>
      <TxFlex className="gap-6">
        {items.map((n) => (
          <Box key={n} n={n} />
        ))}
      </TxFlex>
    </div>
  )
};

/** 정렬도 Tailwind 로 준다. */
export const 정렬: Story = {
  render: () => (
    <TxFlex className="h-24 items-center justify-between rounded border px-3">
      <Box n={1} />
      <Box n={2} />
    </TxFlex>
  )
};
