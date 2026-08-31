import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxCard } from "../TxCard";
import { TxForm } from "../TxForm";
import { TxGrid } from "./TxGrid";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

/** 칸이 어디까지인지 보이라고 두는 상자. 컴포넌트의 일부가 아니다. */
const Box = ({ children }: { children?: React.ReactNode }) => <div className="rounded border border-dashed p-3 text-sm">{children}</div>;

const meta = {
  title: "Layout/TxGrid",
  component: TxGrid,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "칸을 나눠 담는 자리. 폼을 2단·3단으로 앉힐 때 쓴다.",
          "",
          "```tsx",
          'import { TxGrid } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxGrid columns={2}>",
          '  <TxForm.Input caption="이름" />',
          '  <TxForm.Input caption="전화" />',
          '  <TxGrid.Item span="full">',
          '    <TxForm.Textarea caption="메모" />',
          "  </TxGrid.Item>",
          "</TxGrid>;",
          "```",
          "",
          "### 좁아지면 알아서 접힌다 — 미디어 쿼리가 없다",
          "",
          "칸 하나가 `--tx-grid-min`(기본 `14rem`)보다 좁아질 상황이면 브라우저가 칸 수를 줄인다.",
          "**화면 크기를 재지 않으므로 놓인 자리의 폭에 반응한다** — 같은 코드를 사이드바 안에",
          "넣으면 거기 폭에 맞춰 접힌다. 창을 좁혀 보면 바로 보인다.",
          "",
          "### `TxFlex` 와 무엇이 다른가",
          "",
          "| | `TxGrid` | `TxFlex` |",
          "| --- | --- | --- |",
          "| 하는 일 | **칸이 맞아떨어진다** | 한 줄로 늘어놓는다 |",
          "| 맞는 자리 | 폼 2단·3단, 카드 격자 | 버튼 줄, 태그 묶음 |",
          "",
          "여러 칸을 차지할 자리만 `TxGrid.Item` 으로 감싼다 — **한 칸짜리는 그냥 자식으로 둔다.**",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { columns: 2 },
  argTypes: {
    columns: { control: { type: "number", min: 1, max: 6 } },
    gap: { control: "text" },
    children: { control: false },
    className: { control: "text", description: "`.tx-grid` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <TxGrid {...args}>
      {Array.from({ length: 6 }, (_, index) => (
        <Box key={index}>칸 {index + 1}</Box>
      ))}
    </TxGrid>
  )
};

/** 두 칸 · 세 칸. **창을 좁히면 알아서 줄어든다.** */
export const Columns: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-6">
      <TxGrid columns={2}>
        {Array.from({ length: 4 }, (_, index) => (
          <Box key={index}>2단 · {index + 1}</Box>
        ))}
      </TxGrid>

      <TxGrid columns={3}>
        {Array.from({ length: 6 }, (_, index) => (
          <Box key={index}>3단 · {index + 1}</Box>
        ))}
      </TxGrid>
    </div>
  )
};

/**
 * **화면이 아니라 놓인 자리의 폭에 반응한다.** 아래 둘은 `columns={2}` 로 같은데,
 * 좁은 쪽은 한 칸으로 접혀 있다 — 미디어 쿼리였다면 둘 다 두 칸이었을 것이다.
 */
export const FitsItsPlace: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex gap-4">
      <div style={{ inlineSize: "18rem" }}>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">좁은 자리 (18rem)</p>
        <TxGrid columns={2}>
          <Box>하나</Box>
          <Box>둘</Box>
        </TxGrid>
      </div>

      <div style={{ inlineSize: "34rem" }}>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">넓은 자리 (34rem)</p>
        <TxGrid columns={2}>
          <Box>하나</Box>
          <Box>둘</Box>
        </TxGrid>
      </div>
    </div>
  )
};

/** 여러 칸을 차지할 자리만 `TxGrid.Item` 으로 감싼다. `"full"` 은 한 줄을 통째로 쓴다. */
export const Spanning: Story = {
  parameters: noControls,
  render: () => (
    <TxGrid columns={3} className="max-w-3xl">
      <Box>한 칸</Box>
      <TxGrid.Item span={2}>
        <Box>두 칸</Box>
      </TxGrid.Item>
      <TxGrid.Item span="full">
        <Box>한 줄 전체</Box>
      </TxGrid.Item>
      <Box>한 칸</Box>
      <Box>한 칸</Box>
      <Box>한 칸</Box>
    </TxGrid>
  )
};

/** **흔한 쓰임 — 폼 2단.** 긴 것만 한 줄을 쓴다. */
export const FormLayout: Story = {
  parameters: noControls,
  render: () => (
    <TxCard title="파트너 등록" className="max-w-2xl">
      <TxForm>
        <TxGrid columns={2}>
          <TxForm.Input caption="이름" />
          <TxForm.Input caption="사업자번호" />
          <TxForm.Input caption="담당자" />
          <TxForm.Input caption="전화" />
          <TxGrid.Item span="full">
            <TxForm.Input caption="주소" />
          </TxGrid.Item>
          <TxGrid.Item span="full">
            <TxForm.Textarea caption="메모" />
          </TxGrid.Item>
        </TxGrid>
      </TxForm>
    </TxCard>
  )
};

/** 칸 하나의 최소 폭과 사이는 CSS 변수로 바꾼다. */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-6">
      <TxGrid columns={3} style={vars({ "--tx-grid-min": "8rem" })}>
        {Array.from({ length: 6 }, (_, index) => (
          <Box key={index}>좁게 접힌다 · {index + 1}</Box>
        ))}
      </TxGrid>

      <TxGrid columns={3} gap="2rem">
        {Array.from({ length: 3 }, (_, index) => (
          <Box key={index}>사이가 넓다 · {index + 1}</Box>
        ))}
      </TxGrid>
    </div>
  )
};
