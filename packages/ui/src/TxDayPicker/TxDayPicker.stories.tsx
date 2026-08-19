import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxDayPicker } from "./TxDayPicker";

const meta = {
  title: "Date ↗/TxDayPicker",
  component: TxDayPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "단일 날짜 선택. **`@txstack/ui/daypicker` 서브패스**에 있다.",
          "",
          "```sh",
          "pnpm add @txstack/ui react-day-picker dayjs",
          "```",
          "",
          "- `react-day-picker` · `dayjs` 는 **optional peerDependency** 다. 이 서브패스를 쓸 때만 설치한다.",
          "- 이 모듈은 `react-day-picker/dist/style.css` 를 import 한다. 소비자의 번들러가 CSS import 를 처리할 수 있어야 한다.",
          "- `format` 으로 입력창 표시 형식을 바꾼다(dayjs 포맷).",
          "- `disableAutoClose` 를 켜면 날짜를 골라도 패널이 닫히지 않는다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    value: { control: false },
    placeholder: { control: "text" },
    format: { control: "text", description: "dayjs 포맷 문자열" },
    disableAutoClose: { control: "boolean" },
    theme: { control: false }
  }
} satisfies Meta<typeof TxDayPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const Controlled = (args: React.ComponentProps<typeof TxDayPicker>) => {
  const [value, setValue] = useState<Date | undefined>(new Date());
  return (
    <div className="flex flex-col gap-2 pb-80">
      <TxDayPicker {...args} value={value} onChange={setValue} />
      <p className="text-xs text-slate-500 dark:text-slate-400">value: {value ? value.toISOString() : "undefined"}</p>
    </div>
  );
};

/** 기본형. 입력창을 눌러 달력을 연다. */
export const 기본: Story = { render: (args) => <Controlled {...args} /> };

/** `format` 으로 표시 형식을 바꾼다. */
export const 표시_형식: Story = { args: { format: "YYYY년 M월 D일" }, render: (args) => <Controlled {...args} /> };

/** 값이 없을 때는 `placeholder` 가 보인다. */
const Empty = (args: React.ComponentProps<typeof TxDayPicker>) => {
  const [value, setValue] = useState<Date>();
  return (
    <div className="pb-80">
      <TxDayPicker {...args} value={value} onChange={setValue} />
    </div>
  );
};
export const 빈_값: Story = { args: { placeholder: "날짜를 선택하세요" }, render: (args) => <Empty {...args} /> };

/** `disableAutoClose` — 고른 뒤에도 패널이 열려 있다. */
export const 자동닫기_해제: Story = { args: { disableAutoClose: true }, render: (args) => <Controlled {...args} /> };
