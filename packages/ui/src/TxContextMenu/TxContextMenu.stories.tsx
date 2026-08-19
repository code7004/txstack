import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { TxContextMenu } from "./TxContextMenu";
import type { TTxContextMenuOption } from "./TxContextMenu.types";

// decorators 가 있으면 satisfies 로는 타입이 비이식적이 되어 TS2742 가 난다. 명시 주석을 쓴다.
const meta: Meta<typeof TxContextMenu> = {
  title: "Overlay/TxContextMenu",
  component: TxContextMenu,
  tags: ["autodocs"],
  decorators: [
    // to 옵션이 NavLink 를 쓰므로 Router 컨텍스트가 필요하다.
    (Story) => (
      <MemoryRouter>
        <div className="pb-40">
          <Story />
        </div>
      </MemoryRouter>
    )
  ],
  parameters: {
    docs: {
      description: {
        component: [
          "우클릭(또는 좌클릭) 컨텍스트 메뉴. 표 행이나 카드에 붙인다.",
          "",
          '- `options` 배열로 항목을 정의한다. `{ type: "divider" }` 로 구분선을 넣는다.',
          "- `mouse` 가 `right`(기본) · `left` · `both`.",
          "- 항목의 `hide` 는 조건부 노출, `disabled` 는 비활성이다. **`hide` 는 배열에서 빼는 것과 같아** 권한별 메뉴에 쓰기 좋다.",
          "- `onClick` 이 Promise 를 반환해도 된다. `to` 를 주면 라우터 링크가 된다."
        ].join("\n")
      }
    }
  },
  args: { options: [] },
  argTypes: {
    options: { control: false },
    mouse: { control: "inline-radio", options: ["right", "left", "both"] },
    theme: { control: false }
  }
};

export default meta;
type Story = StoryObj<typeof TxContextMenu>;

const Target = ({ text }: { text: string }) => <div className="flex h-24 w-64 items-center justify-center rounded border border-dashed text-sm text-slate-500">{text}</div>;

/** 아래 영역에서 **우클릭**해본다. */
const Basic = (args: React.ComponentProps<typeof TxContextMenu>) => {
  const [log, setLog] = useState<string | null>(null);
  const options: TTxContextMenuOption[] = [{ label: "복사", onClick: () => setLog("복사") }, { label: "붙여넣기", onClick: () => setLog("붙여넣기") }, { type: "divider" }, { label: "삭제", onClick: () => setLog("삭제") }];
  return (
    <div className="flex flex-col gap-2">
      <TxContextMenu {...args} options={options}>
        <Target text="여기서 우클릭" />
      </TxContextMenu>
      <p className="text-xs text-slate-500 dark:text-slate-400">마지막 선택: {log ?? "(없음)"}</p>
    </div>
  );
};
export const 기본: Story = { render: (args) => <Basic {...args} /> };

/** `disabled` 와 `hide` 의 차이. `hide` 는 아예 그려지지 않는다. */
export const 항목_상태: Story = {
  render: (args) => (
    <TxContextMenu {...args} options={[{ label: "정상 항목" }, { label: "비활성 항목", disabled: true }, { label: "숨김 항목(보이지 않음)", hide: true }, { type: "divider" }, { label: "라우터 링크", to: "/settings" }]}>
      <Target text="우클릭 — 3개만 보인다" />
    </TxContextMenu>
  )
};

/** `mouse` 로 트리거 버튼을 고른다. */
export const 트리거: Story = {
  render: (args) => (
    <div className="flex gap-3">
      {(["right", "left", "both"] as const).map((m) => (
        <TxContextMenu key={m} {...args} mouse={m} options={[{ label: `${m} 트리거` }]}>
          <Target text={m} />
        </TxContextMenu>
      ))}
    </div>
  )
};
