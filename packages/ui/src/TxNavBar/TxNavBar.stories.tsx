import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { TxAppShell } from "../TxAppShell";
import { TxGrid } from "../TxGrid";
import { TxSideNav } from "../TxSideNav";
import { TxNavBar } from "./TxNavBar";

/**
 * **카탈로그에는 라우터가 없다.** 그래서 항목을 `as="button"` 으로 두고 누르면 **본문이 바뀐다** —
 * 주소를 건드리지 않으므로 문서 페이지가 엉뚱한 자리로 튀지 않는다. 실제로는 `as={NavLink}` 다.
 */
type Pick = (name: string) => void;

const PRODUCT: [string, string[]][] = [
  ["업무", ["CRM", "ERP", "그룹웨어"]],
  ["개발", ["API 게이트웨이", "로그 수집", "배포 파이프라인"]],
  ["분석", ["대시보드", "리포트"]]
];

const DOCS: [string, string[]][] = [
  ["시작하기", ["설치", "첫 화면 만들기"]],
  ["안내서", ["인증", "권한", "배포"]]
];

/** 패널 안은 소비자 것이다. 카탈로그에서는 흔한 모양 하나를 예로 보여 준다. */
const Panel = ({ groups, pick }: { groups: [string, string[]][]; pick: Pick }) => (
  <TxGrid columns={groups.length}>
    {groups.map(([title, links]) => (
      <section key={title} className="flex flex-col items-start gap-1">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</h3>
        {links.map((link) => (
          <button key={link} type="button" className="rounded px-1 py-0.5 text-start hover:underline" onClick={() => pick(link)}>
            {link}
          </button>
        ))}
      </section>
    ))}
  </TxGrid>
);

const items = (pick: Pick, picked: string) => (
  <>
    <TxNavBar.Item label="제품" panel={<Panel groups={PRODUCT} pick={pick} />} />
    <TxNavBar.Item label="문서" panel={<Panel groups={DOCS} pick={pick} />} />
    <TxNavBar.Item label="가격" as="button" type="button" aria-current={picked === "가격" ? "page" : undefined} onClick={() => pick("가격")} />
    <TxNavBar.Item label="회사" as="button" type="button" aria-current={picked === "회사" ? "page" : undefined} onClick={() => pick("회사")} />
  </>
);

/** 고른 것이 여기에 나온다. 이 스토리가 무엇을 하는지 눈으로 확인하는 자리다. */
const Body = ({ picked, children }: { picked: string; children?: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <h1 className="text-lg font-semibold">{picked}</h1>
    <p className="text-slate-500 dark:text-slate-400">항목이나 패널 속을 누르면 이 자리가 바뀐다. 주소는 그대로다.</p>
    {children}
  </div>
);

/**
 * 패널이 펼쳐질 자리를 미리 비워 둔다. **문서 페이지의 미리보기는 내용만큼만 높아서**,
 * 비워 두지 않으면 떠오른 패널이 잘린다.
 */
const room: CSSProperties = { display: "flex", flexDirection: "column", gap: "1rem", minBlockSize: "18rem" };

const meta = {
  title: "Layout/TxNavBar",
  component: TxNavBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "가로로 도는 내비게이션 줄. **항목에 `panel` 을 주면 메가메뉴가 된다.**",
          "",
          "```tsx",
          'import { TxAppShell, TxNavBar } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "const menu = (",
          "  <>",
          '    <TxNavBar.Item label="제품" panel={<ProductPanel />} />',
          '    <TxNavBar.Item label="가격" as={NavLink} to="/pricing" />',
          "  </>",
          ");",
          "",
          "<TxAppShell header={<Brand />} top={<TxNavBar>{menu}</TxNavBar>}>…</TxAppShell>",
          "```",
          "",
          "### 항목은 세 모양이다",
          "",
          "| 준 것 | 나오는 것 |",
          "| --- | --- |",
          "| `as` 만 | 그냥 링크 |",
          "| `panel` 만 | 제목 자체가 **여는 버튼** |",
          "| `panel` + `as` | **링크 + 옆에 `▾` 버튼** — 제목을 누르면 이동하고 버튼이 패널을 연다 |",
          "",
          "셋째가 사이트 내비게이션에서 흔한 모양이다(`TitleAsLink`). 제목이 진짜 링크라",
          "새 탭으로 열기 · 주소 복사가 되고, **여는 일은 버튼이 맡아 `aria-expanded` 가 거짓이",
          "되지 않는다** — APG *Disclosure Navigation with Top-Level Links* 다.",
          "`▾` 버튼의 이름은 `toggleLabel` 로 바꾼다(기본 `\"하위 메뉴\"`).",
          "",
          "### 가로만 한다",
          "",
          "세로로 세우는 것 — **아이콘만 남기고 접히거나 하위메뉴가 트리로 접히는 것** — 은",
          "**`TxSideNav`** 가 갖는다. 1차 내비게이션을 세로로 두는 화면이면 그쪽에 담는다.",
          "**두 부품은 자리(GNB·SNB)를 주장하지 않고 방향만 주장한다.**",
          "",
          "좁은 화면에서는 셸이 `left` 를 서랍으로 옮기고 그 안에 `TxSideNav` 가 선다 —",
          "이 부품이 스스로 접히지 않는 이유다. 상황이 하나만 남는다.",
          "",
          "### 자리는 셸이, 메뉴는 이쪽이",
          "",
          "**놓이는 자리 · `<nav>` 랜드마크 · sticky · 서랍은 `TxAppShell` 이 갖는다.**",
          "이 컴포넌트는 줄 안의 **항목 · 패널 · 키보드**만 맡는다.",
          "홀로 쓸 때만 `label` 을 주면 스스로 `<nav>` 가 된다 — 셸 안에서 주면 랜드마크가 둘이 된다.",
          "",
          "### 패널 안은 소비자 것이다",
          "",
          "그 배치가 곧 그 사이트의 정보 구조라, 라이브러리가 정하면 도메인 지식이 들어온다.",
          "`TxGrid` 같은 있는 부품으로 짠다.",
          "",
          "### 열림은 줄이 하나로 쥔다",
          "",
          "그래서 항목 사이를 지나가도 **깜빡이지 않고 갈아탄다.** 손이 줄 밖으로 나가면",
          "`120ms` 뒤에 닫힌다 — 항목과 패널 사이를 지나는 순간 닫히면 쓸 수 없다.",
          "",
          "**누르는 것으로도 늘 열린다.** 터치에는 hover 가 없다.",
          "",
          "### 키보드",
          "",
          "`←` `→` 로 항목 사이를 옮기고 `Home` · `End` 로 양 끝.",
          "**열려 있으면 옮긴 항목이 열린 채로 이어진다.** `Escape` 는 닫고 포커스를 그 항목으로 되돌린다.",
          "",
          "**`Tab` 은 패널 안으로 들어간다** — 메뉴 규약(`Tab` = 닫기)과 다른 점이다.",
          "패널은 메뉴가 아니라 문서 조각이라 `role=\"menu\"` 를 쓰지 않는다.",
          "",
          "---",
          "",
          "아래 이야기들은 **라우터 없이 도는 카탈로그**라 항목이 `as=\"button\"` 이다 —",
          "누르면 주소가 아니라 **본문 글자가 바뀐다.** 컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  args: { panelWidth: "bar", openOn: "hover" },
  argTypes: {
    panelWidth: { control: "inline-radio", options: ["bar", "item"] },
    openOn: { control: "inline-radio", options: ["hover", "click"] },
    label: { control: "text" },
    className: { control: "text", description: "`.tx-nav-bar` 에 덧붙는다 (교체 아님)" }
  }
} satisfies Meta<typeof TxNavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const noControls = { controls: { disable: true } };

export const Playground: Story = {
  render: function PlaygroundStory(args) {
    const [picked, setPicked] = useState("회사");

    return (
      <div style={room}>
        <TxNavBar {...args}>{items(setPicked, picked)}</TxNavBar>
        <Body picked={picked} />
      </div>
    );
  }
};

/** **얹으면 열리고 항목 사이를 지나가면 갈아탄다.** 패널은 줄 전체 폭으로 펼쳐진다. */
export const Default: Story = {
  parameters: noControls,
  render: function DefaultStory() {
    const [picked, setPicked] = useState("회사");

    return (
      <div style={room}>
        <TxNavBar label="주 메뉴">{items(setPicked, picked)}</TxNavBar>
        <Body picked={picked} />
      </div>
    );
  }
};

/**
 * **제목이 링크이면서 패널도 연다.** `panel` 과 `as` 를 함께 주면 제목은 그 요소가 되고,
 * 옆에 생긴 `▾` 버튼이 패널을 맡는다.
 *
 * 사이트 내비게이션에서 흔한 모양이다 — 제목을 눌러 그 묶음의 첫 화면으로 가고, `▾` 로
 * 하위를 훑는다. 제목이 진짜 링크라 **새 탭으로 열기 · 주소 복사**가 되고, `aria-expanded` 는
 * 여는 버튼이 가져서 거짓이 되지 않는다.
 *
 * ```tsx
 * <TxNavBar.Item label="문서" as={NavLink} to="/docs" panel={<Panel />} />
 * ```
 *
 * 여기서는 라우터가 없어 제목이 `as="button"` 이다 — 누르면 본문이 바뀐다.
 */
export const TitleAsLink: Story = {
  parameters: noControls,
  render: function TitleAsLinkStory() {
    const [picked, setPicked] = useState("문서");

    return (
      <div style={room}>
        <TxNavBar label="주 메뉴">
          <TxNavBar.Item
            label="제품"
            as="button"
            type="button"
            aria-current={picked === "제품" ? "page" : undefined}
            onClick={() => setPicked("제품")}
            panel={<Panel groups={PRODUCT} pick={setPicked} />}
          />
          <TxNavBar.Item
            label="문서"
            as="button"
            type="button"
            aria-current={picked === "문서" ? "page" : undefined}
            onClick={() => setPicked("문서")}
            panel={<Panel groups={DOCS} pick={setPicked} />}
          />
          <TxNavBar.Item label="가격" as="button" type="button" aria-current={picked === "가격" ? "page" : undefined} onClick={() => setPicked("가격")} />
        </TxNavBar>

        <Body picked={picked} />
      </div>
    );
  }
};

/** `panelWidth="item"` — 항목 아래에만 붙는다. 항목이 많고 패널이 작을 때 쓴다. */
export const PanelUnderItem: Story = {
  parameters: noControls,
  render: function PanelUnderItemStory() {
    const [picked, setPicked] = useState("가격");

    return (
      <div style={room}>
        <TxNavBar label="주 메뉴" panelWidth="item">
          <TxNavBar.Item label="제품" panel={<Panel groups={[PRODUCT[0]!]} pick={setPicked} />} />
          <TxNavBar.Item label="문서" panel={<Panel groups={[DOCS[1]!]} pick={setPicked} />} />
          <TxNavBar.Item label="가격" as="button" type="button" aria-current={picked === "가격" ? "page" : undefined} onClick={() => setPicked("가격")} />
        </TxNavBar>
        <Body picked={picked} />
      </div>
    );
  }
};

/** 패널 없이 링크만. **이름이 `TxNavBar` 인 이유다** — 메가가 아닌 줄도 같은 부품이다. */
export const LinksOnly: Story = {
  parameters: noControls,
  render: function LinksOnlyStory() {
    const [picked, setPicked] = useState("홈");

    return (
      <div style={{ ...room, minBlockSize: "10rem" }}>
        <TxNavBar label="주 메뉴">
          {["홈", "소개", "블로그", "문의"].map((name) => (
            <TxNavBar.Item key={name} label={name} as="button" type="button" aria-current={picked === name ? "page" : undefined} onClick={() => setPicked(name)} />
          ))}
        </TxNavBar>
        <Body picked={picked} />
      </div>
    );
  }
};

/**
 * **놓이는 자리를 함께 본다.** 셸의 `top` 이 이 줄의 집이고, `<nav>` 랜드마크와 sticky 도
 * 셸이 붙인다 — 그래서 여기서는 `label` 을 주지 않는다.
 *
 * 좁히면(모서리를 끌어 `360` 아래로) 셸이 `left` 를 서랍으로 옮긴다. **그 안에 서는 것은
 * `TxSideNav`** 다 — 이 줄이 스스로 접히지 않는 이유다.
 *
 * `breakpoint` 를 낮춰 둔 것은 **문서 페이지의 자리가 좁기 때문**이다. 셸의 기본은 `960` 이라
 * 그대로 두면 여기서는 늘 서랍만 보인다.
 */
export const WithShell: StoryObj = {
  parameters: noControls,
  render: function WithShellStory() {
    const [picked, setPicked] = useState("개요");
    const side = (name: string) => (
      <TxSideNav.Item key={name} label={name} as="button" type="button" aria-current={picked === name ? "page" : undefined} onClick={() => setPicked(name)} />
    );

    return (
      <div style={{ border: "1px solid var(--tx-color-border)", borderRadius: "var(--tx-radius)", overflow: "hidden", resize: "horizontal", minInlineSize: "20rem" }}>
        <TxAppShell
          header={<strong className="px-1">IDK</strong>}
          top={<TxNavBar>{items(setPicked, picked)}</TxNavBar>}
          left={
            <TxSideNav>
              {["개요", "지표"].map(side)}
              <TxSideNav.Item label="설정">{["계정", "권한"].map(side)}</TxSideNav.Item>
            </TxSideNav>
          }
          breakpoint={360}
          style={{ minBlockSize: "34rem", "--tx-app-shell-left-width": "fit-content" } as CSSProperties}
        >
          <Body picked={picked}>
            <p className="text-slate-500 dark:text-slate-400">위 줄에서 제품 · 문서에 마우스를 얹으면 패널이 이 본문 위로 펼쳐진다.</p>
          </Body>
        </TxAppShell>
      </div>
    );
  }
};
