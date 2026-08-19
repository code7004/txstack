import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxModal } from "./TxModal";
import { TxButton } from "../TxButton";

const meta = {
  title: "Overlay/TxModal",
  component: TxModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "모달 다이얼로그. `framer-motion` 으로 열고 닫는 전환을 처리한다.",
          "",
          "- `visible` 로 제어한다. 컴포넌트가 열림 상태를 스스로 갖지 않는다.",
          "- **ESC 키와 바깥 클릭으로 닫힌다.** 결제·삭제 확인처럼 실수를 막아야 하면 `preventOutside` 로 바깥 클릭을 막는다 (ESC 는 계속 동작).",
          '- `role="dialog"` · `aria-modal` 이 붙는다. `title` 을 주면 `aria-labelledby` 로 연결된다.'
        ].join("\n")
      }
    }
  },
  args: { visible: true, title: "제목", children: null },
  argTypes: {
    visible: { control: "boolean" },
    title: { control: "text" },
    preventOutside: { control: "boolean", description: "바깥 클릭으로 닫히지 않게 한다" },
    theme: { control: false },
    onExit: { control: false }
  }
} satisfies Meta<typeof TxModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (args: React.ComponentProps<typeof TxModal>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TxButton label="모달 열기" onClick={() => setOpen(true)} />
      <TxModal {...args} visible={open} onExit={() => setOpen(false)}>
        <div className="flex w-80 flex-col gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">ESC 또는 바깥을 눌러 닫아본다.</p>
          <TxButton label="닫기" variant="secondary" onClick={() => setOpen(false)} />
        </div>
      </TxModal>
    </>
  );
};

/** 버튼으로 열고 ESC·바깥 클릭으로 닫는다. */
export const 기본: Story = { render: (args) => <Demo {...args} /> };

/** `preventOutside` — 바깥을 눌러도 닫히지 않는다. ESC 는 여전히 동작한다. */
export const 바깥클릭_방지: Story = { args: { preventOutside: true, title: "삭제하시겠습니까?" }, render: (args) => <Demo {...args} /> };

/** 제목 없이 본문만. */
export const 제목_없음: Story = { args: { title: undefined }, render: (args) => <Demo {...args} /> };

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { container: "rounded-none border-2 border-purple-500" } },
  render: (args) => <Demo {...args} />
};
