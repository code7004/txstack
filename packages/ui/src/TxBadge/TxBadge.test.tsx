import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxBadge } from "./TxBadge";

/**
 * **혼자 서는 이름표는 `TxTag` 가 갖는다.** 이쪽은 무언가에 얹히는 알림 점·개수라,
 * 가장 조심한 것은 **감싼 것의 자리를 밀지 않는 것**과 **숫자만 읽히지 않게 하는 것**이다.
 */

afterEach(cleanup);

const badgeOf = (container: HTMLElement) => container.querySelector('[data-tag="TxBadge"]') as HTMLElement;

describe("TxBadge — 무엇을 그리나", () => {
  it("수를 보여 준다", () => {
    render(<TxBadge count={3}>알림</TxBadge>);
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("수가 없으면 점만 찍는다", () => {
    const { container } = render(<TxBadge dot>알림</TxBadge>);
    expect(badgeOf(container).hasAttribute("data-dot")).toBe(true);
  });

  /** 넘긴 수를 그대로 그리면 아이콘 위에서 자리를 밀어낸다. */
  it("max 를 넘으면 99+ 로 줄인다", () => {
    render(<TxBadge count={120}>알림</TxBadge>);
    expect(screen.getByText("99+")).toBeTruthy();
  });

  it("max 를 바꿀 수 있다", () => {
    render(
      <TxBadge count={15} max={9}>
        알림
      </TxBadge>
    );
    expect(screen.getByText("9+")).toBeTruthy();
  });

  /** 0 이면 알릴 것이 없다. */
  it("0 은 기본으로 감춘다", () => {
    const { container } = render(<TxBadge count={0}>알림</TxBadge>);
    expect(badgeOf(container)).toBeNull();
  });

  it("showZero 면 0 도 보인다", () => {
    render(
      <TxBadge count={0} showZero>
        알림
      </TxBadge>
    );
    expect(screen.getByText("0")).toBeTruthy();
  });

  /** 빈 점이 남으면 없는 알림이 있어 보인다. */
  it("알릴 것이 없으면 아예 그리지 않는다", () => {
    const { container } = render(<TxBadge>알림</TxBadge>);

    expect(badgeOf(container)).toBeNull();
    expect(screen.getByText("알림")).toBeTruthy();
  });
});

describe("TxBadge — 무엇에 얹히나", () => {
  it("감싼 것을 그대로 둔다", () => {
    render(
      <TxBadge count={3}>
        <button type="button">알림</button>
      </TxBadge>
    );

    expect(screen.getByRole("button", { name: "알림" })).toBeTruthy();
  });

  it("자식이 없으면 홀로 선다", () => {
    const { container } = render(<TxBadge count={3} />);

    expect(container.querySelector('[data-tag="TxBadge.Anchor"]')).toBeNull();
    expect(badgeOf(container).hasAttribute("data-standalone")).toBe(true);
  });

  it("기본은 오른쪽 위다", () => {
    const { container } = render(<TxBadge count={3}>알림</TxBadge>);
    expect(badgeOf(container).dataset.placement).toBe("top-right");
  });

  it.each(["top-right", "top-left", "bottom-right", "bottom-left"] as const)("placement=%s 를 그대로 싣는다", (placement) => {
    const { container } = render(
      <TxBadge count={3} placement={placement}>
        알림
      </TxBadge>
    );
    expect(badgeOf(container).dataset.placement).toBe(placement);
  });
});

describe("TxBadge — 스크린리더", () => {
  /** 숫자만으로는 무엇의 수인지 알 수 없다. */
  it("무엇의 수인지 말해 준다", () => {
    render(<TxBadge count={3}>알림</TxBadge>);
    expect(screen.getByText("알림 3개")).toBeTruthy();
  });

  it("그 말을 바꿀 수 있다", () => {
    render(
      <TxBadge count={3} label="읽지 않은 메일 3개">
        메일
      </TxBadge>
    );

    expect(screen.getByText("읽지 않은 메일 3개")).toBeTruthy();
    expect(screen.queryByText("알림 3개")).toBeNull();
  });

  it("점에도 말이 붙는다", () => {
    render(<TxBadge dot>알림</TxBadge>);
    expect(screen.getByText("새 소식 있음")).toBeTruthy();
  });

  /** 보이는 숫자와 읽히는 말이 둘 다 읽히면 같은 것을 두 번 듣는다. */
  it("보이는 숫자는 읽히지 않는다", () => {
    render(<TxBadge count={3}>알림</TxBadge>);
    expect(screen.getByText("3").getAttribute("aria-hidden")).toBe("true");
  });
});

describe("TxBadge — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxBadge.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxBadge/TxBadge.css" layer(tx);');
  });

  /**
   * 붙일 모서리만 얹으면 반대쪽이 `auto` 로 남지 않아 자리가 어긋난다 —
   * `TxSlidePanel` · `TxToast` 에서 지나온 자리다.
   */
  it("네 자리가 모두 반대편을 auto 로 놓는다", () => {
    for (const placement of ["top-right", "top-left", "bottom-right", "bottom-left"]) {
      const rule = css.match(new RegExp(`\\.tx-badge\\[data-placement="${placement}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";

      expect(rule, placement).toMatch(/inset-block:.*auto|auto.*inset-block/s);
      expect(rule, placement).toMatch(/auto/);
    }
  });

  /** 알림 위를 눌러도 감싼 버튼이 눌려야 한다. */
  it("클릭을 가로채지 않는다", () => {
    expect(css).toMatch(/\.tx-badge\s*\{[^}]*pointer-events:\s*none/);
  });

  /**
   * `success` · `warning` 은 라이트/다크에서 밝기가 뒤집혀 흰 글자를 얹을 수 없다.
   * 그 둘만 글자색을 따로 정한다.
   */
  it("밝기가 뒤집히는 갈래는 글자색을 따로 정한다", () => {
    for (const variant of ["success", "warning"]) {
      const rule = css.match(new RegExp(`\\.tx-badge\\[data-variant="${variant}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";
      expect(rule, variant).toMatch(/--tx-badge-fg:/);
    }
  });

  /** `display: none` 은 스크린리더에서도 사라져서 숫자만 남는다. */
  it("읽히는 말을 화면에서만 감춘다", () => {
    const rule = css.match(/\.tx-badge__label\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).not.toMatch(/display:\s*none/);
    expect(rule).toMatch(/clip-path:/);
  });
});
