import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxSideNav } from "./TxSideNav";

/**
 * 이 부품의 값은 **접혀도 쓸 수 있는 것**이다 — 아이콘만 남아도 이름이 읽히고, 하위메뉴를
 * 누르면 막히지 않고 펴진다. 그래서 테스트도 거기에 무게를 둔다.
 */

afterEach(cleanup);

const menu = (
  <>
    <TxSideNav.Item icon={<span>📊</span>} label="대시보드" href="/" aria-current="page" />
    <TxSideNav.Item icon={<span>🔔</span>} label="알림" badge={2} href="/alerts" />

    <TxSideNav.Item icon={<span>⚙️</span>} label="설정">
      <TxSideNav.Item label="계정" href="/settings/account" />
      <TxSideNav.Item label="권한" href="/settings/roles" />
    </TxSideNav.Item>

    <TxSideNav.Group label="바로가기">
      <TxSideNav.Item icon={<span>＋</span>} label="새 프로젝트" as="button" type="button" />
    </TxSideNav.Group>
  </>
);

const root = () => document.querySelector<HTMLElement>('[data-tag="TxSideNav"]')!;
const link = (name: string) => screen.getByRole("link", { name: new RegExp(name) });
const expander = () => screen.getByRole("button", { name: /설정/ });

describe("TxSideNav — 한 칸", () => {
  it("children 이 없으면 링크, 있으면 펼치는 버튼이다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);

    expect(link("대시보드").getAttribute("href")).toBe("/");
    expect(expander().getAttribute("aria-expanded")).toBe("false");
  });

  it("as 로 링크를 갈아끼운다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);
    expect(screen.getByRole("button", { name: /새 프로젝트/ }).tagName).toBe("BUTTON");
  });

  /** 라우터가 붙여 주는 것을 그대로 읽는다. 우리가 active prop 을 또 받으면 두 곳이 어긋난다. */
  it("지금 있는 자리는 aria-current 가 알린다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);
    expect(link("대시보드").getAttribute("aria-current")).toBe("page");
  });

  it("아이콘은 읽히지 않는다 — 이름은 글자가 나른다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);

    const icon = link("대시보드").querySelector(".tx-side-nav__icon");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("배지를 오른쪽에 붙인다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);
    expect(link("알림").querySelector(".tx-side-nav__badge")?.textContent).toBe("2");
  });

  it("줄은 목록이다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);
    expect(root().querySelector("ul")).not.toBeNull();
  });
});

describe("TxSideNav — 하위메뉴", () => {
  it("눌러서 펴고 다시 눌러서 접는다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);

    expect(screen.queryByRole("link", { name: "계정" })).toBeNull();

    fireEvent.click(expander());
    expect(expander().getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "계정" })).not.toBeNull();

    fireEvent.click(expander());
    expect(screen.queryByRole("link", { name: "계정" })).toBeNull();
  });

  /** 감춘 채로 두면 그 안의 링크가 Tab 에 잡히고 스크린리더가 닫힌 메뉴를 읽는다. */
  it("닫혀 있으면 aria-controls 로 없는 것을 가리키지 않는다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);
    expect(expander().getAttribute("aria-controls")).toBeNull();

    fireEvent.click(expander());
    expect(document.getElementById(expander().getAttribute("aria-controls")!)).not.toBeNull();
  });

  it("defaultOpen 으로 펴 놓고 시작한다", () => {
    render(
      <TxSideNav>
        <TxSideNav.Item label="설정" defaultOpen>
          <TxSideNav.Item label="계정" href="/settings/account" />
        </TxSideNav.Item>
      </TxSideNav>
    );

    expect(screen.getByRole("link", { name: "계정" })).not.toBeNull();
  });

  /** 하위메뉴는 서로를 닫지 않는다 — 트리를 훑는 동안 접혀 버리면 자리를 잃는다. */
  it("여럿을 함께 펴 둘 수 있다", () => {
    render(
      <TxSideNav>
        <TxSideNav.Item label="설정">
          <TxSideNav.Item label="계정" href="/a" />
        </TxSideNav.Item>
        <TxSideNav.Item label="보고서">
          <TxSideNav.Item label="월간" href="/b" />
        </TxSideNav.Item>
      </TxSideNav>
    );

    fireEvent.click(screen.getByRole("button", { name: /설정/ }));
    fireEvent.click(screen.getByRole("button", { name: /보고서/ }));

    expect(screen.getByRole("link", { name: "계정" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "월간" })).not.toBeNull();
  });
});

describe("TxSideNav — 접기(rail)", () => {
  it("접히면 겉이 알리고, 글자는 지워지지 않는다", () => {
    render(<TxSideNav defaultCollapsed>{menu}</TxSideNav>);

    expect(root().dataset.collapsed).toBe("");

    // 이름은 여전히 읽힌다 — 화면에서만 감춘다
    expect(screen.getByRole("link", { name: /대시보드/ })).not.toBeNull();
    expect(link("대시보드").querySelector(".tx-side-nav__label")?.textContent).toBe("대시보드");
  });

  /** 아이콘만 있는 줄은 눈으로 보는 사람에게 이름을 알려 줄 길이 필요하다. */
  it("접히면 풍선 도움말로 이름을 알린다", () => {
    // `defaultCollapsed` 는 **처음 값**이라 다시 그려도 바뀌지 않는다. 밖에서 쥐는 쪽으로 본다
    const { unmount } = render(<TxSideNav>{menu}</TxSideNav>);
    expect(link("대시보드").getAttribute("title")).toBeNull();
    unmount();

    render(<TxSideNav collapsed>{menu}</TxSideNav>);
    expect(link("대시보드").getAttribute("title")).toBe("대시보드");
  });

  /**
   * 아이콘 줄에는 하위 목록이 설 자리가 없다. **먼저 펼치고 나서 연다** —
   * 아무 일도 안 일어나면 누른 사람은 고장으로 읽는다.
   */
  it("접힌 채로 하위메뉴를 누르면 줄이 먼저 펴진다", () => {
    render(<TxSideNav defaultCollapsed>{menu}</TxSideNav>);

    fireEvent.click(expander());

    expect(root().dataset.collapsed).toBeUndefined();
    expect(screen.getByRole("link", { name: "계정" })).not.toBeNull();
  });

  it("밖에서 접힘을 쥐면 그쪽이 주인이다", () => {
    const onCollapsedChange = vi.fn();
    const { rerender } = render(
      <TxSideNav collapsed onCollapsedChange={onCollapsedChange}>
        {menu}
      </TxSideNav>
    );
    expect(root().dataset.collapsed).toBe("");

    // 스스로 펴지지 않는다 — 밖에 알리고 기다린다
    fireEvent.click(expander());
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(root().dataset.collapsed).toBe("");

    rerender(
      <TxSideNav collapsed={false} onCollapsedChange={onCollapsedChange}>
        {menu}
      </TxSideNav>
    );
    expect(root().dataset.collapsed).toBeUndefined();
  });

  /** 화면에 접는 것이 둘이면 소비자가 무엇을 눌러야 하는지 모른다. */
  it("스위치를 그리지 않는다", () => {
    render(<TxSideNav defaultCollapsed>{menu}</TxSideNav>);

    // 있는 버튼은 하위메뉴를 펼치는 것과 as=button 하나뿐이다
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});

describe("TxSideNav — 묶음", () => {
  it("제목을 붙이고 목록에 이어 준다", () => {
    render(<TxSideNav>{menu}</TxSideNav>);

    expect(screen.getByRole("list", { name: "바로가기" })).not.toBeNull();
    expect(document.querySelector(".tx-side-nav__group-label")?.textContent).toBe("바로가기");
  });

  it("접혀도 묶음 이름은 읽힌다", () => {
    render(<TxSideNav defaultCollapsed>{menu}</TxSideNav>);
    expect(screen.getByRole("list", { name: "바로가기" })).not.toBeNull();
  });
});

describe("TxSideNav — 자리와 랜드마크", () => {
  /** 셸의 left 는 이미 `<nav>` 다. 거기서 또 nav 가 되면 랜드마크가 둘로 읽힌다. */
  it("label 을 주면 nav 가 되고 안 주면 되지 않는다", () => {
    const { rerender } = render(<TxSideNav>{menu}</TxSideNav>);
    expect(screen.queryByRole("navigation")).toBeNull();

    rerender(<TxSideNav label="주 메뉴">{menu}</TxSideNav>);
    expect(screen.getByRole("navigation", { name: "주 메뉴" })).not.toBeNull();
  });

  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    render(<TxSideNav className="mine">{menu}</TxSideNav>);

    expect(root().classList.contains("tx-side-nav")).toBe(true);
    expect(root().classList.contains("mine")).toBe(true);
  });
});

describe("TxSideNav — CSS 계약과 경계", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxSideNav.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 컴포넌트가 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((m) => m[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  /** 접힘이 폭 하나에서 나와야 마크업이 한 벌로 산다. */
  it("접힘은 폭 하나로 갈린다", () => {
    expect(css).toMatch(/\.tx-side-nav\s*\{[^}]*inline-size:\s*var\(--tx-side-nav-width\)/);
    expect(css).toMatch(/\.tx-side-nav\[data-collapsed\]\s*\{[^}]*inline-size:\s*var\(--tx-side-nav-rail\)/);
  });

  /**
   * **들여쓰기가 조용히 지워진 적이 있다.** 위의 목록 초기화가 `padding: 0` 을 갖는데
   * 들여쓰기를 한 겹 선택자로 써서 특이도에 밀렸다. 겹쳐 쓴 선택자를 여기서 지킨다.
   */
  it("하위 목록을 들여쓴다 — 초기화에 밀리지 않는 선택자로", () => {
    const rule = css.match(/\.tx-side-nav \.tx-side-nav__sub\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("padding-inline-start: var(--tx-side-nav-sub-indent)");

    // 초기화보다 뒤에 와야 같은 특이도에서 이긴다
    expect(css.indexOf(".tx-side-nav .tx-side-nav__sub")).toBeGreaterThan(css.indexOf("list-style: none"));
  });

  /**
   * **글자를 지우지 않고 화면에서만 뺀다.** `display: none` 이면 스크린리더도 못 읽어
   * 아이콘만 남은 줄이 통째로 이름 없는 그림이 된다.
   */
  it("접힌 글자를 display: none 으로 지우지 않는다", () => {
    const hidden = css.match(/\[data-collapsed\][^{]*__label[^{]*\{([^}]*)\}/)?.[1] ?? "";

    expect(hidden).not.toContain("display: none");
    expect(hidden).toContain("clip-path: inset(50%)");
  });

  /** 색을 못 가리는 사람에게도 지금 자리가 보여야 한다. */
  it("지금 자리를 색만으로 알리지 않는다", () => {
    expect(css).toMatch(/\[aria-current\][^{]*::before\s*\{/);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxSideNav/TxSideNav.css" layer(tx);');
  });
});
