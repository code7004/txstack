import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxInput } from "../TxInput";
import { TxDayPicker } from "./TxDayPicker";
import type { TxDateRange, TxDayPickerRangeRef } from "./TxDayPicker.types";
import { addDays, endOfDay, startOfDay } from "./TxDayPicker.utils";
import { TxDayPickerRange } from "./TxDayPickerRange";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const meta = {
  title: "Form/TxDayPicker",
  component: TxDayPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "날짜 하나를 고른다.",
          "",
          "```tsx",
          'import { TxDayPicker } from "@txstack/ui/daypicker";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxDayPicker value={date} onChange={setDate} />;",
          "```",
          "",
          "**서브패스다.** `react-day-picker` 를 함께 설치한 소비자만 쓴다 —",
          "루트 배럴(`@txstack/ui`)을 import 한 쪽은 이 의존을 지지 않는다.",
          "",
          "**달력 스타일도 `@txstack/ui/styles.css` 에 들어 있다.** 따로 import 할 CSS 가 없다.",
          "",
          "- 고른 날짜는 **그날 00:00** 으로 맞춰서 준다",
          "- 달력은 화면 맨 위 층으로 뜬다 — `overflow: hidden` 안에서도 잘리지 않고, 아래가 좁으면 위로 뒤집고, **스크롤해도 따라간다**",
          "- `format` 은 `YYYY` `YY` `MM` `DD` `HH` `mm` `ss` 를 쓴다",
          "",
          "기간을 고르려면 `TxDayPickerRange` 를 쓴다.",
          "",
          "### 뜨는 층은 `TxPopup` 을 바탕으로 한다",
          "",
          "`TxPopup` 은 **앵커에 붙어 뜨는 층**을 맡는 내부 부품이다. `TxDropdown` · `TxCombobox` ·",
          "`TxDayPicker` · `TxTooltip` · 메뉴 2종이 같은 것을 쓰므로, **아래 성질은 그 컴포넌트들과",
          "똑같이 동작한다.**",
          "",
          "- **맨 위 층으로 나간다** — `document.body` 로 포털되어 `overflow: hidden` 이나",
          "  `transform` 을 가진 조상 안에 갇히지 않는다. 표 안이나 카드 안에서도 잘리지 않는다",
          "- **자리를 스스로 고른다** — 아래가 좁으면 위로 뒤집고, 화면 밖으로 나가지 않게 가둔다.",
          "  스크롤하거나 창 크기를 바꿔도 따라간다",
          "- **바깥을 누르면 닫힌다** — `pointerdown` 을 캡처 단계에서 듣기 때문에 중간에서",
          "  `stopPropagation` 한 코드가 있어도 막히지 않는다",
          "- **겹쳐 떠도 서로를 가리지 않는다** — 메뉴 안의 드롭다운에서 값을 골라도 메뉴는 열린 채고,",
          "  Escape 는 맨 위의 것부터 하나씩 걷는다",
          "- **Escape 로 닫힌다**",
          "- **쌓임 순서는 `--tx-popup-z` 하나로 정해진다.** 이 값을 바꾸면 위 컴포넌트가 모두 따라온다",
          "",
          "그래서 이 컴포넌트가 따로 정하는 것은 **날짜를 고르는 규약과 겉모습**뿐이다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    placeholder: { control: "text" },
    format: { control: "text" },
    keepOpen: { control: "boolean" },
    disabled: { control: "boolean" },
    className: { control: "text", description: "`.tx-daypicker` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxDayPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { placeholder: "날짜 선택", format: "YYYY-MM-DD", keepOpen: false, disabled: false, className: "w-48" }
};

export const States: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxDayPicker className="w-48" placeholder="고른 것 없음" />
      <TxDayPicker className="w-48" defaultValue={new Date()} />
      <TxDayPicker className="w-48" defaultValue={new Date()} disabled />
      <TxDayPicker className="w-56" defaultValue={new Date()} format="YYYY년 MM월 DD일" />
    </TxFlex>
  )
};

/** 달력이 조상에 잘리지 않는다. 아래 상자는 `overflow: hidden` 이고 높이가 낮다. */
export const NotClipped: Story = {
  parameters: noControls,
  render: () => (
    <div className="h-24 w-72 overflow-hidden rounded-md border border-slate-300 p-3 dark:border-gray-700">
      <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">overflow: hidden · height: 6rem</div>
      <TxDayPicker className="w-48" placeholder="열어 보세요" />
    </div>
  )
};

/** 폼에 나란히 놓았을 때. 높이와 테두리가 입력창과 맞는다. */
export const AlignsWithTxInput: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center">
      <TxInput placeholder="이름" className="w-40" />
      <TxDayPicker className="w-40" placeholder="입사일" />
    </TxFlex>
  )
};

/** 토큰 한 줄로 바꾼다. 강조색을 바꾸면 고른 날과 오늘 표시가 함께 따라온다. */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxDayPicker className="w-48" defaultValue={new Date()} placeholder="기본" />
      <TxDayPicker className="w-48" defaultValue={new Date()} style={vars({ "--tx-color-primary": "#7c3aed" })} />
      <TxDayPicker className="w-48" defaultValue={new Date()} style={vars({ "--tx-daypicker-cell-size": "2.75rem" })} />
      <TxDayPicker className="w-48" defaultValue={new Date()} style={vars({ "--tx-radius": "9999px" })} />
    </TxFlex>
  )
};

/* ---------------------------------------------------------------- 기간 */

/**
 * 기간을 고른다. 시작은 **그날 00:00**, 끝은 **그날 23:59:59.999** 로 준다 —
 * 그대로 서버에 넘기면 마지막 날이 통째로 포함된다.
 */
export const Range: StoryObj = {
  parameters: noControls,
  render: function RangeStory() {
    const [range, setRange] = useState<TxDateRange>([undefined, undefined]);

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxDayPickerRange className="w-72" value={range} onChange={setRange} />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">
          {range[0]?.toLocaleString() ?? "—"}
          <br />
          {range[1]?.toLocaleString() ?? "—"}
        </div>
      </TxFlex>
    );
  }
};

/**
 * **`maxDays` 를 넘는 날은 아예 눌리지 않는다.**
 *
 * 시작일을 고르면 그 뒤 7일까지만 열린다. 고르고 나서 알리는 것보다 못 고르게 하는 편이 낫다.
 */
export const MaxDays: StoryObj = {
  parameters: noControls,
  render: () => <TxDayPickerRange className="w-72" maxDays={7} placeholder="최대 7일 — 시작일을 골라 보세요" />
};

/**
 * **확인 버튼 모드.** 고치는 동안에는 아무것도 오지 않고, 버튼을 눌러야 한 번 온다.
 *
 * 확인하지 않고 닫으면 열기 전 상태로 되돌아간다.
 */
export const SubmitMode: StoryObj = {
  parameters: noControls,
  render: function SubmitModeStory() {
    const [log, setLog] = useState<string[]>([]);

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxDayPickerRange
          className="w-72"
          defaultValue={[startOfDay(addDays(new Date(), -6)), endOfDay(new Date())]}
          onSubmit={(r) => setLog((prev) => [`onSubmit(${r[0]?.toLocaleDateString()} ~ ${r[1]?.toLocaleDateString()})`, ...prev].slice(0, 5))}
        />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">{log.length === 0 ? "—" : log.map((l, i) => <div key={i}>{l}</div>)}</div>
      </TxFlex>
    );
  }
};

/**
 * **`header` 에 프리셋 버튼을 둔다.** 값은 `ref` 로 넣는다 —
 * 달력 안에서 값을 읽어 넘겨주는 복잡한 render prop 이 필요 없다.
 */
export const Presets: StoryObj = {
  parameters: noControls,
  render: function PresetsStory() {
    const ref = useRef<TxDayPickerRangeRef>(null);
    const setLast = (days: number) => ref.current?.setValue([addDays(new Date(), -(days - 1)), new Date()]);

    return (
      <TxDayPickerRange
        ref={ref}
        className="w-72"
        header={
          <TxFlex className="gap-1">
            {[7, 30, 90].map((d) => (
              <TxButton key={d} variant="ghost" label={`최근 ${d}일`} onClick={() => setLast(d)} />
            ))}
            <TxButton variant="ghost" label="지우기" onClick={() => ref.current?.clear()} />
          </TxFlex>
        }
      />
    );
  }
};

/** 한 번에 보여 줄 달의 수를 바꾼다. */
export const MonthCount: StoryObj = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxDayPickerRange className="w-72" numberOfMonths={1} placeholder="한 달" />
      <TxDayPickerRange className="w-72" placeholder="두 달 (기본)" />
    </TxFlex>
  )
};
