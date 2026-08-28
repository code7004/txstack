import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxTabs } from "./TxTabs";

/**
 * 원본은 `role="tablist"` 를 달아 놓고 **키보드 규약을 하나도 안 지켰다** —
 * 화살표로 못 옮겼고, 탭마다 탭 순서에 들어가 열 개면 Tab 을 열 번 눌러야 했고,
 * `aria-selected` 가 없어 어느 것이 골라졌는지 안 알렸고, 패널과 이어지지도 않았다.
 *
 * 그래서 여기서 가장 무겁게 보는 것이 **키보드와 이름표**다.
 */

afterEach(cleanup);

const TABS = [
  { label: "정보", content: "정보 본문" },
  { label: "기록", content: "기록 본문" },
  { label: "설정", content: "설정 본문" }
];

const tabButtons = () => screen.getAllByRole("tab");

describe("TxTabs — 고르기", () => {
  it("처음에는 첫 탭이 골라져 있다", () => {
    render(<TxTabs tabs={TABS} />);

    expect(tabButtons()[0].getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("정보 본문");
  });

  it("defaultValue 로 시작 위치를 정한다", () => {
    render(<TxTabs tabs={TABS} defaultValue={2} />);
    expect(screen.getByRole("tabpanel").textContent).toBe("설정 본문");
  });

  it("누르면 그 탭의 본문이 나온다", () => {
    const onChange = vi.fn();
    render(<TxTabs tabs={TABS} onChange={onChange} />);

    fireEvent.click(tabButtons()[1]);

    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole("tabpanel").textContent).toBe("기록 본문");
  });

  it("같은 탭을 다시 눌러도 콜백이 오지 않는다", () => {
    const onChange = vi.fn();
    render(<TxTabs tabs={TABS} onChange={onChange} />);

    fireEvent.click(tabButtons()[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  /**
   * 원본은 `value` 를 내부 state 로 복사하고 effect 로 맞췄다. 그래서 소비자가
   * `onChange` 를 받고 값을 안 바꿔도 화면이 멋대로 넘어갔다.
   */
  it("value 를 주면 값의 주인은 소비자다 — 콜백만 오고 화면은 그대로", () => {
    const onChange = vi.fn();
    render(<TxTabs tabs={TABS} value={0} onChange={onChange} />);

    fireEvent.click(tabButtons()[2]);

    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("tabpanel").textContent).toBe("정보 본문");
  });

  it("value 가 바뀌면 따라간다", () => {
    const { rerender } = render(<TxTabs tabs={TABS} value={0} />);
    rerender(<TxTabs tabs={TABS} value={2} />);

    expect(screen.getByRole("tabpanel").textContent).toBe("설정 본문");
  });
});

describe("TxTabs — 키보드", () => {
  /** 원본은 탭마다 탭 순서에 들어가서 열 개면 Tab 을 열 번 눌러야 지나갔다. */
  it("탭 줄 전체가 Tab 한 번이다 — 골라진 것만 탭 순서에 있다", () => {
    render(<TxTabs tabs={TABS} defaultValue={1} />);

    expect(tabButtons().map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("←→ 로 옮기면 그 자리에서 바로 전환된다", () => {
    const onChange = vi.fn();
    render(<TxTabs tabs={TABS} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });

    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole("tabpanel").textContent).toBe("기록 본문");
    expect(document.activeElement).toBe(tabButtons()[1]);
  });

  it("양 끝에서 감긴다", () => {
    render(<TxTabs tabs={TABS} />);
    const list = screen.getByRole("tablist");

    fireEvent.keyDown(list, { key: "ArrowLeft" });
    expect(screen.getByRole("tabpanel").textContent).toBe("설정 본문");

    fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(screen.getByRole("tabpanel").textContent).toBe("정보 본문");
  });

  it("Home·End 로 양 끝에 간다", () => {
    render(<TxTabs tabs={TABS} defaultValue={1} />);
    const list = screen.getByRole("tablist");

    fireEvent.keyDown(list, { key: "End" });
    expect(screen.getByRole("tabpanel").textContent).toBe("설정 본문");

    fireEvent.keyDown(list, { key: "Home" });
    expect(screen.getByRole("tabpanel").textContent).toBe("정보 본문");
  });

  it("다른 키는 가로채지 않는다", () => {
    render(<TxTabs tabs={TABS} />);

    const event = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
    screen.getByRole("tablist").dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});

describe("TxTabs — 비활성", () => {
  const WITH_DISABLED = [
    { label: "가", content: "가 본문" },
    { label: "나", content: "나 본문", disabled: true },
    { label: "다", content: "다 본문" }
  ];

  it("눌러도 안 골라진다", () => {
    const onChange = vi.fn();
    render(<TxTabs tabs={WITH_DISABLED} onChange={onChange} />);

    fireEvent.click(tabButtons()[1]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("화살표가 건너뛴다", () => {
    render(<TxTabs tabs={WITH_DISABLED} />);

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(screen.getByRole("tabpanel").textContent).toBe("다 본문");
  });

  it("End 는 비활성이 아닌 마지막으로 간다", () => {
    render(
      <TxTabs
        tabs={[
          { label: "가", content: "가 본문" },
          { label: "나", content: "나 본문" },
          { label: "다", content: "다 본문", disabled: true }
        ]}
      />
    );

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "End" });
    expect(screen.getByRole("tabpanel").textContent).toBe("나 본문");
  });
});

describe("TxTabs — 스크린리더", () => {
  it("골라진 탭을 aria-selected 로 알린다", () => {
    render(<TxTabs tabs={TABS} defaultValue={1} />);

    expect(tabButtons().map((tab) => tab.getAttribute("aria-selected"))).toEqual(["false", "true", "false"]);
  });

  /** 원본은 패널이 그냥 `<div>` 라 어느 탭의 내용인지 알 길이 없었다. */
  it("패널과 탭이 서로를 가리킨다", () => {
    render(<TxTabs tabs={TABS} defaultValue={2} />);

    const panel = screen.getByRole("tabpanel");
    const tab = tabButtons()[2];

    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
  });

  it("탭 줄에 이름을 줄 수 있다 — 한 화면에 탭이 여럿일 때", () => {
    render(<TxTabs tabs={TABS} aria-label="사용자 상세" />);
    expect(screen.getByRole("tablist").getAttribute("aria-label")).toBe("사용자 상세");
  });

  it("아이콘만 있는 탭에 이름을 줄 수 있다", () => {
    render(<TxTabs tabs={[{ label: <svg />, "aria-label": "설정" }, { label: "목록" }]} />);
    expect(screen.getByRole("tab", { name: "설정" })).toBeTruthy();
  });

  it("여러 개를 놓아도 id 가 겹치지 않는다", () => {
    render(
      <>
        <TxTabs tabs={TABS} />
        <TxTabs tabs={TABS} />
      </>
    );

    const ids = screen.getAllByRole("tabpanel").map((panel) => panel.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("TxTabs — 본문", () => {
  /**
   * 원본은 본문을 `renderBody` 로만 받았고, `tabData` 는 타입과 문서에만 있고
   * 구현이 꺼내 쓰지 않는 죽은 prop 이었다.
   */
  it("항목이 요소를 그대로 갖는다", () => {
    render(<TxTabs tabs={[{ label: "차트", content: <strong>여기는 요소다</strong> }]} />);
    expect(screen.getByText("여기는 요소다").tagName).toBe("STRONG");
  });

  /** 사이드바처럼 전환 스위치로만 쓰는 자리가 있다. */
  it("본문이 하나도 없으면 패널을 그리지 않는다", () => {
    render(<TxTabs tabs={[{ label: "Developer" }, { label: "Admin" }]} />);

    expect(screen.queryByRole("tabpanel")).toBeNull();
    expect(tabButtons()[0].hasAttribute("aria-controls")).toBe(false);
  });
});

describe("TxTabs — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxTabs.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxTabs/TxTabs.css" layer(tx);');
  });

  /**
   * 화면에 보이는 것과 스크린리더가 듣는 것이 같은 근거에서 나와야 둘이 어긋나지 않는다.
   * 클래스로 가르면 `aria-selected` 만 틀려도 아무도 모른다.
   */
  it("골라진 탭을 aria-selected 로 가른다 — 따로 클래스를 두지 않는다", () => {
    expect(css).toContain('.tx-tabs__tab[aria-selected="true"]');
    expect(css).not.toContain("tx-tabs__tab--active");
  });

  /**
   * `overflow-x` 를 주면 CSS 규칙상 세로도 `auto` 가 된다. 그래서 안쪽이 1px 만 넘쳐도
   * 세로 스크롤바가 생긴다 — 실제로 탭의 `margin-bottom: -1px` 때문에 그랬다.
   * 밑줄을 안쪽 그림자로 그려 넘침 자체를 없앴다.
   */
  it("탭 줄에 세로로 넘치는 것을 두지 않는다", () => {
    const list = css.match(/\.tx-tabs__list\s*\{([^}]*)\}/)?.[1] ?? "";
    const tab = css.match(/\.tx-tabs__tab\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(list).toContain("box-shadow: inset");
    expect(list).not.toContain("border-bottom");
    // 음수 마진이 되살아나면 1px 이 다시 넘친다
    expect(tab).not.toMatch(/margin-bottom:\s*-/);
  });

  /** 밑줄 자리에 스크롤바가 겹쳐 앉으면 굵은 회색 막대가 밑줄을 가린다. */
  it("탭 줄의 스크롤바를 감춘다", () => {
    expect(css).toContain("scrollbar-width: none");
    expect(css).toContain(".tx-tabs__list::-webkit-scrollbar");
  });

  /** 밑줄 자리를 늘 잡아 두지 않으면 고를 때마다 글자가 위아래로 밀린다. */
  it("고르지 않은 탭도 밑줄 자리를 잡는다", () => {
    expect(css).toContain("border-bottom: var(--tx-tabs-indicator) solid transparent");
  });
});
