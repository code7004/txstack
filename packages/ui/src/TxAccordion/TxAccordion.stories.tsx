import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxAccordion } from "./TxAccordion";
import type { TxAccordionItem, TxAccordionValue } from "./TxAccordion.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const FAQ: TxAccordionItem[] = [
  { title: "배송은 얼마나 걸리나요?", content: "주문 후 2~3일 안에 받아보실 수 있습니다. 도서·산간 지역은 하루가 더 걸립니다." },
  { title: "교환·반품은 어떻게 하나요?", content: "수령 후 7일 이내에 신청할 수 있습니다. 사용 흔적이 있으면 어려울 수 있습니다." },
  { title: "품질 보증이 되나요?", content: "구입일로부터 1년간 무상 보증을 제공합니다." }
];

const meta = {
  title: "Layout/TxAccordion",
  component: TxAccordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "여러 덩이를 이어 붙이고 **하나씩만 열리게** 한다.",
          "",
          "```tsx",
          'import { TxAccordion } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxAccordion",
          "  items={[",
          '    { title: "배송은 얼마나 걸리나요?", content: "2~3일 안에 받습니다." },',
          '    { title: "교환은 어떻게 하나요?", content: "7일 이내에 신청합니다." }',
          "  ]}",
          "/>;",
          "```",
          "",
          "### 덩이 하나하나는 `TxCollapsible` 이다",
          "",
          "네이티브 `<details>` 라 **접힌 글도 ⌘F 로 찾힌다.** 여기서 더하는 것은",
          "**이어 붙인 겉모습과, 열린 것을 하나로 묶어 두는 일**뿐이다.",
          "",
          "상자를 **떨어뜨려** 놓고 싶으면 `TxCollapsible` 을 그냥 여러 개 쓴다 —",
          "이쪽은 이어 붙은 목록이다.",
          "",
          "### 값은 늘 배열이다",
          "",
          "하나만 열리는 모드에서도 `onChange` 는 배열로 온다 — `[]` 아니면 `[1]`.",
          "**받는 쪽에서 타입을 좁힐 일이 없다.** 줄 때는 숫자 하나로 줘도 된다.",
          "",
          "```tsx",
          "<TxAccordion items={FAQ} defaultValue={0} />         // 첫 덩이를 열고 시작",
          "<TxAccordion items={FAQ} multiple />                  // 여럿이 함께 열린다",
          "<TxAccordion items={FAQ} value={open} onChange={setOpen} />",
          "```",
          "",
          "### 머리말로 감쌀 수 있다",
          "",
          "`headingLevel` 을 주면 제목이 그 깊이의 머리말이 되어 **스크린리더 사용자가 머리말",
          "목록으로 건너뛸 수 있다.** 기본으로 켜 두지 않은 것은 **깊이를 그 페이지의 짜임을",
          "아는 쪽이 정해야 하기 때문**이다 — `<h1>` 아래에 `<h4>` 를 놓으면 오히려 어지럽다.",
          "",
          "`TxTabs` 와 형제다. 같은 정보를 **한 번에 하나만 보여 준다**는 점이 같고,",
          "탭은 자리를 나란히 두고 이쪽은 위아래로 편다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { items: FAQ },
  argTypes: {
    items: { control: false },
    multiple: { control: "boolean" },
    value: { control: false, description: "주면 controlled — `Playground` 에서는 비워 둔다" },
    defaultValue: { control: false },
    onChange: { control: false },
    headingLevel: { control: "inline-radio", options: [undefined, 2, 3, 4, 5, 6] },
    hideMarker: { control: "boolean" },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-accordion` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-xl">
      <TxAccordion {...args} />
    </div>
  )
};

/** **하나를 열면 먼저 것이 닫힌다.** 열린 것을 다시 누르면 다 닫힌다. */
export const Basic: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-xl">
      <TxAccordion items={FAQ} />
    </div>
  )
};

/** `defaultValue` 로 하나를 열고 시작한다. 숫자 하나로 줘도 되고 배열로 줘도 된다. */
export const DefaultOpen: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-xl">
      <TxAccordion items={FAQ} defaultValue={0} />
    </div>
  )
};

/** `multiple` 이면 여럿이 함께 열린다. 먼저 것이 닫히지 않는다. */
export const Multiple: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-xl">
      <TxAccordion items={FAQ} multiple defaultValue={[0, 2]} />
    </div>
  )
};

/**
 * **값의 주인이 소비자다.** 밖에서 열고 닫을 수 있고, 지금 무엇이 열려 있는지도 안다.
 * `onChange` 는 하나만 열리는 모드에서도 배열로 온다.
 */
export const Controlled: Story = {
  parameters: noControls,
  render: function ControlledStory() {
    const [open, setOpen] = useState<TxAccordionValue>([1]);

    return (
      <div className="flex max-w-xl flex-col gap-3">
        <TxFlex>
          <TxButton label="첫째 열기" variant="secondary" onClick={() => setOpen([0])} />
          <TxButton label="다 닫기" variant="secondary" onClick={() => setOpen([])} />
        </TxFlex>

        <TxAccordion items={FAQ} value={open} onChange={setOpen} />

        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">열린 것: [{open.join(", ")}]</div>
      </div>
    );
  }
};

/** 잠근 덩이는 눌러도 열리지 않는다. **이미 열려 있었다면 내용을 뺏지 않는다.** */
export const Disabled: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-xl">
      <TxAccordion items={[FAQ[0], { ...FAQ[1], title: "아직 열 수 없습니다", disabled: true }, FAQ[2]]} />
    </div>
  )
};

/**
 * **`headingLevel` 을 주면 제목이 머리말이 된다.** 스크린리더 사용자가 머리말 목록으로
 * 건너뛸 수 있다 — 화면에 보이는 모습은 그대로다.
 */
export const Headings: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-xl">
      <h2 className="mb-2 text-lg font-bold">자주 묻는 질문</h2>
      <TxAccordion items={FAQ} headingLevel={3} />
    </div>
  )
};

/** 제목은 `ReactNode` 라 배지·아이콘이 그대로 들어간다. */
export const RichTitle: Story = {
  parameters: noControls,
  render: () => (
    <div className="max-w-xl">
      <TxAccordion
        items={[
          {
            title: (
              <span className="flex items-center gap-2">
                <span aria-hidden>📦</span>
                <span>배송</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">2~3일</span>
              </span>
            ),
            content: "주문 후 2~3일 안에 받아보실 수 있습니다."
          },
          { title: "교환·반품", content: "수령 후 7일 이내에 신청합니다." }
        ]}
      />
    </div>
  )
};

/** 겉모습은 **`TxCollapsible` 의 토큰**이 정한다. 아코디언은 이어 붙이기만 한다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <TxAccordion items={FAQ} defaultValue={0} />
      <TxAccordion items={FAQ} defaultValue={0} style={vars({ "--tx-collapsible-radius": "0", "--tx-collapsible-padding": "1.25rem", "--tx-collapsible-title-size": "1.0625rem" })} />
    </div>
  )
};
