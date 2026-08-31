import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxDivider } from "./TxDivider";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Layout/TxDivider",
  component: TxDivider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "가르는 선.",
          "",
          "```tsx",
          'import { TxDivider } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxDivider />",
          '<TxDivider orientation="vertical" />',
          "<TxDivider>또는</TxDivider>",
          "```",
          "",
          "### 글자가 없으면 `<hr>` 하나다",
          "",
          "브라우저가 이미 **가르는 것**으로 읽어 주므로 `role` 을 손으로 달지 않는다.",
          "글자를 주면 그 글자가 내용이 되고 **선은 장식**이 되어 좌우(또는 위아래)로 갈라진다 —",
          "그때는 `role=\"separator\"` 를 달지 **않는다.** 그 역할은 자식을 장식으로 보게 만들어서,",
          "달면 정작 읽혀야 할 글자가 안 읽힌다.",
          "",
          "### 세로 선은 놓인 자리만큼 늘어난다",
          "",
          "`TxFlex` 같은 줄 안에서는 이웃한 것들의 높이에 맞춰지고, 늘릴 기준이 없는 자리에서는",
          "**한 줄 높이를 밑값으로 둔다** — 안 그러면 높이 0 이 되어 아무것도 안 보인다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { orientation: "horizontal" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    children: { control: "text", description: "선 가운데에 놓을 글자" },
    className: { control: "text", description: "`.tx-divider` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-md">
      <p className="text-sm">위</p>
      <TxDivider {...args} />
      <p className="text-sm">아래</p>
    </div>
  )
};

/** 민 선. 위아래 여백은 `--tx-divider-spacing` 이 정한다. */
export const Basic: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-md text-sm">
      <p>주문 정보</p>
      <TxDivider />
      <p>배송 정보</p>
      <TxDivider />
      <p>결제 정보</p>
    </div>
  )
};

/** 글자를 주면 선이 그 글자를 비켜 간다. **선이 나누는 이유를 말해 줄 때** 쓴다. */
export const WithLabel: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-md text-sm">
      <p>아이디로 로그인</p>
      <TxDivider>또는</TxDivider>
      <p>간편 로그인</p>
    </div>
  )
};

/** 세로 선은 이웃한 것들의 높이에 맞춰진다. */
export const Vertical: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex items-center text-sm">
      <span>주문 8213</span>
      <TxDivider orientation="vertical" />
      <span>결제 완료</span>
      <TxDivider orientation="vertical" />
      <span>2026-08-31</span>
    </div>
  )
};

/** 세로에도 글자를 넣을 수 있다. 선이 위아래로 갈라진다. */
export const VerticalWithLabel: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex items-stretch gap-2 text-sm">
      <div className="flex flex-col justify-center gap-1 py-6">
        <p>아이디로</p>
        <p>로그인</p>
      </div>
      <TxDivider orientation="vertical">또는</TxDivider>
      <div className="flex flex-col justify-center gap-1 py-6">
        <p>간편</p>
        <p>로그인</p>
      </div>
    </div>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-md text-sm">
      <p>기본</p>
      <TxDivider />
      <p>두껍고 넓게</p>
      <TxDivider style={vars({ "--tx-divider-thickness": "2px", "--tx-divider-spacing": "2rem" })} />
      <p>글자를 크게</p>
      <TxDivider style={vars({ "--tx-divider-label-size": "1rem", "--tx-divider-label-gap": "1.5rem" })}>여기까지 읽었습니다</TxDivider>
      <p>끝</p>
    </div>
  )
};
