import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxForm } from "../TxForm";
import { TxLoading } from "../TxLoading";
import { TxCard } from "./TxCard";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Layout/TxCard",
  component: TxCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "내용을 담는 상자. **테두리 · 모서리 · 그림자 · 여백을 한 자리에서 정한다.**",
          "",
          "```tsx",
          'import { TxCard } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxCard title="서버 상태">',
          "  <p>정상</p>",
          "  <TxCard.Footer>마지막 확인 3분 전</TxCard.Footer>",
          "</TxCard>;",
          "```",
          "",
          "- `title` 은 `ReactNode` 다. 안 주면 제목 줄을 그리지 않는다",
          "- **`TxCard.Footer` 는 그냥 내용 안에 둔다.** 카드가 자식을 뒤져 찾아내지 않는다",
          "- `collapsible` 을 주면 접을 수 있다. **접어도 내용을 지우지 않고 감추기만 한다** —",
          "  안에 치던 폼 값이 살아남는다",
          "- `collapsed` 를 주면 controlled 다. 콜백을 받고도 안 바꾸면 접히지 않는다",
          "",
          "**하는 일은 상자와 슬롯, 접기까지다.**",
          "",
          "- 로딩 표시는 `TxLoading` 이 한다 — 같은 일을 두 곳이 하면 모양이 갈린다",
          "- 링크는 내용 안에 직접 넣는다. **카드가 라우터를 알 이유가 없다**",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    title: { control: "text" },
    collapsible: { control: "boolean" },
    collapsed: { control: false },
    defaultCollapsed: { control: "boolean" },
    onChangeCollapsed: { control: false },
    collapseLabel: { control: "text" },
    expandLabel: { control: "text" },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-card` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { title: "서버 상태", collapsible: false, defaultCollapsed: false, className: "max-w-sm" },
  render: (args) => (
    <TxCard {...args}>
      <p className="text-sm">지난 5분 동안 오류가 없었다.</p>
      <TxCard.Footer className="text-xs">마지막 확인 3분 전</TxCard.Footer>
    </TxCard>
  )
};

/** 제목 · 내용 · 푸터. 셋 다 있어도 되고 없어도 된다. */
export const Slots: Story = {
  parameters: noControls,
  args: { title: "제목" },
  render: () => (
    <div className="flex flex-col gap-4">
      <TxCard title="제목과 푸터" className="max-w-sm">
        <p className="text-sm">가운데가 내용이다.</p>
        <TxCard.Footer className="text-xs">아래가 푸터다</TxCard.Footer>
      </TxCard>

      <TxCard title="제목만" className="max-w-sm">
        <p className="text-sm">푸터가 없으면 선도 없다.</p>
      </TxCard>

      <TxCard className="max-w-sm">
        <p className="text-sm">제목이 없으면 제목 줄을 아예 그리지 않는다.</p>
      </TxCard>
    </div>
  )
};

/** 제목도 요소다. 배지나 상태 표시를 붙일 수 있다. */
export const TitleNode: Story = {
  parameters: noControls,
  args: { title: "제목" },
  render: () => (
    <TxCard
      className="max-w-sm"
      title={
        <span className="flex items-center gap-2">
          결제 서버
          <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">점검</span>
        </span>
      }
    >
      <p className="text-sm">오늘 02:00 부터 점검 중이다.</p>
    </TxCard>
  )
};

/**
 * **접어도 내용을 지우지 않는다.** 아래 칸에 아무거나 친 뒤 접었다 펴 보라 —
 * 치던 값이 그대로 있다.
 */
export const Collapsible: Story = {
  parameters: noControls,
  args: { title: "제목" },
  render: () => (
    <TxCard title="설정" collapsible className="max-w-sm">
      <TxForm>
        <TxForm.Input caption="메모" placeholder="여기에 무언가 쳐 보라" />
      </TxForm>
    </TxCard>
  )
};

/** 처음부터 접어 둘 수 있다. 잘 안 보는 항목을 접어 두는 자리다. */
export const DefaultCollapsed: Story = {
  parameters: noControls,
  args: { title: "제목" },
  render: () => (
    <div className="flex flex-col gap-3">
      <TxCard title="자주 보는 것" collapsible className="max-w-sm">
        <p className="text-sm">펼쳐진 채 시작한다.</p>
      </TxCard>
      <TxCard title="가끔 보는 것" collapsible defaultCollapsed className="max-w-sm">
        <p className="text-sm">접힌 채 시작한다.</p>
      </TxCard>
    </div>
  )
};

/**
 * `collapsed` 를 주면 **값의 주인은 소비자**다. 아래 카드는 잠겨 있어 버튼을 눌러도 안 접힌다.
 */
export const Controlled: Story = {
  parameters: noControls,
  args: { title: "제목" },
  render: function ControlledStory() {
    const [collapsed, setCollapsed] = useState(false);
    const [locked, setLocked] = useState(true);

    return (
      <div className="flex max-w-sm flex-col gap-3">
        <TxCard title="잠긴 카드" collapsible collapsed={collapsed} onChangeCollapsed={(next) => !locked && setCollapsed(next)}>
          <p className="text-sm">잠금을 풀어야 접힌다.</p>
        </TxCard>

        <TxButton label={locked ? "잠금 풀기" : "다시 잠그기"} variant="secondary" onClick={() => setLocked((prev) => !prev)} />
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
          collapsed = {String(collapsed)} · {locked ? "잠김" : "풀림"}
        </div>
      </div>
    );
  }
};

/**
 * **로딩은 카드가 하지 않는다.** `TxLoading` 을 내용 안에 넣는다 —
 * 원본은 카드가 스켈레톤을 직접 그렸는데, 같은 일을 두 곳이 하면 모양이 갈린다.
 */
export const Loading: Story = {
  parameters: noControls,
  args: { title: "제목" },
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);

    return (
      <div className="flex max-w-sm flex-col gap-3">
        <TxCard title="오늘 처리량">
          <div className="relative min-h-24">
            <TxLoading visible={loading} />
            {!loading && <p className="text-sm">1,204 건</p>}
          </div>
        </TxCard>

        <TxButton label={loading ? "다 불러왔다" : "다시 불러온다"} variant="secondary" onClick={() => setLoading((prev) => !prev)} />
      </div>
    );
  }
};

/** 여러 장을 나란히 놓는 자리. 여백과 모서리가 같아지는 것이 이 컴포넌트의 값이다. */
export const Grid: Story = {
  parameters: noControls,
  args: { title: "제목" },
  render: () => (
    <div className="grid max-w-3xl gap-4 md:grid-cols-3">
      {["결제", "정산", "출금"].map((name) => (
        <TxCard key={name} title={name}>
          <p className="text-sm">오늘 {name} 건수</p>
          <strong className="text-2xl">{name.length * 137}</strong>
          <TxCard.Footer className="text-xs">3분 전 갱신</TxCard.Footer>
        </TxCard>
      ))}
    </div>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  args: { title: "제목" },
  render: () => (
    <div className="flex flex-col gap-4">
      <TxCard title="여백이 넓고 모서리가 둥글다" className="max-w-sm" style={vars({ "--tx-card-padding": "2rem", "--tx-card-radius": "1.5rem" })}>
        <p className="text-sm">--tx-card-padding · --tx-card-radius</p>
      </TxCard>

      <TxCard title="그림자 없이 선만" className="max-w-sm" style={vars({ "--tx-card-shadow": "none", "--tx-card-padding": "0.75rem" })}>
        <p className="text-sm">--tx-card-shadow: none</p>
      </TxCard>
    </div>
  )
};
