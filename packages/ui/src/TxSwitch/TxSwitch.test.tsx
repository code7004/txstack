import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxSwitch } from "./TxSwitch";

/**
 * `TxCheckBox` 의 `variant="toggle"` 에서 갈라져 나왔다. **겉모습이 아니라 하는 말이
 * 달라서** 나눈 것이라, 여기서 보는 것도 "스위치로 읽히는가" 와 "진짜 입력인가" 다.
 */

afterEach(cleanup);

describe("TxSwitch — 무엇으로 읽히나", () => {
  /** "선택됨" 이 아니라 "켜짐/꺼짐" 으로 읽혀야 한다. */
  it("스위치로 읽힌다", () => {
    render(<TxSwitch label="알림" />);
    expect(screen.getByRole("switch", { name: "알림" })).toBeTruthy();
  });

  it("체크박스로는 읽히지 않는다", () => {
    render(<TxSwitch label="알림" />);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  /** 진짜 `<input>` 이라야 Tab 으로 닿고 폼에 실린다. */
  it("진짜 input 이다", () => {
    render(<TxSwitch label="알림" name="push" value="on" />);

    const el = screen.getByRole("switch") as HTMLInputElement;
    expect(el.tagName).toBe("INPUT");
    expect(el.type).toBe("checkbox");
    expect(el.name).toBe("push");
    expect(el.value).toBe("on");
  });

  it("글을 눌러도 켜진다 — 전체가 하나의 label 이다", () => {
    render(<TxSwitch label="알림" />);

    const el = screen.getByRole("switch") as HTMLInputElement;
    expect(el.closest("label")).toBeTruthy();
    expect(screen.getByText("알림").closest("label")).toBe(el.closest("label"));
  });
});

describe("TxSwitch — 켜고 끄기", () => {
  it("기본은 꺼져 있다", () => {
    render(<TxSwitch label="알림" />);
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(false);
  });

  it("defaultChecked 로 켜진 채 시작한다", () => {
    render(<TxSwitch label="알림" defaultChecked />);
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
  });

  it("바뀌면 불린으로 알려 준다", () => {
    const onChangeBool = vi.fn();
    render(<TxSwitch label="알림" onChangeBool={onChangeBool} />);

    fireEvent.click(screen.getByRole("switch"));
    expect(onChangeBool).toHaveBeenCalledWith(true);
  });

  it("onChange 도 함께 온다", () => {
    const onChange = vi.fn();
    const onChangeBool = vi.fn();
    render(<TxSwitch label="알림" onChange={onChange} onChangeBool={onChangeBool} />);

    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChangeBool).toHaveBeenCalledTimes(1);
  });

  it("controlled 면 값의 주인이 소비자다", () => {
    render(<TxSwitch label="알림" checked={false} onChangeBool={vi.fn()} />);

    fireEvent.click(screen.getByRole("switch"));
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(false);
  });

  /** 행 전체가 눌리는 목록 안에 넣을 때 쓴다. */
  it("stopPropagation 이면 부모로 안 올라간다", () => {
    const onParent = vi.fn();
    render(
      <div onClick={onParent}>
        <TxSwitch label="알림" stopPropagation />
      </div>
    );

    fireEvent.click(screen.getByRole("switch"));
    expect(onParent).not.toHaveBeenCalled();
  });

  it("평소에는 부모로 올라간다", () => {
    const onParent = vi.fn();
    render(
      <div onClick={onParent}>
        <TxSwitch label="알림" />
      </div>
    );

    fireEvent.click(screen.getByRole("switch"));
    expect(onParent).toHaveBeenCalled();
  });
});

describe("TxSwitch — 겉", () => {
  it("잠근 것을 표시로 남긴다", () => {
    const { container } = render(<TxSwitch label="알림" disabled />);
    expect((container.querySelector('[data-tag="TxSwitch"]') as HTMLElement).dataset.disabled).toBe("");
  });

  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxSwitch label="알림" className="mine" />);
    const root = container.querySelector('[data-tag="TxSwitch"]')!;

    expect(root.classList.contains("tx-switch")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });

  it("안쪽 슬롯에 클래스를 줄 수 있다", () => {
    const { container } = render(<TxSwitch label="알림" classNames={{ track: "t1", label: "l1" }} />);

    expect(container.querySelector(".tx-switch__track.t1")).toBeTruthy();
    expect(container.querySelector(".tx-switch__label.l1")).toBeTruthy();
  });
});

describe("TxSwitch — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxSwitch.css"), "utf8"));
  const checkboxCss = strip(readFileSync(join(here, "..", "TxCheckBox", "TxCheckBox.css"), "utf8"));
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
    expect(styles).toContain('@import "./TxSwitch/TxSwitch.css" layer(tx);');
  });

  /** 스위치 크기를 바꾸려다 체크박스가 함께 바뀌면 안 된다. */
  it("토큰을 따로 갖는다", () => {
    expect(css).toMatch(/--tx-switch-track-width:/);
    expect(css).not.toContain("--tx-checkbox-");
  });

  /** 같은 일에 답이 둘이면 한쪽만 고쳐진다. */
  it("체크박스에 스위치가 남아 있지 않다", () => {
    expect(checkboxCss).not.toContain("toggle");
    expect(checkboxCss).not.toContain("--tx-checkbox-thumb");
  });

  /** `display: none` 이면 Tab 으로 갈 수 없고 폼에도 안 실린다. */
  it("입력을 화면에서만 지운다", () => {
    const rule = css.match(/\.tx-switch__input\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).not.toMatch(/display:\s*none/);
    expect(rule).toMatch(/clip-path:/);
  });

  /** 진짜 `<input>` 은 눈에서 지워져 있어서 거기 링을 걸면 아무 데도 안 보인다. */
  it("포커스 링을 보이는 모양에 건다", () => {
    expect(css).toMatch(/\.tx-switch__input:focus-visible \+ \.tx-switch__track/);
  });

  /** 세 값에서 나오므로 한 곳에서 계산해야 크기를 바꿔도 손잡이가 맞는다. */
  it("손잡이 이동 거리를 계산으로 낸다", () => {
    expect(css).toMatch(/--tx-switch-thumb-travel:\s*calc\(/);
  });

  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");
  });
});
