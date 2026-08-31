import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxEmptyState } from "./TxEmptyState";
import type { TxEmptyStateVariant } from "./TxEmptyState.types";

/**
 * **넷을 가르는 것이 이 컴포넌트의 요지다.** "없음" 이라고만 하면 사용자가 다음에 무엇을
 * 할지 알 수 없다 — 아직 안 만든 것 · 찾았는데 없는 것 · 실패한 것 · 권한이 없는 것은
 * 각각 다른 행동으로 이어진다.
 */

afterEach(cleanup);

const VARIANTS: TxEmptyStateVariant[] = ["no-data", "no-result", "error", "no-permission"];
const rootOf = (container: HTMLElement) => container.querySelector('[data-tag="TxEmptyState"]') as HTMLElement;

describe("TxEmptyState — 갈래", () => {
  it("기본은 no-data 다", () => {
    const { container } = render(<TxEmptyState />);
    expect(rootOf(container).dataset.variant).toBe("no-data");
  });

  it.each(VARIANTS)("variant=%s 를 그대로 싣는다", (variant) => {
    const { container } = render(<TxEmptyState variant={variant} />);
    expect(rootOf(container).dataset.variant).toBe(variant);
  });

  /** 넷이 같은 말을 하면 가르는 뜻이 없다. */
  it("갈래마다 문구가 다르다", () => {
    const titles = VARIANTS.map((variant) => {
      const { container } = render(<TxEmptyState variant={variant} />);
      const text = container.querySelector(".tx-empty-state__title")?.textContent ?? "";
      cleanup();
      return text;
    });

    expect(new Set(titles).size).toBe(VARIANTS.length);
    expect(titles.every((title) => title.length > 0)).toBe(true);
  });

  it("갈래마다 그림도 다르다", () => {
    const icons = VARIANTS.map((variant) => {
      const { container } = render(<TxEmptyState variant={variant} />);
      const html = container.querySelector(".tx-empty-state__icon")?.innerHTML ?? "";
      cleanup();
      return html;
    });

    expect(new Set(icons).size).toBe(VARIANTS.length);
  });
});

describe("TxEmptyState — 문구", () => {
  it("기본 문구가 나온다", () => {
    render(<TxEmptyState variant="no-result" />);

    expect(screen.getByText("찾는 것이 없습니다")).toBeTruthy();
    expect(screen.getByText("검색어나 조건을 바꿔 보세요.")).toBeTruthy();
  });

  it("제목을 덮을 수 있다", () => {
    render(<TxEmptyState title="주문이 없습니다" />);

    expect(screen.getByText("주문이 없습니다")).toBeTruthy();
    expect(screen.queryByText("아직 아무것도 없습니다")).toBeNull();
  });

  it("설명을 덮을 수 있다", () => {
    render(<TxEmptyState description="첫 주문을 넣어 보세요." />);
    expect(screen.getByText("첫 주문을 넣어 보세요.")).toBeTruthy();
  });

  /**
   * **안 준 것과 일부러 비운 것을 가른다.** `??` 로는 `null` 에도 기본 문구가 돌아와서
   * "여기는 설명이 필요 없다" 고 말할 길이 없다.
   */
  it("설명을 null 로 주면 줄 자체가 없다", () => {
    const { container } = render(<TxEmptyState description={null} />);
    expect(container.querySelector(".tx-empty-state__description")).toBeNull();
  });

  it("제목도 null 로 비울 수 있다", () => {
    const { container } = render(<TxEmptyState title={null} />);
    expect(container.querySelector(".tx-empty-state__title")).toBeNull();
  });

  it("빈 문자열은 비운 것이 아니다 — 그대로 그린다", () => {
    const { container } = render(<TxEmptyState title="" />);

    const node = container.querySelector(".tx-empty-state__title");
    expect(node).toBeTruthy();
    expect(node?.textContent).toBe("");
  });

  it("요소도 받는다", () => {
    render(<TxEmptyState description={<span>다시 시도하거나 관리자에게 문의</span>} />);
    expect(screen.getByText("다시 시도하거나 관리자에게 문의")).toBeTruthy();
  });
});

describe("TxEmptyState — 그림과 행동", () => {
  it("그림을 끌 수 있다", () => {
    const { container } = render(<TxEmptyState icon={false} />);
    expect(container.querySelector(".tx-empty-state__icon")).toBeNull();
  });

  it("그림을 갈아끼울 수 있다", () => {
    render(<TxEmptyState icon={<span>📭</span>} />);
    expect(screen.getByText("📭")).toBeTruthy();
  });

  /** 기본 그림은 장식이다. 뜻은 문구가 나른다. */
  it("기본 그림은 읽히지 않는다", () => {
    const { container } = render(<TxEmptyState />);
    expect(container.querySelector(".tx-empty-state__icon svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("아래에 버튼 줄을 담는다", () => {
    render(
      <TxEmptyState variant="no-result">
        <button type="button">조건 지우기</button>
      </TxEmptyState>
    );

    expect(screen.getByRole("button", { name: "조건 지우기" })).toBeTruthy();
  });

  it("버튼이 없으면 그 줄도 없다", () => {
    const { container } = render(<TxEmptyState />);
    expect(container.querySelector(".tx-empty-state__actions")).toBeNull();
  });
});

describe("TxEmptyState — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxEmptyState className="mine" />);
    const root = rootOf(container);

    expect(root.classList.contains("tx-empty-state")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(<TxEmptyState id="e1" data-testid="e" />);
    const root = rootOf(container);

    expect(root.id).toBe("e1");
    expect(root.dataset.testid).toBe("e");
  });
});

describe("TxEmptyState — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxEmptyState.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxEmptyState/TxEmptyState.css" layer(tx);');
  });

  /**
   * 빈 화면은 조용해야 한다. 바탕이나 테두리를 칠하면 **없는 문제를 있는 것처럼** 보인다 —
   * 눈에 띄어야 하는 것은 `TxAlert` 쪽이다.
   */
  it("바탕도 테두리도 칠하지 않는다", () => {
    const rule = css.match(/\.tx-empty-state\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).not.toMatch(/background-color:/);
    expect(rule).not.toMatch(/(?:^|\s)border:/);
  });

  /** 나머지 셋은 잘못이 아니라 상태다. 붉히면 없는 문제를 만든다. */
  it("실패한 것만 갈래색을 쓴다", () => {
    expect(css).toMatch(/\.tx-empty-state\[data-variant="error"\]\s*\{[^}]*--tx-empty-state-accent:\s*var\(--tx-color-danger\)/);

    for (const variant of ["no-data", "no-result", "no-permission"]) {
      expect(css, variant).not.toContain(`[data-variant="${variant}"]`);
    }
  });
});
