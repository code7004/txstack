import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import { TxFlex } from ".";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Layout/TxFlex",
  component: TxFlex,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "가로로 늘어놓는 자리. `display: flex` 와 간격 기본값을 준다.",
          "",
          "```tsx",
          'import { TxFlex } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxFlex>",
          '  <TxButton label="취소" variant="ghost" />',
          '  <TxButton label="저장" />',
          "</TxFlex>;",
          "```",
          "",
          "간격 말고는 아무것도 정하지 않는다. 방향·정렬은 직접 준다.",
          "",
          "- `className` 은 `.tx-flex` 에 덧붙는다. **방향을 바꿔도 간격이 남는다.**",
          "- 간격은 CSS 변수 `--tx-flex-gap` 으로 바꾼다 (`Gap`).",
          "- 자식은 직속으로 들어간다 — 감싸는 요소가 없어서 flex 배치가 그대로 통한다.",
          "",
          "화면 골격·리사이즈·패널이 필요하면 `TxLayout` 을 쓴다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다. 나머지는 비교용이다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    className: { control: "text", description: "`.tx-flex` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxFlex>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 컨트롤을 받지 않는 비교용 스토리에 붙인다. */
const noControls = { controls: { disable: true } };

const Box = ({ children }: { children: ReactNode }) => <div className="rounded bg-slate-200 px-4 py-2 text-sm dark:bg-slate-700">{children}</div>;
const boxes = [1, 2, 3];

/**
 * 컨트롤 패널에서 `className` 을 바꿔가며 확인한다.
 *
 * `flex-col` · `items-center` · `justify-between` 같은 값을 넣어보면 **간격이 그대로 남는 것**을 볼 수 있다.
 */
export const Playground: Story = {
  args: { className: "" },
  render: (args) => (
    <TxFlex {...args}>
      {boxes.map((n) => (
        <Box key={n}>{n}</Box>
      ))}
    </TxFlex>
  )
};

/** 아무것도 주지 않은 상태. 가로 배치 + 간격 `0.5rem`. */
export const Basic: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      {boxes.map((n) => (
        <Box key={n}>{n}</Box>
      ))}
    </TxFlex>
  )
};

/**
 * 방향은 `className` 으로 준다.
 *
 * **셋 다 간격이 같다.** 예전에는 `className` 을 주는 순간 간격이 0 이 됐다 —
 * 방향만 바꾸려다 간격을 잃지 않는 것이 이 스토리에서 볼 것이다.
 */
export const Direction: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex gap-10 text-sm">
      {[
        { label: "기본", cls: "" },
        { label: "flex-col", cls: "flex-col" },
        { label: "flex-col-reverse", cls: "flex-col-reverse" }
      ].map(({ label, cls }) => (
        <div key={label} className="flex flex-col gap-2">
          <TxFlex className={cls}>
            {boxes.map((n) => (
              <Box key={n}>{n}</Box>
            ))}
          </TxFlex>
          <code className="text-xs text-slate-500 dark:text-slate-400">{label}</code>
        </div>
      ))}
    </div>
  )
};

/**
 * 간격은 CSS 변수 하나로 바꾼다.
 *
 * ```css
 * .tx-flex {
 *   --tx-flex-gap: 1rem;
 * }
 * ```
 *
 * 아래는 스토리라 인라인으로 줬다. 실제로는 CSS 파일 한 곳에 적으면 전체에 적용된다.
 */
export const Gap: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      {["0.5rem", "1rem", "2rem"].map((gap) => (
        <div key={gap} className="flex items-center gap-4">
          <TxFlex style={vars({ "--tx-flex-gap": gap })}>
            {boxes.map((n) => (
              <Box key={n}>{n}</Box>
            ))}
          </TxFlex>
          <code className="text-xs text-slate-500 dark:text-slate-400">{gap}</code>
        </div>
      ))}
      <p className="text-xs text-slate-500 dark:text-slate-400">첫 줄이 기본값이다.</p>
    </div>
  )
};

/**
 * 정렬도 `className` 이다. 높이가 있는 자리에서 세로 정렬을 준 모습.
 *
 * 자식이 직속이라 `justify-between` 이 그대로 통한다 — 감싸는 요소가 하나 끼면 무너진다.
 */
export const Align: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="h-24 items-center justify-between rounded border border-slate-300 px-3 dark:border-slate-700">
      <Box>왼쪽</Box>
      <Box>오른쪽</Box>
    </TxFlex>
  )
};
