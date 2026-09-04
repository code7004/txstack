import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxTicker } from "./TxTicker";

/**
 * 이 컴포넌트의 값은 **멈출 수 있다는 것**이다 (WCAG 2.2.2). 그래서 테스트도 거기에
 * 무게를 둔다 — 버튼 · 손 얹기 · 초점 · 움직임 줄이기.
 */

/** jsdom 에는 `matchMedia` 가 없다. 기본은 "줄이지 않음" 으로 둔다. */
const setReducedMotion = (reduce: boolean) => {
  const listeners = new Set<() => void>();

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") && reduce,
    media: query,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    dispatchEvent: () => false
  })) as unknown as typeof window.matchMedia;
};

beforeEach(() => {
  setReducedMotion(false);
  vi.useFakeTimers();
  // requestAnimationFrame 도 가짜 시계를 따르게 둔다
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => setTimeout(() => fn(0), 16) as unknown as number);
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const NOTICES = ["점검 안내", "새 기능", "배송 안내"];

const notices = (items = NOTICES) =>
  items.map((text) => (
    <a key={text} href={`/notice/${text}`}>
      {text}
    </a>
  ));

const ticker = () => document.querySelector<HTMLElement>('[data-tag="TxTicker"]')!;
const track = () => document.querySelector<HTMLElement>(".tx-ticker__track")!;
const viewport = () => document.querySelector<HTMLElement>(".tx-ticker__viewport")!;
const index = () => track().dataset.index;
const toggle = () => screen.queryByRole("button");

/**
 * 한 줄 넘어간다.
 *
 * 두 번 돌리는 이유가 있다 — 줄이 바뀐 **뒤에** 제자리로 돌릴 타이머가 걸리므로,
 * 첫 번째로 흘려 보낸 시간 안에는 그 타이머가 아직 없다.
 */
const tick = (ms = 4000) => {
  act(() => void vi.advanceTimersByTime(ms));
  act(() => void vi.advanceTimersByTime(0));
};

describe("TxTicker — 세로로 한 줄씩", () => {
  it("항목마다 한 줄씩 올라간다", () => {
    render(<TxTicker>{notices()}</TxTicker>);

    expect(index()).toBe("0");
    tick();
    expect(index()).toBe("1");
    tick();
    expect(index()).toBe("2");
  });

  /**
   * 마지막에서 처음으로 **위로 되감기면** 되돌아가는 것이 보인다. 그래서 이어 붙인
   * 첫 줄까지 계속 올라간 다음, 미끄러짐이 끝나는 때에 소리 없이 제자리로 돌린다.
   *
   * **`transitionend` 를 기다리지 않는다** — 전이가 꺼져 있으면 그 이벤트가 영영 오지
   * 않아 끝을 지나 빈자리로 계속 올라간다. 여기(jsdom)가 바로 그런 환경이다.
   */
  it("마지막 다음은 되감지 않고 이어 붙인 첫 줄을 지나 제자리로 온다", () => {
    render(<TxTicker>{notices()}</TxTicker>);

    tick();
    tick();
    // 셋째 줄에서 한 번 더 — 복제한 첫 줄(3)로 간다
    tick();

    // 미끄러짐이 끝나는 때(전이가 없으면 곧바로)에 소리 없이 0 으로 돌아온다
    expect(index()).toBe("0");
    expect(track().dataset.instant).toBe("");

    // 다음 프레임에는 다시 미끄러진다
    act(() => void vi.advanceTimersByTime(20));
    expect(track().dataset.instant).toBeUndefined();
  });

  /** 자리는 인라인 transform 이 준다. 커스텀 프로퍼티만 바꾸면 전이가 브라우저를 탄다. */
  it("올라간 만큼을 transform 으로 준다", () => {
    render(<TxTicker>{notices()}</TxTicker>);

    expect(track().style.transform).toBe("translateY(calc(var(--tx-ticker-line) * 0))");
    tick();
    expect(track().style.transform).toBe("translateY(calc(var(--tx-ticker-line) * -1))");
  });

  it("이어 붙인 줄은 읽히지도 눌리지도 않는다", () => {
    render(<TxTicker>{notices()}</TxTicker>);

    const clone = document.querySelector<HTMLElement>(".tx-ticker__clone")!;
    expect(clone.getAttribute("aria-hidden")).toBe("true");
    expect(clone.hasAttribute("inert")).toBe(true);

    // 같은 링크가 두 번 잡히지 않는다
    expect(screen.getAllByRole("link", { name: "점검 안내" })).toHaveLength(1);
  });

  it("interval 로 머무는 시간을 바꾼다", () => {
    render(<TxTicker interval={1000}>{notices()}</TxTicker>);

    tick(1000);
    expect(index()).toBe("1");
  });

  it("목록으로 읽힌다", () => {
    render(<TxTicker>{notices()}</TxTicker>);
    expect(screen.getAllByRole("listitem")).toHaveLength(NOTICES.length);
  });
});

describe("TxTicker — 멈출 수 있다", () => {
  it("버튼으로 멈추고 다시 돌린다", () => {
    render(<TxTicker>{notices()}</TxTicker>);

    fireEvent.click(screen.getByRole("button", { name: "멈춤" }));
    tick();
    expect(index()).toBe("0");

    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    tick();
    expect(index()).toBe("1");
  });

  it("버튼 이름을 바꾼다", () => {
    render(
      <TxTicker pauseLabel="일시정지" playLabel="이어보기">
        {notices()}
      </TxTicker>
    );

    fireEvent.click(screen.getByRole("button", { name: "일시정지" }));
    expect(screen.getByRole("button", { name: "이어보기" })).not.toBeNull();
  });

  /** 읽는 동안 지나가 버리면 안 된다. */
  it("손을 얹으면 멈추고 떼면 다시 돈다", () => {
    render(<TxTicker>{notices()}</TxTicker>);

    fireEvent.pointerEnter(viewport());
    tick();
    expect(index()).toBe("0");

    fireEvent.pointerLeave(viewport());
    tick();
    expect(index()).toBe("1");
  });

  /** 키보드로 링크를 훑는 사람에게도 같은 것이 필요하다. */
  it("초점이 들어가면 멈춘다", () => {
    render(<TxTicker>{notices()}</TxTicker>);

    fireEvent.focus(screen.getByRole("link", { name: "점검 안내" }));
    tick();
    expect(index()).toBe("0");

    fireEvent.blur(screen.getByRole("link", { name: "점검 안내" }));
    tick();
    expect(index()).toBe("1");
  });

  /**
   * 멈춤은 **읽는 자리**에만 건다. 버튼까지 걸면 버튼에 손을 얹는 것만으로 멈춰서,
   * 눌러도 아무 일이 없는 것처럼 보인다.
   */
  it("버튼에 손을 얹는 것은 멈춤이 아니다", () => {
    render(<TxTicker>{notices()}</TxTicker>);

    fireEvent.pointerEnter(toggle()!);
    tick();
    expect(index()).toBe("1");
  });

  /**
   * `controls={false}` 는 **감추는 것이지 없애는 것이 아니다.** 없애면 키보드로 멈출
   * 길이 통째로 사라진다 — 저절로 움직이는 것에 그런 자리를 두면 안 된다.
   */
  it("controls={false} 는 화면에서만 감춘다 — 여전히 있고 여전히 멈춘다", () => {
    render(<TxTicker controls={false}>{notices()}</TxTicker>);

    const button = screen.getByRole("button", { name: "멈춤" });
    expect(button.dataset.hidden).toBe("");
    expect(button.getAttribute("aria-hidden")).toBeNull();

    fireEvent.click(button);
    tick();
    expect(index()).toBe("0");
  });

  it("controls 를 안 주면 그린다", () => {
    render(<TxTicker>{notices()}</TxTicker>);
    expect(toggle()!.dataset.hidden).toBeUndefined();
  });

  it("항목이 하나면 움직일 것이 없어 버튼도 없다", () => {
    render(<TxTicker>{notices(["점검 안내"])}</TxTicker>);

    expect(toggle()).toBeNull();
    expect(ticker().dataset.moving).toBeUndefined();
  });

  it("항목이 없으면 아무것도 그리지 않는다", () => {
    const { container } = render(<TxTicker>{[]}</TxTicker>);
    expect(container.firstChild).toBeNull();
  });
});

describe("TxTicker — 움직임을 줄여 달라고 한 사람", () => {
  it("멈춘 채로 시작한다", () => {
    setReducedMotion(true);
    render(<TxTicker>{notices()}</TxTicker>);

    expect(ticker().dataset.moving).toBeUndefined();
    tick();
    expect(index()).toBe("0");
  });

  /** 멈춰 있을 뿐 못 보는 것이 아니다. 누르면 돈다. */
  it("재생을 누르면 돈다", () => {
    setReducedMotion(true);
    render(<TxTicker>{notices()}</TxTicker>);

    fireEvent.click(screen.getByRole("button", { name: "재생" }));
    tick();
    expect(index()).toBe("1");
  });
});

describe("TxTicker — 가로로 흐르기", () => {
  it("한 벌을 더 붙여 이음매를 없앤다", () => {
    render(<TxTicker flow>{notices()}</TxTicker>);

    expect(document.querySelectorAll(".tx-ticker__list")).toHaveLength(2);
    expect(document.querySelector(".tx-ticker__clone")?.hasAttribute("inert")).toBe(true);
    expect(ticker().dataset.flow).toBe("");
  });

  it("멈추면 도는 표시가 꺼진다 — 흐름은 CSS 가 세운다", () => {
    render(<TxTicker flow>{notices()}</TxTicker>);
    expect(ticker().dataset.moving).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "멈춤" }));
    expect(ticker().dataset.moving).toBeUndefined();
  });

  /** 항목이 하나뿐이어도 흐를 것이 있다. 세로와 다른 자리다. */
  it("항목이 하나여도 흐르므로 버튼이 있다", () => {
    render(<TxTicker flow>{notices(["BTC 62,145,000"])}</TxTicker>);
    expect(toggle()).not.toBeNull();
  });

  /**
   * 폭을 못 재는 자리(`ResizeObserver` 가 없는 여기)에서는 CSS 의 기본 시간을 쓴다.
   * 인라인으로 `0s` 를 밀어 넣으면 흐름이 통째로 죽는다.
   */
  it("폭을 못 재면 시간을 인라인으로 정하지 않는다", () => {
    render(<TxTicker flow>{notices()}</TxTicker>);
    expect(track().style.getPropertyValue("--tx-ticker-duration")).toBe("");
  });
});

describe("TxTicker — CSS 계약과 경계", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxTicker.css"), "utf8"));
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

  /** 저절로 움직이는 것은 **멈춘 상태가 기본**이어야 한다. 켜는 것은 [data-moving] 뿐이다. */
  it("가로 흐름은 멈춘 상태로 정의하고 data-moving 이 켠다", () => {
    expect(css).toMatch(/\.tx-ticker\[data-flow\][^{]*\.tx-ticker__track\s*\{[^}]*animation-play-state:\s*paused/);
    expect(css).toMatch(/\[data-flow\]\[data-moving\][^{]*\{[^}]*animation-play-state:\s*running/);
  });

  /**
   * 감춘 버튼을 `display: none` 으로 지우면 Tab 이 닿지 않아 **멈출 길이 사라진다.**
   * 자리만 비우고 초점이 오면 돌아와야 한다. jsdom 에는 스타일이 없어 글자로 읽는다.
   */
  it("감춘 버튼은 지우지 않고 초점이 오면 되돌린다", () => {
    const rule = (selector: string) => css.match(new RegExp(`${selector.replace(/[.[\]]/g, "\\$&")}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

    const hidden = rule(".tx-ticker__toggle[data-hidden]");
    expect(hidden).not.toContain("display: none");
    expect(hidden).toContain("clip-path: inset(50%)");

    expect(rule(".tx-ticker__toggle[data-hidden]:focus")).toContain("clip-path: none");
  });

  it("움직임을 줄여 달라고 한 사람에게 미끄러짐을 끈다", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxTicker/TxTicker.css" layer(tx);');
  });
});
