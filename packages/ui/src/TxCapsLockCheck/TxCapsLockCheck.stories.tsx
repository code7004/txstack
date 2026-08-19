import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxCapsLockCheck } from ".";
import { TxInput } from "../TxInput";

const meta = {
  title: "Form/TxCapsLockCheck",
  component: TxCapsLockCheck,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "CapsLock 이 켜져 있으면 경고 문구를 띄운다. 비밀번호 입력 옆에 붙이는 용도다.",
          "",
          "- **직접 CapsLock 키를 눌러야 보인다.** 키 이벤트로 상태를 읽기 때문에, 첫 키 입력 전에는 알 수 없다.",
          "- 창 포커스를 잃으면 메시지를 감춘다.",
          "- `preserveSpace`(기본 true)는 메시지가 없을 때도 같은 높이를 확보해 **레이아웃 점프를 막는다.**",
          "- `locale` 로 문구를 번역 함수에 통과시킬 수 있다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    text: { control: "text" },
    preserveSpace: { control: "boolean" },
    className: { control: "text" },
    locale: { control: false }
  }
} satisfies Meta<typeof TxCapsLockCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 아래 입력란을 클릭하고 **CapsLock 키를 눌러보라.** 경고가 나타난다. */
export const 기본: Story = {
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-1">
      <TxInput type="password" placeholder="비밀번호" />
      <TxCapsLockCheck {...args} />
    </div>
  )
};

/**
 * `preserveSpace` 차이. 왼쪽은 메시지가 없어도 높이를 유지하고, 오른쪽은 나타날 때 아래 요소가 밀린다.
 * CapsLock 을 켰다 껐다 하며 비교한다.
 */
export const 레이아웃_점프: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <TxInput type="password" placeholder="preserveSpace: true" />
        <TxCapsLockCheck preserveSpace />
        <div className="rounded bg-slate-200 p-2 text-xs dark:bg-slate-700">이 블록은 움직이지 않는다</div>
      </div>
      <div className="flex flex-col gap-1">
        <TxInput type="password" placeholder="preserveSpace: false" />
        <TxCapsLockCheck preserveSpace={false} />
        <div className="rounded bg-slate-200 p-2 text-xs dark:bg-slate-700">이 블록이 아래로 밀린다</div>
      </div>
    </div>
  )
};

/** `text` 로 문구를 바꾼다. */
export const 문구_변경: Story = {
  args: { text: "Caps Lock ON — 대문자로 입력됩니다" },
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-1">
      <TxInput type="password" placeholder="비밀번호" />
      <TxCapsLockCheck {...args} />
    </div>
  )
};
