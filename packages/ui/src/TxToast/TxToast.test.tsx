import { act, fireEvent, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TxToast } from "./TxToast";
import { resetForTest } from "./TxToast.store";

/**
 * `TxDialog` 와 같은 자리(React 바깥에서 부르는 명령형 API)지만 **다르게 두어야 하는 것**이
 * 셋 있다 — 여럿이 함께 쌓이고, 스스로 사라지고, 그 시계를 멈출 수 있어야 한다.
 *
 * 겉(갈래별 색·아이콘·스크린리더용 글자)은 `TxAlert` 의 테스트가 본다.
 */

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  act(() => resetForTest());
  vi.useRealTimers();
});

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const show = (input: Parameters<typeof TxToast.show>[0]) => {
  let id = 0;
  act(() => {
    id = TxToast.show(input);
  });
  return id;
};

const hostOf = () => document.querySelector('[data-tag="TxToast"]') as HTMLElement;
const itemsOf = () => [...document.querySelectorAll('[data-tag="TxToast.Item"]')];

describe("TxToast — 띄우기", () => {
  it("문구 하나만 줘도 뜬다", async () => {
    show("저장했습니다");
    expect(await screen.findByText("저장했습니다")).toBeTruthy();
  });

  it("옵션 객체로도 준다", async () => {
    show({ variant: "danger", title: "저장 실패", message: "잠시 뒤 다시 시도해 주세요" });

    expect(await screen.findByText("저장 실패")).toBeTruthy();
    expect(screen.getByText("잠시 뒤 다시 시도해 주세요")).toBeTruthy();
  });

  /** 확인창은 하나씩 차례로 뜨지만, 알림은 답을 받는 것이 아니라 함께 쌓인다. */
  it("여럿이 함께 쌓인다", async () => {
    show("하나");
    show("둘");
    show("셋");

    await screen.findByText("하나");
    expect(itemsOf()).toHaveLength(3);
  });

  it("번호를 돌려준다 — 그 번호로 닫는다", async () => {
    const id = show({ message: "연결이 끊겼습니다", duration: 0 });
    await screen.findByText("연결이 끊겼습니다");

    act(() => TxToast.dismiss(id));
    expect(screen.queryByText("연결이 끊겼습니다")).toBeNull();
  });

  it("없는 번호를 닫아도 조용하다", async () => {
    show("하나");
    await screen.findByText("하나");

    act(() => TxToast.dismiss(9999));
    expect(itemsOf()).toHaveLength(1);
  });

  it("전부 닫는다", async () => {
    show({ message: "하나", duration: 0 });
    show({ message: "둘", duration: 0 });
    await screen.findByText("하나");

    act(() => TxToast.dismissAll());
    expect(itemsOf()).toHaveLength(0);
  });

  it("닫기 버튼으로 닫는다", async () => {
    show({ message: "저장했습니다", duration: 0 });
    const close = await screen.findByRole("button", { name: "닫기" });

    act(() => close.click());
    expect(screen.queryByText("저장했습니다")).toBeNull();
  });
});

describe("TxToast — 스스로 사라진다", () => {
  it("기본 시간이 지나면 사라진다", async () => {
    show("저장했습니다");
    expect(await screen.findByText("저장했습니다")).toBeTruthy();

    await advance(4100);
    expect(screen.queryByText("저장했습니다")).toBeNull();
  });

  it("시간을 따로 줄 수 있다", async () => {
    show({ message: "잠깐만", duration: 1000 });
    await screen.findByText("잠깐만");

    await advance(1001);
    expect(screen.queryByText("잠깐만")).toBeNull();
  });

  /** 놓치면 안 되는 오류가 그 자리다. */
  it("0 이면 사라지지 않는다", async () => {
    show({ message: "연결이 끊겼습니다", duration: 0 });
    await screen.findByText("연결이 끊겼습니다");

    await advance(60_000);
    expect(screen.queryByText("연결이 끊겼습니다")).toBeTruthy();
  });

  it("각자 제 시계를 갖는다", async () => {
    show({ message: "빠른 것", duration: 1000 });
    show({ message: "느린 것", duration: 5000 });
    await screen.findByText("빠른 것");

    await advance(1001);
    expect(screen.queryByText("빠른 것")).toBeNull();
    expect(screen.queryByText("느린 것")).toBeTruthy();
  });
});

/**
 * 읽는 데 걸리는 시간은 사람마다 다르다. 시간이 정해진 것을 늘리거나 끌 길이 없으면
 * 못 읽고 놓친다 (WCAG 2.2.1).
 */
describe("TxToast — 시계를 멈출 수 있다", () => {
  it("마우스를 얹으면 멈춘다", async () => {
    show({ message: "읽는 중", duration: 2000 });
    const item = await screen.findByText("읽는 중");

    await advance(1000);
    act(() => void fireEvent.pointerEnter(itemsOf()[0]));

    await advance(10_000);
    expect(item.isConnected).toBe(true);
  });

  it("마우스를 떼면 다시 간다", async () => {
    show({ message: "읽는 중", duration: 2000 });
    await screen.findByText("읽는 중");

    act(() => void fireEvent.pointerEnter(itemsOf()[0]));
    await advance(10_000);

    act(() => void fireEvent.pointerLeave(itemsOf()[0]));
    await advance(2001);

    expect(screen.queryByText("읽는 중")).toBeNull();
  });

  /** 마우스만 보면 키보드 사용자는 멈출 방법이 없다. */
  it("키보드로 안에 들어와도 멈춘다", async () => {
    show({ message: "읽는 중", duration: 2000 });
    const close = await screen.findByRole("button", { name: "닫기" });

    act(() => close.focus());
    await advance(10_000);

    expect(screen.queryByText("읽는 중")).toBeTruthy();
  });

  /** 멈췄다 다시 갈 때 처음부터 세면 영영 안 사라진다. */
  it("멈춘 뒤에는 남은 시간만 센다", async () => {
    show({ message: "읽는 중", duration: 2000 });
    await screen.findByText("읽는 중");

    await advance(1500);
    act(() => void fireEvent.pointerEnter(itemsOf()[0]));
    await advance(10_000);
    act(() => void fireEvent.pointerLeave(itemsOf()[0]));

    // 남은 것은 500ms 뿐이다
    await advance(600);
    expect(screen.queryByText("읽는 중")).toBeNull();
  });
});

describe("TxToast — 설정", () => {
  it("자리를 바꾼다", async () => {
    act(() => TxToast.configure({ position: "bottom-center" }));
    show("아래 가운데");
    await screen.findByText("아래 가운데");

    expect(hostOf().dataset.position).toBe("bottom-center");
  });

  it("기본은 오른쪽 위다", async () => {
    show("어디에");
    await screen.findByText("어디에");

    expect(hostOf().dataset.position).toBe("top-right");
  });

  it("기본 시간을 바꾼다", async () => {
    act(() => TxToast.configure({ duration: 1000 }));
    show("짧게");
    await screen.findByText("짧게");

    await advance(1001);
    expect(screen.queryByText("짧게")).toBeNull();
  });

  it("따로 준 시간이 기본값을 이긴다", async () => {
    act(() => TxToast.configure({ duration: 1000 }));
    show({ message: "길게", duration: 5000 });
    await screen.findByText("길게");

    await advance(1001);
    expect(screen.queryByText("길게")).toBeTruthy();
  });

  /** 화면이 알림으로 덮이면 정작 새로 온 것을 못 본다. */
  it("max 를 넘으면 가장 오래된 것부터 사라진다", async () => {
    act(() => TxToast.configure({ max: 2 }));
    show({ message: "하나", duration: 0 });
    show({ message: "둘", duration: 0 });
    show({ message: "셋", duration: 0 });
    await screen.findByText("셋");

    expect(screen.queryByText("하나")).toBeNull();
    expect(screen.queryByText("둘")).toBeTruthy();
    expect(itemsOf()).toHaveLength(2);
  });
});

describe("TxToast — 스크린리더", () => {
  /** 떴다 사라지는 것이라 나타나는 순간 읽혀야 한다. */
  it("나타나는 순간 읽힌다", async () => {
    show("저장했습니다");
    await screen.findByText("저장했습니다");

    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("오류는 하던 말을 끊고 즉시 읽힌다", async () => {
    show({ variant: "danger", message: "저장 실패", duration: 0 });
    await screen.findByText("저장 실패");

    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("갈래를 글자로도 알린다", async () => {
    show({ variant: "success", message: "저장했습니다", duration: 0 });
    await screen.findByText("저장했습니다");

    expect(screen.getByText("완료:")).toBeTruthy();
  });

  it("닫기 버튼의 이름을 바꿀 수 있다", async () => {
    show({ message: "내용", duration: 0, closeLabel: "Dismiss" });
    expect(await screen.findByRole("button", { name: "Dismiss" })).toBeTruthy();
  });
});

/**
 * `TxModal` 은 네이티브 `<dialog>` 라 top layer 에 있다. 거기는 `z-index` 로 닿을 수 없어서,
 * 모달 위에 알림을 띄우려면 **같은 층**을 써야 한다.
 */
describe("TxToast — 모달 위에 뜬다", () => {
  const supports = "popover" in HTMLElement.prototype;

  /** 바깥을 눌렀다고 알림이 사라지면 안 되므로 `auto` 가 아니라 `manual` 이다. */
  it.skipIf(!supports)("아는 브라우저에서는 통이 manual popover 다", async () => {
    show("내용");
    await screen.findByText("내용");

    expect(hostOf().getAttribute("popover")).toBe("manual");
  });

  /**
   * 속성만 달고 API 가 없으면 UA 스타일이 통을 숨겨 두는데 열 방법이 없어 **영영 안 보인다.**
   * jsdom 이 정확히 그 상태라, 이 테스트가 그 환경에서 도는 것 자체가 검증이다.
   */
  it.skipIf(supports)("모르는 브라우저에서는 속성을 달지 않는다 — 알림이 보여야 한다", async () => {
    show("내용");

    expect(await screen.findByText("내용")).toBeTruthy();
    expect(hostOf().hasAttribute("popover")).toBe(false);
    expect(screen.getByRole("button", { name: "닫기" })).toBeTruthy();
  });
});

describe("TxToast — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxToast.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxToast/TxToast.css" layer(tx);');
  });

  /** 겉은 TxAlert 이 그린다. 같은 것을 두 곳이 정하면 한쪽만 안 따라온다. */
  it("알림의 겉모습을 다시 정하지 않는다", () => {
    expect(css).not.toContain("--tx-alert-");
    expect(css).not.toMatch(/\.tx-alert\b/);
  });

  /** popover 는 top layer 라 통이 화면을 덮으면 그 아래가 통째로 안 눌린다. */
  it("통은 클릭을 받지 않고 알림만 받는다", () => {
    const box = css.match(/\.tx-toast\s*\{([^}]*)\}/)?.[1] ?? "";
    const item = css.match(/\.tx-toast__item\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(box).toMatch(/pointer-events:\s*none/);
    expect(item).toMatch(/pointer-events:\s*auto/);
  });

  /**
   * 통을 그냥 `display: flex` 로 두면 작성자 스타일이 UA 의 `[popover] { display: none }` 을
   * 이겨서 빈 통이 늘 top layer 에 남는다. 반대로 무조건 숨기면 popover 를 모르는 환경에서
   * 영영 안 보인다. **속성이 있을 때만** 숨겨야 둘 다 맞는다.
   */
  it("popover 일 때만 숨긴다 — 모르는 환경에서 영영 안 보이면 안 된다", () => {
    expect(css).toMatch(/\.tx-toast\[popover\]:not\(:popover-open\)\s*\{[^}]*display:\s*none/);
    expect(css).not.toMatch(/^\.tx-toast:not\(:popover-open\)/m);
    expect(css).toMatch(/--tx-toast-z:/);
  });

  /**
   * `[popover]` 의 UA 스타일은 `inset: 0` 을 준다. 붙일 변만 얹으면 반대쪽 UA 값이
   * 살아남아 **과잉 제약**이 되고, 오른쪽에 띄우라고 했는데 왼쪽에 뜬다.
   * `<dialog>` 를 쓰는 `TxSlidePanel` 이 같은 자리를 지나갔다.
   */
  it("네 변을 전부 정한다 — UA 의 inset 이 살아남지 않는다", () => {
    const rule = (selector: string) => css.match(new RegExp(`\\.tx-toast\\[data-position\\${selector}\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";

    for (const [side, opposite, selector] of [
      ["top", "bottom", '^="top"'],
      ["bottom", "top", '^="bottom"'],
      ["left", "right", '$="left"'],
      ["right", "left", '$="right"']
    ] as const) {
      expect(rule(selector), side).toMatch(new RegExp(`${side}:\\s*var\\(`));
      expect(rule(selector), `${side} 의 반대편 ${opposite}`).toMatch(new RegExp(`${opposite}:\\s*auto`));
    }

    // 가운데도 왼쪽만 잡고 오른쪽을 놓아야 한다
    expect(rule('$="center"')).toMatch(/right:\s*auto/);
  });

  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");
  });
});
