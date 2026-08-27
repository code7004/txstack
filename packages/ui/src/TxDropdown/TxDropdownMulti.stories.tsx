import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxFlex } from "../TxFlex";
import { TxDropdownMulti } from "./TxDropdownMulti";

const CITIES = ["서울", "부산", "대구", "인천", "광주"];

const meta = {
  title: "Form/TxDropdownMulti",
  component: TxDropdownMulti,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "여럿을 고르는 드롭다운.",
          "",
          "```tsx",
          'import { TxDropdownMulti } from "@txstack/ui";',
          "",
          '<TxDropdownMulti data={["서울", "부산"]} onChangeText={setCities} />;',
          "```",
          "",
          "맨 위에 **전체 선택** 줄이 있고, 고른 개수가 헤더에 나온다. 골라도 목록이 닫히지 않는다.",
          "",
          "**`onSubmit*` 을 주면 확인 버튼이 생기고 `onChange*` 는 불리지 않는다.**",
          "여러 개를 고르는 동안 값이 바뀔 때마다 서버를 치지 않으려는 자리에 쓴다 —",
          "버튼을 누를 때 한 번만 온다. 확인하지 않고 닫으면 열기 전 상태로 되돌아간다.",
          "",
          "키보드는 `TxDropdown` 과 같다. 전체 선택 줄도 `↑↓` 로 짚어 `Enter` 로 켤 수 있다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { data: CITIES },
  argTypes: {
    placeholder: { control: "text" },
    fixedHead: { control: "text" },
    defaultAllChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    className: { control: "text", description: "`.tx-dropdown` 에 덧붙는다 (교체 아님)" },
    data: { control: false }
  }
} satisfies Meta<typeof TxDropdownMulti>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { placeholder: "선택", defaultAllChecked: false, disabled: false, className: "w-56" }
};

/** 고를 때마다 바로 알려 준다. 목록은 닫히지 않는다. */
export const ChangeAsYouPick: Story = {
  parameters: noControls,
  render: function ChangeAsYouPickStory() {
    const [values, setValues] = useState<string[]>([]);

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxDropdownMulti className="w-56" data={CITIES} onChangeText={setValues} />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">{values.length === 0 ? "—" : values.join(" · ")}</div>
      </TxFlex>
    );
  }
};

/**
 * **확인 버튼 모드.** 고르는 동안에는 아무것도 오지 않고, 버튼을 눌러야 한 번 온다.
 *
 * 아래 로그를 보면서 몇 개를 고른 뒤 확인을 눌러 보라.
 * 확인하지 않고 `Esc` 로 닫으면 고르던 것이 취소된다.
 */
export const SubmitMode: Story = {
  parameters: noControls,
  render: function SubmitModeStory() {
    const [log, setLog] = useState<string[]>([]);
    const push = (line: string) => setLog((prev) => [line, ...prev].slice(0, 6));

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxDropdownMulti className="w-56" data={CITIES} placeholder="고른 뒤 확인" onSubmitText={(v) => push(`onSubmitText([${v.join(", ")}])`)} />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">{log.length === 0 ? "—" : log.map((l, i) => <div key={i}>{l}</div>)}</div>
      </TxFlex>
    );
  }
};

export const States: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxDropdownMulti className="w-56" data={CITIES} placeholder="고른 것 없음" />
      <TxDropdownMulti className="w-56" data={CITIES} value={["서울", "부산"]} />
      <TxDropdownMulti className="w-56" data={CITIES} defaultAllChecked />
      <TxDropdownMulti className="w-56" data={CITIES} value={["서울"]} disabled />
      <TxDropdownMulti className="w-56" data={CITIES} fixedHead="지역" />
    </TxFlex>
  )
};

/** controlled 는 소비자가 값의 주인이다. */
export const Controlled: Story = {
  parameters: noControls,
  render: function ControlledStory() {
    const [values, setValues] = useState<string[]>(["서울"]);

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxDropdownMulti className="w-56" data={CITIES} value={values} onChangeText={setValues} />
        <TxFlex>
          <button type="button" className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-gray-700" onClick={() => setValues(CITIES)}>
            전부 고르기
          </button>
          <button type="button" className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-gray-700" onClick={() => setValues([])}>
            비우기
          </button>
        </TxFlex>
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">{values.length === 0 ? "—" : values.join(" · ")}</div>
      </TxFlex>
    );
  }
};

/** 긴 목록도 안에서 스크롤한다. 확인 버튼은 아래에 붙어 늘 보인다. */
export const LongList: Story = {
  parameters: noControls,
  render: () => <TxDropdownMulti className="w-56" data={Array.from({ length: 60 }, (_, i) => `항목 ${i + 1}`)} placeholder="60개" onSubmitText={() => {}} />
};
