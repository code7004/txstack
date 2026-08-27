import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxInput } from "./TxInput";
import type { TxSearchInputRef } from "./TxInput.types";
import { TxSearchInput } from "./TxSearchInput";

const meta = {
  title: "Form/TxSearchInput",
  component: TxSearchInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "검색용 한 줄 입력. `TxInput` 에 **돋보기와 지우기 버튼**을 얹는다.",
          "",
          "```tsx",
          'import { TxSearchInput } from "@txstack/ui";',
          "",
          '<TxSearchInput placeholder="검색어" onSubmitText={search} onClear={() => search("")} />;',
          "```",
          "",
          "- 돋보기를 누르거나 Enter 를 치면 `onSubmitText`",
          '- **값이 있을 때만** 지우기 버튼이 나온다. 누르면 `onClear` 와 `onChangeText("")`',
          "- `TxInput` 의 props 를 그대로 받는다",
          "",
          "**두 아이콘은 진짜 `<button>` 이다.** Tab 으로 이동할 수 있고, 스크린리더가 버튼으로 읽는다.",
          "마우스 없이도 검색과 지우기를 쓸 수 있다.",
          "",
          "겉모습은 `TxInput` 과 같은 토큰을 쓴다. 나란히 놓아도 높이와 테두리가 맞는다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    className: { control: "text", description: "`.tx-search-input` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxSearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { placeholder: "검색어", disabled: false, className: "w-80" }
};

/** 값이 있을 때만 지우기 버튼이 나온다. 타이핑해 보면 오른쪽에 생긴다. */
export const ClearButton: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxSearchInput placeholder="비어 있음 — 돋보기만" className="w-80" />
      <TxSearchInput defaultValue="값이 있음" className="w-80" onClear={() => {}} />
    </TxFlex>
  )
};

/**
 * 검색과 지우기가 언제 불리는지 본다.
 *
 * 돋보기 클릭 · Enter 둘 다 `onSubmitText` 다.
 */
export const Events: Story = {
  parameters: noControls,
  render: function EventsStory() {
    const [log, setLog] = useState<string[]>([]);
    const push = (line: string) => setLog((prev) => [line, ...prev].slice(0, 6));

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxSearchInput className="w-80" placeholder="타이핑하고 Enter 나 돋보기" onSubmitText={(v) => push(`onSubmitText("${v}")`)} onClear={() => push('onClear("")')} onChangeText={(v) => push(`onChangeText("${v}")`)} />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">{log.length === 0 ? "—" : log.map((line, i) => <div key={i}>{line}</div>)}</div>
      </TxFlex>
    );
  }
};

/**
 * **밖에서 값을 바꿔도 지우기 버튼이 따라온다.**
 *
 * 지우기 버튼은 **값이 있으면 나온다.** 타이핑으로 넣든 `value` 로 넣든 똑같이 따라온다.
 *
 * 아래 버튼으로 값을 넣었다 비워 보면 오른쪽 버튼이 같이 나타났다 사라진다.
 */
export const ControlledValue: Story = {
  parameters: noControls,
  render: function ControlledValueStory() {
    const [value, setValue] = useState("");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxSearchInput className="w-80" value={value} onChangeText={setValue} onClear={() => setValue("")} />
        <TxFlex>
          <TxButton variant="secondary" label="밖에서 넣기" onClick={() => setValue("밖에서 넣은 값")} />
          <TxButton variant="ghost" label="비우기" onClick={() => setValue("")} />
        </TxFlex>
      </TxFlex>
    );
  }
};

/** `ref` 로 검색·지우기를 프로그램에서 부른다. `getValue` 는 항상 최신이다. */
export const ImperativeRef: Story = {
  parameters: noControls,
  render: function ImperativeRefStory() {
    const ref = useRef<TxSearchInputRef>(null);
    const [submitted, setSubmitted] = useState("");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxSearchInput ref={ref} className="w-80" placeholder="타이핑한 뒤 눌러 보세요" onSubmitText={setSubmitted} />
        <TxFlex>
          <TxButton variant="secondary" label="submit()" onClick={() => ref.current?.submit()} />
          <TxButton variant="secondary" label="clear()" onClick={() => ref.current?.clear()} />
          <TxButton variant="ghost" label="focus()" onClick={() => ref.current?.focus()} />
        </TxFlex>
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">제출된 값: {submitted || "—"}</div>
      </TxFlex>
    );
  }
};

/** 폼에 나란히 놓았을 때. 높이와 테두리가 `TxInput`·`TxButton` 과 맞는다. */
export const AlignsWithTxInput: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center">
      <TxInput placeholder="TxInput" className="w-48" />
      <TxSearchInput placeholder="TxSearchInput" className="w-64" />
      <TxButton label="검색" />
    </TxFlex>
  )
};
