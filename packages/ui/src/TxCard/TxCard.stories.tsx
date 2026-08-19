import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxCard } from "./TxCard";
import { TxButton } from "../TxButton";

const meta = {
  title: "Data/TxCard",
  component: TxCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "구획을 나누는 컨테이너. `caption` 이 테두리 위에 걸치는 형태다.",
          "",
          "- 본문은 `TxCard.Content` 로 감싼다. 카드가 패딩·레이아웃을 관리한다.",
          "- `isLoading` 에 **배열을 주면 그 배열이 비어 있는 동안** 스켈레톤을 보여준다. `data.length === 0` 을 따로 계산하지 않아도 된다.",
          "- `useFold` 를 켜면 캡션 클릭으로 접었다 펼 수 있다.",
          "- `link` 또는 `onClick` 을 주면 카드 우상단에 이동/실행 버튼이 붙는다."
        ].join("\n")
      }
    }
  },
  args: { caption: "카드 제목" },
  argTypes: {
    caption: { control: "text" },
    header: { control: "text" },
    footer: { control: "text" },
    useFold: { control: "boolean" },
    isFold: { control: "boolean" },
    isLoading: { control: false, description: "boolean 또는 배열. 배열이면 비어 있는 동안 로딩으로 본다" },
    theme: { control: false },
    link: { control: "text" }
  }
} satisfies Meta<typeof TxCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const Body = () => <p className="text-sm text-slate-600 dark:text-slate-300">카드 본문입니다. 실제 내용이 여기 들어간다.</p>;

/** 기본형. */
export const 기본: Story = {
  render: (args) => (
    <TxCard {...args}>
      <TxCard.Content>
        <Body />
      </TxCard.Content>
    </TxCard>
  )
};

/** `header` · `footer` 를 함께 쓴 형태. */
export const 헤더_푸터: Story = {
  args: { header: "머리말", footer: "꼬리말" },
  render: (args) => (
    <TxCard {...args}>
      <TxCard.Content>
        <Body />
      </TxCard.Content>
    </TxCard>
  )
};

/**
 * `isLoading` 에 **배열**을 주는 것이 핵심 사용법이다.
 * 데이터가 도착해 배열이 채워지면 스켈레톤이 저절로 사라진다.
 */
const LoadingDemo = () => {
  const [rows, setRows] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <TxButton label={rows.length ? "비우기" : "데이터 채우기"} onClick={() => setRows(rows.length ? [] : ["첫 줄", "둘째 줄"])} />
      <TxCard caption="isLoading={rows}" isLoading={rows}>
        <TxCard.Content>
          {rows.map((r) => (
            <p key={r} className="text-sm">
              {r}
            </p>
          ))}
        </TxCard.Content>
      </TxCard>
    </div>
  );
};
export const 로딩_스켈레톤: Story = { render: () => <LoadingDemo /> };

/** `useFold` 로 접기/펼치기. 캡션을 눌러본다. */
export const 접기: Story = {
  args: { useFold: true, caption: "눌러서 접기" },
  render: (args) => (
    <TxCard {...args}>
      <TxCard.Content>
        <Body />
      </TxCard.Content>
    </TxCard>
  )
};

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { base: "rounded-none border-2 border-purple-500 p-4" } },
  render: (args) => (
    <TxCard {...args}>
      <TxCard.Content>
        <Body />
      </TxCard.Content>
    </TxCard>
  )
};
