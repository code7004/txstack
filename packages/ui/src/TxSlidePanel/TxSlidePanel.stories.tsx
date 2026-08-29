import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxSlidePanel } from "./TxSlidePanel";
import type { TxSlidePanelProps, TxSlidePanelSide } from "./TxSlidePanel.types";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const SIDES: TxSlidePanelSide[] = ["left", "right", "top", "bottom"];

const meta = {
  title: "Overlay/TxSlidePanel",
  component: TxSlidePanel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "가장자리에서 밀려 나오는 패널(서랍). 상세 보기나 필터 패널에 쓴다.",
          "",
          "```tsx",
          'import { TxSlidePanel } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "const [open, setOpen] = useState(false);",
          "",
          '<TxSlidePanel open={open} onClose={() => setOpen(false)} side="right" title="필터">',
          "  <TxForm>…</TxForm>",
          "</TxSlidePanel>;",
          "```",
          "",
          "**닫는 길은 셋이지만 콜백은 하나다** — 닫기 버튼 · 바깥 클릭 · Escape 가 전부 `onClose` 로 온다.",
          "`open` 의 주인은 소비자라, `onClose` 를 받고도 내리지 않으면 패널은 열린 채로 남는다.",
          "",
          "### `TxModal` 과 같은 바탕이다",
          "",
          "네이티브 `<dialog>` 로 뜬다. 그래서 **포커스 트랩 · 닫을 때 포커스 되돌리기 · 배경 비활성화 ·",
          "맨 위 층(top layer)을 브라우저가 맡는다.** 조상의 `overflow: hidden` 에 잘리지 않고,",
          "z-index 를 다툴 일도 없다. `TxModal` 과 다른 것은 **뜨는 자리 하나뿐이다.**",
          "",
          "밀려 나오는 움직임도 CSS 가 한다 — 애니메이션 라이브러리를 달지 않는다.",
          "움직임을 원치 않는다고 밝힌 사람(`prefers-reduced-motion`)에게는 밀지 않고 그냥 나타난다.",
          "",
          "### 크기는 손잡이 하나다",
          "",
          "```css",
          ".tx-slide-panel { --tx-slide-panel-size: 28rem; }",
          "```",
          "",
          "**좌우면 폭, 위아래면 높이**를 뜻한다. 방향마다 다른 prop 을 외울 것이 없다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { open: false, onClose: () => {}, side: "right", title: "필터", children: null },
  argTypes: {
    open: { control: false, description: "여닫기는 아래 버튼이 한다" },
    onClose: { control: false },
    children: { control: false },
    side: { control: "inline-radio", options: SIDES },
    title: { control: "text" },
    closeOnBackdrop: { control: "boolean" },
    closeOnEscape: { control: "boolean" },
    hideCloseButton: { control: "boolean" },
    closeLabel: { control: "text", description: "닫기 버튼의 이름. 스크린리더가 읽는다" },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-slide-panel` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxSlidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

/** 여는 버튼과 패널 한 벌. 스토리마다 이 모양이 반복된다. */
const Demo = ({ label, children, ...props }: Omit<TxSlidePanelProps, "open" | "onClose"> & { label?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TxButton label={label ?? `${props.side ?? "right"} 에서 열기`} onClick={() => setOpen(true)} />

      <TxSlidePanel {...props} open={open} onClose={() => setOpen(false)}>
        {children ?? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">패널 본문. 바깥을 누르거나 Escape 로도 닫힌다.</p>
            <TxButton label="닫기" variant="secondary" onClick={() => setOpen(false)} />
          </div>
        )}
      </TxSlidePanel>
    </>
  );
};

export const Playground: Story = {
  render: ({ open: _open, onClose: _onClose, children: _children, ...args }) => <Demo {...args} label="열기" />
};

/** 네 방향. 눌러서 비교한다. **크기 손잡이는 넷 다 같은 이름이다.** */
export const Sides: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      {SIDES.map((side) => (
        <Demo key={side} side={side} title={`${side} 패널`} />
      ))}
    </TxFlex>
  )
};

/**
 * 크기는 CSS 변수 하나로 바꾼다. **좌우면 폭, 위아래면 높이다.**
 *
 * ```css
 * .tx-slide-panel { --tx-slide-panel-size: 28rem; }
 * ```
 */
export const Size: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <Demo label="기본 (20rem)" title="기본" />
      <Demo label="좁게 (14rem)" title="좁은 패널" style={vars({ "--tx-slide-panel-size": "14rem" })} />
      <Demo label="넓게 (32rem)" title="넓은 패널" style={vars({ "--tx-slide-panel-size": "32rem" })} />
      <Demo label="아래에서 낮게" side="bottom" title="낮은 패널" style={vars({ "--tx-slide-panel-size": "12rem" })} />
    </TxFlex>
  )
};

/**
 * 흔한 쓰임 — **필터 서랍.** 본문이 길어지면 머리는 자리에 남고 본문만 스크롤한다.
 */
export const FilterDrawer: Story = {
  parameters: noControls,
  render: () => (
    <Demo label="필터 열기" title="검색 조건" style={vars({ "--tx-slide-panel-size": "24rem" })}>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 12 }, (_, index) => (
          <label key={index} className="flex flex-col gap-1 text-sm">
            조건 {index + 1}
            <input className="rounded border px-2 py-1" placeholder="값" />
          </label>
        ))}
      </div>
    </Demo>
  )
};

/**
 * 닫는 길을 하나씩 끌 수 있다 — `closeOnBackdrop` · `closeOnEscape` · `hideCloseButton`.
 *
 * **셋을 다 끄면 사용자가 닫을 방법이 없다.** 그럴 때는 본문에 닫는 버튼을 반드시 둔다.
 */
export const CloseRoutes: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex>
      <Demo label="바깥 클릭 잠금" title="바깥으로는 안 닫힌다" closeOnBackdrop={false} />
      <Demo label="Escape 잠금" title="Escape 가 안 먹는다" closeOnEscape={false} />
      <Demo label="X 없음" title="닫기 버튼이 없다" hideCloseButton />
    </TxFlex>
  )
};

/** 제목을 안 주면 머리에는 닫기 버튼만 남는다. */
export const NoTitle: Story = {
  parameters: noControls,
  render: () => <Demo label="제목 없이 열기" title={undefined} />
};
