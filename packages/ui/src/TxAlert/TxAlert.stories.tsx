import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxAlert } from "./TxAlert";
import type { TxAlertVariant } from "./TxAlert.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const VARIANTS: TxAlertVariant[] = ["info", "success", "warning", "danger"];

const meta = {
  title: "Feedback/TxAlert",
  component: TxAlert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "페이지 안에 박히는 안내 상자.",
          "",
          "```tsx",
          'import { TxAlert } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxAlert variant="danger">저장하지 못했습니다.</TxAlert>;',
          "",
          '<TxAlert variant="warning" title="결제 수단이 곧 만료됩니다">',
          "  9월 30일 이후에는 자동 결제가 중단됩니다.",
          "  <TxAlert.Actions>",
          '    <TxButton label="카드 변경" />',
          "  </TxAlert.Actions>",
          "</TxAlert>;",
          "```",
          "",
          "### 뜨는 것이 아니라 자리를 차지한다",
          "",
          "나타났다 사라지는 알림은 **`TxToast`** 가 맡는다. 그쪽이 이 겉모습을 그대로 쓰고",
          "`variant` 어휘도 같으니, 하나를 익히면 둘에 통한다. `TxBadge` 도 같은 넷을 쓴다.",
          "",
          "### 색만으로 알리지 않는다",
          "",
          "갈래는 **색 · 아이콘 · 글자 셋으로** 알린다. 색만 쓰면 색을 못 보는 사람과",
          "스크린리더에는 아무것도 남지 않는다. 화면에는 안 보이지만 `안내:` · `완료:` ·",
          "`주의:` · `오류:` 가 각 상자 앞에 함께 실린다 (`variantLabel` 로 바꾼다).",
          "",
          "**`announce` 는 기본이 꺼져 있다.** 저장 결과처럼 동작에 대한 답으로 새로 나타나는",
          "알림에만 켠다 — 페이지에 처음부터 있던 안내를 읽어 주면 읽는 흐름을 끊는다.",
          "",
          "### 색은 하나만 갈린다",
          "",
          "```css",
          ".tx-alert { --tx-alert-accent: rebeccapurple; }",
          "```",
          "",
          "바탕 · 테두리 · 아이콘 색이 전부 이 하나에서 섞여 나온다. 라이트든 다크든 따라온다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { variant: "info", children: "설정을 저장하려면 먼저 이메일을 인증해야 합니다." },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    title: { control: "text" },
    announce: { control: "boolean" },
    variantLabel: { control: "text", description: "화면에는 안 보이고 스크린리더만 읽는다" },
    closeLabel: { control: "text" },
    icon: { control: false },
    onClose: { control: false },
    children: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-alert` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {};

/** 네 갈래. **`TxToast` · `TxBadge` 가 같은 어휘를 쓴다.** */
export const Variants: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <TxAlert variant="info">새 버전이 있습니다. 다음 접속 때 적용됩니다.</TxAlert>
      <TxAlert variant="success">저장했습니다.</TxAlert>
      <TxAlert variant="warning">결제 수단이 30일 뒤 만료됩니다.</TxAlert>
      <TxAlert variant="danger">저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.</TxAlert>
    </div>
  )
};

/** 제목을 주면 굵은 첫 줄이 생긴다. 본문 없이 제목만도 된다. */
export const WithTitle: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <TxAlert variant="warning" title="결제 수단이 곧 만료됩니다">
        2026년 9월 30일 이후에는 자동 결제가 중단되고, 이용 중인 요금제는 무료 등급으로 내려갑니다.
      </TxAlert>

      <TxAlert variant="success" title="저장했습니다" />
    </div>
  )
};

/** `TxAlert.Actions` 로 버튼 줄을 담는다. 본문 아래에 붙는다. */
export const WithActions: Story = {
  parameters: noControls,
  render: () => (
    <TxAlert variant="warning" title="결제 수단이 곧 만료됩니다" className="max-w-xl">
      2026년 9월 30일 이후에는 자동 결제가 중단됩니다.
      <TxAlert.Actions>
        <TxButton label="카드 변경" />
        <TxButton label="나중에" variant="secondary" />
      </TxAlert.Actions>
    </TxAlert>
  )
};

/**
 * `onClose` 를 주면 닫기 버튼이 생긴다. **안 주면 닫을 수 없다** —
 * 페이지에 박혀 있어야 하는 안내가 그 자리다.
 *
 * 사라지는 것은 소비자가 정한다. 콜백을 받고도 안 지우면 그대로 남는다.
 */
export const Closable: Story = {
  parameters: noControls,
  render: function ClosableStory() {
    const [shown, setShown] = useState(true);

    return (
      <div className="flex max-w-xl flex-col gap-3">
        {shown ? <TxAlert variant="info" onClose={() => setShown(false)}>이 안내는 닫을 수 있습니다.</TxAlert> : <TxButton label="다시 보이기" variant="secondary" onClick={() => setShown(true)} />}

        <TxAlert variant="danger">이쪽은 닫기 버튼이 없습니다.</TxAlert>
      </div>
    );
  }
};

/** 아이콘은 `icon={false}` 로 끄거나 다른 것으로 갈아끼운다. 크기와 색은 자리를 따라온다. */
export const Icons: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <TxAlert variant="success">기본 아이콘</TxAlert>
      <TxAlert variant="success" icon={false}>
        아이콘 없이
      </TxAlert>
      <TxAlert variant="success" icon={<span>🎉</span>}>
        갈아끼운 아이콘
      </TxAlert>
    </div>
  )
};

/**
 * **동작에 대한 답으로 새로 나타나는 알림에만 `announce` 를 켠다.**
 *
 * 켜면 스크린리더가 나타나는 순간 읽는다 — `danger` 는 즉시, 나머지는 하던 말이 끝난 뒤에.
 * 페이지에 처음부터 있던 안내에는 켜지 않는다.
 */
export const Announce: Story = {
  parameters: noControls,
  render: function AnnounceStory() {
    const [result, setResult] = useState<"none" | "ok" | "fail">("none");

    return (
      <div className="flex max-w-xl flex-col gap-3">
        <TxFlex>
          <TxButton label="저장 성공" onClick={() => setResult("ok")} />
          <TxButton label="저장 실패" variant="secondary" onClick={() => setResult("fail")} />
        </TxFlex>

        {result === "ok" && (
          <TxAlert variant="success" announce onClose={() => setResult("none")}>
            저장했습니다.
          </TxAlert>
        )}
        {result === "fail" && (
          <TxAlert variant="danger" announce onClose={() => setResult("none")}>
            저장하지 못했습니다.
          </TxAlert>
        )}
      </div>
    );
  }
};

/** 겉모습은 CSS 변수로 바꾼다. **`--tx-alert-accent` 하나가 바탕·테두리·아이콘을 함께 정한다.** */
export const Tokens: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <TxAlert variant="info">기본</TxAlert>
      <TxAlert style={vars({ "--tx-alert-accent": "rebeccapurple" })}>accent 만 바꿨다</TxAlert>
      <TxAlert variant="danger" style={vars({ "--tx-alert-radius": "0", "--tx-alert-padding": "1.25rem" })}>
        모서리와 여백
      </TxAlert>
    </div>
  )
};
