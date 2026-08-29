import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxButton } from "../TxButton";
import { TxTooltip } from "./TxTooltip";

/**
 * 원본은 **마우스로만** 열렸다. 키보드로도 터치로도 못 열었고, `role="tooltip"` 도
 * `aria-describedby` 도 없어 스크린리더에는 존재하지 않았으며, Escape 로 치울 수도 없었다.
 *
 * 그래서 여기서 가장 무겁게 보는 것은 **여는 길 셋**과 **설명이 누구에게 걸리는가** 다.
 */

afterEach(cleanup);

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

/** 포인터 이벤트는 종류를 함께 줘야 한다 — 마우스와 터치가 다른 길로 간다. */
const enter = (el: Element) => fireEvent.pointerEnter(el, { pointerType: "mouse" });
const leave = (el: Element) => fireEvent.pointerLeave(el, { pointerType: "mouse" });

const anchorOf = (container: HTMLElement) => container.querySelector('[data-tag="TxTooltip"]')!;

describe("TxTooltip — 마우스", () => {
  it("올리면 지연 뒤에 뜬다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    enter(anchorOf(container));
    expect(screen.queryByRole("tooltip")).toBeNull();

    vi.advanceTimersByTime(300);
    expect(await screen.findByRole("tooltip")).toBeTruthy();
  });

  it("벗어나면 닫힌다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    enter(anchorOf(container));
    vi.advanceTimersByTime(300);
    await screen.findByRole("tooltip");

    leave(anchorOf(container));
    vi.advanceTimersByTime(100);
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("지연 안에 벗어나면 아예 안 뜬다", () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    enter(anchorOf(container));
    vi.advanceTimersByTime(200);
    leave(anchorOf(container));
    vi.advanceTimersByTime(500);

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  /** 원본은 닫는 지연이 없어 트리거와 툴팁 사이 8px 를 지나는 순간 사라졌다. */
  it("툴팁 위로 옮기는 동안 닫히지 않는다", async () => {
    const { container } = render(<TxTooltip tip="긴 설명">글자</TxTooltip>);

    enter(anchorOf(container));
    vi.advanceTimersByTime(300);
    const tooltip = await screen.findByRole("tooltip");

    leave(anchorOf(container));
    // 닫는 지연이 끝나기 전에 툴팁에 닿는다
    vi.advanceTimersByTime(50);
    fireEvent.pointerEnter(tooltip.firstElementChild!, { pointerType: "mouse" });
    vi.advanceTimersByTime(500);

    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("툴팁에서 벗어나면 닫힌다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    enter(anchorOf(container));
    vi.advanceTimersByTime(300);
    const body = (await screen.findByRole("tooltip")).firstElementChild!;

    fireEvent.pointerEnter(body, { pointerType: "mouse" });
    fireEvent.pointerLeave(body, { pointerType: "mouse" });
    vi.advanceTimersByTime(100);

    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });
});

describe("TxTooltip — 키보드", () => {
  /** 원본은 마우스로만 열렸다. 키보드만 쓰는 사람에게는 툴팁이 존재하지 않았다. */
  it("포커스하면 뜬다 — 기다리지 않는다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    fireEvent.focus(anchorOf(container));
    expect(await screen.findByRole("tooltip")).toBeTruthy();
  });

  it("포커스가 빠지면 닫힌다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    fireEvent.focus(anchorOf(container));
    await screen.findByRole("tooltip");

    fireEvent.blur(anchorOf(container));
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  /** WCAG 1.4.13 이 요구하는 것 — 툴팁이 가린 것을 치울 수 있어야 한다. */
  it("Escape 로 닫는다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    fireEvent.focus(anchorOf(container));
    await screen.findByRole("tooltip");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });
});

describe("TxTooltip — 탭 순서", () => {
  /** 글자만 감쌌으면 아무도 포커스를 못 받는다. 감싸개가 대신 받아야 키보드로 볼 수 있다. */
  it("감싼 것이 포커스를 못 받으면 감싸개가 받는다", () => {
    const { container } = render(<TxTooltip tip="설명">그냥 글자</TxTooltip>);
    expect((anchorOf(container) as HTMLElement).tabIndex).toBe(0);
  });

  /** 버튼을 감쌌는데 감싸개까지 탭 순서에 넣으면 한 컨트롤에 정거장이 둘이 된다. */
  it("감싼 것이 포커스를 받으면 감싸개는 끼어들지 않는다", () => {
    const { container } = render(
      <TxTooltip tip="설명">
        <TxButton label="삭제" />
      </TxTooltip>
    );

    expect(anchorOf(container).hasAttribute("tabindex")).toBe(false);
  });
});

describe("TxTooltip — 스크린리더", () => {
  it("role 이 tooltip 이다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    fireEvent.focus(anchorOf(container));
    expect(await screen.findByRole("tooltip")).toBeTruthy();
  });

  it("감싸개가 포커스를 받으면 감싸개에 설명이 걸린다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);
    const anchor = anchorOf(container);

    fireEvent.focus(anchor);
    const tooltip = await screen.findByRole("tooltip");

    expect(anchor.getAttribute("aria-describedby")).toBe(tooltip.id);
  });

  /**
   * 설명은 **포커스를 받는 그 요소**에 걸려야 읽힌다. 조상에 걸면 스크린리더가 읽지 않는다.
   */
  it("버튼을 감쌌으면 버튼에 설명이 걸린다", async () => {
    const { container } = render(
      <TxTooltip tip="되돌릴 수 없다">
        <TxButton label="삭제" />
      </TxTooltip>
    );

    fireEvent.focus(anchorOf(container));
    const tooltip = await screen.findByRole("tooltip");

    expect(screen.getByRole("button", { name: "삭제" }).getAttribute("aria-describedby")).toBe(tooltip.id);
  });

  it("닫히면 설명을 떼어 낸다", async () => {
    const { container } = render(
      <TxTooltip tip="설명">
        <TxButton label="삭제" />
      </TxTooltip>
    );

    fireEvent.focus(anchorOf(container));
    await screen.findByRole("tooltip");

    fireEvent.blur(anchorOf(container));
    await waitFor(() => expect(screen.getByRole("button", { name: "삭제" }).hasAttribute("aria-describedby")).toBe(false));
  });
});

describe("TxTooltip — 터치", () => {
  /** 터치에는 hover 가 없다. 톡 건드렸다고 뜨면 누르려던 것인지 보려던 것인지 헷갈린다. */
  it("톡 건드리는 것으로는 안 뜬다", () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);
    const anchor = anchorOf(container);

    fireEvent.pointerEnter(anchor, { pointerType: "touch" });
    fireEvent.pointerDown(anchor, { pointerType: "touch" });
    vi.advanceTimersByTime(200);
    fireEvent.pointerUp(anchor, { pointerType: "touch" });
    vi.advanceTimersByTime(1000);

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("길게 누르면 뜬다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    fireEvent.pointerDown(anchorOf(container), { pointerType: "touch" });
    vi.advanceTimersByTime(500);

    expect(await screen.findByRole("tooltip")).toBeTruthy();
  });

  it("뜬 뒤에 손을 떼도 남아 있다 — 읽을 새가 있어야 한다", async () => {
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    fireEvent.pointerDown(anchorOf(container), { pointerType: "touch" });
    vi.advanceTimersByTime(500);
    await screen.findByRole("tooltip");

    fireEvent.pointerUp(anchorOf(container), { pointerType: "touch" });
    vi.advanceTimersByTime(1000);

    expect(screen.getByRole("tooltip")).toBeTruthy();
  });
});

describe("TxTooltip — 그 밖", () => {
  it("disabled 면 열리지 않는다", () => {
    const { container } = render(
      <TxTooltip tip="설명" disabled>
        글자
      </TxTooltip>
    );

    enter(anchorOf(container));
    fireEvent.focus(anchorOf(container));
    vi.advanceTimersByTime(1000);

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("tip 은 요소여도 된다 — 앱은 여기에 JSON 트리를 띄운다", async () => {
    const { container } = render(<TxTooltip tip={<strong>요소다</strong>}>{"{ … }"}</TxTooltip>);

    fireEvent.focus(anchorOf(container));
    expect((await screen.findByText("요소다")).tagName).toBe("STRONG");
  });

  it("className 은 감싸개의 기본 클래스를 덧붙는다", () => {
    const { container } = render(
      <TxTooltip tip="설명" className="align-middle">
        글자
      </TxTooltip>
    );

    const anchor = anchorOf(container);
    expect(anchor.classList.contains("tx-tooltip-anchor")).toBe(true);
    expect(anchor.classList.contains("align-middle")).toBe(true);
  });

  it("사라질 때 타이머를 끈다", () => {
    const { container, unmount } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    enter(anchorOf(container));
    unmount();
    vi.advanceTimersByTime(1000);

    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

describe("TxTooltip — 스크롤", () => {
  /**
   * 페이지나 조상이 굴러가면 트리거가 움직인다. 툴팁이 제자리에 남으면 엉뚱한 곳을 가리킨다.
   * **캡처로 듣는 것이 중요하다** — 조상 요소의 스크롤은 위로 올라오지 않는다.
   */
  it("열려 있는 동안 스크롤과 리사이즈를 듣는다", async () => {
    const add = vi.spyOn(window, "addEventListener");
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    fireEvent.focus(anchorOf(container));
    await screen.findByRole("tooltip");

    const scroll = add.mock.calls.find(([type]) => type === "scroll");
    expect(scroll, "스크롤을 안 듣는다").toBeTruthy();
    // 세 번째 인자가 캡처 여부다
    expect(scroll?.[2]).toBe(true);
    expect(add.mock.calls.some(([type]) => type === "resize")).toBe(true);

    add.mockRestore();
  });

  it("닫히면 그 listener 를 걷어낸다", async () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { container } = render(<TxTooltip tip="설명">글자</TxTooltip>);

    fireEvent.focus(anchorOf(container));
    await screen.findByRole("tooltip");
    fireEvent.blur(anchorOf(container));

    await waitFor(() => expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true));
    remove.mockRestore();
  });

  /** 내용이 길면 툴팁 안에서 스크롤된다. `TxPopup` 의 `maxHeight` 를 그대로 쓴다. */
  it("maxHeight 를 팝업에 넘긴다 — 넘치면 안에서 스크롤된다", async () => {
    const { container } = render(
      <TxTooltip tip="긴 내용" maxHeight="8rem">
        글자
      </TxTooltip>
    );

    fireEvent.focus(anchorOf(container));
    const tooltip = await screen.findByRole("tooltip");

    expect(tooltip.style.maxHeight).toBe("8rem");
  });
});

describe("TxTooltip — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxTooltip.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const source = readFileSync(join(here, "TxTooltip.tsx"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toMatch(/background-color:\s*var\(--tx-tooltip-bg\)/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxTooltip/TxTooltip.css" layer(tx);');
  });

  /** 원본은 뜨는 층을 자기가 만들면서 z-50 과 z-[9999] 를 한 클래스에 둘 다 박아 두었다. */
  it("쌓임 순서를 스스로 정하지 않는다 — TxPopup 의 토큰을 따른다", () => {
    expect(css).not.toContain("z-index");
    expect(source).toContain("TxPopup");
  });

  /** 넘치는 내용은 툴팁 안에서 굴린다. 그 규칙은 TxPopup 이 갖고 있다. */
  it("넘치는 내용을 팝업이 굴린다 — 툴팁이 다시 정하지 않는다", () => {
    const popupCss = strip(readFileSync(join(here, "..", "TxPopup", "TxPopup.css"), "utf8"));

    expect(popupCss).toContain("overflow-y: auto");
    // `overflow-wrap` 은 낱말 자르기라 다른 이야기다
    expect(css).not.toMatch(/overflow(-y|-x)?\s*:/);
  });

  /** 위치·포털·바깥클릭·Escape 를 다시 만들지 않는다. */
  it("포털을 직접 만들지 않는다", () => {
    expect(source).not.toContain("createPortal");
    expect(source).not.toContain("getBoundingClientRect");
  });
});
