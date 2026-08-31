import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxCard } from "../TxCard";
import { TxTag } from "../TxTag";
import { TxScrollArea } from "./TxScrollArea";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const TERMS = Array.from({ length: 14 }, (_, index) => `제${index + 1}조 이 약관은 서비스 이용에 관한 사항을 정합니다. 회사와 이용자의 권리와 의무를 규정합니다.`);

const meta = {
  title: "Layout/TxScrollArea",
  component: TxScrollArea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "넘치는 내용을 굴려 보는 자리. **양 끝이 흐려져 더 있다는 것을 알린다.**",
          "",
          "```tsx",
          'import { TxScrollArea } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxScrollArea size="12rem" label="약관">',
          "  <p>…긴 글…</p>",
          "</TxScrollArea>;",
          "```",
          "",
          "### 흐림은 더 볼 것이 있는 쪽에만 생긴다",
          "",
          "맨 위에 있으면 **위는 또렷하고 아래만 흐리다.** 양쪽을 늘 흐리게 두면 끝에 닿았는지",
          "알 수 없다 — 그것이 이 컴포넌트가 알려 주려는 전부다.",
          "",
          "흐림은 그림자가 아니라 **`mask`** 로 그린다. 그림자로 하면 뒤에 무슨 색이 있는지",
          "알아야 하는데, 흐림은 그것을 묻지 않는다.",
          "",
          "### 스크롤 위치는 JS 가 읽는다",
          "",
          "CSS 만으로 하려면 `mask-attachment: local` 이 있어야 하는데 **어느 브라우저에도",
          "구현돼 있지 않다**(재 봤다). 스크롤 기반 애니메이션은 있지만 없는 곳에서는 흐림이",
          "통째로 사라지고, 그건 이 컴포넌트가 하는 일의 전부라 기능이 빠지는 셈이 된다.",
          "",
          "### 가짜 스크롤바를 그리지 않는다",
          "",
          "`scrollbar-width` 와 `scrollbar-color` 로 다듬기만 한다. 직접 그리면 **휠 관성 ·",
          "터치 · 접근성 설정**을 전부 다시 만들어야 하고 어느 하나는 어긋난다.",
          "",
          "### 키보드로도 굴린다",
          "",
          "기본으로 탭 정거장이 하나 생긴다 — **안에 버튼이 하나도 없으면 마우스 없이는",
          "닿을 길이 없기 때문이다.** 안에 이미 버튼·링크가 있다면 `focusable={false}` 로 끈다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { size: "12rem", orientation: "vertical", label: "약관" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    size: { control: "text" },
    focusable: { control: "boolean" },
    label: { control: "text" },
    children: { control: false },
    className: { control: "text", description: "`.tx-scroll-area` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxInlineSize: "28rem" }}>
      <TxScrollArea {...args}>
        <div className="flex flex-col gap-2 pr-3 text-sm">
          {TERMS.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </TxScrollArea>
    </div>
  )
};

/**
 * **굴려 보라.** 맨 위에서는 아래만, 가운데서는 양쪽, 맨 아래에서는 위만 흐리다.
 */
export const Vertical: Story = {
  parameters: noControls,
  render: () => (
    <TxCard title="이용약관" className="max-w-md">
      <TxScrollArea size="10rem" label="이용약관">
        <div className="flex flex-col gap-2 pr-3 text-sm">
          {TERMS.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </TxScrollArea>
    </TxCard>
  )
};

/** 가로로도 된다. 태그 줄처럼 옆으로 넘치는 자리에 쓴다. */
export const Horizontal: Story = {
  parameters: noControls,
  render: () => (
    <div style={{ maxInlineSize: "22rem" }}>
      <TxScrollArea orientation="horizontal" focusable={false}>
        <div className="flex gap-2 pb-2">
          {["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종", "강원"].map((name) => (
            <TxTag key={name} variant="info">
              {name}
            </TxTag>
          ))}
        </div>
      </TxScrollArea>
    </div>
  )
};

/** **넘치지 않으면 흐리지 않는다.** 흐릴 것이 없는데 흐리면 더 있는 줄 안다. */
export const NoOverflow: Story = {
  parameters: noControls,
  render: () => (
    <TxCard title="짧은 글" className="max-w-md">
      <TxScrollArea size="10rem" label="짧은 글">
        <p className="text-sm">두 줄뿐이라 굴릴 것이 없습니다.</p>
      </TxScrollArea>
    </TxCard>
  )
};

/** 흐림의 폭과 스크롤바 색은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex gap-4">
      {(
        [
          ["기본", {}],
          ["넓게 흐리다", { "--tx-scroll-area-fade": "4rem" }],
          ["스크롤바가 진하다", { "--tx-scroll-area-bar-color": "var(--tx-color-primary)" }]
        ] as const
      ).map(([name, style]) => (
        <div key={name} style={{ inlineSize: "12rem" }}>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{name}</p>
          <TxScrollArea size="9rem" label={name} style={vars(style as Record<`--${string}`, string>)}>
            <div className="flex flex-col gap-2 pr-3 text-sm">
              {TERMS.slice(0, 8).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </TxScrollArea>
        </div>
      ))}
    </div>
  )
};
