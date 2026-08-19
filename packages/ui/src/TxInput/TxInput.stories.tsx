import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxInput } from "./TxInput";
import type { ITxInput } from "./TxInput.types";

const meta = {
  title: "Form/TxInput",
  component: TxInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "텍스트·숫자 입력. `onChange` 대신 **타입별 콜백**을 쓰는 것이 이 컴포넌트의 핵심이다.",
          "",
          "- `onChangeText` 는 문자열, `onChangeInt` · `onChangeFloat` 는 숫자를 **파싱해서** 준다. 이벤트 객체를 까볼 필요가 없다.",
          "- `onSubmitText` · `onEnter` 는 Enter 키에 반응한다. 검색창을 만들 때 `onChangeText` 와 나눠 쓴다.",
          "- `focus` prop 을 켜면 마운트 시 자동으로 포커스가 간다.",
          "- ref 로 `setValue` · `getValue` · `focus` · `select` 를 호출할 수 있다."
        ].join("\n")
      }
    }
  },
  args: { placeholder: "입력하세요" },
  argTypes: {
    value: { control: false },
    theme: { control: false, description: "themeMerge 로 부분 덮어쓰기" },
    focus: { control: "boolean", description: "마운트 시 자동 포커스" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" }
  }
} satisfies Meta<typeof TxInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const Controlled = (args: ITxInput) => {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <TxInput {...args} value={value} onChangeText={setValue} />
      <p className="text-xs text-slate-500 dark:text-slate-400">value: {JSON.stringify(value)}</p>
    </div>
  );
};

/** 기본형. 아래에 현재 값을 함께 표시한다. */
export const 기본: Story = { render: (args) => <Controlled {...args} /> };

/**
 * 숫자 입력은 `onChangeInt` / `onChangeFloat` 를 쓴다. 문자열 파싱을 소비자가 하지 않는다.
 * 정수형은 소수점을 잘라내고, 실수형은 유지한다.
 */
const Numeric = () => {
  const [int, setInt] = useState(0);
  const [float, setFloat] = useState(0);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <TxInput placeholder="정수" onChangeInt={setInt} />
        <p className="text-xs text-slate-500 dark:text-slate-400">onChangeInt: {int}</p>
      </div>
      <div className="flex flex-col gap-1">
        <TxInput placeholder="실수" onChangeFloat={setFloat} />
        <p className="text-xs text-slate-500 dark:text-slate-400">onChangeFloat: {float}</p>
      </div>
    </div>
  );
};
export const 숫자_입력: Story = { render: () => <Numeric /> };

/** `onEnter` 는 Enter 키에만 반응한다. 타이핑 중에는 호출되지 않는다. */
const OnEnter = () => {
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-2">
      <TxInput placeholder="입력 후 Enter" onSubmitText={(v) => setLog((prev) => [`submit: ${v}`, ...prev].slice(0, 4))} />
      <ul className="text-xs text-slate-500 dark:text-slate-400">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
};
export const Enter_제출: Story = { render: () => <OnEnter /> };

/** 비활성 상태. */
export const 비활성: Story = { args: { disabled: true, placeholder: "비활성" } };

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { placeholder: "커스텀", theme: { wrapper: "border-2 border-purple-500 rounded-none" } },
  render: (args) => <Controlled {...args} />
};
