import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxDialog } from "./TxDialog";

const meta = {
  title: "Overlay/TxDialog",
  component: TxButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "네이티브 `alert` · `confirm` 을 대신하는 확인창. **어디서든 부른다** —",
          "컴포넌트 안이든, axios 인터셉터든, 그냥 유틸 함수든.",
          "",
          "```tsx",
          'import { TxDialog } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          'await TxDialog.alert("처리할 수 없습니다.");',
          "",
          'if (await TxDialog.confirm("로그아웃 하시겠습니까?")) signOut();',
          "```",
          "",
          "**네이티브와 다른 점은 하나 — `await` 가 필요하다.**",
          "브라우저에서 자바스크립트를 멈춰 세울 방법이 없다.",
          "",
          "```tsx",
          "if (!confirm('재시도 하겠습니까?')) return;              // 네이티브",
          "if (!(await TxDialog.confirm('재시도 하겠습니까?'))) return;  // 이것",
          "```",
          "",
          "**닫는 길은 `TxModal` 과 다르다.**",
          "",
          "| 닫는 길 | TxModal | TxDialog |",
          "| --- | --- | --- |",
          "| 닫기 버튼(X) | 있다 | **없다** — 취소 버튼과 뜻이 겹친다 |",
          "| 바깥(어두운 바탕) 클릭 | 닫힌다 | **막는다** |",
          "| Escape | 닫힌다 | 닫힌다 → `false` |",
          "",
          '바깥 클릭만 막는 이유는 **잘못 누른 것이 "취소를 골랐다" 가 되면 안 되기** 때문이다.',
          "Escape 는 그와 달리 분명한 의사표시라 네이티브 `confirm` 처럼 `false` 로 친다 —",
          "키보드만 쓰는 사람에게 빠져나갈 길이기도 하다.",
          "",
          "- 취소 버튼도 `false` 다",
          "- 바깥 클릭으로 닫히는 창이 필요하면 그건 `TxModal` 의 일이다",
          "- 연달아 불러도 **겹치지 않고 차례로** 뜬다 — 사람은 한 번에 하나만 답한다",
          "- 문구의 **줄바꿈(`\\n`)이 그대로 보인다**",
          "- 창은 `TxModal` 이 그린다. 포커스 트랩·Escape 가 거기서 해결돼 있다",
          "",
          "기본 문구는 `확인` · `취소` 다. 앱 전체를 한 번에 바꾸려면 시작할 때 한 줄 준다.",
          "",
          "```ts",
          'TxDialog.configure({ labels: { confirm: "OK", cancel: "Cancel" } });',
          "```",
          "",
          "> 아래 버튼들은 **실제로 눌러 보는 자리**다. 답이 그 아래에 찍힌다."
        ].join("\n")
      }
    }
  },
  argTypes: { label: { control: false }, onClick: { control: false } }
} satisfies Meta<typeof TxButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

/** 결과를 찍어 주는 껍데기. 스토리에서만 쓴다. */
const Result = ({ value }: { value: string }) => <div className="font-mono text-sm text-slate-500 dark:text-slate-400">결과: {value}</div>;

/** 알리고 확인만 받는다. 버튼이 하나다. */
export const Alert: Story = {
  parameters: noControls,
  render: function AlertStory() {
    const [result, setResult] = useState("—");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxButton
          label="alert"
          onClick={async () => {
            setResult("기다리는 중…");
            await TxDialog.alert("처리할 수 없습니다.");
            setResult("닫혔다");
          }}
        />
        <Result value={result} />
      </TxFlex>
    );
  }
};

/**
 * 예/아니오를 받는다. **취소와 Escape 가 `false`** 다 — 네이티브 `confirm` 과 같다.
 * Escape 를 눌러 결과가 `false` 로 찍히는 것도 확인해 보라.
 *
 * **바깥을 눌러도 닫히지 않는다** — 잘못 누른 것이 "취소를 골랐다" 가 되면 안 된다.
 */
export const Confirm: Story = {
  parameters: noControls,
  render: function ConfirmStory() {
    const [result, setResult] = useState("—");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxButton
          label="confirm"
          onClick={async () => {
            const ok = await TxDialog.confirm("로그아웃 하시겠습니까?");
            setResult(String(ok));
          }}
        />
        <Result value={result} />
      </TxFlex>
    );
  }
};

/**
 * **되돌릴 수 없는 동작**은 `tone: "danger"` 로 확인 버튼을 붉게 한다.
 * 색만 바꾸는 게 아니라 "이건 파괴적이다" 를 알리는 자리다.
 */
export const Danger: Story = {
  parameters: noControls,
  render: function DangerStory() {
    const [result, setResult] = useState("—");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxButton
          label="삭제"
          variant="danger"
          onClick={async () => {
            const ok = await TxDialog.confirm({
              title: "파트너 삭제",
              message: "삭제하면 되돌릴 수 없습니다.\n정말 삭제하시겠습니까?",
              tone: "danger",
              confirmLabel: "삭제",
              cancelLabel: "그대로 두기"
            });
            setResult(ok ? "삭제했다" : "그대로 뒀다");
          }}
        />
        <Result value={result} />
      </TxFlex>
    );
  }
};

/**
 * **줄바꿈이 그대로 보인다.** 네이티브 `confirm` 이 `\n` 을 줄로 바꾸므로,
 * 옮겨 온 문구가 한 줄로 뭉치면 안 된다.
 */
export const MultiLine: Story = {
  parameters: noControls,
  render: function MultiLineStory() {
    const [result, setResult] = useState("—");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxButton
          label="여러 줄 문구"
          onClick={async () => {
            const ok = await TxDialog.confirm("선택 콜백을 재시도 하겠습니까?\n상태가 FAILED 인 경우 재시도 합니다.");
            setResult(String(ok));
          }}
        />
        <Result value={result} />
      </TxFlex>
    );
  }
};

/**
 * **연달아 불러도 겹치지 않는다.** 세 개를 한 번에 띄워도 차례로 뜬다 —
 * 사람은 한 번에 하나만 답할 수 있다.
 *
 * 아래 버튼은 세 개를 동시에 부른다. 하나씩 답해 보라.
 */
export const Queued: Story = {
  parameters: noControls,
  render: function QueuedStory() {
    const [result, setResult] = useState("—");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxButton
          label="세 개를 한 번에"
          onClick={() => {
            setResult("기다리는 중…");
            void Promise.all([TxDialog.confirm("첫째"), TxDialog.confirm("둘째"), TxDialog.confirm("셋째")]).then((answers) => setResult(answers.join(" · ")));
          }}
        />
        <Result value={result} />
      </TxFlex>
    );
  }
};

/**
 * 문구를 앱 전체에서 바꾼다. 시작할 때 한 번 부른다.
 *
 * 아래 버튼으로 바꾼 뒤 다른 스토리를 열어 보면 그대로 적용돼 있다.
 */
export const Labels: Story = {
  parameters: noControls,
  render: function LabelsStory() {
    const [result, setResult] = useState("—");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxFlex>
          <TxButton
            label="영어로 바꾸기"
            variant="secondary"
            onClick={() => {
              TxDialog.configure({ labels: { confirm: "OK", cancel: "Cancel" } });
              setResult("바꿨다");
            }}
          />
          <TxButton
            label="한글로 되돌리기"
            variant="secondary"
            onClick={() => {
              TxDialog.configure({ labels: { confirm: "확인", cancel: "취소" } });
              setResult("되돌렸다");
            }}
          />
        </TxFlex>

        <TxButton
          label="confirm 열기"
          onClick={async () => {
            const ok = await TxDialog.confirm("Are you sure?");
            setResult(String(ok));
          }}
        />
        <Result value={result} />
      </TxFlex>
    );
  }
};

/**
 * **컴포넌트가 아닌 곳에서도 부른다.** 이게 훅 대신 `TxDialog.alert()` 로 만든 이유다 —
 * axios 인터셉터나 유틸 함수에서는 훅을 쓸 수 없다.
 */
export const OutsideReact: Story = {
  parameters: noControls,
  render: function OutsideReactStory() {
    const [result, setResult] = useState("—");

    // 컴포넌트 바깥의 평범한 함수. 실제로는 인터셉터나 유틸이 이 자리다
    async function handleExpired() {
      await TxDialog.alert("인증 유효시간이 만료되었습니다.\n다시 로그인 해주세요.");
      return "로그인 화면으로";
    }

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxButton label="세션 만료 흉내" onClick={async () => setResult(await handleExpired())} />
        <Result value={result} />
      </TxFlex>
    );
  }
};
