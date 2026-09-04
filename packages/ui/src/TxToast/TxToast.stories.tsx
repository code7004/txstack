import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxModal } from "../TxModal";
import { TxToast } from "./TxToast";
import type { TxToastPosition } from "./TxToast.types";

const POSITIONS: TxToastPosition[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];

const meta = {
  title: "Feedback/TxToast",
  parameters: {
    docs: {
      description: {
        component: [
          "떴다 사라지는 알림. **어디서든 부른다** — 컴포넌트 안이든, axios 인터셉터든, 그냥 유틸 함수든.",
          "",
          "```ts",
          'import { TxToast } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          'TxToast.show("저장했습니다");',
          'TxToast.show({ variant: "danger", message: "저장하지 못했습니다" });',
          "",
          "// 놓치면 안 되는 것은 스스로 사라지지 않게 한다",
          'const id = TxToast.show({ variant: "danger", message: "연결이 끊겼습니다", duration: 0 });',
          "TxToast.dismiss(id);",
          "```",
          "",
          "### `TxAlert` 과 짝이다",
          "",
          "겉은 **`TxAlert`** 이 그대로 그린다 — `variant` 어휘(`info` · `success` · `warning` ·",
          "`danger`)도 색도 아이콘도 같다. 하나를 익히면 둘에 통한다.",
          "**페이지에 박혀 있어야 하는 안내는 `TxAlert`**, 떴다 사라지는 것은 이쪽이다.",
          "",
          "### 모달 위에도 뜬다",
          "",
          "`TxModal` · `TxSlidePanel` 은 네이티브 `<dialog>` 라 **top layer** 에 올라간다.",
          "거기는 `z-index` 로 닿을 수 없어서, 보통의 토스트는 모달이 열려 있는 동안 **뒤에 가려",
          "보이지 않는다.** 저장 실패를 모달 안에서 알리는데 그게 안 보이면 알림이 아니다.",
          "그래서 이쪽도 같은 층(`popover`)을 쓴다.",
          "",
          "### 시계를 멈출 수 있다",
          "",
          "마우스를 얹거나 **키보드로 안에 들어오면** 사라지는 시계가 멈추고, 벗어나면",
          "**남은 시간만** 이어 센다. 읽는 속도는 사람마다 다르고, 시간이 정해진 것을 늘릴 길이",
          "없으면 못 읽고 놓친다.",
          "",
          "### 앱 전체 기본값",
          "",
          "```ts",
          'TxToast.configure({ position: "bottom-center", duration: 6000, max: 3 });',
          "```",
          "",
          "`max` 를 넘으면 **가장 오래된 것부터 사라진다** — 화면이 알림으로 덮이면 정작 새로 온 것을 못 본다."
        ].join("\n")
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 네 갈래. **`TxAlert` 과 같은 어휘다.** */
export const Variants: Story = {
  render: () => (
    <TxFlex>
      <TxButton label="info" variant="secondary" onClick={() => void TxToast.show("새 버전이 있습니다.")} />
      <TxButton label="success" variant="secondary" onClick={() => void TxToast.show({ variant: "success", message: "저장했습니다." })} />
      <TxButton label="warning" variant="secondary" onClick={() => void TxToast.show({ variant: "warning", message: "결제 수단이 30일 뒤 만료됩니다." })} />
      <TxButton label="danger" variant="secondary" onClick={() => void TxToast.show({ variant: "danger", message: "저장하지 못했습니다." })} />
    </TxFlex>
  )
};

/** 제목을 주면 굵은 첫 줄이 생긴다. 여러 번 누르면 **함께 쌓인다.** */
export const Stacking: Story = {
  render: () => (
    <TxFlex>
      <TxButton label="하나 더 띄우기" onClick={() => void TxToast.show({ variant: "success", title: "업로드 완료", message: `report-${Math.floor(Math.random() * 900) + 100}.csv` })} />
      <TxButton label="전부 닫기" variant="secondary" onClick={() => TxToast.dismissAll()} />
    </TxFlex>
  )
};

/**
 * **마우스를 얹거나 Tab 으로 들어가 보라.** 사라지는 시계가 멈추고, 벗어나면
 * 남은 시간만 이어 센다.
 */
export const PauseOnHover: Story = {
  render: () => <TxButton label="8초짜리 띄우기" onClick={() => void TxToast.show({ title: "마우스를 얹어 보세요", message: "얹는 동안은 사라지지 않습니다.", duration: 8000 })} />
};

/**
 * **`duration: 0` 이면 스스로 사라지지 않는다.** 놓치면 안 되는 오류가 그 자리다 —
 * 사용자가 닫거나, 앱이 번호로 닫는다.
 */
export const Persistent: Story = {
  render: function PersistentStory() {
    const [id, setId] = useState<number | null>(null);

    return (
      <TxFlex>
        <TxButton label="연결 끊김 알리기" variant="danger" disabled={id !== null} onClick={() => setId(TxToast.show({ variant: "danger", title: "연결이 끊겼습니다", message: "다시 연결될 때까지 이 알림은 사라지지 않습니다.", duration: 0 }))} />
        <TxButton
          label="다시 연결됨"
          variant="secondary"
          disabled={id === null}
          onClick={() => {
            if (id !== null) TxToast.dismiss(id);
            setId(null);
            TxToast.show({ variant: "success", message: "다시 연결됐습니다." });
          }}
        />
      </TxFlex>
    );
  }
};

/** 여섯 구석 중 하나에 쌓인다. `TxToast.configure({ position })` 로 앱 전체를 한 번에 정한다. */
export const Positions: Story = {
  render: () => (
    <TxFlex>
      {POSITIONS.map((position) => (
        <TxButton
          key={position}
          label={position}
          variant="secondary"
          onClick={() => {
            TxToast.configure({ position });
            TxToast.show(`${position} 에 떴습니다`);
          }}
        />
      ))}
    </TxFlex>
  )
};

/**
 * **`max` 를 넘으면 가장 오래된 것부터 사라진다.** 화면이 알림으로 덮이면
 * 정작 새로 온 것을 못 본다.
 */
export const Max: Story = {
  render: function MaxStory() {
    const [count, setCount] = useState(0);

    return (
      <TxFlex>
        <TxButton
          label="max 2 로 잠그고 띄우기"
          onClick={() => {
            TxToast.configure({ max: 2 });
            setCount((current) => current + 1);
            TxToast.show({ message: `${count + 1} 번째`, duration: 0 });
          }}
        />
        <TxButton
          label="max 를 되돌린다 (4)"
          variant="secondary"
          onClick={() => {
            TxToast.configure({ max: 4 });
            TxToast.dismissAll();
            setCount(0);
          }}
        />
      </TxFlex>
    );
  }
};

/**
 * **모달이 떠 있어도 알림이 보인다.** 모달을 열고 안에서 저장 실패를 띄워 보라.
 *
 * 보통의 토스트는 `z-index` 로 층을 다투는데, 네이티브 `<dialog>` 는 그 위의 top layer 에
 * 있어서 **아무리 큰 값을 줘도 가려진다.** 이쪽은 같은 층을 쓴다.
 */
export const OverModal: Story = {
  render: function OverModalStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TxButton label="모달 열기" onClick={() => setOpen(true)} />

        <TxModal open={open} onClose={() => setOpen(false)} title="설정 변경">
          <p className="text-sm">모달이 떠 있는 동안에도 알림이 그 위에 뜹니다.</p>

          <TxModal.Footer>
            <TxButton label="취소" variant="secondary" onClick={() => setOpen(false)} />
            <TxButton label="저장 (실패)" variant="danger" onClick={() => void TxToast.show({ variant: "danger", message: "저장하지 못했습니다." })} />
          </TxModal.Footer>
        </TxModal>
      </>
    );
  }
};
