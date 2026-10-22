import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxAppShell } from "./TxAppShell";

/**
 * 셸이 맡는 것은 다섯이다 — **랜드마크 · 본문으로 건너뛰기 · 머무는 헤더 · 좁을 때 서랍 ·
 * 크기 조절.** 로고 · 메뉴 구조 · 로그인 상태는 전부 슬롯이라 여기서 볼 것이 없다.
 *
 * 가장 조심한 것은 **좁을 때와 넓을 때가 같은 노드를 쓰는 것**이다. 서랍용을 따로 받으면
 * 둘이 어긋나고, 어긋난 쪽은 좁은 화면에서만 보여 가장 늦게 발견된다.
 */

/** jsdom 에는 `matchMedia` 가 없다. 폭을 우리가 정한다. */
const setViewport = (narrow: boolean) => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: narrow && query.includes("max-width"),
    addEventListener: () => {},
    removeEventListener: () => {}
  }));
};

/**
 * jsdom 은 모든 것을 0×0 으로 잰다. 크기 조절은 잰 값으로 굴러가므로 **자리마다 크기를
 * 심어 준다** — 아래 숫자가 이 파일에서 기대하는 폭·높이의 근거다.
 */
const SIZES: Record<string, { width: number; height: number }> = {
  "tx-app-shell__left": { width: 240, height: 600 },
  "tx-app-shell__right": { width: 224, height: 600 },
  "tx-app-shell__bottom": { width: 1264, height: 192 },
  "tx-app-shell__body": { width: 1264, height: 600 },
  "tx-app-shell__center": { width: 800, height: 600 },
  "tx-app-shell__main": { width: 800, height: 408 },
  "tx-app-shell__header": { width: 1264, height: 105 }
};

const stubLayout = () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const found = Object.keys(SIZES).find((name) => this.classList.contains(name));
    const { width, height } = found ? SIZES[found] : { width: 0, height: 0 };

    return { width, height, x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, toJSON: () => ({}) } as DOMRect;
  });

  // jsdom 에는 포인터 캡처가 없다
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
};

beforeEach(() => {
  setViewport(false);
  stubLayout();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const SLOTS = {
  header: <span>브랜드</span>,
  top: <a href="/products">제품</a>,
  left: <a href="/settings">설정</a>,
  right: <span>관련 글</span>,
  bottom: <span>콘솔</span>,
  footer: <span>회사 소개</span>
};

/** 라우터가 하는 일 — 문서를 바꾸지 않는다. jsdom 은 이동을 못 해서 그대로 두면 경고를 낸다 */
const stay = (evt: { preventDefault: () => void }) => evt.preventDefault();

const root = () => document.querySelector('[data-tag="TxAppShell"]') as HTMLElement;
const widthVar = (slot: "left" | "right") => root().style.getPropertyValue(`--tx-app-shell-${slot}-width`);

describe("TxAppShell — 랜드마크", () => {
  it("제자리에 놓는다", () => {
    const { container } = render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    expect(container.querySelector("header")).toBeTruthy();
    expect(container.querySelector("main")).toBeTruthy();
    expect(container.querySelector("aside")).toBeTruthy();
    expect(container.querySelector("footer")).toBeTruthy();
  });

  /** 이름이 방향이라 **역할은 셸이 붙여야 한다.** */
  it("방향 이름에 역할을 붙인다", () => {
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    expect(screen.getByRole("navigation", { name: "주 메뉴" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "하위 메뉴" })).toBeTruthy();
    expect(screen.getByRole("complementary", { name: "관련 정보" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "아래 패널" })).toBeTruthy();
  });

  it("이름을 바꿀 수 있다", () => {
    render(
      <TxAppShell {...SLOTS} labels={{ top: "사이트 메뉴", left: "설정 메뉴" }}>
        본문
      </TxAppShell>
    );

    expect(screen.getByRole("navigation", { name: "사이트 메뉴" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "설정 메뉴" })).toBeTruthy();
  });

  /** 없는 슬롯의 자리를 남기면 빈 패널이 생긴다. */
  it("안 준 슬롯은 그리지 않는다", () => {
    const { container } = render(<TxAppShell>본문</TxAppShell>);

    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("aside")).toBeNull();
    expect(container.querySelector("footer")).toBeNull();
    expect(container.querySelector(".tx-app-shell__bottom")).toBeNull();
    expect(container.querySelector("main")).toBeTruthy();
  });

  /** VS Code 쪽이다 — 좌우가 그 위에서 끝나고 그 밑을 아래 패널이 가로지른다. */
  it("bottomSpan=screen 이면 좌우 패널까지 덮는다", () => {
    const { container } = render(
      <TxAppShell {...SLOTS} bottomSpan="screen">
        본문
      </TxAppShell>
    );

    expect(container.querySelector(".tx-app-shell__body .tx-app-shell__bottom")).toBeNull();

    const order = [...container.querySelectorAll(".tx-app-shell > *")].map((el) => (typeof el.className === "string" && el.className) || el.tagName.toLowerCase());
    expect(order.filter((name) => /body|bottom|footer/.test(name))).toEqual(["tx-app-shell__body", "tx-app-shell__bottom", "tx-app-shell__footer"]);
  });

  /** 전체 폭일 때는 굳이 한 칸을 더 두지 않는다. */
  it("전체 폭이면 가운데 칸이 없다", () => {
    const { container } = render(
      <TxAppShell {...SLOTS} bottomSpan="screen">
        본문
      </TxAppShell>
    );

    expect(container.querySelector(".tx-app-shell__center")).toBeNull();
  });

  it("본문은 늘 있다", () => {
    render(<TxAppShell>본문</TxAppShell>);
    expect(screen.getByRole("main").textContent).toBe("본문");
  });

  /** 기본은 `좌 · (본문 · 아래) · 우` 다 — 좌우 패널이 바닥까지 서고 패널이 본문 안에서 올라온다. */
  it("아래 패널은 본문과 한 칸을 이룬다", () => {
    const { container } = render(<TxAppShell {...SLOTS}>본문</TxAppShell>);
    const center = container.querySelector(".tx-app-shell__center")!;

    expect(center.querySelector("main")).toBeTruthy();
    expect(center.querySelector(".tx-app-shell__bottom")).toBeTruthy();
    expect(center.querySelector(".tx-app-shell__left")).toBeNull();

    const row = [...container.querySelectorAll(".tx-app-shell__body > *")].map((el) => el.className);
    expect(row).toEqual(["tx-app-shell__left", "tx-app-shell__center", "tx-app-shell__right"]);
  });
});

/**
 * **머리 줄(`__bar`)은 담을 것이 있을 때만 그린다.** `top` 만 준 셸에서 빈 줄이 최소 높이 · 여백만큼
 * 자리를 잡았다(usertics 적용에서 드러났다 — black-message 는 토큰을 0 으로 덮어 피해 갔다).
 */
describe("TxAppShell — 머리 줄", () => {
  const bar = () => document.querySelector(".tx-app-shell__bar");

  it("top 만 주면 머리 줄을 그리지 않는다", () => {
    setViewport(false);
    render(<TxAppShell top={<a href="/products">제품</a>}>본문</TxAppShell>);

    expect(screen.getByRole("navigation", { name: "주 메뉴" })).toBeTruthy();
    expect(bar()).toBeNull();
  });

  it("header 를 주면 머리 줄에 그린다", () => {
    setViewport(false);
    render(<TxAppShell header={<span>브랜드</span>}>본문</TxAppShell>);

    expect(bar()?.textContent).toContain("브랜드");
  });

  it("좁은 화면에서 서랍이 있으면 header 가 없어도 ☰ 를 담아 그린다", () => {
    setViewport(true);
    render(
      <TxAppShell top={<a href="/products">제품</a>} left={<a href="/settings">설정</a>}>
        본문
      </TxAppShell>
    );

    expect(bar()?.querySelector(".tx-app-shell__menu")).toBeTruthy();
  });

  it("아무것도 없으면 머리 자체를 그리지 않는다", () => {
    setViewport(false);
    const { container } = render(<TxAppShell>본문</TxAppShell>);

    expect(container.querySelector("header")).toBeNull();
  });
});

describe("TxAppShell — 본문으로 건너뛰기", () => {
  /** 메뉴가 스무 줄이면 키보드로 본문에 닿는 데 스무 번을 눌러야 한다. */
  it("본문을 가리킨다", () => {
    const { container } = render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    const skip = screen.getByRole("link", { name: "본문으로 건너뛰기" });
    const main = container.querySelector("main")!;

    expect(skip.getAttribute("href")).toBe(`#${main.id}`);
    expect(main.id).not.toBe("");
  });

  /**
   * HashRouter 앱에서는 주소의 조각(hash)이 곧 경로다. 기본 이동에 맡기면 `#/history` 가 `#<본문 id>` 로 바뀌어
   * 라우터가 빈 화면을 그렸다(settlemint 배포 사이트에서 재현). 주소는 그대로 두고 포커스만 옮긴다.
   */
  it("누르면 주소는 그대로 두고 본문으로 포커스를 옮긴다", () => {
    window.history.replaceState(null, "", "/app?tab=1#/history");
    const { container } = render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    const skip = screen.getByRole("link", { name: "본문으로 건너뛰기" });
    const main = container.querySelector("main")!;
    const notCancelled = fireEvent.click(skip);

    expect(notCancelled).toBe(false);
    expect(window.location.hash).toBe("#/history");
    expect(window.location.search).toBe("?tab=1");
    expect(document.activeElement).toBe(main);
  });

  it("본문은 포커스를 받을 수 있지만 Tab 순서에는 없다", () => {
    const { container } = render(<TxAppShell>본문</TxAppShell>);
    expect(container.querySelector("main")!.getAttribute("tabindex")).toBe("-1");
  });

  /** 새 탭으로 여는 클릭은 브라우저에 맡긴다 */
  it("보조키 클릭은 막지 않는다", () => {
    render(<TxAppShell>본문</TxAppShell>);
    expect(fireEvent.click(screen.getByRole("link", { name: "본문으로 건너뛰기" }), { metaKey: true })).toBe(true);
  });

  it("글자를 바꿀 수 있다", () => {
    render(<TxAppShell labels={{ skip: "Skip to content" }}>본문</TxAppShell>);
    expect(screen.getByRole("link", { name: "Skip to content" })).toBeTruthy();
  });

  /** 셸이 둘이어도 서로의 본문을 가리키면 안 된다. */
  it("셸이 둘이면 가리키는 곳도 둘이다", () => {
    const { container } = render(
      <>
        <TxAppShell>가</TxAppShell>
        <TxAppShell>나</TxAppShell>
      </>
    );

    const ids = [...container.querySelectorAll("main")].map((el) => el.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("TxAppShell — 머무는 헤더", () => {
  it("기본은 붙어 있다", () => {
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);
    expect(root().dataset.sticky).toBe("");
  });

  it("hide 를 그대로 싣는다", () => {
    render(
      <TxAppShell {...SLOTS} sticky="hide">
        본문
      </TxAppShell>
    );

    expect(root().dataset.sticky).toBe("hide");
  });

  it("false 면 표시가 없다", () => {
    render(
      <TxAppShell {...SLOTS} sticky={false}>
        본문
      </TxAppShell>
    );

    expect(root().hasAttribute("data-sticky")).toBe(false);
  });

  it("내리면 숨는다", () => {
    render(
      <TxAppShell {...SLOTS} sticky="hide">
        본문
      </TxAppShell>
    );

    expect(root().hasAttribute("data-hidden")).toBe(false);

    act(() => {
      Object.defineProperty(window, "scrollY", { configurable: true, value: 300 });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(root().hasAttribute("data-hidden")).toBe(true);

    act(() => {
      Object.defineProperty(window, "scrollY", { configurable: true, value: 100 });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(root().hasAttribute("data-hidden")).toBe(false);
  });

  /** 조금 내렸다고 숨으면 헤더가 깜빡이는 것처럼 보인다. */
  it("손떨림만큼 움직인 것으로는 숨지 않는다", () => {
    render(
      <TxAppShell {...SLOTS} sticky="hide">
        본문
      </TxAppShell>
    );

    act(() => {
      Object.defineProperty(window, "scrollY", { configurable: true, value: 5 });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(root().hasAttribute("data-hidden")).toBe(false);
  });

  it("sticky 가 아니면 스크롤을 듣지 않는다", () => {
    const spy = vi.spyOn(window, "addEventListener");
    render(
      <TxAppShell {...SLOTS} sticky={false}>
        본문
      </TxAppShell>
    );

    expect(spy.mock.calls.filter(([name]) => name === "scroll")).toHaveLength(0);
  });
});

describe("TxAppShell — 좁아지면 서랍으로", () => {
  it("넓으면 패널로 선다", () => {
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    expect(screen.getByRole("navigation", { name: "하위 메뉴" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).toBeNull();
  });

  it("좁으면 햄버거가 생긴다", () => {
    setViewport(true);
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    expect(screen.getByRole("button", { name: "메뉴 열기" })).toBeTruthy();
  });

  /** 머리 줄의 다른 아이콘 버튼과 크기 · 색이 같아야 한다. 따로 그리면 둘이 어긋난다 */
  it("햄버거는 TxButton icon 이다", () => {
    setViewport(true);
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    const button = screen.getByRole("button", { name: "메뉴 열기" });
    expect(button.getAttribute("data-tag")).toBe("TxButton");
    expect(button.hasAttribute("data-icon")).toBe(true);
    expect(button.getAttribute("data-variant")).toBe("ghost");
  });

  it("눌러서 연다", () => {
    setViewport(true);
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    const button = screen.getByRole("button", { name: "메뉴 열기" });
    expect(button.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "메뉴 열기" }).getAttribute("aria-expanded")).toBe("true");
  });

  /**
   * 서랍용 메뉴를 따로 받으면 둘이 어긋나고, 어긋난 쪽은 좁은 화면에서만 보이므로
   * 가장 늦게 발견된다.
   */
  it("서랍이 같은 노드를 그린다", () => {
    setViewport(true);
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    expect(screen.getByRole("link", { name: "설정" })).toBeTruthy();
  });

  /** 패널과 서랍에 같은 것이 함께 있으면 스크린리더가 두 번 읽는다. */
  it("좁을 때는 패널이 없다", () => {
    setViewport(true);
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);

    expect(screen.queryByRole("link", { name: "설정" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    expect(screen.getAllByRole("link", { name: "설정" })).toHaveLength(1);
  });

  /**
   * SPA 에서는 링크가 문서를 바꾸지 않는다. 닫지 않으면 새 화면을 서랍이 가린 채 남는다.
   * jsdom 은 `<a>` 를 눌러도 이동하지 않으므로 라우터가 하는 일(`preventDefault`)도 흉내 낸다.
   */
  it("서랍 안의 링크를 누르면 닫힌다", () => {
    setViewport(true);
    render(
      <TxAppShell
        left={
          <a href="/settings" onClick={stay}>
            설정
          </a>
        }
      >
        본문
      </TxAppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    fireEvent.click(screen.getByRole("link", { name: "설정" }));

    expect(screen.getByRole("button", { name: "메뉴 열기" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("링크 안쪽 글자를 눌러도 닫힌다", () => {
    setViewport(true);
    render(
      <TxAppShell
        left={
          <a onClick={stay} href="/settings">
            <span>설정</span>
          </a>
        }
      >
        본문
      </TxAppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    fireEvent.click(screen.getByText("설정"));

    expect(screen.getByRole("button", { name: "메뉴 열기" }).getAttribute("aria-expanded")).toBe("false");
  });

  /** 이 화면을 떠나지 않는 클릭이다 — 서랍에서 이어서 고를 수 있어야 한다. */
  it.each([
    [
      "새 탭",
      <a key="a" onClick={stay} href="/docs" target="_blank">
        설정
      </a>,
      {}
    ],
    [
      "내려받기",
      <a key="a" onClick={stay} href="/report.csv" download>
        설정
      </a>,
      {}
    ],
    [
      "⌘ 클릭",
      <a key="a" onClick={stay} href="/settings">
        설정
      </a>,
      { metaKey: true }
    ],
    [
      "Ctrl 클릭",
      <a key="a" onClick={stay} href="/settings">
        설정
      </a>,
      { ctrlKey: true }
    ],
    [
      "Shift 클릭",
      <a key="a" onClick={stay} href="/settings">
        설정
      </a>,
      { shiftKey: true }
    ]
  ])("%s 은 서랍을 닫지 않는다", (_, link, init) => {
    setViewport(true);
    render(<TxAppShell left={link}>본문</TxAppShell>);

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    fireEvent.click(screen.getByRole("link", { name: "설정" }), init);

    expect(screen.getByRole("button", { name: "메뉴 열기" }).getAttribute("aria-expanded")).toBe("true");
  });

  /** 묶음을 펼치는 버튼 같은 것. 누를 때마다 닫히면 하위 항목에 닿을 수 없다. */
  it("링크가 아닌 것을 누르면 열린 채로 둔다", () => {
    setViewport(true);
    render(<TxAppShell left={<button type="button">펼치기</button>}>본문</TxAppShell>);

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    fireEvent.click(screen.getByRole("button", { name: "펼치기" }));

    expect(screen.getByRole("button", { name: "메뉴 열기" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("left 가 없으면 햄버거도 없다", () => {
    setViewport(true);
    render(
      <TxAppShell header={SLOTS.header} top={SLOTS.top}>
        본문
      </TxAppShell>
    );

    expect(screen.queryByRole("button", { name: "메뉴 열기" })).toBeNull();
  });

  it("햄버거의 이름을 바꿀 수 있다", () => {
    setViewport(true);
    render(
      <TxAppShell {...SLOTS} labels={{ menu: "탐색 열기" }}>
        본문
      </TxAppShell>
    );

    expect(screen.getByRole("button", { name: "탐색 열기" })).toBeTruthy();
  });
});

describe("TxAppShell — 크기 조절", () => {
  it("안 켜면 손잡이가 없다", () => {
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);
    expect(screen.queryAllByRole("separator")).toHaveLength(0);
  });

  it("켠 자리에만 생긴다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }}>
        본문
      </TxAppShell>
    );

    const handles = screen.getAllByRole("separator");
    expect(handles).toHaveLength(1);
    expect(handles[0].getAttribute("aria-label")).toBe("하위 메뉴 크기 조절");
  });

  /** 손잡이 자체가 세로로 섰는지 가로로 누웠는지다. 아래 패널의 것만 가로다. */
  it("방향을 알린다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true }, right: { resize: true }, bottom: { resize: true } }}>
        본문
      </TxAppShell>
    );

    // 아래 패널이 본문과 한 칸이라 오른쪽 패널보다 앞선다
    expect(screen.getAllByRole("separator").map((el) => el.getAttribute("aria-orientation"))).toEqual(["vertical", "horizontal", "vertical"]);
  });

  it("이름은 자리 이름을 따라간다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }} labels={{ left: "설정 메뉴", resize: (name) => `${name} 폭 바꾸기` }}>
        본문
      </TxAppShell>
    );

    expect(screen.getByRole("separator").getAttribute("aria-label")).toBe("설정 메뉴 폭 바꾸기");
  });

  /** 원본 `TxLayout` 의 손잡이는 `role="separator"` 인데 **키보드로 못 움직였다.** */
  it("화살표로 움직인다", () => {
    const onPanelChange = vi.fn();
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
    expect(onPanelChange).toHaveBeenLastCalledWith("left", { size: 256, collapsed: false, settled: true });
    expect(widthVar("left")).toBe("256px");

    fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowLeft" });
    expect(onPanelChange).toHaveBeenLastCalledWith("left", { size: 224, collapsed: false, settled: true });
  });

  /** 오른쪽 패널과 아래 패널은 반대로 커진다. */
  it("자리마다 커지는 쪽이 다르다", () => {
    const onPanelChange = vi.fn();
    render(
      <TxAppShell {...SLOTS} panels={{ right: { resize: true }, bottom: { resize: true } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    const [bottom, right] = screen.getAllByRole("separator");

    fireEvent.keyDown(right, { key: "ArrowLeft" });
    expect(onPanelChange).toHaveBeenLastCalledWith("right", { size: 240, collapsed: false, settled: true });

    fireEvent.keyDown(bottom, { key: "ArrowUp" });
    expect(onPanelChange).toHaveBeenLastCalledWith("bottom", { size: 208, collapsed: false, settled: true });
  });

  it("Home 은 가장 작게, End 는 가장 크게", () => {
    const onPanelChange = vi.fn();
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: { min: 180 } } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    fireEvent.keyDown(screen.getByRole("separator"), { key: "Home" });
    expect(onPanelChange).toHaveBeenLastCalledWith("left", { size: 180, collapsed: false, settled: true });
  });

  /**
   * **한계를 안 줘도 화면이 안 무너진다.** 본문이 `240px` 은 남도록 셸이 조인다 —
   * 이 값은 셸만 알 수 있어서 크기 조절을 독립 부품이 아니라 셸이 맡기로 했다.
   */
  it("본문이 남을 만큼만 커진다", () => {
    const onPanelChange = vi.fn();
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    // 패널 240 에 본문 800 에서 본문 몫 240 을 뺀 만큼을 더한 데까지
    fireEvent.keyDown(screen.getByRole("separator"), { key: "End" });
    expect(onPanelChange).toHaveBeenLastCalledWith("left", { size: 800, collapsed: false, settled: true });
  });

  /** 빌려 오는 곳이 폭에 따라 갈린다 — 전체 폭은 패널 줄에서, 본문 폭은 본문에서. */
  it("아래 패널이 빌려 오는 곳이 폭을 따라간다", () => {
    const onPanelChange = vi.fn();
    const { unmount } = render(
      <TxAppShell {...SLOTS} panels={{ bottom: { resize: true } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    // 본문 408 에서 본문 몫 160 을 뺀 만큼을 패널 192 에 더한다
    fireEvent.keyDown(screen.getByRole("separator"), { key: "End" });
    expect(onPanelChange).toHaveBeenLastCalledWith("bottom", { size: 440, collapsed: false, settled: true });
    unmount();

    render(
      <TxAppShell {...SLOTS} bottomSpan="screen" panels={{ bottom: { resize: true } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    // 패널 줄 600 에서 160 을 뺀 만큼이다
    fireEvent.keyDown(screen.getByRole("separator"), { key: "End" });
    expect(onPanelChange).toHaveBeenLastCalledWith("bottom", { size: 632, collapsed: false, settled: true });
  });

  it("준 한계가 먼저다", () => {
    const onPanelChange = vi.fn();
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: { max: 320 } } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    fireEvent.keyDown(screen.getByRole("separator"), { key: "End" });
    expect(onPanelChange).toHaveBeenLastCalledWith("left", { size: 320, collapsed: false, settled: true });
  });

  it("끌어서 바꾼다", () => {
    const onPanelChange = vi.fn();
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    const handle = screen.getByRole("separator");
    fireEvent.pointerDown(handle, { button: 0, clientX: 240, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 300, pointerId: 1 });

    // 끄는 동안에는 아직 끝난 것이 아니다
    expect(onPanelChange).toHaveBeenLastCalledWith("left", { size: 300, collapsed: false, settled: false });
    expect(widthVar("left")).toBe("300px");

    fireEvent.pointerUp(handle, { pointerId: 1 });
    expect(onPanelChange).toHaveBeenLastCalledWith("left", { size: 300, collapsed: false, settled: true });
  });

  it("누르지 않고 지나가는 것으로는 안 바뀐다", () => {
    const onPanelChange = vi.fn();
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    fireEvent.pointerMove(screen.getByRole("separator"), { clientX: 400, pointerId: 1 });
    expect(onPanelChange).not.toHaveBeenCalled();
  });

  /** 밖에서 쥔 자리를 안에서 같이 쥐면 둘이 어긋난다. */
  it("sizes 를 주면 밖이 정한다", () => {
    const onPanelChange = vi.fn();
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true, size: 300 } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    expect(widthVar("left")).toBe("300px");

    fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
    expect(onPanelChange).toHaveBeenLastCalledWith("left", { size: 256, collapsed: false, settled: true });
    expect(widthVar("left")).toBe("300px");
  });

  /** 서랍의 폭은 서랍 것이다. */
  it("서랍으로 간 자리에는 손잡이가 없다", () => {
    setViewport(true);
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }}>
        본문
      </TxAppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    expect(screen.queryAllByRole("separator")).toHaveLength(0);
  });

  /** 한계를 안 알리면 스크린리더가 기본값 `100` 을 읽는다 — 폭이 298px 인데 100 이다. */
  it("움직여 본 뒤에는 한계도 알린다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }}>
        본문
      </TxAppShell>
    );

    fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });

    const handle = screen.getByRole("separator");
    expect(handle.getAttribute("aria-valuenow")).toBe("256");
    expect(handle.getAttribute("aria-valuemin")).toBe("120");
    expect(handle.getAttribute("aria-valuemax")).toBe("800");
    // 잰 값은 소수로 나온다. 그대로 두면 "506.34375" 같은 것을 읽는다
    expect(handle.getAttribute("aria-valuemax")).not.toContain(".");
  });

  /** 새로고침 뒤 되살리는 길이다. 이후는 셸이 쥐어야 한다. */
  it("defaultSize 는 처음만 정하고 물러난다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true, defaultSize: 300 } }}>
        본문
      </TxAppShell>
    );

    expect(widthVar("left")).toBe("300px");

    // 여기서 몇 px 이 되는지는 안 본다 — 손잡이는 화면에 그려진 폭에서 재는데
    // jsdom 에는 그게 없다. 볼 것은 **셸이 값을 넘겨받았다**는 것이다
    fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
    expect(widthVar("left")).not.toBe("300px");
  });

  it("아직 안 바꾼 자리는 CSS 기본값이 산다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true } }}>
        본문
      </TxAppShell>
    );

    expect(widthVar("left")).toBe("");
    expect(screen.getByRole("separator").hasAttribute("aria-valuenow")).toBe(false);
  });
});

describe("TxAppShell — 접기", () => {
  it("안 켜면 스위치가 없다", () => {
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);
    expect(screen.queryAllByRole("button", { expanded: true })).toHaveLength(0);
  });

  /** 접혔는지는 `aria-expanded` 가 말한다. 이름까지 바꾸면 두 번 말하는 것이 된다. */
  it("켠 자리에만 생긴다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { collapse: true }, bottom: { collapse: true } }}>
        본문
      </TxAppShell>
    );

    expect(screen.getByRole("button", { name: "하위 메뉴" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "아래 패널" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "관련 정보" })).toBeNull();
  });

  it("눌러서 접는다", () => {
    const { container } = render(
      <TxAppShell {...SLOTS} panels={{ left: { collapse: true } }}>
        본문
      </TxAppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "하위 메뉴" }));

    expect(screen.getByRole("button", { name: "하위 메뉴" }).getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".tx-app-shell__left")!.hasAttribute("data-collapsed")).toBe(true);
  });

  /** 폭만 0 으로 두면 안의 링크에 Tab 이 그대로 닿는다. */
  it("접히면 내용을 그리지 않는다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { collapse: true } }}>
        본문
      </TxAppShell>
    );

    expect(screen.getByRole("link", { name: "설정" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "하위 메뉴" }));
    expect(screen.queryByRole("link", { name: "설정" })).toBeNull();
  });

  /** 스위치가 같이 사라지면 다시 펼 길이 없다. */
  it("접혀도 스위치는 남는다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { collapse: true } }}>
        본문
      </TxAppShell>
    );

    fireEvent.click(screen.getByRole("button", { name: "하위 메뉴" }));
    fireEvent.click(screen.getByRole("button", { name: "하위 메뉴" }));

    expect(screen.getByRole("link", { name: "설정" })).toBeTruthy();
  });

  /** 접힌 자리를 끌 수는 없다. 손잡이가 남으면 폭 0 인 것을 끌게 된다. */
  it("접히면 크기 손잡이도 사라진다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true, collapse: true } }}>
        본문
      </TxAppShell>
    );

    expect(screen.getAllByRole("separator")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "하위 메뉴" }));
    expect(screen.queryAllByRole("separator")).toHaveLength(0);
  });

  /** 접기 전 크기를 셸이 그대로 쥐고 있어야 한다. */
  it("다시 펴면 접기 전 크기로 돌아온다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { resize: true, collapse: true } }}>
        본문
      </TxAppShell>
    );

    fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
    expect(widthVar("left")).toBe("256px");

    fireEvent.click(screen.getByRole("button", { name: "하위 메뉴" }));
    fireEvent.click(screen.getByRole("button", { name: "하위 메뉴" }));

    expect(widthVar("left")).toBe("256px");
  });

  it("접힘을 밖에서 쥔다", () => {
    const onPanelChange = vi.fn();
    const { container } = render(
      <TxAppShell {...SLOTS} panels={{ left: { collapse: true, collapsed: true } }} onPanelChange={onPanelChange}>
        본문
      </TxAppShell>
    );

    expect(container.querySelector(".tx-app-shell__left")!.hasAttribute("data-collapsed")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "하위 메뉴" }));
    expect(onPanelChange).toHaveBeenCalledExactlyOnceWith("left", { size: undefined, collapsed: false, settled: true });
    expect(container.querySelector(".tx-app-shell__left")!.hasAttribute("data-collapsed")).toBe(true);
  });

  /**
   * **처음엔 접힌 채로, 이후는 사용자가.** `collapsed` 로 주면 제어 모드가 되어
   * 스위치가 안 먹는다 — AWS 의 Console-to-Code 패널이 이 모양이다.
   */
  it("defaultCollapsed 는 처음만 정하고 물러난다", () => {
    const { container } = render(
      <TxAppShell {...SLOTS} panels={{ right: { collapse: true, defaultCollapsed: true } }}>
        본문
      </TxAppShell>
    );

    expect(container.querySelector(".tx-app-shell__right")!.hasAttribute("data-collapsed")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "관련 정보" }));
    expect(container.querySelector(".tx-app-shell__right")!.hasAttribute("data-collapsed")).toBe(false);
  });

  /** 스위치를 직접 그리는 길이다 — 셸이 그린 것 없이도 접힌다. */
  it("collapsible 없이 collapsed 만 줘도 접힌다", () => {
    const { container } = render(
      <TxAppShell {...SLOTS} panels={{ right: { collapsed: true } }}>
        본문
      </TxAppShell>
    );

    expect(container.querySelector(".tx-app-shell__right")!.hasAttribute("data-collapsed")).toBe(true);
    expect(screen.queryByRole("button", { name: "관련 정보" })).toBeNull();
  });

  it("스위치의 이름을 바꿀 수 있다", () => {
    render(
      <TxAppShell {...SLOTS} panels={{ left: { collapse: true } }} labels={{ toggle: (name) => `${name} 여닫기` }}>
        본문
      </TxAppShell>
    );

    expect(screen.getByRole("button", { name: "하위 메뉴 여닫기" })).toBeTruthy();
  });

  /** 서랍의 폭도 여닫기도 서랍 것이다. */
  it("서랍으로 간 자리에는 스위치가 없다", () => {
    setViewport(true);
    render(
      <TxAppShell {...SLOTS} panels={{ left: { collapse: true } }}>
        본문
      </TxAppShell>
    );

    expect(screen.queryByRole("button", { name: "하위 메뉴" })).toBeNull();
  });
});

/**
 * 하단 탭바. **좁을 때만 선다** — 넓은 화면에는 top · left 가 이미 그 일을 한다.
 * `bottom`(콘솔 패널)과는 다른 자리다.
 */
describe("TxAppShell — 하단 탭바", () => {
  const tabs = (
    <ul>
      <li>
        <a href="/">홈</a>
      </li>
    </ul>
  );

  it("넓으면 그리지 않는다", () => {
    render(<TxAppShell tabBar={tabs}>본문</TxAppShell>);

    expect(screen.queryByRole("navigation", { name: "하단 탭" })).toBeNull();
    expect(root().hasAttribute("data-tab-bar")).toBe(false);
  });

  it("좁으면 이름 붙은 nav 로 선다", () => {
    setViewport(true);
    render(<TxAppShell tabBar={tabs}>본문</TxAppShell>);

    const nav = screen.getByRole("navigation", { name: "하단 탭" });
    expect(nav.classList.contains("tx-app-shell__tab-bar")).toBe(true);
    expect(nav.contains(screen.getByRole("link", { name: "홈" }))).toBe(true);
  });

  /** 본문 아래 자리 비우기는 CSS 가 이 표시를 보고 한다 */
  it("서 있는 동안 셸에 표시를 남긴다", () => {
    setViewport(true);
    render(<TxAppShell tabBar={tabs}>본문</TxAppShell>);
    expect(root().hasAttribute("data-tab-bar")).toBe(true);
  });

  it("탭바를 안 주면 좁아도 표시가 없다", () => {
    setViewport(true);
    render(<TxAppShell>본문</TxAppShell>);
    expect(root().hasAttribute("data-tab-bar")).toBe(false);
  });

  /** 탭바에 다 안 드는 메뉴가 갈 곳이다 */
  it("탭바가 있어도 서랍(햄버거)은 남는다", () => {
    setViewport(true);
    render(
      <TxAppShell left={SLOTS.left} tabBar={tabs}>
        본문
      </TxAppShell>
    );
    expect(screen.getByRole("button", { name: "메뉴 열기" })).toBeTruthy();
  });

  it("bottom 과 따로 선다 — 콘솔 패널 자리가 아니다", () => {
    setViewport(true);
    render(
      <TxAppShell bottom={SLOTS.bottom} tabBar={tabs}>
        본문
      </TxAppShell>
    );

    expect(screen.getByRole("region", { name: "아래 패널" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeTruthy();
  });

  it("이름과 className 을 바꿀 수 있다", () => {
    setViewport(true);
    render(
      <TxAppShell tabBar={tabs} labels={{ tabBar: "주 탭" }} classNames={{ tabBar: "mine" }}>
        본문
      </TxAppShell>
    );
    expect(screen.getByRole("navigation", { name: "주 탭" }).classList.contains("mine")).toBe(true);
  });
});

describe("TxAppShell — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    render(<TxAppShell className="mine">본문</TxAppShell>);

    expect(root().classList.contains("tx-app-shell")).toBe(true);
    expect(root().classList.contains("mine")).toBe(true);
  });

  it("안쪽 슬롯에 클래스를 줄 수 있다", () => {
    const { container } = render(
      <TxAppShell {...SLOTS} classNames={{ header: "h1", bar: "ba1", top: "t1", left: "l1", right: "r1", bottom: "b1", main: "m1", footer: "f1" }}>
        본문
      </TxAppShell>
    );

    for (const [part, name] of [
      ["header", "h1"],
      ["bar", "ba1"],
      ["top", "t1"],
      ["left", "l1"],
      ["right", "r1"],
      ["bottom", "b1"],
      ["main", "m1"],
      ["footer", "f1"]
    ]) {
      expect(container.querySelector(`.tx-app-shell__${part}.${name}`), part).toBeTruthy();
    }
  });

  it("breakpoint 를 변수로 넘긴다", () => {
    render(<TxAppShell breakpoint={1200}>본문</TxAppShell>);
    expect(root().style.getPropertyValue("--tx-app-shell-breakpoint")).toBe("1200px");
  });
});

/**
 * **좌우 패널이 화면에 붙는다**(`panelSticky`, 기본 켜짐). 셸은 창이 스크롤되는 구조라 그대로 두면
 * 패널이 본문과 같이 올라간다. 붙는 자리는 헤더 높이이고, 셸이 그것을 잰다.
 * jsdom 에는 sticky 가 없어 위치는 CSS 계약으로 본다.
 */
describe("TxAppShell — 붙는 패널", () => {
  it("기본으로 켜져 있다", () => {
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);
    expect(root().hasAttribute("data-panel-sticky")).toBe(true);
  });

  it("panelSticky={false} 면 끈다 — 본문과 같이 굴러간다", () => {
    render(
      <TxAppShell {...SLOTS} panelSticky={false}>
        본문
      </TxAppShell>
    );
    expect(root().hasAttribute("data-panel-sticky")).toBe(false);
  });

  /** 헤더에 무엇이 들어올지는 소비자가 정한다. 그래서 높이를 정해 두지 않고 잰다. */
  it("헤더 높이를 재서 패널이 붙을 자리로 내려 준다", () => {
    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);
    expect(root().style.getPropertyValue("--tx-app-shell-header-height")).toBe("105px");
  });

  it("헤더가 같이 굴러가면 재지 않는다 — 패널은 화면 맨 위에 붙는다", () => {
    render(
      <TxAppShell {...SLOTS} sticky={false}>
        본문
      </TxAppShell>
    );
    expect(root().style.getPropertyValue("--tx-app-shell-header-height")).toBe("0px");
  });

  it("헤더 높이가 바뀌면 다시 잰다", () => {
    let observed: ResizeObserverCallback | undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          observed = callback;
        }
        observe() {}
        disconnect() {}
      }
    );

    render(<TxAppShell {...SLOTS}>본문</TxAppShell>);
    expect(root().style.getPropertyValue("--tx-app-shell-header-height")).toBe("105px");

    SIZES["tx-app-shell__header"] = { width: 1264, height: 56 };
    act(() => observed?.([], {} as ResizeObserver));
    expect(root().style.getPropertyValue("--tx-app-shell-header-height")).toBe("56px");

    SIZES["tx-app-shell__header"] = { width: 1264, height: 105 };
  });
});

describe("TxAppShell — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxAppShell.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const source = strip(readFileSync(join(here, "TxAppShell.tsx"), "utf8"));

  /** 평소 투명한 헤더 선이 1px 을 차지해 헤더가 그만큼 높았다 — settlemint 에서 요구됐다 */
  /** settlemint 의 Figma(높이 84 · 위 8 · 아래 24 · 흰 바탕 · 위 선 · 페이드 40)를 전부 토큰으로 맞출 수 있어야 한다 */
  it("건너뛰기로 온 본문은 테두리를 두르지 않고, 머무는 헤더 밑에 들어가지 않는다", () => {
    const main = css.match(/\.tx-app-shell__main\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(css).toMatch(/\.tx-app-shell__main:focus\s*\{\s*outline:\s*none;?\s*\}/);
    expect(main).toMatch(/scroll-margin-block-start:\s*var\(--tx-app-shell-header-height/);
  });

  it("하단 탭바의 높이 · 여백 · 바탕 · 경계선 · 페이드가 전부 토큰이다", () => {
    const base = css.match(/\.tx-app-shell\s*\{([^}]*)\}/)?.[1] ?? "";
    for (const name of ["height", "padding-top", "padding-bottom", "bg", "border-width", "border-color", "fade", "fade-color"]) {
      expect(base, name).toMatch(new RegExp(`--tx-app-shell-tab-bar-${name}:`));
    }
    expect(base).toMatch(/--tx-app-shell-tab-bar-fade:\s*0;/);
  });

  it("하단 탭바는 화면 아래에 붙고, 아이폰 홈 표시줄 자리는 아래 여백에 더한다", () => {
    const bar = css.match(/\.tx-app-shell__tab-bar\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(bar).toMatch(/position:\s*fixed/);
    expect(bar).toMatch(/inset-block-end:\s*0/);
    expect(bar).toMatch(/padding-block:\s*var\(--tx-app-shell-tab-bar-padding-top\) calc\(var\(--tx-app-shell-tab-bar-padding-bottom\) \+ env\(safe-area-inset-bottom/);
    expect(bar).toMatch(/border-block-start:\s*var\(--tx-app-shell-tab-bar-border-width\) solid var\(--tx-app-shell-tab-bar-border-color\)/);
  });

  /** 안 비우면 본문 맨 아래 줄이 탭바에 가려 누를 수 없다 */
  it("탭바가 서 있으면 셸 아래에 그 높이만큼 자리를 비운다", () => {
    const rule = css.match(/\.tx-app-shell\[data-tab-bar\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toMatch(/padding-block-end:\s*calc\(var\(--tx-app-shell-tab-bar-height\) \+ env\(safe-area-inset-bottom/);
    expect(rule).toMatch(/box-sizing:\s*border-box/);
  });

  it("위쪽 페이드는 눌림을 가로채지 않는다", () => {
    const fade = css.match(/\.tx-app-shell__tab-bar::before\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(fade).toMatch(/block-size:\s*var\(--tx-app-shell-tab-bar-fade\)/);
    expect(fade).toMatch(/pointer-events:\s*none/);
  });

  /**
   * 경계선은 **자리마다 끈다** — 머리 · 패널 · 푸터가 각자의 두께 토큰을 읽고, 셋 다 공통 토큰을 기본으로 따른다.
   * 공통 하나만 있을 때는 머리 아래 선만 끄면 패널 · 푸터 선도 같이 꺼졌다(usertics).
   */
  it("경계선 두께는 자리마다 토큰이고, 셋 다 공통 --tx-app-shell-border-width(1px)를 따른다", () => {
    const base = css.match(/\.tx-app-shell\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(base).toMatch(/--tx-app-shell-border-width:\s*1px;/);
    for (const slot of ["header", "panel", "footer"]) {
      expect(base, slot).toMatch(new RegExp(`--tx-app-shell-${slot}-border-width:\\s*var\\(--tx-app-shell-border-width\\);`));
    }

    // 같은 선택자가 여러 블록에 나뉘어 있다 — 전부 모아 본다
    const rule = (selector: string) => [...css.matchAll(new RegExp(`(?:^|[}\\s])${selector.replace(/[.]/g, "\\.")}\\s*\\{([^}]*)\\}`, "g"))].map((match) => match[1]).join("\n");
    expect(rule(".tx-app-shell__header")).toMatch(/border-block-end:\s*var\(--tx-app-shell-header-border-width\) solid/);
    expect(rule(".tx-app-shell__left")).toMatch(/border-inline-end:\s*var\(--tx-app-shell-panel-border-width\) solid/);
    expect(rule(".tx-app-shell__right")).toMatch(/border-inline-start:\s*var\(--tx-app-shell-panel-border-width\) solid/);
    expect(rule(".tx-app-shell__bottom")).toMatch(/border-block-start:\s*var\(--tx-app-shell-panel-border-width\) solid/);
    expect(rule(".tx-app-shell__footer")).toMatch(/border-block-start:\s*var\(--tx-app-shell-footer-border-width\) solid/);

    // 공통 토큰을 직접 읽는 선은 없다. 접기 스위치(단추 자신의 테두리)만 1px 그대로다
    const lines = [...css.matchAll(/(?<![\w-])border(?:-[a-z-]+)?:\s*([^;]*var\(--tx-app-shell-border-color\)[^;]*);/g)].map((match) => match[1]);
    expect(lines.filter((value) => value.startsWith("var(--tx-app-shell-border-width)"))).toEqual([]);
    expect(lines.filter((value) => !/^var\(--tx-app-shell-(header|panel|footer)-border-width\)/.test(value))).toEqual(["1px solid var(--tx-app-shell-border-color)"]);
  });

  /** 패널 하나만 끄려면 그 패널에 준 클래스에서 덮는다 — 기본값을 패널 자신에 선언하면 그 덮기가 안 먹는다 */
  it("자리별 두께의 기본값은 루트에만 선언한다 — 패널 · 머리에서 덮을 수 있게", () => {
    const declared = [...css.matchAll(/([^{}]+)\{[^}]*--tx-app-shell-(?:header|panel|footer)-border-width:/g)].map((match) => match[1].trim());
    expect(declared).toEqual([".tx-app-shell"]);
  });

  it("색을 하드코딩하지 않는다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  /** 안쪽 내용만 붙이면 패널 가운데의 접기 스위치가 긴 페이지에서 화면 밖으로 밀려난다. */
  it("패널 전체가 헤더 아래에 붙고 보이는 높이만 차지한다", () => {
    expect(css).toMatch(/\[data-panel-sticky\][^{]*__left[^{]*__right[^{]*\{[^}]*position:\s*sticky[^}]*inset-block-start:\s*var\(--tx-app-shell-panel-top\)[^}]*block-size:\s*calc\(100dvh - var\(--tx-app-shell-panel-top\)\)/);
  });

  it("붙는 자리는 헤더가 붙어 있을 때만 헤더 높이이고, 숨거나 같이 굴러가면 0 이다", () => {
    expect(css).toMatch(/\.tx-app-shell\s*\{[^}]*--tx-app-shell-panel-top:\s*0px/);
    expect(css).toMatch(/\.tx-app-shell\[data-sticky\]\s*\{[^}]*--tx-app-shell-panel-top:\s*var\(--tx-app-shell-header-height/);
    expect(css).toMatch(/\[data-sticky="hide"\]\[data-hidden\]\s*\{[^}]*--tx-app-shell-panel-top:\s*0px/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxAppShell/TxAppShell.css" layer(tx);');
  });

  /**
   * 자식을 뒤져 무엇이 헤더인지 찾으면 조건부 렌더나 `memo` 한 겹에 못 찾는다 —
   * `TxCard` 의 푸터가 원본에서 그랬다.
   */
  it("자식을 뒤지지 않는다", () => {
    expect(source).not.toMatch(/Children\./);
    expect(source).not.toMatch(/displayName/);
  });

  /**
   * `display: none` 으로 감추면 Tab 이 닿지 않아 있으나 마나다.
   *
   * 그리고 **화면 밖으로 밀어 감추지 않는다.** `position: fixed` + `translate: -100%` 로
   * 두었더니 **조상 중 하나가 `transform` 을 가지면 기준이 그쪽으로 바뀌어** 문서 한가운데에
   * 실제로 놓였다 — Storybook 문서 페이지에서 잡혔고 앱에서도 같은 일이 난다.
   * 자리를 잘라 감추고 기준은 셸이 쥔다.
   */
  it("건너뛰기 링크를 잘라 감추되 지우지 않는다", () => {
    const rule = css.match(/\.tx-app-shell__skip\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).not.toMatch(/display:\s*none/);
    expect(rule).toMatch(/clip-path:\s*inset\(50%\)/);

    // fixed 는 조상의 transform 에 흔들린다. 기준은 셸이 쥔다
    expect(rule).toMatch(/position:\s*absolute/);
    expect(rule).not.toMatch(/position:\s*fixed/);
    expect(css).toMatch(/\.tx-app-shell\s*\{[^}]*position:\s*relative/);

    expect(css).toMatch(/\.tx-app-shell__skip:focus\s*\{[^}]*clip-path:\s*none/);
  });

  /**
   * flex 자식의 기본 최소 크기는 내용이다. 그대로 두면 긴 표가 본문을 밀어내
   * 옆 패널까지 넘친다.
   */
  it("본문만 줄어들게 한다", () => {
    expect(css).toMatch(/\.tx-app-shell__main\s*\{[^}]*min-inline-size:\s*0/);
  });

  /**
   * 슬롯을 감싸는 자리의 여백 · 높이를 고정값으로 박으면 소비자가 끌 방법이
   * 내부 클래스를 덮어쓰는 것뿐이 된다. 전부 변수를 거친다.
   */
  it("슬롯을 감싸는 자리의 여백 · 높이는 변수로 연다", () => {
    for (const [part, props] of [
      ["bar", ["gap", "min-block-size", "padding"]],
      ["top", ["padding"]],
      ["main", ["padding"]]
    ] as const) {
      const rule = css.match(new RegExp(`\\.tx-app-shell__${part}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

      for (const prop of props) expect(rule, `${part} ${prop}`).toMatch(new RegExp(`(^|;|\\s)${prop}:\\s*var\\(--tx-app-shell-`));
      expect(rule, part).not.toMatch(/(^|;|\s)(padding(-inline|-block)?|gap|min-block-size):\s*(?!0;)[\d.]/);
    }

    expect(css).toMatch(/\.tx-app-shell\s*\{[^}]*--tx-app-shell-bar-min-height:\s*3\.5rem/);
    expect(css).toMatch(/\.tx-app-shell\s*\{[^}]*--tx-app-shell-bar-padding:\s*0 1rem/);
    expect(css).toMatch(/\.tx-app-shell\s*\{[^}]*--tx-app-shell-bar-gap:\s*0\.75rem/);
    expect(css).toMatch(/\.tx-app-shell\s*\{[^}]*--tx-app-shell-top-padding:\s*0 1rem/);
  });

  /** 좌우를 물리 방향으로 쓰면 RTL 에서 좌우가 뒤집히지 않는다. */
  it("좌우를 글 방향에 붙인다", () => {
    expect(css).not.toMatch(/^\s*(left|right):/m);
    expect(css).toMatch(/inset-inline-(start|end)/);
  });

  /**
   * 손잡이가 자리를 차지하면 크기 조절을 켜고 끌 때마다 슬롯 내용이 밀린다.
   */
  it("손잡이는 경계선 위에 겹친다", () => {
    expect(css).toMatch(/\.tx-app-shell__handle\s*\{[^}]*position:\s*absolute/);
    expect(css).toMatch(/\.tx-app-shell__handle\s*\{[^}]*touch-action:\s*none/);
  });

  /** 손잡이는 경계선 전체지만 눈에는 안 보인다. 끄는 자리라는 표시가 있어야 한다. */
  it("손잡이 가운데에 그립을 둔다", () => {
    expect(css).toMatch(/\.tx-app-shell__handle::after\s*\{[^}]*content:/);
    expect(css).toMatch(/\.tx-app-shell__handle--bottom::after\s*\{[^}]*inline-size:\s*2\.5rem/);
  });

  it("끄는 방향을 커서로 알린다", () => {
    expect(css).toMatch(/cursor:\s*col-resize/);
    expect(css).toMatch(/cursor:\s*row-resize/);
  });

  /** 접힌 패널의 경계선이 남으면 빈 줄 하나가 떠 있다. */
  it("접히면 경계선까지 지운다", () => {
    expect(css).toMatch(/\.tx-app-shell__right\[data-collapsed\]\s*\{[^}]*inline-size:\s*0/s);
    expect(css).toMatch(/\[data-collapsed\][^{]*\{[^}]*border-inline:\s*0/s);
    expect(css).toMatch(/\.tx-app-shell__bottom\[data-collapsed\]\s*\{[^}]*block-size:\s*0/);
  });

  /** 경계선에 얹는 탭이라 14px 이다. 그대로 두면 손가락이 닿는 자리가 너무 좁다. */
  it("스위치를 보이는 것보다 넓게 잡는다", () => {
    expect(css).toMatch(/\.tx-app-shell__toggle::before\s*\{[^}]*inset:\s*-/);
  });

  /**
   * 스위치는 경계선 **위에** 얹힌다. 패널이 넘치는 것을 직접 감추면 스위치가 같이
   * 잘려 나가 다시 펼 길이 없어진다 — 브라우저에서 눌러 보고서야 보였다.
   */
  it("패널이 스위치를 자르지 않는다", () => {
    const panel = css.match(/\.tx-app-shell__bottom\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(panel).not.toMatch(/overflow:\s*(auto|hidden|scroll)/);
    expect(css).toMatch(/\.tx-app-shell__pane\s*\{[^}]*overflow:\s*auto/);
    expect(css).toMatch(/\.tx-app-shell__toggle\s*\{[^}]*position:\s*absolute/);
  });

  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");
  });
});
