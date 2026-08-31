import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxFlex } from "../TxFlex";
import { TxTag } from "./TxTag";
import type { TxTagVariant } from "./TxTag.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const VARIANTS: TxTagVariant[] = ["neutral", "info", "success", "warning", "danger"];

const meta = {
  title: "Feedback/TxTag",
  component: TxTag,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "작은 이름표. 상태 · 개수 · 분류를 한 낱말로 붙인다.",
          "",
          "```tsx",
          'import { TxTag } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxTag>초안</TxTag>",
          '<TxTag variant="success">완료</TxTag>',
          '<TxTag variant="warning" dot>대기</TxTag>',
          '<TxTag variant="danger" appearance="outline">실패</TxTag>',
          "```",
          "",
          "### 갈래는 `TxAlert` 과 같은 어휘다",
          "",
          "`info` · `success` · `warning` · `danger` 넷이 `TxAlert` · `TxToast` 와 같고,",
          "**태그에만 `neutral` 이 하나 더 있다.** 색이 뜻을 갖지 않는 라벨 — 개수, 분류,",
          "그냥 이름표 — 이 태그에는 흔하고, 그런 자리에 `info`(브랜드색)를 쓰면",
          "안 해도 될 강조가 붙는다. 그래서 **기본이 `neutral`** 이다.",
          "",
          "### 배경을 갈래색으로 꽉 채우지 않는다",
          "",
          "`solid` 를 두지 않았다. 갈래색은 `success` · `warning` 처럼 **라이트와 다크에서",
          "밝기가 뒤집히는 것**이 있어서, 그 위에 얹을 글자색을 한 벌로 정할 수 없다 —",
          "다크에서 밝은 노랑 위에 흰 글자를 얹으면 읽히지 않는다.",
          "**글자는 늘 갈래색이고 바탕은 옅게만 섞는다.** 어느 모드에서도 대비가 유지된다.",
          "",
          "### 누를 수도, 지울 수도 있다",
          "",
          "`onClick` 을 주면 **글자가 눌리고**, `onRemove` 를 주면 **지우기(×)** 가 붙는다.",
          "둘 다 안 주면 읽기만 하는 이름표다.",
          "",
          "둘을 함께 줘도 **`<button>` 안의 `<button>` 이 되지 않는다** — 태그 전체가 아니라",
          "글자만 버튼이 되고 지우기는 그 옆에 따로 선다. 통째로 감쌌다면 못 쓰는 마크업이 됐다.",
          "",
          "### 혼자 서는 이름표다",
          "",
          "무언가에 얹히는 알림 점·개수는 **`TxBadge`** 가 갖는다.",
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
    className: { control: "text", description: "`.tx-tag` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxTag>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {};

/** 다섯 갈래. **넷은 `TxAlert` 과 같은 어휘고 `neutral` 이 하나 더 있다.** */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxTag>초안</TxTag>
      <TxTag variant="info">신규</TxTag>
      <TxTag variant="success">완료</TxTag>
      <TxTag variant="warning">대기</TxTag>
      <TxTag variant="danger">실패</TxTag>
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
          <TxTag key={variant} variant={variant}>
            soft
          </TxTag>
        ))}
      </TxFlex>
      <TxFlex>
        {VARIANTS.map((variant) => (
          <TxTag key={variant} variant={variant} appearance="outline">
            outline
          </TxTag>
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
      <TxTag dot>초안</TxTag>
      <TxTag variant="info" dot>
        진행중
      </TxTag>
      <TxTag variant="success" dot>
        완료
      </TxTag>
      <TxTag variant="danger" dot appearance="outline">
        실패
      </TxTag>
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
              <TxTag variant={variant} dot>
                {label}
              </TxTag>
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
      결제 수단이 <TxTag variant="warning">곧 만료</TxTag> 상태입니다. 새 카드를 등록하면 <TxTag variant="success">정상</TxTag> 으로 바뀝니다.
    </p>
  )
};

/**
 * `onRemove` 를 주면 지우기(×)가 붙는다. **걸러내기 조건처럼 넣고 빼는 자리**에 쓴다.
 */
export const Removable: Story = {
  parameters: noControls,
  render: function RemovableStory() {
    const [tags, setTags] = useState(["서울", "경기", "부산"]);

    return (
      <div className="flex flex-col gap-3">
        <TxFlex>
          {tags.map((tag) => (
            <TxTag key={tag} variant="info" onRemove={() => setTags((current) => current.filter((one) => one !== tag))} removeLabel={`${tag} 빼기`}>
              {tag}
            </TxTag>
          ))}
          {tags.length === 0 && <span className="text-sm text-slate-500 dark:text-slate-400">모두 지웠습니다</span>}
        </TxFlex>

        <TxFlex>
          <button type="button" className="tx-button" data-variant="secondary" onClick={() => setTags(["서울", "경기", "부산"])}>
            <span className="tx-button__label">되돌리기</span>
          </button>
        </TxFlex>
      </div>
    );
  }
};

/**
 * `onClick` 을 주면 글자가 눌린다. **둘을 함께 줘도 버튼 안에 버튼이 생기지 않는다** —
 * 글자만 버튼이 되고 지우기는 그 옆에 따로 선다.
 */
export const Interactive: Story = {
  parameters: noControls,
  render: function InteractiveStory() {
    const [picked, setPicked] = useState<string | null>(null);

    return (
      <div className="flex flex-col gap-3">
        <TxFlex>
          {["VIP", "신규", "휴면"].map((name) => (
            <TxTag key={name} variant={picked === name ? "info" : "neutral"} onClick={() => setPicked(name)} onRemove={() => setPicked(null)} removeLabel={`${name} 빼기`}>
              {name}
            </TxTag>
          ))}
        </TxFlex>

        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">고른 것: {picked ?? "—"}</p>
      </div>
    );
  }
};

/** 겉모습은 CSS 변수로 바꾼다. **`--tx-tag-accent` 하나가 바탕·글자·점을 함께 정한다.** */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxTag variant="info">기본</TxTag>
      <TxTag dot style={vars({ "--tx-tag-accent": "rebeccapurple" })}>
        accent 만
      </TxTag>
      <TxTag variant="info" style={vars({ "--tx-tag-radius": "0.25rem", "--tx-tag-font-size": "0.875rem", "--tx-tag-padding": "0.25rem 0.625rem" })}>
        네모나고 크게
      </TxTag>
    </TxFlex>
  )
};
