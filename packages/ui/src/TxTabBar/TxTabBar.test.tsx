import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxTabBar } from "./TxTabBar";

/**
 * 이 부품은 **항목만** 그린다 — 자리(언제 보일지 · 아래 고정 · 본문 자리 비우기)는 셸의 `tabBar` 가 갖는다.
 * 그래서 여기서는 항목의 마크업 · 이름 · 지금 탭과, 겉을 전부 토큰으로 바꿀 수 있는지를 본다.
 */

afterEach(cleanup);

const tabs = (
  <>
    <TxTabBar.Item icon={<span>🏠</span>} label="홈" href="/" aria-current="page" />
    <TxTabBar.Item icon={<span>📄</span>} label="정산 내역" href="/settlements" />
    <TxTabBar.Item icon={<span>🎁</span>} label="숨은 보상" badge={2} href="/rewards" />
  </>
);

const root = () => document.querySelector<HTMLElement>('[data-tag="TxTabBar"]')!;

describe("TxTabBar — 그리기", () => {
  it("항목마다 목록의 한 칸이고 링크다", () => {
    render(<TxTabBar>{tabs}</TxTabBar>);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "홈" }).getAttribute("href")).toBe("/");
  });

  it("label 이 없으면 nav 를 만들지 않는다 — 셸의 tabBar 가 이미 nav 다", () => {
    render(<TxTabBar>{tabs}</TxTabBar>);
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("label 을 주면 스스로 nav 가 된다", () => {
    render(<TxTabBar label="하단 탭">{tabs}</TxTabBar>);
    expect(screen.getByRole("navigation", { name: "하단 탭" }).contains(root())).toBe(true);
  });

  it("아이콘은 읽히지 않고 글자가 이름이다", () => {
    render(<TxTabBar>{tabs}</TxTabBar>);

    const icon = screen.getByRole("link", { name: "홈" }).querySelector(".tx-tab-bar__icon");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  /** 아이콘이 없는 칸도 글자 줄이 같은 높이에 서야 한다 */
  it("아이콘이 없어도 아이콘 칸은 남는다", () => {
    render(
      <TxTabBar>
        <TxTabBar.Item label="더보기" href="/more" />
      </TxTabBar>
    );
    expect(screen.getByRole("link", { name: "더보기" }).querySelector(".tx-tab-bar__icon")).not.toBeNull();
  });

  it("badge 는 이름에 함께 읽힌다", () => {
    render(<TxTabBar>{tabs}</TxTabBar>);
    expect(screen.getByRole("link", { name: /^숨은 보상\s*2$/ })).toBeTruthy();
  });

  /** 지금 탭은 라우터가 붙인 것을 그대로 쓴다 — active prop 을 따로 받으면 두 곳이 어긋난다 */
  it("aria-current 를 그대로 둔다", () => {
    render(<TxTabBar>{tabs}</TxTabBar>);
    expect(screen.getByRole("link", { name: "홈" }).getAttribute("aria-current")).toBe("page");
  });

  it("as 로 링크를 갈아끼운다", () => {
    const Fake = ({ to, ...props }: { to: string; className?: string; children?: React.ReactNode }) => <a href={`#${to}`} data-fake="" {...props} />;
    render(
      <TxTabBar>
        <TxTabBar.Item as={Fake} to="/x" label="엑스" />
      </TxTabBar>
    );

    const link = screen.getByRole("link", { name: "엑스" });
    expect(link.hasAttribute("data-fake")).toBe(true);
    expect(link.classList.contains("tx-tab-bar__link")).toBe(true);
  });

  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    render(<TxTabBar className="mine">{tabs}</TxTabBar>);
    expect(root().className).toBe("tx-tab-bar mine");
  });
});

describe("TxTabBar — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxTabBar.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const base = css.match(/\.tx-tab-bar\s*\{([^}]*)\}/)?.[1] ?? "";
  const current = css.match(/\.tx-tab-bar__link\[aria-current\]:not\(\[aria-current="false"\]\)\s*\{([^}]*)\}/)?.[1] ?? "";
  const indicator = css.match(/\[aria-current\][^{]*::before\s*\{([^}]*)\}/)?.[1] ?? "";

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

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxTabBar/TxTabBar.css" layer(tx);');
  });

  /** settlemint 의 Figma 값(아이콘 칸 20 · 간격 4 · 11px · 색 둘)을 전부 토큰으로 맞출 수 있어야 한다 */
  it("칸 안의 크기 · 글자 · 색이 전부 토큰이다", () => {
    for (const name of ["icon-size", "gap", "font-size", "font-weight", "color", "current-color", "current-font-weight", "max-width", "padding-inline"]) {
      expect(base, name).toMatch(new RegExp(`--tx-tab-bar-${name}:`));
    }
  });

  it("항목은 같은 폭으로 나눈다", () => {
    expect(css).toMatch(/\.tx-tab-bar__item\s*\{[^}]*flex:\s*1 1 0/);
  });

  it("지금 탭은 색 · 굵기 · 막대로 알린다 — 막대는 두께 · 색 토큰이라 끌 수 있다", () => {
    expect(current).toMatch(/color:\s*var\(--tx-tab-bar-current-color\)/);
    expect(current).toMatch(/font-weight:\s*var\(--tx-tab-bar-current-font-weight\)/);
    expect(indicator).toMatch(/block-size:\s*var\(--tx-tab-bar-indicator-size\)/);
    expect(indicator).toMatch(/background-color:\s*var\(--tx-tab-bar-indicator-color\)/);
    expect(base).toMatch(/--tx-tab-bar-indicator-size:\s*2px/);
  });

  it("자리(고정 · 높이 · 바탕 · 경계선)는 갖지 않는다 — 셸의 tabBar 가 갖는다", () => {
    expect(css).not.toMatch(/position:\s*fixed/);
    expect(css).not.toMatch(/safe-area-inset/);
  });
});
