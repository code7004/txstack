import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxDropdown } from "../TxDropdown";
import { TxFlex } from "../TxFlex";
import { TxInput } from "../TxInput";
import { TxCombobox } from "./TxCombobox";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const CITIES = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종"];

const meta = {
  title: "Form/TxCombobox",
  component: TxCombobox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "직접 쳐 넣으면서 후보도 고르는 입력창.",
          "",
          "```tsx",
          'import { TxCombobox } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          '<TxCombobox data={["서울", "부산"]} value={city} onChangeText={setCity} />;',
          "```",
          "",
          "**목록에 없는 값도 그대로 들어간다.** 그게 `TxDropdown` 과 갈리는 지점이다 —",
          "정해진 것 중에서만 고르게 하려면 그쪽을 쓴다.",
          "",
          "- 포커스하면 후보가 전부 뜨고, 치기 시작하면 걸러진다",
          "- `↑↓` 로 짚고 `Enter` 로 고른다. `Esc` 로 닫아도 **친 글자는 남는다**",
          "- `Home`·`End` 는 가로채지 않는다 — 글자 안에서 커서를 옮기는 키다",
          "- 후보가 하나도 없으면 목록을 닫는다. 새 값을 치는 중이라는 뜻이다",
          "",
          "값은 **보이는 글자 그 자체**다. 자유입력이라 따로 코드값을 두지 않는다 —",
          "코드값이 필요하면 `TxDropdown` 이 `{ name, value }` 를 받는다.",
          "",
          "목록은 화면 맨 위 층으로 뜬다. `overflow: hidden` 안에 넣어도 잘리지 않는다.",
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
          "그래서 이 컴포넌트가 따로 정하는 것은 **자유입력·자동완성 규약과 겉모습**뿐이다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { data: CITIES },
  argTypes: {
    placeholder: { control: "text" },
    limit: { control: { type: "number", min: 1, max: 20 } },
    disabled: { control: "boolean" },
    className: { control: "text", description: "`.tx-combobox` 에 덧붙는다 (교체 아님)" },
    data: { control: false }
  }
} satisfies Meta<typeof TxCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  args: { placeholder: "지역", disabled: false, className: "w-56" }
};

/**
 * **목록에 없는 값도 들어간다.**
 *
 * "제주" 처럼 후보에 없는 글자를 쳐 보라 — 목록은 조용히 닫히고 값은 그대로 남는다.
 */
export const FreeText: Story = {
  parameters: noControls,
  render: function FreeTextStory() {
    const [value, setValue] = useState("");
    const [picked, setPicked] = useState<string | null>(null);

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxCombobox className="w-56" data={CITIES} value={value} onChangeText={setValue} onPick={setPicked} placeholder="치거나 고르세요" />
        <div className="font-mono text-sm text-slate-500 dark:text-slate-400">
          값: {value || "—"}
          <br />
          목록에서 고른 것: {picked ?? "—"}
        </div>
      </TxFlex>
    );
  }
};

/** `TxDropdown` 과 나란히. 왼쪽은 정해진 것만, 오른쪽은 새 값도 된다. */
export const ComparedWithTxDropdown: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-4">
      <TxFlex className="flex-col items-start gap-1">
        <span className="text-sm text-slate-500 dark:text-slate-400">TxDropdown — 목록에서만</span>
        <TxDropdown className="w-56" data={CITIES} placeholder="지역" />
      </TxFlex>
      <TxFlex className="flex-col items-start gap-1">
        <span className="text-sm text-slate-500 dark:text-slate-400">TxCombobox — 새 값도 된다</span>
        <TxCombobox className="w-56" data={CITIES} placeholder="지역" />
      </TxFlex>
    </TxFlex>
  )
};

/** 기본은 대소문자 무시 부분일치다. `filter` 로 규칙을 바꾼다. */
export const Filter: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxCombobox className="w-56" data={["Seoul", "Busan", "Daegu", "Incheon"]} placeholder="부분일치 (기본) — se 를 쳐 보세요" />
      <TxCombobox className="w-56" data={["Seoul", "Busan", "Daegu", "Incheon"]} placeholder="앞에서만 일치" filter={(data, q) => data.filter((d) => d.toLowerCase().startsWith(q.toLowerCase()))} />
      <TxCombobox className="w-56" data={CITIES} placeholder="거르지 않음 — 늘 전부" filter={(data) => [...data]} />
    </TxFlex>
  )
};

/**
 * 후보가 많으면 기본은 **전부 보여 주고 안에서 스크롤**한다.
 *
 * `limit` 을 주면 잘라내고 **몇 개가 더 있는지 알리는 줄**이 붙는다 — 없으면 사용자는
 * 이게 전부인 줄 안다.
 */
export const ManyItems: Story = {
  parameters: noControls,
  render: () => {
    const many = Array.from({ length: 200 }, (_, i) => `항목 ${i + 1}`);

    return (
      <TxFlex className="flex-col items-start gap-3">
        <TxCombobox className="w-56" data={many} placeholder="200개 — 스크롤 (기본)" />
        <TxCombobox className="w-56" data={many} limit={5} placeholder="200개 — 5개만" />
        <TxCombobox className="w-56" data={many} limit={5} moreLabel={(n) => `${n}개 더… 검색어를 좁혀 보세요`} placeholder="안내 문구를 바꾼 것" />
      </TxFlex>
    );
  }
};

/**
 * **키보드만으로 다뤄 보라.**
 *
 * `↓` 로 열고 → `↑↓` 로 짚고 → `Enter` 로 고른다. `Esc` 는 목록만 닫고 글자는 남긴다.
 * `Home`·`End` 는 커서를 옮기고, 열린 채 `Tab` 을 누르면 다음 칸으로 나간다.
 */
export const Keyboard: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="w-56 flex-col items-stretch gap-3">
      <TxInput placeholder="여기서 Tab 을 눌러 보세요" />
      <TxCombobox data={CITIES} placeholder="콤보박스" />
      <TxInput placeholder="열린 채 Tab 을 누르면 여기로" />
    </TxFlex>
  )
};

/** 목록이 조상에 잘리지 않는다. 아래 상자는 `overflow: hidden` 이고 높이가 낮다. */
export const NotClipped: Story = {
  parameters: noControls,
  render: () => (
    <div className="h-24 w-72 overflow-hidden rounded-md border border-slate-300 p-3 dark:border-gray-700">
      <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">overflow: hidden · height: 6rem</div>
      <TxCombobox className="w-56" data={CITIES} placeholder="열어 보세요" />
    </div>
  )
};

export const States: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxCombobox className="w-56" data={CITIES} placeholder="기본" />
      <TxCombobox className="w-56" data={CITIES} defaultValue="서울" />
      <TxCombobox className="w-56" data={CITIES} defaultValue="서울" disabled />
    </TxFlex>
  )
};

/** 폼에 나란히 놓았을 때. 높이와 테두리가 입력창·드롭다운과 맞는다. */
export const AlignsWithOthers: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="items-center">
      <TxInput placeholder="이름" className="w-36" />
      <TxCombobox className="w-36" data={CITIES} placeholder="지역" />
      <TxDropdown className="w-36" data={["관리자", "일반"]} placeholder="등급" />
    </TxFlex>
  )
};

/** 토큰 한 줄로 바꾼다. 껍데기는 `TxInput` 과 같은 토큰을 쓴다. */
export const CustomizingTokens: Story = {
  parameters: noControls,
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxCombobox className="w-56" data={CITIES} placeholder="기본" />
      <TxCombobox className="w-56" data={CITIES} placeholder="--tx-input-height: 3rem" style={vars({ "--tx-input-height": "3rem" })} />
      <TxCombobox className="w-56" data={CITIES} placeholder="--tx-radius: 9999px" style={vars({ "--tx-radius": "9999px" })} />
      <TxCombobox className="w-56" data={CITIES} placeholder="--tx-input-border-color: 강조색" style={vars({ "--tx-input-border-color": "var(--tx-color-primary)" })} />
    </TxFlex>
  )
};
