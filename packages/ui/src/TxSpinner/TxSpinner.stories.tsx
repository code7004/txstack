import type { Meta, StoryObj } from "@storybook/react-vite";
import TxSpinner from ".";

const meta = {
  title: "Form/TxButton", //  그룹/컴포넌트명
  component: TxSpinner,
  tags: ["autodocs"], //  props 표 자동 생성
  parameters: {
    docs: { description: { component: "…" } } //  주의점부터 적는다
  },
  args: { size: "2em", className: "" } //  기본값 — 첫 스토리가 바로 조작 가능해진다
} satisfies Meta<typeof TxSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
