import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxDivider } from "./TxDivider";

/**
 * 4차에서 "`<hr>` 에 토큰이면 끝" 이라며 잘랐다가, **`orientation` 과 라벨은 `<hr>` 이
 * 못 한다**는 이유로 되살린 것이다. 그래서 보는 것도 그 둘이다.
 */

afterEach(cleanup);

const rootOf = (container: HTMLElement) => container.querySelector('[data-tag="TxDivider"]') as HTMLElement;

describe("TxDivider — 민 선", () => {
  /** 브라우저가 이미 "가르는 것" 으로 읽는다. role 을 손으로 달 이유가 없다. */
  it("글자가 없으면 hr 이다", () => {
    const { container } = render(<TxDivider />);

    expect(rootOf(container).tagName).toBe("HR");
    expect(screen.getByRole("separator")).toBeTruthy();
  });

  it("기본은 가로다", () => {
    const { container } = render(<TxDivider />);
    expect(rootOf(container).dataset.orientation).toBe("horizontal");
  });

  it("세로를 그대로 싣는다", () => {
    const { container } = render(<TxDivider orientation="vertical" />);
    expect(rootOf(container).dataset.orientation).toBe("vertical");
  });

  /** 가로는 `<hr>` 의 기본값이라 적지 않는다. 세로만 알린다. */
  it("세로일 때만 aria-orientation 을 단다", () => {
    const { container: h } = render(<TxDivider />);
    const { container: v } = render(<TxDivider orientation="vertical" />);

    expect(rootOf(h).hasAttribute("aria-orientation")).toBe(false);
    expect(rootOf(v).getAttribute("aria-orientation")).toBe("vertical");
  });

  it("data-tag 를 단다", () => {
    const { container } = render(<TxDivider />);
    expect(rootOf(container).dataset.tag).toBe("TxDivider");
  });
});

describe("TxDivider — 글자가 든 선", () => {
  /** `<hr>` 은 void 요소라 자식을 담지 못한다. */
  it("글자를 주면 hr 이 아니다", () => {
    const { container } = render(<TxDivider>또는</TxDivider>);

    expect(rootOf(container).tagName).not.toBe("HR");
    expect(screen.getByText("또는")).toBeTruthy();
  });

  it("글자가 든 것을 표시로 남긴다", () => {
    const { container } = render(<TxDivider>또는</TxDivider>);
    expect(rootOf(container).hasAttribute("data-labeled")).toBe(true);
  });

  it("민 선에는 그 표시가 없다", () => {
    const { container } = render(<TxDivider />);
    expect(rootOf(container).hasAttribute("data-labeled")).toBe(false);
  });

  it("세로에도 글자를 넣을 수 있다", () => {
    const { container } = render(<TxDivider orientation="vertical">또는</TxDivider>);

    expect(rootOf(container).dataset.orientation).toBe("vertical");
    expect(screen.getByText("또는")).toBeTruthy();
  });

  /**
   * 글자가 든 선에서 **읽혀야 하는 것은 글자**다. `role="separator"` 는 자식을 장식으로
   * 보게 만드는 역할이라, 그것을 달면 글자가 안 읽힌다.
   */
  it("글자가 들면 separator 로 읽지 않는다", () => {
    render(<TxDivider>또는</TxDivider>);

    expect(screen.queryByRole("separator")).toBeNull();
    expect(screen.getByText("또는")).toBeTruthy();
  });
});

describe("TxDivider — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxDivider className="mine" />);
    const root = rootOf(container);

    expect(root.classList.contains("tx-divider")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });

  it.each([
    ["민 선", undefined],
    ["글자가 든 선", "또는"]
  ])("%s 도 나머지 props 를 그대로 넘긴다", (_name, children) => {
    const { container } = render(
      <TxDivider id="d1" data-testid="d">
        {children}
      </TxDivider>
    );

    const root = rootOf(container);
    expect(root.id).toBe("d1");
    expect(root.dataset.testid).toBe("d");
  });
});

describe("TxDivider — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxDivider.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxDivider/TxDivider.css" layer(tx);');
  });

  /** 선은 장식이라 읽히면 안 된다. 가상요소가 그 일을 한다. */
  it("글자 옆 선을 가상요소로 그린다", () => {
    expect(css).toMatch(/\.tx-divider\[data-labeled\]::before,\s*\.tx-divider\[data-labeled\]::after/);
  });

  /** 테두리로 두면 두께 값이 `border-width` 와 `height` 두 곳으로 갈린다. */
  it("두께를 한 곳에서 정한다", () => {
    const rule = css.match(/hr\.tx-divider\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toMatch(/border:\s*0/);
    expect(css).toMatch(/--tx-divider-thickness:/);
  });

  /** 늘릴 기준이 없는 자리에서 높이 0 이 되면 아무것도 안 보인다. */
  it("세로 선이 높이 0 으로 사라지지 않는다", () => {
    const rule = css.match(/hr\.tx-divider\[data-orientation="vertical"\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toMatch(/align-self:\s*stretch/);
    expect(rule).toMatch(/min-block-size:/);
  });
});
