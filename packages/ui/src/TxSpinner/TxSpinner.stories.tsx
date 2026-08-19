import type { Meta, StoryObj } from "@storybook/react-vite";
import TxSpinner from ".";

const meta = {
  title: "Feedback/TxSpinner",
  component: TxSpinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "회전하는 SVG 스피너. `TxButton` 의 로딩 표시 기본값이기도 하다.",
          "",
          "- `size` 는 CSS 길이 문자열이다(기본 `2em`). 부모 글자 크기를 따라가게 하려면 `em` 을 쓴다.",
          "- 색은 `currentColor` 를 따른다. 부모에 `text-*` 를 주면 스피너 색이 바뀐다.",
          "- 나머지 props 는 `<svg>` 로 그대로 전달된다."
        ].join("\n")
      }
    }
  },
  argTypes: { size: { control: "text" }, className: { control: "text" } }
} satisfies Meta<typeof TxSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 크기(`2em`). */
export const 기본: Story = {};

/** `size` 비교. */
export const 크기: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {["1em", "2em", "3em", "48px"].map((s) => (
        <div key={s} className="flex flex-col items-center gap-1">
          <TxSpinner size={s} className="w-auto" />
          <span className="text-xs text-slate-500">{s}</span>
        </div>
      ))}
    </div>
  )
};

/** 색은 `currentColor` 다. 부모의 `text-*` 를 따라간다. */
export const 색상: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {["text-blue-500", "text-emerald-500", "text-red-500"].map((c) => (
        <div key={c} className={c}>
          <TxSpinner className="w-auto" />
        </div>
      ))}
    </div>
  )
};
