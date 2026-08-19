import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxDayPickerRange } from "./TxDayPickerRange";
import type { TTxDayPickerRangeValue } from "./TxDayPicker.types";

const meta = {
  title: "Date ↗/TxDayPickerRange",
  component: TxDayPickerRange,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "기간(시작~종료) 선택. **`@txstack/ui/daypicker` 서브패스**에 있다.",
          "",
          "- **`onChange` 와 `onSubmit` 은 플로우가 다르다.** `onChange` 는 고를 때마다 즉시, `onSubmit` 을 주면 패널 안에서 초안으로 고르고 **확인을 눌러야** 값이 올라간다. 서버 재조회가 붙는 필터에는 `onSubmit` 이 맞다.",
          "- `onChangeNums` · `onSubmitNums` 는 같은 값을 epoch 숫자로 준다.",
          "- `diffBlock` 으로 최대 선택 가능 일수를 제한한다.",
          "- `header` 는 render-prop 을 지원해 '최근 7일' 같은 프리셋 버튼을 얹을 수 있다.",
          "",
          "> 이름 주의 — 원본의 오타 `TxDayPickekRange` 는 deprecated 별칭으로 남아 있다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    value: { control: false },
    placeholder: { control: "text" },
    format: { control: "text" },
    diffBlock: { control: "number", description: "최대 선택 가능 일수" },
    disableAutoClose: { control: "boolean" },
    theme: { control: false },
    header: { control: false },
    footer: { control: false }
  }
} satisfies Meta<typeof TxDayPickerRange>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `onChange` — 고를 때마다 즉시 올라온다. */
const Immediate = (args: React.ComponentProps<typeof TxDayPickerRange>) => {
  const [range, setRange] = useState<TTxDayPickerRangeValue>([undefined, undefined]);
  return (
    <div className="flex flex-col gap-2 pb-80">
      <TxDayPickerRange {...args} value={range} onChange={setRange} />
      <p className="text-xs text-slate-500 dark:text-slate-400">{range.map((d) => d?.toLocaleDateString() ?? "-").join(" ~ ")}</p>
    </div>
  );
};
export const 기본: Story = { render: (args) => <Immediate {...args} /> };

/** `onSubmit` — 패널 안에서 초안으로 고르고 **확인을 눌러야** 반영된다. */
const Confirmed = (args: React.ComponentProps<typeof TxDayPickerRange>) => {
  const [range, setRange] = useState<TTxDayPickerRangeValue>([undefined, undefined]);
  return (
    <div className="flex flex-col gap-2 pb-80">
      <TxDayPickerRange {...args} value={range} onSubmit={setRange} placeholder="선택 후 확인을 누른다" />
      <p className="text-xs text-slate-500 dark:text-slate-400">확정된 값: {range.map((d) => d?.toLocaleDateString() ?? "-").join(" ~ ")}</p>
    </div>
  );
};
export const 확정_플로우: Story = { render: (args) => <Confirmed {...args} /> };

/** `diffBlock` 으로 최대 7일까지만 고르게 한다. */
export const 최대_기간_제한: Story = { args: { diffBlock: 7 }, render: (args) => <Immediate {...args} /> };

/** epoch 숫자로 받는다. 서버 파라미터에 그대로 넘길 때 쓴다. */
const AsNumbers = () => {
  const [nums, setNums] = useState<[number | undefined, number | undefined]>([undefined, undefined]);
  return (
    <div className="flex flex-col gap-2 pb-80">
      <TxDayPickerRange onChangeNums={setNums} placeholder="숫자로 받기" />
      <p className="text-xs text-slate-500 dark:text-slate-400">{JSON.stringify(nums)}</p>
    </div>
  );
};
export const 숫자_값: Story = { render: () => <AsNumbers /> };
