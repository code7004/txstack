import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxCollapsible } from "./TxCollapsible";

/**
 * 신규다. **네이티브 `<details>` 위에 올렸으므로** 여닫기·키보드·스크린리더는 브라우저 것이다.
 * 여기서 보는 것은 "브라우저에게 제대로 넘겼는가" 와 "우리가 맡은 것(controlled·disabled)" 이다.
 */

afterEach(cleanup);

const detailsOf = (container: HTMLElement) => container.querySelector("details")!;

/**
 * **jsdom 은 summary 를 누르면 `open` 은 바꾸면서 `toggle` 이벤트는 보내지 않는다.**
 * 브라우저가 하는 나머지 절반을 대신해 준다 — 값이 실제로 바뀌었을 때만 보낸다.
 */
const clickSummary = (container: HTMLElement) => {
  const details = detailsOf(container);
  const before = details.open;

  fireEvent.click(container.querySelector("summary")!);
  if (details.open !== before) fireEvent(details, new Event("toggle"));
};

describe("TxCollapsible — 그리기", () => {
  it("제목과 내용을 그린다", () => {
    render(<TxCollapsible title="배송 안내">2~3일 안에 받습니다.</TxCollapsible>);

    expect(screen.getByText("배송 안내")).toBeTruthy();
    expect(screen.getByText("2~3일 안에 받습니다.")).toBeTruthy();
  });

  /** 손으로 짠 것은 `aria-expanded` 까지는 해도 페이지 내 검색까지는 못 한다. */
  it("네이티브 details 다", () => {
    const { container } = render(<TxCollapsible title="제목">내용</TxCollapsible>);

    expect(detailsOf(container).tagName).toBe("DETAILS");
    expect(container.querySelector("summary")).toBeTruthy();
  });

  it("기본은 접혀 있다", () => {
    const { container } = render(<TxCollapsible title="제목">내용</TxCollapsible>);
    expect(detailsOf(container).open).toBe(false);
  });

  it("defaultOpen 이면 펼쳐진 채로 시작한다", () => {
    const { container } = render(
      <TxCollapsible title="제목" defaultOpen>
        내용
      </TxCollapsible>
    );

    expect(detailsOf(container).open).toBe(true);
  });

  /** React 가 아는 prop 이 아니라 `defaultopen` 속성으로 새어 나간다. */
  it("defaultOpen 을 DOM 으로 흘려보내지 않는다", () => {
    const { container } = render(
      <TxCollapsible title="제목" defaultOpen>
        내용
      </TxCollapsible>
    );

    expect(detailsOf(container).hasAttribute("defaultopen")).toBe(false);
  });

  it("data-tag 를 단다", () => {
    const { container } = render(<TxCollapsible title="제목">내용</TxCollapsible>);
    expect(detailsOf(container).dataset.tag).toBe("TxCollapsible");
  });
});

describe("TxCollapsible — 접고 펴기 (uncontrolled)", () => {
  it("누르면 펼쳐진다", () => {
    const { container } = render(<TxCollapsible title="제목">내용</TxCollapsible>);

    clickSummary(container);
    expect(detailsOf(container).open).toBe(true);
  });

  it("다시 누르면 접힌다", () => {
    const { container } = render(
      <TxCollapsible title="제목" defaultOpen>
        내용
      </TxCollapsible>
    );

    clickSummary(container);
    expect(detailsOf(container).open).toBe(false);
  });

  it("바뀔 때마다 알려 준다", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <TxCollapsible title="제목" onOpenChange={onOpenChange}>
        내용
      </TxCollapsible>
    );

    clickSummary(container);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    clickSummary(container);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

describe("TxCollapsible — 값의 주인이 소비자일 때 (controlled)", () => {
  it("open 이 화면을 정한다", () => {
    const { container, rerender } = render(
      <TxCollapsible title="제목" open={false} onOpenChange={vi.fn()}>
        내용
      </TxCollapsible>
    );
    expect(detailsOf(container).open).toBe(false);

    rerender(
      <TxCollapsible title="제목" open onOpenChange={vi.fn()}>
        내용
      </TxCollapsible>
    );
    expect(detailsOf(container).open).toBe(true);
  });

  it("누르면 알려 주되 스스로 열지 않는다", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <TxCollapsible title="제목" open={false} onOpenChange={onOpenChange}>
        내용
      </TxCollapsible>
    );

    clickSummary(container);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(detailsOf(container).open).toBe(false);
  });

  /**
   * `<details>` 는 눌리면 브라우저가 스스로 열어 버린다. 소비자가 값을 안 받으면
   * React 는 prop 이 그대로라 다시 그리지 않고, **화면만 열린 채 상태와 갈린다.**
   * 두 번 눌러도 갈리지 않아야 한다 — 한 번만 되돌리는 구현은 두 번째에 샌다.
   */
  it("값을 안 바꾸면 몇 번을 눌러도 열리지 않는다", () => {
    const { container } = render(
      <TxCollapsible title="제목" open={false} onOpenChange={vi.fn()}>
        내용
      </TxCollapsible>
    );

    clickSummary(container);
    expect(detailsOf(container).open).toBe(false);

    clickSummary(container);
    expect(detailsOf(container).open).toBe(false);

    clickSummary(container);
    expect(detailsOf(container).open).toBe(false);
  });

  it("open 을 주면 defaultOpen 은 무시된다", () => {
    const { container } = render(
      <TxCollapsible title="제목" open={false} defaultOpen onOpenChange={vi.fn()}>
        내용
      </TxCollapsible>
    );

    expect(detailsOf(container).open).toBe(false);
  });
});

describe("TxCollapsible — 눌러도 안 열릴 때", () => {
  it("disabled 면 누워도 안 열린다", () => {
    const { container } = render(
      <TxCollapsible title="제목" disabled>
        내용
      </TxCollapsible>
    );

    clickSummary(container);
    expect(detailsOf(container).open).toBe(false);
  });

  /** 네이티브 `<details>` 에는 disabled 가 없다. 눌러도 안 된다는 것을 알려야 한다. */
  it("눌러도 안 된다는 것을 알린다", () => {
    const { container } = render(
      <TxCollapsible title="제목" disabled>
        내용
      </TxCollapsible>
    );

    expect(container.querySelector("summary")?.getAttribute("aria-disabled")).toBe("true");
    expect(detailsOf(container).dataset.disabled).toBe("true");
  });

  /** 열려 있던 것을 잠근 것이라면 내용을 뺏지 않는다. */
  it("이미 열려 있었다면 그대로 열려 있다", () => {
    const { container } = render(
      <TxCollapsible title="제목" defaultOpen disabled>
        내용
      </TxCollapsible>
    );

    expect(detailsOf(container).open).toBe(true);
    expect(screen.getByText("내용")).toBeTruthy();
  });

  it("평소에는 표시가 없다", () => {
    const { container } = render(<TxCollapsible title="제목">내용</TxCollapsible>);

    expect(container.querySelector("summary")?.hasAttribute("aria-disabled")).toBe(false);
    expect(detailsOf(container).hasAttribute("data-disabled")).toBe(false);
  });
});

describe("TxCollapsible — 겉", () => {
  it("화살표를 없앨 수 있다", () => {
    const { container } = render(
      <TxCollapsible title="제목" hideMarker>
        내용
      </TxCollapsible>
    );

    expect(container.querySelector(".tx-collapsible__marker")).toBeNull();
  });

  it("화살표는 스크린리더에 읽히지 않는다", () => {
    const { container } = render(<TxCollapsible title="제목">내용</TxCollapsible>);
    expect(container.querySelector(".tx-collapsible__marker")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(
      <TxCollapsible title="제목" className="mine">
        내용
      </TxCollapsible>
    );

    const details = detailsOf(container);
    expect(details.classList.contains("tx-collapsible")).toBe(true);
    expect(details.classList.contains("mine")).toBe(true);
  });

  it("안쪽 슬롯에 클래스를 줄 수 있다", () => {
    const { container } = render(
      <TxCollapsible title="제목" classNames={{ summary: "s1", title: "t1", marker: "m1", body: "b1" }}>
        내용
      </TxCollapsible>
    );

    expect(container.querySelector(".tx-collapsible__summary.s1")).toBeTruthy();
    expect(container.querySelector(".tx-collapsible__title.t1")).toBeTruthy();
    expect(container.querySelector(".tx-collapsible__marker.m1")).toBeTruthy();
    expect(container.querySelector(".tx-collapsible__body.b1")).toBeTruthy();
  });

  it("나머지 props 는 details 로 간다", () => {
    const { container } = render(
      <TxCollapsible title="제목" id="c1" data-testid="c">
        내용
      </TxCollapsible>
    );

    const details = detailsOf(container);
    expect(details.id).toBe("c1");
    expect(details.dataset.testid).toBe("c");
  });

  /** `<details name>` 은 브라우저가 하나만 열리게 해 준다. 그 길을 막지 않는다. */
  it("name 을 그대로 넘긴다 — 브라우저의 한 개만 열기", () => {
    const { container } = render(
      <TxCollapsible title="제목" name="faq">
        내용
      </TxCollapsible>
    );

    expect(detailsOf(container).getAttribute("name")).toBe("faq");
  });
});

describe("TxCollapsible — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxCollapsible.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const source = readFileSync(join(here, "TxCollapsible.tsx"), "utf8");

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
    expect(styles).toContain('@import "./TxCollapsible/TxCollapsible.css" layer(tx);');
  });

  /** 표준은 `list-style` 이지만 옛 WebKit 은 자기 가상요소로 그린다. 둘 다 지워야 한다. */
  it("브라우저가 붙이는 삼각형을 두 길로 지운다", () => {
    expect(css).toMatch(/list-style:\s*none/);
    expect(css).toContain("::-webkit-details-marker");
  });

  /** 모르는 브라우저에서는 즉시 열린다 — 기능이 빠지는 것이지 깨지는 것이 아니다. */
  it("움직임은 아는 브라우저에서만 붙는다", () => {
    expect(css).toContain("@supports selector(::details-content)");

    // 그 밖에서 내용 높이를 건드리면 모르는 브라우저에서 내용이 잘린다
    const outside = css.slice(0, css.indexOf("@supports selector(::details-content)"));
    expect(outside).not.toContain("::details-content");
  });

  /** `auto` 를 오갈 수 있어야 높이가 움직인다. */
  it("높이를 오갈 수 있게 열어 둔다", () => {
    expect(css).toMatch(/interpolate-size:\s*allow-keywords/);
  });

  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");
  });

  /** 여닫기·키보드·검색을 브라우저가 맡는 것이 이 컴포넌트의 요지다. */
  it("손으로 aria-expanded 를 붙이지 않는다", () => {
    // 주석에 이름이 나오는 것은 괜찮다. 실제로 다는 것만 본다
    expect(source).not.toMatch(/aria-expanded\s*=/);
  });
});
