import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxCarousel } from "./TxCarousel";

/**
 * 넘기는 일 자체는 브라우저의 스크롤이라 jsdom 에서는 볼 수 없다. 그래서 여기서는
 * **우리가 쥔 것**을 지킨다 — 번호 · 버튼 상태 · 읽히는 것 · 멈출 수 있음.
 */

/** jsdom 에는 `matchMedia` 도 `scrollTo` 도 없다. 기본은 "줄이지 않음" 으로 둔다. */
const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") && reduce,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })) as unknown as typeof window.matchMedia;
};

const scrolls: { left: number; behavior?: string }[] = [];

beforeEach(() => {
  setReducedMotion(false);
  scrolls.length = 0;

  Element.prototype.scrollTo = function scrollTo(options?: ScrollToOptions | number) {
    if (typeof options === "object" && options) scrolls.push({ left: options.left ?? 0, behavior: options.behavior });
  } as Element["scrollTo"];

  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const SLIDES = ["첫째", "둘째", "셋째"];

const slides = (items = SLIDES) => items.map((text) => <div key={text}>{text}</div>);

const carousel = () => document.querySelector<HTMLElement>('[data-tag="TxCarousel"]')!;
const viewport = () => document.querySelector<HTMLElement>(".tx-carousel__viewport")!;
const dots = () => [...document.querySelectorAll<HTMLButtonElement>(".tx-carousel__dot")];
const activeDot = () => dots().findIndex((dot) => dot.dataset.active === "");
const prev = () => screen.getByRole("button", { name: "이전" }) as HTMLButtonElement;

/** jsdom 은 폭이 0 이라 장의 자리가 전부 겹친다. 실제 배치를 대신 세워 둔다. */
const place = (step = 300) =>
  [...viewport().querySelectorAll<HTMLElement>(".tx-carousel__item")].forEach((item, at) =>
    Object.defineProperty(item, "offsetLeft", { value: at * step, configurable: true })
  );
const next = () => screen.getByRole("button", { name: "다음" }) as HTMLButtonElement;

describe("TxCarousel — 넘기기", () => {
  it("자식 하나가 한 장이다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);

    expect(document.querySelectorAll(".tx-carousel__item")).toHaveLength(3);
    expect(dots()).toHaveLength(3);
  });

  it("화살표로 넘기면 그 장으로 스크롤한다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);

    fireEvent.click(next());
    expect(activeDot()).toBe(1);
    expect(scrolls.at(-1)?.behavior).toBe("smooth");

    fireEvent.click(prev());
    expect(activeDot()).toBe(0);
  });

  it("점을 누르면 그 장으로 간다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);

    fireEvent.click(dots()[2]!);
    expect(activeDot()).toBe(2);
  });

  /** 끝에서 처음으로 되감으면 어디쯤인지 알 수 없다. 잠가서 알려 준다. */
  it("양 끝에서 화살표가 잠긴다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);

    expect(prev().disabled).toBe(true);
    expect(next().disabled).toBe(false);

    fireEvent.click(dots()[2]!);
    expect(prev().disabled).toBe(false);
    expect(next().disabled).toBe(true);
  });

  it("손으로 밀어 넘긴 것을 번호가 따라잡는다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);
    place();

    viewport().scrollLeft = 300;
    fireEvent.scroll(viewport());

    expect(activeDot()).toBe(1);
  });

  /**
   * 스크롤은 목적지까지 가는 동안 이벤트를 수십 번 낸다. 그 중간 값을 그대로 받으면
   * **눌러서 올려 둔 번호가 도로 내려갔다가 올라온다** — 점이 깜빡인다.
   */
  it("미끄러지는 동안에는 중간 자리를 믿지 않는다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);
    place();

    fireEvent.click(next());
    expect(activeDot()).toBe(1);

    // 아직 8px 밖에 못 갔다
    viewport().scrollLeft = 8;
    fireEvent.scroll(viewport());
    expect(activeDot()).toBe(1);

    // 도착하면 그때 받아들인다
    viewport().scrollLeft = 300;
    fireEvent.scroll(viewport());
    expect(activeDot()).toBe(1);
  });

  /** 사람이 도중에 밀어 버리거나 애니메이션이 아예 안 도는 환경이 있다. */
  it("미끄러짐이 끝나지 않으면 실제 자리를 다시 믿는다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);
    place();

    fireEvent.click(next());
    expect(activeDot()).toBe(1);

    // 스크롤이 8px 에서 멈춰 버렸다 — 잠시 뒤 화면이 있는 자리로 돌아온다
    viewport().scrollLeft = 8;
    act(() => void vi.advanceTimersByTime(1500));

    expect(activeDot()).toBe(0);
  });

  it("장이 바뀌면 알려 준다", () => {
    const onChange = vi.fn();
    render(<TxCarousel onChange={onChange}>{slides()}</TxCarousel>);

    fireEvent.click(next());
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("controlled 는 index 가 주인이다", () => {
    const { rerender } = render(
      <TxCarousel index={1} onChange={() => {}}>
        {slides()}
      </TxCarousel>
    );
    expect(activeDot()).toBe(1);

    fireEvent.click(next());
    expect(activeDot()).toBe(1); // 밖이 안 바꾸면 그대로다

    rerender(
      <TxCarousel index={2} onChange={() => {}}>
        {slides()}
      </TxCarousel>
    );
    expect(activeDot()).toBe(2);
  });

  it("perView 가 토큰에 실린다 — 폭은 CSS 가 낸다", () => {
    render(<TxCarousel perView={3}>{slides()}</TxCarousel>);
    expect(carousel().style.getPropertyValue("--tx-carousel-per-view")).toBe("3");
  });

  it("한 장뿐이면 넘길 것이 없어 화살표도 점도 없다", () => {
    render(<TxCarousel>{slides(["하나"])}</TxCarousel>);

    expect(screen.queryByRole("button")).toBeNull();
    expect(dots()).toHaveLength(0);
  });

  it("장이 없으면 아무것도 그리지 않는다", () => {
    const { container } = render(<TxCarousel>{[]}</TxCarousel>);
    expect(container.firstChild).toBeNull();
  });

  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    render(<TxCarousel className="max-w-96">{slides()}</TxCarousel>);

    expect(carousel().classList.contains("tx-carousel")).toBe(true);
    expect(carousel().classList.contains("max-w-96")).toBe(true);
  });

  /** perView 는 인라인 토큰이라, 소비자가 style 로 준 것을 덮어써서는 안 된다. */
  it("style 로 준 것을 지우지 않는다", () => {
    render(
      <TxCarousel perView={2} style={{ maxWidth: "40rem" }}>
        {slides()}
      </TxCarousel>
    );

    expect(carousel().style.maxWidth).toBe("40rem");
    expect(carousel().style.getPropertyValue("--tx-carousel-per-view")).toBe("2");
  });

  it("arrows · dots 로 끌 수 있다", () => {
    render(
      <TxCarousel arrows={false} dots={false}>
        {slides()}
      </TxCarousel>
    );

    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("TxCarousel — 순회 (loop)", () => {
  /** 슬롯 배치: `[복제 3][진짜 1 2 3][복제 1]` — 앞뒤에 perView 만큼 복제가 붙는다. */
  const at = (slot: number) => slot * 300;

  /** 복제까지 자리를 세우고, 마운트 때처럼 첫 진짜 장에 세워 둔다. */
  const settle = (slot: number) => {
    place();
    viewport().scrollLeft = at(slot);
    fireEvent.scroll(viewport());
  };

  it("앞뒤에 복제를 붙인다 — 점은 진짜 개수만큼만", () => {
    render(<TxCarousel loop>{slides()}</TxCarousel>);

    // 진짜 셋 + 앞뒤 하나씩
    expect(document.querySelectorAll(".tx-carousel__item")).toHaveLength(5);
    expect(dots()).toHaveLength(3);
  });

  it("복제는 읽히지도 눌리지도 않는다", () => {
    render(<TxCarousel loop>{slides()}</TxCarousel>);

    const clones = [...document.querySelectorAll<HTMLElement>('[data-clone=""]')];
    expect(clones).toHaveLength(2);

    clones.forEach((clone) => {
      expect(clone.getAttribute("aria-hidden")).toBe("true");
      expect(clone.hasAttribute("inert")).toBe(true);
      // 몇 번째인지도 말하지 않는다 — 같은 장이 두 번 세어진다
      expect(clone.getAttribute("aria-label")).toBeNull();
    });

    expect(document.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(3);
  });

  it("perView 만큼 복제한다 — 넘어가는 동안 빈자리가 보이지 않게", () => {
    render(
      <TxCarousel loop perView={2}>
        {slides()}
      </TxCarousel>
    );

    expect(document.querySelectorAll('[data-clone=""]')).toHaveLength(4); // 앞뒤로 둘씩
  });

  /**
   * **이게 이 방식의 요지다.** 마지막에서 처음으로 갈 때 왼쪽으로 되감지 않고,
   * 오른쪽에 붙여 둔 복제로 **가던 방향 그대로** 흐른다.
   */
  it("마지막에서 처음으로 갈 때도 가던 방향으로 간다", () => {
    render(<TxCarousel loop>{slides()}</TxCarousel>);
    settle(3); // 마지막 진짜 장

    expect(activeDot()).toBe(2);

    fireEvent.click(next());

    expect(scrolls.at(-1)?.left).toBe(at(4)); // 되감지 않고 오른쪽 복제로
    expect(activeDot()).toBe(0); // 번호는 진짜 공간에서 처음이다
  });

  it("복제 자리에 서면 같은 자리의 진짜 장으로 소리 없이 옮긴다", () => {
    render(<TxCarousel loop>{slides()}</TxCarousel>);
    settle(3);

    fireEvent.click(next());

    // 오른쪽 복제에 도착했다
    viewport().scrollLeft = at(4);
    fireEvent.scroll(viewport());

    // 진짜 첫 장의 자리로 옮겨져 있다. 그림은 같고 자리만 바뀐다
    expect(viewport().scrollLeft).toBe(at(1));
    expect(viewport().dataset.jumping).toBe("");
    expect(activeDot()).toBe(0);

    // 옮기고 나면 스냅이 돌아온다. 프레임이 안 오는 자리를 위해 시계도 함께 걸려 있다
    act(() => void vi.advanceTimersByTime(120));
    expect(viewport().dataset.jumping).toBeUndefined();
  });

  it("손으로 밀어 복제 자리에 멈춰도 진짜 자리로 돌아온다", () => {
    render(<TxCarousel loop>{slides()}</TxCarousel>);
    settle(1);

    // 왼쪽 복제까지 밀었다 (휠·스와이프에는 손 떼는 순간이 없다)
    viewport().scrollLeft = at(0);
    fireEvent.scroll(viewport());

    expect(viewport().scrollLeft).toBe(at(3)); // 마지막 진짜 장으로
    expect(activeDot()).toBe(2);
  });

  it("돌지 않으면 복제도 없다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);

    expect(document.querySelectorAll(".tx-carousel__item")).toHaveLength(3);
    expect(document.querySelectorAll('[data-clone=""]')).toHaveLength(0);
  });

  it("끝에서 처음으로, 처음에서 끝으로 돈다", () => {
    render(<TxCarousel loop>{slides()}</TxCarousel>);

    // 처음에서 이전 → 마지막
    fireEvent.click(prev());
    expect(activeDot()).toBe(2);

    // 마지막에서 다음 → 처음
    fireEvent.click(next());
    expect(activeDot()).toBe(0);
  });

  it("돌 수 있으면 화살표가 잠기지 않는다", () => {
    render(<TxCarousel loop>{slides()}</TxCarousel>);

    expect(prev().disabled).toBe(false);
    expect(next().disabled).toBe(false);
  });
});

describe("TxCarousel — 마우스로 끌기", () => {
  /** 손가락에는 원래 있던 것을 마우스에도 준다. */
  const drag = (from: number, to: number, init: Record<string, unknown> = {}) => {
    const base = { pointerId: 1, pointerType: "mouse", button: 0, ...init };

    fireEvent.pointerDown(viewport(), { ...base, clientX: from });
    fireEvent.pointerMove(viewport(), { ...base, clientX: to });
  };

  it("끌면 자리가 따라오고 놓으면 가장 가까운 장에 선다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);
    place();

    drag(300, 100); // 왼쪽으로 200px
    expect(viewport().scrollLeft).toBe(200);
    expect(viewport().dataset.dragging).toBe("");

    fireEvent.pointerUp(viewport(), { pointerId: 1, pointerType: "mouse", clientX: 100 });

    expect(viewport().dataset.dragging).toBeUndefined();
    expect(activeDot()).toBe(1); // 200 은 두 번째 장(300)에 더 가깝다
  });

  /** 여기서 안 잡으면 누르기도 글자 긁기도 드래그로 먹힌다. */
  it("살짝 눌린 것은 드래그가 아니다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);
    place();

    drag(300, 298); // 2px
    expect(viewport().scrollLeft).toBe(0);
    expect(viewport().dataset.dragging).toBeUndefined();
  });

  it("손가락은 브라우저에 맡긴다 — 우리가 끌지 않는다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);
    place();

    drag(300, 100, { pointerType: "touch" });
    expect(viewport().scrollLeft).toBe(0);
  });

  it("drag={false} 면 끌리지 않는다", () => {
    render(<TxCarousel drag={false}>{slides()}</TxCarousel>);
    place();

    drag(300, 100);
    expect(viewport().scrollLeft).toBe(0);
    expect(viewport().dataset.drag).toBeUndefined();
  });
});

describe("TxCarousel — 읽히는 것", () => {
  it("넘기는 묶음이라는 것을 먼저 말한다", () => {
    render(<TxCarousel label="추천 상품">{slides()}</TxCarousel>);

    expect(carousel().getAttribute("aria-roledescription")).toBe("carousel");
    expect(carousel().getAttribute("aria-label")).toBe("추천 상품");
  });

  it("장마다 몇 번째인지 읽힌다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);

    const items = document.querySelectorAll(".tx-carousel__item");
    expect(items[0]!.getAttribute("aria-roledescription")).toBe("slide");
    expect(items[1]!.getAttribute("aria-label")).toBe("2 / 3");
  });

  /** 점은 그림이 아니라 "몇 번째로 간다" 는 버튼이다. */
  it("점이 이름과 현재 위치를 갖는다", () => {
    render(<TxCarousel label="배너">{slides()}</TxCarousel>);

    expect(screen.getByRole("button", { name: "배너 2" })).not.toBeNull();
    expect(dots()[0]!.getAttribute("aria-current")).toBe("true");
    expect(dots()[1]!.getAttribute("aria-current")).toBeNull();
  });

  /** 마우스 없이는 스크롤 자리에 닿을 길이 없다. */
  it("넘겨 보는 자리에 키보드가 닿는다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);
    expect(viewport().tabIndex).toBe(0);
  });
});

describe("TxCarousel — 저절로 넘기기", () => {
  it("autoPlay 를 주면 간격마다 넘어간다", () => {
    render(
      <TxCarousel autoPlay interval={1000}>
        {slides()}
      </TxCarousel>
    );

    act(() => void vi.advanceTimersByTime(1000));
    expect(activeDot()).toBe(1);

    act(() => void vi.advanceTimersByTime(1000));
    expect(activeDot()).toBe(2);
  });

  /** 끝에서 멈춰 버리면 저절로 넘어가는 것이 영영 끝난다. 화살표와 다른 자리다. */
  it("끝에 닿으면 처음으로 돌아간다", () => {
    render(
      <TxCarousel autoPlay interval={1000}>
        {slides()}
      </TxCarousel>
    );

    // 한 번에 3초를 흘리지 않고 한 칸씩 넘긴다 — 브라우저에서는 넘어갈 때마다 다시 그린다
    for (let step = 0; step < 3; step += 1) act(() => void vi.advanceTimersByTime(1000));

    expect(activeDot()).toBe(0);
  });

  it("안 주면 저절로 넘어가지 않는다", () => {
    render(<TxCarousel>{slides()}</TxCarousel>);

    act(() => void vi.advanceTimersByTime(10_000));
    expect(activeDot()).toBe(0);
    expect(screen.queryByRole("button", { name: "멈춤" })).toBeNull();
  });

  it("버튼으로 멈추고 다시 돌린다", () => {
    render(
      <TxCarousel autoPlay interval={1000}>
        {slides()}
      </TxCarousel>
    );

    fireEvent.click(screen.getByRole("button", { name: "멈춤" }));
    act(() => void vi.advanceTimersByTime(3000));
    expect(activeDot()).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    act(() => void vi.advanceTimersByTime(1000));
    expect(activeDot()).toBe(1);
  });

  /** 보는 동안 지나가 버리면 안 된다. */
  it("얹으면 멈추고 떼면 다시 돈다", () => {
    render(
      <TxCarousel autoPlay interval={1000}>
        {slides()}
      </TxCarousel>
    );

    fireEvent.pointerEnter(viewport());
    act(() => void vi.advanceTimersByTime(3000));
    expect(activeDot()).toBe(0);

    fireEvent.pointerLeave(viewport());
    act(() => void vi.advanceTimersByTime(1000));
    expect(activeDot()).toBe(1);
  });

  it("초점이 들어가면 멈춘다", () => {
    render(
      <TxCarousel autoPlay interval={1000}>
        {slides()}
      </TxCarousel>
    );

    fireEvent.focus(viewport());
    act(() => void vi.advanceTimersByTime(3000));
    expect(activeDot()).toBe(0);
  });

  /** `controls={false}` 는 감추는 것이지 없애는 것이 아니다. */
  it("controls={false} 여도 버튼은 남는다", () => {
    render(
      <TxCarousel autoPlay controls={false}>
        {slides()}
      </TxCarousel>
    );

    const button = screen.getByRole("button", { name: "멈춤" });
    expect(button.dataset.hidden).toBe("");
    expect(button.getAttribute("aria-hidden")).toBeNull();
  });

  describe("움직임을 줄여 달라고 한 사람", () => {
    it("멈춘 채로 시작한다", () => {
      setReducedMotion(true);
      render(
        <TxCarousel autoPlay interval={1000}>
          {slides()}
        </TxCarousel>
      );

      expect(carousel().dataset.moving).toBeUndefined();
      act(() => void vi.advanceTimersByTime(3000));
      expect(activeDot()).toBe(0);
    });

    it("넘길 때 미끄러지지 않는다", () => {
      setReducedMotion(true);
      render(<TxCarousel>{slides()}</TxCarousel>);

      fireEvent.click(next());
      expect(scrolls.at(-1)?.behavior).toBe("auto");
    });
  });
});

describe("TxCarousel — CSS 계약과 경계", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxCarousel.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 컴포넌트가 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((m) => m[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  /** 넘기는 일은 브라우저가 한다. 그 두 줄이 빠지면 장이 딱딱 서지 않는다. */
  it("넘기기를 scroll-snap 에 맡긴다", () => {
    expect(css).toMatch(/\.tx-carousel__viewport\s*\{[^}]*scroll-snap-type:\s*x mandatory/);
    expect(css).toMatch(/\.tx-carousel__item\s*\{[^}]*scroll-snap-align:\s*start/);
  });

  /** 줄어들면 세 장이 한 화면에 다 들어와 넘길 것이 없어진다. */
  it("장은 줄어들지 않는다", () => {
    expect(css).toMatch(/\.tx-carousel__item\s*\{[^}]*flex:\s*0 0 var\(--tx-carousel-item\)/);
  });

  /** `50%` 로 두면 두 장 + 틈이 자리보다 넓어져 둘째 장이 틈만큼 잘린다. */
  it("한 장의 폭을 per-view 와 틈에서 낸다", () => {
    const item = css.match(/--tx-carousel-item:([^;]*);/)?.[1] ?? "";

    expect(item).toContain("var(--tx-carousel-per-view)");
    expect(item).toContain("var(--tx-carousel-gap)");
  });

  /** 켜 둔 채로 자리를 옮기면 브라우저가 매번 되돌려서 끌리지 않는다. */
  it("끄는 동안에는 딱딱 맞춰 세우는 것을 끈다", () => {
    expect(css).toMatch(/\[data-dragging\][^{]*\{[^}]*scroll-snap-type:\s*none/);
  });

  it("감춘 멈춤 버튼은 지우지 않고 초점이 오면 되돌린다", () => {
    const body = (selector: string) => css.match(new RegExp(`${selector.replace(/[.[\]]/g, "\\$&")}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

    expect(body(".tx-carousel__toggle[data-hidden]")).not.toContain("display: none");
    expect(body(".tx-carousel__toggle[data-hidden]")).toContain("clip-path: inset(50%)");
    expect(body(".tx-carousel__toggle[data-hidden]:focus")).toContain("clip-path: none");
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxCarousel/TxCarousel.css" layer(tx);');
  });
});
