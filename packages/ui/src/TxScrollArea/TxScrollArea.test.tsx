import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxScrollArea } from "./TxScrollArea";

/**
 * **흐림은 더 볼 것이 있는 쪽에만 생긴다.** 양쪽을 늘 흐리게 두면 끝에 닿았는지 알 수 없다.
 *
 * jsdom 에는 실제 배치가 없어 `scrollHeight` 가 늘 0 이다. 그래서 그 값들을 심어
 * **"어디까지 왔는지를 제대로 읽는가"** 를 본다 — 흐림 자체는 CSS 가 그린다.
 */

beforeEach(() => {
  // jsdom 30 에는 ResizeObserver 가 없다
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const rootOf = (container: HTMLElement) => container.querySelector('[data-tag="TxScrollArea"]') as HTMLElement;

/** 배치를 심는다. jsdom 은 재지 않으므로 우리가 준 값이 곧 화면이다. */
const layout = (el: HTMLElement, { scroll, total, visible }: { scroll: number; total: number; visible: number }) => {
  Object.defineProperty(el, "scrollTop", { configurable: true, writable: true, value: scroll });
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: total });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: visible });
};

describe("TxScrollArea — 어디까지 왔나", () => {
  it("넘치지 않으면 양쪽 다 끝이다 — 흐릴 것이 없다", () => {
    const { container } = render(<TxScrollArea>내용</TxScrollArea>);
    const el = rootOf(container);

    expect(el.hasAttribute("data-at-start")).toBe(true);
    expect(el.hasAttribute("data-at-end")).toBe(true);
  });

  it("맨 위에서는 아래만 흐리다", async () => {
    const { container, rerender } = render(<TxScrollArea>내용</TxScrollArea>);
    const el = rootOf(container);

    layout(el, { scroll: 0, total: 500, visible: 100 });
    await act(async () => rerender(<TxScrollArea>내용 </TxScrollArea>));

    expect(el.hasAttribute("data-at-start")).toBe(true);
    expect(el.hasAttribute("data-at-end")).toBe(false);
  });

  it("가운데서는 양쪽 다 흐리다", async () => {
    const { container } = render(<TxScrollArea>내용</TxScrollArea>);
    const el = rootOf(container);

    layout(el, { scroll: 200, total: 500, visible: 100 });
    await act(async () => void fireEvent.scroll(el));

    expect(el.hasAttribute("data-at-start")).toBe(false);
    expect(el.hasAttribute("data-at-end")).toBe(false);
  });

  it("맨 아래에서는 위만 흐리다", async () => {
    const { container } = render(<TxScrollArea>내용</TxScrollArea>);
    const el = rootOf(container);

    layout(el, { scroll: 400, total: 500, visible: 100 });
    await act(async () => void fireEvent.scroll(el));

    expect(el.hasAttribute("data-at-start")).toBe(false);
    expect(el.hasAttribute("data-at-end")).toBe(true);
  });

  /** 소수점 스크롤 때문에 정확히 끝에 닿지 않는다. */
  it("1px 어긋난 것은 끝으로 본다", async () => {
    const { container } = render(<TxScrollArea>내용</TxScrollArea>);
    const el = rootOf(container);

    layout(el, { scroll: 399.5, total: 500, visible: 100 });
    await act(async () => void fireEvent.scroll(el));

    expect(el.hasAttribute("data-at-end")).toBe(true);
  });
});

describe("TxScrollArea — 겉과 접근성", () => {
  it("기본은 세로다", () => {
    const { container } = render(<TxScrollArea>내용</TxScrollArea>);
    expect(rootOf(container).dataset.orientation).toBe("vertical");
  });

  it("가로를 그대로 싣는다", () => {
    const { container } = render(<TxScrollArea orientation="horizontal">내용</TxScrollArea>);
    expect(rootOf(container).dataset.orientation).toBe("horizontal");
  });

  it("크기를 변수로 넘긴다", () => {
    const { container } = render(<TxScrollArea size="12rem">내용</TxScrollArea>);
    expect(rootOf(container).style.getPropertyValue("--tx-scroll-area-size")).toBe("12rem");
  });

  /** 마우스 없이는 안쪽에 닿을 길이 없는 자리가 나온다. */
  it("기본으로 키보드가 닿는다", () => {
    render(<TxScrollArea label="약관">내용</TxScrollArea>);

    const el = screen.getByRole("group", { name: "약관" });
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  /** 안에 이미 버튼·링크가 있으면 그것들로 닿는다. */
  it("끌 수 있다", () => {
    const { container } = render(<TxScrollArea focusable={false}>내용</TxScrollArea>);
    const el = rootOf(container);

    expect(el.hasAttribute("tabindex")).toBe(false);
    expect(el.hasAttribute("role")).toBe(false);
  });

  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxScrollArea className="mine">내용</TxScrollArea>);
    const el = rootOf(container);

    expect(el.classList.contains("tx-scroll-area")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);
  });
});

describe("TxScrollArea — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxScrollArea.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxScrollArea/TxScrollArea.css" layer(tx);');
  });

  /**
   * 가짜 스크롤바를 그리면 휠 관성 · 터치 · 접근성 설정을 전부 다시 만들어야 하고,
   * 어느 하나는 어긋난다.
   */
  it("스크롤바를 CSS 로만 다듬는다", () => {
    expect(css).toMatch(/scrollbar-color:/);
    expect(css).toMatch(/scrollbar-width:/);
    expect(css).not.toContain("::-webkit-scrollbar");
  });

  /** 그림자로 하면 뒤에 무슨 색이 있는지 알아야 한다. 흐림은 그것을 묻지 않는다. */
  it("흐림을 mask 로 그린다", () => {
    expect(css).toMatch(/mask-image:\s*linear-gradient/);
    expect(css).not.toMatch(/box-shadow:/);
  });

  /** 끝에 닿았는지가 이것으로 보인다. */
  it("끝에 닿으면 그쪽 흐림이 사라진다", () => {
    for (const orientation of ["vertical", "horizontal"]) {
      expect(css, orientation).toMatch(new RegExp(`\\[data-orientation="${orientation}"\\]\\[data-at-start\\]`));
      expect(css, orientation).toMatch(new RegExp(`\\[data-orientation="${orientation}"\\]\\[data-at-end\\]`));
      expect(css, orientation).toMatch(new RegExp(`\\[data-orientation="${orientation}"\\]\\[data-at-start\\]\\[data-at-end\\]\\s*\\{[^}]*mask-image:\\s*none`));
    }
  });
});
