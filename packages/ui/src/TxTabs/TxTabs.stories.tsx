import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxButton } from "../TxButton";
import { TxFlex } from "../TxFlex";
import { TxForm } from "../TxForm";
import { TxTabs } from "./TxTabs";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

const Panel = ({ children }: { children: React.ReactNode }) => <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>;

const meta = {
  title: "Layout/TxTabs",
  component: TxTabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "탭. **머리말 한 줄과 그 아래 본문 한 칸.**",
          "",
          "```tsx",
          'import { TxTabs } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxTabs",
          "  tabs={[",
          '    { label: "정보", content: <UserInfo /> },',
          '    { label: "기록", content: <History /> }',
          "  ]}",
          "/>;",
          "```",
          "",
          "- **`content` 에 요소를 그대로 준다.** 본문을 그리는 함수를 따로 넘기지 않는다",
          "- `label` 도 `ReactNode` 다 — 배지·아이콘이 그대로 들어간다",
          "- **`content` 를 안 주면 패널을 그리지 않는다.** 전환 스위치로만 쓸 수 있다",
          "- `value` 를 주면 controlled 다. `onChange` 를 받고도 안 바꾸면 화면도 그대로다",
          "",
          "**키보드는 WAI-ARIA 탭 규약을 따른다.**",
          "",
          "- **탭 줄 전체가 Tab 한 번**이다. 탭이 열 개라도 Tab 을 열 번 누르지 않는다",
          "- 그 안에서 ←→ 로 옮기고 Home · End 로 양 끝에 간다. **옮기면 그 자리에서 바로 전환된다**",
          "- 비활성 탭은 화살표가 건너뛴다",
          "- 골라진 탭은 `aria-selected` 로 알리고, 패널과 서로를 가리킨다",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    tabs: { control: false },
    value: { control: false },
    defaultValue: { control: "number" },
    onChange: { control: false },
    classNames: { control: false },
    className: { control: "text", description: "`.tx-tabs` 에 덧붙는다 (교체 아님)" },
    "aria-label": { control: "text", description: "탭 줄의 이름. 한 화면에 탭이 여럿일 때" }
  }
} satisfies Meta<typeof TxTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

const BASIC = [
  { label: "정보", content: <Panel>이름 · 연락처 같은 기본 정보가 여기 온다.</Panel> },
  { label: "기록", content: <Panel>지난 활동이 여기 온다.</Panel> },
  { label: "설정", content: <Panel>알림 · 권한 같은 설정이 여기 온다.</Panel> }
];

export const Playground: Story = {
  args: { tabs: BASIC, defaultValue: 0, className: "" }
};

/**
 * **`content` 에 요소를 그대로 준다.** 본문 자리에 무엇이든 들어간다 — 폼도, 표도.
 *
 * 원본은 본문을 그리는 함수(`renderBody`)를 따로 넘겨야 했다.
 */
export const Content: Story = {
  parameters: noControls,
  args: { tabs: BASIC },
  render: () => (
    <TxTabs
      tabs={[
        {
          label: "폼",
          content: (
            <TxForm className="max-w-sm">
              <TxForm.Input caption="이름" placeholder="홍길동" />
              <TxForm.Input caption="연락처" placeholder="010-0000-0000" />
            </TxForm>
          )
        },
        {
          label: "목록",
          content: (
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>첫째 줄</li>
              <li>둘째 줄</li>
            </ul>
          )
        },
        { label: "빈 칸", content: <Panel>아무것이나 온다.</Panel> }
      ]}
    />
  )
};

/** `label` 도 요소다. 배지나 아이콘을 붙일 수 있다. */
export const LabelNode: Story = {
  parameters: noControls,
  args: { tabs: BASIC },
  render: () => (
    <TxTabs
      tabs={[
        { label: "전체", content: <Panel>전체 목록</Panel> },
        {
          label: (
            <span className="flex items-center gap-1">
              신규 <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">3</span>
            </span>
          ),
          content: <Panel>새로 들어온 것 3건</Panel>
        },
        { label: "보관", content: <Panel>보관함</Panel> }
      ]}
    />
  )
};

/**
 * **키보드로 다뤄 보라.**
 *
 * Tab 으로 탭 줄에 들어오면 **한 번에 골라진 탭으로** 온다. 거기서 ←→ 로 옮기면
 * 그 자리에서 바로 전환되고, Home · End 로 양 끝에 간다.
 * 아래 버튼으로 탭 줄을 지나쳐 보면 Tab 을 세 번 누르지 않는 것을 볼 수 있다.
 */
export const Keyboard: Story = {
  parameters: noControls,
  args: { tabs: BASIC },
  render: () => (
    <TxFlex className="flex-col items-start gap-3">
      <TxButton label="앞의 버튼" variant="secondary" />
      <TxTabs tabs={BASIC} aria-label="키보드 예제" />
      <TxButton label="뒤의 버튼" variant="secondary" />
    </TxFlex>
  )
};

/** 비활성 탭은 눌러도 안 골라지고 **화살표도 건너뛴다.** */
export const Disabled: Story = {
  parameters: noControls,
  args: { tabs: BASIC },
  render: () => (
    <TxTabs
      tabs={[
        { label: "가능", content: <Panel>고를 수 있다</Panel> },
        { label: "권한 없음", content: <Panel>여기는 안 보인다</Panel>, disabled: true },
        { label: "가능", content: <Panel>화살표가 가운데를 건너뛴다</Panel> }
      ]}
    />
  )
};

/**
 * **본문을 안 주면 패널을 그리지 않는다.** 전환 스위치로만 쓰는 자리다 —
 * 지금 사이드바가 이 모양으로 쓴다.
 */
export const SwitchOnly: Story = {
  parameters: noControls,
  args: { tabs: BASIC },
  render: function SwitchOnlyStory() {
    const [index, setIndex] = useState(0);

    return (
      <TxFlex className="flex-col items-stretch gap-3">
        <TxTabs tabs={[{ label: "Developer" }, { label: "Admin" }]} value={index} onChange={setIndex} />
        <Panel>바깥에서 그리는 내용 — 지금은 {index === 0 ? "Developer" : "Admin"} 메뉴</Panel>
      </TxFlex>
    );
  }
};

/**
 * `value` 를 주면 **값의 주인은 소비자**다. 아래 폼은 저장하지 않으면 탭을 못 떠난다 —
 * `onChange` 를 받고도 값을 안 바꾸면 화면이 그대로이기 때문이다.
 */
export const Controlled: Story = {
  parameters: noControls,
  args: { tabs: BASIC },
  render: function ControlledStory() {
    const [index, setIndex] = useState(0);
    const [locked, setLocked] = useState(true);

    return (
      <TxFlex className="flex-col items-stretch gap-3">
        <TxTabs
          tabs={[
            { label: "편집 중", content: <Panel>저장하기 전에는 다른 탭으로 못 넘어간다.</Panel> },
            { label: "미리보기", content: <Panel>저장했으니 넘어왔다.</Panel> }
          ]}
          value={index}
          onChange={(next) => !locked && setIndex(next)}
        />

        <TxFlex>
          <TxButton label={locked ? "저장하기" : "다시 잠그기"} variant={locked ? "primary" : "secondary"} onClick={() => setLocked((prev) => !prev)} />
        </TxFlex>
        <Panel>
          지금 탭: {index} · {locked ? "잠김 — 탭이 안 넘어간다" : "풀림"}
        </Panel>
      </TxFlex>
    );
  }
};

/**
 * 탭이 많으면 줄바꿈 대신 **옆으로 밀린다.** 줄이 늘면 아래 본문이 튀기 때문이다.
 *
 * **스크롤바는 감춘다** — 밑줄 자리에 겹쳐 앉으면 굵은 회색 막대가 밑줄을 가린다.
 * 대신 ←→ 로 옮기면 줄이 따라 밀리고, 트랙패드 스와이프와 Shift+휠도 그대로 동작한다.
 * 마지막 탭까지 화살표로 가 보라.
 */
export const Many: Story = {
  parameters: noControls,
  args: { tabs: BASIC },
  render: () => (
    <div className="max-w-md">
      <TxTabs tabs={Array.from({ length: 12 }, (_, index) => ({ label: `탭 ${index + 1}`, content: <Panel>{index + 1}번 본문</Panel> }))} />
    </div>
  )
};

/** 겉모습은 CSS 변수로 바꾼다. 색 하나만 바꿔도 밑줄과 글자가 같이 따라온다. */
export const Tokens: Story = {
  parameters: noControls,
  args: { tabs: BASIC },
  render: () => (
    <div className="flex flex-col gap-8">
      <TxTabs tabs={BASIC} style={vars({ "--tx-tabs-accent": "#7c3aed" })} />
      <TxTabs tabs={BASIC} style={vars({ "--tx-tabs-indicator": "4px", "--tx-tabs-font-size": "1rem", "--tx-tabs-gap": "1rem" })} />
    </div>
  )
};
