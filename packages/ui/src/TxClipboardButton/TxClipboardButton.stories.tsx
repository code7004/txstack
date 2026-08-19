import type { Meta, StoryObj } from "@storybook/react-vite";
import TxClipboardButton from ".";

const meta = {
  title: "Feedback/TxClipboardButton",
  component: TxClipboardButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "누르면 `text` 를 클립보드에 복사하는 아이콘 버튼.",
          "",
          "- 성공/실패 피드백을 **띄우지 않는다.** 토스트가 필요하면 소비자가 감싸서 붙인다.",
          "- 내부적으로 `navigator.clipboard` 를 쓰고, 실패 시 `document.execCommand` 로 폴백한다.",
          "- ⚠ 클립보드 API 는 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { text: "복사될 문자열" },
  argTypes: { text: { control: "text" } }
} satisfies Meta<typeof TxClipboardButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 아이콘을 눌러 복사한다. 어딘가에 붙여넣어 확인한다. */
export const 기본: Story = {};

/** 값 옆에 붙여 쓰는 형태. */
export const 값_옆에: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 rounded border px-3 py-2">
      <code className="text-sm">{args.text}</code>
      <TxClipboardButton {...args} />
    </div>
  )
};
