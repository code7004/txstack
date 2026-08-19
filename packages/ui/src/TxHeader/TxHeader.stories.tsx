import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxHeader } from "./TxHeader";
import { TxButton } from "../TxButton";

const meta = {
  title: "Layout/TxHeader",
  component: TxHeader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: ["페이지 상단 바. 높이·정렬·테두리만 잡아 주는 얇은 컨테이너다.", "", "- 내용 배치는 소비자가 정한다. 로고·타이틀·액션 슬롯 같은 것을 강제하지 않는다.", "- `theme` 은 문자열 하나다(중첩 없음). 통째로 교체된다."].join("\n")
      }
    }
  },
  argTypes: { theme: { control: false }, className: { control: "text" } }
} satisfies Meta<typeof TxHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 제목과 액션 버튼. */
export const 기본: Story = {
  render: (args) => (
    <TxHeader {...args}>
      <b className="text-base">사용자 관리</b>
      <div className="ml-auto flex gap-2">
        <TxButton label="새로고침" variant="secondary" />
        <TxButton label="추가" />
      </div>
    </TxHeader>
  )
};

/** 제목만. */
export const 제목만: Story = { render: (args) => <TxHeader {...args}>대시보드</TxHeader> };

/** `theme` 은 문자열 하나라 통째로 교체된다. */
export const 테마_덮어쓰기: Story = {
  render: () => (
    <TxHeader theme={"flex h-14 items-center gap-2 border-b-2 border-purple-500 px-4 text-purple-700 dark:text-purple-300" as never}>
      <b>보라 헤더</b>
    </TxHeader>
  )
};
