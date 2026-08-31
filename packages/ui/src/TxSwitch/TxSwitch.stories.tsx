import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxCheckBox } from "../TxCheckBox";
import { TxSwitch } from "./TxSwitch";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Form/TxSwitch",
  component: TxSwitch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "그 자리에서 바로 켜고 끄는 자리.",
          "",
          "```tsx",
          'import { TxSwitch } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxSwitch label="알림 받기" defaultChecked onChangeBool={setPush} />;',
          "```",
          "",
          "### `TxCheckBox` 와 하는 말이 다르다",
          "",
          "| | `TxSwitch` | `TxCheckBox` |",
          "| --- | --- | --- |",
          "| 하는 말 | **누르는 즉시 켜진다** | 이것을 고르겠다 |",
          "| 읽히는 말 | 켜짐 / 꺼짐 (`role=\"switch\"`) | 선택됨 |",
          "| 맞는 자리 | 설정 · 기능 켜기 | 약관 동의 · 목록 고르기 |",
          "",
          "**확인 버튼이 뒤따르는 폼에는 체크박스**를 쓴다. 눌러 놓고 저장을 안 눌렀는데",
          "켜진 것처럼 보이면 거짓말이 된다.",
          "",
          "### 진짜 입력이다",
          "",
          "`<input type=\"checkbox\">` 를 눈에서만 지웠다. 그래서 Tab 으로 닿고 Space 로 켜지며,",
          "`name` · `value` · `disabled` 가 그대로 통해 **`<form>` 안에서 그냥 제출된다.**",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { label: "알림 받기" },
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    checked: { control: false, description: "주면 controlled — `Playground` 에서는 비워 둔다" },
    onChangeBool: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-switch` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {};

/** 꺼짐 · 켜짐 · 잠김. */
export const States: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3">
      <TxSwitch label="꺼짐" />
      <TxSwitch label="켜짐" defaultChecked />
      <TxSwitch label="잠김 (꺼짐)" disabled />
      <TxSwitch label="잠김 (켜짐)" disabled defaultChecked />
    </div>
  )
};

/**
 * **체크박스와 나란히 두고 보라.** 같은 모양이 아니라 **다른 말**을 한다 —
 * 스위치는 누르는 즉시, 체크박스는 나중에 제출한다.
 */
export const NotACheckBox: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">설정 — 누르는 즉시 반영된다</p>
        <TxSwitch label="새 소식 알림" defaultChecked />
        <TxSwitch label="야간 방해 금지" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">폼 — 저장을 눌러야 반영된다</p>
        <TxCheckBox label="이용약관에 동의합니다" />
        <TxCheckBox label="마케팅 수신에 동의합니다" />
      </div>
    </div>
  )
};

/** **값의 주인이 소비자다.** `checked` 를 주면 받아서 바꿔야 켜진다. */
export const Controlled: Story = {
  parameters: noControls,
  render: function ControlledStory() {
    const [on, setOn] = useState(false);

    return (
      <div className="flex flex-col gap-3">
        <TxSwitch label={on ? "켜짐" : "꺼짐"} checked={on} onChangeBool={setOn} />
        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">값: {String(on)}</p>
      </div>
    );
  }
};

/** `<form>` 안에서 그냥 제출된다. 켜져 있을 때만 실린다. */
export const InForm: Story = {
  parameters: noControls,
  render: function InFormStory() {
    const [sent, setSent] = useState<string>("—");

    return (
      <form
        className="flex max-w-sm flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSent([...new FormData(event.currentTarget).entries()].map(([key, value]) => `${key}=${value}`).join(", ") || "(빈 값)");
        }}
      >
        <TxSwitch name="push" value="on" label="푸시 알림" defaultChecked />
        <TxSwitch name="mail" value="on" label="메일 알림" />

        <button type="submit" className="tx-button" data-variant="primary">
          <span className="tx-button__label">보내기</span>
        </button>

        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">보낸 것: {sent}</p>
      </form>
    );
  }
};

/** 겉모습은 CSS 변수로 바꾼다. **손잡이 이동 거리는 계산으로 나오므로 크기만 바꾸면 된다.** */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3">
      <TxSwitch label="기본" defaultChecked />
      <TxSwitch label="크게" defaultChecked style={vars({ "--tx-switch-track-width": "3.5rem", "--tx-switch-track-height": "2rem", "--tx-switch-thumb-size": "1.5rem" })} />
      <TxSwitch label="다른 색" defaultChecked style={vars({ "--tx-switch-track-checked-bg": "var(--tx-color-success)" })} />
    </div>
  )
};
