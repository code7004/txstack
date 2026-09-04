import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxFlex } from "../TxFlex";
import { TxTextarea } from "../TxTextarea";
import { TxCopyButton } from "./TxCopyButton";

const API_KEY = "tx_live_8213a4f0c9b74e2d";

const meta = {
  title: "Action/TxCopyButton",
  component: TxCopyButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "눌러서 글자를 복사하는 버튼.",
          "",
          "```tsx",
          'import { TxCopyButton } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxCopyButton value={apiKey} />",
          '<TxCopyButton value={() => editor.getValue()} label="설정 복사" variant="secondary" />',
          "```",
          "",
          "### 복사했는지 알려 준다",
          "",
          "눌러도 아무 일이 없어 보이면 **복사가 됐는지 알 길이 없다.** 잠깐 글자가 바뀌고,",
          "그 소식이 **스크린리더에도 간다** — 버튼 글자가 바뀌는 것만으로는 마우스로 누른 사람에게",
          "아무 소식이 없기 때문이다.",
          "",
          "실패하면 실패했다고 말한다. 조용히 넘어가면 사용자는 붙여넣기를 해 보고서야 안다.",
          "",
          "**기본 세 글자는 모두 같은 폭 안에 들도록 재서 정했다** — 글자가 바뀌어도 버튼이",
          "흔들리지 않는다. 더 긴 글자를 주면 `--tx-copy-button-min-width` 를 함께 올린다.",
          "",
          "### 지금 값을 그때 읽는다",
          "",
          "`value` 에 **함수**를 주면 누를 때 부른다. 편집기처럼 값이 계속 바뀌는 자리에 쓴다.",
          "",
          "### 평문 http 에서도 된다",
          "",
          "`navigator.clipboard` 는 **보안 컨텍스트(https · localhost)에서만** 있다.",
          "사내 도구가 평문 http 로 뜨는 일이 흔한데, 거기서는 숨긴 입력칸을 거쳐 복사한다 —",
          "낡은 길이지만 **그 자리에서는 유일한 길**이다.",
          "",
          "겉은 `TxButton` 이 그린다. `variant` 도 그쪽 것을 그대로 쓴다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { value: API_KEY },
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
    copiedLabel: { control: "text" },
    failedLabel: { control: "text" },
    duration: { control: { type: "number", min: 200, step: 100 } },
    variant: { control: "inline-radio", options: ["primary", "secondary", "danger"] },
    onCopied: { control: false },
    className: { control: "text", description: "`.tx-copy-button` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxCopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {};

/** **흔한 쓰임 — API 키.** 눌러 보면 글자가 잠깐 바뀐다. */
export const ApiKey: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <code className="rounded border px-3 py-2 font-mono text-sm">{API_KEY}</code>
      <TxCopyButton value={API_KEY} variant="secondary" />
    </TxFlex>
  )
};

/** 겉은 `TxButton` 이 그린다. `variant` 가 그대로 온다. */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxCopyButton value={API_KEY} />
      <TxCopyButton value={API_KEY} variant="secondary" />
      <TxCopyButton value={API_KEY} variant="danger" />
    </TxFlex>
  )
};

/** 글자를 바꾸고, 되돌아오는 시간도 정한다. */
export const Labels: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <TxCopyButton value={API_KEY} label="키 복사" copiedLabel="복사됨 ✓" />
      <TxCopyButton value={API_KEY} label="Copy" copiedLabel="Copied" variant="secondary" />
      <TxCopyButton value={API_KEY} label="오래 남는다" duration={4000} variant="secondary" />
    </TxFlex>
  )
};

/**
 * **함수를 주면 누를 때 읽는다.** 아래 칸을 고친 뒤 눌러 보라 —
 * 처음 값이 아니라 지금 값이 복사된다.
 */
export const LatestValue: Story = {
  parameters: noControls,
  render: function LatestValueStory() {
    const [text, setText] = useState('{ "theme": "dark" }');
    const [copied, setCopied] = useState<string | null>(null);

    return (
      <div className="flex max-w-md flex-col gap-3">
        <TxTextarea value={text} onChangeText={setText} rows={3} />

        <TxFlex>
          <TxCopyButton value={() => text} label="설정 복사" variant="secondary" onCopied={setCopied} />
        </TxFlex>

        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">복사한 것: {copied ?? "—"}</p>
      </div>
    );
  }
};
