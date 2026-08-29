import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxCollapsible } from "./TxCollapsible";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Layout/TxCollapsible",
  component: TxCollapsible,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "눌러서 접고 펴는 한 덩이.",
          "",
          "```tsx",
          'import { TxCollapsible } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxCollapsible title="배송 안내">',
          "  주문 후 2~3일 안에 받아보실 수 있습니다.",
          "</TxCollapsible>;",
          "```",
          "",
          "### 브라우저가 대부분을 맡는다",
          "",
          "네이티브 `<details>` 다. 그래서 여닫기 · 키보드 · 스크린리더가 상태를 읽는 것은 물론,",
          "**접힌 내용까지 찾아 주는 페이지 내 검색(⌘F)** 이 그냥 된다 — 손으로 짠 접기는",
          "`aria-expanded` 까지는 해도 검색까지는 못 한다. 접힌 글이 검색에 안 걸리면",
          "FAQ 나 약관에서는 없는 글이나 마찬가지다.",
          "",
          "접었다 펴는 **움직임은 아는 브라우저에서만** 붙는다(`::details-content`).",
          "모르는 브라우저에서는 즉시 열린다 — 기능이 빠지는 것이지 깨지는 것이 아니다.",
          "",
          "### 값의 주인",
          "",
          "**`open` 을 주면 소비자가 값의 주인이 된다.** 그때는 `onOpenChange` 를 받아",
          "직접 바꿔야 열린다 — 누른다고 저 혼자 열리지 않는다. 그냥 두고 싶으면 `defaultOpen` 만 준다.",
          "",
          "여러 덩이를 묶어 **하나씩만 열리게** 하려면 `TxAccordion` 을 쓴다 — 이것을 부품으로 쓴다.",
          "",
          "### `TxCard` 와 무엇이 다른가",
          "",
          "`TxCard` 도 접힌다. **가르는 기준은 하나다 — 접는 것이 목적인가.**",
          "",
          "| | `TxCollapsible` | `TxCard` |",
          "| --- | --- | --- |",
          "| 본업 | **접기** | **상자** — 그림자 · `Footer` 슬롯 |",
          "| 접힌 글을 ⌘F 로 찾기 | **된다** | 안 된다 |",
          "| 제목 줄에 다른 버튼 놓기 | 누르면 접혀 버린다 | 쉽다 |",
          "",
          "**FAQ · 약관처럼 글이 접히는 자리는 이쪽이다.** 제목 줄에 새로고침 · 더보기 같은",
          "동작이 여럿 붙는 패널이라면 `TxCard` 가 맞는다 — 여기 제목 줄은 누르는 곳이라,",
          "그 안에 버튼을 놓으면 그 버튼을 눌러도 접힌다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { title: "배송 안내", children: "주문 후 2~3일 안에 받아보실 수 있습니다. 도서·산간 지역은 하루가 더 걸립니다." },
  argTypes: {
    title: { control: "text" },
    open: { control: false, description: "주면 controlled — `Playground` 에서는 비워 둔다" },
    defaultOpen: { control: "boolean" },
    disabled: { control: "boolean" },
    hideMarker: { control: "boolean" },
    onOpenChange: { control: false },
    children: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-collapsible` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxCollapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {};

/** 그냥 두면 스스로 여닫는다. `defaultOpen` 으로 펼친 채 시작할 수 있다. */
export const Basic: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-2">
      <TxCollapsible title="배송은 얼마나 걸리나요?">주문 후 2~3일 안에 받아보실 수 있습니다.</TxCollapsible>
      <TxCollapsible title="처음부터 펼쳐 두기" defaultOpen>
        defaultOpen 을 주면 펼쳐진 채로 시작합니다.
      </TxCollapsible>
    </div>
  )
};

/**
 * **접힌 글도 ⌘F 로 찾힌다.** 아래를 전부 접어 두고 `보증` 을 찾아 보라 —
 * 브라우저가 그 덩이를 스스로 펼쳐서 보여 준다.
 *
 * 손으로 짠 접기는 이걸 못 한다. 접힌 글이 검색에 안 걸리면 FAQ 나 약관에서는
 * 없는 글이나 마찬가지다.
 */
export const FindInPage: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-2">
      <TxCollapsible title="배송">주문 후 2~3일 안에 받아보실 수 있습니다.</TxCollapsible>
      <TxCollapsible title="교환·반품">수령 후 7일 이내에 신청할 수 있습니다.</TxCollapsible>
      <TxCollapsible title="품질">구입일로부터 1년간 무상 보증을 제공합니다.</TxCollapsible>
    </div>
  )
};

/**
 * **`open` 을 주면 값의 주인이 소비자다.** 아래 왼쪽은 눌러도 열리지 않는다 —
 * `onOpenChange` 를 받고도 값을 안 바꿨기 때문이다. 오른쪽은 받아서 바꾼다.
 */
export const Controlled: Story = {
  parameters: noControls,
  render: function ControlledStory() {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <TxFlex>
          <TxButton label={open ? "밖에서 접기" : "밖에서 펼치기"} onClick={() => setOpen((current) => !current)} />
        </TxFlex>

        {/* 열린 쪽에 맞춰 닫힌 쪽까지 늘어나면 컴포넌트 탓으로 보인다 */}
        <div className="grid items-start gap-3 sm:grid-cols-2">
          <TxCollapsible title="값을 안 바꾸는 쪽" open={false} onOpenChange={() => {}}>
            여기는 열리지 않습니다.
          </TxCollapsible>

          <TxCollapsible title="값을 받아 바꾸는 쪽" open={open} onOpenChange={setOpen}>
            눌러도, 위 버튼으로도 열립니다.
          </TxCollapsible>
        </div>
      </div>
    );
  }
};

/** `disabled` 는 여는 것만 막는다. **이미 열려 있었다면 내용을 뺏지 않는다.** */
export const Disabled: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-2">
      <TxCollapsible title="아직 열 수 없습니다" disabled>
        보이지 않습니다.
      </TxCollapsible>
      <TxCollapsible title="열린 채로 잠갔습니다" defaultOpen disabled>
        접을 수는 없지만 내용은 그대로 보입니다.
      </TxCollapsible>
    </div>
  )
};

/**
 * 화살표를 없애고 직접 그릴 수 있다. `title` 은 요소도 받으므로 무엇이든 들어간다.
 */
export const CustomSummary: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-2">
      <TxCollapsible
        hideMarker
        title={
          <span className="flex items-center gap-2">
            <span aria-hidden>📦</span>
            <span>배송 안내</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">2~3일</span>
          </span>
        }
      >
        주문 후 2~3일 안에 받아보실 수 있습니다.
      </TxCollapsible>
    </div>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <TxCollapsible title="기본" defaultOpen>
        내용
      </TxCollapsible>
      <TxCollapsible title="테두리 없이 넓게" defaultOpen style={vars({ "--tx-collapsible-border-color": "transparent", "--tx-collapsible-padding": "1.25rem", "--tx-collapsible-title-size": "1.0625rem" })}>
        내용
      </TxCollapsible>
      <TxCollapsible title="천천히 열린다" defaultOpen style={vars({ "--tx-collapsible-duration": "600ms" })}>
        내용
      </TxCollapsible>
    </div>
  )
};
