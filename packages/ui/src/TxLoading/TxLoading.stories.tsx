import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxLoading } from "./TxLoading";
import { TxButton } from "../TxButton";

const meta = {
  title: "Feedback/TxLoading",
  component: TxLoading,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "로딩 표시. 스피너에 문구와 전체화면 옵션을 얹은 것이다.",
          "",
          "- **`visible` 에 배열을 주면 그 배열이 비어 있는 동안 보인다.** `data.length === 0` 을 따로 계산할 필요가 없다 (`TxCard` 의 `isLoading` 과 같은 규약).",
          "- `fullScreen` 을 켜면 화면 전체를 덮는다. 페이지 전환 중 표시에 쓴다."
        ].join("\n")
      }
    }
  },
  args: { visible: true, text: "불러오는 중" },
  argTypes: {
    visible: { control: false, description: "boolean 또는 배열. 배열이면 비어 있는 동안 표시" },
    text: { control: "text" },
    fullScreen: { control: "boolean" },
    className: { control: "text" }
  }
} satisfies Meta<typeof TxLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본형. */
export const 기본: Story = {};

/** 문구 없이 스피너만. */
export const 문구_없음: Story = { args: { text: undefined } };

/** `visible` 에 **배열**을 주는 사용법. 채우면 저절로 사라진다. */
const ArrayVisible = () => {
  const [rows, setRows] = useState<number[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <TxButton label={rows.length ? "비우기" : "데이터 채우기"} onClick={() => setRows(rows.length ? [] : [1, 2, 3])} />
      <div className="rounded border p-4">
        <TxLoading visible={rows} text="목록을 불러오는 중" />
        {rows.map((r) => (
          <p key={r} className="text-sm">
            항목 {r}
          </p>
        ))}
      </div>
    </div>
  );
};
export const 배열_기반: Story = { render: () => <ArrayVisible /> };
