import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { TxAppShell } from "./TxAppShell";

/** CSS 변수를 인라인 스타일로 주려면 타입을 넓혀야 한다. 스토리에서만 쓴다. */
const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

/** 스토리에서만 쓰는 겉모습. 셸이 아니라 슬롯의 몫이라 여기서 준다. */
const NavStyle = () => (
  <style>{`
    .story-nav-link {
      display: block;
      padding: 0.5rem 0.75rem;
      border-radius: var(--tx-radius);
      color: inherit;
      text-decoration: none;
      white-space: nowrap;
    }
    .story-nav-link:hover {
      background: color-mix(in oklab, var(--tx-color-state) 6%, transparent);
    }
    .story-nav-link[aria-current="page"] {
      background: color-mix(in oklab, var(--tx-color-state) 10%, transparent);
      font-weight: 600;
    }
  `}</style>
);

/**
 * 스토리는 라우터를 안 쓴다. **누르면 "지금 자리" 만 옮기는 흉내**다 —
 * 실제로는 `NavLink` 를 넣으면 라우터가 그 일을 한다.
 */
const Nav = ({ items, row, style }: { items: string[]; row?: boolean; style?: CSSProperties }) => {
  const [here, setHere] = useState(items[0]);

  return (
    <div style={{ display: row ? "flex" : "grid", gap: row ? "0.25rem" : "0.125rem", ...style }}>
      <NavStyle />
      {items.map((item) => (
        <a
          key={item}
          href="#"
          className="story-nav-link"
          aria-current={item === here ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            setHere(item);
          }}
        >
          {item}
        </a>
      ))}
    </div>
  );
};

const Brand = () => (
  <>
    <strong style={{ fontSize: "1.0625rem" }}>Acme</strong>
    <span style={{ marginInlineStart: "auto", fontSize: "0.875rem", color: "color-mix(in oklab, var(--tx-color-text) 60%, transparent)" }}>김채원</span>
  </>
);

const Top = () => <Nav row items={["대시보드", "주문", "회원", "설정"]} style={{ paddingBlockEnd: "0.5rem" }} />;

const Left = () => <Nav items={["오늘", "이번 주", "보관함", "휴지통"]} style={{ padding: "0.75rem" }} />;

const Right = () => (
  <div style={{ display: "grid", gap: "0.5rem", padding: "1rem", fontSize: "0.875rem" }}>
    <strong>이 문서에서</strong>
    <Nav items={["개요", "설치", "사용법"]} />
  </div>
);

const Bottom = () => (
  <pre style={{ margin: 0, padding: "0.75rem 1rem", fontSize: "0.8125rem", lineHeight: 1.7, color: "color-mix(in oklab, var(--tx-color-text) 60%, transparent)" }}>{["> build 시작", "  38개 파일 확인", "  0 오류", "> 준비됨 (1.2s)"].join("\n")}</pre>
);

const Footer = () => <div style={{ padding: "1rem", fontSize: "0.8125rem", color: "color-mix(in oklab, var(--tx-color-text) 60%, transparent)" }}>© 2026 Acme</div>;

const Article = ({ long }: { long?: boolean }) => (
  <div style={{ display: "grid", gap: "0.75rem", maxInlineSize: "42rem" }}>
    <h1 style={{ fontSize: "1.5rem", margin: 0 }}>오늘의 주문</h1>
    {Array.from({ length: long ? 24 : 4 }, (_, index) => (
      <p key={index} style={{ margin: 0, color: "color-mix(in oklab, var(--tx-color-text) 60%, transparent)", lineHeight: 1.7 }}>
        {index + 1}. 셸은 자리만 잡는다. 여기 들어가는 것은 전부 여러분의 화면이다.
      </p>
    ))}
  </div>
);

/** 스토리 안에 화면 하나를 통째로 넣는 자리다. 실제로는 `<body>` 가 이 역할을 한다. */
const frame: CSSProperties = { border: "1px solid var(--tx-color-border)", borderRadius: "var(--tx-radius)", overflow: "hidden", resize: "horizontal", minInlineSize: "20rem" };

const meta = {
  title: "Layout/TxAppShell",
  component: TxAppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "화면 전체를 짜는 껍데기.",
          "",
          "```tsx",
          'import { TxAppShell } from "@txstack/ui";',
          'import "@txstack/ui/styles.css"; // 앱에서 한 번',
          "",
          "<TxAppShell header={<Brand />} top={<MainNav />} left={<SideNav />} footer={<Footer />}>",
          "  <Outlet />",
          "</TxAppShell>;",
          "```",
          "",
          "### 여섯 자리는 prop 으로 준다",
          "",
          "`header` · `top` · `left` · `right` · `bottom` · `footer`. **안 준 자리는 그리지",
          "않는다** — 빈 패널이 남지 않는다. `children` 은 언제나 `<main>` 이다.",
          "",
          "```text",
          "┌──────────────────────────────┐",
          "│ header                       │",
          "│ top                          │",
          "├────────┬───────────┬─────────┤",
          "│ left   │ children  │ right   │",
          "│        ├───────────┤         │",
          "│        │ bottom    │         │",
          "├────────┴───────────┴─────────┤",
          "│ footer                       │",
          "└──────────────────────────────┘",
          "```",
          "",
          "**`좌 · (본문 · 아래) · 우` 다** — 좌우 패널이 바닥까지 서고 아래 패널은 본문 안에서",
          '올라온다. `bottomSpan="screen"` 을 주면 **좌우까지 아우르는 전체 폭**이 된다 —',
          "그때는 좌우가 그 위에서 끝나고 그 밑을 아래 패널이 가로지른다.",
          "",
          "이름은 방향이지만 **역할은 셸이 붙인다** — `top` · `left` 는 `<nav>`, `right` 는",
          "`<aside>`, `bottom` 은 `<section>` 이고 **각각 다른 이름이 간다.** 이름이 없으면",
          '스크린리더가 "탐색" 여럿을 구분하지 못한다. 이름은 `labels` 로 바꾼다.',
          "",
          "좌우는 글 방향을 따른다 — RTL 에서는 `left` 가 오른쪽에 선다.",
          "",
          "### 첫 Tab 은 본문으로 건너뛴다",
          "",
          "메뉴가 스무 줄이면 키보드로 본문에 닿는 데 스무 번을 눌러야 한다. **셸만 본문이",
          "어디인지 알므로** 그 링크는 셸이 만든다. Tab 을 한 번 눌러 보면 왼쪽 위에 나타난다.",
          "",
          "### 패널이 할 수 있는 일은 `panels` 한 곳에 적는다",
          "",
          "```tsx",
          "<TxAppShell",
          "  panels={{",
          "    left:   { resize: true, collapse: true, defaultSize: 280 },",
          "    right:  { resize: { min: 200, max: 520 }, collapse: true, defaultCollapsed: true },",
          "    bottom: { resize: { min: 100 } }",
          "  }}",
          "  onPanelChange={(slot, { size, collapsed, settled }) => settled && save(slot, size, collapsed)}",
          "/>",
          "```",
          "",
          "**크기 조절 · 접기 · 처음 값 · 밖에서 쥐기가 자리마다 한 곳에서 끝난다.**",
          "",
          "**한계를 안 줘도 화면이 안 무너진다** — 본문이 240px 은 남도록 셸이 조인다.",
          "손잡이는 **키보드로도 움직인다**: 화살표로 16px씩, `Home`/`End` 로 끝까지.",
          "",
          "**기억하는 것은 앱의 몫이다.** `onPanelChange` 의 `settled` 가 `true` 일 때 받아",
          "두었다가 `defaultSize` · `defaultCollapsed` 로 돌려주면 새로고침 뒤에도 남는다 —",
          "어디에 저장할지는 앱이 정할 일이라 셸이 고르지 않는다.",
          "",
          "### 접었다 편다",
          "",
          "`collapse: true` 를 준 자리는 경계선 가운데에 작은 스위치가 생긴다. 누르면",
          "**완전히 사라지고**, 다시 누르면 **접기 전 크기로** 돌아온다. 접힌 자리에는",
          "손잡이가 없고, 안의 링크에 Tab 도 닿지 않는다 — 폭만 0 으로 두면 보이지 않는",
          "곳에 탭 정거장이 남는다.",
          "",
          "**`defaultCollapsed` 는 처음만 정하고 물러난다.** 밖에서 계속 쥐려면 `collapsed` 를",
          "준다 — 그러면 스위치를 눌러도 밖이 정한 값이 이긴다. 스위치를 직접 그릴 때 쓰는",
          "길이기도 하다(`collapse` 를 안 주고 `collapsed` 만).",
          "",
          "### 좁아지면 left 가 서랍으로 간다",
          "",
          "`breakpoint`(기본 960px)보다 좁아지면 헤더에 햄버거가 생기고, 누르면 왼쪽에서",
          "서랍이 나온다. **서랍은 `left` 로 준 바로 그것을 그린다** — 모바일용을 따로 주지",
          "않는다. 서랍의 폭은 서랍 것이라 그때는 손잡이도 없다.",
          "",
          "### 헤더가 머무는 방식은 셋",
          "",
          '`sticky` 가 `true`(기본)면 위에 붙어 있고, `"hide"` 면 **내리면 숨고 올리면 나온다**,',
          "`false` 면 내용과 같이 굴러간다. `top` 은 헤더와 한 덩어리라 같이 따라간다.",
          "",
          "### 색과 여백은 슬롯이 정한다",
          "",
          "셸은 **패널의 폭과 헤더의 높이만** 정한다. 그 안에 무엇이 놓이는지는 슬롯을 준",
          "쪽의 일이라 손대지 않는다 — 손대면 여러분의 헤더가 셸의 규칙과 싸운다.",
          "",
          "폭이 안 맞으면 `--tx-app-shell-left-width` · `--tx-app-shell-right-width` ·",
          "`--tx-app-shell-bottom-height` · `--tx-app-shell-main-padding` 을 준다.",
          "",
          "컨트롤 패널은 `Playground` 에서만 동작한다."
        ].join("\n")
      }
    }
  },
  argTypes: {
    header: { control: false },
    top: { control: false },
    left: { control: false },
    right: { control: false },
    bottom: { control: false },
    footer: { control: false },
    children: { control: false },
    labels: { control: false },
    classNames: { control: false },
    panels: { control: false },
    bottomSpan: { control: false }
  }
} satisfies Meta<typeof TxAppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 여섯 자리를 다 채운 모습. 모서리를 끌어 좁히면 `left` 가 서랍으로 간다. */
export const Playground: Story = {
  args: {
    header: <Brand />,
    top: <Top />,
    left: <Left />,
    right: <Right />,
    bottom: <Bottom />,
    footer: <Footer />,
    sticky: true,
    breakpoint: 960,
    children: <Article />
  },
  render: (args) => (
    <div style={frame}>
      <TxAppShell {...args} style={{ minBlockSize: "38rem" }} />
    </div>
  )
};

/** 안 준 자리는 그리지 않는다. 문서 사이트라면 이 정도면 된다. */
export const 필요한자리만: Story = {
  name: "필요한 자리만",
  args: { header: <Brand />, left: <Left />, children: <Article /> },
  render: (args) => (
    <div style={frame}>
      <TxAppShell {...args} style={{ minBlockSize: "26rem" }} />
    </div>
  )
};

/** `children` 만 줘도 된다. 이때도 `<main>` 과 건너뛰기 링크는 그대로 있다. */
export const 본문만: Story = {
  name: "본문만",
  args: { children: <Article /> },
  render: (args) => (
    <div style={frame}>
      <TxAppShell {...args} style={{ minBlockSize: "18rem" }} />
    </div>
  )
};

/**
 * 세 자리의 경계선을 끌어 본다. **본문이 240px 은 남도록 조여 있어** 끝까지 끌어도
 * 화면이 무너지지 않는다. 손잡이에 Tab 으로 가면 화살표·`Home`·`End` 로도 움직인다.
 */
export const 끌어서크기바꾸기: Story = {
  name: "끌어서 크기 바꾸기",
  render: () => {
    const Demo = () => {
      const [sizes, setSizes] = useState<{ left?: number; right?: number; bottom?: number }>({});

      return (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <code style={{ fontSize: "0.8125rem", color: "color-mix(in oklab, var(--tx-color-text) 60%, transparent)" }}>onPanelChange → {JSON.stringify(sizes)}</code>
          <div style={frame}>
            <TxAppShell
              header={<Brand />}
              left={<Left />}
              right={<Right />}
              bottom={<Bottom />}
              panels={{ left: { resize: true }, right: { resize: { min: 200, max: 520 } }, bottom: { resize: { min: 100 } } }}
              onPanelChange={(slot, { size }) => setSizes((current) => ({ ...current, [slot]: size }))}
              style={{ minBlockSize: "34rem" }}
            >
              <Article />
            </TxAppShell>
          </div>
        </div>
      );
    };

    return <Demo />;
  }
};

/**
 * 크기를 밖에서 쥔 모습. `panels.left.size` 를 주면 **밖이 정한 값이 이긴다.**
 * 새로고침 뒤에도 남기려면 `onPanelChange` 로 받아 두었다가 `defaultSize` 로 돌려준다.
 */
export const 크기를밖에서쥐기: Story = {
  name: "크기를 밖에서 쥐기",
  render: () => {
    const Demo = () => {
      const [left, setLeft] = useState(200);

      return (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.875rem" }}>
            왼쪽 패널 {left}px
            <input type="range" min={140} max={420} value={left} onChange={(event) => setLeft(Number(event.target.value))} />
          </label>
          <div style={frame}>
            <TxAppShell header={<Brand />} left={<Left />} panels={{ left: { resize: true, size: left } }} onPanelChange={(_, { size }) => size != null && setLeft(size)} style={{ minBlockSize: "24rem" }}>
              <Article />
            </TxAppShell>
          </div>
        </div>
      );
    };

    return <Demo />;
  }
};

/**
 * 경계선 가운데 스위치를 눌러 접는다. **접기 전 크기를 셸이 쥐고 있어서** 다시 펴면
 * 그 폭으로 돌아온다. 끌어서 바꾼 뒤 접었다 펴 보면 보인다.
 */
export const 접었다펴기: Story = {
  name: "접었다 펴기",
  args: {
    header: <Brand />,
    left: <Left />,
    right: <Right />,
    bottom: <Bottom />,
    panels: { left: { resize: true, collapse: true }, right: { resize: true, collapse: true }, bottom: { resize: true, collapse: true } },
    children: <Article />
  },
  render: (args) => (
    <div style={frame}>
      <TxAppShell {...args} style={{ minBlockSize: "34rem" }} />
    </div>
  )
};

/**
 * 위가 기본(`"main"` — 좌우 패널이 바닥까지 선다), 아래가 `"screen"`(좌우가 그 위에서
 * 끝난다). **좌우 패널이 어디서 끝나는지**가 다르다 — 업계가 갈리는 자리라 고르게 열어 두었다.
 */
export const 아래패널의폭: Story = {
  name: "아래 패널의 폭",
  render: () => (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {(["main", "screen"] as const).map((span) => (
        <div key={span} style={{ display: "grid", gap: "0.5rem" }}>
          <code style={{ fontSize: "0.8125rem" }}>bottomSpan=&quot;{span}&quot;</code>
          <div style={{ ...frame, resize: "none" }}>
            <TxAppShell header={<Brand />} left={<Left />} right={<Right />} bottom={<Bottom />} bottomSpan={span} panels={{ bottom: { resize: true } }} style={{ minBlockSize: "22rem" }}>
              <Article />
            </TxAppShell>
          </div>
        </div>
      ))}
    </div>
  )
};

/** 스위치를 직접 그린 모습. `collapse` 를 안 주고 `collapsed` 만 준다. */
export const 스위치를직접그리기: Story = {
  name: "스위치를 직접 그리기",
  render: () => {
    const Demo = () => {
      const [off, setOff] = useState(false);

      return (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.875rem" }}>
            <input type="checkbox" checked={off} onChange={(event) => setOff(event.target.checked)} />
            왼쪽 패널 접기
          </label>
          <div style={frame}>
            <TxAppShell header={<Brand />} left={<Left />} panels={{ left: { collapsed: off } }} style={{ minBlockSize: "24rem" }}>
              <Article />
            </TxAppShell>
          </div>
        </div>
      );
    };

    return <Demo />;
  }
};

/**
 * 내리면 숨고 **올리는 순간 바로 나온다.** 긴 글에서 화면을 돌려준다.
 * 굴려 보려면 이 이야기를 캔버스에서 연다.
 */
export const 내리면숨는헤더: Story = {
  name: "내리면 숨는 헤더",
  args: { header: <Brand />, top: <Top />, left: <Left />, sticky: "hide", children: <Article long /> },
  parameters: { docs: { story: { inline: false, height: "22rem" } } }
};

/**
 * `breakpoint` 를 크게 잡아 좁은 화면인 척한 것. 햄버거를 누르면 **왼쪽 패널에 있던
 * 바로 그 메뉴**가 서랍으로 나온다.
 */
export const 좁은화면: Story = {
  name: "좁은 화면",
  args: { header: <Brand />, left: <Left />, footer: <Footer />, breakpoint: 100_000, children: <Article /> },
  render: (args) => (
    <div style={{ ...frame, maxInlineSize: "26rem" }}>
      <TxAppShell {...args} style={{ minBlockSize: "26rem" }} />
    </div>
  )
};

/** 패널이 좁거나 넓어야 하면 변수를 준다. */
export const 폭바꾸기: Story = {
  name: "폭 바꾸기",
  args: { header: <Brand />, left: <Left />, right: <Right />, children: <Article /> },
  render: (args) => (
    <div style={frame}>
      <TxAppShell {...args} style={{ minBlockSize: "24rem", ...vars({ "--tx-app-shell-left-width": "11rem", "--tx-app-shell-right-width": "18rem", "--tx-app-shell-main-padding": "2.5rem" }) }} />
    </div>
  )
};
