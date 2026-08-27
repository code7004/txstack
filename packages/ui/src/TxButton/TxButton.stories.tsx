import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { TxButton } from ".";

const VARIANTS = ["primary", "secondary", "danger", "ghost", "text"] as const;

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Form/TxButton",
  component: TxButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "누르면 뭔가 일어나는 자리. 비동기 작업이면 잠금과 스피너가 따라붙는다.",
          "",
          "```tsx",
          'import { TxButton } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxButton label="저장" onClick={async () => await save()} />;',
          "```",
          "",
          "`onClick` 이 Promise 를 반환하면 해제될 때까지 스피너가 뜨고 버튼이 잠긴다. 연타해도 한 번만 실행된다.",
          "동기 `onClick` 은 잠기지 않는다.",
          "",
          '- **`type` 기본값이 `"button"` 이다.** 폼을 제출할 버튼에만 `type="submit"` 을 준다.',
          "- 색·반경은 CSS 변수로 바꾼다. 앱 전체는 `:root { --tx-color-primary: … }` 한 줄이다.",
          '- `variant` 는 5종이 들어 있고, CSS 로 새 이름을 늘릴 수 있다 — `.tx-button[data-variant="brand"] { … }`.',
          "- `className` 은 `.tx-button` 을 교체하지 않고 덧붙는다. 라벨만 겨냥하려면 `classNames={{ label }}`.",
          "- `onClick` 이 던진 에러는 콘솔에만 남는다. 화면에 띄우려면 핸들러 안에서 잡는다.",
          "",
          "아이콘·크기 스케일·링크(`href`)는 다루지 않는다. 아이콘은 `children` 으로 넣는다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다. 나머지는 비교용이다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    label: { control: "text" },
    variant: { control: "select", options: VARIANTS, description: "의미로 고른다. CSS 로 새 이름을 늘릴 수 있다" },
    disabled: { control: "boolean" },
    type: { control: "inline-radio", options: ["button", "submit", "reset"], description: '기본 `"button"`' },
    className: { control: "text", description: "`.tx-button` 에 덧붙는다 (교체 아님)" },
    classNames: { control: false, description: "안쪽 슬롯. 지금은 `label` 하나다" },
    loading: { control: false },
    onClick: { control: false }
  }
} satisfies Meta<typeof TxButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 컨트롤을 받지 않는 비교용 스토리에 붙인다. */
const noControls = { controls: { disable: true } };

/** 컨트롤 패널에서 값을 바꿔가며 확인한다. */
export const Playground: Story = {
  args: { label: "확인", variant: "primary", disabled: false, type: "button", className: "" },
  render: (args) => <TxButton {...args} />
};

/**
 * 다섯 가지가 들어 있다. 색이 아니라 **의미**로 고른다.
 *
 * `ghost` 와 `text` 는 표면이 없고, 마우스를 올렸을 때만 배경이 뜬다.
 */
export const Variant: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((v) => (
        <TxButton key={v} variant={v} label={v} />
      ))}
    </div>
  )
};

/**
 * 왼쪽 버튼의 `onClick` 은 3초짜리 Promise 를 반환한다. 누르면 잠기고, 풀리면 돌아온다.
 *
 * 가운데는 동기 핸들러라 잠기지 않는다. 라벨은 로딩 중에도 자리를 지키므로 버튼 폭이 그대로다.
 */
export const Loading: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <TxButton label="3초 걸리는 작업" onClick={() => new Promise((resolve) => window.setTimeout(resolve, 3000))} />
      <TxButton label="동기 — 안 잠긴다" variant="secondary" onClick={() => undefined} />
      <TxButton label="비활성" disabled />
    </div>
  )
};

/**
 * 폼 안에서 왼쪽 버튼은 눌러도 제출되지 않는다. `type="submit"` 을 준 오른쪽만 제출된다.
 *
 * HTML 버튼의 기본값은 `submit` 이지만 `TxButton` 은 `"button"` 으로 시작한다.
 */
export const InForm: Story = {
  parameters: noControls,
  render: () => (
    <form
      className="flex items-center gap-2 rounded border border-slate-300 p-3 dark:border-slate-700"
      onSubmit={(e) => {
        e.preventDefault();
        window.alert("제출됐다");
      }}
    >
      <span className="text-sm">폼 안</span>
      <TxButton label="취소 (제출 안 됨)" variant="secondary" />
      <TxButton label="제출" type="submit" />
    </form>
  )
};

/**
 * 색과 반경은 CSS 변수로 바꾼다. **`hover` 와 눌린 색은 배경에서 저절로 계산되므로 따로 줄 필요가 없다.**
 *
 * 앱 전체는 `:root` 한 곳, 없던 variant 는 선택자 하나다.
 *
 * ```css
 * :root {
 *   --tx-color-primary: #7c3aed;
 *   --tx-radius: 9999px;
 * }
 *
 * .tx-button[data-variant="brand"] {
 *   --tx-button-bg: #0f172a;
 *   --tx-button-fg: #fff;
 * }
 * ```
 *
 * 두 경우 다 배경만 줬는데 마우스를 올리면 그 색에서 진해진다. 상태 색을 따로 적지 않는다.
 *
 * 아래 두 번째 줄은 앱 전체 대신 그 영역에만 같은 변수를 걸어 본 것이다.
 * 세 번째 줄의 `brand` 는 라이브러리에 없는 이름인데, 위 CSS 두 줄로 만들어 쓰고 있다.
 * 마우스를 올려 보면 hover 색까지 따라오는 게 보인다.
 */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      <style>{`
        .tx-button[data-variant="brand"] {
          --tx-button-bg: #0f172a;
          --tx-button-fg: #fff;
        }
      `}</style>

      <div className="flex flex-wrap items-center gap-3">
        <TxButton label="기본값" />
        <TxButton label="삭제" variant="danger" />
        <span className="text-slate-500 dark:text-slate-400">라이브러리 기본 토큰</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded border border-violet-300 p-3 dark:border-violet-800" style={vars({ "--tx-color-primary": "#7c3aed", "--tx-radius": "9999px" })}>
        <TxButton label="기본값" />
        <TxButton label="삭제" variant="danger" />
        <span className="text-slate-500 dark:text-slate-400">
          이 영역에만 <code>--tx-color-primary</code> · <code>--tx-radius</code> — 올려보면 hover 도 보라 계열이다
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TxButton label="가입" variant="brand" />
        <span className="text-slate-500 dark:text-slate-400">
          <code>variant=&quot;brand&quot;</code> — CSS 로 늘린 이름
        </span>
      </div>
    </div>
  )
};

/**
 * 이 버튼 하나의 겉은 `className` 으로, 안쪽 라벨은 `classNames={{ label }}` 로 바꾼다.
 * 둘 다 `.tx-button` 을 교체하지 않고 덧붙으므로, 여백만 바꾸려다 색이나 로딩 표시가 사라지지 않는다.
 *
 * ```tsx
 * <TxButton label="저장" className="my-save-btn" />
 * <TxButton label="아주 긴 라벨" classNames={{ label: "truncate" }} />
 * ```
 *
 * 세 번째 줄의 라벨은 잘려 있다. 버튼에 폭을 주고 라벨 슬롯에만 자르기를 걸었다.
 */
export const CustomizingClass: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <TxButton label="넓고 둥글게" className="rounded-full px-6" />
        <span className="text-slate-500 dark:text-slate-400">
          <code>className</code> — 이 버튼의 겉
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TxButton label="그림자 얹기" className="shadow-lg" />
        <span className="text-slate-500 dark:text-slate-400">Tailwind 든 자기 CSS 클래스든 그대로 붙는다</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TxButton label="줄바꿈 없이 잘리는 아주 긴 라벨" className="w-40" classNames={{ label: "truncate" }} />
        <span className="text-slate-500 dark:text-slate-400">
          <code>classNames=&#123;&#123; label &#125;&#125;</code> — 안쪽 슬롯
        </span>
      </div>
    </div>
  )
};
