import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxNavBar } from "./TxNavBar";

/**
 * 이 컴포넌트의 값은 **직접 짜면 빠뜨리는 것들**이다 — 키보드로 열기, 항목 사이를
 * 갈아타도 깜빡이지 않기, 좁을 때 접히기. 그래서 테스트도 거기에 무게를 둔다.
 */

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const menu = (
  <>
    <TxNavBar.Item label="제품" panel={<a href="/crm">CRM</a>} />
    <TxNavBar.Item label="가격" href="/pricing" />
    <TxNavBar.Item label="문서" panel={<a href="/guide">가이드</a>} />
  </>
);

const root = () => document.querySelector<HTMLElement>('[data-tag="TxNavBar"]')!;
const trigger = (name: string) => screen.getByRole("button", { name: new RegExp(name) });
const panels = () => [...document.querySelectorAll(".tx-nav-bar__panel")];
const openName = () => document.querySelector<HTMLElement>('[data-nav-trigger][aria-expanded="true"]')?.textContent?.replace("▾", "");

describe("TxNavBar — 항목", () => {
  it("panel 을 주면 펼치는 버튼, 안 주면 링크다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    expect(trigger("제품").tagName).toBe("BUTTON");
    expect(trigger("제품").getAttribute("aria-expanded")).toBe("false");

    const link = screen.getByRole("link", { name: "가격" });
    expect(link.getAttribute("href")).toBe("/pricing");
  });

  /** 패널 안에는 링크 목록·설명·그림이 온다. 메뉴 규약 안에서는 그것들이 안 읽힌다. */
  it("role=menu 를 쓰지 않는다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.querySelector('[role="menuitem"]')).toBeNull();
    expect(root().querySelector("ul")).not.toBeNull();
  });

  it("줄은 목록이다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});

/**
 * **제목이 링크이면서 패널도 여는 모양.** 사이트 내비게이션에서 흔한데, 한때 `panel` 이 있으면
 * 소비자가 준 `as`·`to`·`onClick` 이 **조용히 버려졌다** — 제목을 눌러도 아무 일이 없었다.
 */
describe("TxNavBar — 링크이면서 패널을 여는 항목", () => {
  const linked = (
    <TxNavBar>
      <TxNavBar.Item label="문서" as="a" href="/docs" panel={<a href="/docs/start">시작하기</a>} />
    </TxNavBar>
  );

  it("제목은 진짜 링크다 — 새 탭·주소 복사가 된다", () => {
    render(linked);

    const link = screen.getByRole("link", { name: "문서" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
  });

  it("여는 것은 옆의 버튼이고 aria-expanded 는 그 버튼이 갖는다", () => {
    render(linked);

    const toggle = screen.getByRole("button", { name: "문서 하위 메뉴" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("link", { name: "문서" }).getAttribute("aria-expanded")).toBeNull();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "시작하기" })).not.toBeNull();
  });

  it("제목을 눌러도 패널이 열리지 않는다 — 이동하는 자리다", () => {
    render(linked);

    fireEvent.click(screen.getByRole("link", { name: "문서" }));
    expect(panels()).toHaveLength(0);
  });

  it("얹으면 열린다 — 링크가 있어도 마찬가지다", () => {
    render(linked);

    fireEvent.pointerEnter(screen.getByRole("link", { name: "문서" }).closest("li")!, { pointerType: "mouse" });
    expect(screen.getByRole("button", { name: "문서 하위 메뉴" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("버튼 이름을 소비자가 바꾼다", () => {
    render(
      <TxNavBar>
        <TxNavBar.Item label="Docs" as="a" href="/docs" toggleLabel="submenu" panel={<a href="/docs/start">Start</a>} />
      </TxNavBar>
    );

    expect(screen.getByRole("button", { name: "Docs submenu" })).not.toBeNull();
  });

  it("화살표는 그 버튼도 찾아간다", () => {
    render(
      <TxNavBar>
        <TxNavBar.Item label="제품" panel={<a href="/crm">CRM</a>} />
        <TxNavBar.Item label="문서" as="a" href="/docs" panel={<a href="/docs/start">시작하기</a>} />
      </TxNavBar>
    );

    trigger("제품").focus();
    fireEvent.keyDown(trigger("제품"), { key: "ArrowRight" });

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "문서 하위 메뉴" }));
  });
});

describe("TxNavBar — 열고 닫기", () => {
  it("누르면 열리고 다시 누르면 닫힌다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    fireEvent.click(trigger("제품"));
    expect(trigger("제품").getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "CRM" })).not.toBeNull();

    fireEvent.click(trigger("제품"));
    expect(trigger("제품").getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: "CRM" })).toBeNull();
  });

  /** 각자 열림을 쥐면 A 의 닫힘 지연과 B 의 열림이 엇갈려 깜빡인다. */
  it("열림은 하나뿐이다 — 갈아탄다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    fireEvent.click(trigger("제품"));
    fireEvent.click(trigger("문서"));

    expect(panels()).toHaveLength(1);
    expect(openName()).toBe("문서");
  });

  it("닫혀 있으면 aria-controls 로 없는 것을 가리키지 않는다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);
    expect(trigger("제품").getAttribute("aria-controls")).toBeNull();

    fireEvent.click(trigger("제품"));
    const id = trigger("제품").getAttribute("aria-controls")!;
    expect(document.getElementById(id)).not.toBeNull();
  });

  it("얹으면 열린다 — 손가락은 아니다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    fireEvent.pointerEnter(trigger("제품").parentElement!, { pointerType: "touch" });
    expect(panels()).toHaveLength(0);

    fireEvent.pointerEnter(trigger("제품").parentElement!, { pointerType: "mouse" });
    expect(openName()).toBe("제품");
  });

  it("openOn=click 이면 얹어도 열리지 않는다", () => {
    render(<TxNavBar openOn="click">{menu}</TxNavBar>);

    fireEvent.pointerEnter(trigger("제품").parentElement!, { pointerType: "mouse" });
    expect(panels()).toHaveLength(0);

    fireEvent.click(trigger("제품"));
    expect(panels()).toHaveLength(1);
  });

  /** 항목과 패널 사이를 지나는 순간 닫히면 쓸 수 없다. */
  it("줄 밖으로 나가면 잠시 뒤 닫힌다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    fireEvent.click(trigger("제품"));
    fireEvent.pointerLeave(root(), { pointerType: "mouse" });

    // 아직 닫히지 않았다
    expect(panels()).toHaveLength(1);

    act(() => void vi.advanceTimersByTime(120));
    expect(panels()).toHaveLength(0);
  });

  it("나갔다 곧 돌아오면 닫히지 않는다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    fireEvent.click(trigger("제품"));
    fireEvent.pointerLeave(root(), { pointerType: "mouse" });
    fireEvent.pointerEnter(root(), { pointerType: "mouse" });

    act(() => void vi.advanceTimersByTime(200));
    expect(panels()).toHaveLength(1);
  });

  it("열린 항목을 알려 준다", () => {
    const onOpenChange = vi.fn();
    render(<TxNavBar onOpenChange={onOpenChange}>{menu}</TxNavBar>);

    fireEvent.click(trigger("제품"));
    expect(onOpenChange).toHaveBeenLastCalledWith("제품");

    fireEvent.click(trigger("제품"));
    expect(onOpenChange).toHaveBeenLastCalledWith(null);
  });
});

describe("TxNavBar — 키보드", () => {
  it("Escape 로 닫고 포커스를 그 항목으로 되돌린다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    fireEvent.click(trigger("제품"));
    fireEvent.keyDown(root(), { key: "Escape" });

    expect(panels()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger("제품"));
  });

  it("화살표로 항목 사이를 옮긴다 — 열려 있으면 열린 채로 이어진다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    fireEvent.click(trigger("제품"));
    fireEvent.keyDown(trigger("제품"), { key: "ArrowRight" });

    expect(document.activeElement).toBe(trigger("문서"));
    expect(openName()).toBe("문서");
  });

  it("닫혀 있으면 옮기기만 한다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    trigger("제품").focus();
    fireEvent.keyDown(trigger("제품"), { key: "ArrowRight" });

    expect(document.activeElement).toBe(trigger("문서"));
    expect(panels()).toHaveLength(0);
  });

  it("양 끝에서 돌아 나온다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    trigger("제품").focus();
    fireEvent.keyDown(trigger("제품"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(trigger("문서"));

    fireEvent.keyDown(trigger("문서"), { key: "End" });
    expect(document.activeElement).toBe(trigger("문서"));

    fireEvent.keyDown(trigger("문서"), { key: "Home" });
    expect(document.activeElement).toBe(trigger("제품"));
  });

  /** 패널은 메뉴가 아니라 문서 조각이다 — Tab 이 그 안으로 들어가야 한다. */
  it("패널 안으로 포커스가 들어가도 닫히지 않는다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);

    fireEvent.click(trigger("제품"));
    const inside = screen.getByRole("link", { name: "CRM" });

    fireEvent.blur(root(), { relatedTarget: inside });
    expect(panels()).toHaveLength(1);
  });

  it("줄 밖으로 포커스가 나가면 닫힌다", () => {
    render(
      <>
        <TxNavBar>{menu}</TxNavBar>
        <button type="button">밖</button>
      </>
    );

    fireEvent.click(trigger("제품"));
    fireEvent.blur(root(), { relatedTarget: screen.getByRole("button", { name: "밖" }) });

    expect(panels()).toHaveLength(0);
  });
});

describe("TxNavBar — 자리와 랜드마크", () => {
  /** 셸의 top·left 는 이미 `<nav>` 다. 거기서 또 nav 가 되면 랜드마크가 둘로 읽힌다. */
  it("label 을 주면 nav 가 되고 안 주면 되지 않는다", () => {
    const { rerender } = render(<TxNavBar>{menu}</TxNavBar>);
    expect(screen.queryByRole("navigation")).toBeNull();

    rerender(<TxNavBar label="주 메뉴">{menu}</TxNavBar>);
    expect(screen.getByRole("navigation", { name: "주 메뉴" })).not.toBeNull();
  });

  it("패널 폭을 data 속성으로 알린다", () => {
    render(<TxNavBar panelWidth="item">{menu}</TxNavBar>);
    expect(root().dataset.panelWidth).toBe("item");
  });

  /** 세로로 세우는 것은 이 부품의 일이 아니다 — `TxSideNav` 가 갖는다. */
  it("가로만 한다 — 방향을 받지 않는다", () => {
    render(<TxNavBar>{menu}</TxNavBar>);
    expect(root().dataset.orientation).toBeUndefined();
  });
});

describe("TxNavBar — CSS 계약과 경계", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxNavBar.css"), "utf8"));
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

  /**
   * **패널 폭의 기준이 갈리는 자리다.** 줄 폭으로 펼치려면 기준이 줄이어야 하고,
   * 항목 폭이면 항목이 기준을 쥐어야 한다. 둘을 한 DOM 으로 내는 것이 이 컴포넌트의 요지다.
   */
  it("bar 는 줄이 기준, item 은 항목이 기준이다", () => {
    expect(css).toMatch(/\.tx-nav-bar\s*\{[^}]*position:\s*relative/);
    expect(css).toMatch(/\[data-panel-width="bar"\][^{]*__panel\s*\{[^}]*inset-inline:\s*0/);
    expect(css).toMatch(/\[data-panel-width="item"\][^{]*__item\s*\{[^}]*position:\s*relative/);
  });

  it("패널은 떠오른다 — 자리를 밀지 않는다", () => {
    expect(css).toMatch(/\.tx-nav-bar__panel\s*\{[^}]*position:\s*absolute/);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxNavBar/TxNavBar.css" layer(tx);');
  });
});
