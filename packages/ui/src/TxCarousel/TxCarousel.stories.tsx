import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxCarousel } from "./TxCarousel";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

/**
 * 카탈로그는 **네트워크 없이도 같은 모습**이어야 한다. 사진 대신 색 판을 그려 넣는다.
 */
const Slide = ({ n, tone }: { n: number; tone: string }) => (
  <div className="flex h-40 items-center justify-center text-2xl font-semibold text-white" style={{ backgroundColor: tone }}>
    {n}
  </div>
);

const TONES = ["#0ea5e9", "#8b5cf6", "#f97316", "#10b981", "#ef4444"];
const SLIDES = TONES.map((tone, at) => <Slide key={tone} n={at + 1} tone={tone} />);

const meta = {
  title: "Data/TxCarousel",
  component: TxCarousel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "여러 장을 옆으로 넘겨 보는 자리.",
          "",
          "```tsx",
          'import { TxCarousel } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxCarousel label="추천 상품">',
          '  <img src="/a.jpg" alt="여름 신상" />',
          '  <img src="/b.jpg" alt="세일" />',
          "</TxCarousel>",
          "```",
          "",
          "**자식 하나가 한 장이다.**",
          "",
          "### 넘기는 것은 브라우저의 스크롤이다",
          "",
          "`scroll-snap` 이 장을 딱딱 맞춰 세운다. 그래서 **스와이프 · 휠 · 관성 · 키보드가 공짜**고,",
          "화살표와 점은 그 스크롤을 부르는 버튼일 뿐이다. 손으로 밀어 넘겨도 점이 따라온다.",
          "",
          '스크롤바는 감춰 두었다 — 점과 화살표가 "어디쯤인지" 를 이미 말하므로 두 벌이 된다.',
          "",
          "### 마우스로도 끌어 넘긴다",
          "",
          "손가락은 원래 된다 — 브라우저의 스크롤이라 스와이프가 공짜다. 마우스에는 그것이 없어서",
          "`drag` 로 만들어 두었다(기본 켜짐). **4px 을 넘게 끌어야 시작하므로** 누르기와",
          "글자 긁기를 방해하지 않는다.",
          "",
          "### 기본은 양 끝에서 멈춘다. `loop` 를 주면 끝없이 돈다",
          "",
          "화살표가 **양 끝에서 잠기는 것**이 기본이다 — 어디쯤인지가 그것으로 보인다.",
          "",
          "`loop` 를 켜면 **앞뒤에 장을 복제해 붙인다.** 마지막에서 처음으로 갈 때도",
          "**되감기지 않고 가던 방향으로 계속 흐른다.** 복제 자리에 서면 같은 그림의 진짜 장으로",
          "소리 없이 옮겨 놓으므로, 보는 사람에게는 **끝이 없는 띠**다.",
          "",
          "복제는 **읽히지도 눌리지도 않는다** — 같은 장이 두 번 세어지지 않게. 점도 진짜 개수만큼만 있다.",
          "",
          "`autoPlay` 는 `loop` 와 무관하게 끝에서 처음으로 돌아간다 — 안 그러면 영영 멈춰 있다.",
          "",
          "### 저절로 넘기려면 멈출 수 있어야 한다",
          "",
          "`autoPlay` 를 켜면 **멈춤 버튼이 함께 생긴다** (WCAG 2.2.2). 얹거나 초점이 가도 멈추고,",
          "움직임을 줄여 달라고 한 사람에게는 **멈춘 채로 시작**하며 넘길 때도 미끄러지지 않는다.",
          "`TxTicker` 와 같은 규약이고, `controls={false}` 는 버튼을 **감출 뿐 없애지 않는다.**",
          "",
          "### 폭은 소비자가 정한다",
          "",
          "이 컴포넌트는 **자기 폭을 정하지 않는다.** 놓인 자리를 그대로 채우므로",
          '`className="w-full"` 은 대개 하는 일이 없다 — 좁히거나 한계를 두려면',
          "`max-w-*` 를 주거나 감싼 자리의 폭을 정한다. `className` 은 **덧붙는다**(교체 아님).",
          "",
          "### 한 화면에 여러 장",
          "",
          "`perView={3}` 이면 세 장이 보인다. **틈을 빼고 나누므로** 마지막 장이 잘리지 않는다.",
          "",
          "**반응형이 필요하면 prop 대신 토큰을 쓴다** — `--tx-carousel-per-view` 를 미디어 쿼리로",
          "바꾸면 된다(prop 은 인라인으로 실려 CSS 를 이긴다). 옆 장이 살짝 보이게 하는 식으로",
          "폭을 직접 정하고 싶으면 `--tx-carousel-item` 을 덮는다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { perView: 1, loop: false, drag: true, arrows: true, dots: true, autoPlay: false, interval: 3000, controls: true, label: "슬라이드", className: "max-w-96" },
  argTypes: {
    perView: { control: { type: "number", min: 1, max: 5 } },
    loop: { control: "boolean" },
    drag: { control: "boolean" },
    arrows: { control: "boolean" },
    dots: { control: "boolean" },
    autoPlay: { control: "boolean" },
    controls: { control: "boolean" },
    interval: { control: { type: "number", step: 500 } },
    label: { control: "text" },
    className: { control: "text", description: "`.tx-carousel` 에 덧붙는다 (교체 아님). **폭도 여기서 준다**" }
  }
} satisfies Meta<typeof TxCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => <TxCarousel {...args}>{SLIDES}</TxCarousel>
};

/** 화살표 · 점 · 스와이프 셋 다 같은 스크롤을 부른다. **손으로 밀어 봐도 점이 따라온다.** */
export const Default: Story = {
  parameters: noControls,
  render: () => (
    <TxCarousel className="max-w-96" label="추천 상품">
      {SLIDES}
    </TxCarousel>
  )
};

/** **`autoPlay` 를 켜면 멈춤 버튼이 함께 생긴다.** 얹거나 초점이 가도 멈춘다. */
export const AutoPlay: Story = {
  parameters: noControls,
  render: () => (
    <TxCarousel className="max-w-96" autoPlay interval={2000} label="배너">
      {SLIDES}
    </TxCarousel>
  )
};

/** `perView` 로 한 화면에 몇 장을 보일지 정한다. **틈을 빼고 나눠서 잘리지 않는다.** */
export const ManyPerView: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-6">
      <TxCarousel className="max-w-[32rem]" perView={2}>
        {SLIDES}
      </TxCarousel>
      <TxCarousel className="max-w-[32rem]" perView={3} style={vars({ "--tx-carousel-gap": "0.5rem" })}>
        {SLIDES}
      </TxCarousel>

      {/* 폭을 직접 정하면 옆 장이 살짝 보인다 */}
      <TxCarousel className="max-w-[32rem]" style={vars({ "--tx-carousel-item": "80%" })}>
        {SLIDES}
      </TxCarousel>
    </div>
  )
};

/**
 * **끝없이 돈다.** 마지막에서 다음을 눌러도 되감기지 않고 가던 방향으로 이어진다 —
 * 앞뒤에 복제를 붙여 두었기 때문이다. 화살표도 잠기지 않는다.
 */
export const Loop: Story = {
  parameters: noControls,
  render: () => (
    <TxCarousel className="max-w-96" loop>
      {SLIDES}
    </TxCarousel>
  )
};

/** 화살표와 점을 끄면 **스와이프만 남는다.** 스크롤은 그대로 살아 있다. */
export const NoControls: Story = {
  parameters: noControls,
  render: () => (
    <TxCarousel className="max-w-96" arrows={false} dots={false}>
      {SLIDES}
    </TxCarousel>
  )
};

/** 한 장뿐이면 넘길 것이 없다 — **화살표도 점도 그리지 않는다.** */
export const SingleSlide: Story = {
  parameters: noControls,
  render: () => (
    <TxCarousel className="max-w-96">
      <Slide n={1} tone={TONES[0]!} />
    </TxCarousel>
  )
};

/** 밖에서 번호를 쥐는 자리. 썸네일을 눌러 큰 장을 넘긴다. */
export const Controlled: StoryObj = {
  parameters: noControls,
  render: function ControlledStory() {
    const [at, setAt] = useState(0);

    return (
      <div className="flex max-w-96 flex-col gap-3">
        <TxCarousel index={at} onChange={setAt} dots={false}>
          {SLIDES}
        </TxCarousel>

        <div className="flex gap-2">
          {TONES.map((tone, i) => (
            <button key={tone} type="button" onClick={() => setAt(i)} className="h-10 w-10 rounded" style={{ backgroundColor: tone, outline: i === at ? "2px solid currentColor" : undefined, outlineOffset: 2 }} aria-label={`${i + 1}번째 장`} />
          ))}
        </div>
      </div>
    );
  }
};
