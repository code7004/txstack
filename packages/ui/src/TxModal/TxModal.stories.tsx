import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxForm } from "../TxForm";
import { TxModal } from "./TxModal";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const LOREM = Array.from({ length: 14 }, (_, index) => `${index + 1}. 내용이 길면 본문만 스크롤되고 제목과 버튼 줄은 자리에 남는다.`);

const meta = {
  title: "Overlay/TxModal",
  component: TxModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "화면을 덮고 뜨는 창.",
          "",
          "```tsx",
          'import { TxModal, TxButton } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxModal open={open} onClose={() => setOpen(false)} title="비밀번호 변경">',
          "  <TxForm>…</TxForm>",
          "  <TxModal.Footer>",
          '    <TxButton label="취소" variant="secondary" onClick={() => setOpen(false)} />',
          '    <TxButton label="저장" onClick={save} />',
          "  </TxModal.Footer>",
          "</TxModal>;",
          "```",
          "",
          "- **닫는 길은 셋이지만 콜백은 하나다** — 닫기 버튼 · 바깥 클릭 · Escape 가 모두 `onClose` 로 온다",
          "- 값의 주인은 소비자다. `onClose` 를 받고도 `open` 을 안 내리면 열린 채로 남는다",
          "- **제목이 없어도 닫기 버튼은 있다.** 닫는 길이 사라지지 않는다",
          "- `hideCloseButton` 으로 X 를 없앨 수 있다 — **확인·취소가 답을 받는 창**에만 쓴다 (`TxDialog` 가 그렇다)",
          "- 열려 있는 동안 **배경 스크롤이 멈춘다.** 겹쳐 떠도 세어 두므로 안쪽이 닫혀도 풀리지 않는다",
          "",
          "**안에 진짜 `<dialog>` 가 있다.** 그래서 이런 것들이 브라우저 몫이다.",
          "",
          "- **포커스가 모달 안에 갇힌다.** Tab 을 계속 눌러도 뒤 배경으로 나가지 않는다",
          "- 닫으면 **포커스가 열기 전 자리로 돌아간다**",
          "- **맨 위 층(top layer)에 뜬다.** `overflow: hidden` 조상에 잘리지 않고 z-index 를 다투지 않는다",
          "",
          "여닫히는 움직임은 CSS(`@starting-style`)가 한다 — 애니메이션 라이브러리를 쓰지 않는다.",
          "`--tx-modal-duration: 0ms` 로 끄면 즉시 뜬다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  // 필수 prop 이 둘이라 meta 에서 기본값을 준다. 각 스토리가 render 로 덮어쓴다
  args: { open: false, onClose: () => {} },
  argTypes: {
    open: { control: false },
    onClose: { control: false },
    title: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    closeOnBackdrop: { control: "boolean" },
    closeLabel: { control: "text", description: "닫기 버튼의 이름. 스크린리더가 읽는다" },
    hideCloseButton: { control: "boolean", description: "오른쪽 위 X 를 없앤다. 닫는 길을 따로 마련한 창에만" },
    className: { control: "text", description: "`.tx-modal` 에 덧붙는다 (교체 아님)" },
    classNames: { control: false }
  }
} satisfies Meta<typeof TxModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { title: "비밀번호 변경", size: "md", closeOnBackdrop: true, closeLabel: "닫기" },
  render: function PlaygroundStory(args) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TxButton label="모달 열기" onClick={() => setOpen(true)} />
        <TxModal {...args} open={open} onClose={() => setOpen(false)}>
          <p>바깥을 누르거나 Escape 를 눌러 보라. 셋 다 같은 콜백으로 온다.</p>
          <TxModal.Footer>
            <TxButton label="취소" variant="secondary" onClick={() => setOpen(false)} />
            <TxButton label="저장" onClick={() => setOpen(false)} />
          </TxModal.Footer>
        </TxModal>
      </>
    );
  }
};

/**
 * **키보드로 다뤄 보라.**
 *
 * 열고 Tab 을 계속 눌러도 포커스가 모달 밖으로 나가지 않는다. Escape 로 닫으면
 * **포커스가 "모달 열기" 버튼으로 되돌아간다** — 열기 전에 있던 자리다.
 */
export const FocusTrap: Story = {
  parameters: noControls,
  render: function FocusTrapStory() {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex flex-col items-start gap-3">
        <TxButton label="뒤에 있는 버튼 (Tab 이 여기로 오면 안 된다)" variant="secondary" />
        <TxButton label="모달 열기" onClick={() => setOpen(true)} />

        <TxModal open={open} onClose={() => setOpen(false)} title="포커스는 여기 갇힌다">
          <TxForm>
            <TxForm.Input caption="이름" placeholder="Tab 으로 다음 칸" />
            <TxForm.Input caption="연락처" placeholder="계속 눌러 보라" />
          </TxForm>
          <TxModal.Footer>
            <TxButton label="닫기" variant="secondary" onClick={() => setOpen(false)} />
          </TxModal.Footer>
        </TxModal>
      </div>
    );
  }
};

/** 폭 셋. `--tx-modal-width` 를 직접 주면 이것과 무관하게 그 값이 쓰인다. */
export const Sizes: Story = {
  parameters: noControls,
  render: function SizesStory() {
    const [size, setSize] = useState<"sm" | "md" | "lg" | null>(null);

    return (
      <div className="flex gap-2">
        {(["sm", "md", "lg"] as const).map((value) => (
          <TxButton key={value} label={value} variant="secondary" onClick={() => setSize(value)} />
        ))}

        <TxModal open={size !== null} size={size ?? "md"} onClose={() => setSize(null)} title={`size = ${size}`}>
          <p>폭만 다르다. 높이는 내용이 정한다.</p>
        </TxModal>
      </div>
    );
  }
};

/**
 * 제목이 없어도 **닫기 버튼은 남는다.** 원본은 제목이 없으면 버튼째 사라져서
 * 닫는 길이 Escape 하나뿐이었다.
 */
export const WithoutTitle: Story = {
  parameters: noControls,
  render: function WithoutTitleStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TxButton label="제목 없는 모달" onClick={() => setOpen(true)} />
        <TxModal open={open} onClose={() => setOpen(false)}>
          <p>안내만 띄우는 자리. 버튼 줄도 필요 없다.</p>
        </TxModal>
      </>
    );
  }
};

/**
 * `closeOnBackdrop={false}` 는 **실수로 닫히면 안 되는 자리**에 쓴다 —
 * 입력하던 내용이 사라지는 경우다.
 *
 * 바깥을 눌러도 닫히지 않지만 **Escape 와 닫기 버튼은 그대로 동작한다.**
 * 닫는 길을 전부 막지는 않는다.
 */
export const KeepOpenOnBackdrop: Story = {
  parameters: noControls,
  render: function KeepOpenStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TxButton label="바깥 클릭으로 안 닫히는 모달" onClick={() => setOpen(true)} />
        <TxModal open={open} onClose={() => setOpen(false)} closeOnBackdrop={false} title="입력 중">
          <TxForm>
            <TxForm.Input caption="메모" placeholder="바깥을 눌러도 안 닫힌다" />
          </TxForm>
          <TxModal.Footer>
            <TxButton label="취소" variant="secondary" onClick={() => setOpen(false)} />
            <TxButton label="저장" onClick={() => setOpen(false)} />
          </TxModal.Footer>
        </TxModal>
      </>
    );
  }
};

/** 내용이 길면 **본문만 스크롤**되고 제목과 버튼 줄은 자리에 남는다. */
export const LongContent: Story = {
  parameters: noControls,
  render: function LongContentStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TxButton label="긴 내용" onClick={() => setOpen(true)} />
        <TxModal open={open} onClose={() => setOpen(false)} title="약관">
          <div className="flex flex-col gap-3">
            {LOREM.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <TxModal.Footer>
            <TxButton label="동의" onClick={() => setOpen(false)} />
          </TxModal.Footer>
        </TxModal>
      </>
    );
  }
};

/**
 * **겹쳐 뜰 수 있다.** 안쪽 모달을 닫아도 바깥이 아직 열려 있으므로
 * 배경 스크롤은 계속 잠겨 있다.
 *
 * Escape 는 **맨 위 모달만** 닫는다 — 원본은 `window` 에서 키를 들어 한 번에 다 닫혔다.
 */
export const Stacked: Story = {
  parameters: noControls,
  render: function StackedStory() {
    const [outer, setOuter] = useState(false);
    const [inner, setInner] = useState(false);

    return (
      <>
        <TxButton label="바깥 모달 열기" onClick={() => setOuter(true)} />

        <TxModal open={outer} onClose={() => setOuter(false)} title="바깥">
          <p>여기서 하나 더 연다.</p>
          <TxModal.Footer>
            <TxButton label="안쪽 열기" onClick={() => setInner(true)} />
          </TxModal.Footer>
        </TxModal>

        <TxModal open={inner} onClose={() => setInner(false)} size="sm" title="안쪽">
          <p>Escape 를 누르면 이것만 닫힌다.</p>
        </TxModal>
      </>
    );
  }
};

/**
 * 겉모습은 CSS 변수로 바꾼다. `--tx-modal-duration: 0ms` 로 움직임을 끌 수도 있다.
 */
export const Tokens: Story = {
  parameters: noControls,
  render: function TokensStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TxButton label="넓고 각지고 즉시 뜨는 모달" onClick={() => setOpen(true)} />
        <TxModal open={open} onClose={() => setOpen(false)} title="토큰으로 바꾼 모습" style={vars({ "--tx-modal-width": "44rem", "--tx-modal-radius": "0", "--tx-modal-duration": "0ms", "--tx-modal-padding": "2rem" })}>
          <p>폭 · 모서리 · 여백 · 여닫히는 시간을 한 자리에서 정한다.</p>
        </TxModal>
      </>
    );
  }
};
