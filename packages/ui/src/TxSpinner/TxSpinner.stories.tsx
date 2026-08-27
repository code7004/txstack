import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxSpinner } from ".";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Feedback/TxSpinner",
  component: TxSpinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "로딩 중임을 알리는 회전 아이콘. 글자 옆이나 버튼 안에 넣는다.",
          "",
          "```tsx",
          'import { TxSpinner } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxSpinner />;",
          "```",
          "",
          "크기와 색은 놓인 자리의 글자를 따라간다. 대부분은 아무것도 주지 않으면 된다.",
          "",
          '- `size` 에는 CSS 길이나 number(px) 를 준다. `size="w-6"` 처럼 클래스를 주면 `width` 속성값이 되어 아무 일도 일어나지 않는다.',
          "- `className` 은 `.tx-spinner` 를 교체하지 않고 덧붙는다.",
          "- 회전 속도는 CSS 변수 `--tx-spinner-duration` 으로 바꾼다.",
          "- `prefers-reduced-motion` 을 켠 사용자에게는 회전이 멈추지 않고 느려진다.",
          "",
          "문구·전체화면 오버레이·표시 여부 판단이 필요하면 `TxLoading` 을 쓴다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다. 나머지는 noControls이다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    size: { control: "text", description: 'CSS 길이 또는 number(px). 비우면 기본 `"1em"` — 부모 font-size 를 따른다' },
    decorative: { control: "boolean", description: "켜면 `role`·`aria-label` 을 빼고 `aria-hidden` 을 붙인다" },
    className: { control: "text", description: "`.tx-spinner` 에 덧붙는다 (교체 아님)" },
    "aria-label": { control: "text", description: '스크린리더 문구. 기본 `"Loading"`' }
  }
} satisfies Meta<typeof TxSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 컨트롤을 받지 않는 noControls 스토리에 붙인다. */
const noControls = { controls: { disable: true } };

/**
 * 컨트롤 패널에서 값을 바꿔가며 확인한다.
 *
 * 아래 회색 줄은 스크린리더가 읽는 내용이다. `decorative` 와 `aria-label` 은 화면에 안 보이니 여기서 본다.
 */
export const Playground: Story = {
  args: { size: "2em", decorative: false, className: "", "aria-label": "Loading" },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-base">
        <TxSpinner {...args} />
        <span>옆 글자와 비교해서 본다</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">스크린리더: {args.decorative ? "안내하지 않음 (aria-hidden)" : `"${args["aria-label"] || "Loading"}" 로 안내`}</p>
    </div>
  )
};

/** 아무것도 주지 않은 상태. 크기가 `1em` 이라 옆 글자만 하다. */
export const Basic: Story = { parameters: noControls };

/**
 * 크기는 두 가지로 정한다. `size` 를 주거나, 아무것도 주지 않고 놓인 자리의 `font-size` 에 맡기거나.
 *
 * 윗줄은 셋 다 `<TxSpinner />` 이고 부모의 글자 크기만 다르다.
 */
export const Size: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <span className="text-xs">
          <TxSpinner /> font-size 작게
        </span>
        <span className="text-base">
          <TxSpinner /> 보통
        </span>
        <span className="text-2xl">
          <TxSpinner /> 크게
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
          <TxSpinner size="2rem" /> size=&quot;2rem&quot;
        </span>
      </div>
    </div>
  )
};

/**
 * 색은 `currentColor` 를 따라간다. 부모의 `color` 만 정하면 되고, 스피너만 다른 색이면 직접 준다.
 *
 * 아래 넷은 같은 결과를 내는 네 가지 방법이다.
 */
export const Color: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-3">
        <span style={{ color: "#2563eb" }}>
          <TxSpinner size="1.5em" />
        </span>
        <span className="text-slate-500 dark:text-slate-400">부모에 style</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-red-600 dark:text-red-400">
          <TxSpinner size="1.5em" />
        </span>
        <span className="text-slate-500 dark:text-slate-400">부모에 클래스</span>
      </div>
      <div className="flex items-center gap-3">
        <TxSpinner size="1.5em" style={{ color: "#059669" }} />
        <span className="text-slate-500 dark:text-slate-400">스피너에 직접 style</span>
      </div>
      <div className="flex items-center gap-3">
        <TxSpinner size="1.5em" className="text-amber-500" />
        <span className="text-slate-500 dark:text-slate-400">
          스피너에 <code>className</code>
        </span>
      </div>
    </div>
  )
};

/**
 * 회전 속도는 CSS 변수 하나로 바꾼다.
 *
 * ```css
 * .tx-spinner {
 *   --tx-spinner-duration: 2s;
 * }
 * ```
 *
 * 아래는 스토리라 인라인으로 줬다. 실제로는 CSS 파일 한 곳에 적으면 전체에 적용된다.
 */
export const Speed: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex items-center gap-8 text-sm">
      {["0.4s", "1s", "3s"].map((duration) => (
        <span key={duration} className="flex items-center gap-2">
          <TxSpinner size="1.5em" style={vars({ "--tx-spinner-duration": duration })} />
          {duration}
        </span>
      ))}
      <span className="text-xs text-slate-500 dark:text-slate-400">가운데가 기본값이다</span>
    </div>
  )
};

/**
 * 기본값은 `role="status"` + `aria-label="Loading"` 이라 스피너 혼자서도 상태를 알린다.
 *
 * 옆에 이미 읽을 문구가 있으면 같은 내용이 두 번 안내되므로 `decorative` 를 켠다.
 * 버튼 안처럼 라벨이 이미 있는 자리가 그렇다.
 */
export const Decorative: Story = {
  parameters: noControls,
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
        <span className="text-slate-400">TxButton 의 로딩 표시가 이 경우다</span>
      </div>
    </div>
  )
};
