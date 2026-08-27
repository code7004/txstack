import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxDropdown } from "./TxDropdown";
import { TxDropdownMulti } from "./TxDropdownMulti";

/**
 * 원본에서 고친 것 중 무거운 둘은 **키보드로 빠져나갈 수 없던 것**과
 * **목록이 조상에 잘리던 것**이다. 그 둘을 여러 각도에서 못 박는다.
 */

afterEach(cleanup);

const head = () => screen.getByRole("combobox");
const options = () => screen.queryAllByRole("option");
const list = () => screen.queryByRole("listbox");
const open = () => fireEvent.click(head());

describe("TxDropdown — 여닫기", () => {
  it("처음에는 닫혀 있고 자리표시 글자를 보여 준다", () => {
    render(<TxDropdown data={["서울", "부산"]} />);

    expect(list()).toBeNull();
    expect(head().textContent).toContain("선택");
    expect(head().getAttribute("aria-expanded")).toBe("false");
  });

  it("눌러서 열고 다시 눌러서 닫는다", () => {
    render(<TxDropdown data={["서울", "부산"]} />);

    open();
    expect(options()).toHaveLength(2);
    expect(head().getAttribute("aria-expanded")).toBe("true");

    open();
    expect(list()).toBeNull();
  });

  it("고르면 닫히고 헤더가 바뀐다", () => {
    render(<TxDropdown data={["서울", "부산"]} />);

    open();
    fireEvent.click(options()[1]);

    expect(list()).toBeNull();
    expect(head().textContent).toContain("부산");
  });

  /** 원본은 목록을 `absolute` 로 띄워 `overflow: hidden` 조상 안에서 잘렸다. */
  it("목록을 body 로 띄운다 — 조상에 갇히지 않는다", () => {
    const { container } = render(
      <div style={{ overflow: "hidden" }}>
        <TxDropdown data={["서울"]} />
      </div>
    );

    open();
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    expect(document.body.querySelector('[data-tag="TxPopup"] [role="option"]')).not.toBeNull();
  });

  it("바깥을 누르면 닫힌다", () => {
    render(<TxDropdown data={["서울"]} />);

    open();
    fireEvent.pointerDown(document.body);
    expect(list()).toBeNull();
  });

  /** 중간에서 stopPropagation 하는 코드가 있어도 닫혀야 한다. 그래서 캡처 단계에서 듣는다. */
  it("중간에서 전파를 끊어도 바깥 클릭이 닫는다", () => {
    render(
      <div onPointerDownCapture={(e) => e.stopPropagation()}>
        <TxDropdown data={["서울"]} />
        <button data-outside>바깥</button>
      </div>
    );

    open();
    fireEvent.pointerDown(document.querySelector("[data-outside]")!);
    expect(list()).toBeNull();
  });

  it("disabled 면 열리지 않는다", () => {
    render(<TxDropdown data={["서울"]} disabled />);

    open();
    expect(list()).toBeNull();
    expect(head().getAttribute("aria-disabled")).toBe("true");
    expect(head().tabIndex).toBe(-1);
  });
});

describe("TxDropdown — 키보드", () => {
  it("Enter·Space·ArrowDown 으로 연다", () => {
    for (const key of ["Enter", " ", "ArrowDown"]) {
      render(<TxDropdown data={["서울"]} />);
      fireEvent.keyDown(head(), { key });
      expect(list()).not.toBeNull();
      cleanup();
    }
  });

  /**
   * 원본은 Tab 을 가로채 다음 항목으로 이동시켰다. 열린 드롭다운에서 빠져나갈 수 없는
   * 키보드 트랩이었다.
   */
  it("Tab 을 가로채지 않는다 — 닫히고 다음 요소로 나간다", () => {
    render(<TxDropdown data={["서울", "부산"]} />);

    open();
    const evt = fireEvent.keyDown(head(), { key: "Tab" });

    expect(list()).toBeNull();
    // preventDefault 를 하지 않았다는 뜻이다. 했다면 fireEvent 가 false 를 준다.
    expect(evt).toBe(true);
  });

  /** 줄이 100개면 탭 순서에 100개가 들어간다. 포커스는 헤더 하나만 갖는다. */
  it("목록 줄을 탭 순서에 넣지 않는다", () => {
    render(<TxDropdown data={["서울", "부산", "대구"]} />);

    open();
    expect(options().every((el) => !el.hasAttribute("tabindex"))).toBe(true);
  });

  /** 하이라이트만 있고 이게 없으면 스크린리더는 어느 줄이 활성인지 모른다. */
  it("aria-activedescendant 로 짚은 줄을 가리킨다", () => {
    render(<TxDropdown data={["서울", "부산"]} />);

    fireEvent.keyDown(head(), { key: "ArrowDown" });
    expect(head().getAttribute("aria-activedescendant")).toBe(options()[0].id);

    fireEvent.keyDown(head(), { key: "ArrowDown" });
    expect(head().getAttribute("aria-activedescendant")).toBe(options()[1].id);
  });

  it("끝에서 다시 처음으로 돈다", () => {
    render(<TxDropdown data={["서울", "부산"]} />);

    fireEvent.keyDown(head(), { key: "ArrowDown" });
    fireEvent.keyDown(head(), { key: "ArrowDown" });
    fireEvent.keyDown(head(), { key: "ArrowDown" });
    expect(head().getAttribute("aria-activedescendant")).toBe(options()[0].id);

    fireEvent.keyDown(head(), { key: "ArrowUp" });
    expect(head().getAttribute("aria-activedescendant")).toBe(options()[1].id);
  });

  it("Home·End 로 처음과 끝으로 간다", () => {
    render(<TxDropdown data={["서울", "부산", "대구"]} />);

    open();
    fireEvent.keyDown(head(), { key: "End" });
    expect(head().getAttribute("aria-activedescendant")).toBe(options()[2].id);

    fireEvent.keyDown(head(), { key: "Home" });
    expect(head().getAttribute("aria-activedescendant")).toBe(options()[0].id);
  });

  it("Enter 로 짚은 줄을 고른다", () => {
    const onChangeText = vi.fn();
    render(<TxDropdown data={["서울", "부산"]} onChangeText={onChangeText} />);

    fireEvent.keyDown(head(), { key: "ArrowDown" });
    fireEvent.keyDown(head(), { key: "ArrowDown" });
    fireEvent.keyDown(head(), { key: "Enter" });

    expect(onChangeText).toHaveBeenCalledWith("부산");
    expect(list()).toBeNull();
  });

  it("Escape 로 닫는다", () => {
    render(<TxDropdown data={["서울"]} />);

    open();
    fireEvent.keyDown(head(), { key: "Escape" });
    expect(list()).toBeNull();
  });
});

describe("TxDropdown — 값", () => {
  it("data 에서 값 타입을 추론해 그 콜백만 부른다", () => {
    const onChangeText = vi.fn();
    const onChangeNumber = vi.fn();
    render(<TxDropdown data={[1, 2, 3]} onChangeText={onChangeText} onChangeNumber={onChangeNumber} />);

    open();
    fireEvent.click(options()[1]);

    expect(onChangeNumber).toHaveBeenCalledWith(2);
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it("객체 배열은 name 을 보여 주고 value 를 준다", () => {
    const onChangeNumber = vi.fn();
    render(
      <TxDropdown
        data={[
          { name: "서울", value: 1 },
          { name: "부산", value: 2 }
        ]}
        onChangeNumber={onChangeNumber}
      />
    );

    open();
    expect(options()[0].textContent).toContain("서울");

    fireEvent.click(options()[1]);
    expect(onChangeNumber).toHaveBeenCalledWith(2);
    expect(head().textContent).toContain("부산");
  });

  it("onChangeValue 는 줄 전체를 준다", () => {
    const onChangeValue = vi.fn();
    render(<TxDropdown data={[{ name: "서울", value: 1 }]} onChangeValue={onChangeValue} />);

    open();
    fireEvent.click(options()[0]);
    expect(onChangeValue).toHaveBeenCalledWith({ name: "서울", value: 1 });
  });

  it("controlled 는 value 가 주인이다", () => {
    const { rerender } = render(<TxDropdown data={["서울", "부산"]} value="서울" />);
    expect(head().textContent).toContain("서울");

    open();
    fireEvent.click(options()[1]);
    // 소비자가 value 를 안 바꿨으니 그대로다
    expect(head().textContent).toContain("서울");

    rerender(<TxDropdown data={["서울", "부산"]} value="부산" />);
    expect(head().textContent).toContain("부산");
  });

  it("addNoChoiceItem 은 맨 위에 선택 안 함을 넣는다", () => {
    const onChangeText = vi.fn();
    render(<TxDropdown data={["서울"]} addNoChoiceItem onChangeText={onChangeText} />);

    open();
    expect(options()).toHaveLength(2);
    expect(options()[0].textContent).toContain("선택 안 함");

    fireEvent.click(options()[0]);
    expect(onChangeText).toHaveBeenCalledWith(undefined);
  });

  it("fixedHead 는 고른 값과 무관하게 늘 보인다", () => {
    render(<TxDropdown data={["서울"]} fixedHead="지역" />);

    open();
    fireEvent.click(options()[0]);
    expect(head().textContent).toContain("지역");
  });

  it("locale 로 목록 글자를 번역한다", () => {
    render(<TxDropdown data={["seoul"]} locale={(t) => (t === "seoul" ? "서울" : t)} />);

    open();
    expect(options()[0].textContent).toContain("서울");
  });
});

describe("TxDropdownMulti", () => {
  it("여러 개를 골라도 닫히지 않는다", () => {
    const onChangeText = vi.fn();
    render(<TxDropdownMulti data={["서울", "부산", "대구"]} onChangeText={onChangeText} />);

    // 0번은 "전체 선택" 줄이다. 값 줄은 1번부터다.
    open();
    fireEvent.click(options()[1]);
    fireEvent.click(options()[2]);

    expect(list()).not.toBeNull();
    expect(onChangeText).toHaveBeenLastCalledWith(["서울", "부산"]);
  });

  /** 원본은 200ms 디바운스가 모든 클릭에 걸려 빠르게 여러 개를 고를 수 없었다. */
  it("연달아 눌러도 전부 반영된다", () => {
    const onChangeText = vi.fn();
    render(<TxDropdownMulti data={["가", "나", "다"]} onChangeText={onChangeText} />);

    open();
    options()
      .slice(1)
      .forEach((el) => fireEvent.click(el));

    expect(onChangeText).toHaveBeenLastCalledWith(["가", "나", "다"]);
    expect(onChangeText).toHaveBeenCalledTimes(3);
  });

  it("다시 누르면 풀린다", () => {
    const onChangeText = vi.fn();
    render(<TxDropdownMulti data={["서울", "부산"]} onChangeText={onChangeText} />);

    open();
    fireEvent.click(options()[1]);
    expect(onChangeText).toHaveBeenLastCalledWith(["서울"]);

    fireEvent.click(options()[1]);
    expect(onChangeText).toHaveBeenLastCalledWith([]);
  });

  it("전체 선택 줄이 맨 위에 있고 전부 골랐다 푼다", () => {
    const onChangeText = vi.fn();
    render(<TxDropdownMulti data={["서울", "부산"]} onChangeText={onChangeText} />);

    open();
    const all = options()[0];
    expect(all.textContent).toContain("전체 선택");

    fireEvent.click(all);
    expect(onChangeText).toHaveBeenLastCalledWith(["서울", "부산"]);

    fireEvent.click(options()[0]);
    expect(onChangeText).toHaveBeenLastCalledWith([]);
  });

  it("헤더에 고른 개수가 나온다", () => {
    render(<TxDropdownMulti data={["서울", "부산"]} />);

    open();
    fireEvent.click(options()[1]);
    expect(head().textContent).toContain("선택 1");

    fireEvent.click(options()[2]);
    expect(head().textContent).toContain("전체 2");
  });

  it("defaultAllChecked 는 처음부터 전부 골라 둔다", () => {
    render(<TxDropdownMulti data={["서울", "부산"]} defaultAllChecked />);
    expect(head().textContent).toContain("전체 2");
  });

  it("여러 개 고를 수 있다고 알린다", () => {
    render(<TxDropdownMulti data={["서울"]} />);

    open();
    expect(list()!.getAttribute("aria-multiselectable")).toBe("true");
  });
});

describe("TxDropdownMulti — 확인 버튼", () => {
  it("onSubmit* 을 주면 버튼이 생기고 onChange* 는 안 온다", () => {
    const onChangeText = vi.fn();
    const onSubmitText = vi.fn();
    render(<TxDropdownMulti data={["서울", "부산"]} onChangeText={onChangeText} onSubmitText={onSubmitText} />);

    open();
    fireEvent.click(options()[1]);
    fireEvent.click(options()[2]);

    expect(onChangeText).not.toHaveBeenCalled();
    expect(onSubmitText).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(onSubmitText).toHaveBeenCalledWith(["서울", "부산"]);
  });

  it("확인을 누르면 닫히고 고른 값이 남는다", () => {
    render(<TxDropdownMulti data={["서울", "부산"]} onSubmitText={() => {}} />);

    open();
    fireEvent.click(options()[1]);
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(list()).toBeNull();
    expect(head().textContent).toContain("선택 1");
  });

  it("확인하지 않고 닫으면 되돌아간다", () => {
    const onSubmitText = vi.fn();
    render(<TxDropdownMulti data={["서울", "부산"]} onSubmitText={onSubmitText} />);

    open();
    fireEvent.click(options()[1]);
    expect(head().textContent).toContain("선택 1");

    fireEvent.keyDown(head(), { key: "Escape" });
    expect(head().textContent).toContain("선택");
    expect(head().textContent).not.toContain("선택 1");
    expect(onSubmitText).not.toHaveBeenCalled();
  });

  it("확인 버튼 글자를 바꾼다", () => {
    render(<TxDropdownMulti data={["서울"]} onSubmitText={() => {}} submitLabel="적용" />);

    open();
    expect(screen.getByRole("button", { name: "적용" })).not.toBeNull();
  });
});

describe("TxDropdown — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxDropdown.css"), "utf8"));
  const popup = strip(readFileSync(join(here, "..", "TxPopup", "TxPopup.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  const both = css + popup;

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    // 그림자의 rgb(0 0 0 / n%) 는 색이 아니라 불투명도라 예외로 둔다.
    expect(both.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\((?!0 0 0)[^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 컴포넌트가 갖지 않는다", () => {
    expect(both).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...both.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((m) => m[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  /** 폼 안에 입력창과 나란히 놓았을 때 높이가 어긋나면 안 된다. */
  it("높이를 TxInput 토큰에서 받는다", () => {
    expect(css).toMatch(/--tx-dropdown-height:\s*var\(--tx-input-height/);
  });

  /** 쌓임 순서를 매직넘버로 박으면 소비자가 모달 위에 띄울 방법이 없다. */
  it("팝업의 쌓임 순서가 토큰으로 나가 있다", () => {
    expect(popup).toMatch(/--tx-popup-z:/);
    expect(popup).toMatch(/z-index:\s*var\(--tx-popup-z\)/);
  });

  it("마우스와 키보드가 같은 표시를 쓴다", () => {
    expect(css).toContain(".tx-dropdown__item[data-active]");
    expect(css).not.toContain(":hover]");
  });

  /** 목록·항목·체크·확인 버튼은 전부 팝업 안에 있다. */
  const POPUP_SIDE = /__(list|item|check|divider|submit)/;

  /**
   * 팝업은 `document.body` 로 포털되므로 앵커의 자손이 아니다. CSS 변수는 DOM 을 따라
   * 상속되니 **앵커에 선언한 값은 팝업에 닿지 않는다** — 값이 통째로 사라져 칸 폭이 0 이 되거나
   * 색이 안 칠해진다. jsdom 에는 CSS 가 없어 렌더 결과로는 안 보인다.
   */
  it("팝업 안에서 쓰는 토큰을 앵커가 아니라 팝업에 선언한다", () => {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }));

    // 앵커 쪽 규칙에서만 선언된 토큰
    const declaredOnAnchor = new Set<string>();
    const declaredOnPopup = new Set<string>();

    for (const rule of rules) {
      const names = [...rule.body.matchAll(/(--tx-dropdown-[\w-]*)\s*:/g)].map((m) => m[1]);
      const target = rule.selector.includes("__list") ? declaredOnPopup : rule.selector.includes(".tx-dropdown") ? declaredOnAnchor : null;
      names.forEach((name) => target?.add(name));
    }

    // 팝업 안쪽 규칙에서 쓰이는 토큰
    const usedInPopup = new Set<string>();
    for (const rule of rules) {
      if (!POPUP_SIDE.test(rule.selector)) continue;
      [...rule.body.matchAll(/var\(\s*(--tx-dropdown-[\w-]*)/g)].forEach((m) => usedInPopup.add(m[1]));
    }

    const unreachable = [...usedInPopup].filter((name) => !declaredOnPopup.has(name) && declaredOnAnchor.has(name));
    expect(unreachable, "앵커에만 선언돼 팝업에 닿지 않는 토큰").toEqual([]);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxDropdown/TxDropdown.css" layer(tx);');
    expect(styles).toContain('@import "./TxPopup/TxPopup.css" layer(tx);');
  });
});
