import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxSpinner } from ".";

const meta = {
  title: "TxSpinner", //  그룹/컴포넌트명
  component: TxSpinner,
  tags: ["autodocs"], //  props 표 자동 생성
  parameters: {
    docs: { description: { component: "…" } } //  주의점부터 적는다
  },
  // args 로 기본값을 덮지 않는다 — 첫 스토리는 "아무것도 안 준 상태" 를 보여줘야 한다 (D5)
  args: {}
} satisfies Meta<typeof TxSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
