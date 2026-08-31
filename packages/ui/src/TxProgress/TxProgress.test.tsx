import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxProgress } from "./TxProgress";

/**
 * **얼마나 왔는지 아는 것만 그린다.** 끝을 모르는 기다림은 `TxLoading` · `TxSpinner` 가
 * 맡는다 — 모르는데 막대를 그리면 아는 척이 된다.
 */

afterEach(cleanup);

const rootOf = (container: HTMLElement) => container.querySelector('[data-tag="TxProgress"]') as HTMLElement;
const barOf = (container: HTMLElement) => container.querySelector(".tx-progress__bar") as HTMLElement;

describe("TxProgress — 값", () => {
  it("비율만큼 막대를 채운다", () => {
    const { container } = render(<TxProgress value={40} />);
    expect(barOf(container).style.inlineSize).toBe("40%");
  });

  it("max 를 바꾸면 비율이 그에 맞는다", () => {
    const { container } = render(<TxProgress value={3} max={5} />);
    expect(barOf(container).style.inlineSize).toBe("60%");
  });

  it("0 이면 비어 있다", () => {
    const { container } = render(<TxProgress value={0} />);
    expect(barOf(container).style.inlineSize).toBe("0%");
  });

  /** 밖에서 온 값이 범위를 넘는 일은 흔하다. 화면이 깨지면 안 된다. */
  it("max 를 넘으면 가득 찬다", () => {
    const { container } = render(<TxProgress value={150} />);
    expect(barOf(container).style.inlineSize).toBe("100%");
  });

  it("음수면 비어 있다", () => {
    const { container } = render(<TxProgress value={-10} />);
    expect(barOf(container).style.inlineSize).toBe("0%");
  });

  /** 0 으로 나누면 `NaN%` 이 나가 막대가 사라진다. */
  it("max 가 0 이어도 깨지지 않는다", () => {
    const { container } = render(<TxProgress value={5} max={0} />);
    expect(barOf(container).style.inlineSize).toBe("0%");
  });
});

describe("TxProgress — 스크린리더", () => {
  it("progressbar 로 읽힌다", () => {
    render(<TxProgress value={40} />);
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("값과 범위를 알린다", () => {
    render(<TxProgress value={3} max={5} />);

    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("5");
  });

  it("잘린 값으로 알린다 — 화면과 어긋나지 않는다", () => {
    render(<TxProgress value={150} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });

  it("무엇의 진행인지 이름을 붙일 수 있다", () => {
    render(<TxProgress value={40} label="업로드" />);
    expect(screen.getByRole("progressbar", { name: "업로드" })).toBeTruthy();
  });

  /** "3/5" 처럼 읽어야 할 때가 있다. 퍼센트로만 읽으면 뜻이 달라진다. */
  it("글자를 직접 만들면 그대로 읽힌다", () => {
    render(<TxProgress value={3} max={5} showValue={(value, max) => `${value}/${max}`} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("3/5");
  });

  it("기본 퍼센트에는 aria-valuetext 를 달지 않는다 — 브라우저가 만든다", () => {
    render(<TxProgress value={40} showValue />);
    expect(screen.getByRole("progressbar").hasAttribute("aria-valuetext")).toBe(false);
  });

  /** 막대가 이미 값을 알린다. 글자까지 읽으면 같은 것을 두 번 듣는다. */
  it("눈으로 보는 글자는 읽히지 않는다", () => {
    const { container } = render(<TxProgress value={40} showValue />);
    expect(container.querySelector(".tx-progress__value")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("TxProgress — 글자", () => {
  it("기본은 글자가 없다", () => {
    const { container } = render(<TxProgress value={40} />);
    expect(container.querySelector(".tx-progress__value")).toBeNull();
  });

  it("showValue 면 퍼센트가 보인다", () => {
    render(<TxProgress value={40} showValue />);
    expect(screen.getByText("40%")).toBeTruthy();
  });

  it("반올림해서 보여 준다", () => {
    render(<TxProgress value={1} max={3} showValue />);
    expect(screen.getByText("33%")).toBeTruthy();
  });

  it("글자를 직접 만들 수 있다", () => {
    render(<TxProgress value={3} max={5} showValue={(value, max) => `${value}/${max} 개`} />);
    expect(screen.getByText("3/5 개")).toBeTruthy();
  });
});

describe("TxProgress — 갈래", () => {
  it("기본은 info 다", () => {
    const { container } = render(<TxProgress value={40} />);
    expect(rootOf(container).dataset.variant).toBe("info");
  });

  it.each(["info", "success", "warning", "danger"] as const)("variant=%s 를 그대로 싣는다", (variant) => {
    const { container } = render(<TxProgress value={40} variant={variant} />);
    expect(rootOf(container).dataset.variant).toBe(variant);
  });
});

describe("TxProgress — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxProgress value={40} className="mine" />);
    const root = rootOf(container);

    expect(root.classList.contains("tx-progress")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });

  it("안쪽 슬롯에 클래스를 줄 수 있다", () => {
    const { container } = render(<TxProgress value={40} showValue classNames={{ track: "t1", bar: "b1", value: "v1" }} />);

    expect(container.querySelector(".tx-progress__track.t1")).toBeTruthy();
    expect(container.querySelector(".tx-progress__bar.b1")).toBeTruthy();
    expect(container.querySelector(".tx-progress__value.v1")).toBeTruthy();
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(<TxProgress value={40} id="p1" data-testid="p" />);
    const root = rootOf(container);

    expect(root.id).toBe("p1");
    expect(root.dataset.testid).toBe("p");
  });
});

describe("TxProgress — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxProgress.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxProgress/TxProgress.css" layer(tx);');
  });

  /** `TxAlert` · `TxTag` 와 같은 방식이다. 갈래를 늘려도 손댈 곳이 한 군데다. */
  it("갈래마다 accent 하나만 갈아 끼운다", () => {
    for (const variant of ["success", "warning", "danger"]) {
      const rule = css.match(new RegExp(`\\.tx-progress\\[data-variant="${variant}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";

      expect(rule, variant).toMatch(/--tx-progress-accent:/);
      expect(rule.match(/--tx-progress-[\w-]+:/g), variant).toHaveLength(1);
    }
  });

  /** 둥근 바탕 밖으로 막대가 삐져나오면 모서리가 각져 보인다. */
  it("막대를 바탕 안에 가둔다", () => {
    const rule = css.match(/\.tx-progress__track\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/overflow:\s*hidden/);
  });

  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");
  });
});
