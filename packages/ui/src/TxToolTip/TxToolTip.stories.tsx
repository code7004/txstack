import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxTooltip } from "./TxToolTip";
import { TxButton } from "../TxButton";

const meta = {
  title: "Overlay/TxTooltip",
  component: TxTooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "hover 시 뜨는 말풍선. **컴포넌트 이름은 `TxTooltip`** 이다 (폴더명은 `TxToolTip` 이지만 export 는 소문자 t).",
          "",
          "- `tip` 이 내용, `children` 이 기준 요소다.",
          "- 화면 가장자리에서 잘리지 않도록 위치를 계산해 뒤집는다. 오른쪽 끝 예시에서 확인할 수 있다.",
          "- `delay`(기본 300ms)로 표시 지연을 조절한다. 0 이면 즉시 뜬다."
        ].join("\n")
      }
    }
  },
  args: { tip: "툴팁 내용입니다", children: null },
  argTypes: { tip: { control: "text" }, delay: { control: "number" }, width: { control: "text" }, height: { control: "text" }, theme: { control: false }, children: { control: false } }
} satisfies Meta<typeof TxTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 마우스를 올려본다. */
export const 기본: Story = {
  render: (args) => (
    <TxTooltip {...args}>
      <TxButton label="hover 해보세요" />
    </TxTooltip>
  )
};

/** `delay` 비교. 0 은 즉시, 1000 은 1초 뒤에 뜬다. */
export const 지연: Story = {
  render: (args) => (
    <div className="flex gap-3">
      {[0, 300, 1000].map((d) => (
        <TxTooltip key={d} {...args} delay={d} tip={`delay: ${d}ms`}>
          <TxButton label={`${d}ms`} variant="secondary" />
        </TxTooltip>
      ))}
    </div>
  )
};

/** 화면 가장자리에서는 잘리지 않도록 위치가 뒤집힌다. */
export const 가장자리: Story = {
  render: (args) => (
    <div className="flex justify-between">
      <TxTooltip {...args} tip="왼쪽 끝">
        <TxButton label="왼쪽" variant="ghost" />
      </TxTooltip>
      <TxTooltip {...args} tip="오른쪽 끝에서도 잘리지 않는다">
        <TxButton label="오른쪽" variant="ghost" />
      </TxTooltip>
    </div>
  )
};

/** 여러 줄 내용. `whitespace-pre-line` 이라 줄바꿈이 유지된다. */
export const 여러_줄: Story = {
  args: { tip: "첫 줄\n둘째 줄\n셋째 줄" },
  render: (args) => (
    <TxTooltip {...args}>
      <TxButton label="여러 줄" />
    </TxTooltip>
  )
};

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { base: "fixed z-[9999] rounded-none bg-purple-600 px-3 py-2 text-white shadow-lg" } },
  render: (args) => (
    <TxTooltip {...args}>
      <TxButton label="보라 툴팁" />
    </TxTooltip>
  )
};
