import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxSlider } from "./TxSlider";
import type { TxSliderValue } from "./TxSlider.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Form/TxSlider",
  component: TxSlider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "값을 끌어 고르는 자리.",
          "",
          "```tsx",
          'import { TxSlider } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxSlider value={volume} onChange={setVolume} label="음량" />',
          '<TxSlider value={[10, 80]} onChange={setRange} label={["최소", "최대"]} />',
          "```",
          "",
          "### 네이티브 `<input type=\"range\">` 다",
          "",
          "그래서 **키보드(←→ · Home · End · PageUp/Down)와 스크린리더 안내**를 브라우저가 맡는다 —",
          "손으로 짠 슬라이더가 가장 자주 빠뜨리는 것이 그 둘이다. 여기서는 겉모습만 그린다.",
          "",
          "### 손잡이 둘",
          "",
          "배열을 주면 손잡이가 둘이 된다. 겹쳐 놓은 두 `<input>` 이라 **키보드도 그대로 되고**,",
          "**서로를 넘어가지 않는다** — 시작이 끝보다 커지면 값이 뒤집혀 읽힌다.",
          "",
          "이름도 둘을 준다(`label={[\"최소\", \"최대\"]}`). **둘 다 \"값\" 이라고만 하면",
          "어느 쪽을 잡고 있는지 알 수 없다.**",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { defaultValue: 40, min: 0, max: 100, step: 1, showValue: true },
  argTypes: {
    defaultValue: { control: "number" },
    value: { control: false, description: "주면 controlled — `Playground` 에서는 비워 둔다" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    showValue: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    onChange: { control: false },
    className: { control: "text", description: "`.tx-slider` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div style={{ inlineSize: "20rem" }}>
      <TxSlider {...args} />
    </div>
  )
};

/**
 * **키보드로 다뤄 보라.** Tab 으로 손잡이에 닿으면 ←→ 로 한 걸음씩,
 * Home · End 로 양 끝, PageUp/PageDown 으로 크게 움직인다 — 전부 브라우저가 한다.
 */
export const Keyboard: Story = {
  parameters: noControls,
  render: function KeyboardStory() {
    const [value, setValue] = useState<TxSliderValue>(40);

    return (
      <div className="flex flex-col gap-3" style={{ inlineSize: "20rem" }}>
        <TxSlider value={value} onChange={setValue} label="음량" showValue />
        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">값: {String(value)}</p>
      </div>
    );
  }
};

/** **손잡이가 둘이면 서로를 넘지 못한다.** 하나를 끝까지 끌어 보라. */
export const Range: Story = {
  parameters: noControls,
  render: function RangeStory() {
    const [range, setRange] = useState<TxSliderValue>([20, 70]);

    return (
      <div className="flex flex-col gap-3" style={{ inlineSize: "20rem" }}>
        <TxSlider value={range} onChange={setRange} label={["최소 가격", "최대 가격"]} showValue />
        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">값: [{Array.isArray(range) ? range.join(", ") : range}]</p>
      </div>
    );
  }
};

/** 걸음과 범위를 바꾼다. 글자도 직접 만들 수 있다. */
export const Steps: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-5" style={{ inlineSize: "20rem" }}>
      <TxSlider defaultValue={50} step={10} label="10 씩" showValue />
      <TxSlider defaultValue={2.5} min={0} max={5} step={0.5} label="0.5 씩" showValue />
      <TxSlider defaultValue={60} label="퍼센트" showValue={(value) => `${value}%`} />
      <TxSlider defaultValue={40} label="잠김" disabled showValue />
    </div>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-5" style={{ inlineSize: "20rem" }}>
      <TxSlider defaultValue={40} showValue />
      <TxSlider defaultValue={40} showValue style={vars({ "--tx-slider-track-height": "0.75rem", "--tx-slider-thumb-size": "1.5rem" })} />
      <TxSlider defaultValue={40} showValue style={vars({ "--tx-slider-fill-bg": "var(--tx-color-success)", "--tx-slider-thumb-border": "2px solid var(--tx-color-success)" })} />
    </div>
  )
};
