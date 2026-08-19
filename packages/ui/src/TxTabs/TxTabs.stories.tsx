import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxTabs } from "./TxTabs";

const TABS = ["개요", "설정", "권한"];

const meta = {
  title: "Overlay/TxTabs",
  component: TxTabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "탭. 머리말 배열(`tabs`)과 본문 렌더러(`renderBody`)를 짝지어 쓴다.",
          "",
          "- `value` 를 주면 제어 컴포넌트가 되고, 주지 않으면 내부 상태로 동작한다.",
          "- `renderHead` · `renderBody` 로 머리말·본문을 통째로 커스텀할 수 있다.",
          "- `tabs` 는 `ReactNode[]` 라 문자열뿐 아니라 아이콘·배지도 넣을 수 있다."
        ].join("\n")
      }
    }
  },
  args: { tabs: TABS },
  argTypes: { tabs: { control: false }, value: { control: false }, theme: { control: false }, renderHead: { control: false }, renderBody: { control: false } }
} satisfies Meta<typeof TxTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 비제어. 내부 상태로 탭이 전환된다. */
export const 기본: Story = {
  render: (args) => <TxTabs {...args} renderBody={({ name, index }) => <div className="p-4 text-sm">{`${String(name)} 본문 (index ${index})`}</div>} />
};

/** `value` + `onChange` 로 제어한다. 바깥 버튼으로도 전환할 수 있다. */
const Controlled = () => {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col gap-2">
      <TxTabs tabs={TABS} value={index} onChange={setIndex} renderBody={({ name }) => <div className="p-4 text-sm">{String(name)}</div>} />
      <div className="flex gap-2 text-xs">
        {TABS.map((t, i) => (
          <button key={t} className="rounded border px-2 py-1" onClick={() => setIndex(i)}>
            {t} 로 이동
          </button>
        ))}
      </div>
    </div>
  );
};
export const 제어: Story = { render: () => <Controlled /> };

/** `tabs` 가 `ReactNode[]` 이므로 배지를 붙일 수 있다. */
export const 노드_머리말: Story = {
  args: {
    tabs: [
      "전체",
      <span key="new" className="flex items-center gap-1">
        신규 <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">3</span>
      </span>,
      "보관"
    ]
  },
  render: (args) => <TxTabs {...args} renderBody={({ index }) => <div className="p-4 text-sm">index {index}</div>} />
};

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { headActive: "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400" } },
  render: (args) => <TxTabs {...args} renderBody={({ name }) => <div className="p-4 text-sm">{String(name)}</div>} />
};
