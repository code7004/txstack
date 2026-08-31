import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxProgress } from "./TxProgress";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Feedback/TxProgress",
  component: TxProgress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "얼마나 왔는지 보여 주는 막대.",
          "",
          "```tsx",
          'import { TxProgress } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxProgress value={72} label="업로드" />',
          '<TxProgress value={3} max={5} variant="success" showValue />',
          "```",
          "",
          "### 얼마나 왔는지 아는 것만 그린다",
          "",
          "끝이 언제인지 **모르는 기다림은 `TxLoading` · `TxSpinner`** 가 맡는다.",
          "진행률을 모르는데 막대를 그리면 **어디까지 왔는지 아는 척**이 된다.",
          "",
          "| | `TxProgress` | `TxSpinner` · `TxLoading` |",
          "| --- | --- | --- |",
          "| 아는 것 | **몇 %인지 안다** | 모른다 |",
          "| 맞는 자리 | 업로드 · 단계 진행 · 사용량 | 응답을 기다리는 동안 |",
          "",
          "### 값이 범위를 넘어도 깨지지 않는다",
          "",
          "`max` 보다 크면 가득 차고 음수면 비며, **스크린리더에도 잘린 값이 간다** —",
          "화면과 읽히는 값이 어긋나면 안 된다.",
          "",
          "`showValue` 에 함수를 주면 글자를 직접 만든다. 그때는 `3/5` 처럼 읽어야 하므로",
          "`aria-valuetext` 도 그 글자로 나간다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { value: 60, max: 100, variant: "info", showValue: true },
  argTypes: {
    value: { control: { type: "range", min: -20, max: 130 } },
    max: { control: { type: "number", min: 0 } },
    variant: { control: "inline-radio", options: ["info", "success", "warning", "danger"] },
    showValue: { control: "boolean" },
    label: { control: "text", description: "스크린리더가 막대의 이름으로 읽는다" },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-progress` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-md">
      <TxProgress {...args} />
    </div>
  )
};

/** 네 갈래. **`TxAlert` · `TxToast` · `TxTag` 와 같은 어휘다.** */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <TxProgress value={35} label="기본" showValue />
      <TxProgress value={100} variant="success" label="완료" showValue />
      <TxProgress value={82} variant="warning" label="용량" showValue />
      <TxProgress value={95} variant="danger" label="한도" showValue />
    </div>
  )
};

/** **흔한 쓰임 — 파일 올리기.** 값이 바뀌면 막대가 미끄러진다. */
export const Uploading: Story = {
  parameters: noControls,
  render: function UploadingStory() {
    const [value, setValue] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
      if (!running) return;

      const timer = setInterval(() => {
        setValue((current) => {
          if (current >= 100) {
            setRunning(false);
            return 100;
          }
          return current + 7;
        });
      }, 220);

      return () => clearInterval(timer);
    }, [running]);

    return (
      <div className="flex max-w-md flex-col gap-3">
        <TxProgress value={value} variant={value >= 100 ? "success" : "info"} label="보고서 올리는 중" showValue />

        <TxFlex>
          <TxButton
            label={running ? "멈추기" : value >= 100 ? "다시" : "올리기"}
            onClick={() => {
              if (value >= 100) setValue(0);
              setRunning((on) => !on);
            }}
          />
        </TxFlex>
      </div>
    );
  }
};

/** 퍼센트가 아니라 **개수**로 읽어야 할 때가 있다. 함수를 주면 글자를 직접 만든다. */
export const CustomValue: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <TxProgress value={3} max={5} label="단계" showValue={(value, max) => `${value}/${max} 단계`} />
      <TxProgress value={7} max={10} variant="success" label="완료한 항목" showValue={(value, max) => `${value}개 / ${max}개`} />
    </div>
  )
};

/** 밖에서 온 값이 범위를 넘는 일은 흔하다. **화면도 읽히는 값도 잘린 값으로 맞춘다.** */
export const OutOfRange: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <TxProgress value={150} label="150 을 줬다" showValue />
      <TxProgress value={-20} label="-20 을 줬다" showValue />
      <TxProgress value={5} max={0} label="max 가 0 이다" showValue />
    </div>
  )
};

/** 글자 없이 막대만 두어도 된다. 그때도 스크린리더는 값을 읽는다. */
export const BarOnly: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-md">
      <TxProgress value={45} label="읽는 중" />
    </div>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. **`--tx-progress-accent` 하나가 바탕과 막대를 함께 정한다.** */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <TxProgress value={60} showValue />
      <TxProgress value={60} showValue style={vars({ "--tx-progress-height": "1rem", "--tx-progress-radius": "0.25rem" })} />
      <TxProgress value={60} showValue style={vars({ "--tx-progress-accent": "rebeccapurple" })} />
    </div>
  )
};
