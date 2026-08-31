import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxGrid } from "./TxGrid";

/**
 * `TxFlex` 는 한 줄로 늘어놓는 자리고, 이쪽은 **칸이 맞아떨어져야 할 때**다.
 *
 * 가장 조심한 것은 **미디어 쿼리를 쓰지 않는 것**이다 — 화면이 아니라 놓인 자리의 폭에
 * 반응해야 사이드바 안에서도 맞는다. 그래서 칸 수 계산이 전부 CSS 에 있고,
 * 여기서는 그 값이 제대로 실려 나가는지를 본다.
 */

afterEach(cleanup);

const rootOf = (container: HTMLElement) => container.querySelector('[data-tag="TxGrid"]') as HTMLElement;

describe("TxGrid — 칸", () => {
  it("기본은 두 칸이다", () => {
    const { container } = render(<TxGrid />);
    expect(rootOf(container).style.getPropertyValue("--tx-grid-columns")).toBe("2");
  });

  it("칸 수를 그대로 싣는다", () => {
    const { container } = render(<TxGrid columns={3} />);
    expect(rootOf(container).style.getPropertyValue("--tx-grid-columns")).toBe("3");
  });

  it("gap 을 그대로 놓는다", () => {
    const { container } = render(<TxGrid gap="2rem" />);
    expect(rootOf(container).style.gap).toBe("2rem");
  });

  it("자식을 그대로 담는다", () => {
    const { container } = render(
      <TxGrid>
        <span>하나</span>
        <span>둘</span>
      </TxGrid>
    );

    expect(container.querySelectorAll("span")).toHaveLength(2);
  });

  it("data-tag 를 단다", () => {
    const { container } = render(<TxGrid />);
    expect(rootOf(container).dataset.tag).toBe("TxGrid");
  });
});

describe("TxGrid.Item — 여러 칸", () => {
  it("한 줄을 통째로 쓴다", () => {
    const { container } = render(
      <TxGrid>
        <TxGrid.Item span="full">넓은 것</TxGrid.Item>
      </TxGrid>
    );

    expect((container.querySelector('[data-tag="TxGrid.Item"]') as HTMLElement).style.gridColumn).toBe("1 / -1");
  });

  /**
   * 접혀서 칸이 줄었을 때 `span 2` 가 남아 있으면 넘쳐서 가로 스크롤이 생긴다.
   * `min()` 이 칸 수를 넘지 못하게 막는다.
   */
  it("칸 수를 넘지 못하게 가둔다", () => {
    const { container } = render(
      <TxGrid columns={2}>
        <TxGrid.Item span={2}>둘</TxGrid.Item>
      </TxGrid>
    );

    expect((container.querySelector('[data-tag="TxGrid.Item"]') as HTMLElement).style.gridColumn).toBe("span min(2, var(--tx-grid-columns))");
  });

  it("기본은 한 칸이다", () => {
    const { container } = render(
      <TxGrid>
        <TxGrid.Item>하나</TxGrid.Item>
      </TxGrid>
    );

    expect((container.querySelector('[data-tag="TxGrid.Item"]') as HTMLElement).style.gridColumn).toBe("span min(1, var(--tx-grid-columns))");
  });

  it("style 로 덮을 수 있다", () => {
    const { container } = render(
      <TxGrid>
        <TxGrid.Item span="full" style={{ gridColumn: "2 / 3" }}>
          손으로
        </TxGrid.Item>
      </TxGrid>
    );

    expect((container.querySelector('[data-tag="TxGrid.Item"]') as HTMLElement).style.gridColumn).toBe("2 / 3");
  });
});

describe("TxGrid — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxGrid className="mine" />);
    const root = rootOf(container);

    expect(root.classList.contains("tx-grid")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });

  it("style 이 칸 수를 덮지 않는다", () => {
    const { container } = render(<TxGrid columns={3} style={{ padding: "1rem" }} />);
    const root = rootOf(container);

    expect(root.style.getPropertyValue("--tx-grid-columns")).toBe("3");
    expect(root.style.padding).toBe("1rem");
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(<TxGrid id="g1" data-testid="g" />);
    const root = rootOf(container);

    expect(root.id).toBe("g1");
    expect(root.dataset.testid).toBe("g");
  });
});

describe("TxGrid — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxGrid.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxGrid/TxGrid.css" layer(tx);');
  });

  /**
   * 화면 크기가 아니라 **놓인 자리의 폭**에 반응해야 사이드바 안에서도 맞는다.
   * 미디어 쿼리를 쓰면 그 자리가 좁아도 화면만 넓으면 여러 칸으로 벌어진다.
   */
  it("미디어 쿼리를 쓰지 않는다", () => {
    expect(css).not.toContain("@media");
    expect(css).toContain("auto-fit");
  });

  /** 최소 폭이 자리보다 크면 넘쳐서 가로 스크롤이 생긴다. */
  it("최소 폭이 자리를 넘지 못하게 가둔다", () => {
    expect(css).toMatch(/minmax\(min\(var\(--tx-grid-min\), 100%\)/);
  });
});
