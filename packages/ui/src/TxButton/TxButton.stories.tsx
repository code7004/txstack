import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxThemeProvider } from "../TxTheme";
import { TxButton, TxButtonTheme } from ".";

const VARIANTS = Object.keys(TxButtonTheme.variants) as (keyof typeof TxButtonTheme.variants)[];

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
          "**`Playground` 에서 직접 만져본다.** 나머지 스토리는 noControls이라 컨트롤이 적용되지 않는다.",
          "",
          '- **`type` 기본값은 `"button"` 이다.** 폼 제출 버튼만 `type="submit"` 을 명시한다 — 안 그러면 `TxForm` 안의 모든 버튼이 폼을 제출한다.',
          "- `onClick` 이 **Promise 를 반환하면** 해제될 때까지 스피너가 뜨고 버튼이 잠긴다. 연타해도 한 번만 실행된다.",
          "- 동기 `onClick` 은 로딩 상태로 들어가지 않는다. 스피너가 깜빡이지 않는다.",
          "- 색을 바꾸려면 `className`, 이 버튼만의 구조를 바꾸려면 `theme`, **앱 전체를 바꾸려면 `TxThemeProvider`** 다.",
          '- ⚠ **`className` 으로 색을 바꿀 때는 `hover:`·`dark:` 도 같이 준다.** `className="bg-yellow-500"` 만 주면 평상시만 노랑이고 마우스를 올리거나 다크모드가 되면 원래 색으로 돌아간다 — `tailwind-merge` 는 조건이 같은 클래스끼리만 충돌로 보기 때문이다. 같은 색을 여러 번 쓸 거면 `theme` 으로 variant 를 하나 만드는 게 낫다.',
          "- `variant` 는 **열려 있다.** `theme` 으로 `variants` 에 키를 추가하면 그 이름을 그대로 쓸 수 있다.",
          "",
          "명세: `docs/001_ui/components/02_TxButton.md`"
        ].join("\n")
      }
    }
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS, description: "의미 기반 스타일. `theme` 으로 늘릴 수 있다" },
    label: { control: "text" },
    disabled: { control: "boolean" },
    type: { control: "inline-radio", options: ["button", "submit", "reset"], description: '기본 `"button"`' },
    className: { control: "text", description: "기본 클래스와 병합된다" },
    theme: { control: false, description: "이 인스턴스만의 부분 테마" },
    loading: { control: false },
    onClick: { control: false }
  }
} satisfies Meta<typeof TxButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 컨트롤이 적용되지 않는 noControls 스토리에 붙인다. 죽은 손잡이를 보여주지 않는다. */
const noControls = { controls: { disable: true } };

/** **여기서 직접 만져본다.** 컨트롤 패널의 값을 바꾸면 즉시 반영된다. */
export const Playground: Story = {
  args: { label: "확인", variant: "primary", disabled: false, type: "button", className: "" }
};

/** `variant` 5종. **의미**를 기준으로 고른다. 팔레트 색을 고르는 `color` prop 은 없앴다 — `className` 으로 한다. */
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
 * `onClick` 이 Promise 를 반환하면 해제될 때까지 스피너가 뜨고 버튼이 잠긴다. 연타해도 한 번만 실행된다.
 *
 * 옆의 동기 버튼은 **로딩 상태로 들어가지 않는다** — 스피너가 한 프레임 깜빡이던 것을 없앴다.
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
 * **`type` 기본값이 `"button"` 이다.**
 *
 * 아래 폼에서 왼쪽 버튼은 눌러도 제출되지 않고, `type="submit"` 을 명시한 오른쪽만 제출된다.
 * 예전에는 HTML 기본값인 `submit` 이 그대로 먹어서 **폼 안의 모든 버튼이 폼을 제출했다.**
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
 * 커스터마이징은 **범위에 따라 셋 중 하나**를 고른다.
 *
 * | 무엇을 바꾸나         | 무엇으로            |
 * | --------------------- | ------------------- |
 * | 이 버튼 하나          | `className`         |
 * | 이 버튼의 내부 구조   | `theme`             |
 * | **앱 전체**           | `TxThemeProvider`   |
 *
 * 아래 오른쪽 두 개는 Provider 로 감싼 영역이다. `brand` 는 **원래 없던 variant** 인데
 * Provider 에서 키를 추가해 그대로 쓰고 있다.
 */
/**
 * **이 버튼 하나만 바꾼다.** 가장 흔한 경우고, `className` 이면 끝난다.
 *
 * 다만 **색을 바꿀 때는 `hover:`·`dark:` 도 같이 줘야 한다.** `tailwind-merge` 는
 * 조건이 같은 클래스끼리만 충돌로 보기 때문에, `bg-yellow-500` 은 `bg-blue-500` 을 밀어내지만
 * `hover:bg-blue-600` 과 `dark:bg-blue-600` 은 그대로 남는다.
 *
 * 아래 노란 버튼 두 개에 **마우스를 올리거나 테마를 다크로 바꿔** 보면 차이가 바로 보인다.
 */
export const CustomizingClass: Story = {
  name: "Customizing - class",
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TxButton label="모양만 바꾼다" className="rounded-full px-6" />
        <span className="text-xs text-slate-400">색이 아닌 것은 한 줄이면 된다</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded border border-amber-300 p-3 dark:border-amber-800">
        <TxButton label="✗ 평상시만 노랑" className="bg-yellow-500 text-black" />
        <TxButton label="✓ 조건까지 전부" className="bg-yellow-500 text-black hover:bg-yellow-600 dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-600" />
        <span className="text-xs text-slate-400">
          왼쪽에 <b>마우스를 올리거나 다크로 바꿔</b> 보라
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TxButton label="theme 으로 갈아끼우기" theme={{ variants: { primary: "bg-emerald-600 text-white hover:bg-emerald-700" } }} />
        <span className="text-xs text-slate-400">이 버튼의 variant 자체를 교체한다 — 조건을 한 곳에 모을 수 있다</span>
      </div>
    </div>
  )
};

/**
 * **앱 전체를 바꾼다.** 한 번 감싸면 그 아래 모든 `TxButton` 에 적용된다.
 *
 * 같은 색을 여러 곳에서 쓸 거라면 `className` 을 반복하지 말고 **여기서 variant 를 만든다.**
 * 아래 `brand` 는 라이브러리에 원래 없던 variant 인데 Provider 에서 키를 추가해 그대로 쓰고 있다.
 *
 * **감싸지 않아도 동작한다.** Provider 는 선택이다.
 */
export const CustomizingProvider: Story = {
  name: "Customizing - Provider",
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TxButton label="Provider 바깥 primary" />
        <span className="text-xs text-slate-400">라이브러리 기본값</span>
      </div>

      <TxThemeProvider
        theme={{
          TxButton: {
            variants: {
              primary: "bg-violet-600 text-white hover:bg-violet-700",
              warning: "bg-yellow-500 text-black hover:bg-yellow-600",
              brand: "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            }
          }
        }}
      >
        <div className="flex flex-col gap-2 rounded border border-violet-300 p-3 dark:border-violet-800">
          <div className="flex flex-wrap items-center gap-2">
            <TxButton label="Provider 안 primary" />
            <TxButton label="warning (새 variant)" variant="warning" />
            <TxButton label="brand (새 variant)" variant="brand" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TxButton label="인스턴스 theme 이 이긴다" theme={{ variants: { primary: "bg-emerald-600 text-white hover:bg-emerald-700" } }} />
            <span className="text-xs text-slate-400">라이브러리 → Provider → 인스턴스 순으로 뒤가 이긴다</span>
          </div>
        </div>
      </TxThemeProvider>
    </div>
  )
};
