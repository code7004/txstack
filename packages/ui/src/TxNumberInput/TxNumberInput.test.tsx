import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxNumberInput } from "./TxNumberInput";
import { clamp, formatNumber, parseNumber, precisionOf, stepBy } from "./TxNumberInput.utils";

/**
 * **`<input type="number">` 를 쓰지 않는다.** 휠을 굴리면 값이 바뀌고, 증감 버튼 모양을
 * 토큰으로 맞출 수 없으며, **천 단위 콤마를 넣으면 값이 비어 버린다.**
 *
 * 그래서 값 읽기·쓰기를 우리가 하는데, 그 규칙이 어긋나면 `1,000` 을 넣고 `1` 을 얻는다 —
 * 여기서 가장 조심하는 자리다.
 */

afterEach(cleanup);

const field = () => screen.getByRole("spinbutton") as HTMLInputElement;

describe("숫자를 읽고 쓰기", () => {
  it.each([
    [1, 0],
    [0.1, 1],
    [0.01, 2],
    [10, 0]
  ])("step %s 에서 소수 %s 자리를 짐작한다", (step, digits) => {
    expect(precisionOf(step)).toBe(digits);
  });

  /** 콤마가 든 글자를 못 읽으면 화면에 보이는 것을 되읽을 수 없다. */
  it("콤마와 공백을 걷어 읽는다", () => {
    expect(parseNumber("1,234")).toBe(1234);
    expect(parseNumber(" 1 234 ")).toBe(1234);
  });

  it("비었거나 숫자가 아니면 undefined 다", () => {
    for (const text of ["", "-", ".", "abc"]) expect(parseNumber(text), text).toBeUndefined();
  });

  it("음수와 소수를 읽는다", () => {
    expect(parseNumber("-12.5")).toBe(-12.5);
  });

  it("천 단위를 끊는다", () => {
    expect(formatNumber(1234567, { precision: 0, thousandSeparator: true })).toBe("1,234,567");
    expect(formatNumber(1234567, { precision: 0, thousandSeparator: false })).toBe("1234567");
  });

  it("소수 자릿수를 맞춘다", () => {
    expect(formatNumber(3, { precision: 2, thousandSeparator: false })).toBe("3.00");
    expect(formatNumber(1234.5, { precision: 1, thousandSeparator: true })).toBe("1,234.5");
  });

  it("범위 안으로 가둔다", () => {
    expect(clamp(5, 1, 3)).toBe(3);
    expect(clamp(-5, 1, 3)).toBe(1);
    expect(clamp(2, undefined, undefined)).toBe(2);
  });

  /** `0.1 + 0.2` 가 `0.30000000000000004` 로 나오면 화면에 그대로 뜬다. */
  it("부동소수 오차를 자릿수로 잘라 낸다", () => {
    expect(stepBy(0.1, 0.2, 1)).toBe(0.3);
  });
});

describe("TxNumberInput — 값", () => {
  it("처음 값을 보여 준다", () => {
    render(<TxNumberInput defaultValue={1234} />);
    expect(field().value).toBe("1,234");
  });

  it("타이핑하면 값을 알려 준다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput onChange={onChange} />);

    fireEvent.change(field(), { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("지우면 undefined 가 온다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput defaultValue={5} onChange={onChange} />);

    fireEvent.change(field(), { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  /** 타이핑 중에 콤마를 넣으면 커서가 튄다. */
  it("타이핑하는 동안에는 콤마를 넣지 않는다", () => {
    render(<TxNumberInput />);

    fireEvent.change(field(), { target: { value: "1234" } });
    expect(field().value).toBe("1234");
  });

  it("포커스가 빠질 때 끊어 준다", () => {
    render(<TxNumberInput />);

    fireEvent.change(field(), { target: { value: "1234" } });
    fireEvent.blur(field());
    expect(field().value).toBe("1,234");
  });

  it("포커스가 빠질 때 소수 자릿수를 맞춘다", () => {
    render(<TxNumberInput precision={2} />);

    fireEvent.change(field(), { target: { value: "3" } });
    fireEvent.blur(field());
    expect(field().value).toBe("3.00");
  });

  it("포커스가 빠질 때 범위 안으로 가둔다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput min={1} max={10} onChange={onChange} />);

    fireEvent.change(field(), { target: { value: "50" } });
    fireEvent.blur(field());

    expect(field().value).toBe("10");
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  /**
   * 소비자가 값을 안 받으면 화면도 돌아와야 한다. 타이핑한 글자가 남으면
   * **화면과 값이 갈린다** — `TxCollapsible` 에서 지나온 자리와 같다.
   */
  it("controlled 인데 값을 안 바꾸면 화면도 돌아온다", () => {
    render(<TxNumberInput value={5} onChange={vi.fn()} />);

    fireEvent.change(field(), { target: { value: "9" } });
    fireEvent.blur(field());
    expect(field().value).toBe("5");
  });

  it("controlled 에서 값을 받으면 화면이 따라간다", () => {
    const { rerender } = render(<TxNumberInput value={5} onChange={vi.fn()} />);

    fireEvent.change(field(), { target: { value: "9" } });
    rerender(<TxNumberInput value={9} onChange={vi.fn()} />);
    fireEvent.blur(field());

    expect(field().value).toBe("9");
  });

  /** 값은 안 바뀌었어도 모양은 달라진다. 다시 맞출 구실이 없으면 콤마가 안 붙는다. */
  it("값이 그대로여도 모양은 다시 맞춘다", () => {
    render(<TxNumberInput defaultValue={1234} />);

    fireEvent.change(field(), { target: { value: "1234" } });
    fireEvent.blur(field());
    expect(field().value).toBe("1,234");
  });
});

describe("TxNumberInput — 올리고 내리기", () => {
  it("버튼으로 움직인다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput defaultValue={5} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "늘리기" }));
    expect(onChange).toHaveBeenLastCalledWith(6);

    fireEvent.click(screen.getByRole("button", { name: "줄이기" }));
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  /** `role="spinbutton"` 은 ↑↓ 로 움직이는 것이 규약이다. */
  it("방향키로도 움직인다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput defaultValue={5} onChange={onChange} />);

    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith(6);

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("step 만큼 움직인다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput defaultValue={0} step={1000} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "늘리기" }));
    expect(onChange).toHaveBeenLastCalledWith(1000);
  });

  it("범위를 넘지 않는다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput defaultValue={10} max={10} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "늘리기" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("끝에 닿으면 버튼이 잠긴다", () => {
    render(<TxNumberInput defaultValue={1} min={1} />);
    expect((screen.getByRole("button", { name: "줄이기" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("비어 있을 때 올리면 범위 안에서 시작한다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput min={5} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "늘리기" }));
    expect(onChange).toHaveBeenLastCalledWith(6);
  });

  it("증감 버튼을 없앨 수 있다", () => {
    render(<TxNumberInput hideStepper />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("잠그면 움직이지 않는다", () => {
    const onChange = vi.fn();
    render(<TxNumberInput defaultValue={5} disabled onChange={onChange} />);

    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("TxNumberInput — 스크린리더", () => {
  it("spinbutton 으로 읽히고 범위를 알린다", () => {
    render(<TxNumberInput defaultValue={5} min={1} max={10} />);

    const el = field();
    expect(el.getAttribute("aria-valuenow")).toBe("5");
    expect(el.getAttribute("aria-valuemin")).toBe("1");
    expect(el.getAttribute("aria-valuemax")).toBe("10");
  });

  /** 숫자만 읽으면 단위를 놓친다. */
  it("단위까지 붙여 읽는다", () => {
    render(<TxNumberInput defaultValue={12000} suffix="원" />);
    expect(field().getAttribute("aria-valuetext")).toBe("12,000원");
  });

  it("눈으로 보는 단위는 읽히지 않는다", () => {
    const { container } = render(<TxNumberInput defaultValue={1} suffix="원" />);
    expect(container.querySelector(".tx-number-input__suffix")?.getAttribute("aria-hidden")).toBe("true");
  });

  /** 모바일에서 숫자 키패드를 부른다. */
  it("숫자 키패드를 부른다", () => {
    render(<TxNumberInput />);
    expect(field().getAttribute("inputMode")).toBe("decimal");
  });
});

describe("TxNumberInput — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxNumberInput.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  // 주석에 이름이 나오는 것은 괜찮다. 실제 코드만 본다 — 줄 주석도 걷는다
  const source = strip(readFileSync(join(here, "TxNumberInput.tsx"), "utf8")).replace(/^\s*\/\/.*$/gm, "");

  it("색을 하드코딩하지 않는다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxNumberInput/TxNumberInput.css" layer(tx);');
  });

  /** 휠로 값이 바뀌고, 증감 버튼 모양을 토큰으로 맞출 수 없고, 콤마를 넣으면 값이 빈다. */
  it("type=number 를 쓰지 않는다", () => {
    expect(source).not.toMatch(/type="number"/);
    expect(source).toMatch(/type="text"/);
  });

  /** 상자를 다시 그리면 폼에서 다른 칸과 높이가 어긋난다. */
  it("입력 상자를 다시 그리지 않는다", () => {
    expect(source).toContain('"tx-input tx-number-input"');
    expect(css).not.toMatch(/\.tx-number-input\s*\{[^}]*border:/);
  });

  /** 칸 안에서 ↑↓ 로 움직이는데 버튼까지 밟으면 Tab 을 세 번 눌러야 한다. */
  it("증감 버튼이 탭 순서에 끼지 않는다", () => {
    expect(source).toMatch(/tabIndex=\{-1\}/);
  });
});
