import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxForm } from "../TxForm";
import { TxGrid } from "../TxGrid";
import { TxNumberInput } from "./TxNumberInput";

const meta = {
  title: "Form/TxNumberInput",
  component: TxNumberInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "숫자를 넣고 올리고 내리는 자리.",
          "",
          "```tsx",
          'import { TxNumberInput } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxNumberInput value={qty} onChange={setQty} min={1} max={99} />",
          '<TxNumberInput defaultValue={12000} step={1000} suffix="원" />',
          "```",
          "",
          "### `type=\"number\"` 를 쓰지 않는다",
          "",
          "쓰면 셋이 걸린다.",
          "",
          "- **휠을 굴리면 값이 바뀐다** — 페이지를 스크롤하다 숫자가 틀어진다",
          "- 브라우저마다 증감 버튼 모양이 달라 **토큰으로 맞출 수 없다**",
          "- **천 단위 콤마를 넣으면 값이 비어 버린다**",
          "",
          "대신 `inputMode=\"decimal\"` 로 모바일 숫자 키패드를 부르고, `role=\"spinbutton\"` 으로",
          "값과 범위를 알린다. **↑↓ 로 움직이는 것도 그 규약이다.**",
          "",
          "### 타이핑하는 동안에는 콤마를 안 넣는다",
          "",
          "넣으면 **커서가 튄다.** 포커스가 빠질 때 끊어 주고 소수 자릿수도 그때 맞춘다.",
          "범위를 벗어난 값도 그때 가둔다.",
          "",
          "겉은 `TxInput` 의 상자를 그대로 쓴다 — 폼에서 다른 칸과 높이가 어긋나지 않는다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { defaultValue: 1234, step: 1 },
  argTypes: {
    defaultValue: { control: "number" },
    value: { control: false, description: "주면 controlled — `Playground` 에서는 비워 둔다" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    precision: { control: "number" },
    thousandSeparator: { control: "boolean" },
    suffix: { control: "text" },
    hideStepper: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { control: false },
    className: { control: "text", description: "`.tx-number-input` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxNumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div style={{ inlineSize: "14rem" }}>
      <TxNumberInput {...args} />
    </div>
  )
};

/**
 * **타이핑하다 나가 보라.** 치는 동안에는 콤마가 없다가, 포커스가 빠지면 끊긴다 —
 * 치는 동안 끊으면 커서가 튄다.
 */
export const Formatting: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3" style={{ inlineSize: "14rem" }}>
      <TxNumberInput defaultValue={1234567} />
      <TxNumberInput defaultValue={1234567} thousandSeparator={false} />
      <TxNumberInput defaultValue={3} precision={2} />
      <TxNumberInput defaultValue={12000} step={1000} suffix="원" />
    </div>
  )
};

/** **범위는 포커스가 빠질 때 가둔다.** `120` 을 치고 나가 보라. 끝에 닿으면 버튼도 잠긴다. */
export const Range: Story = {
  parameters: noControls,
  render: function RangeStory() {
    const [value, setValue] = useState<number | undefined>(1);

    return (
      <div className="flex flex-col gap-3" style={{ inlineSize: "14rem" }}>
        <TxNumberInput value={value} onChange={setValue} min={1} max={10} />
        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">값: {value ?? "(빈 값)"}</p>
      </div>
    );
  }
};

/** 소수도 다룬다. `step` 에서 자릿수를 짐작하므로 `precision` 을 따로 안 줘도 된다. */
export const Decimals: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3" style={{ inlineSize: "14rem" }}>
      <TxNumberInput defaultValue={0.5} step={0.1} />
      <TxNumberInput defaultValue={1.25} step={0.01} suffix="%" />
    </div>
  )
};

/** 증감 버튼을 없애거나 잠글 수 있다. **버튼이 없어도 ↑↓ 는 그대로 된다.** */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3" style={{ inlineSize: "14rem" }}>
      <TxNumberInput defaultValue={5} hideStepper />
      <TxNumberInput defaultValue={5} disabled />
      <TxNumberInput defaultValue={5} readOnly />
    </div>
  )
};

/** **흔한 쓰임 — 폼.** `TxInput` 의 상자를 그대로 써서 다른 칸과 높이가 맞는다. */
export const InForm: Story = {
  parameters: noControls,
  render: () => (
    <TxForm style={{ maxInlineSize: "36rem" }}>
      <TxGrid columns={2}>
        <TxForm.Input caption="상품명" />
        <TxForm.Field caption="수량">
          <TxNumberInput defaultValue={1} min={1} max={99} />
        </TxForm.Field>
        <TxForm.Field caption="단가">
          <TxNumberInput defaultValue={12000} step={1000} suffix="원" />
        </TxForm.Field>
        <TxForm.Input caption="비고" />
      </TxGrid>
    </TxForm>
  )
};
