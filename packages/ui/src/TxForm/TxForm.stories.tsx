import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TxButton } from "../TxButton";
import { TxForm } from ".";

const AGES: number[] = Array.from({ length: 60 }, (_, i) => i + 20);

const meta = {
  title: "Form/TxForm",
  component: TxForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "폼 레이아웃 컴파운드 컴포넌트. `TxForm` 아래에 필드들이 붙는다.",
          "",
          "```tsx",
          "<TxForm.Input />   <TxForm.SearchInput />   <TxForm.Textarea />",
          "<TxForm.Dropdown /> <TxForm.DropdownMulti />",
          "<TxForm.Field />   <TxForm.Flex />          <TxForm.Label />",
          "```",
          "",
          "- 각 필드는 `caption`(라벨) · `warning` · `error` 를 받아 **라벨과 메시지 자리를 스스로 그린다.**",
          "- `labelWidth` 를 폼에 주면 Context 로 내려가 모든 라벨의 너비가 맞춰진다. 필드마다 지정하지 않는다.",
          "- `onSubmit` 은 `preventDefault` 가 이미 걸려 있다. 소비자가 다시 부를 필요가 없다.",
          "",
          "> ⚠ **날짜 필드는 여기 없다.** `react-day-picker` 를 optional peer 로 두기 위해",
          "> `TxFormDayPicker` / `TxFormDayPickerRange` 는 `@txstack/ui/daypicker` 서브패스로 분리했다."
        ].join("\n")
      }
    }
  },
  args: { labelWidth: "w-24" },
  argTypes: {
    labelWidth: { control: "text", description: "Tailwind width 클래스. Context 로 모든 라벨에 적용된다" },
    theme: { control: false },
    onSubmit: { control: false }
  }
} satisfies Meta<typeof TxForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const EMPTY = { id: "", name: "", age: 30, memo: "" };

const Basic = (args: React.ComponentProps<typeof TxForm>) => {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState<unknown>(null);
  const patch = (p: Partial<typeof EMPTY>) => setForm((prev) => ({ ...prev, ...p }));

  return (
    <div className="flex flex-col gap-3">
      <TxForm {...args} className="grid gap-3 md:grid-cols-2" onSubmit={() => setSubmitted(form)} onReset={() => (setForm(EMPTY), setSubmitted(null))}>
        <TxForm.Input caption="ID" value={form.id} onChangeText={(id) => patch({ id })} />
        <TxForm.Input caption="이름" value={form.name} onChangeText={(name) => patch({ name })} />
        <TxForm.Dropdown caption="나이" data={AGES} value={form.age} onChangeNumb={(age) => patch({ age: age ?? 0 })} />
        <TxForm.Textarea caption="메모" value={form.memo} onChangedText={(memo) => patch({ memo })} />
        <TxForm.Flex className="gap-2 md:col-span-2">
          <TxButton type="submit" label="제출" className="flex-1" />
          <TxButton type="reset" label="초기화" variant="secondary" className="flex-1" />
        </TxForm.Flex>
      </TxForm>
      <pre className="rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">{JSON.stringify(submitted, null, 2) ?? "null"}</pre>
    </div>
  );
};

/** 전체 폼. 제출하면 아래에 값이 찍힌다. */
export const 기본: Story = { render: (args) => <Basic {...args} /> };

/**
 * 모든 필드가 `caption` · `warning` · `error` 를 받는다.
 * `error` 가 있으면 `warning` 보다 우선해 보인다.
 */
export const 필드_상태: Story = {
  render: (args) => (
    <TxForm {...args} className="grid gap-3">
      <TxForm.Input caption="정상" placeholder="아무 메시지 없음" />
      <TxForm.Input caption="경고" warning="이 값은 곧 사용할 수 없습니다" placeholder="warning" />
      <TxForm.Input caption="에러" error="필수 항목입니다" placeholder="error" />
      <TxForm.Input caption="둘 다" warning="경고" error="에러가 우선한다" placeholder="warning + error" />
    </TxForm>
  )
};

/** `labelWidth` 는 Context 로 내려간다. 필드마다 지정하지 않는다. */
export const 라벨_너비: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {["w-16", "w-32", "w-48"].map((w) => (
        <TxForm key={w} labelWidth={w} className="grid gap-2">
          <TxForm.Input caption={`labelWidth=${w}`} placeholder="라벨 너비 비교" />
          <TxForm.Input caption="두 번째 필드" placeholder="같은 너비로 정렬된다" />
        </TxForm>
      ))}
    </div>
  )
};

/** `TxForm.Field` 로 임의의 자식을 감싸면 라벨·메시지 레이아웃을 그대로 얻는다. */
export const 임의_필드: Story = {
  render: (args) => (
    <TxForm {...args} className="grid gap-3">
      <TxForm.Field caption="커스텀" warning="아무 요소나 넣을 수 있다">
        <div className="flex h-10 items-center rounded-md border border-dashed px-3 text-sm text-slate-500">임의의 자식 요소</div>
      </TxForm.Field>
    </TxForm>
  )
};

/** `theme` 으로 기본 클래스를 부분 교체한다. */
export const 테마_덮어쓰기: Story = {
  args: { theme: { label: "text-purple-600 font-bold dark:text-purple-400" } },
  render: (args) => (
    <TxForm {...args} className="grid gap-3">
      <TxForm.Input caption="라벨 색이 바뀐다" placeholder="theme.label 교체" />
    </TxForm>
  )
};
