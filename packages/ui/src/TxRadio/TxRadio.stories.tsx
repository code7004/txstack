import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxRadio } from "./TxRadio";
import { TxRadioGroup } from "./TxRadioGroup";

const meta = {
  title: "Form/TxRadioGroup",
  component: TxRadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "여럿 중 하나를 고르는 자리.",
          "",
          "```tsx",
          'import { TxRadio, TxRadioGroup } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxRadioGroup legend="결제 수단" defaultValue="card" onChange={setPay}>',
          '  <TxRadio value="card" label="카드" />',
          '  <TxRadio value="bank" label="계좌이체" />',
          "</TxRadioGroup>;",
          "```",
          "",
          "### 방향키 이동을 손으로 짜지 않는다",
          "",
          "같은 `name` 을 가진 **네이티브 라디오끼리는 브라우저가 옮겨 준다** — ↑↓←→ 로",
          "골라 다니고 Tab 은 묶음을 **한 번만** 밟는다. 흔히 말하는 roving tabindex 를",
          "직접 짤 일이 없다. `TxRadioGroup` 이 하는 일은 그 `name` 을 이어 주는 것이다.",
          "",
          "### `<fieldset>` 과 `<legend>` 다",
          "",
          "그래서 스크린리더가 항목마다 **\"결제 수단, 카드, 라디오 버튼, 3개 중 1\"** 처럼",
          "묶음 이름과 몇 번째인지를 함께 읽는다. `<div role=\"radiogroup\">` 으로는 그 셈이",
          "자동으로 나오지 않는다. 묶음을 잠그는 것도 `<fieldset disabled>` 하나로 끝난다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { legend: "결제 수단" },
  argTypes: {
    legend: { control: "text" },
    inline: { control: "boolean" },
    disabled: { control: "boolean" },
    defaultValue: { control: "text" },
    value: { control: false, description: "주면 controlled — `Playground` 에서는 비워 둔다" },
    onChange: { control: false },
    children: { control: false },
    className: { control: "text", description: "`.tx-radio-group` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

const OPTIONS = (
  <>
    <TxRadio value="card" label="카드" />
    <TxRadio value="bank" label="계좌이체" />
    <TxRadio value="phone" label="휴대폰" />
  </>
);

export const Playground: Story = {
  render: (args) => <TxRadioGroup {...args}>{OPTIONS}</TxRadioGroup>
};

/**
 * **키보드로 다뤄 보라.** Tab 으로 묶음에 들어오면 고른 것(없으면 첫 항목)에 닿고,
 * **↑↓←→ 로 옮기면 그 자리에서 골라진다.** Tab 을 다시 누르면 묶음을 통째로 빠져나간다 —
 * 항목마다 멈추지 않는다.
 */
export const Keyboard: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4">
      <button type="button" className="tx-button" data-variant="secondary">
        <span className="tx-button__label">앞의 버튼</span>
      </button>

      <TxRadioGroup legend="결제 수단" defaultValue="card">
        {OPTIONS}
      </TxRadioGroup>

      <button type="button" className="tx-button" data-variant="secondary">
        <span className="tx-button__label">뒤의 버튼</span>
      </button>
    </div>
  )
};

/** 가로로 늘어놓을 수 있다. */
export const Inline: Story = {
  parameters: noControls,
  render: () => (
    <TxRadioGroup legend="배송 방법" defaultValue="normal" inline>
      <TxRadio value="normal" label="일반" />
      <TxRadio value="fast" label="빠른 배송" />
      <TxRadio value="pickup" label="방문 수령" />
    </TxRadioGroup>
  )
};

/** **값의 주인이 소비자다.** `value` 를 주면 받아서 바꿔야 골라진다. */
export const Controlled: Story = {
  parameters: noControls,
  render: function ControlledStory() {
    const [pay, setPay] = useState("card");

    return (
      <div className="flex flex-col gap-3">
        <TxRadioGroup legend="결제 수단" value={pay} onChange={setPay}>
          {OPTIONS}
        </TxRadioGroup>

        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">고른 값: {pay}</p>
      </div>
    );
  }
};

/** 묶음을 통째로 잠그거나 항목만 따로 잠근다. */
export const Disabled: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-6">
      <TxRadioGroup legend="묶음 전체가 잠겼다" defaultValue="card" disabled>
        {OPTIONS}
      </TxRadioGroup>

      <TxRadioGroup legend="한 항목만 잠겼다" defaultValue="card">
        <TxRadio value="card" label="카드" />
        <TxRadio value="bank" label="계좌이체 (준비 중)" disabled />
        <TxRadio value="phone" label="휴대폰" />
      </TxRadioGroup>
    </div>
  )
};

/** `<form>` 안에서 그냥 제출된다. 이름은 묶음이 이어 준다. */
export const InForm: Story = {
  parameters: noControls,
  render: function InFormStory() {
    const [sent, setSent] = useState("—");

    return (
      <form
        className="flex max-w-sm flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSent([...new FormData(event.currentTarget).entries()].map(([key, value]) => `${key}=${value}`).join(", ") || "(빈 값)");
        }}
      >
        <TxRadioGroup legend="결제 수단" name="pay" defaultValue="card">
          {OPTIONS}
        </TxRadioGroup>

        <button type="submit" className="tx-button" data-variant="primary">
          <span className="tx-button__label">보내기</span>
        </button>

        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">보낸 것: {sent}</p>
      </form>
    );
  }
};
