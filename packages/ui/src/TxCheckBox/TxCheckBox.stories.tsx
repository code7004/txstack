import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxCheckBox } from "./TxCheckBox";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Form/TxCheckBox",
  component: TxCheckBox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "켜고 끄는 자리. 네모난 체크박스와 스위치 두 모양이 있다.",
          "",
          "```tsx",
          'import { TxCheckBox } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxCheckBox label="동의합니다" onChangeBool={setAgreed} />;',
          '<TxCheckBox label="알림 받기" variant="toggle" defaultChecked />;',
          "```",
          "",
          "- `checked` 를 주면 controlled, `defaultChecked` 를 주면 uncontrolled",
          "- `onChangeBool` 은 체크 여부만 준다. `onChange` 와 함께 불린다",
          '- `variant="toggle"` 은 스위치로 읽힌다 — 스크린리더가 "켜짐/꺼짐" 으로 안내한다',
          "",
          '**안에 진짜 `<input type="checkbox">` 가 있다.** 그래서',
          "`name` · `value` · `disabled` · `required` 같은 표준 속성이 그대로 통과하고,",
          "**`<form>` 안에서 그냥 제출된다.** 전체가 하나의 `<label>` 이라 글을 눌러도 토글되고,",
          "Tab 으로 도달해 Space 로 켠다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    label: { control: "text" },
    variant: { control: "inline-radio", options: ["checkbox", "toggle"] },
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    stopPropagation: { control: "boolean", description: "클릭이 부모로 올라가지 않게 막는다" },
    className: { control: "text", description: "`.tx-checkbox` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxCheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { label: "동의합니다", variant: "checkbox", disabled: false, defaultChecked: false, stopPropagation: false, className: "" }
};

/** 두 모양. 같은 컴포넌트고 `variant` 만 다르다. */
export const Variant: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxCheckBox label="체크박스 — 꺼짐" />
      <TxCheckBox label="체크박스 — 켜짐" defaultChecked />
      <TxCheckBox label="스위치 — 꺼짐" variant="toggle" />
      <TxCheckBox label="스위치 — 켜짐" variant="toggle" defaultChecked />
    </TxFlex>
  )
};

export const States: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxCheckBox label="기본" />
      <TxCheckBox label="비활성 — 꺼짐" disabled />
      <TxCheckBox label="비활성 — 켜짐" disabled defaultChecked />
      <TxCheckBox label="비활성 스위치" variant="toggle" disabled defaultChecked />
      <TxCheckBox label="글 없이 (스크린리더용 이름만)" aria-label="글 없는 체크박스" />
    </TxFlex>
  )
};

/**
 * **키보드로 다뤄 보라.**
 *
 * Tab 으로 이동하면 네모나 스위치에 포커스 링이 걸리고, Space 로 켜고 끈다.
 * 글을 눌러도 토글된다 — 전체가 하나의 `<label>` 이다.
 */
export const Keyboard: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxCheckBox label="Tab 으로 여기까지 오세요" />
      <TxCheckBox label="Space 로 켜고 끕니다" variant="toggle" />
      <TxCheckBox label="글을 눌러도 토글됩니다" />
    </TxFlex>
  )
};

/**
 * **`<form>` 안에서 그냥 제출된다.** 체크한 것만 `name=value` 로 실린다 — HTML 규칙 그대로다.
 *
 * 몇 개 켜고 제출을 눌러 보라.
 */
export const InForm: Story = {
  parameters: noControls,
  render: function InFormStory() {
    const [result, setResult] = useState("—");

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = [...new FormData(e.currentTarget).entries()];
          setResult(data.length === 0 ? "(아무것도 안 실림)" : data.map(([k, v]) => `${k}=${v}`).join(" · "));
        }}
      >
        <TxFlex className="flex-col items-start gap-3">
          <TxCheckBox name="agree" value="yes" label="이용약관에 동의" />
          <TxCheckBox name="news" value="on" label="소식 받기" variant="toggle" />
          <TxCheckBox name="ads" value="on" label="광고 수신" />
          <TxButton type="submit" label="제출" />
          <div className="font-mono text-sm text-slate-500 dark:text-slate-400">제출된 값: {result}</div>
        </TxFlex>
      </form>
    );
  }
};

/** controlled 는 소비자가 값의 주인이다. 아래 버튼으로 밖에서 바꿔 보라. */
export const Controlled: Story = {
  parameters: noControls,
  render: function ControlledStory() {
    const [on, setOn] = useState(false);

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxCheckBox label="알림 받기" variant="toggle" checked={on} onChangeBool={setOn} />
        <TxFlex>
          <TxButton variant="secondary" label="켜기" onClick={() => setOn(true)} />
          <TxButton variant="ghost" label="끄기" onClick={() => setOn(false)} />
        </TxFlex>
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">state: {String(on)}</div>
      </TxFlex>
    );
  }
};

/**
 * 행 전체가 눌리는 목록에서는 `stopPropagation` 을 켠다.
 *
 * 위 줄은 체크박스를 눌러도 행이 함께 열리고, 아래 줄은 체크박스만 토글된다.
 */
export const StopPropagation: Story = {
  parameters: noControls,
  render: function StopPropagationStory() {
    const [log, setLog] = useState<string[]>([]);
    const push = (line: string) => setLog((prev) => [line, ...prev].slice(0, 5));

    const row = "flex w-80 cursor-pointer items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-gray-700";

    return (
      <TxFlex className="flex-col items-start gap-3">
        <div className={row} onClick={() => push("행이 열렸다")}>
          <TxCheckBox label="기본 — 행도 함께 열린다" onChangeBool={(v) => push(`체크 ${v}`)} />
        </div>
        <div className={row} onClick={() => push("행이 열렸다")}>
          <TxCheckBox label="stopPropagation — 체크만" stopPropagation onChangeBool={(v) => push(`체크 ${v}`)} />
        </div>
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">{log.length === 0 ? "—" : log.map((l, i) => <div key={i}>{l}</div>)}</div>
      </TxFlex>
    );
  }
};

/**
 * 토큰 한 줄로 바꾼다. 스위치의 손잡이 이동 거리는 **트랙과 손잡이 크기에서 계산되므로**
 * 크기만 바꿔도 알아서 맞는다.
 */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxCheckBox label="기본" defaultChecked />
      <TxCheckBox label="--tx-checkbox-size: 1.75rem" defaultChecked style={vars({ "--tx-checkbox-size": "1.75rem", "--tx-checkbox-icon-size": "1.4rem" })} />
      <TxCheckBox label="--tx-checkbox-radius: 9999px" defaultChecked style={vars({ "--tx-checkbox-radius": "9999px" })} />
      <TxCheckBox label="--tx-color-primary 를 바꾸면 함께 따라온다" defaultChecked style={vars({ "--tx-color-primary": "#7c3aed" })} />
      <TxCheckBox label="스위치를 키워도 손잡이가 맞는다" variant="toggle" defaultChecked style={vars({ "--tx-checkbox-track-width": "3.5rem", "--tx-checkbox-track-height": "2rem", "--tx-checkbox-thumb-size": "1.5rem" })} />
    </TxFlex>
  )
};

/** `className` 은 기본 클래스를 **교체하지 않고 덧붙는다.** */
export const CustomizingClass: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxCheckBox label="기본" />
      <TxCheckBox label="gap-4" className="gap-4" />
      <TxCheckBox label="글자를 크게" classNames={{ label: "text-lg font-bold" }} />
      <TxCheckBox label="rounded-lg bg-slate-100 px-3 py-2" className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-gray-800" />
    </TxFlex>
  )
};
