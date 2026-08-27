import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxTextarea } from "./TxTextarea";
import type { TxTextareaRef } from "./TxTextarea.types";

/**
 * 이 컴포넌트의 결함 둘은 **`TxInput` 과 갈라진 데서** 났다 —
 * 콜백 하나가 세 곳에서 불렸고, 껍데기를 따로 그리다 배경을 빠뜨렸다.
 * 그래서 아래 CSS 계약 블록이 "껍데기를 공유하는가" 를 못 박는다.
 */

afterEach(cleanup);

const area = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const el = container.querySelector<HTMLTextAreaElement>(".tx-textarea__field");
  if (!el) throw new Error("TxTextarea 가 textarea 를 렌더하지 않았다");
  return el;
};

describe("TxTextarea — 값", () => {
  it("defaultValue 로 시작한다 (uncontrolled)", () => {
    expect(area(<TxTextarea defaultValue="본문" />).value).toBe("본문");
  });

  it("value 를 주면 그 값이 이긴다 (controlled)", () => {
    const el = area(<TxTextarea value="고정" onChange={() => {}} />);

    fireEvent.change(el, { target: { value: "바꿔봄" } });
    expect(el.value).toBe("고정");
  });
});

describe("TxTextarea — 콜백", () => {
  it("onChangeText 와 onChange 를 함께 부른다", () => {
    const onChange = vi.fn();
    const onChangeText = vi.fn();

    fireEvent.change(area(<TxTextarea onChange={onChange} onChangeText={onChangeText} />), { target: { value: "abc" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith("abc");
  });

  it("blur 에서 onBlur 와 onBlurText 를 함께 부른다", () => {
    const onBlur = vi.fn();
    const onBlurText = vi.fn();

    fireEvent.blur(area(<TxTextarea defaultValue="본문" onBlur={onBlur} onBlurText={onBlurText} />));

    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onBlurText).toHaveBeenCalledWith("본문");
  });

  /**
   * 원본은 `onChangedText` 를 Enter 에서도 불렀다. textarea 에서 Enter 는 줄바꿈이라
   * `change` 로 이미 오는데, 같은 값으로 한 번 더 왔다.
   */
  it("Enter 로 값 변경 콜백을 다시 부르지 않는다 — 줄바꿈은 change 로 온다", () => {
    const onChangeText = vi.fn();
    const el = area(<TxTextarea onChangeText={onChangeText} />);

    fireEvent.change(el, { target: { value: "첫 줄\n" } });
    fireEvent.keyDown(el, { key: "Enter" });

    expect(onChangeText).toHaveBeenCalledTimes(1);
  });

  it("blur 로 값 변경 콜백을 부르지 않는다", () => {
    const onChangeText = vi.fn();
    const el = area(<TxTextarea defaultValue="본문" onChangeText={onChangeText} />);

    fireEvent.blur(el);
    expect(onChangeText).not.toHaveBeenCalled();
  });
});

describe("TxTextarea — ref", () => {
  it("getValue 는 타이핑 직후의 값을 준다 — stale 하지 않다", () => {
    const ref = createRef<TxTextareaRef>();
    const { container } = render(<TxTextarea ref={ref} />);

    fireEvent.change(container.querySelector(".tx-textarea__field")!, { target: { value: "새 본문" } });
    expect(ref.current?.getValue()).toBe("새 본문");
  });

  it("setValue 는 uncontrolled 에서 값을 바꾼다", () => {
    const ref = createRef<TxTextareaRef>();
    const { container } = render(<TxTextarea ref={ref} />);

    act(() => ref.current?.setValue("바깥에서"));
    expect(container.querySelector<HTMLTextAreaElement>(".tx-textarea__field")!.value).toBe("바깥에서");
  });

  it("setValue 는 controlled 에서 값을 바꾸지 않는다 — 주인은 소비자다", () => {
    const ref = createRef<TxTextareaRef>();
    const { container } = render(<TxTextarea ref={ref} value="고정" onChange={() => {}} />);

    act(() => ref.current?.setValue("무시된다"));
    expect(container.querySelector<HTMLTextAreaElement>(".tx-textarea__field")!.value).toBe("고정");
  });

  it("focus·select 를 위임한다", () => {
    const ref = createRef<TxTextareaRef>();
    const { container } = render(<TxTextarea ref={ref} defaultValue="abc" />);
    const el = container.querySelector<HTMLTextAreaElement>(".tx-textarea__field")!;

    ref.current?.focus();
    expect(document.activeElement).toBe(el);

    ref.current?.select();
    expect(el.selectionEnd).toBe(3);
  });

  it("focusOnMount 는 마운트 시 포커스한다", () => {
    const { container } = render(<TxTextarea focusOnMount />);
    expect(document.activeElement).toBe(container.querySelector(".tx-textarea__field"));
  });
});

describe("TxTextarea — autoGrow", () => {
  /**
   * jsdom 에는 레이아웃이 없어 `scrollHeight` 가 늘 0 이다. 실제 높이는 Storybook 에서 사람이 본다.
   * 여기서는 **인라인 높이를 건드리는지 아닌지**만 본다 — 켜고 끌 때 흔적이 남으면 안 된다.
   */
  it("꺼져 있으면 인라인 높이를 건드리지 않는다", () => {
    const el = area(<TxTextarea />);

    expect(el.style.height).toBe("");
    expect(el.closest("[data-tag]")!.hasAttribute("data-auto-grow")).toBe(false);
  });

  it("켜면 인라인 높이를 계산해 넣고 표시를 남긴다", () => {
    const el = area(<TxTextarea autoGrow />);

    expect(el.style.height).not.toBe("");
    expect(el.closest("[data-tag]")!.getAttribute("data-auto-grow")).toBe("");
  });

  it("끄면 인라인 높이를 지운다 — 안 지우면 그 값에 갇힌다", () => {
    const { container, rerender } = render(<TxTextarea autoGrow />);
    const el = container.querySelector<HTMLTextAreaElement>(".tx-textarea__field")!;
    expect(el.style.height).not.toBe("");

    rerender(<TxTextarea autoGrow={false} />);
    expect(el.style.height).toBe("");
  });
});

describe("TxTextarea — 구조와 계약", () => {
  it("data-tag 를 붙인다", () => {
    const { container } = render(<TxTextarea />);
    expect(container.querySelector('[data-tag="TxTextarea"]')).not.toBeNull();
  });

  /** 껍데기를 공유해야 폼 안에서 입력창과 줄이 맞는다. 원본은 따로 그리다 배경을 빠뜨렸다. */
  it("TxInput 과 같은 껍데기 클래스를 함께 건다", () => {
    const { container } = render(<TxTextarea />);
    const root = container.querySelector('[data-tag="TxTextarea"]')!;

    expect(root.classList.contains("tx-input")).toBe(true);
    expect(root.classList.contains("tx-textarea")).toBe(true);
  });

  it("className 은 기본 클래스를 교체하지 않고 덧붙는다", () => {
    const { container } = render(<TxTextarea className="w-full" />);
    const root = container.querySelector('[data-tag="TxTextarea"]')!;

    expect(root.classList.contains("tx-textarea")).toBe(true);
    expect(root.classList.contains("w-full")).toBe(true);
  });

  /**
   * CSS 변수는 아래로만 상속된다. `style` 이 안쪽 요소로 가면 껍데기가 읽는 토큰이 안 바뀌어,
   * 소비자가 `style={{ "--tx-…": … }}` 로 값을 줘도 아무 일도 일어나지 않는다.
   */
  it("style 은 className 과 같은 자리에 붙는다 — 토큰을 인라인으로 줄 수 있어야 한다", () => {
    const { container } = render(<TxTextarea style={{ ["--tx-test" as string]: "1px", color: "red" }} />);
    const root = container.querySelector<HTMLElement>('[data-tag="TxTextarea"]')!;

    expect(root.style.getPropertyValue("--tx-test")).toBe("1px");
    expect(root.style.color).toBe("red");
    expect(container.querySelector<HTMLElement>(".tx-textarea__field")!.style.getPropertyValue("--tx-test")).toBe("");
  });

  it("readOnly·disabled 가 값 없는 속성으로 나간다", () => {
    const { container: ro } = render(<TxTextarea readOnly />);
    expect(ro.querySelector('[data-tag="TxTextarea"]')!.getAttribute("data-readonly")).toBe("");

    const { container: dis } = render(<TxTextarea disabled />);
    expect(dis.querySelector('[data-tag="TxTextarea"]')!.getAttribute("data-disabled")).toBe("");
  });

  it("TextareaHTMLAttributes 를 그대로 통과시킨다", () => {
    const el = area(<TxTextarea rows={5} placeholder="내용" maxLength={100} />);

    expect(el.rows).toBe(5);
    expect(el.placeholder).toBe("내용");
    expect(el.maxLength).toBe(100);
  });

  it("id 는 id → name → 자동생성 순으로 정해진다", () => {
    expect(area(<TxTextarea id="a" name="b" />).id).toBe("a");
    expect(area(<TxTextarea name="b" />).id).toBe("b");
    expect(area(<TxTextarea />).id).toBeTruthy();
  });
});

describe("TxTextarea — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxTextarea.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  /** 원본은 `text-gray-500` 을 박아 입력한 글자가 흐렸다. 래퍼에서 상속받아야 한다. */
  it("글자색을 선언하지 않는다 — 껍데기에서 상속받는다", () => {
    expect(css).toMatch(/\.tx-textarea__field\s*\{[^}]*color:\s*inherit/);
  });

  it(".dark 분기를 컴포넌트가 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((m) => m[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("포커스 링을 따로 그리지 않는다 — 껍데기가 하나만 그린다", () => {
    expect(css).not.toContain(":focus-within");
    expect(css).toMatch(/\.tx-textarea__field\s*\{[^}]*outline:\s*none/);
  });

  it("자동 높이일 때 손잡이를 없앤다 — 타이핑마다 사용자 높이가 덮인다", () => {
    expect(css).toMatch(/\[data-auto-grow\][^{]*\{[^}]*resize:\s*none/);
    expect(css).toMatch(/\[data-auto-grow\][^{]*\{[^}]*overflow:\s*hidden/);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxTextarea/TxTextarea.css" layer(tx);');
  });

  /** 같은 특이도라 순서로 정해진다. 앞에 실리면 `.tx-input` 의 고정 높이를 못 되돌린다. */
  it("TxInput.css 뒤에 실린다 — 높이 되돌리기가 이겨야 한다", () => {
    expect(styles.indexOf("TxInput/TxInput.css")).toBeLessThan(styles.indexOf("TxTextarea/TxTextarea.css"));
  });
});
