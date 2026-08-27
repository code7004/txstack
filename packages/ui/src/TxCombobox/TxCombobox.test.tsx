import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxCombobox } from "./TxCombobox";

/**
 * 콤보박스의 정체성은 **목록에 없는 값도 들어간다**는 것이다. 그 자유를 지키면서
 * 목록·키보드·접근성이 함께 도는지를 본다.
 */

afterEach(cleanup);

const CITIES = ["서울", "부산", "대구", "인천", "광주"];

const field = () => screen.getByRole("combobox") as HTMLInputElement;
const options = () => screen.queryAllByRole("option");
const list = () => screen.queryByRole("listbox");
const type = (text: string) => fireEvent.change(field(), { target: { value: text } });

describe("TxCombobox — 자유입력", () => {
  it("목록에 없는 값도 그대로 들어간다", () => {
    const onChangeText = vi.fn();
    render(<TxCombobox data={CITIES} onChangeText={onChangeText} />);

    type("제주");
    expect(field().value).toBe("제주");
    expect(onChangeText).toHaveBeenCalledWith("제주");
  });

  it("일치하는 후보가 없으면 목록을 닫는다 — 새 값을 치는 중이다", () => {
    render(<TxCombobox data={CITIES} />);

    fireEvent.focus(field());
    expect(options()).toHaveLength(5);

    type("제주");
    expect(list()).toBeNull();
  });

  it("Escape 로 닫아도 친 글자는 남는다", () => {
    render(<TxCombobox data={CITIES} />);

    type("서");
    expect(list()).not.toBeNull();

    fireEvent.keyDown(field(), { key: "Escape" });
    expect(list()).toBeNull();
    expect(field().value).toBe("서");
  });
});

describe("TxCombobox — 후보 목록", () => {
  it("포커스하면 후보가 전부 뜬다", () => {
    render(<TxCombobox data={CITIES} />);

    fireEvent.focus(field());
    expect(options().map((el) => el.textContent)).toEqual(CITIES);
  });

  /** 값이 채워진 칸을 포커스했을 때 그 값으로 걸러지면 다른 후보를 볼 수 없다. */
  it("값이 있어도 포커스하면 전부 보여 준다", () => {
    render(<TxCombobox data={CITIES} value="서울" onChangeText={() => {}} />);

    fireEvent.focus(field());
    expect(options()).toHaveLength(5);
  });

  it("치기 시작하면 걸러진다 — 대소문자를 가리지 않는다", () => {
    render(<TxCombobox data={["Seoul", "Busan", "Daegu"]} />);

    type("SE");
    expect(options().map((el) => el.textContent)).toEqual(["Seoul"]);
  });

  it("filter 로 규칙을 바꾼다", () => {
    render(<TxCombobox data={CITIES} filter={(data, q) => data.filter((d) => d.startsWith(q))} />);

    type("대");
    expect(options().map((el) => el.textContent)).toEqual(["대구"]);
  });

  it("고르면 값이 들어가고 닫힌다", () => {
    const onChangeText = vi.fn();
    const onPick = vi.fn();
    render(<TxCombobox data={CITIES} onChangeText={onChangeText} onPick={onPick} />);

    fireEvent.focus(field());
    fireEvent.click(options()[1]);

    expect(field().value).toBe("부산");
    expect(onChangeText).toHaveBeenCalledWith("부산");
    expect(onPick).toHaveBeenCalledWith("부산");
    expect(list()).toBeNull();
  });

  /** 직접 친 것과 목록에서 고른 것을 구분해야 하는 자리가 있다. */
  it("직접 치면 onPick 은 오지 않는다", () => {
    const onPick = vi.fn();
    render(<TxCombobox data={CITIES} onPick={onPick} />);

    type("서울");
    expect(onPick).not.toHaveBeenCalled();
  });

  /** 원본 시제품은 잘라내고도 더 있다는 표시가 없어서 사용자가 이게 전부인 줄 알았다. */
  it("limit 으로 자르고 몇 개 더 있는지 알린다", () => {
    render(<TxCombobox data={CITIES} limit={2} />);

    fireEvent.focus(field());
    expect(options()).toHaveLength(2);
    expect(screen.getByText("…3개 더 있습니다")).not.toBeNull();
  });

  it("안내 줄은 고를 수 없다", () => {
    render(<TxCombobox data={CITIES} limit={2} />);

    fireEvent.focus(field());
    const more = screen.getByText("…3개 더 있습니다");
    expect(more.getAttribute("role")).toBeNull();
    expect(more.getAttribute("aria-hidden")).toBe("true");
  });

  it("잘리지 않으면 안내 줄이 없다", () => {
    render(<TxCombobox data={CITIES} limit={10} />);

    fireEvent.focus(field());
    expect(screen.queryByText(/더 있습니다/)).toBeNull();
  });
});

describe("TxCombobox — 키보드", () => {
  it("ArrowDown 으로 열고 첫 줄을 짚는다", () => {
    render(<TxCombobox data={CITIES} />);

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(field().getAttribute("aria-activedescendant")).toBe(options()[0].id);
  });

  it("위아래로 짚고 끝에서 돈다", () => {
    render(<TxCombobox data={["가", "나"]} />);

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(field().getAttribute("aria-activedescendant")).toBe(options()[1].id);

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(field().getAttribute("aria-activedescendant")).toBe(options()[0].id);

    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(field().getAttribute("aria-activedescendant")).toBe(options()[1].id);
  });

  it("Enter 로 짚은 줄을 고른다", () => {
    render(<TxCombobox data={CITIES} />);

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "Enter" });

    expect(field().value).toBe("부산");
    expect(list()).toBeNull();
  });

  /** 짚은 것이 없는데 막으면 폼 제출이나 소비자의 Enter 처리가 죽는다. */
  it("짚은 것이 없으면 Enter 를 막지 않는다", () => {
    render(<TxCombobox data={CITIES} />);

    fireEvent.focus(field());
    const notPrevented = fireEvent.keyDown(field(), { key: "Enter" });
    expect(notPrevented).toBe(true);
  });

  /** 글자 안에서 커서를 옮기는 키다. 목록 이동에 뺏기면 편집이 불편해진다. */
  it("Home·End 를 가로채지 않는다", () => {
    render(<TxCombobox data={CITIES} />);

    fireEvent.focus(field());
    expect(fireEvent.keyDown(field(), { key: "Home" })).toBe(true);
    expect(fireEvent.keyDown(field(), { key: "End" })).toBe(true);
  });

  it("Tab 을 가로채지 않는다 — 닫히고 다음 요소로 나간다", () => {
    render(<TxCombobox data={CITIES} />);

    fireEvent.focus(field());
    const notPrevented = fireEvent.keyDown(field(), { key: "Tab" });

    expect(list()).toBeNull();
    expect(notPrevented).toBe(true);
  });

  it("목록이 짧아지면 짚은 자리를 놓는다", () => {
    render(<TxCombobox data={CITIES} />);

    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(field().getAttribute("aria-activedescendant")).toBe(options()[2].id);

    // 한 줄만 남는다. 짚고 있던 3번째 자리는 사라진다.
    type("서");
    expect(field().getAttribute("aria-activedescendant")).toBeNull();
  });
});

describe("TxCombobox — 접근성과 구조", () => {
  it("입력창이 combobox 로 읽히고 목록과 이어진다", () => {
    render(<TxCombobox data={CITIES} />);

    expect(field().getAttribute("aria-expanded")).toBe("false");
    expect(field().getAttribute("aria-autocomplete")).toBe("list");

    fireEvent.focus(field());
    expect(field().getAttribute("aria-expanded")).toBe("true");
    expect(field().getAttribute("aria-controls")).toBe(list()!.id);
  });

  /** 브라우저 자동완성이 목록 위에 겹쳐 뜨면 둘 다 못 쓴다. */
  it("브라우저 자동완성을 끈다", () => {
    render(<TxCombobox data={CITIES} />);
    expect(field().getAttribute("autocomplete")).toBe("off");
  });

  it("목록을 body 로 띄운다 — 조상에 갇히지 않는다", () => {
    const { container } = render(
      <div style={{ overflow: "hidden" }}>
        <TxCombobox data={CITIES} />
      </div>
    );

    fireEvent.focus(field());
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    expect(document.body.querySelector('[data-tag="TxPopup"] [role="option"]')).not.toBeNull();
  });

  it("TxInput 과 같은 껍데기 클래스를 함께 건다", () => {
    const { container } = render(<TxCombobox data={CITIES} />);
    const root = container.querySelector('[data-tag="TxCombobox"]')!;

    expect(root.classList.contains("tx-input")).toBe(true);
    expect(root.classList.contains("tx-combobox")).toBe(true);
  });

  it("style 은 className 과 같은 자리에 붙는다", () => {
    const { container } = render(<TxCombobox data={CITIES} style={{ ["--tx-test" as string]: "1px" }} />);
    expect(container.querySelector<HTMLElement>('[data-tag="TxCombobox"]')!.style.getPropertyValue("--tx-test")).toBe("1px");
  });

  it("ref 가 입력창을 가리킨다", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TxCombobox data={CITIES} ref={ref} />);

    expect(ref.current?.tagName).toBe("INPUT");
  });

  it("InputHTMLAttributes 를 그대로 통과시킨다", () => {
    render(<TxCombobox data={CITIES} placeholder="지역" name="city" maxLength={10} />);

    expect(field().placeholder).toBe("지역");
    expect(field().name).toBe("city");
    expect(field().maxLength).toBe(10);
  });

  it("controlled 는 value 가 주인이다", () => {
    const { rerender } = render(<TxCombobox data={CITIES} value="서울" onChangeText={() => {}} />);
    expect(field().value).toBe("서울");

    type("바꿔봄");
    expect(field().value).toBe("서울");

    rerender(<TxCombobox data={CITIES} value="부산" onChangeText={() => {}} />);
    expect(field().value).toBe("부산");
  });
});

describe("TxCombobox — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxCombobox.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
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
    expect(css).toMatch(/\.tx-combobox__field\s*\{[^}]*outline:\s*none/);
  });

  it("마우스와 키보드가 같은 표시를 쓴다", () => {
    expect(css).toContain(".tx-combobox__item[data-active]");
    expect(css).not.toContain("__item:hover");
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxCombobox/TxCombobox.css" layer(tx);');
  });

  /** 같은 특이도라 순서로 정해진다. 앞에 실리면 껍데기 규칙을 못 덮는다. */
  it("TxInput.css 뒤에 실린다", () => {
    expect(styles.indexOf("TxInput/TxInput.css")).toBeLessThan(styles.indexOf("TxCombobox/TxCombobox.css"));
  });
});
