import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxDropdown } from "./TxDropdown";

const FRUITS: string[] = ["사과", "바나나", "딸기", "포도"];
const USERS = [
  { name: "김철수", value: 1 },
  { name: "이영희", value: 2 },
  { name: "박민수", value: 3 }
];

const meta = {
  title: "Form/TxDropdown",
  component: TxDropdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "단일 선택 드롭다운. **`data` 의 모양에서 값 타입이 추론된다** — 이것이 이 컴포넌트의 핵심이다.",
          "",
          "- `data` 에 원시값 배열(`[1, 2, 3]`)을 주면 값이 `number` 로, `{ name, value }` 배열을 주면 `value` 의 타입으로 추론된다.",
          "- 콜백은 타입별로 나뉜다: `onChangeText` · `onChangeNumb` · `onChangeBool`. 항목 전체가 필요하면 `onChangeValue`.",
          "- `fixedHead` 는 선택과 무관하게 머리말을 고정하고, `defaultHead` 는 미선택 시에만 쓰인다.",
          "- `addNoChoiceItem` 을 켜면 '선택 안 함' 항목이 맨 앞에 붙는다."
        ].join("\n")
      }
    }
  },
  args: { data: FRUITS, defaultHead: "과일 선택" },
  argTypes: {
    data: { control: false },
    value: { control: false },
    fixedHead: { control: "text", description: "선택과 무관하게 고정되는 머리말" },
    defaultHead: { control: "text", description: "미선택 시 머리말" },
    addNoChoiceItem: { control: "boolean" }
  }
} satisfies Meta<typeof TxDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 원시값 배열. 값 타입이 `string` 으로 추론된다. */
const Primitive = (args: React.ComponentProps<typeof TxDropdown>) => {
  const [value, setValue] = useState<string>();
  return (
    <div className="flex flex-col gap-2">
      <TxDropdown {...args} data={FRUITS} value={value} onChangeText={setValue} />
      <p className="text-xs text-slate-500 dark:text-slate-400">value: {JSON.stringify(value)}</p>
    </div>
  );
};
export const 기본: Story = { render: (args) => <Primitive {...args} /> };

/** `{ name, value }` 배열. 화면에는 `name`, 콜백으로는 `value` 가 온다. */
const Items = () => {
  const [id, setId] = useState<number>();
  return (
    <div className="flex flex-col gap-2">
      <TxDropdown data={USERS} value={id} defaultHead="담당자" onChangeNumb={setId} />
      <p className="text-xs text-slate-500 dark:text-slate-400">선택된 id: {JSON.stringify(id)}</p>
    </div>
  );
};
export const 이름_값_분리: Story = { render: () => <Items /> };

/** `fixedHead` 는 무엇을 골라도 머리말이 바뀌지 않는다. 필터 라벨에 쓴다. */
const Heads = () => {
  const [a, setA] = useState<string>();
  const [b, setB] = useState<string>();
  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-1">
        <TxDropdown data={FRUITS} value={a} defaultHead="defaultHead" onChangeText={setA} />
        <span className="text-xs text-slate-500">선택하면 머리말이 바뀐다</span>
      </div>
      <div className="flex flex-col gap-1">
        <TxDropdown data={FRUITS} value={b} fixedHead="정렬" onChangeText={setB} />
        <span className="text-xs text-slate-500">항상 &quot;정렬&quot; 로 고정</span>
      </div>
    </div>
  );
};
export const 머리말_전략: Story = { render: () => <Heads /> };

/** `addNoChoiceItem` 으로 선택 해제 항목을 추가한다. */
const NoChoice = () => {
  const [value, setValue] = useState<string>();
  return (
    <div className="flex flex-col gap-2">
      <TxDropdown data={FRUITS} value={value} defaultHead="과일" addNoChoiceItem onChangeText={setValue} />
      <p className="text-xs text-slate-500 dark:text-slate-400">value: {JSON.stringify(value)}</p>
    </div>
  );
};
export const 선택_해제_항목: Story = { render: () => <NoChoice /> };
