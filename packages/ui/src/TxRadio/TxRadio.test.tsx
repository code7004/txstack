import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxRadio } from "./TxRadio";
import { TxRadioGroup } from "./TxRadioGroup";

/**
 * **방향키 이동을 손으로 짜지 않는다.** 같은 `name` 을 가진 네이티브 라디오끼리
 * 브라우저가 옮겨 주고, Tab 은 묶음을 한 번만 밟는다. 그래서 여기서 보는 것은
 * "브라우저가 그 일을 할 수 있게 제대로 넘겼는가" 다.
 */

afterEach(cleanup);

const radios = () => screen.getAllByRole("radio") as HTMLInputElement[];

const OPTIONS = (
  <>
    <TxRadio value="card" label="카드" />
    <TxRadio value="bank" label="계좌이체" />
    <TxRadio value="phone" label="휴대폰" />
  </>
);

describe("TxRadioGroup — 브라우저에게 넘기는 것", () => {
  /** 이름이 이어져야 하나만 골라지고 방향키가 돈다. */
  it("이름을 지어내 항목에 이어 준다", () => {
    render(<TxRadioGroup legend="결제 수단">{OPTIONS}</TxRadioGroup>);

    const names = new Set(radios().map((el) => el.name));
    expect(names.size).toBe(1);
    expect([...names][0]).not.toBe("");
  });

  /** 이름이 겹치면 다른 묶음과 하나로 묶여 버린다. */
  it("묶음이 둘이면 이름이 겹치지 않는다", () => {
    render(
      <>
        <TxRadioGroup legend="A">{OPTIONS}</TxRadioGroup>
        <TxRadioGroup legend="B">{OPTIONS}</TxRadioGroup>
      </>
    );

    const names = new Set(radios().map((el) => el.name));
    expect(names.size).toBe(2);
  });

  it("이름을 직접 줄 수도 있다", () => {
    render(
      <TxRadioGroup legend="결제 수단" name="pay">
        {OPTIONS}
      </TxRadioGroup>
    );

    expect(radios().every((el) => el.name === "pay")).toBe(true);
  });

  /**
   * `<div role="radiogroup">` 으로는 "2개 중 1" 같은 셈이 자동으로 나오지 않는다.
   * `<fieldset>` + `<legend>` 라야 묶음 이름이 항목마다 함께 읽힌다.
   */
  it("fieldset 과 legend 다", () => {
    const { container } = render(<TxRadioGroup legend="결제 수단">{OPTIONS}</TxRadioGroup>);

    const root = container.querySelector('[data-tag="TxRadioGroup"]')!;
    expect(root.tagName).toBe("FIELDSET");
    expect(screen.getByRole("group", { name: "결제 수단" })).toBeTruthy();
  });

  it("진짜 라디오 입력이다", () => {
    render(<TxRadioGroup legend="결제 수단">{OPTIONS}</TxRadioGroup>);

    expect(radios()).toHaveLength(3);
    expect(radios().every((el) => el.tagName === "INPUT" && el.type === "radio")).toBe(true);
  });
});

describe("TxRadioGroup — 고르기", () => {
  it("처음에 고를 값을 준다", () => {
    render(
      <TxRadioGroup legend="결제 수단" defaultValue="bank">
        {OPTIONS}
      </TxRadioGroup>
    );

    expect((screen.getByRole("radio", { name: "계좌이체" }) as HTMLInputElement).checked).toBe(true);
  });

  it("고르면 값을 알려 준다", () => {
    const onChange = vi.fn();
    render(
      <TxRadioGroup legend="결제 수단" onChange={onChange}>
        {OPTIONS}
      </TxRadioGroup>
    );

    fireEvent.click(screen.getByRole("radio", { name: "휴대폰" }));
    expect(onChange).toHaveBeenCalledWith("phone");
  });

  it("하나를 고르면 먼저 것이 풀린다", () => {
    render(
      <TxRadioGroup legend="결제 수단" defaultValue="card">
        {OPTIONS}
      </TxRadioGroup>
    );

    fireEvent.click(screen.getByRole("radio", { name: "계좌이체" }));

    expect((screen.getByRole("radio", { name: "카드" }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole("radio", { name: "계좌이체" }) as HTMLInputElement).checked).toBe(true);
  });

  it("controlled 면 값의 주인이 소비자다", () => {
    render(
      <TxRadioGroup legend="결제 수단" value="card" onChange={vi.fn()}>
        {OPTIONS}
      </TxRadioGroup>
    );

    fireEvent.click(screen.getByRole("radio", { name: "휴대폰" }));
    expect((screen.getByRole("radio", { name: "카드" }) as HTMLInputElement).checked).toBe(true);
  });

  it("value 를 주면 defaultValue 는 무시된다", () => {
    render(
      <TxRadioGroup legend="결제 수단" value="card" defaultValue="bank" onChange={vi.fn()}>
        {OPTIONS}
      </TxRadioGroup>
    );

    expect((screen.getByRole("radio", { name: "카드" }) as HTMLInputElement).checked).toBe(true);
  });

  /** `<fieldset disabled>` 는 안의 것을 전부 잠근다 — 브라우저가 한다. */
  it("묶음을 잠그면 안의 것이 다 잠긴다", () => {
    render(
      <TxRadioGroup legend="결제 수단" disabled>
        {OPTIONS}
      </TxRadioGroup>
    );

    expect(radios().every((el) => el.disabled)).toBe(true);
  });
});

describe("TxRadio — 홀로 쓸 때", () => {
  it("묶음 밖에서도 그려진다", () => {
    render(<TxRadio name="pay" value="card" label="카드" defaultChecked />);
    expect((screen.getByRole("radio", { name: "카드" }) as HTMLInputElement).checked).toBe(true);
  });

  it("고른 값을 알려 준다", () => {
    const onChangeValue = vi.fn();
    render(<TxRadio name="pay" value="card" label="카드" onChangeValue={onChangeValue} />);

    fireEvent.click(screen.getByRole("radio"));
    expect(onChangeValue).toHaveBeenCalledWith("card");
  });

  it("글을 눌러도 골라진다 — 전체가 하나의 label 이다", () => {
    render(<TxRadio name="pay" value="card" label="카드" />);
    expect(screen.getByText("카드").closest("label")).toBe(screen.getByRole("radio").closest("label"));
  });

  it("항목만 따로 잠글 수 있다", () => {
    render(
      <TxRadioGroup legend="결제 수단">
        <TxRadio value="card" label="카드" />
        <TxRadio value="bank" label="계좌이체" disabled />
      </TxRadioGroup>
    );

    expect((screen.getByRole("radio", { name: "카드" }) as HTMLInputElement).disabled).toBe(false);
    expect((screen.getByRole("radio", { name: "계좌이체" }) as HTMLInputElement).disabled).toBe(true);
  });
});

describe("TxRadio — 겉", () => {
  it("가로로 늘어놓을 수 있다", () => {
    const { container } = render(
      <TxRadioGroup legend="결제 수단" inline>
        {OPTIONS}
      </TxRadioGroup>
    );

    expect((container.querySelector('[data-tag="TxRadioGroup"]') as HTMLElement).hasAttribute("data-inline")).toBe(true);
  });

  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxRadio name="p" value="a" label="가" className="mine" />);
    const root = container.querySelector('[data-tag="TxRadio"]')!;

    expect(root.classList.contains("tx-radio")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
  });
});

describe("TxRadio — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxRadio.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const source = readFileSync(join(here, "TxRadioGroup.tsx"), "utf8") + readFileSync(join(here, "TxRadio.tsx"), "utf8");

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
    expect(styles).toContain('@import "./TxRadio/TxRadio.css" layer(tx);');
  });

  /** 브라우저가 방향키를 맡는 것이 이 컴포넌트의 요지다. */
  it("roving tabindex 를 손으로 짜지 않는다", () => {
    expect(source).not.toMatch(/tabIndex/);
    expect(source).not.toMatch(/ArrowUp|ArrowDown|ArrowLeft|ArrowRight/);
  });

  /** `display: none` 이면 방향키 이동도 폼 제출도 안 된다. */
  it("입력을 화면에서만 지운다", () => {
    const rule = css.match(/\.tx-radio__input\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).not.toMatch(/display:\s*none/);
    expect(rule).toMatch(/clip-path:/);
  });

  it("포커스 링을 보이는 모양에 건다", () => {
    expect(css).toMatch(/\.tx-radio__input:focus-visible \+ \.tx-radio__mark/);
  });
});
