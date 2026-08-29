import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxSkeleton } from "./TxSkeleton";

/**
 * 신규다. 하는 일이 작아서 볼 것도 셋뿐이다 — **몇 줄을 그리는가**,
 * **스크린리더에 안 읽히는가**, **모드를 알지 않고도 색이 맞는가.**
 */

afterEach(cleanup);

const rootOf = (container: HTMLElement) => container.querySelector('[data-tag="TxSkeleton"]') as HTMLElement;
const barsOf = (container: HTMLElement) => [...container.querySelectorAll(".tx-skeleton__bar")];

describe("TxSkeleton — 그리기", () => {
  it("기본은 한 줄짜리 글이다", () => {
    const { container } = render(<TxSkeleton />);

    expect(rootOf(container).dataset.variant).toBe("text");
    expect(barsOf(container)).toHaveLength(1);
  });

  it.each(["text", "circle", "rect"] as const)("variant=%s 를 그대로 싣는다 — 모양은 CSS 가 정한다", (variant) => {
    const { container } = render(<TxSkeleton variant={variant} />);
    expect(rootOf(container).dataset.variant).toBe(variant);
  });

  it("data-tag 를 단다", () => {
    const { container } = render(<TxSkeleton />);
    expect(rootOf(container).dataset.tag).toBe("TxSkeleton");
  });
});

describe("TxSkeleton — 줄 수", () => {
  it("준 만큼 줄을 그린다", () => {
    const { container } = render(<TxSkeleton lines={3} />);
    expect(barsOf(container)).toHaveLength(3);
  });

  /** 동그라미가 세 개로 늘어나면 놀란다. 줄 수는 글에만 뜻이 있다. */
  it.each(["circle", "rect"] as const)("%s 에는 줄 수가 먹지 않는다", (variant) => {
    const { container } = render(<TxSkeleton variant={variant} lines={3} />);
    expect(barsOf(container)).toHaveLength(1);
  });

  it("0 이나 음수를 줘도 한 줄은 그린다", () => {
    const { container } = render(<TxSkeleton lines={0} />);
    expect(barsOf(container)).toHaveLength(1);
  });
});

describe("TxSkeleton — 크기", () => {
  it("폭과 높이를 준 대로 놓는다", () => {
    const { container } = render(<TxSkeleton variant="rect" width="12rem" height="6rem" />);

    const root = rootOf(container);
    expect(root.style.width).toBe("12rem");
    expect(root.style.height).toBe("6rem");
  });

  it("숫자로 줘도 된다", () => {
    const { container } = render(<TxSkeleton width={200} />);
    expect(rootOf(container).style.width).toBe("200px");
  });

  /** 소비자가 style 로 준 것이 이겨야 손댈 길이 남는다. */
  it("style 이 width·height 를 덮는다", () => {
    const { container } = render(<TxSkeleton width="12rem" style={{ width: "20rem", opacity: 0.5 }} />);

    const root = rootOf(container);
    expect(root.style.width).toBe("20rem");
    expect(root.style.opacity).toBe("0.5");
  });

  it("안 주면 인라인 크기를 남기지 않는다", () => {
    const { container } = render(<TxSkeleton />);

    const root = rootOf(container);
    expect(root.style.width).toBe("");
    expect(root.style.height).toBe("");
  });
});

describe("TxSkeleton — 분기", () => {
  it("기본은 불러오는 중이다", () => {
    const { container } = render(<TxSkeleton />);
    expect(rootOf(container)).toBeTruthy();
  });

  it("loading 이면 children 대신 회색 덩이를 그린다", () => {
    const { container } = render(
      <TxSkeleton loading lines={3}>
        <p>홍길동</p>
      </TxSkeleton>
    );

    expect(barsOf(container)).toHaveLength(3);
    expect(container.textContent).toBe("");
  });

  it("다 불러오면 children 이 나온다", () => {
    const { container } = render(
      <TxSkeleton loading={false} lines={3}>
        <p>홍길동</p>
      </TxSkeleton>
    );

    expect(rootOf(container)).toBeNull();
    expect(container.textContent).toBe("홍길동");
  });

  /** 껍데기를 남기면 소비자가 준 자리가 한 겹 더 생겨 flex·grid 가 어긋난다. */
  it("다 불러오면 껍데기를 남기지 않는다", () => {
    const { container } = render(
      <TxSkeleton loading={false} className="mine">
        <p>홍길동</p>
      </TxSkeleton>
    );

    expect(container.querySelector(".tx-skeleton")).toBeNull();
    expect(container.querySelector(".mine")).toBeNull();
    expect(container.firstElementChild?.tagName).toBe("P");
  });

  it("children 여럿도 그대로 낸다", () => {
    const { container } = render(
      <TxSkeleton loading={false}>
        <p>하나</p>
        <p>둘</p>
      </TxSkeleton>
    );

    expect(container.querySelectorAll("p")).toHaveLength(2);
  });

  it("다 불러왔는데 children 이 없으면 아무것도 안 그린다", () => {
    const { container } = render(<TxSkeleton loading={false} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("TxSkeleton — 자식에서 모양을 가져올 때", () => {
  it("모양을 안 주고 children 이 있으면 자식을 그대로 안는다", () => {
    const { container } = render(
      <TxSkeleton loading>
        <p>이름</p>
      </TxSkeleton>
    );

    const root = rootOf(container);
    expect(root.hasAttribute("data-auto")).toBe(true);
    expect(barsOf(container)).toHaveLength(0);
    expect(root.querySelector("p")).toBeTruthy();
  });

  it.each([
    ["lines", { lines: 3 }],
    ["variant", { variant: "circle" as const }],
    ["width", { width: "10rem" }],
    ["height", { height: "4rem" }]
  ])("%s 를 주면 그 모양을 그린다 — 자식에서 가져오지 않는다", (_name, shape) => {
    const { container } = render(
      <TxSkeleton loading {...shape}>
        <p>이름</p>
      </TxSkeleton>
    );

    const root = rootOf(container);
    expect(root.hasAttribute("data-auto")).toBe(false);
    expect(root.querySelector("p")).toBeNull();
  });

  it("children 이 없으면 우리가 그린다", () => {
    const { container } = render(<TxSkeleton loading />);

    expect(rootOf(container).hasAttribute("data-auto")).toBe(false);
    expect(barsOf(container)).toHaveLength(1);
  });

  /**
   * 이름도 내용도 없는 빈 버튼에 Tab 이 멈추면 키보드로 쓰는 사람에게는 막다른 길이다.
   * `inert` 가 그 가지를 통째로 뺀다.
   */
  it("빈 버튼에 초점이 들어가지 않게 막는다", () => {
    const { container } = render(
      <TxSkeleton loading>
        <button type="button">{undefined}</button>
      </TxSkeleton>
    );

    expect(rootOf(container).hasAttribute("inert")).toBe(true);
  });

  /** `inert` 가 이미 "여기는 없는 셈 치라" 다. 둘을 겹치면 뒤가 묻힌다. */
  it("inert 와 aria-busy 를 겹쳐 달지 않는다", () => {
    const { container } = render(
      <TxSkeleton loading>
        <p>이름</p>
      </TxSkeleton>
    );

    expect(rootOf(container).hasAttribute("aria-busy")).toBe(false);
  });

  it("다 불러오면 여기서도 껍데기가 사라진다", () => {
    const { container } = render(
      <TxSkeleton loading={false}>
        <p>홍길동</p>
      </TxSkeleton>
    );

    expect(rootOf(container)).toBeNull();
    expect(container.firstElementChild?.tagName).toBe("P");
  });
});

describe("TxSkeleton — 스크린리더", () => {
  /** 밖에서 `aria-busy` 를 두라고 문서에 적어 두면 잊힌다. 스스로 붙인다. */
  it("불러오는 중이라고 알린다", () => {
    const { container } = render(<TxSkeleton lines={3} />);
    expect(rootOf(container).getAttribute("aria-busy")).toBe("true");
  });

  /**
   * 빈 상자를 여러 개 읽어 주는 것은 안내가 아니다. **막대만 감춘다** —
   * 루트까지 감추면 그 위의 `aria-busy` 도 함께 묻혀 아무 뜻이 없어진다.
   */
  it("막대는 읽히지 않고 루트는 감추지 않는다", () => {
    const { container } = render(<TxSkeleton lines={2} />);

    expect(rootOf(container).hasAttribute("aria-hidden")).toBe(false);
    expect(barsOf(container).every((bar) => bar.getAttribute("aria-hidden") === "true")).toBe(true);
  });
});

describe("TxSkeleton — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxSkeleton className="mine" />);
    const root = rootOf(container);

    expect(root.classList.contains("tx-skeleton")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(<TxSkeleton id="s1" data-testid="s" />);
    const root = rootOf(container);

    expect(root.id).toBe("s1");
    expect(root.dataset.testid).toBe("s");
  });
});

describe("TxSkeleton — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxSkeleton.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxSkeleton/TxSkeleton.css" layer(tx);');
  });

  /**
   * 회색을 값으로 박으면 다크에서 바탕보다 어두워져 자리가 보이지 않는다.
   * 본문 색을 섞으면 라이트에서 어둡고 다크에서 밝은 회색이 저절로 된다.
   */
  it("회색을 본문 색에서 만든다 — 모드를 알지 않는다", () => {
    expect(css).toMatch(/--tx-skeleton-bg:\s*color-mix\([^;]*var\(--tx-color-text\)/);
    expect(css).toMatch(/--tx-skeleton-sheen:\s*color-mix\([^;]*var\(--tx-color-text\)/);
  });

  /** 문단은 원래 그렇게 끝난다. 한 줄뿐이면 짧을 이유가 없다. */
  it("여러 줄일 때만 마지막 줄이 짧다", () => {
    expect(css).toMatch(/\.tx-skeleton__bar:not\(:only-child\):last-child\s*\{[^}]*width:/);
  });

  /**
   * 막대 사이에만 간격을 두면 **간격 하나만큼 짧아진다.** 자리를 잡아 두는 것이
   * 이 컴포넌트가 하는 일의 전부이므로, 그러면 내용이 도착할 때 자리가 튄다.
   */
  it("줄 수만큼의 자리를 정확히 차지한다", () => {
    const rule = css.match(/\.tx-skeleton\[data-variant="text"\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toMatch(/gap:\s*var\(--tx-skeleton-lead\)/);
    // 남는 높이를 위아래로 반씩 나눠야 N × 줄높이 가 맞는다
    expect(rule).toMatch(/padding-block:\s*calc\(var\(--tx-skeleton-lead\)\s*\/\s*2\)/);
  });

  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");

    const reduced = css.slice(css.indexOf("prefers-reduced-motion"));
    expect(reduced).toMatch(/animation:\s*none/);
  });

  /**
   * 우리가 그린 막대에는 요소를 더 얹지 않는다 — 배경만으로 된다.
   * (자식에서 가져올 때는 `:empty` 인 것만 칠하므로 겹칠 내용이 없어 `::after` 를 쓴다.)
   */
  it("우리가 그린 막대는 빛을 배경으로 그린다", () => {
    const bar = css.match(/\.tx-skeleton__bar\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(bar).toMatch(/background-image:\s*linear-gradient/);
    expect(css).not.toMatch(/\.tx-skeleton__bar::(after|before)/);
  });

  /** 껍데기가 자리를 차지하면 다 불러왔을 때 배치가 달라진다. */
  it("자식에서 가져올 때는 자리를 차지하지 않는다", () => {
    expect(css).toMatch(/\.tx-skeleton\[data-auto\]\s*\{[^}]*display:\s*contents/);
  });

  /**
   * 값이 안 왔으면 그 요소는 비어 있고, 붙박이 글이 든 요소는 비어 있지 않다.
   * `:empty` 가 그 둘을 갈라 주므로 **소비자의 색을 덮어쓸 일이 없다.**
   */
  it("값이 아직 없는 자리만 칠한다 — 소비자 CSS 를 덮지 않는다", () => {
    expect(css).toMatch(/\.tx-skeleton\[data-auto\] :empty/);
    expect(css).not.toContain("!important");
    expect(css).not.toMatch(/color:\s*transparent/);
  });

  /** 높이를 자기 글꼴에서 얻으므로 JS 가 자식을 훑거나 재지 않아도 된다. */
  it("높이를 그 요소의 글꼴에서 얻는다", () => {
    expect(css).toMatch(/min-height:\s*1lh/);
  });

  /** `<img>` · `<input>` 은 가상요소를 그리지 못한다. */
  it("대체 요소는 배경으로 칠한다", () => {
    expect(css).toMatch(/:is\(img, input[^)]*\):empty\s*\{[^}]*background-color:\s*var\(--tx-skeleton-bg\)/);
  });
});
