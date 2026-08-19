import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxSlidePanel } from "./TxSlidePanel";
import type { TTxSlidePanelSide } from "./TxSlidePanel.types";
import { TxButton } from "../TxButton";

const SIDES: TTxSlidePanelSide[] = ["left", "right", "top", "bottom"];

const meta = {
  title: "Overlay/TxSlidePanel",
  component: TxSlidePanel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "가장자리에서 밀려 나오는 패널(drawer). 상세 보기나 필터 패널에 쓴다.",
          "",
          "- `side` 로 네 방향 중 하나를 고른다.",
          "- 닫힘 경로를 각각 끌 수 있다: `closeOnEscape` · `closeOnBackdrop` · `showCloseButton`. **셋 다 끄면 사용자가 닫을 방법이 없으니** 최소 하나는 남긴다.",
          "- `lockScroll` 은 열려 있는 동안 본문 스크롤을 막는다."
        ].join("\n")
      }
    }
  },
  args: { open: true, side: "right", title: "패널 제목", children: null },
  argTypes: {
    open: { control: "boolean" },
    side: { control: "inline-radio", options: SIDES },
    showCloseButton: { control: "boolean" },
    showOverlay: { control: "boolean" },
    closeOnEscape: { control: "boolean" },
    closeOnBackdrop: { control: "boolean" },
    lockScroll: { control: "boolean" },
    theme: { control: false },
    onClose: { control: false }
  }
} satisfies Meta<typeof TxSlidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (args: React.ComponentProps<typeof TxSlidePanel>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TxButton label={`${args.side} 에서 열기`} onClick={() => setOpen(true)} />
      <TxSlidePanel {...args} open={open} onClose={() => setOpen(false)}>
        <div className="flex w-72 flex-col gap-2 p-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">패널 본문.</p>
          <TxButton label="닫기" variant="secondary" onClick={() => setOpen(false)} />
        </div>
      </TxSlidePanel>
    </>
  );
};

/** 기본형. 상단 컨트롤에서 `side` 를 바꿔볼 수 있다. */
export const 기본: Story = { render: (args) => <Demo {...args} /> };

/** 네 방향. 각각 눌러 비교한다. */
export const 방향: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {SIDES.map((side) => (
        <Demo key={side} {...args} side={side} />
      ))}
    </div>
  )
};

/** 오버레이 없이. 뒤 화면을 계속 조작할 수 있다. */
export const 오버레이_없음: Story = { args: { showOverlay: false, closeOnBackdrop: false }, render: (args) => <Demo {...args} /> };

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { panel: "border-2 border-emerald-500" } },
  render: (args) => <Demo {...args} />
};
