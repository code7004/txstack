import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxTicker } from "./TxTicker";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const NOTICES = ["점검 안내 — 9월 3일 02:00~04:00", "새 기능이 추가되었습니다", "추석 연휴 배송 일정 안내", "비밀번호를 90일마다 바꿔 주세요"];

const PRICES = [
  ["BTC", "62,145,000", "+1.2%"],
  ["ETH", "3,410,000", "-0.4%"],
  ["SOL", "214,300", "+3.8%"],
  ["XRP", "812", "+0.1%"]
];

const meta = {
  title: "Feedback/TxTicker",
  component: TxTicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "저절로 움직이는 공지 줄.",
          "",
          "```tsx",
          'import { TxTicker } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "// 세로 — 한 줄씩 올라간다",
          "<TxTicker>",
          '  <a href="/notice/1">점검 안내 — 9월 3일 02:00~04:00</a>',
          '  <a href="/notice/2">새 기능이 추가되었습니다</a>',
          "</TxTicker>",
          "",
          "// 가로 — 끊임없이 흐른다",
          "<TxTicker flow speed={40}>",
          "  <span>BTC 62,145,000</span>",
          "  <span>ETH 3,410,000</span>",
          "</TxTicker>",
          "```",
          "",
          "**자식 하나가 항목 하나다.** 링크든 글자든 그대로 넣는다.",
          "",
          "### 멈출 수 있어야 저절로 움직여도 된다",
          "",
          "저절로 움직이는 것에는 멈출 수단이 있어야 한다는 것이 접근성 기준(WCAG 2.2.2)이다.",
          "그래서 멈춤 버튼은 **없앨 수 없다** — `controls={false}` 는 화면에서 감출 뿐이고,",
          "Tab 으로 오면 제자리에 나타난다.",
          "",
          "버튼 말고도 **얹거나 초점이 가면 멈춘다** — 읽는 동안 지나가 버리면 안 된다.",
          "손을 떼면 다시 돈다. 다만 **버튼에 손을 얹는 것은 멈춤이 아니다**:",
          "그렇게 두면 버튼을 눌러도 아무 일이 없는 것처럼 보인다.",
          "",
          "### 움직임을 줄여 달라고 한 사람에게는 멈춘 채로 시작한다",
          "",
          "`prefers-reduced-motion` 을 켠 사람에게는 첫 항목이 그대로 서 있는다.",
          "**못 보게 막는 것이 아니라** 시작하지 않을 뿐이라, 재생을 누르면 돈다.",
          "그때도 한 줄씩 미끄러지지 않고 바로 바뀐다.",
          "",
          "### 가로는 속도로 받는다",
          "",
          "`speed` 는 **초당 몇 픽셀**이다. 시간으로 받으면 항목이 둘일 때와 열일 때의",
          "읽는 속도가 달라진다 — 폭을 재서 시간을 우리가 낸다.",
          "",
          "### 버튼을 화면에서 감출 수 있다",
          "",
          "`controls={false}` 를 주면 줄만 남는다 — 공지 한 줄만 두고 싶은 자리를 위한 것이다.",
          "감춰도 **얹거나 초점이 가면 멈추는 것은 그대로**고, 버튼 자체도 Tab 이 닿으면 돌아온다.",
          "",
          "### 항목이 하나면 버튼도 없다",
          "",
          "세로는 바꿀 것이 없으면 움직이지 않으므로 버튼을 그리지 않는다.",
          "가로는 하나여도 흐르므로 버튼이 있다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { flow: false, interval: 2000, speed: 40, controls: true },
  argTypes: {
    flow: { control: "boolean" },
    controls: { control: "boolean" },
    interval: { control: { type: "number", step: 500 } },
    speed: { control: { type: "number", step: 10 } },
    className: { control: "text", description: "`.tx-ticker` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxTicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div className="w-96">
      <TxTicker {...args}>
        {NOTICES.map((text) => (
          <a key={text} href="#none" className="hover:underline">
            {text}
          </a>
        ))}
      </TxTicker>
    </div>
  )
};

/** 한 줄씩 올라간다. **마지막 다음은 되감기지 않고 첫 줄로 이어진다.** */
export const Vertical: Story = {
  parameters: noControls,
  render: () => (
    <div className="w-96">
      <TxTicker interval={2000}>
        {NOTICES.map((text) => (
          <a key={text} href="#none" className="hover:underline">
            {text}
          </a>
        ))}
      </TxTicker>
    </div>
  )
};

/** 끊임없이 흐른다. **`speed` 는 초당 픽셀이라 항목이 늘어도 읽는 속도가 같다.** */
export const Flow: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <TxTicker flow speed={40}>
        {PRICES.map(([name, price, change]) => (
          <span key={name} className="tabular-nums">
            <b>{name}</b> {price} <span className={change.startsWith("+") ? "text-red-600" : "text-blue-600"}>{change}</span>
          </span>
        ))}
      </TxTicker>

      <TxTicker flow speed={120}>
        {PRICES.map(([name, price]) => (
          <span key={name} className="tabular-nums">
            <b>{name}</b> {price}
          </span>
        ))}
      </TxTicker>
    </div>
  )
};

/**
 * `controls={false}` — 줄만 남는다. **Tab 을 눌러 보면** 버튼이 제자리에 나타난다.
 */
export const HiddenControls: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <TxTicker controls={false} interval={2000}>
        {NOTICES.map((text) => (
          <span key={text}>{text}</span>
        ))}
      </TxTicker>

      <TxTicker controls={false} flow>
        {PRICES.map(([name, price]) => (
          <span key={name} className="tabular-nums">
            <b>{name}</b> {price}
          </span>
        ))}
      </TxTicker>
    </div>
  )
};

/** 세로는 바꿀 것이 없으면 멈춘 채고 버튼도 없다. 가로는 하나여도 흐른다. */
export const SingleItem: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <TxTicker>
        <span>오늘은 공지가 하나뿐입니다</span>
      </TxTicker>

      <TxTicker flow>
        <span>오늘은 공지가 하나뿐입니다</span>
      </TxTicker>
    </div>
  )
};

/** 줄 높이 · 흐름 간격을 토큰으로 바꾼다. */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <TxTicker interval={2000} style={vars({ "--tx-ticker-line": "2.75rem", "--tx-ticker-slide": "0.9s" })} className="rounded-md bg-slate-100 px-3 dark:bg-slate-800">
        {NOTICES.map((text) => (
          <span key={text}>{text}</span>
        ))}
      </TxTicker>

      <TxTicker flow style={vars({ "--tx-ticker-gap": "6rem" })}>
        {PRICES.map(([name, price]) => (
          <span key={name} className="tabular-nums">
            <b>{name}</b> {price}
          </span>
        ))}
      </TxTicker>
    </div>
  )
};
