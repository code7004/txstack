import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxInput } from "../TxInput";
import { TxTextarea } from "./TxTextarea";
import type { TxTextareaRef } from "./TxTextarea.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Form/TxTextarea",
  component: TxTextarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "여러 줄 입력.",
          "",
          "```tsx",
          'import { TxTextarea } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxTextarea placeholder="내용" onChangeText={setBody} />;',
          "```",
          "",
          "- `onChangeText` — 값이 바뀔 때마다. `TxInput` 과 같은 이름이다",
          "- `onBlurText` — 포커스가 빠질 때",
          "- `autoGrow` — 내용에 맞춰 높이가 늘어난다. 기본 `false`",
          "",
          "**껍데기는 `TxInput` 과 같은 것을 쓴다.** `.tx-input` 클래스를 함께 걸어 테두리·배경·포커스 링·흐림 처리를 그대로 받고,",
          "여기서는 높이만 되돌린다. 원본은 각자 그리다 배경 선언을 빠뜨려서 **텍스트영역만 배경이 없었다** — 다크모드에서 부모가 비쳤다.",
          "입력한 글자도 `gray-500` 으로 흐렸다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    placeholder: { control: "text" },
    rows: { control: { type: "number", min: 1, max: 20 } },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    autoGrow: { control: "boolean", description: "내용에 맞춰 높이가 늘어난다. 켜면 손잡이가 사라진다" },
    className: { control: "text", description: "`.tx-textarea` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { placeholder: "내용을 입력하세요", disabled: false, readOnly: false, autoGrow: false, className: "w-96" }
};

/**
 * **이 스토리가 원본의 결함을 본다.**
 *
 * 입력창과 나란히 놓았을 때 테두리 색·굵기·모서리·배경이 같아야 한다.
 * 툴바에서 **다크로 바꿔 보면** 원본에서 텍스트영역만 배경이 비쳤던 자리가 보인다.
 * 글자를 넣어 보면 입력창과 같은 진하기로 나온다.
 */
export const SharesShellWithTxInput: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-96 flex-col items-stretch gap-3">
      <TxInput defaultValue="TxInput — 같은 껍데기" />
      <TxTextarea defaultValue="TxTextarea — 테두리·배경·글자색이 같아야 한다" />
    </TxFlex>
  )
};

/** 상태별 겉모습. `readOnly` 와 `disabled` 는 같은 흐림을 쓴다 — `TxInput` 과 같다. */
export const States: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-96 flex-col items-stretch gap-3">
      <TxTextarea placeholder="기본" />
      <TxTextarea defaultValue="값이 있는 상태" />
      <TxTextarea defaultValue="읽기 전용" readOnly />
      <TxTextarea defaultValue="비활성" disabled />
    </TxFlex>
  )
};

/**
 * **줄바꿈해도 콜백이 한 번만 온다.**
 *
 * 원본은 `onChangedText` 하나가 값 변경·Enter·blur 세 곳에서 불렸다.
 * Enter 는 줄바꿈이라 `change` 로 이미 오는데 같은 값으로 한 번 더 왔고, blur 는 값이 안 바뀌어도 왔다.
 *
 * 아래에서 Enter 로 줄을 바꿔 보고, 포커스를 빼 보라.
 */
export const Events: Story = {
  parameters: noControls,
  render: function EventsStory() {
    const [log, setLog] = useState<string[]>([]);
    const push = (line: string) => setLog((prev) => [line, ...prev].slice(0, 8));

    return (
      <TxFlex className="w-96 flex-col items-stretch gap-3">
        <TxTextarea placeholder="Enter 로 줄을 바꾸고, 포커스를 빼 보세요" onChangeText={(v) => push(`onChangeText(${JSON.stringify(v)})`)} onBlurText={(v) => push(`onBlurText(${JSON.stringify(v)})`)} />
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{log.length === 0 ? "—" : log.map((line, i) => <div key={i}>{line}</div>)}</div>
      </TxFlex>
    );
  }
};

/**
 * **`autoGrow` 는 내용에 맞춰 높이가 늘고 줄어든다.**
 *
 * 왼쪽은 손으로 늘리는 손잡이가 있고(기본), 오른쪽은 손잡이 대신 자동이다.
 * 둘을 같이 두지 않는 이유는 타이핑할 때마다 사용자가 맞춰 둔 높이가 덮이기 때문이다.
 *
 * 여러 줄을 넣었다 지워 보면 `--tx-textarea-min-height` 아래로는 줄지 않는다.
 */
export const AutoGrow: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-start">
      <TxTextarea className="w-72" placeholder="기본 — 손잡이로 늘린다" />
      <TxTextarea className="w-72" autoGrow placeholder="autoGrow — 내용만큼 늘어난다" />
    </TxFlex>
  )
};

/** `ref` 로 값을 읽고 쓰고 포커스한다. `getValue` 는 **DOM 에서 직접 읽어** 항상 최신이다. */
export const ImperativeRef: Story = {
  parameters: noControls,
  render: function ImperativeRefStory() {
    const ref = useRef<TxTextareaRef>(null);
    const [read, setRead] = useState("");

    return (
      <TxFlex className="w-96 flex-col items-stretch gap-3">
        <TxTextarea ref={ref} autoGrow defaultValue="타이핑한 뒤 눌러 보세요" />
        <TxFlex>
          <TxButton variant="secondary" label="getValue" onClick={() => setRead(ref.current?.getValue() ?? "")} />
          <TxButton variant="secondary" label="setValue" onClick={() => ref.current?.setValue("여러 줄로\n바깥에서\n넣은 값")} />
          <TxButton variant="ghost" label="focus" onClick={() => ref.current?.focus()} />
        </TxFlex>
        <pre className="font-mono text-xs whitespace-pre-wrap text-slate-500 dark:text-slate-400">읽은 값: {read || "—"}</pre>
      </TxFlex>
    );
  }
};

/** 토큰 한 줄로 바꾼다. 껍데기 토큰(`--tx-input-*`)도 그대로 먹는다. */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-96 flex-col items-stretch gap-3">
      <TxTextarea placeholder="기본" />
      <TxTextarea placeholder="--tx-textarea-min-height: 3rem" style={vars({ "--tx-textarea-min-height": "3rem" })} />
      <TxTextarea placeholder="--tx-input-border-color: 강조색" style={vars({ "--tx-input-border-color": "var(--tx-color-primary)" })} />
      <TxTextarea placeholder="--tx-radius: 1rem" style={vars({ "--tx-radius": "1rem" })} />
    </TxFlex>
  )
};

/** `className` 은 기본 클래스를 **교체하지 않고 덧붙는다.** `@layer tx` 덕분에 소비자 클래스가 이긴다. */
export const CustomizingClass: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-96 flex-col items-stretch gap-3">
      <TxTextarea placeholder="기본" />
      <TxTextarea placeholder="min-h-40" className="min-h-40" />
      <TxTextarea placeholder="rounded-2xl" className="rounded-2xl" />
      <TxTextarea placeholder="border-2 border-dashed" className="border-2 border-dashed" />
    </TxFlex>
  )
};
