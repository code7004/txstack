import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxCheckBox } from "./TxCheckBox";
import type { ITxCheckBoxProps } from "./TxCheckBox.types";

const meta = {
  title: "Form/TxCheckBox",
  component: TxCheckBox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "체크박스와 토글 스위치를 **한 컴포넌트로** 제공한다. `variant` 로 모양만 바꾼다.",
          "",
          "- 값은 `value`(boolean), 변경은 `onChangeBool` 이다. DOM 의 `checked`/`onChange` 가 아니다.",
          "- `borderColor` · `fillColor` · `cursorColor` 로 Tailwind 클래스를 직접 주입해 색을 바꾼다.",
          "- `label` 대신 `children` 을 주면 라벨 자리를 통째로 커스텀할 수 있다."
        ].join("\n")
      }
    }
  },
  args: { label: "동의합니다", variant: "checkbox" },
  argTypes: {
    variant: { control: "inline-radio", options: ["checkbox", "toggle"] },
    value: { control: false },
    theme: { control: false },
    label: { control: "text" },
    borderColor: { control: "text", description: "Tailwind 클래스 문자열" },
    fillColor: { control: "text" },
    cursorColor: { control: "text" }
  }
} satisfies Meta<typeof TxCheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const Controlled = (args: ITxCheckBoxProps) => {
  const [on, setOn] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <TxCheckBox {...args} value={on} onChangeBool={setOn} />
      <span className="text-xs text-slate-500 dark:text-slate-400">{String(on)}</span>
    </div>
  );
};

/** 기본형. 상단 컨트롤로 `variant` 를 바꿔볼 수 있다. */
export const 기본: Story = { render: (args) => <Controlled {...args} /> };

/** 같은 컴포넌트, `variant` 만 다르다. */
const Variants = () => {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <TxCheckBox variant="checkbox" label="checkbox" value={a} onChangeBool={setA} />
      <TxCheckBox variant="toggle" label="toggle" value={b} onChangeBool={setB} />
    </div>
  );
};
export const Variant: Story = { render: () => <Variants /> };

/** 색상 3종을 Tailwind 클래스로 주입한다. */
const Colors = () => {
  const [on, setOn] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <TxCheckBox label="기본" value={on} onChangeBool={setOn} />
      <TxCheckBox label="초록" value={on} onChangeBool={setOn} fillColor="bg-emerald-500" borderColor="border-emerald-500" />
      <TxCheckBox variant="toggle" label="토글 · 보라" value={on} onChangeBool={setOn} fillColor="bg-purple-500" cursorColor="bg-white" />
    </div>
  );
};
export const 색상_주입: Story = { render: () => <Colors /> };

/** `children` 으로 라벨 자리를 통째로 대체한다. */
export const 커스텀_라벨: Story = {
  render: (args) => (
    <Controlled {...args} label={undefined}>
      <span className="text-sm">
        <b>약관</b>에 동의합니다 <span className="text-red-500">*</span>
      </span>
    </Controlled>
  )
};

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { label: "text-base font-bold text-purple-600 dark:text-purple-400" } },
  render: (args) => <Controlled {...args} />
};
