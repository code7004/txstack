import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxButton } from "../TxButton";
import { TxSpinner } from ".";

const meta = {
  title: "Feedback/TxSpinner",
  component: TxSpinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "로딩 중임을 알리는 **회전 아이콘 하나.** 그 이상은 하지 않는다 — 문구·오버레이·표시 여부 판단은 `TxLoading` 이 담당한다.",
          "",
          "- **아무것도 주지 않는 게 기본 사용법이다.** 크기 `1em` + `currentColor` 라 놓인 자리의 글자 크기·색에 저절로 맞는다.",
          '- `size` 는 **CSS 길이나 number(px)** 를 받는다. `size="w-6"` 처럼 클래스를 주면 안 된다 — `width` 속성값으로 들어가 무효다. 클래스로 크기를 바꾸려면 `className` 을 쓴다.',
          "- `className` 은 기본 클래스를 **교체하지 않고 병합**된다. 색만 바꿔도 회전은 남는다.",
          "- 옆에 이미 읽을 문구가 있으면 **`decorative`** 를 켠다. 스크린리더가 두 번 말하는 걸 막는다.",
          "- `prefers-reduced-motion` 에서는 **멈추지 않고 느려진다.** 멈추면 로딩 중이라는 정보 자체가 사라진다.",
          "",
          "명세: `docs/001_ui/components/TxSpinner.md`"
        ].join("\n")
      }
    }
  },
  argTypes: {
    size: { control: "text", description: 'CSS 길이 또는 number(px). 기본 `"1em"` — 부모 font-size 를 따른다' },
    decorative: { control: "boolean", description: "켜면 `role`·`aria-label` 을 빼고 `aria-hidden` 을 붙인다" },
    className: { control: "text", description: "기본 클래스와 병합된다 (교체 아님)" },
    "aria-label": { control: "text", description: '스크린리더 문구. 기본 `"Loading"`' }
  }
  // args 로 기본값을 덮지 않는다 — 첫 스토리는 "아무것도 안 준 상태" 를 보여줘야 한다 (D5)
} satisfies Meta<typeof TxSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 아무것도 주지 않은 상태. 이게 대부분의 경우 정답이다. */
export const 기본: Story = {};

/**
 * **크기는 두 갈래로 정한다.**
 *
 * `size` 로 직접 주거나, 아무것도 주지 않고 **부모의 `text-*` 에 맡기거나.**
 * 아래 줄은 전부 `<TxSpinner />` 하나이고, 다른 건 부모의 글자 크기뿐이다.
 */
export const 크기: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <span className="text-xs">
          <TxSpinner /> text-xs
        </span>
        <span className="text-base">
          <TxSpinner /> text-base
        </span>
        <span className="text-2xl">
          <TxSpinner /> text-2xl
        </span>
      </div>
      <div className="flex items-end gap-4 text-sm">
        <span>
          <TxSpinner size="1.5em" /> size=&quot;1.5em&quot;
        </span>
        <span>
          <TxSpinner size={32} /> size=&#123;32&#125; (px)
        </span>
        <span>
          <TxSpinner className="size-8" /> className=&quot;size-8&quot;
        </span>
      </div>
    </div>
  )
};

/**
 * 색은 `currentColor` 로 **상속**받는다. 부모에 `text-*` 를 주면 따라오고,
 * 스피너에 직접 주면 그쪽이 이긴다 — `className` 은 기본 클래스를 지우지 않고 병합된다.
 */
export const 색: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <span className="text-blue-600 dark:text-blue-400">
        <TxSpinner size="1.5em" />
      </span>
      <span className="text-red-600 dark:text-red-400">
        <TxSpinner size="1.5em" />
      </span>
      <TxSpinner size="1.5em" className="text-emerald-600 dark:text-emerald-400" />
      <span className="text-slate-400 text-xs">앞의 둘은 부모 상속, 마지막은 className 직접 지정</span>
    </div>
  )
};

/**
 * **`decorative` 는 스크린리더 중복 안내를 막는 스위치다.**
 *
 * 기본값은 `role="status"` + `aria-label="Loading"` 이라 스피너 혼자서도 상태를 알린다.
 * 하지만 옆에 이미 읽을 문구가 있으면 같은 내용이 두 번 안내된다. 그럴 때 `decorative` 를 켠다.
 *
 * `TxButton` 의 기본 로딩 표시가 그 경우라서, 내부적으로 `<TxSpinner decorative />` 를 쓴다.
 */
export const 장식용: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-2">
        <TxSpinner />
        <span>기본 — 스피너가 &quot;Loading&quot; 을 따로 안내한다</span>
      </div>
      <div className="flex items-center gap-2">
        <TxSpinner decorative />
        <span>decorative — 옆의 이 문구만 읽힌다</span>
      </div>
      <div className="flex items-center gap-3">
        <TxButton label="눌러보면 3초 로딩" variant="secondary" onClick={() => new Promise((r) => window.setTimeout(r, 3000))} />
        <span className="text-slate-400">TxButton 은 내부에서 decorative 로 쓴다</span>
      </div>
    </div>
  )
};

/**
 * 스크린리더 문구는 `aria-label` 로 바꾼다. 기본값이 영어(`"Loading"`)라 **언어를 강제하지 않으려면 이 경로를 쓴다.**
 * 별도 prop 을 두지 않은 건, 표준 속성으로 이미 되는 일이기 때문이다.
 */
export const 안내_문구_교체: Story = {
  args: { "aria-label": "주문 내역을 불러오는 중", size: "1.5em" }
};
