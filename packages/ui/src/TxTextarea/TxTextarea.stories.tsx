import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxTextarea } from "./TxTextarea";

const meta = {
  title: "Form/TxTextarea",
  component: TxTextarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "여러 줄 입력. `TxInput` 과 같은 계열이지만 **콜백 이름이 `onChangedText` 다** (과거형 d 가 붙는다).",
          "`TxInput` 의 `onChangeText` 와 헷갈리기 쉬우니 주의한다.",
          "",
          "- 세로 리사이즈가 기본으로 열려 있다 (`resize-y`).",
          "- ref 로 `setValue` · `getValue` · `focus` · `select` 를 호출할 수 있다."
        ].join("\n")
      }
    }
  },
  args: { placeholder: "여러 줄 입력" },
  argTypes: { value: { control: false }, theme: { control: false }, disabled: { control: "boolean" }, rows: { control: "number" } }
} satisfies Meta<typeof TxTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

const Controlled = (args: React.ComponentProps<typeof TxTextarea>) => {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <TxTextarea {...args} value={value} onChangedText={setValue} />
      <p className="text-xs text-slate-500 dark:text-slate-400">{value.length}자</p>
    </div>
  );
};

/** 기본형. 콜백 이름이 `onChangedText` 인 점에 주의한다. */
export const 기본: Story = { render: (args) => <Controlled {...args} /> };

/** `rows` 로 초기 높이를 정한다. 사용자는 이후 세로로 늘릴 수 있다. */
export const 높이_지정: Story = { args: { rows: 8, placeholder: "8줄" }, render: (args) => <Controlled {...args} /> };

/** 비활성 상태. */
export const 비활성: Story = { args: { disabled: true, placeholder: "비활성" } };

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { wrapper: "border-2 border-amber-500 rounded-none" } },
  render: (args) => <Controlled {...args} />
};
