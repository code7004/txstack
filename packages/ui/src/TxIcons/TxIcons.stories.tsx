import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxIconClose, TxIconSearch } from ".";

const meta = {
  title: "Internal/TxIcons",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: [
          "`TxInput` 계열이 안에서 쓰는 아이콘. **`@txstack/ui` 에서 내보내지 않는다** —",
          "쓰시는 아이콘 세트(lucide·heroicons 등)를 그대로 쓰시면 된다.",
          "",
          "여기 실어 둔 것은 아이콘이 놓인 자리에 맞춰 따라오는지 눈으로 보기 위해서다.",
          "",
          "- 크기는 `1em` → 놓인 자리의 글자 크기를 따라간다",
          "- 색은 `currentColor` → 놓인 자리의 글자색을 따라간다",
          "",
          "`TxSpinner` 와 같은 방식이라, 버튼이나 입력창 안에 넣으면 저절로 맞는다."
        ].join("\n")
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <TxFlex className="items-center gap-4">
    <span className="w-40 shrink-0 text-sm text-slate-500 dark:text-slate-400">{label}</span>
    {children}
  </TxFlex>
);

/** 가져온 두 개. 나머지 5개는 쓰는 곳이 없거나 아직 안 옮긴 컴포넌트 것이라 두고 왔다. */
export const Icons: Story = {
  render: () => (
    <TxFlex className="flex-col gap-4">
      <Row label="TxIconClose">
        <TxIconClose />
      </Row>
      <Row label="TxIconSearch">
        <TxIconSearch />
      </Row>
    </TxFlex>
  )
};

/**
 * **크기를 넘기지 않았다.** 글자 크기만 바뀌는데 아이콘이 따라 커진다.
 *
 * 이게 안 되면 `TxInput` 안에서 아이콘만 작게 남는다.
 */
export const InheritsSize: Story = {
  render: () => (
    <TxFlex className="flex-col gap-4">
      {["0.75rem", "1rem", "1.5rem", "2.5rem"].map((size) => (
        <Row key={size} label={size}>
          <span style={{ fontSize: size }}>
            <TxFlex className="items-center">
              <TxIconSearch />
              <TxIconClose />
              <span>가나다 Abc</span>
            </TxFlex>
          </span>
        </Row>
      ))}
    </TxFlex>
  )
};

/**
 * **색도 넘기지 않았다.** 부모의 `color` 를 그대로 받는다.
 *
 * 그래서 다크모드에서 따로 할 일이 없다 — 툴바에서 테마를 바꿔 보면 글자와 같이 뒤집힌다.
 */
export const InheritsColor: Story = {
  render: () => (
    <TxFlex className="flex-col gap-4">
      {[
        ["상속 (기본)", ""],
        ["text-blue-500", "text-blue-500"],
        ["text-red-500", "text-red-500"],
        ["text-emerald-500", "text-emerald-500"]
      ].map(([label, cls]) => (
        <Row key={label} label={label}>
          <span className={cls}>
            <TxFlex className="items-center">
              <TxIconSearch />
              <TxIconClose />
              <span>가나다 Abc</span>
            </TxFlex>
          </span>
        </Row>
      ))}
    </TxFlex>
  )
};

/**
 * 실제로 쓰이는 모습. `TxButton` 안에 넣으면 **버튼의 글자 크기와 글자색을 그대로 받는다** —
 * variant 를 바꿔도 아이콘 색을 따로 맞출 필요가 없다.
 */
export const InButton: Story = {
  render: () => (
    <TxFlex className="items-center">
      <TxButton aria-label="검색">
        <TxIconSearch />
      </TxButton>
      <TxButton variant="secondary" aria-label="지우기">
        <TxIconClose />
      </TxButton>
      <TxButton variant="danger" aria-label="삭제">
        <TxIconClose />
      </TxButton>
      <TxButton variant="ghost" aria-label="닫기">
        <TxIconClose />
      </TxButton>
    </TxFlex>
  )
};
