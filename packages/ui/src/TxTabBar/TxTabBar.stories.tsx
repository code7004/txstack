import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { TxAppShell } from "../TxAppShell";
import { TxSideNav } from "../TxSideNav";
import { TxTabBar } from "./TxTabBar";

const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

/** 카탈로그는 네트워크 없이도 같은 모습이어야 한다. 아이콘 자리는 글자로 대신한다. */
const Icon = ({ glyph }: { glyph: string }) => <span className="leading-none">{glyph}</span>;

const TABS: [string, string, ReactNode?][] = [
  ["홈", "🏠"],
  ["정산 내역", "📄"],
  ["숨은 보상", "🎁", 2],
  ["설정", "⚙️"]
];

/**
 * **카탈로그에는 라우터가 없다.** 그래서 항목을 `as="button"` 으로 두고 누르면 지금 탭이 바뀐다.
 * 실제로는 `as={NavLink}` 이고, 지금 탭은 라우터가 붙이는 `aria-current` 로 알려진다.
 */
const Tabs = ({ here, go, style }: { here: string; go: (name: string) => void; style?: CSSProperties }) => (
  <TxTabBar style={style}>
    {TABS.map(([name, glyph, badge]) => (
      <TxTabBar.Item key={name} label={name} icon={<Icon glyph={glyph} />} badge={badge} as="button" type="button" aria-current={here === name ? "page" : undefined} onClick={() => go(name)} />
    ))}
  </TxTabBar>
);

/** 셸 밖에서 볼 때 탭바 자리를 흉내 낸다 — 실제로는 셸의 `tabBar` 가 높이 · 바탕 · 위 선을 갖는다 */
const Slot = ({ children }: { children: ReactNode }) => (
  <div className="w-[24rem] border-t border-slate-200 bg-white pt-1.5 pb-1.5 dark:border-slate-700 dark:bg-slate-900" style={{ blockSize: "3.5rem", boxSizing: "border-box" }}>
    {children}
  </div>
);

const meta = {
  title: "Layout/TxTabBar",
  component: TxTabBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "좁은 화면의 아래쪽에 붙는 탭 줄. **항목은 같은 폭으로 나눠 서고, 아이콘 위 · 글자 아래다.**",
          "",
          "```tsx",
          'import { TxAppShell, TxTabBar } from "@txstack/ui";',
          "",
          "<TxAppShell left={<TxSideNav>{sideItems}</TxSideNav>} tabBar={",
          "  <TxTabBar>",
          '    <TxTabBar.Item icon={<IconHome />} label="홈" as={NavLink} to="/" end />',
          '    <TxTabBar.Item icon={<IconBell />} label="알림" badge={2} as={NavLink} to="/alerts" />',
          "  </TxTabBar>",
          "}>",
          "  <Outlet />",
          "</TxAppShell>",
          "```",
          "",
          "### 자리는 셸이, 항목은 이 부품이",
          "",
          "`TxAppShell` 의 `tabBar` 에 넣으면 **좁은 화면(`breakpoint` 보다 좁을 때)에서만** 화면 아래에 붙고,",
          "본문 아래에 탭바 높이만큼 자리가 비워진다. 아이폰 홈 표시줄 자리도 셸이 더한다.",
          "넓은 화면에서는 그리지 않는다 — 그때는 `left` · `top` 의 메뉴가 그 일을 한다.",
          "",
          "탭바에 다 안 드는 메뉴는 **서랍(햄버거)** 에 남는다. 두 메뉴는 같은 라우트 배열에서 뽑는다.",
          "",
          "### 지금 탭",
          "",
          "라우터가 붙여 주는 `aria-current` 를 그대로 읽어 **글자색 · 굵기 · 위쪽 막대**로 알린다.",
          "막대는 `--tx-tab-bar-indicator-size: 0` 으로, 굵기 차이는 두 굵기 토큰을 같게 두어 끈다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    label: { control: "text", description: "주면 스스로 `<nav>` 가 된다. 셸의 `tabBar` 안에서는 주지 않는다" },
    className: { control: "text", description: "`.tx-tab-bar` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [here, setHere] = useState("홈");
    return (
      <Slot>
        <TxTabBar {...args}>
          {TABS.map(([name, glyph, badge]) => (
            <TxTabBar.Item key={name} label={name} icon={<Icon glyph={glyph} />} badge={badge} as="button" type="button" aria-current={here === name ? "page" : undefined} onClick={() => setHere(name)} />
          ))}
        </TxTabBar>
      </Slot>
    );
  }
};

/**
 * 셸의 `tabBar` 에 넣은 모습. 좁은 화면만 흉내 내려고 `breakpoint` 를 크게 줬다 —
 * 실제로는 기본(960) 그대로 두거나 앱의 기준(예: 1024)을 준다. 헤더의 햄버거(서랍)는 그대로 남는다.
 *
 * 탭바는 화면 아래에 붙으므로(`position: fixed`) 이 판 안에 가둬 보였다.
 */
export const InAppShell: Story = {
  name: "셸 안에서",
  parameters: noControls,
  render: function InAppShellStory() {
    const [here, setHere] = useState("홈");

    return (
      // 바깥(transform)이 fixed 의 기준이 되고, 안쪽이 굴러간다 — 탭바는 판 아래에 붙은 채로 남는다
      <div style={{ transform: "translateZ(0)", inlineSize: "24rem", blockSize: "34rem" }} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <div style={{ blockSize: "100%", overflow: "auto" }}>
          <TxAppShell
            breakpoint={100_000}
            header={<strong>브랜드</strong>}
            left={
              <TxSideNav>
                {[...TABS.map(([name]) => name), "고객센터", "약관"].map((name) => (
                  <TxSideNav.Item key={name} label={name} as="button" type="button" aria-current={here === name ? "page" : undefined} onClick={() => setHere(name)} />
                ))}
              </TxSideNav>
            }
            tabBar={<Tabs here={here} go={setHere} />}
            style={{ minBlockSize: "100%" }}
          >
            <h1 className="text-lg font-semibold">{here}</h1>
            {Array.from({ length: 12 }, (_, index) => (
              <p key={index} className="py-2 text-slate-500 dark:text-slate-400">
                {index + 1}번째 줄 — 맨 아래 줄도 탭바에 가리지 않는다
              </p>
            ))}
          </TxAppShell>
        </div>
      </div>
    );
  }
};

/**
 * 겉은 토큰으로 바꾼다. 아래는 막대를 끄고(`--tx-tab-bar-indicator-size: 0`) 두 굵기를 같게 두어
 * **색만으로** 지금 탭을 알리는 모습이다 — 디자인이 그렇게 정했을 때 쓴다. 스크린리더에는 여전히
 * `aria-current` 가 알린다.
 */
export const Tokens: Story = {
  parameters: noControls,
  render: function TokensStory() {
    const [here, setHere] = useState("홈");
    const flat = vars({
      "--tx-tab-bar-color": "#9ca3af",
      "--tx-tab-bar-current-color": "#374151",
      "--tx-tab-bar-font-weight": "700",
      "--tx-tab-bar-current-font-weight": "700",
      "--tx-tab-bar-indicator-size": "0",
      "--tx-tab-bar-max-width": "22rem"
    });

    return (
      <div className="flex flex-col gap-4">
        <Slot>
          <Tabs here={here} go={setHere} />
        </Slot>
        <Slot>
          <Tabs here={here} go={setHere} style={flat} />
        </Slot>
      </div>
    );
  }
};
