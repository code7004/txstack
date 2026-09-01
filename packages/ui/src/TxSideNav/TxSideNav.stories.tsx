import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { TxAppShell } from "../TxAppShell";
import { TxButton } from "../TxButton";
import { TxSideNav } from "./TxSideNav";

/**
 * **카탈로그에는 라우터가 없다.** 그래서 항목을 `as="button"` 으로 두고 누르면 **본문이 바뀐다** —
 * 주소를 건드리지 않으므로 문서 페이지가 엉뚱한 자리로 튀지 않는다. 실제로는 `as={NavLink}` 다.
 */
type Pick = (name: string) => void;

/** 카탈로그는 네트워크 없이도 같은 모습이어야 한다. 아이콘 자리는 글자로 대신한다. */
const Icon = ({ glyph }: { glyph: string }) => <span className="text-base leading-none">{glyph}</span>;

const items = (pick: Pick, picked: string) => {
  const item = (name: string, glyph?: string, badge?: ReactNode) => (
    <TxSideNav.Item
      key={name}
      label={name}
      icon={glyph ? <Icon glyph={glyph} /> : undefined}
      badge={badge}
      as="button"
      type="button"
      aria-current={picked === name ? "page" : undefined}
      onClick={() => pick(name)}
    />
  );

  return (
    <>
      {item("대시보드", "📊")}
      {item("내 고객", "🗂")}
      {item("마켓", "💼")}
      {item("알림", "🔔", 2)}

      <TxSideNav.Item icon={<Icon glyph="⚙️" />} label="설정">
        {item("계정")}
        {item("권한")}
        {item("알림 규칙")}
      </TxSideNav.Item>

      <TxSideNav.Group label="바로가기">
        {item("새 프로젝트 만들기", "＋")}
        {item("회의 잡기", "📅")}
      </TxSideNav.Group>
    </>
  );
};

/** 고른 것이 여기에 나온다. 이 스토리가 무엇을 하는지 눈으로 확인하는 자리다. */
const Body = ({ picked, children }: { picked: string; children?: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <h1 className="text-lg font-semibold">{picked}</h1>
    <p className="text-slate-500 dark:text-slate-400">항목을 누르면 이 자리가 바뀐다. 주소는 그대로다.</p>
    {children}
  </div>
);

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="inline-block rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">{children}</div>
);

/** 줄과 본문을 나란히 놓는다. 하위메뉴를 펴도 잘리지 않게 자리를 미리 비워 둔다. */
const room: CSSProperties = { display: "flex", alignItems: "flex-start", gap: "1.5rem", minBlockSize: "24rem" };

const meta = {
  title: "Layout/TxSideNav",
  component: TxSideNav,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "세로로 서는 내비게이션. **아이콘만 남기고 접히고, 하위메뉴는 트리로 접힌다.**",
          "",
          "```tsx",
          'import { TxAppShell, TxSideNav } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxSideNav collapsed={rail} onCollapsedChange={setRail}>",
          '  <TxSideNav.Item icon={<IconChart />} label="대시보드" as={NavLink} to="/" />',
          '  <TxSideNav.Item icon={<IconBell />} label="알림" badge={2} as={NavLink} to="/alerts" />',
          "",
          '  <TxSideNav.Item icon={<IconCog />} label="설정">',
          '    <TxSideNav.Item label="계정" as={NavLink} to="/settings/account" />',
          "  </TxSideNav.Item>",
          "</TxSideNav>",
          "```",
          "",
          "### 세로만 한다",
          "",
          "가로로 도는 줄 — **큰 패널이 떠오르는 메가메뉴** — 는 `TxNavBar` 가 갖는다.",
          "**두 부품은 자리(GNB·SNB)를 주장하지 않고 방향만 주장한다** — 1차 내비게이션을",
          "세로로 두는 화면이 흔해졌고, 그때 이름이 걸리면 안 되기 때문이다.",
          "",
          "### 접기는 두 가지가 있고 서로 다르다",
          "",
          "`TxAppShell` 의 `left.collapse` 는 **패널을 폭 0 으로 감추고**, 이쪽의 `collapsed` 는",
          "**아이콘 줄로 남긴다.** 둘 중 하나만 쓴다 — 접는 길이 둘이면 무엇을 눌러야 하는지 모른다.",
          "",
          "**스위치는 그리지 않는다.** 헤더의 버튼이나 셸의 스위치가 그 자리를 이미 갖고 있어서,",
          "여기서 또 그리면 화면에 접는 것이 둘이 된다. `collapsed` 를 밖에서 준다.",
          "",
          "셸 안에서 **자리까지 함께 접히게** 하려면 셸에 한 줄을 준다 —",
          "`--tx-app-shell-left-width: fit-content`. 그러면 rail 이 줄을 줄이는 것만으로 자리가 따라온다.",
          "`With Shell` 이야기가 그것이다.",
          "",
          "### 접혀도 쓸 수 있다",
          "",
          "글자는 **지워지지 않고 화면에서만 빠진다** — `display: none` 이면 스크린리더도 못 읽어",
          "아이콘만 남은 줄이 통째로 이름 없는 그림이 된다. 눈으로 보는 사람에게는 풍선 도움말이",
          "대신 알려 준다. 개수는 아이콘 모서리의 점으로 줄어들고, **하위메뉴를 누르면 줄이 먼저 펴진다** —",
          "아이콘 줄에는 하위 목록이 설 자리가 없기 때문이다.",
          "",
          "### 지금 자리는 라우터가 알린다",
          "",
          "`aria-current` 를 그대로 읽는다 — `active` prop 을 또 받으면 두 곳이 어긋난다.",
          "색만으로 알리지 않고 **짚는 막대**를 함께 그린다. 하위 목록은 **부모의 글자와 왼쪽을 맞춰** 들여쓴다.",
          "",
          "---",
          "",
          "아래 이야기들은 **라우터 없이 도는 카탈로그**라 항목이 `as=\"button\"` 이다 —",
          "누르면 주소가 아니라 **본문 글자가 바뀐다.** 컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { defaultCollapsed: false },
  argTypes: {
    collapsed: { control: "boolean" },
    label: { control: "text" },
    className: { control: "text", description: "`.tx-side-nav` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxSideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [picked, setPicked] = useState("대시보드");

    return (
      <div style={room}>
        <Frame>
          <TxSideNav {...args}>{items(setPicked, picked)}</TxSideNav>
        </Frame>
        <Body picked={picked} />
      </div>
    );
  }
};

/** 펼친 모습. **설정을 눌러 하위메뉴를 펴 본다** — 하위는 부모의 글자와 왼쪽이 맞는다. */
export const Default: Story = {
  parameters: noControls,
  render: function DefaultStory() {
    const [picked, setPicked] = useState("대시보드");

    return (
      <div style={room}>
        <Frame>
          <TxSideNav label="주 메뉴">{items(setPicked, picked)}</TxSideNav>
        </Frame>
        <Body picked={picked} />
      </div>
    );
  }
};

/** 접힌 모습(rail). **이름은 풍선 도움말로 남고 개수는 점이 된다.** */
export const Collapsed: Story = {
  parameters: noControls,
  render: function CollapsedStory() {
    const [picked, setPicked] = useState("대시보드");

    return (
      <div style={room}>
        <Frame>
          <TxSideNav label="주 메뉴" defaultCollapsed>
            {items(setPicked, picked)}
          </TxSideNav>
        </Frame>
        <Body picked={picked} />
      </div>
    );
  }
};

/**
 * **스위치는 밖에 둔다.** 헤더의 버튼이든 셸의 스위치든, 접는 것은 화면에 하나여야 한다.
 * 접힌 채로 **설정**을 눌러 보면 줄이 먼저 펴진다.
 */
export const Toggling: StoryObj = {
  parameters: noControls,
  render: function TogglingStory() {
    const [rail, setRail] = useState(false);
    const [picked, setPicked] = useState("대시보드");

    return (
      <div style={room}>
        <div className="flex flex-col items-start gap-3">
          <TxButton variant="secondary" label={rail ? "펼치기" : "접기"} onClick={() => setRail((prev) => !prev)} />

          <Frame>
            <TxSideNav label="주 메뉴" collapsed={rail} onCollapsedChange={setRail}>
              {items(setPicked, picked)}
            </TxSideNav>
          </Frame>
        </div>

        <Body picked={picked} />
      </div>
    );
  }
};

/** 아이콘 없이 글자만 — 하위메뉴를 가진 트리로도 쓴다. */
export const TextOnly: Story = {
  parameters: noControls,
  render: function TextOnlyStory() {
    const [picked, setPicked] = useState("인증");
    const item = (name: string) => (
      <TxSideNav.Item key={name} label={name} as="button" type="button" aria-current={picked === name ? "page" : undefined} onClick={() => setPicked(name)} />
    );

    return (
      <div style={{ ...room, minBlockSize: "18rem" }}>
        <Frame>
          <TxSideNav label="문서">
            {item("시작하기")}
            <TxSideNav.Item label="안내서" defaultOpen>
              {["인증", "권한", "배포"].map(item)}
            </TxSideNav.Item>
            {item("레퍼런스")}
          </TxSideNav>
        </Frame>

        <Body picked={picked} />
      </div>
    );
  }
};

/**
 * **`left` 자리가 rail 과 함께 열리고 닫힌다.** 헤더의 ☰ 를 눌러 보라 — 줄만 줄어드는 것이
 * 아니라 **자리가 함께 줄고 본문이 그만큼 넓어진다.**
 *
 * 그렇게 되는 건 셸에 한 줄을 준 덕이다 — `--tx-app-shell-left-width: fit-content`.
 * **셸이 내용에 맞춰 폭을 잡으면 rail 이 그대로 셸을 움직인다.** 숫자를 두 곳에 적지 않고,
 * 셸은 안에 무엇이 있는지 몰라도 된다.
 *
 * 랜드마크는 셸이 붙이므로 여기서는 `label` 을 주지 않는다. 셸의 `left.collapse`
 * (폭 0 으로 **감추기**)와 이쪽의 rail(아이콘 줄로 **남기기**)은 다른 것이라 둘 중 하나만 쓴다.
 *
 * `breakpoint` 를 `360` 으로 낮춰 두었다 — **셸의 기본은 `960`** 인데 그러면 문서 페이지처럼
 * 좁은 자리에서 셸이 좁은 화면으로 보고 `left` 를 **서랍으로** 옮긴다. 그 모습을 보려면
 * 모서리를 끌어 `360` 아래로 좁힌다.
 */
export const WithShell: StoryObj = {
  parameters: noControls,
  render: function WithShellStory() {
    const [rail, setRail] = useState(false);
    const [picked, setPicked] = useState("대시보드");

    return (
      <div style={{ border: "1px solid var(--tx-color-border)", borderRadius: "var(--tx-radius)", overflow: "hidden", resize: "horizontal", minInlineSize: "20rem" }}>
        <TxAppShell
          header={
            <div className="flex items-center gap-2">
              <TxButton variant="ghost" label="☰" onClick={() => setRail((prev) => !prev)} aria-label={rail ? "메뉴 펼치기" : "메뉴 접기"} />
              <strong>IDK</strong>
            </div>
          }
          left={
            <TxSideNav collapsed={rail} onCollapsedChange={setRail}>
              {items(setPicked, picked)}
            </TxSideNav>
          }
          breakpoint={360}
          style={{ minBlockSize: "34rem", "--tx-app-shell-left-width": "fit-content" } as CSSProperties}
        >
          <Body picked={picked}>
            <p className="text-slate-500 dark:text-slate-400">헤더의 ☰ 로 왼쪽 줄을 아이콘만 남기고 접는다. 접힌 채로 설정을 누르면 줄이 먼저 펴진다.</p>
          </Body>
        </TxAppShell>
      </div>
    );
  }
};
