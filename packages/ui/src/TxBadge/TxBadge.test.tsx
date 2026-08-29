import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxBadge } from "./TxBadge";

/**
 * 신규다. **갈래 어휘를 `TxAlert` · `TxToast` 와 나눠 쓴다** — 여기서 어긋나면
 * 소비자는 컴포넌트마다 다른 낱말을 외워야 한다.
 */

afterEach(cleanup);

const badgeOf = (container: HTMLElement) => container.querySelector('[data-tag="TxBadge"]') as HTMLElement;

describe("TxBadge — 그리기", () => {
  it("내용을 그린다", () => {
    render(<TxBadge>완료</TxBadge>);
    expect(screen.getByText("완료")).toBeTruthy();
  });

  it("span 이다 — 문장 안에 그대로 놓인다", () => {
    const { container } = render(<TxBadge>완료</TxBadge>);
    expect(badgeOf(container).tagName).toBe("SPAN");
  });

  /** 지우거나 고를 수 있는 이름표는 다른 물건이다. 뱃지는 읽는 것만 한다. */
  it("누르는 것이 아니다", () => {
    render(<TxBadge>완료</TxBadge>);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("완료").hasAttribute("tabindex")).toBe(false);
  });

  it("data-tag 를 단다", () => {
    const { container } = render(<TxBadge>완료</TxBadge>);
    expect(badgeOf(container).dataset.tag).toBe("TxBadge");
  });
});

describe("TxBadge — 갈래", () => {
  /** 색이 뜻을 갖지 않는 라벨이 뱃지에는 흔하다. */
  it("기본은 neutral 이다", () => {
    const { container } = render(<TxBadge>초안</TxBadge>);
    expect(badgeOf(container).dataset.variant).toBe("neutral");
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)("variant=%s 를 그대로 싣는다 — 색은 CSS 가 정한다", (variant) => {
    const { container } = render(<TxBadge variant={variant}>라벨</TxBadge>);
    expect(badgeOf(container).dataset.variant).toBe(variant);
  });
});

describe("TxBadge — 칠하는 방식", () => {
  it("기본은 soft 다", () => {
    const { container } = render(<TxBadge>라벨</TxBadge>);
    expect(badgeOf(container).dataset.appearance).toBe("soft");
  });

  it("outline 을 그대로 싣는다", () => {
    const { container } = render(<TxBadge appearance="outline">라벨</TxBadge>);
    expect(badgeOf(container).dataset.appearance).toBe("outline");
  });
});

describe("TxBadge — 점", () => {
  it("기본은 점이 없다", () => {
    const { container } = render(<TxBadge>라벨</TxBadge>);
    expect(container.querySelector(".tx-badge__dot")).toBeNull();
  });

  it("dot 을 주면 점이 붙는다", () => {
    const { container } = render(<TxBadge dot>대기</TxBadge>);
    expect(container.querySelector(".tx-badge__dot")).toBeTruthy();
  });

  /** 점은 갈래를 거드는 표시다. 뜻은 글자가 나른다. */
  it("점은 스크린리더에 읽히지 않는다", () => {
    const { container } = render(<TxBadge dot>대기</TxBadge>);
    expect(container.querySelector(".tx-badge__dot")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("점을 붙여도 글자는 그대로 읽힌다", () => {
    render(<TxBadge dot>대기</TxBadge>);
    expect(screen.getByText("대기")).toBeTruthy();
  });
});

describe("TxBadge — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxBadge className="mine">라벨</TxBadge>);
    const badge = badgeOf(container);

    expect(badge.classList.contains("tx-badge")).toBe(true);
    expect(badge.classList.contains("mine")).toBe(true);
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(
      <TxBadge id="b1" title="설명" data-testid="b">
        라벨
      </TxBadge>
    );

    const badge = badgeOf(container);
    expect(badge.id).toBe("b1");
    expect(badge.title).toBe("설명");
    expect(badge.dataset.testid).toBe("b");
  });
});

describe("TxBadge — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxBadge.css"), "utf8"));
  const alertCss = strip(readFileSync(join(here, "..", "TxAlert", "TxAlert.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toMatch(/background-color:\s*var\(--tx-badge-bg\)/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxBadge/TxBadge.css" layer(tx);');
  });

  /** 갈래가 갈리는 것은 색 하나뿐이다. 그래야 갈래를 늘려도 손댈 곳이 한 군데다. */
  it("갈래마다 accent 하나만 갈아 끼운다", () => {
    for (const variant of ["info", "success", "warning", "danger"]) {
      const rule = css.match(new RegExp(`\\.tx-badge\\[data-variant="${variant}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";

      expect(rule, variant).toMatch(/--tx-badge-accent:/);
      expect(rule.match(/--tx-badge-[\w-]+:/g), variant).toHaveLength(1);
    }
  });

  /** 어휘가 어긋나면 소비자는 컴포넌트마다 다른 낱말을 외워야 한다. */
  it("네 갈래가 TxAlert 과 같은 전역색을 쓴다", () => {
    for (const [variant, token] of [
      ["info", "--tx-color-primary"],
      ["success", "--tx-color-success"],
      ["warning", "--tx-color-warning"],
      ["danger", "--tx-color-danger"]
    ] as const) {
      const badgeRule = css.match(new RegExp(`\\.tx-badge\\[data-variant="${variant}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";
      const alertRule = alertCss.match(new RegExp(`\\.tx-alert\\[data-variant="${variant}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";

      expect(badgeRule, variant).toContain(token);
      // info 는 양쪽 다 규칙이 없다 (primary 가 기본값이다)
      if (alertRule) expect(alertRule, variant).toContain(token);
    }
  });

  /**
   * 갈래색은 `success` · `warning` 처럼 **라이트/다크에서 밝기가 뒤집히는 것**이 있다.
   * 배경을 그 색으로 꽉 채우면 위에 얹을 글자색을 한 벌로 정할 수 없다 —
   * 그래서 글자는 늘 갈래색이고 바탕은 옅게만 섞는다.
   */
  it("배경을 갈래색으로 꽉 채우지 않는다", () => {
    expect(css).not.toContain('data-appearance="solid"');
    expect(css).not.toContain("--tx-color-on-accent");
  });

  /**
   * 갈래색을 그대로 글자에 쓰면 대비가 모자란다 — `--tx-color-primary` 와
   * `--tx-color-danger` 는 흰 글자를 얹는 **버튼 배경용**이라 다크에서도 어둡다.
   * 본문 색 쪽으로 섞으면 **어느 모드에서든 바탕에서 멀어진다.**
   */
  it("글자색을 본문 색 쪽으로 당긴다 — 갈래색 그대로 쓰지 않는다", () => {
    expect(css).toMatch(/--tx-badge-fg:\s*color-mix\([^)]*var\(--tx-badge-accent\)[^;]*var\(--tx-color-text\)/);
  });

  /** 작은 점과 가는 테두리는 갈래색 그대로면 다크에서 바탕에 묻힌다. */
  it("점과 테두리도 글자색에서 뽑는다", () => {
    const dot = css.match(/\.tx-badge__dot\s*\{([^}]*)\}/)?.[1] ?? "";
    const outline = css.match(/\.tx-badge\[data-appearance="outline"\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(dot).toMatch(/background-color:\s*var\(--tx-badge-fg\)/);
    expect(outline).toMatch(/--tx-badge-border-color:[^;]*var\(--tx-badge-fg\)/);
  });

  /** 방식을 바꿔도 크기가 흔들리면 표 안에서 줄이 들썩인다. */
  it("soft 와 outline 의 크기가 같다", () => {
    const base = css.match(/\.tx-badge\s*\{([^}]*)\}/)?.[1] ?? "";
    const outline = css.match(/\.tx-badge\[data-appearance="outline"\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(base).toMatch(/border:\s*1px solid/);
    expect(outline).not.toMatch(/(?:^|\s)(padding|border-width|font-size):/);
  });
});
