import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxDropdownMulti } from "./TxDropdownMulti";

const TAGS: string[] = ["신규", "재방문", "휴면", "이탈", "VIP"];

const meta = {
  title: "Form/TxDropdownMulti",
  component: TxDropdownMulti,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "다중 선택 드롭다운. `TxDropdown` 과 같은 타입 추론을 쓰되 **값이 배열**이다.",
          "",
          "- `onChange*` 는 고를 때마다, `onSubmit*` 는 패널을 닫을 때 한 번 호출된다. 서버 호출은 보통 `onSubmit*` 에 건다.",
          "- `defaultAllCheck` 를 켜면 초기에 전체 선택 상태로 시작한다.",
          "- `maxHeight` 로 목록 높이를 제한한다. 항목이 많을 때 필요하다."
        ].join("\n")
      }
    }
  },
  args: { data: TAGS, defaultHead: "태그" },
  argTypes: {
    data: { control: false },
    value: { control: false },
    defaultAllCheck: { control: "boolean" },
    maxHeight: { control: "text" },
    fixedHead: { control: "text" },
    defaultHead: { control: "text" }
  }
} satisfies Meta<typeof TxDropdownMulti>;

export default meta;
type Story = StoryObj<typeof meta>;

const Basic = (args: React.ComponentProps<typeof TxDropdownMulti>) => {
  const [values, setValues] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-2">
      <TxDropdownMulti {...args} data={TAGS} value={values} onChangeText={setValues} onSubmitText={setSubmitted} />
      <p className="text-xs text-slate-500 dark:text-slate-400">onChange: {JSON.stringify(values)}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">onSubmit(닫을 때): {JSON.stringify(submitted)}</p>
    </div>
  );
};

/** 고를 때마다 `onChange*`, 패널을 닫을 때 `onSubmit*` 가 호출된다. 둘의 차이를 아래에서 확인할 수 있다. */
export const 기본: Story = { render: (args) => <Basic {...args} /> };

/** `defaultAllCheck` 로 전체 선택 상태에서 시작한다. */
const AllChecked = () => {
  const [values, setValues] = useState<string[]>([...TAGS]);
  return (
    <div className="flex flex-col gap-2">
      <TxDropdownMulti data={TAGS} value={values} defaultAllCheck fixedHead="태그" onChangeText={setValues} />
      <p className="text-xs text-slate-500 dark:text-slate-400">{values.length}개 선택</p>
    </div>
  );
};
export const 전체_선택_시작: Story = { render: () => <AllChecked /> };

/** 항목이 많을 때 `maxHeight` 로 목록 높이를 제한한다. */
const Long = () => {
  const data = Array.from({ length: 40 }, (_, i) => `항목 ${i + 1}`);
  const [values, setValues] = useState<string[]>([]);
  return <TxDropdownMulti data={data} value={values} defaultHead="40개 항목" maxHeight={200} onChangeText={setValues} />;
};
export const 높이_제한: Story = { render: () => <Long /> };
