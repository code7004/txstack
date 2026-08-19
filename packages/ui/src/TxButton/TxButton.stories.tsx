import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxButton } from ".";

const VARIANTS = ["primary", "secondary", "danger", "ghost", "text"] as const;
const COLORS = ["blue", "green", "amber", "red", "purple", "slate"] as const;

const meta = {
  title: "Form/TxButton",
  component: TxButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Tailwind 기반 버튼.",
          "",
          "- `variant` 는 의미(primary·danger 등), `color` 는 팔레트다. **둘 다 주면 `color` 가 이긴다.**",
          "- `onClick` 이 Promise 를 반환하면 해제될 때까지 자동으로 로딩 상태가 되고 중복 클릭이 막힌다.",
          "- `onEnter` 는 Enter 키에만 반응하는 별도 핸들러다."
        ].join("\n")
      }
    }
  },
  args: { label: "확인", variant: "primary" },
  argTypes: {
    variant: { control: "select", options: VARIANTS, description: "의미 기반 스타일" },
    color: { control: "select", options: COLORS, description: "팔레트 기반 스타일. 지정 시 variant 를 덮는다" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    theme: { control: false, description: "themeMerge 로 부분 덮어쓰기" },
    loading: { control: false },
    onClick: { control: false },
    onEnter: { control: false }
  }
} satisfies Meta<typeof TxButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본형. 상단 컨트롤로 props 를 바꿔볼 수 있다. */
export const 기본: Story = {};

/** `variant` 5종. 의미를 기준으로 고른다. */
export const Variant: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((v) => (
        <TxButton key={v} {...args} variant={v} label={v} />
      ))}
    </div>
  )
};

/** `color` 는 팔레트 20종 중 하나를 고른다. `variant` 보다 우선한다. */
export const Color: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {COLORS.map((c) => (
        <TxButton key={c} {...args} color={c} label={c} />
      ))}
    </div>
  )
};

/**
 * `onClick` 이 Promise 를 반환하면 해제될 때까지 스피너가 뜨고 버튼이 잠긴다.
 * 연타해도 한 번만 실행된다.
 */
export const 비동기_로딩: Story = {
  args: {
    label: "3초 걸리는 작업",
    onClick: () => new Promise((resolve) => setTimeout(resolve, 3000))
  }
};

/** `disabled` 는 클릭과 로딩을 모두 막는다. */
export const 비활성: Story = {
  args: { label: "비활성", disabled: true }
};

/**
 * `theme` 으로 기본 클래스를 부분 교체한다. 전체를 갈아엎지 않고 필요한 키만 준다.
 * `className` 과 달리 컴포넌트 내부 구조까지 손댈 수 있다.
 */
export const 테마_덮어쓰기: Story = {
  args: {
    label: "커스텀",
    theme: { variants: { primary: "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black" } }
  }
};
