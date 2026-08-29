import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxFlex } from "../TxFlex";
import { TxBadge } from "./TxBadge";
import type { TxBadgeVariant } from "./TxBadge.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const VARIANTS: TxBadgeVariant[] = ["neutral", "info", "success", "warning", "danger"];

const meta = {
  title: "Feedback/TxBadge",
  component: TxBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "작은 이름표. 상태 · 개수 · 분류를 한 낱말로 붙인다.",
          "",
          "```tsx",
          'import { TxBadge } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxBadge>초안</TxBadge>",
          '<TxBadge variant="success">완료</TxBadge>',
          '<TxBadge variant="warning" dot>대기</TxBadge>',
          '<TxBadge variant="danger" appearance="outline">실패</TxBadge>',
          "```",
          "",
          "### 갈래는 `TxAlert` 과 같은 어휘다",
          "",
          "`info` · `success` · `warning` · `danger` 넷이 `TxAlert` · `TxToast` 와 같고,",
          "**뱃지에만 `neutral` 이 하나 더 있다.** 색이 뜻을 갖지 않는 라벨 — 개수, 분류,",
          "그냥 이름표 — 이 뱃지에는 흔하고, 그런 자리에 `info`(브랜드색)를 쓰면",
          "안 해도 될 강조가 붙는다. 그래서 **기본이 `neutral`** 이다.",
          "",
          "### 배경을 갈래색으로 꽉 채우지 않는다",
          "",
          "`solid` 를 두지 않았다. 갈래색은 `success` · `warning` 처럼 **라이트와 다크에서",
          "밝기가 뒤집히는 것**이 있어서, 그 위에 얹을 글자색을 한 벌로 정할 수 없다 —",
          "다크에서 밝은 노랑 위에 흰 글자를 얹으면 읽히지 않는다.",
          "**글자는 늘 갈래색이고 바탕은 옅게만 섞는다.** 어느 모드에서도 대비가 유지된다.",
          "",
          "### 누르는 것이 아니다",
          "",
          "**뱃지는 읽는 것만 한다.** 지우거나 고를 수 있는 이름표가 필요하면 그건 다른 물건이다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { children: "완료", variant: "neutral", appearance: "soft" },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    appearance: { control: "inline-radio", options: ["soft", "outline"] },
    dot: { control: "boolean" },
    children: { control: "text" },
    className: { control: "text", description: "`.tx-badge` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {};

/** 다섯 갈래. **넷은 `TxAlert` 과 같은 어휘고 `neutral` 이 하나 더 있다.** */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxBadge>초안</TxBadge>
      <TxBadge variant="info">신규</TxBadge>
      <TxBadge variant="success">완료</TxBadge>
      <TxBadge variant="warning">대기</TxBadge>
      <TxBadge variant="danger">실패</TxBadge>
    </TxFlex>
  )
};

/** 테두리만 두르고 바탕을 비운다. **글자색은 그대로라 크기도 대비도 흔들리지 않는다.** */
export const Outline: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3">
      <TxFlex>
        {VARIANTS.map((variant) => (
          <TxBadge key={variant} variant={variant}>
            soft
          </TxBadge>
        ))}
      </TxFlex>
      <TxFlex>
        {VARIANTS.map((variant) => (
          <TxBadge key={variant} variant={variant} appearance="outline">
            outline
          </TxBadge>
        ))}
      </TxFlex>
    </div>
  )
};

/** 점은 갈래를 거드는 표시다. **뜻은 글자가 나른다** — 점만으로 알리지 않는다. */
export const Dot: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxBadge dot>초안</TxBadge>
      <TxBadge variant="info" dot>
        진행중
      </TxBadge>
      <TxBadge variant="success" dot>
        완료
      </TxBadge>
      <TxBadge variant="danger" dot appearance="outline">
        실패
      </TxBadge>
    </TxFlex>
  )
};

/** 흔한 쓰임 — 표의 상태 칸. 줄 높이를 밀지 않는다. */
export const InTable: Story = {
  parameters: noControls,
  render: () => (
    <table className="w-full max-w-lg border-collapse text-sm">
      <tbody>
        {(
          [
            ["8213", "success", "완료"],
            ["8214", "warning", "대기"],
            ["8215", "danger", "실패"],
            ["8216", "neutral", "초안"]
          ] as const
        ).map(([id, variant, label]) => (
          <tr key={id} className="border-b">
            <td className="px-3 py-2 font-mono">{id}</td>
            <td className="px-3 py-2">
              <TxBadge variant={variant} dot>
                {label}
              </TxBadge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
};

/** 글 안에 그대로 놓인다. 줄 높이를 밀지 않고 가운데에 앉는다. */
export const InText: Story = {
  parameters: noControls,
  render: () => (
    <p className="max-w-lg text-sm leading-7">
      결제 수단이 <TxBadge variant="warning">곧 만료</TxBadge> 상태입니다. 새 카드를 등록하면 <TxBadge variant="success">정상</TxBadge> 으로 바뀝니다.
    </p>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. **`--tx-badge-accent` 하나가 바탕·글자·점을 함께 정한다.** */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxBadge variant="info">기본</TxBadge>
      <TxBadge dot style={vars({ "--tx-badge-accent": "rebeccapurple" })}>
        accent 만
      </TxBadge>
      <TxBadge variant="info" style={vars({ "--tx-badge-radius": "0.25rem", "--tx-badge-font-size": "0.875rem", "--tx-badge-padding": "0.25rem 0.625rem" })}>
        네모나고 크게
      </TxBadge>
    </TxFlex>
  )
};
