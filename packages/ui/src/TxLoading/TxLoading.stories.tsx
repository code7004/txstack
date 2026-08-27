import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxLoading } from ".";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Feedback/TxLoading",
  component: TxLoading,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "로딩 표시. 스피너에 문구를 붙이고, 필요하면 화면 전체를 덮는다.",
          "",
          "```tsx",
          'import { TxLoading } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxLoading visible={rows} text="목록을 불러오는 중" />;',
          "```",
          "",
          "문구의 색과 크기는 놓인 자리의 글자를 따라간다. 대부분은 `text` 만 주면 된다.",
          "",
          "- **`visible` 에 배열을 주면 그 배열이 비어 있는 동안 보인다.** 그래서 응답이 실제로 0건이면 사라지지 않는다 — 빈 결과가 있는 화면에는 `visible={loading}` 처럼 boolean 을 준다.",
          "- `fullScreen` 은 `document.body` 로 옮겨 붙는다. 조상에 `transform` 이 있어도 화면 전체를 덮는다.",
          "- 전체화면 문구의 색은 `--tx-loading-fg` 가 정한다. 딤을 진하게 올리면 이 값도 함께 준다.",
          "- 크기·딤·쌓임 순서는 CSS 변수로 바꾼다 (`CustomizingTokens`).",
          '- `text` 를 주면 그 문구가 스크린리더에 안내된다. 비우면 `"Loading"` 이 안내된다.',
          "",
          "회전 아이콘 하나만 필요하면 `TxSpinner`, 자리 모양을 아는 로딩은 `TxCard` 의 `isLoading` 을 쓴다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다. 나머지는 비교용이다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    text: { control: "text", description: "문구. 비우면 스피너만 나온다" },
    visible: { control: "boolean", description: "표시 여부. **배열**을 줄 수도 있다 — 비어 있는 동안 보인다 (`Visible`)" },
    fullScreen: { control: "boolean", description: "화면 전체를 덮는다. `document.body` 로 옮겨 붙는다" },
    className: { control: "text", description: "`.tx-loading` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 컨트롤을 받지 않는 비교용 스토리에 붙인다. */
const noControls = { controls: { disable: true } };

/**
 * 컨트롤 패널에서 값을 바꿔가며 확인한다.
 *
 * 아래 회색 줄은 스크린리더가 읽는 내용이다. `text` 를 비우면 안내 문구가 어디서 오는지가 바뀐다.
 */
export const Playground: Story = {
  args: { visible: true, text: "불러오는 중", className: "" },
  // fullScreen 은 문서 페이지 전체를 덮어 컨트롤까지 가리므로 여기서는 끄고 FullScreen 스토리에서 본다.
  argTypes: { fullScreen: { control: false } },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <TxLoading {...args} />
      <p className="text-xs text-slate-500 dark:text-slate-400">스크린리더: {args.text ? `"${args.text}" 로 안내` : '스피너가 "Loading" 으로 안내'}</p>
    </div>
  )
};

/**
 * `text` 하나만 준 상태.
 *
 * 아래 셋은 전부 같은 `<TxLoading text="불러오는 중" />` 이고 부모의 글자 크기만 다르다.
 * 스피너도 문구도 그 자리를 따라간다.
 */
export const Basic: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <span className="text-xs">
        <TxLoading text="불러오는 중" />
      </span>
      <span className="text-base">
        <TxLoading text="불러오는 중" />
      </span>
      <span className="text-2xl">
        <TxLoading text="불러오는 중" />
      </span>
    </div>
  )
};

/**
 * `visible` 에 **배열**을 주는 사용법. 채우면 저절로 사라지고, `rows.length === 0` 을 쓸 일이 없다.
 *
 * 오른쪽은 같은 상태를 boolean 으로 준 것이다. **데이터를 채워도 사라지지 않는 쪽**이 배열 규약의 함정이다 —
 * 응답이 실제로 0건인 화면에서는 boolean 을 쓴다.
 */
const VisibleDemo = () => {
  const [rows, _rows] = useState<number[]>([]);
  const [empty, _empty] = useState<number[]>([]);

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex gap-2">
        <TxButton label={rows.length ? "비우기" : "3건 채우기"} variant="secondary" onClick={() => _rows(rows.length ? [] : [1, 2, 3])} />
        <TxButton label="0건으로 응답" variant="ghost" onClick={() => _empty([])} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-slate-300 p-4 dark:border-slate-700">
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">visible=&#123;rows&#125;</p>
          <TxLoading visible={rows} text="목록을 불러오는 중" />
          {rows.map((r) => (
            <p key={r}>항목 {r}</p>
          ))}
        </div>

        <div className="rounded border border-slate-300 p-4 dark:border-slate-700">
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">visible=&#123;empty&#125; — 0건 응답</p>
          <TxLoading visible={empty} text="목록을 불러오는 중" />
        </div>
      </div>
    </div>
  );
};
export const Visible: Story = { parameters: noControls, render: () => <VisibleDemo /> };

/**
 * 화면 전체를 덮는다. 누르면 3초 뒤에 저절로 사라진다. **라이트·다크를 둘 다 눌러 본다.**
 *
 * 기본 딤은 모드에 따라 뒤집힌다 — 라이트에서는 어둡게, 다크에서는 밝게 덮는다. 문구 색도 같이
 * 뒤집히므로 아무것도 주지 않아도 읽힌다.
 *
 * 어느 모드에서나 **어둡게** 덮고 싶으면 섞는 색을 고정한다. 두 번째 버튼이 그것이고,
 * 그때는 문구 색을 함께 준다.
 *
 * ```css
 * .tx-loading[data-full-screen] {
 *   --tx-color-state: #000;
 *   --tx-loading-backdrop-opacity: 60%;
 *   --tx-loading-fg: #fff;
 * }
 * ```
 */
const presets = {
  기본: {},
  스크림: { "--tx-color-state": "#000", "--tx-loading-backdrop-opacity": "60%", "--tx-loading-fg": "#fff" }
} satisfies Record<string, Record<string, string>>;

const FullScreenDemo = () => {
  const [preset, _preset] = useState<keyof typeof presets | null>(null);

  useEffect(() => {
    if (preset === null) return;
    const timer = window.setTimeout(() => _preset(null), 3000);
    return () => window.clearTimeout(timer);
  }, [preset]);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex gap-2">
        <TxButton label="기본 딤 (모드에 따라 뒤집힌다)" onClick={() => _preset("기본")} />
        <TxButton label="어두운 스크림 (양쪽 모드 동일)" variant="secondary" onClick={() => _preset("스크림")} />
      </div>
      <p className="text-slate-500 dark:text-slate-400">문구는 항상 딤보다 위에 온다. 딤 아래로 들어가 흐려 보이면 잘못된 것이다.</p>
      {preset !== null && <TxLoading text="이동 중" fullScreen style={vars(presets[preset] as Record<`--${string}`, string>)} />}
    </div>
  );
};
export const FullScreen: Story = { parameters: noControls, render: () => <FullScreenDemo /> };

/**
 * 값은 CSS 변수로 바꾼다. 아래는 스토리라 인라인으로 줬고, 실제로는 CSS 파일 한 곳에 적으면 전체에 적용된다.
 *
 * ```css
 * .tx-loading {
 *   --tx-loading-icon-size: 3em;
 *   --tx-loading-gap: 1em;
 *   --tx-loading-backdrop-opacity: 60%;
 *   --tx-loading-z: 9999;
 * }
 * ```
 */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      {[
        { label: "기본값", style: {} },
        { label: "--tx-loading-icon-size: 3em", style: vars({ "--tx-loading-icon-size": "3em" }) },
        { label: "--tx-loading-gap: 1.5em", style: vars({ "--tx-loading-gap": "1.5em" }) }
      ].map(({ label, style }) => (
        <div key={label} className="flex items-center gap-4">
          <TxLoading text="불러오는 중" style={style} />
          <code className="text-xs text-slate-500 dark:text-slate-400">{label}</code>
        </div>
      ))}
    </div>
  )
};

/**
 * 겉을 겨냥할 때는 `className`, 안쪽을 겨냥할 때는 `classNames` 다. 둘은 겹치지 않는다.
 *
 * 위는 바깥 상자에, 아래는 아이콘과 문구에 각각 붙은 것이다.
 */
export const CustomizingSlots: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-4">
        <TxLoading text="불러오는 중" className="rounded-full bg-slate-100 px-4 py-2 dark:bg-slate-800" />
        <code className="text-xs text-slate-500 dark:text-slate-400">className</code>
      </div>
      <div className="flex items-center gap-4">
        <TxLoading text="불러오는 중" classNames={{ icon: "text-blue-500", text: "font-bold" }} />
        <code className="text-xs text-slate-500 dark:text-slate-400">classNames=&#123;&#123; icon, text &#125;&#125;</code>
      </div>
    </div>
  )
};
