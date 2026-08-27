import { cleanup, fireEvent, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxCheckBox } from "./TxCheckBox";

/**
 * 이 컴포넌트에서 고친 것은 대부분 **접근성과 폼 동작**이다 —
 * 키보드로 도달할 수 없었고, 스크린리더가 체크박스로 읽지 않았고, 폼 제출에도 안 실렸다.
 * 그래서 "진짜 입력 요소인가" 를 여러 각도에서 못 박는다.
 */

afterEach(cleanup);

const box = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const el = container.querySelector<HTMLInputElement>("input");
  if (!el) throw new Error("TxCheckBox 가 input 을 렌더하지 않았다");
  return el;
};

describe("TxCheckBox — 진짜 입력 요소다", () => {
  it("input[type=checkbox] 를 렌더한다", () => {
    expect(box(<TxCheckBox />).type).toBe("checkbox");
  });

  it("전체가 label 이라 글을 눌러도 토글된다", () => {
    const onChangeBool = vi.fn();
    const { container } = render(<TxCheckBox label="동의합니다" onChangeBool={onChangeBool} />);

    const label = container.querySelector("label")!;
    expect(label.querySelector('[data-tag="TxCheckBox"]') ?? label.getAttribute("data-tag")).toBeTruthy();

    fireEvent.click(container.querySelector(".tx-checkbox__label")!);
    expect(onChangeBool).toHaveBeenCalledWith(true);
  });

  it("Tab 으로 도달할 수 있다 — 화면에서 지우지 않았다", () => {
    const el = box(<TxCheckBox />);

    el.focus();
    expect(document.activeElement).toBe(el);
    expect(el.hidden).toBe(false);
  });

  it("form 안에서 name·value 로 제출된다", () => {
    const { container } = render(
      <form>
        <TxCheckBox name="agree" value="yes" defaultChecked />
        <TxCheckBox name="news" value="on" />
      </form>
    );

    const data = new FormData(container.querySelector("form")!);
    expect(data.get("agree")).toBe("yes");
    // 체크하지 않은 것은 제출되지 않는다 — HTML 규칙 그대로다
    expect(data.get("news")).toBeNull();
  });

  it("required·disabled 같은 표준 속성이 통과한다", () => {
    const el = box(<TxCheckBox required disabled />);

    expect(el.required).toBe(true);
    expect(el.disabled).toBe(true);
  });

  it("ref 가 input 을 가리킨다", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TxCheckBox ref={ref} />);

    expect(ref.current?.tagName).toBe("INPUT");
  });
});

describe("TxCheckBox — 값", () => {
  it("defaultChecked 로 시작한다 (uncontrolled)", () => {
    expect(box(<TxCheckBox defaultChecked />).checked).toBe(true);
  });

  it("uncontrolled 는 클릭으로 토글된다", () => {
    const el = box(<TxCheckBox />);

    fireEvent.click(el);
    expect(el.checked).toBe(true);

    fireEvent.click(el);
    expect(el.checked).toBe(false);
  });

  /** 내부 state 로 복사해 두면 여기서 소비자 값과 어긋난다. */
  it("controlled 는 checked 가 주인이다 — 클릭해도 안 바뀐다", () => {
    const el = box(<TxCheckBox checked={false} onChange={() => {}} />);

    fireEvent.click(el);
    expect(el.checked).toBe(false);
  });

  it("controlled 는 밖에서 바꾸면 따라온다", () => {
    const { container, rerender } = render(<TxCheckBox checked={false} onChange={() => {}} />);
    const el = container.querySelector("input")!;

    rerender(<TxCheckBox checked onChange={() => {}} />);
    expect(el.checked).toBe(true);
  });

  it("onChange 와 onChangeBool 을 함께 부른다", () => {
    const onChange = vi.fn();
    const onChangeBool = vi.fn();

    fireEvent.click(box(<TxCheckBox onChange={onChange} onChangeBool={onChangeBool} />));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChangeBool).toHaveBeenCalledWith(true);
  });
});

describe("TxCheckBox — variant", () => {
  it("기본은 체크박스로 읽힌다", () => {
    const el = box(<TxCheckBox />);

    expect(el.getAttribute("role")).toBeNull();
    expect(el.closest("[data-tag]")!.getAttribute("data-variant")).toBe("checkbox");
  });

  /** 토글은 스위치다. 스크린리더가 "선택됨" 이 아니라 "켜짐/꺼짐" 으로 안내해야 한다. */
  it("toggle 은 스위치로 읽힌다", () => {
    const el = box(<TxCheckBox variant="toggle" />);

    expect(el.getAttribute("role")).toBe("switch");
    expect(el.closest("[data-tag]")!.getAttribute("data-variant")).toBe("toggle");
  });

  it("모양은 보조 요소라 스크린리더가 읽지 않는다", () => {
    const { container } = render(<TxCheckBox label="라벨" />);
    expect(container.querySelector(".tx-checkbox__mark")!.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("TxCheckBox — stopPropagation", () => {
  it("기본은 클릭이 부모로 올라간다", () => {
    const onParentClick = vi.fn();
    const { container } = render(
      <div onClick={onParentClick}>
        <TxCheckBox label="행 안의 체크박스" />
      </div>
    );

    fireEvent.click(container.querySelector(".tx-checkbox__label")!);
    expect(onParentClick).toHaveBeenCalled();
  });

  it("켜면 막는다 — 행 전체가 눌리는 목록에서 쓴다", () => {
    const onParentClick = vi.fn();
    const { container } = render(
      <div onClick={onParentClick}>
        <TxCheckBox label="행 안의 체크박스" stopPropagation />
      </div>
    );

    fireEvent.click(container.querySelector(".tx-checkbox__label")!);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});

describe("TxCheckBox — 구조와 계약", () => {
  it("data-tag 를 붙인다", () => {
    const { container } = render(<TxCheckBox />);
    expect(container.querySelector('[data-tag="TxCheckBox"]')).not.toBeNull();
  });

  it("className 은 기본 클래스를 교체하지 않고 덧붙는다", () => {
    const { container } = render(<TxCheckBox className="my-2" />);
    const root = container.querySelector('[data-tag="TxCheckBox"]')!;

    expect(root.classList.contains("tx-checkbox")).toBe(true);
    expect(root.classList.contains("my-2")).toBe(true);
  });

  it("classNames 슬롯이 각자의 자리에 붙는다", () => {
    const { container } = render(<TxCheckBox label="라벨" classNames={{ mark: "m", label: "l" }} />);

    expect(container.querySelector(".tx-checkbox__mark")!.classList.contains("m")).toBe(true);
    expect(container.querySelector(".tx-checkbox__label")!.classList.contains("l")).toBe(true);
  });

  it("label 이 없으면 글 슬롯 자체가 없다", () => {
    const { container } = render(<TxCheckBox />);
    expect(container.querySelector(".tx-checkbox__label")).toBeNull();
  });

  it("children 을 그대로 렌더한다", () => {
    const { container } = render(
      <TxCheckBox>
        <span data-x>추가 내용</span>
      </TxCheckBox>
    );

    expect(container.querySelector("[data-x]")).not.toBeNull();
  });

  /**
   * CSS 변수는 아래로만 상속된다. `style` 이 안쪽 요소로 가면 껍데기가 읽는 토큰이 안 바뀌어,
   * 소비자가 `style={{ "--tx-…": … }}` 로 값을 줘도 아무 일도 일어나지 않는다.
   */
  it("style 은 className 과 같은 자리에 붙는다 — 토큰을 인라인으로 줄 수 있어야 한다", () => {
    const { container } = render(<TxCheckBox style={{ ["--tx-test" as string]: "1px", color: "red" }} />);
    const root = container.querySelector<HTMLElement>('[data-tag="TxCheckBox"]')!;

    expect(root.style.getPropertyValue("--tx-test")).toBe("1px");
    expect(root.style.color).toBe("red");
    expect(container.querySelector<HTMLElement>(".tx-checkbox__input")!.style.getPropertyValue("--tx-test")).toBe("");
  });

  it("disabled 가 값 없는 속성으로 나간다", () => {
    const { container } = render(<TxCheckBox disabled />);
    expect(container.querySelector('[data-tag="TxCheckBox"]')!.getAttribute("data-disabled")).toBe("");
  });
});

describe("TxCheckBox — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxCheckBox.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 컴포넌트가 갖지 않는다 — 토큰만 재정의하면 따라온다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((m) => m[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  /**
   * `display: none` 이나 `visibility: hidden` 으로 지우면 Tab 으로 도달할 수 없고
   * 폼 제출에도 안 실린다. 눈에서만 지워야 한다.
   */
  it("입력을 화면에서만 지운다 — 접근성 트리에서 지우지 않는다", () => {
    const rule = css.match(/\.tx-checkbox__input\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toContain("position: absolute");
    expect(rule).not.toMatch(/display:\s*none/);
    expect(rule).not.toMatch(/visibility:\s*hidden/);
  });

  /** 진짜 입력은 눈에 안 보이므로 링을 거기에 걸면 아무것도 안 보인다. */
  it("포커스 링을 보이는 모양에 건다", () => {
    expect(css).toMatch(/\.tx-checkbox__input:focus-visible \+ \.tx-checkbox__mark\s*\{[^}]*outline:\s*var\(--tx-focus-ring\)/);
  });

  it("상태를 CSS 가 :checked 로 읽는다 — 컴포넌트가 따로 들지 않는다", () => {
    expect(css).toContain(".tx-checkbox__input:checked + .tx-checkbox__mark");
  });

  /** 트랙이나 손잡이 크기를 바꿔도 이동 거리가 따라와야 한다. */
  it("손잡이 이동 거리를 매직넘버가 아니라 계산으로 낸다", () => {
    expect(css).toMatch(/--tx-checkbox-thumb-travel:\s*calc\(/);
    expect(css).toMatch(/translateX\(var\(--tx-checkbox-thumb-travel\)\)/);
  });

  it("모션 저감에서 전환을 끈다", () => {
    expect(css).toMatch(/prefers-reduced-motion[\s\S]*--tx-checkbox-transition:\s*0ms/);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxCheckBox/TxCheckBox.css" layer(tx);');
  });
});
