import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxFlex } from "../TxFlex";
import { TxInput } from "../TxInput";
import { TxDropdown } from "./TxDropdown";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const CITIES = ["서울", "부산", "대구", "인천", "광주"];

const meta = {
  title: "Form/TxDropdown",
  component: TxDropdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "하나를 고르는 드롭다운.",
          "",
          "```tsx",
          'import { TxDropdown } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxDropdown data={["서울", "부산"]} onChangeText={setCity} />;',
          "```",
          "",
          "- `data` 는 원시값 배열이나 `{ name, value }` 배열을 받는다",
          "- **값의 타입이 `data` 에서 추론된다.** 숫자 배열을 주면 `onChangeNumber` 가 숫자를 준다 — 세터를 그대로 꽂아도 된다",
          "- `value` 를 주면 controlled",
          "",
          "**목록은 화면 맨 위 층으로 뜬다.** `overflow: hidden` 안에 넣어도 잘리지 않고,",
          "아래 공간이 좁으면 위로 뒤집는다. 화면 밖으로도 나가지 않는다.",
          "",
          "키보드로 전부 다룰 수 있다 — `Enter`·`Space`·`↓` 로 열고, `↑↓`·`Home`·`End` 로 짚고,",
          "`Enter` 로 고르고, `Esc` 로 닫는다. **`Tab` 은 닫고 다음 요소로 나간다.**",
          "",
          "여럿을 고르려면 `TxDropdownMulti` 를 쓴다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { data: CITIES },
  argTypes: {
    placeholder: { control: "text" },
    fixedHead: { control: "text" },
    addNoChoiceItem: { control: "boolean" },
    disabled: { control: "boolean" },
    className: { control: "text", description: "`.tx-dropdown` 에 덧붙는다 (교체 아님)" },
    data: { control: false }
  }
} satisfies Meta<typeof TxDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { placeholder: "선택", addNoChoiceItem: false, disabled: false, className: "w-56" }
};

export const States: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxDropdown className="w-56" data={CITIES} placeholder="고른 것 없음" />
      <TxDropdown className="w-56" data={CITIES} value="부산" />
      <TxDropdown className="w-56" data={CITIES} value="부산" disabled />
      <TxDropdown className="w-56" data={CITIES} fixedHead="지역" />
    </TxFlex>
  )
};

/** 원시값 배열도 되고 `{ name, value }` 배열도 된다. 값의 타입에 맞는 콜백이 불린다. */
export const Data: Story = {
  parameters: noControls,
  render: function DataStory() {
    const [text, setText] = useState<string | undefined>();
    const [num, setNum] = useState<number | undefined>();

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxDropdown className="w-56" data={CITIES} placeholder="문자열 배열" onChangeText={setText} />
        <TxDropdown className="w-56" data={[10, 20, 30]} placeholder="숫자 배열" onChangeNumber={setNum} />
        <TxDropdown
          className="w-56"
          placeholder="객체 배열"
          data={[
            { name: "관리자", value: 1 },
            { name: "일반", value: 2 }
          ]}
          onChangeNumber={setNum}
        />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">
          onChangeText: {String(text)}
          <br />
          onChangeNumber: {String(num)}
        </div>
      </TxFlex>
    );
  }
};

/**
 * **키보드만으로 다뤄 보라.**
 *
 * `Tab` 으로 드롭다운에 오고 → `Enter` 나 `↓` 로 열고 → `↑↓` 로 짚고 → `Enter` 로 고른다.
 * 열린 상태에서 `Tab` 을 누르면 **닫히고 다음 입력창으로 나간다.**
 */
export const Keyboard: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-56 flex-col items-stretch gap-3">
      <TxInput placeholder="여기서 Tab 을 눌러 보세요" />
      <TxDropdown data={CITIES} placeholder="드롭다운" />
      <TxInput placeholder="열린 채 Tab 을 누르면 여기로 온다" />
    </TxFlex>
  )
};

/**
 * **목록이 조상에 잘리지 않는다.**
 *
 * 아래 상자는 `overflow: hidden` 이고 높이가 낮다. 원본은 목록이 이 상자 안에서 잘렸다.
 */
export const NotClipped: Story = {
  parameters: noControls,
  render: () => (
    <div className="h-24 w-72 overflow-hidden rounded-md border border-slate-300 p-3 dark:border-gray-700">
      <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">overflow: hidden · height: 6rem</div>
      <TxDropdown className="w-56" data={CITIES} placeholder="열어 보세요" />
    </div>
  )
};

/** **아래 공간이 좁으면 위로 뒤집는다.** 화면 맨 아래에 붙여 두었다 — 열어 보라. */
export const FlipsUp: Story = {
  parameters: noControls,
  render: () => (
    <div className="flex h-[70vh] items-end">
      <TxDropdown className="w-56" data={CITIES} placeholder="화면 아래쪽" />
    </div>
  )
};

/** 긴 목록은 안에서 스크롤한다. `↓` 를 계속 누르면 짚은 줄이 보이는 자리로 따라온다. */
export const LongList: Story = {
  parameters: noControls,
  render: () => <TxDropdown className="w-56" data={Array.from({ length: 60 }, (_, i) => `항목 ${i + 1}`)} placeholder="60개" />
};

/** `addNoChoiceItem` 은 맨 위에 "선택 안 함" 을 넣는다. 고르면 값이 `undefined` 로 간다. */
export const NoChoice: Story = {
  parameters: noControls,
  render: function NoChoiceStory() {
    const [value, setValue] = useState<string | undefined>("부산");

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxDropdown className="w-56" data={CITIES} value={value} addNoChoiceItem onChangeText={setValue} />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">value: {String(value)}</div>
      </TxFlex>
    );
  }
};

/** `renderItem` 으로 한 줄을 직접 그린다. */
export const CustomItem: Story = {
  parameters: noControls,
  render: () => (
    <TxDropdown
      className="w-64"
      placeholder="색을 고르세요"
      data={[
        { name: "빨강", value: "#ef4444" },
        { name: "초록", value: "#22c55e" },
        { name: "파랑", value: "#3b82f6" }
      ]}
      renderItem={({ item, selected }) => (
        <span className="flex flex-1 items-center gap-2">
          <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: String(item.value) }} />
          <span className="flex-1">{item.name}</span>
          {selected && <span className="text-xs text-slate-500 dark:text-slate-400">고름</span>}
        </span>
      )}
    />
  )
};

/** 폼에 나란히 놓았을 때. 높이와 테두리가 입력창과 맞는다. */
export const AlignsWithTxInput: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center">
      <TxInput placeholder="이름" className="w-40" />
      <TxDropdown className="w-40" data={CITIES} placeholder="지역" />
    </TxFlex>
  )
};

/** 토큰 한 줄로 바꾼다. 목록의 쌓임 순서까지 토큰이라 다른 층 위로 올릴 수 있다. */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxDropdown className="w-56" data={CITIES} placeholder="기본" />
      <TxDropdown className="w-56" data={CITIES} placeholder="--tx-dropdown-height: 3rem" style={vars({ "--tx-dropdown-height": "3rem" })} />
      <TxDropdown className="w-56" data={CITIES} placeholder="--tx-radius: 9999px" style={vars({ "--tx-radius": "9999px" })} />
      <TxDropdown className="w-56" data={CITIES} placeholder="--tx-color-primary 를 바꾸면 체크도 따라온다" value="부산" style={vars({ "--tx-color-primary": "#7c3aed" })} />
    </TxFlex>
  )
};
