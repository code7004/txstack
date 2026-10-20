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

/**
 * 숨기는 것은 CSS 다(`data-toggle`). jsdom 에는 스타일이 없어 보이고 안 보이고는
 * CSS 계약으로 보고, 여기서는 **숨겨도 버튼이 그대로 남아 키보드로 열리는지**를 본다.
 */
describe("TxNavBar — ▾ 를 언제 보일지 (toggle)", () => {
  const linked = (props: Partial<Parameters<typeof TxNavBar>[0]>) => (
    <TxNavBar {...props}>
      <TxNavBar.Item label="문서" as="a" href="/docs" panel={<a href="/docs/start">시작하기</a>} />
    </TxNavBar>
  );

  it('기본은 "always" 다', () => {
    render(linked({}));
    expect(root().dataset.toggle).toBe("always");
  });

  it('"focus" 를 data 속성으로 알린다', () => {
    render(linked({ toggle: "focus" }));
    expect(root().dataset.toggle).toBe("focus");
  });

  it('"focus" 여도 버튼은 남는다 — 키보드로 열린다', () => {
    render(linked({ toggle: "focus" }));

    const toggle = screen.getByRole("button", { name: "문서 하위 메뉴" });
    toggle.focus();
    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "시작하기" })).not.toBeNull();
  });

  it('openOn="click" 이면 "focus" 를 줘도 늘 보인다 — 마우스에게도 유일한 길이다', () => {
    render(linked({ toggle: "focus", openOn: "click" }));
    expect(root().dataset.toggle).toBe("always");
  });
});

/**
 * 줄 맨 오른쪽의 전체 메뉴 칸. 위치 · 폭은 CSS 라 계약으로 보고, 여기서는
 * **누를 때만 열리고 키보드로도 열리며 줄의 규칙을 그대로 타는지**를 본다.
 */
describe("TxNavBar.SiteMap — 전체 메뉴 칸", () => {
  const withMap = (props: Partial<Parameters<typeof TxNavBar>[0]> = {}, map: Partial<Parameters<typeof TxNavBar.SiteMap>[0]> = {}) => (
    <TxNavBar panelWidth="item" {...props}>
      <TxNavBar.Item label="문서" as="a" href="/docs" panel={<a href="/docs/start">시작하기</a>} />
      <TxNavBar.SiteMap {...map}>
        <a href="/docs/start">전체 · 시작하기</a>
        <a href="/api">전체 · API</a>
      </TxNavBar.SiteMap>
    </TxNavBar>
  );
  const mapButton = () => screen.getByRole("button", { name: "전체 메뉴" });

  it("아이콘만 보이는 버튼이고 이름은 label 이다 — 기본 🗺️ · 전체 메뉴", () => {
    render(withMap());

    expect(mapButton().textContent).toBe("🗺️");
    expect(mapButton().querySelector("[aria-hidden]")).not.toBeNull();
  });

  it("아이콘과 이름을 바꾼다", () => {
    render(withMap({}, { icon: <svg data-testid="grid" />, label: "All menus" }));

    const button = screen.getByRole("button", { name: "All menus" });
    expect(button.querySelector('[data-testid="grid"]')).not.toBeNull();
  });

  it("누르면 열리고 다시 누르면 닫힌다", () => {
    render(withMap());

    fireEvent.click(mapButton());
    expect(mapButton().getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "전체 · API" })).not.toBeNull();

    fireEvent.click(mapButton());
    expect(mapButton().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: "전체 · API" })).toBeNull();
  });

  it('얹어도 열리지 않는다 — 줄이 openOn="hover" 여도', () => {
    render(withMap());

    fireEvent.pointerEnter(mapButton().closest("li")!, { pointerType: "mouse" });
    fireEvent.pointerOver(mapButton(), { pointerType: "mouse" });
    expect(mapButton().getAttribute("aria-expanded")).toBe("false");
  });

  it("줄이 함께 쓰는 패널이 있어도 이 칸에 얹으면 그것을 열지 않는다", () => {
    render(
      <TxNavBar panel={<p>줄의 패널</p>}>
        <TxNavBar.Item label="문서" href="/docs" />
        <TxNavBar.SiteMap>
          <a href="/api">API</a>
        </TxNavBar.SiteMap>
      </TxNavBar>
    );

    fireEvent.pointerOver(mapButton(), { pointerType: "mouse" });
    expect(panels()).toHaveLength(0);
  });

  it("열림은 하나뿐이다 — 다른 항목을 열면 지도가 닫힌다", () => {
    render(withMap());

    fireEvent.click(mapButton());
    fireEvent.click(screen.getByRole("button", { name: "문서 하위 메뉴" }));

    expect(mapButton().getAttribute("aria-expanded")).toBe("false");
    expect(panels()).toHaveLength(1);
  });

  it("Escape 로 닫고 포커스를 칸으로 되돌린다", () => {
    render(withMap());

    fireEvent.click(mapButton());
    fireEvent.keyDown(screen.getByRole("link", { name: "전체 · API" }), { key: "Escape" });

    expect(panels()).toHaveLength(0);
    expect(document.activeElement).toBe(mapButton());
  });

  it("안의 링크를 누르면 닫힌다", () => {
    render(withMap());

    fireEvent.click(mapButton());
    fireEvent.click(screen.getByRole("link", { name: "전체 · API" }), { button: 0 });

    expect(panels()).toHaveLength(0);
  });

  it("화살표로 옮겨 다니는 칸에 든다", () => {
    render(withMap());

    const toggle = screen.getByRole("button", { name: "문서 하위 메뉴" });
    toggle.focus();
    fireEvent.keyDown(toggle, { key: "ArrowRight" });

    expect(document.activeElement).toBe(mapButton());
  });

  it("열리면 aria-controls 가 패널을 가리키고, 패널은 data-site-map 을 갖는다", () => {
    render(withMap());

    fireEvent.click(mapButton());
    const panel = document.getElementById(mapButton().getAttribute("aria-controls")!);

    expect(panel?.classList.contains("tx-nav-bar__panel")).toBe(true);
    expect(panel?.hasAttribute("data-site-map")).toBe(true);
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

/**
 * **줄의 패널 하나를 모든 항목이 함께 쓴다.** 어느 항목에 얹어도 사이트 메뉴 전체가 펼쳐지는
 * 모양이다. 마우스 전용 지름길이라 항목은 그대로 링크다.
 */
describe("TxNavBar — 줄이 함께 쓰는 패널", () => {
  /** 라우터가 하는 일 — 문서를 바꾸지 않는다. jsdom 은 이동을 못 해서 그대로 두면 경고를 낸다 */
  const stay = (evt: { preventDefault: () => void }) => evt.preventDefault();

  const shared = (
    <>
      <TxNavBar.Item label="Documents" href="/docs" onClick={stay} />
      <TxNavBar.Item label="API" href="/api" onClick={stay} />
    </>
  );
  const sitemap = (
    <div>
      <a href="/docs/start" onClick={stay}>
        Getting Started
      </a>
      <a href="/api/ui" onClick={stay}>
        ui
      </a>
    </div>
  );

  const item = (name: string) => screen.getByRole("link", { name }).closest("li")!;
  const over = (el: Element, pointerType = "mouse") => fireEvent.pointerOver(el, { pointerType });

  it("항목은 그냥 링크다 — 여는 버튼이 없다", () => {
    render(<TxNavBar panel={sitemap}>{shared}</TxNavBar>);

    expect(screen.getByRole("link", { name: "Documents" }).getAttribute("href")).toBe("/docs");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(panels()).toHaveLength(0);
  });

  it("어느 항목에 얹어도 같은 패널 하나가 열린다", () => {
    render(<TxNavBar panel={sitemap}>{shared}</TxNavBar>);

    over(item("Documents"));
    expect(panels()).toHaveLength(1);
    expect(screen.getByRole("link", { name: "ui" })).toBeTruthy();

    over(item("API"));
    expect(panels()).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Getting Started" })).toBeTruthy();
  });

  /** 머리 줄을 가로지르기만 해도 패널이 덮이면 성가시다. */
  it("항목 밖의 빈자리에서는 열지 않는다", () => {
    render(<TxNavBar panel={sitemap}>{shared}</TxNavBar>);

    over(root().querySelector("ul")!);
    expect(panels()).toHaveLength(0);
  });

  /** 여는 버튼이 없으니 손가락으로는 열 수 없다. 누르면 제목의 화면으로 간다. */
  it("마우스로만 열린다", () => {
    render(<TxNavBar panel={sitemap}>{shared}</TxNavBar>);

    over(item("Documents"), "touch");
    expect(panels()).toHaveLength(0);
  });

  it('openOn="click" 이면 열리지 않는다', () => {
    render(
      <TxNavBar panel={sitemap} openOn="click">
        {shared}
      </TxNavBar>
    );

    over(item("Documents"));
    expect(panels()).toHaveLength(0);
  });

  it("줄 밖으로 나가면 잠시 뒤 닫힌다", () => {
    render(<TxNavBar panel={sitemap}>{shared}</TxNavBar>);

    over(item("Documents"));
    fireEvent.pointerLeave(root(), { pointerType: "mouse" });
    expect(panels()).toHaveLength(1);

    act(() => vi.advanceTimersByTime(200));
    expect(panels()).toHaveLength(0);
  });

  it("Escape 로 닫힌다", () => {
    render(<TxNavBar panel={sitemap}>{shared}</TxNavBar>);

    over(item("Documents"));
    fireEvent.keyDown(screen.getByRole("link", { name: "ui" }), { key: "Escape" });
    expect(panels()).toHaveLength(0);
  });

  /** SPA 에서는 링크가 문서를 바꾸지 않는다. 닫지 않으면 새 화면을 패널이 덮은 채 남는다. */
  it("패널 안의 링크를 누르면 닫힌다", () => {
    render(<TxNavBar panel={sitemap}>{shared}</TxNavBar>);

    over(item("Documents"));
    fireEvent.click(screen.getByRole("link", { name: "ui" }));
    expect(panels()).toHaveLength(0);
  });

  it("보조키를 누른 클릭은 열린 채로 둔다 — 새 탭으로 여러 개를 열 수 있다", () => {
    render(<TxNavBar panel={sitemap}>{shared}</TxNavBar>);

    over(item("Documents"));
    fireEvent.click(screen.getByRole("link", { name: "ui" }), { metaKey: true });
    expect(panels()).toHaveLength(1);
  });

  it("처음 얹은 항목의 이름을 알린다 — 그 안에서 옮겨 다니는 동안은 다시 오지 않는다", () => {
    const onOpenChange = vi.fn();
    render(
      <TxNavBar panel={sitemap} onOpenChange={onOpenChange}>
        {shared}
      </TxNavBar>
    );

    over(item("Documents"));
    over(item("API"));
    fireEvent.keyDown(screen.getByRole("link", { name: "ui" }), { key: "Escape" });

    expect(onOpenChange.mock.calls).toEqual([["Documents"], [null]]);
  });

  /** 조용히 버리지 않는다. 자기 패널을 가진 항목은 자기 것을 연다. */
  it("자기 panel 을 가진 항목은 자기 패널을 연다", () => {
    render(
      <TxNavBar panel={sitemap}>
        {shared}
        <TxNavBar.Item label="제품" panel={<a href="/crm">CRM</a>} />
      </TxNavBar>
    );

    fireEvent.pointerEnter(trigger("제품").parentElement!, { pointerType: "mouse" });
    over(trigger("제품"));

    expect(panels()).toHaveLength(1);
    expect(screen.getByRole("link", { name: "CRM" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "ui" })).toBeNull();
  });
});

/** 항목의 패널에도 같은 규칙이 걸린다 — 패널 안의 링크로 이동하면 패널이 닫힌다. */
describe("TxNavBar — 항목 패널의 링크", () => {
  it("패널 안의 링크를 누르면 닫힌다", () => {
    render(
      <TxNavBar>
        <TxNavBar.Item
          label="제품"
          panel={
            <a href="/crm" onClick={(evt) => evt.preventDefault()}>
              CRM
            </a>
          }
        />
      </TxNavBar>
    );

    fireEvent.click(trigger("제품"));
    fireEvent.click(screen.getByRole("link", { name: "CRM" }));

    expect(panels()).toHaveLength(0);
    expect(trigger("제품").getAttribute("aria-expanded")).toBe("false");
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

  it("줄이 함께 쓰는 패널은 panelWidth 와 상관없이 줄 폭이다", () => {
    expect(css).toMatch(/__panel:is\(\[data-shared\], \[data-site-map\]\)\s*\{[^}]*inset-inline:\s*0[^}]*max-inline-size:\s*none/);
  });

  it("패널은 떠오른다 — 자리를 밀지 않는다", () => {
    expect(css).toMatch(/\.tx-nav-bar__panel\s*\{[^}]*position:\s*absolute/);
  });

  it("전체 메뉴 칸은 맨 오른쪽에 서고, panelWidth 와 상관없이 줄 폭으로 열린다", () => {
    expect(css).toMatch(/\.tx-nav-bar__list:has\(> \.tx-nav-bar__item\[data-site-map\]\)\s*\{[^}]*flex:\s*1/);
    expect(css).toMatch(/\.tx-nav-bar__item\[data-site-map\]\s*\{[^}]*margin-inline-start:\s*auto/);
    // 항목이 기준을 쥐는 규칙(position: relative)보다 무겁게 내려놓는다
    expect(css).toMatch(/\.tx-nav-bar\[data-panel-width\] \.tx-nav-bar__item\[data-site-map\]\s*\{[^}]*position:\s*static/);
  });

  /** `display: none` 이면 Tab 이 닿지 않아 키보드로 열 길이 사라진다. 잘라서 숨긴다. */
  it('toggle="focus" 는 포커스가 없을 때만 잘라 숨긴다 — display: none 이 아니다', () => {
    const rule = css.match(/\[data-toggle="focus"\]\s*\.tx-nav-bar__toggle:not\(:focus-visible\)\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toMatch(/clip-path:\s*inset\(50%\)/);
    expect(rule).toMatch(/position:\s*absolute/);
    expect(rule).not.toMatch(/display:\s*none/);
    expect(css).not.toMatch(/\[data-toggle="focus"\][^{]*\{[^}]*display:\s*none/);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxNavBar/TxNavBar.css" layer(tx);');
  });
});
