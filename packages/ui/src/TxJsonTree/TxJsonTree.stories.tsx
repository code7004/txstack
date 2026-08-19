import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxJsonTree } from "./TxJsonTree";

const SAMPLE = {
  id: 1024,
  name: "홍길동",
  active: true,
  score: 0,
  nickname: "",
  deletedAt: null,
  tags: ["신규", "VIP"],
  profile: { email: "hong@example.com", address: { city: "서울", zip: "04524" } }
};

const meta = {
  title: "Data/TxJsonTree",
  component: TxJsonTree,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "임의의 객체를 접을 수 있는 트리로 그린다. 응답 디버깅이나 설정 표시에 쓴다.",
          "",
          '- **`0` · `false` · `""` · `null` 을 숨기지 않는다.** falsy 값을 빠뜨리는 뷰어가 흔한데 그러면 디버깅에 못 쓴다.',
          "- `onEdit` · `onAdd` · `onDelete` 를 주면 해당 동작이 활성화된다. 콜백은 `path` 배열을 함께 준다.",
          "- 콜백을 주지 않으면 읽기 전용이다."
        ].join("\n")
      }
    }
  },
  args: { data: SAMPLE },
  argTypes: {
    data: { control: "object" },
    theme: { control: false },
    isRootType: { control: "boolean", description: "루트 타입 표기 여부" },
    locale: { control: false }
  }
} satisfies Meta<typeof TxJsonTree>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 읽기 전용. `score: 0` · `nickname: ""` · `deletedAt: null` 이 그대로 보인다. */
export const 기본: Story = {};

/** 중첩 객체·배열도 그대로 펼친다. */
export const 중첩: Story = {
  args: { data: { level1: { level2: { level3: { value: "깊은 곳", list: [1, 2, 3] } } } } }
};

/** `onEdit` 을 주면 값 편집이 활성화된다. 변경 경로가 `path` 로 온다. */
const Editable = () => {
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-2">
      <TxJsonTree
        data={SAMPLE}
        onEdit={(path, next, prev) => setLog((l) => [`edit ${path.join(".")}: ${JSON.stringify(prev)} → ${JSON.stringify(next)}`, ...l].slice(0, 5))}
        onDelete={(path) => setLog((l) => [`delete ${path.join(".")}`, ...l].slice(0, 5))}
      />
      <ul className="text-xs text-slate-500 dark:text-slate-400">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
};
export const 편집_가능: Story = { render: () => <Editable /> };

/** 빈 객체·빈 배열도 형태를 잃지 않는다. */
export const 빈_값: Story = { args: { data: { emptyObject: {}, emptyArray: [], zero: 0, no: false, blank: "", nothing: null } } };
