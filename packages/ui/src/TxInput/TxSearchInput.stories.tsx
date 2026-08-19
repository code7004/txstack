import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { TxSearchInput } from "./TxSearchInput";
import type { ITxSearchInputRef } from "./TxInput.types";

const meta = {
  title: "Form/TxSearchInput",
  component: TxSearchInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "`TxInput` 에 검색 아이콘과 **지우기 버튼**을 붙인 것. 값이 있을 때만 X 가 나타난다.",
          "",
          "- `onSubmitText` 는 Enter 또는 검색 아이콘 클릭에 반응한다.",
          "- `onClear` 는 X 를 눌렀을 때. 지운 뒤의 값(빈 문자열)이 넘어온다.",
          "- ref 로 `clear()` · `submit()` 을 외부에서 호출할 수 있다 — `TxInput` 의 ref API 에 더해진 것이다."
        ].join("\n")
      }
    }
  },
  args: { placeholder: "검색어" },
  argTypes: { value: { control: false }, theme: { control: false } }
} satisfies Meta<typeof TxSearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const Basic = () => {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <TxSearchInput placeholder="검색어를 넣고 Enter" onSubmitText={setSubmitted} onClear={() => setSubmitted(null)} />
      <p className="text-xs text-slate-500 dark:text-slate-400">제출된 값: {submitted === null ? "(없음)" : JSON.stringify(submitted)}</p>
    </div>
  );
};

/** 값이 생기면 X 가 나타난다. Enter 또는 아이콘 클릭으로 제출된다. */
export const 기본: Story = { render: () => <Basic /> };

/** ref 로 외부에서 `clear()` · `submit()` 을 호출한다. */
const WithRef = () => {
  const ref = useRef<ITxSearchInputRef>(null);
  return (
    <div className="flex flex-col gap-2">
      <TxSearchInput ref={ref} placeholder="바깥 버튼으로 조작" />
      <div className="flex gap-2 text-xs">
        <button className="rounded border px-2 py-1" onClick={() => ref.current?.setValue("주입된 값")}>
          setValue
        </button>
        <button className="rounded border px-2 py-1" onClick={() => ref.current?.clear()}>
          clear
        </button>
        <button className="rounded border px-2 py-1" onClick={() => ref.current?.focus()}>
          focus
        </button>
      </div>
    </div>
  );
};
export const Ref_제어: Story = { render: () => <WithRef /> };

/** 비활성 상태. */
export const 비활성: Story = { args: { disabled: true } };

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = { args: { theme: { wrapper: "border-2 border-emerald-500" } } };
