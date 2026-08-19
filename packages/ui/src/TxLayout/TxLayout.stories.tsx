import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxLayout } from "./TxLayout";

const meta = {
  title: "Layout/TxLayout",
  component: TxLayout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "다섯 구역(`Top` · `Left` · `Middle` · `Right` · `Bottom`)으로 화면을 나누는 레이아웃.",
          "",
          "- 슬롯은 **선언한 것만** 자리를 차지한다. `Middle` 만 필수다.",
          "- `Left` · `Right` · `Bottom` 은 `resizable` 로 드래그 크기 조절이 된다. `minSize` · `maxSize` 로 범위를 건다.",
          "- `visible` 로 접었다 펼 때 `keepMounted` 를 켜면 내용이 언마운트되지 않는다 — 스크롤 위치나 폼 입력이 유지된다.",
          "- 부모가 높이를 가져야 한다. 이 컴포넌트는 `height: 100%` 를 채운다."
        ].join("\n")
      }
    }
  },
  args: { children: null },
  argTypes: { children: { control: false }, theme: { control: false } }
} satisfies Meta<typeof TxLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const Pane = ({ label }: { label: string }) => <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{label}</div>;
const Frame = ({ children }: { children: React.ReactNode }) => <div className="h-80 rounded border">{children}</div>;

/** 다섯 구역 전부. */
export const 기본: Story = {
  render: () => (
    <Frame>
      <TxLayout>
        <TxLayout.Top size={48}>
          <Pane label="Top" />
        </TxLayout.Top>
        <TxLayout.Left size={160}>
          <Pane label="Left" />
        </TxLayout.Left>
        <TxLayout.Middle>
          <Pane label="Middle" />
        </TxLayout.Middle>
        <TxLayout.Right size={140}>
          <Pane label="Right" />
        </TxLayout.Right>
        <TxLayout.Bottom size={48}>
          <Pane label="Bottom" />
        </TxLayout.Bottom>
      </TxLayout>
    </Frame>
  )
};

/** 필요한 슬롯만 선언한다. 나머지는 자리를 차지하지 않는다. */
export const 일부_슬롯: Story = {
  render: () => (
    <Frame>
      <TxLayout>
        <TxLayout.Left size={180}>
          <Pane label="Left" />
        </TxLayout.Left>
        <TxLayout.Middle>
          <Pane label="Middle 만 필수" />
        </TxLayout.Middle>
      </TxLayout>
    </Frame>
  )
};

/** `resizable` — 경계를 드래그해 크기를 바꾼다. */
const Resizable = () => {
  const [size, setSize] = useState(200);
  return (
    <div className="flex flex-col gap-2">
      <Frame>
        <TxLayout>
          <TxLayout.Left size={size} resizable minSize={120} maxSize={360} onResize={setSize}>
            <Pane label="드래그해서 크기 조절" />
          </TxLayout.Left>
          <TxLayout.Middle>
            <Pane label="Middle" />
          </TxLayout.Middle>
        </TxLayout>
      </Frame>
      <p className="text-xs text-slate-500 dark:text-slate-400">Left size: {Math.round(size)}px (120~360)</p>
    </div>
  );
};
export const 크기_조절: Story = { render: () => <Resizable /> };

/** `visible` 로 접는다. `keepMounted` 를 켜면 내용이 살아 있어 입력값이 유지된다. */
const Collapsible = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col gap-2">
      <button className="w-fit rounded border px-2 py-1 text-xs" onClick={() => setOpen((v) => !v)}>
        Left {open ? "접기" : "펴기"}
      </button>
      <Frame>
        <TxLayout>
          <TxLayout.Left size={200} visible={open} animated keepMounted>
            <div className="flex h-full items-center justify-center p-2">
              <input className="w-full rounded border px-2 py-1 text-sm" placeholder="여기 입력 후 접었다 펴보라" />
            </div>
          </TxLayout.Left>
          <TxLayout.Middle>
            <Pane label="Middle" />
          </TxLayout.Middle>
        </TxLayout>
      </Frame>
    </div>
  );
};
export const 접기: Story = { render: () => <Collapsible /> };
