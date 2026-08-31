import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxTag } from "./TxTag";

/**
 * 신규다. **갈래 어휘를 `TxAlert` · `TxToast` 와 나눠 쓴다** — 여기서 어긋나면
 * 소비자는 컴포넌트마다 다른 낱말을 외워야 한다.
 */

afterEach(cleanup);

const badgeOf = (container: HTMLElement) => container.querySelector('[data-tag="TxTag"]') as HTMLElement;

describe("TxTag — 그리기", () => {
  it("내용을 그린다", () => {
    render(<TxTag>완료</TxTag>);
    expect(screen.getByText("완료")).toBeTruthy();
  });

  it("span 이다 — 문장 안에 그대로 놓인다", () => {
    const { container } = render(<TxTag>완료</TxTag>);
    expect(badgeOf(container).tagName).toBe("SPAN");
  });

  /** 아무것도 안 주면 읽기만 하는 이름표다. */
  it("기본은 누르는 것이 아니다", () => {
    render(<TxTag>완료</TxTag>);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("완료").hasAttribute("tabindex")).toBe(false);
  });

  it("data-tag 를 단다", () => {
    const { container } = render(<TxTag>완료</TxTag>);
    expect(badgeOf(container).dataset.tag).toBe("TxTag");
  });
});

describe("TxTag — 갈래", () => {
  /** 색이 뜻을 갖지 않는 라벨이 태그에는 흔하다. */
  it("기본은 neutral 이다", () => {
    const { container } = render(<TxTag>초안</TxTag>);
    expect(badgeOf(container).dataset.variant).toBe("neutral");
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)("variant=%s 를 그대로 싣는다 — 색은 CSS 가 정한다", (variant) => {
    const { container } = render(<TxTag variant={variant}>라벨</TxTag>);
    expect(badgeOf(container).dataset.variant).toBe(variant);
  });
});

describe("TxTag — 칠하는 방식", () => {
  it("기본은 soft 다", () => {
    const { container } = render(<TxTag>라벨</TxTag>);
    expect(badgeOf(container).dataset.appearance).toBe("soft");
  });

  it("outline 을 그대로 싣는다", () => {
    const { container } = render(<TxTag appearance="outline">라벨</TxTag>);
    expect(badgeOf(container).dataset.appearance).toBe("outline");
  });
});

describe("TxTag — 점", () => {
  it("기본은 점이 없다", () => {
    const { container } = render(<TxTag>라벨</TxTag>);
    expect(container.querySelector(".tx-tag__dot")).toBeNull();
  });

  it("dot 을 주면 점이 붙는다", () => {
    const { container } = render(<TxTag dot>대기</TxTag>);
    expect(container.querySelector(".tx-tag__dot")).toBeTruthy();
  });

  /** 점은 갈래를 거드는 표시다. 뜻은 글자가 나른다. */
  it("점은 스크린리더에 읽히지 않는다", () => {
    const { container } = render(<TxTag dot>대기</TxTag>);
    expect(container.querySelector(".tx-tag__dot")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("점을 붙여도 글자는 그대로 읽힌다", () => {
    render(<TxTag dot>대기</TxTag>);
    expect(screen.getByText("대기")).toBeTruthy();
  });
});

describe("TxTag — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxTag className="mine">라벨</TxTag>);
    const badge = badgeOf(container);

    expect(badge.classList.contains("tx-tag")).toBe(true);
    expect(badge.classList.contains("mine")).toBe(true);
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(
      <TxTag id="b1" title="설명" data-testid="b">
        라벨
      </TxTag>
    );

    const badge = badgeOf(container);
    expect(badge.id).toBe("b1");
    expect(badge.title).toBe("설명");
    expect(badge.dataset.testid).toBe("b");
  });
});

describe("TxTag — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxTag.css"), "utf8"));
  const alertCss = strip(readFileSync(join(here, "..", "TxAlert", "TxAlert.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toMatch(/background-color:\s*var\(--tx-tag-bg\)/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxTag/TxTag.css" layer(tx);');
  });

  /** 갈래가 갈리는 것은 색 하나뿐이다. 그래야 갈래를 늘려도 손댈 곳이 한 군데다. */
  it("갈래마다 accent 하나만 갈아 끼운다", () => {
    for (const variant of ["info", "success", "warning", "danger"]) {
      const rule = css.match(new RegExp(`\\.tx-tag\\[data-variant="${variant}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";

      expect(rule, variant).toMatch(/--tx-tag-accent:/);
      expect(rule.match(/--tx-tag-[\w-]+:/g), variant).toHaveLength(1);
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
      const badgeRule = css.match(new RegExp(`\\.tx-tag\\[data-variant="${variant}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";
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
    expect(css).toMatch(/--tx-tag-fg:\s*color-mix\([^)]*var\(--tx-tag-accent\)[^;]*var\(--tx-color-text\)/);
  });

  /** 작은 점과 가는 테두리는 갈래색 그대로면 다크에서 바탕에 묻힌다. */
  it("점과 테두리도 글자색에서 뽑는다", () => {
    const dot = css.match(/\.tx-tag__dot\s*\{([^}]*)\}/)?.[1] ?? "";
    const outline = css.match(/\.tx-tag\[data-appearance="outline"\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(dot).toMatch(/background-color:\s*var\(--tx-tag-fg\)/);
    expect(outline).toMatch(/--tx-tag-border-color:[^;]*var\(--tx-tag-fg\)/);
  });

  /** 방식을 바꿔도 크기가 흔들리면 표 안에서 줄이 들썩인다. */
  it("soft 와 outline 의 크기가 같다", () => {
    const base = css.match(/\.tx-tag\s*\{([^}]*)\}/)?.[1] ?? "";
    const outline = css.match(/\.tx-tag\[data-appearance="outline"\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(base).toMatch(/border:\s*1px solid/);
    expect(outline).not.toMatch(/(?:^|\s)(padding|border-width|font-size):/);
  });
});

/**
 * 5차에서 Chip 을 흡수했다. **누를 수 있고 지울 수 있다.**
 *
 * 가장 조심한 것은 **버튼 안의 버튼을 만들지 않는 것**이다 — 태그 전체를 버튼으로
 * 감싸면 지우기(×)가 그 안에 들어가 못 쓰는 마크업이 된다.
 */
describe("TxTag — 누르고 지우기", () => {
  it("onClick 을 주면 글자가 눌린다", () => {
    const onClick = vi.fn();
    render(<TxTag onClick={onClick}>VIP</TxTag>);

    fireEvent.click(screen.getByRole("button", { name: "VIP" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("onRemove 를 주면 지우기가 붙는다", () => {
    const onRemove = vi.fn();
    render(<TxTag onRemove={onRemove}>서울</TxTag>);

    fireEvent.click(screen.getByRole("button", { name: "지우기" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("지우기 버튼의 이름을 바꿀 수 있다", () => {
    render(
      <TxTag onRemove={vi.fn()} removeLabel="서울 빼기">
        서울
      </TxTag>
    );

    expect(screen.getByRole("button", { name: "서울 빼기" })).toBeTruthy();
  });

  /** 태그 전체를 버튼으로 감싸면 지우기가 그 안에 들어가 못 쓰는 마크업이 된다. */
  it("둘을 함께 줘도 버튼 안에 버튼이 생기지 않는다", () => {
    const { container } = render(
      <TxTag onClick={vi.fn()} onRemove={vi.fn()}>
        서울
      </TxTag>
    );

    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(container.querySelectorAll("button button")).toHaveLength(0);
    expect(container.querySelector('[data-tag="TxTag"]')?.tagName).toBe("SPAN");
  });

  it("누를 수 있다는 것을 표시로 남긴다", () => {
    const { container } = render(<TxTag onClick={vi.fn()}>VIP</TxTag>);
    expect(container.querySelector('[data-tag="TxTag"]')?.hasAttribute("data-interactive")).toBe(true);
  });

  it("지우기만 줬을 때는 그 표시가 없다", () => {
    const { container } = render(<TxTag onRemove={vi.fn()}>서울</TxTag>);
    expect(container.querySelector('[data-tag="TxTag"]')?.hasAttribute("data-interactive")).toBe(false);
  });

  /** 방식을 바꿔도 크기가 흔들리면 표 안에서 줄이 들썩인다. */
  it("누를 수 있든 아니든 글자 자리는 같다", () => {
    const { container: plain } = render(<TxTag>서울</TxTag>);
    const { container: clickable } = render(<TxTag onClick={vi.fn()}>서울</TxTag>);

    expect(plain.querySelector(".tx-tag__body")?.tagName).toBe("SPAN");
    expect(clickable.querySelector(".tx-tag__body")?.tagName).toBe("BUTTON");
  });
});
