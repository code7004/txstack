import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxFileUpload } from "./TxFileUpload";
import type { TxUploadItem } from "./TxFileUpload.types";

/** 실제로 보내지 않고 진행률만 흘려보낸다. 실패도 흉내 낸다. */
const fakeUploader =
  (options: { failIf?: (file: File) => boolean } = {}) =>
  (file: File, { onProgress, signal }: { onProgress: (percent: number) => void; signal: AbortSignal }) =>
    new Promise<void>((resolve, reject) => {
      let percent = 0;

      const timer = setInterval(() => {
        percent += 12;
        onProgress(Math.min(percent, 100));

        if (percent >= 100) {
          clearInterval(timer);
          if (options.failIf?.(file)) reject(new Error("서버가 이 파일을 거절했습니다"));
          else resolve();
        }
      }, 180);

      signal.addEventListener("abort", () => {
        clearInterval(timer);
        reject(new Error("취소됨"));
      });
    });

const meta = {
  title: "Form/TxFileUpload",
  component: TxFileUpload,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "파일을 골라 올리는 자리.",
          "",
          "```tsx",
          'import { TxFileUpload } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxFileUpload",
          '  accept="image/*"',
          "  maxSize={5 * 1024 * 1024}",
          "  uploader={async (file, { onProgress, signal }) => {",
          "    await api.upload(file, { onUploadProgress: (e) => onProgress(e.progress * 100), signal });",
          "  }}",
          "/>;",
          "```",
          "",
          "### 어디로 어떻게 보내는지 모른다",
          "",
          "주소도 헤더도 응답 봉투도 **앱의 것**이라 `uploader` 로 주입받는다. 그것을 패키지가",
          "정하면 그 규약을 쓰는 앱에서만 쓸 수 있다. 성공하면 그냥 끝나고, 실패하면 던진다.",
          "",
          "함께 건네는 것은 둘이다 — 진행률을 알리는 **`onProgress`** 와, 취소되면 끊기는",
          "**`signal`**(`fetch` 나 `axios` 에 그대로 넘긴다).",
          "",
          "### 다시 시도는 파일 단위다",
          "",
          "열 개 중 하나가 실패했다고 **다 올린 아홉을 또 보내지 않는다.** 실패한 줄에만",
          "`다시` 가 붙는다.",
          "",
          "### 끌어다 놓기와 눌러서 고르기가 둘 다 된다",
          "",
          "끌어다 놓기만 두면 **키보드로는 파일을 고를 길이 없다.** 그래서 고르는 자리를",
          "진짜 `<button>` 으로 두고, 숨긴 `<input type=\"file\">` 을 함께 둔다 — 그것도",
          "`display: none` 이 아니라 화면에서만 감춘다(폼 제출에 실려야 한다).",
          "",
          "크기 제한은 **고르는 순간** 본다. 올려 보고 나서 알려 주면 그동안 기다린 것이 헛수고다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { multiple: true },
  argTypes: {
    accept: { control: "text" },
    multiple: { control: "boolean" },
    maxSize: { control: "number" },
    maxFiles: { control: "number" },
    disabled: { control: "boolean" },
    uploader: { control: false },
    onChange: { control: false },
    children: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-file-upload` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxFileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxInlineSize: "32rem" }}>
      <TxFileUpload {...args} uploader={fakeUploader()} />
    </div>
  )
};

/** **파일을 골라 보라.** 진행률이 흐르고 끝나면 완료로 바뀐다. */
export const Basic: Story = {
  parameters: noControls,
  render: function BasicStory() {
    const [items, setItems] = useState<TxUploadItem[]>([]);

    return (
      <div className="flex flex-col gap-3" style={{ maxInlineSize: "32rem" }}>
        <TxFileUpload uploader={fakeUploader()} onChange={setItems} />
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{items.map((item) => `${item.file.name}:${item.status}`).join(" · ") || "—"}</p>
      </div>
    );
  }
};

/**
 * **이름에 `bad` 가 든 파일은 실패한다.** 실패한 줄에만 `다시` 가 붙고,
 * 눌러도 **성공한 파일은 다시 보내지 않는다.**
 */
export const Retry: Story = {
  parameters: noControls,
  render: () => (
    <div style={{ maxInlineSize: "32rem" }}>
      <TxFileUpload uploader={fakeUploader({ failIf: (file) => file.name.includes("bad") })} />
    </div>
  )
};

/** 크기와 개수를 제한한다. **큰 파일은 올리기 전에 걸러진다.** */
export const Limits: Story = {
  parameters: noControls,
  render: () => (
    <div style={{ maxInlineSize: "32rem" }}>
      <TxFileUpload uploader={fakeUploader()} accept="image/*" maxSize={100 * 1024} maxFiles={3} />
    </div>
  )
};

/** `uploader` 를 안 주면 **고르기만 하고 올리지 않는다.** 폼과 함께 낼 때 쓴다. */
export const PickOnly: Story = {
  parameters: noControls,
  render: () => (
    <div style={{ maxInlineSize: "32rem" }}>
      <TxFileUpload multiple={false} />
    </div>
  )
};

/** 고르는 자리의 글자를 바꾸거나 잠근다. */
export const Custom: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex flex-col gap-4" style={{ maxInlineSize: "32rem" }}>
      <TxFileUpload uploader={fakeUploader()}>
        <span className="tx-file-upload__hint">📎 견적서를 올려 주세요</span>
        <span className="tx-file-upload__accept">PDF · XLSX</span>
      </TxFileUpload>

      <TxFileUpload disabled />
    </div>
  )
};
