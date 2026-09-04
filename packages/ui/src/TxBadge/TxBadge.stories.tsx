import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxTag } from "../TxTag";
import { TxBadge } from "./TxBadge";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

/** 종 모양. 무언가에 얹히는 것을 보이려고 두는 것이라 컴포넌트의 일부가 아니다. */
const Bell = () => (
  <span aria-hidden style={{ fontSize: "1.5rem", lineHeight: 1 }}>
    🔔
  </span>
);

const meta = {
  title: "Feedback/TxBadge",
  component: TxBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "무언가에 붙는 알림 점·개수.",
          "",
          "```tsx",
          'import { TxBadge } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxBadge count={3}>",
          '  <TxButton label="알림" variant="secondary" />',
          "</TxBadge>;",
          "",
          '<TxBadge dot label="새 소식 있음"><IconBell /></TxBadge>;',
          "```",
          "",
          "### `TxTag` 와 무엇이 다른가",
          "",
          "| | `TxBadge` | `TxTag` |",
          "| --- | --- | --- |",
          "| 어디에 | **무언가에 얹힌다** | 혼자 선다 |",
          "| 무엇을 | 알림 점 · 개수 | 상태 · 분류 이름표 |",
          "",
          "이름이 갈리는 자리라 정해 두었다 — MUI · Chakra · Ant Design 이 `Badge` 라 부르는",
          "것은 이쪽(알림 점·카운트)이고, 상태 라벨은 `Tag`(Ant Design) 또는 `Chip`(MUI) 이다.",
          "",
          "### 숫자만으로는 무엇의 수인지 알 수 없다",
          "",
          '기본 안내는 `"알림 3개"` 인데, 무엇의 알림인지는 **`label` 로 준다** —',
          '`"읽지 않은 메일 3개"`. 보이는 숫자는 장식이라 따로 읽히지 않는다.',
          "",
          "**감싼 것의 자리를 밀지 않는다.** 모서리에 겹쳐 앉고, 알림 위를 눌러도",
          "감싼 버튼이 눌린다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { count: 3, variant: "danger", placement: "top-right" },
  argTypes: {
    count: { control: { type: "number", min: 0, max: 200 } },
    max: { control: { type: "number", min: 1 } },
    dot: { control: "boolean" },
    showZero: { control: "boolean" },
    variant: { control: "inline-radio", options: ["info", "success", "warning", "danger"] },
    placement: { control: "inline-radio", options: ["top-right", "top-left", "bottom-right", "bottom-left"] },
    label: { control: "text", description: "스크린리더가 읽을 말" },
    children: { control: false },
    className: { control: "text", description: "`.tx-badge` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <TxBadge {...args}>
      <TxButton label="알림" variant="secondary" />
    </TxBadge>
  )
};

/** 수 · 점 · 넘긴 수. **감싼 것의 자리를 밀지 않는다.** */
export const Basic: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxBadge count={3}>
        <Bell />
      </TxBadge>
      <TxBadge count={120}>
        <Bell />
      </TxBadge>
      <TxBadge dot label="새 소식 있음">
        <Bell />
      </TxBadge>
      <TxBadge count={0}>
        <Bell />
      </TxBadge>
    </TxFlex>
  )
};

/** 네 갈래. **`success` · `warning` 은 밝기가 뒤집혀서 글자색이 따로 정해진다.** */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      {(["info", "success", "warning", "danger"] as const).map((variant) => (
        <TxBadge key={variant} count={8} variant={variant} label={`${variant} 8개`}>
          <TxButton label={variant} variant="secondary" />
        </TxBadge>
      ))}
    </TxFlex>
  )
};

/** 네 모서리 중 하나에 앉는다. */
export const Placement: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      {(["top-right", "top-left", "bottom-right", "bottom-left"] as const).map((placement) => (
        <TxBadge key={placement} count={5} placement={placement}>
          <TxButton label={placement} variant="secondary" />
        </TxBadge>
      ))}
    </TxFlex>
  )
};

/** **알림 위를 눌러도 감싼 버튼이 눌린다.** 뱃지가 클릭을 가로채지 않는다. */
export const DoesNotBlockClicks: Story = {
  parameters: noControls,
  render: function DoesNotBlockClicksStory() {
    const [count, setCount] = useState(3);

    return (
      <div className="flex flex-col gap-3">
        <TxFlex>
          <TxBadge count={count} label={`읽지 않은 알림 ${count}개`}>
            <TxButton label="다 읽음" variant="secondary" onClick={() => setCount(0)} />
          </TxBadge>
          <TxButton label="하나 더" onClick={() => setCount((current) => current + 1)} />
        </TxFlex>

        <p className="text-sm text-slate-500 dark:text-slate-400">숫자 위를 눌러도 버튼이 눌린다.</p>
      </div>
    );
  }
};

/** 자식이 없으면 홀로 선다. **다만 혼자 서는 이름표는 `TxTag` 가 맞는다.** */
export const Standalone: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxBadge count={12} label="대기 12개" />
      <TxBadge dot variant="success" label="정상" />
      <TxTag variant="success">완료</TxTag>
    </TxFlex>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxBadge count={9}>
        <Bell />
      </TxBadge>
      <TxBadge count={9} style={vars({ "--tx-badge-size": "1.5rem", "--tx-badge-font-size": "0.8125rem" })}>
        <Bell />
      </TxBadge>
      <TxBadge count={9} style={vars({ "--tx-badge-offset": "0rem" })}>
        <Bell />
      </TxBadge>
    </TxFlex>
  )
};
