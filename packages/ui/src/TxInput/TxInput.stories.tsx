import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxInput } from "./TxInput";
import type { TxInputRef } from "./TxInput.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Form/TxInput",
  component: TxInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "한 줄 입력. **문자열과 숫자를 한 자리에서 다룬다.**",
          "",
          "```tsx",
          'import { TxInput } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxInput placeholder="이름" onChangeText={setName} />;',
          "```",
          "",
          "- `value` 를 주면 controlled, 안 주면 uncontrolled 다. 둘 다 `ref.getValue()` 로 현재 값을 읽는다.",
          "- `onChangeNumber` 는 **숫자로 못 읽으면 `undefined`** 를 준다. 값을 지웠을 때도 콜백이 온다.",
          "- `onEnter` 는 `onSubmitText`·`onSubmitNumber` 보다 먼저 불린다.",
          "- 테두리·배경·포커스 링은 **래퍼가 소유하고 `<input>` 은 투명하다.** 아이콘을 나란히 놓아도 테두리가 하나로 보인다.",
          "",
          "겉모습은 CSS 변수로 바꾼다 — 앱 전체는 `:root { --tx-color-surface: … }`, 이 컴포넌트만은 `.tx-input { --tx-input-height: … }`.",
          "",
          "돋보기와 지우기 버튼이 필요하면 `TxSearchInput` 을 쓴다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    type: { control: "select", options: ["text", "number", "password", "file"] },
    className: { control: "text", description: "`.tx-input` 에 덧붙는다 (교체 아님)" },
    focusOnMount: { control: "boolean", description: "마운트 시 `true` 면 포커스한다" }
  }
} satisfies Meta<typeof TxInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { placeholder: "입력하세요", disabled: false, readOnly: false, type: "text", className: "" }
};

/** 상태별 겉모습. `readOnly` 와 `disabled` 는 같은 흐림을 쓰고, 커서로 구분된다. */
export const States: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxInput placeholder="기본" />
      <TxInput defaultValue="값이 있는 상태" />
      <TxInput defaultValue="읽기 전용" readOnly />
      <TxInput defaultValue="비활성" disabled />
    </TxFlex>
  )
};

/** `type` 별. 숫자는 오른쪽 정렬, 파일은 선택 버튼이 강조색을 따라간다. */
export const Types: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxInput type="text" placeholder="text" />
      <TxInput type="number" placeholder="number" defaultValue={1234} />
      <TxInput type="password" defaultValue="secret" />
      <TxInput type="file" />
    </TxFlex>
  )
};

/**
 * `onChangeNumber` 는 **숫자로 읽을 수 없을 때 `undefined` 를 준다.**
 * 값을 지워도 콜백이 오므로 "비었다" 를 따로 감시하지 않아도 된다.
 *
 * 숫자를 넣었다 지워 보면 아래가 `undefined` 로 바뀐다.
 */
export const NumberCallbacks: Story = {
  parameters: noControls,
  render: function NumberCallbacksStory() {
    const [num, setNum] = useState<number | undefined>(undefined);
    const [blurred, setBlurred] = useState<number | undefined>(undefined);

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxInput type="number" placeholder="숫자를 넣고 지워 보세요" onChangeNumber={setNum} onBlurNumber={setBlurred} />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">
          onChangeNumber: {String(num)}
          <br />
          onBlurNumber: {String(blurred)}
        </div>
      </TxFlex>
    );
  }
};

/** `ref` 로 값을 읽고, 넣고, 포커스한다. `getValue` 는 언제 불러도 지금 화면에 있는 값을 준다. */
export const ImperativeRef: Story = {
  parameters: noControls,
  render: function ImperativeRefStory() {
    const ref = useRef<TxInputRef>(null);
    const [read, setRead] = useState("");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxInput ref={ref} defaultValue="타이핑한 뒤 눌러 보세요" className="w-80" />
        <TxFlex>
          <TxButton variant="secondary" label="getValue" onClick={() => setRead(ref.current?.getValue() ?? "")} />
          <TxButton variant="secondary" label="setValue" onClick={() => ref.current?.setValue("바깥에서 넣은 값")} />
          <TxButton variant="ghost" label="focus + select" onClick={() => (ref.current?.focus(), ref.current?.select())} />
        </TxFlex>
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">읽은 값: {read || "—"}</div>
      </TxFlex>
    );
  }
};

/** controlled 는 소비자가 값의 주인이다. `ref.setValue` 는 먹지 않는다. */
export const Controlled: Story = {
  parameters: noControls,
  render: function ControlledStory() {
    const [value, setValue] = useState("kim");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxInput value={value} onChangeText={setValue} className="w-80" />
        <TxFlex>
          <TxButton variant="secondary" label="밖에서 바꾸기" onClick={() => setValue("바깥에서")} />
          <TxButton variant="ghost" label="비우기" onClick={() => setValue("")} />
        </TxFlex>
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">state: {value || "—"}</div>
      </TxFlex>
    );
  }
};

/**
 * 토큰 한 줄로 바꾼다. **컴포넌트 CSS 를 건드리지 않는다.**
 *
 * `--tx-color-*` 는 전역이라 다른 컴포넌트도 함께 따라오고, `--tx-input-*` 는 이 컴포넌트만이다.
 */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxInput placeholder="기본" />
      <TxInput placeholder="--tx-input-height: 3rem" style={vars({ "--tx-input-height": "3rem" })} />
      <TxInput placeholder="--tx-radius: 9999px" style={vars({ "--tx-radius": "9999px" })} />
      <TxInput placeholder="--tx-input-border-color: 강조색" style={vars({ "--tx-input-border-color": "var(--tx-color-primary)" })} />
      <TxInput placeholder="--tx-input-border-width: 2px" style={vars({ "--tx-input-border-width": "2px" })} />
    </TxFlex>
  )
};

/**
 * `className` 은 기본 클래스를 **교체하지 않고 덧붙는다.**
 *
 * 우리 스타일이 `@layer tx` 안에 있어서, 레이어를 안 쓰는 소비자 CSS 는 물론
 * Tailwind 유틸리티도 이긴다.
 */
export const CustomizingClass: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxInput placeholder="기본" />
      <TxInput placeholder="w-96" className="w-96" />
      <TxInput placeholder="rounded-full" className="rounded-full" />
      <TxInput placeholder="border-2 border-dashed" className="border-2 border-dashed" />
    </TxFlex>
  )
};
