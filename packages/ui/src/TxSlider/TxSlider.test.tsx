import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxSlider } from "./TxSlider";

/**
 * **네이티브 `<input type="range">` 다.** 키보드(←→ · Home · End)와 스크린리더 안내를
 * 브라우저가 맡는다 — 손으로 짠 슬라이더가 가장 자주 빠뜨리는 것이 그 둘이다.
 *
 * 손잡이가 둘일 때 조심할 것은 **서로를 넘어가지 않게 하는 것**이다. 넘으면 값이 뒤집혀 읽힌다.
 */

afterEach(cleanup);

const handles = () => screen.getAllByRole("slider") as HTMLInputElement[];

describe("TxSlider — 브라우저에게 넘기는 것", () => {
  it("진짜 range 입력이다", () => {
    render(<TxSlider defaultValue={50} />);

    const el = handles()[0];
    expect(el.tagName).toBe("INPUT");
    expect(el.type).toBe("range");
  });

  it("범위와 걸음을 그대로 넘긴다", () => {
    render(<TxSlider defaultValue={5} min={1} max={9} step={2} />);

    const el = handles()[0];
    expect(el.min).toBe("1");
    expect(el.max).toBe("9");
    expect(el.step).toBe("2");
  });

  it("slider 로 읽히고 이름이 붙는다", () => {
    render(<TxSlider defaultValue={50} label="음량" />);
    expect(screen.getByRole("slider", { name: "음량" })).toBeTruthy();
  });
});

describe("TxSlider — 손잡이 하나", () => {
  it("값을 보여 준다", () => {
    render(<TxSlider defaultValue={30} />);
    expect(handles()[0].value).toBe("30");
  });

  it("움직이면 숫자로 알려 준다", () => {
    const onChange = vi.fn();
    render(<TxSlider defaultValue={30} onChange={onChange} />);

    fireEvent.change(handles()[0], { target: { value: "70" } });
    expect(onChange).toHaveBeenCalledWith(70);
  });

  it("controlled 면 값의 주인이 소비자다", () => {
    render(<TxSlider value={30} onChange={vi.fn()} />);

    fireEvent.change(handles()[0], { target: { value: "70" } });
    expect(handles()[0].value).toBe("30");
  });

  it("잠글 수 있다", () => {
    render(<TxSlider defaultValue={30} disabled />);
    expect(handles()[0].disabled).toBe(true);
  });
});

describe("TxSlider — 손잡이 둘", () => {
  it("배열을 주면 손잡이가 둘이다", () => {
    render(<TxSlider value={[10, 80]} onChange={vi.fn()} />);
    expect(handles()).toHaveLength(2);
  });

  it("준 모양 그대로 돌려준다", () => {
    const onChange = vi.fn();
    render(<TxSlider value={[10, 80]} onChange={onChange} />);

    fireEvent.change(handles()[0], { target: { value: "20" } });
    expect(onChange).toHaveBeenCalledWith([20, 80]);
  });

  /** 시작이 끝보다 커지면 값이 뒤집혀 읽힌다. */
  it("시작이 끝을 넘지 못한다", () => {
    const onChange = vi.fn();
    render(<TxSlider value={[10, 50]} onChange={onChange} />);

    fireEvent.change(handles()[0], { target: { value: "90" } });
    expect(onChange).toHaveBeenCalledWith([50, 50]);
  });

  it("끝이 시작 아래로 못 내려간다", () => {
    const onChange = vi.fn();
    render(<TxSlider value={[40, 50]} onChange={onChange} />);

    fireEvent.change(handles()[1], { target: { value: "10" } });
    expect(onChange).toHaveBeenCalledWith([40, 40]);
  });

  /** 둘 다 "값" 이라고만 하면 어느 쪽을 잡고 있는지 알 수 없다. */
  it("손잡이마다 이름을 따로 준다", () => {
    render(<TxSlider value={[10, 80]} onChange={vi.fn()} label={["최소", "최대"]} />);

    expect(screen.getByRole("slider", { name: "최소" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "최대" })).toBeTruthy();
  });
});

describe("TxSlider — 값 보여 주기", () => {
  it("기본은 글자가 없다", () => {
    const { container } = render(<TxSlider defaultValue={30} />);
    expect(container.querySelector(".tx-slider__value")).toBeNull();
  });

  it("showValue 면 값이 보인다", () => {
    render(<TxSlider defaultValue={30} showValue />);
    expect(screen.getByText("30")).toBeTruthy();
  });

  it("손잡이가 둘이면 구간으로 보인다", () => {
    render(<TxSlider value={[10, 80]} onChange={vi.fn()} showValue />);
    expect(screen.getByText("10 – 80")).toBeTruthy();
  });

  it("글자를 직접 만들 수 있다", () => {
    render(<TxSlider defaultValue={30} showValue={(value) => `${value}%`} />);
    expect(screen.getByText("30%")).toBeTruthy();
  });

  /** 손잡이가 이미 값을 알린다. 글자까지 읽으면 같은 것을 두 번 듣는다. */
  it("눈으로 보는 글자는 읽히지 않는다", () => {
    const { container } = render(<TxSlider defaultValue={30} showValue />);
    expect(container.querySelector(".tx-slider__value")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("TxSlider — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxSlider.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxSlider/TxSlider.css" layer(tx);');
  });

  /** 손잡이를 지우면 잡을 것도 키보드 포커스도 사라진다. */
  it("손잡이를 지우지 않는다", () => {
    expect(css).toContain("::-webkit-slider-thumb");
    expect(css).toContain("::-moz-range-thumb");
  });

  /** `<input>` 자체는 투명해서 거기 링을 걸면 어디 있는지 안 보인다. */
  it("포커스 링을 손잡이에 건다", () => {
    expect(css).toMatch(/:focus-visible::-webkit-slider-thumb/);
    expect(css).toMatch(/:focus-visible::-moz-range-thumb/);
  });

  /** 겹쳐 있어도 손잡이만 잡혀야 위의 것이 아래를 가리지 않는다. */
  it("겹친 입력이 서로를 가리지 않는다", () => {
    expect(css).toMatch(/\.tx-slider__input\s*\{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(/::-webkit-slider-thumb\s*\{[^}]*pointer-events:\s*auto/);
  });
});
