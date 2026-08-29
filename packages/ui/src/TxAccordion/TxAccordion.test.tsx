import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxAccordion } from "./TxAccordion";
import type { TxAccordionItem } from "./TxAccordion.types";

/**
 * 덩이 하나하나는 `TxCollapsible` 이고 그쪽 테스트가 접기·키보드·controlled 를 본다.
 * 여기서 보는 것은 **여러 덩이를 하나로 묶는 일** — 하나만 열리기, 값의 모양, 이어 붙인 겉모습이다.
 */

afterEach(cleanup);

const ITEMS: TxAccordionItem[] = [
  { title: "배송", content: "2~3일 안에 받습니다." },
  { title: "교환", content: "7일 이내에 신청합니다." },
  { title: "보증", content: "1년간 무상입니다." }
];

const detailsList = () => [...document.querySelectorAll("details")];
const openFlags = () => detailsList().map((details) => details.open);

/**
 * **jsdom 은 summary 를 누르면 `open` 은 바꾸면서 `toggle` 이벤트는 보내지 않는다.**
 * 브라우저가 하는 나머지 절반을 대신한다 — 값이 실제로 바뀌었을 때만 보낸다.
 */
const clickItem = (index: number) => {
  const details = detailsList()[index];
  const before = details.open;

  fireEvent.click(details.querySelector("summary")!);
  if (details.open !== before) fireEvent(details, new Event("toggle"));
};

describe("TxAccordion — 그리기", () => {
  it("항목마다 한 덩이씩 그린다", () => {
    render(<TxAccordion items={ITEMS} />);

    expect(detailsList()).toHaveLength(3);
    expect(screen.getByText("배송")).toBeTruthy();
    expect(screen.getByText("보증")).toBeTruthy();
  });

  /** 덩이 하나하나가 `TxCollapsible` 이라 접힌 글도 ⌘F 로 찾힌다. */
  it("덩이가 네이티브 details 다", () => {
    render(<TxAccordion items={ITEMS} />);
    expect(detailsList()[0].dataset.tag).toBe("TxCollapsible");
  });

  it("기본은 다 접혀 있다", () => {
    render(<TxAccordion items={ITEMS} />);
    expect(openFlags()).toEqual([false, false, false]);
  });

  it("빈 목록도 그린다", () => {
    const { container } = render(<TxAccordion items={[]} />);

    expect(container.querySelector('[data-tag="TxAccordion"]')).toBeTruthy();
    expect(detailsList()).toHaveLength(0);
  });

  it("data-tag 를 단다", () => {
    const { container } = render(<TxAccordion items={ITEMS} />);
    expect(container.querySelector('[data-tag="TxAccordion"]')).toBeTruthy();
  });
});

describe("TxAccordion — 하나만 열린다", () => {
  it("누르면 열린다", () => {
    render(<TxAccordion items={ITEMS} />);

    clickItem(0);
    expect(openFlags()).toEqual([true, false, false]);
  });

  /** 상태가 배열 하나뿐이라 서로 어긋날 자리가 없다. */
  it("다른 것을 열면 먼저 것이 닫힌다", () => {
    render(<TxAccordion items={ITEMS} />);

    clickItem(0);
    clickItem(2);
    expect(openFlags()).toEqual([false, false, true]);
  });

  it("열린 것을 다시 누르면 다 닫힌다", () => {
    render(<TxAccordion items={ITEMS} />);

    clickItem(1);
    clickItem(1);
    expect(openFlags()).toEqual([false, false, false]);
  });

  it("처음에 하나를 열어 둘 수 있다", () => {
    render(<TxAccordion items={ITEMS} defaultValue={1} />);
    expect(openFlags()).toEqual([false, true, false]);
  });

  it("배열로 줘도 된다", () => {
    render(<TxAccordion items={ITEMS} defaultValue={[2]} />);
    expect(openFlags()).toEqual([false, false, true]);
  });
});

describe("TxAccordion — 여럿이 함께 열릴 때", () => {
  it("multiple 이면 먼저 것이 닫히지 않는다", () => {
    render(<TxAccordion items={ITEMS} multiple />);

    clickItem(0);
    clickItem(2);
    expect(openFlags()).toEqual([true, false, true]);
  });

  it("각자 다시 눌러 닫는다", () => {
    render(<TxAccordion items={ITEMS} multiple defaultValue={[0, 1]} />);

    clickItem(0);
    expect(openFlags()).toEqual([false, true, false]);
  });

  it("처음에 여럿을 열어 둘 수 있다", () => {
    render(<TxAccordion items={ITEMS} multiple defaultValue={[0, 2]} />);
    expect(openFlags()).toEqual([true, false, true]);
  });
});

describe("TxAccordion — 값의 모양", () => {
  /** 받는 쪽에서 타입을 좁힐 일이 없게 한다. */
  it("하나만 열리는 모드에서도 배열로 알린다", () => {
    const onChange = vi.fn();
    render(<TxAccordion items={ITEMS} onChange={onChange} />);

    clickItem(1);
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("다 닫히면 빈 배열이다", () => {
    const onChange = vi.fn();
    render(<TxAccordion items={ITEMS} defaultValue={0} onChange={onChange} />);

    clickItem(0);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("여럿이 열리면 그만큼 담긴다", () => {
    const onChange = vi.fn();
    render(<TxAccordion items={ITEMS} multiple onChange={onChange} />);

    clickItem(0);
    clickItem(2);
    expect(onChange).toHaveBeenLastCalledWith([0, 2]);
  });
});

describe("TxAccordion — 값의 주인이 소비자일 때 (controlled)", () => {
  it("value 가 화면을 정한다", () => {
    const { rerender } = render(<TxAccordion items={ITEMS} value={0} onChange={vi.fn()} />);
    expect(openFlags()).toEqual([true, false, false]);

    rerender(<TxAccordion items={ITEMS} value={[2]} onChange={vi.fn()} />);
    expect(openFlags()).toEqual([false, false, true]);
  });

  it("누르면 알려 주되 스스로 열지 않는다", () => {
    const onChange = vi.fn();
    render(<TxAccordion items={ITEMS} value={[]} onChange={onChange} />);

    clickItem(1);
    expect(onChange).toHaveBeenCalledWith([1]);
    expect(openFlags()).toEqual([false, false, false]);
  });

  /** 값을 안 바꾸면 몇 번을 눌러도 갈리지 않아야 한다. */
  it("값을 안 바꾸면 열리지 않는다", () => {
    render(<TxAccordion items={ITEMS} value={[]} onChange={vi.fn()} />);

    clickItem(0);
    clickItem(0);
    clickItem(0);
    expect(openFlags()).toEqual([false, false, false]);
  });

  it("value 를 주면 defaultValue 는 무시된다", () => {
    render(<TxAccordion items={ITEMS} value={[]} defaultValue={1} onChange={vi.fn()} />);
    expect(openFlags()).toEqual([false, false, false]);
  });
});

describe("TxAccordion — 잠긴 덩이", () => {
  it("disabled 면 열리지 않는다", () => {
    render(<TxAccordion items={[ITEMS[0], { ...ITEMS[1], disabled: true }, ITEMS[2]]} />);

    clickItem(1);
    expect(openFlags()).toEqual([false, false, false]);
  });

  it("잠긴 덩이 옆은 그대로 열린다", () => {
    render(<TxAccordion items={[ITEMS[0], { ...ITEMS[1], disabled: true }, ITEMS[2]]} />);

    clickItem(0);
    expect(openFlags()).toEqual([true, false, false]);
  });
});

describe("TxAccordion — 머리말", () => {
  it("기본은 머리말이 아니다", () => {
    const { container } = render(<TxAccordion items={ITEMS} />);

    expect(container.querySelector("h2, h3, h4, h5, h6")).toBeNull();
    expect(container.querySelector("span.tx-collapsible__title")).toBeTruthy();
  });

  /** `<summary>` 는 phrasing content 하나 또는 머리말 하나를 품도록 규정돼 있다. */
  it("headingLevel 을 주면 그 깊이의 머리말로 감싼다", () => {
    render(<TxAccordion items={ITEMS} headingLevel={3} />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
    expect(headings[0].textContent).toBe("배송");
    expect(headings[0].closest("summary")).toBeTruthy();
  });

  it("깊이를 고를 수 있다", () => {
    render(<TxAccordion items={ITEMS} headingLevel={2} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });
});

describe("TxAccordion — 겉", () => {
  it("화살표를 없앨 수 있다", () => {
    const { container } = render(<TxAccordion items={ITEMS} hideMarker />);
    expect(container.querySelector(".tx-collapsible__marker")).toBeNull();
  });

  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxAccordion items={ITEMS} className="mine" />);
    const root = container.querySelector('[data-tag="TxAccordion"]')!;

    expect(root.classList.contains("tx-accordion")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });

  it("안쪽 슬롯에 클래스를 줄 수 있다", () => {
    const { container } = render(<TxAccordion items={ITEMS} classNames={{ item: "i1", summary: "s1", title: "t1", marker: "m1", body: "b1" }} />);

    expect(container.querySelector(".tx-accordion__item.i1")).toBeTruthy();
    expect(container.querySelector(".tx-collapsible__summary.s1")).toBeTruthy();
    expect(container.querySelector(".tx-collapsible__title.t1")).toBeTruthy();
    expect(container.querySelector(".tx-collapsible__marker.m1")).toBeTruthy();
    expect(container.querySelector(".tx-collapsible__body.b1")).toBeTruthy();
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(<TxAccordion items={ITEMS} id="faq" data-testid="a" />);
    const root = container.querySelector('[data-tag="TxAccordion"]') as HTMLElement;

    expect(root.id).toBe("faq");
    expect(root.dataset.testid).toBe("a");
  });
});

describe("TxAccordion — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxAccordion.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxAccordion/TxAccordion.css" layer(tx);');
  });

  /**
   * 접기의 겉을 다시 정하면 한쪽 토큰만 바꿨을 때 모양이 갈린다.
   *
   * **되돌리는 것은 괜찮다** — 머리말로 감쌌을 때 브라우저가 얹는 크기·굵기를 지우는 것은
   * 겉모습을 정하는 것이 아니라 원래대로 두는 것이다.
   */
  it("접기의 겉모습을 다시 정하지 않는다", () => {
    const looks = [...css.matchAll(/(?:^|[\s{])(color|background-color|padding|font-size|font-weight|border-width|border-color):\s*([^;]+);/g)];
    const concrete = looks.filter(([, , value]) => !/^(inherit|0|none|unset)$/.test(value.trim()));

    expect(concrete.map(([match]) => match.trim())).toEqual([]);
  });

  /** 그대로 두면 덩이 사이가 2px 이 되어 상자를 쌓아 둔 것으로 보인다. */
  it("맞닿은 테두리를 한 겹으로 겹친다", () => {
    expect(css).toMatch(/\.tx-accordion__item \+ \.tx-accordion__item\s*\{[^}]*margin-top:\s*-1px/);
  });

  /** 소비자가 클래스 하나로 되돌릴 수 있어야 한다. */
  it("모서리 규칙은 특성도를 0 으로 둔다", () => {
    expect(css).toMatch(/:where\(\.tx-accordion__item:first-child\)/);
    expect(css).toMatch(/:where\(\.tx-accordion__item:last-child\)/);
    expect(css).not.toMatch(/^\.tx-accordion__item:first-child/m);
  });

  /** `<details>` 는 쌓임 맥락을 만들지 않아 z-index 만으로는 안 올라온다. */
  it("열린 덩이를 위로 올릴 때 position 을 함께 준다", () => {
    const rule = css.match(/\.tx-accordion__item\[open\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toMatch(/z-index:/);
    expect(rule).toMatch(/position:\s*relative/);
  });
});
