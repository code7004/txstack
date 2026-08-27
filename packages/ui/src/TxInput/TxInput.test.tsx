import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxInput } from "./TxInput";
import type { TxInputRef, TxSearchInputRef } from "./TxInput.types";
import { TxInputLike } from "./TxInputLike";
import { TxSearchInput } from "./TxSearchInput";

/**
 * 이 컴포넌트에서 고친 결함은 대부분 **렌더 결과로 안 보이는 것들**이었다 —
 * SVG 에 걸린 onClick(키보드로 도달 불가), 스프레드로 복사돼 stale 이 되던 ref,
 * 값과 어긋나던 `showClear` 상태. 그래서 그 지점들을 하나씩 못 박는다.
 *
 * 아래쪽 "CSS 계약" 블록은 `.css` 를 **텍스트로 읽는다.** jsdom 에는 스타일시트가 없어
 * 캐스케이드가 되살아나도 렌더 결과로는 보이지 않는다. 실제 모양은 Storybook 에서 사람이 본다.
 */

afterEach(cleanup);

const input = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const el = container.querySelector<HTMLInputElement>(".tx-input__field");
  if (!el) throw new Error("TxInput 이 input 을 렌더하지 않았다");
  return el;
};

describe("TxInput — 값", () => {
  it("defaultValue 로 시작한다 (uncontrolled)", () => {
    expect(input(<TxInput defaultValue="kim" />).value).toBe("kim");
  });

  it("value 를 주면 그 값이 이긴다 (controlled)", () => {
    expect(input(<TxInput value="lee" onChange={() => {}} />).value).toBe("lee");
  });

  it("controlled 면 타이핑해도 value 가 주인이다", () => {
    const el = input(<TxInput value="lee" onChange={() => {}} />);

    fireEvent.change(el, { target: { value: "park" } });
    expect(el.value).toBe("lee");
  });
});

describe("TxInput — 콜백", () => {
  it("onChangeText 와 onChange 를 함께 부른다", () => {
    const onChange = vi.fn();
    const onChangeText = vi.fn();

    fireEvent.change(input(<TxInput onChange={onChange} onChangeText={onChangeText} />), { target: { value: "abc" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith("abc");
  });

  it("onChangeNumber 는 숫자로 읽어 준다", () => {
    const onChangeNumber = vi.fn();

    fireEvent.change(input(<TxInput onChangeNumber={onChangeNumber} />), { target: { value: "42" } });
    expect(onChangeNumber).toHaveBeenCalledWith(42);
  });

  /**
   * 원본은 숫자로 읽히는 동안에만 불렀다. 그래서 사용자가 값을 지우면 콜백이 안 와서
   * 소비자 상태에 옛 숫자가 남았다.
   */
  it("숫자로 못 읽으면 undefined 를 준다 — 부르지 않고 넘어가지 않는다", () => {
    const onChangeNumber = vi.fn();
    const el = input(<TxInput onChangeNumber={onChangeNumber} />);

    fireEvent.change(el, { target: { value: "42" } });
    fireEvent.change(el, { target: { value: "" } });

    expect(onChangeNumber).toHaveBeenLastCalledWith(undefined);
  });

  it("Enter 로 onSubmitText·onSubmitNumber 를 부른다", () => {
    const onSubmitText = vi.fn();
    const onSubmitNumber = vi.fn();
    const el = input(<TxInput defaultValue="7" onSubmitText={onSubmitText} onSubmitNumber={onSubmitNumber} />);

    fireEvent.keyDown(el, { key: "Enter" });

    expect(onSubmitText).toHaveBeenCalledWith("7");
    expect(onSubmitNumber).toHaveBeenCalledWith(7);
  });

  it("Enter 가 아닌 키는 제출하지 않는다", () => {
    const onSubmitText = vi.fn();

    fireEvent.keyDown(input(<TxInput onSubmitText={onSubmitText} />), { key: "a" });
    expect(onSubmitText).not.toHaveBeenCalled();
  });

  it("onEnter 가 onSubmit 계열보다 먼저 불린다", () => {
    const order: string[] = [];
    const el = input(<TxInput onEnter={() => order.push("enter")} onSubmitText={() => order.push("submit")} />);

    fireEvent.keyDown(el, { key: "Enter" });
    expect(order).toEqual(["enter", "submit"]);
  });

  it("blur 에서 onBlur 와 onBlurNumber 를 함께 부른다", () => {
    const onBlur = vi.fn();
    const onBlurNumber = vi.fn();

    fireEvent.blur(input(<TxInput defaultValue="3.5" onBlur={onBlur} onBlurNumber={onBlurNumber} />));

    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onBlurNumber).toHaveBeenCalledWith(3.5);
  });
});

describe("TxInput — ref", () => {
  /**
   * 원본은 `getValue` 가 렌더 시점의 값을 클로저로 잡았다. `TxSearchInput` 이 그 객체를
   * 스프레드로 복사해 쓰면서 사본이 옛 값을 들고 있었다. DOM 에서 읽으면 그 문제가 없다.
   */
  it("getValue 는 타이핑 직후의 값을 준다 — stale 하지 않다", () => {
    const ref = createRef<TxInputRef>();
    const { container } = render(<TxInput ref={ref} />);

    fireEvent.change(container.querySelector(".tx-input__field")!, { target: { value: "새 값" } });
    expect(ref.current?.getValue()).toBe("새 값");
  });

  it("setValue 는 uncontrolled 에서 값을 바꾼다", () => {
    const ref = createRef<TxInputRef>();
    const { container } = render(<TxInput ref={ref} />);

    act(() => ref.current?.setValue("바깥에서"));
    expect(container.querySelector<HTMLInputElement>(".tx-input__field")!.value).toBe("바깥에서");
  });

  it("setValue 는 controlled 에서 값을 바꾸지 않는다 — 주인은 소비자다", () => {
    const ref = createRef<TxInputRef>();
    const { container } = render(<TxInput ref={ref} value="고정" onChange={() => {}} />);

    act(() => ref.current?.setValue("무시된다"));
    expect(container.querySelector<HTMLInputElement>(".tx-input__field")!.value).toBe("고정");
  });

  it("focus·select 를 위임한다", () => {
    const ref = createRef<TxInputRef>();
    const { container } = render(<TxInput ref={ref} defaultValue="abc" />);
    const el = container.querySelector<HTMLInputElement>(".tx-input__field")!;

    ref.current?.focus();
    expect(document.activeElement).toBe(el);

    ref.current?.select();
    expect(el.selectionEnd).toBe(3);
  });

  it("focusOnMount 는 마운트 시 포커스한다", () => {
    const { container } = render(<TxInput focusOnMount />);
    expect(document.activeElement).toBe(container.querySelector(".tx-input__field"));
  });
});

describe("TxInput — 구조와 계약", () => {
  it("data-tag 를 붙인다", () => {
    const { container } = render(<TxInput />);
    expect(container.querySelector('[data-tag="TxInput"]')).not.toBeNull();
  });

  it("className 은 기본 클래스를 교체하지 않고 덧붙는다", () => {
    const { container } = render(<TxInput className="w-64" />);
    const el = container.querySelector('[data-tag="TxInput"]')!;

    expect(el.classList.contains("tx-input")).toBe(true);
    expect(el.classList.contains("w-64")).toBe(true);
  });

  it("readOnly·disabled 가 값 없는 속성으로 나간다", () => {
    const { container: ro } = render(<TxInput readOnly />);
    expect(ro.querySelector('[data-tag="TxInput"]')!.getAttribute("data-readonly")).toBe("");

    const { container: dis } = render(<TxInput disabled />);
    expect(dis.querySelector('[data-tag="TxInput"]')!.getAttribute("data-disabled")).toBe("");
  });

  it("InputHTMLAttributes 를 그대로 통과시킨다", () => {
    const el = input(<TxInput type="password" placeholder="비밀번호" maxLength={8} autoComplete="new-password" />);

    expect(el.type).toBe("password");
    expect(el.placeholder).toBe("비밀번호");
    expect(el.maxLength).toBe(8);
    expect(el.autocomplete).toBe("new-password");
  });

  it("id 는 id → name → 자동생성 순으로 정해진다", () => {
    expect(input(<TxInput id="a" name="b" />).id).toBe("a");
    expect(input(<TxInput name="b" />).id).toBe("b");
    expect(input(<TxInput />).id).toBeTruthy();
  });

  it("file 타입에는 value 를 넣지 않는다 — 브라우저가 거부한다", () => {
    expect(input(<TxInput type="file" />).getAttribute("value")).toBeNull();
  });
});

describe("TxSearchInput", () => {
  const buttons = (container: HTMLElement) => [...container.querySelectorAll("button")];

  /** 원본은 SVG 에 onClick 을 걸어서 키보드로 도달할 수 없었다. */
  it("돋보기와 지우기가 진짜 button 이다", () => {
    const { container } = render(<TxSearchInput defaultValue="kim" onClear={() => {}} />);
    const btns = buttons(container);

    expect(btns).toHaveLength(2);
    expect(btns.every((b) => b.type === "button")).toBe(true);
    expect(btns.map((b) => b.getAttribute("aria-label"))).toEqual(["검색", "검색어 지우기"]);
  });

  it("값이 없으면 지우기 버튼이 없다", () => {
    const { container } = render(<TxSearchInput />);
    expect(buttons(container)).toHaveLength(1);
  });

  it("타이핑하면 지우기 버튼이 나온다", () => {
    const { container } = render(<TxSearchInput />);

    fireEvent.change(container.querySelector(".tx-input__field")!, { target: { value: "a" } });
    expect(buttons(container)).toHaveLength(2);
  });

  /**
   * 원본은 `showClear` 를 별도 state 로 들어서, 밖에서 `value` 를 바꾸면 버튼이 안 따라왔다.
   */
  it("value prop 으로 밖에서 값을 바꿔도 지우기 버튼이 따라온다", () => {
    const { container, rerender } = render(<TxSearchInput value="" onChange={() => {}} />);
    expect(buttons(container)).toHaveLength(1);

    rerender(<TxSearchInput value="밖에서" onChange={() => {}} />);
    expect(buttons(container)).toHaveLength(2);
  });

  it("돋보기를 누르면 현재 값으로 onSubmitText 를 부른다", () => {
    const onSubmitText = vi.fn();
    const { container } = render(<TxSearchInput defaultValue="검색어" onSubmitText={onSubmitText} />);

    fireEvent.click(buttons(container)[0]);
    expect(onSubmitText).toHaveBeenCalledWith("검색어");
  });

  it("Enter 로도 onSubmitText 를 부른다", () => {
    const onSubmitText = vi.fn();
    const { container } = render(<TxSearchInput defaultValue="검색어" onSubmitText={onSubmitText} />);

    fireEvent.keyDown(container.querySelector(".tx-input__field")!, { key: "Enter" });
    expect(onSubmitText).toHaveBeenCalledWith("검색어");
  });

  it("지우기는 값을 비우고 onClear·onChangeText 를 부른다", () => {
    const onClear = vi.fn();
    const onChangeText = vi.fn();
    const { container } = render(<TxSearchInput defaultValue="지울 값" onClear={onClear} onChangeText={onChangeText} />);

    fireEvent.click(buttons(container)[1]);

    expect(container.querySelector<HTMLInputElement>(".tx-input__field")!.value).toBe("");
    expect(onClear).toHaveBeenCalledWith("");
    expect(onChangeText).toHaveBeenLastCalledWith("");
    expect(buttons(container)).toHaveLength(1);
  });

  it("ref 로 getValue·clear·submit 을 쓴다", () => {
    const ref = createRef<TxSearchInputRef>();
    const onSubmitText = vi.fn();
    const { container } = render(<TxSearchInput ref={ref} onSubmitText={onSubmitText} />);

    fireEvent.change(container.querySelector(".tx-input__field")!, { target: { value: "타이핑" } });

    // 안쪽 ref 를 스프레드로 복사하면 여기서 옛 값이 나온다.
    expect(ref.current?.getValue()).toBe("타이핑");

    act(() => ref.current?.submit());
    expect(onSubmitText).toHaveBeenCalledWith("타이핑");

    act(() => ref.current?.clear());
    expect(container.querySelector<HTMLInputElement>(".tx-input__field")!.value).toBe("");
  });
});

describe("TxInputLike — 내부 부품", () => {
  it("트리거가 진짜 button 이고 값이 없으면 자리표시가 나온다", () => {
    const { container } = render(<TxInputLike placeholder="선택하세요" />);
    const trigger = container.querySelector<HTMLButtonElement>(".tx-input-like__trigger")!;

    expect(trigger.type).toBe("button");
    expect(trigger.textContent).toBe("선택하세요");
    expect(container.querySelector("[data-tag]")!.getAttribute("data-empty")).toBe("");
  });

  /** 원본은 `aria-expanded={false}` 를 하드코딩해 열려 있어도 항상 false 였다. */
  it("aria-expanded 를 부모가 준다", () => {
    const { container } = render(<TxInputLike value="선택됨" ariaExpanded />);
    const trigger = container.querySelector(".tx-input-like__trigger")!;

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
  });

  it("지우기가 트리거 안에 중첩되지 않는다 — 버튼 안 버튼은 유효하지 않다", () => {
    const { container } = render(<TxInputLike value="값" onClear={() => {}} />);
    const trigger = container.querySelector(".tx-input-like__trigger")!;

    expect(container.querySelectorAll("button")).toHaveLength(2);
    expect(trigger.querySelector("button")).toBeNull();
  });

  it("값이 없으면 지우기가 없다", () => {
    const { container } = render(<TxInputLike onClear={() => {}} />);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("입력창 껍데기를 함께 쓴다 — 나란히 놓았을 때 줄이 맞아야 한다", () => {
    const { container } = render(<TxInputLike />);
    const root = container.querySelector("[data-tag]")!;

    expect(root.classList.contains("tx-input")).toBe(true);
    expect(root.classList.contains("tx-input-like")).toBe(true);
  });
});

describe("TxInput — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const inputCss = strip(readFileSync(join(here, "TxInput.css"), "utf8"));
  const searchCss = strip(readFileSync(join(here, "TxSearchInput.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  const both = inputCss + searchCss;

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    // 그림자의 rgb(0 0 0 / 5%) 는 색이 아니라 불투명도라 예외로 둔다.
    const literals = both.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\((?!0 0 0)[^)]*\)/g) ?? [];
    expect(literals).toEqual([]);
  });

  it(".dark 분기를 컴포넌트가 갖지 않는다 — 토큰만 재정의하면 따라온다", () => {
    expect(both).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...both.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((m) => m[1]));
    const missing = [...referenced].filter((name) => !tokens.includes(`${name}:`));

    expect(missing).toEqual([]);
  });

  /**
   * 포커스 링을 안쪽 `<input>` 이 그리면, 아이콘 버튼이 함께 들어 있는
   * `TxSearchInput` 에서 링이 입력 부분에만 걸려 테두리와 어긋난다.
   */
  it("포커스 링을 래퍼가 그린다 — 안쪽 input 은 outline 을 끈다", () => {
    expect(inputCss).toContain(".tx-input:focus-within");
    expect(inputCss).toMatch(/\.tx-input__field\s*\{[^}]*outline:\s*none/);
  });

  it("검색 껍데기가 안쪽 입력의 테두리를 지운다 — theme prop 없이", () => {
    expect(searchCss).toMatch(/\.tx-search-input\s+\.tx-input\s*\{/);
    expect(searchCss).toMatch(/\.tx-search-input\s+\.tx-input:focus-within\s*\{[^}]*outline:\s*none/);
  });

  /**
   * 껍데기에 높이가 없으면 내용 위에 테두리가 얹혀 2px 더 커진다. `TxInput` 과 나란히 놓았을 때
   * 줄이 어긋나는데, jsdom 에는 레이아웃이 없어 렌더 결과로는 안 보인다.
   */
  it("검색 껍데기가 높이를 명시하고 안쪽 입력이 그걸 채운다", () => {
    expect(searchCss).toMatch(/\.tx-search-input\s*\{[^}]*height:\s*var\(--tx-input-height\)/);
    expect(searchCss).toMatch(/\.tx-search-input\s+\.tx-input\s*\{[^}]*height:\s*100%/);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxInput/TxInput.css" layer(tx);');
    expect(styles).toContain('@import "./TxInput/TxSearchInput.css" layer(tx);');
  });

  it("덮는 쪽이 나중에 실린다 — 순서가 곧 캐스케이드다", () => {
    expect(styles.indexOf("TxInput/TxInput.css")).toBeLessThan(styles.indexOf("TxInput/TxSearchInput.css"));
  });
});
