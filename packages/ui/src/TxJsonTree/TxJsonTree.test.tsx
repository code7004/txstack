import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxJsonTree } from "./TxJsonTree";

/**
 * 이 컴포넌트가 하는 것은 셋이다 — **보기 · 고치기 · 변화 지켜보기.**
 *
 * 원본은 앞의 둘만 있었고 그마저 새는 데가 많았다. 편집이 타입을 잃어 `42` 가 `"42"` 가
 * 됐고, 키 추가는 네이티브 `prompt()` 였고, 펼침 상태를 노드마다 들고 있어 배열에서
 * 한 줄을 지우면 상태가 엉뚱한 줄로 옮겨 갔다.
 */

afterEach(cleanup);

const SAMPLE = {
  id: 1024,
  name: "홍길동",
  active: true,
  score: 0,
  nickname: "",
  deletedAt: null,
  tags: ["신규", "VIP"],
  profile: { city: "서울" }
};

/** 값 칸을 글자로 찾는다. 읽기 전용이면 span, 고칠 수 있으면 button 이다. */
const valueOf = (text: string) => screen.getByText(text);

describe("TxJsonTree — 보기", () => {
  it("키와 값을 그린다", () => {
    render(<TxJsonTree data={SAMPLE} />);

    expect(screen.getByText("id")).toBeTruthy();
    expect(screen.getByText("1024")).toBeTruthy();
  });

  /** falsy 를 빠뜨리면 "값이 없는 것" 과 "값이 0 인 것" 이 구분되지 않는다. */
  it("0 · false · 빈 문자열 · null 을 숨기지 않는다", () => {
    render(<TxJsonTree data={{ zero: 0, no: false, blank: "", nothing: null }} />);

    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("false")).toBeTruthy();
    expect(screen.getByText('""')).toBeTruthy();
    expect(screen.getByText("null")).toBeTruthy();
  });

  /** 따옴표가 없으면 문자열 `"1"` 과 숫자 `1` 이 화면에서 같아 보인다. */
  it("문자열에는 따옴표를 씌운다", () => {
    render(<TxJsonTree data={{ a: "1", b: 1 }} />);

    expect(screen.getByText('"1"')).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("타입을 값에 실어 보낸다 — 색은 CSS 가 정한다", () => {
    render(<TxJsonTree data={{ s: "a", n: 1, b: true, z: null }} />);

    expect(valueOf('"a"').dataset.type).toBe("string");
    expect(valueOf("1").dataset.type).toBe("number");
    expect(valueOf("true").dataset.type).toBe("boolean");
    expect(valueOf("null").dataset.type).toBe("null");
  });

  it("가지에는 안에 든 수를 보여 준다", () => {
    render(<TxJsonTree data={{ list: [1, 2, 3], obj: { a: 1 } }} />);

    expect(screen.getByText("[3]")).toBeTruthy();
    expect(screen.getByText("{1}")).toBeTruthy();
  });

  it("빈 객체·빈 배열도 형태를 잃지 않는다", () => {
    render(<TxJsonTree data={{ o: {}, l: [] }} />);

    expect(screen.getByText("{0}")).toBeTruthy();
    expect(screen.getByText("[0]")).toBeTruthy();
  });

  it("배열은 인덱스를 키로 보여 준다", () => {
    render(<TxJsonTree data={{ tags: ["신규", "VIP"] }} />);

    expect(screen.getByText('"신규"')).toBeTruthy();
    expect(screen.getByText('"VIP"')).toBeTruthy();
  });

  it("원시값 하나만 줘도 그린다", () => {
    render(<TxJsonTree data="그냥 글자" />);

    expect(screen.getByText('"그냥 글자"')).toBeTruthy();
  });

  it("locale 은 키만 옮기고 값은 그대로 둔다", () => {
    render(<TxJsonTree data={{ name: "name" }} locale={(text) => (text === "name" ? "이름" : text)} />);

    expect(screen.getByText("이름")).toBeTruthy();
    expect(screen.getByText('"name"')).toBeTruthy();
  });
});

describe("TxJsonTree — 펼치고 접기", () => {
  it("기본은 전부 펼쳐져 있다", () => {
    render(<TxJsonTree data={SAMPLE} />);

    expect(screen.getByText('"서울"')).toBeTruthy();
  });

  it("접으면 안쪽이 사라진다", () => {
    render(<TxJsonTree data={{ profile: { city: "서울" } }} />);

    fireEvent.click(screen.getByRole("button", { name: /profile 접기/ }));
    expect(screen.queryByText('"서울"')).toBeNull();
  });

  it("다시 누르면 펼쳐진다", () => {
    render(<TxJsonTree data={{ profile: { city: "서울" } }} />);

    fireEvent.click(screen.getByRole("button", { name: /profile 접기/ }));
    fireEvent.click(screen.getByRole("button", { name: /profile 펼치기/ }));

    expect(screen.getByText('"서울"')).toBeTruthy();
  });

  /** 원본의 `+`/`-` 는 이름도 상태도 없어서 스크린리더로는 무엇인지 알 수 없었다. */
  it("펼침 버튼이 상태를 알린다", () => {
    render(<TxJsonTree data={{ profile: { city: "서울" } }} />);

    const toggle = screen.getByRole("button", { name: /profile/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: /profile/ }).getAttribute("aria-expanded")).toBe("false");
  });

  it("defaultExpandedDepth 로 깊은 곳을 접은 채 시작한다", () => {
    render(<TxJsonTree data={{ a: { b: { c: 1 } } }} defaultExpandedDepth={1} />);

    expect(screen.getByText("a")).toBeTruthy();
    expect(screen.queryByText("b")).toBeNull();
  });

  it("0 이면 맨 윗줄만 보인다", () => {
    render(<TxJsonTree data={{ a: 1 }} defaultExpandedDepth={0} />);

    expect(screen.queryByText("a")).toBeNull();
    expect(screen.getByText("{1}")).toBeTruthy();
  });

  /**
   * 원본은 펼침 상태를 노드마다 `useState` 로 들고 있었다. 배열 항목의 React key 가
   * 인덱스라, 한 줄을 지우면 **상태가 그 자리에 남아 다른 줄의 것이 됐다.**
   */
  it("배열에서 한 줄이 사라져도 펼침 상태가 옮겨 가지 않는다", () => {
    const data = { list: [{ v: 1 }, { v: 2 }] };
    const { rerender } = render(<TxJsonTree data={data} />);

    // 첫째 줄만 접는다
    fireEvent.click(screen.getAllByRole("button", { name: /0 접기/ })[0]);
    expect(screen.getAllByText("v")).toHaveLength(1);

    // 첫째 줄을 지우면 둘째가 0 번이 된다. 접힘이 따라가면 안 된다
    rerender(<TxJsonTree data={{ list: [{ v: 2 }] }} />);
    expect(screen.queryByText("v")).toBeNull();
  });
});

describe("TxJsonTree — 고치기", () => {
  it("onChange 가 없으면 읽기 전용이다", () => {
    render(<TxJsonTree data={SAMPLE} />);

    expect(screen.queryByRole("button", { name: /고치기/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /지우기/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /추가/ })).toBeNull();
  });

  it("값을 누르면 편집 칸이 열린다", () => {
    render(<TxJsonTree data={{ name: "홍길동" }} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /name 고치기/ }));
    expect(screen.getByLabelText("값")).toBeTruthy();
  });

  it("고치면 바뀐 객체가 통째로 온다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ name: "홍길동", keep: 1 }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /name 고치기/ }));
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "임꺽정" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange).toHaveBeenCalledWith({ name: "임꺽정", keep: 1 }, expect.anything());
  });

  it("무엇이 어떻게 바뀌었는지 함께 온다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ a: { b: "옛것" } }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /b 고치기/ }));
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "새것" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange.mock.calls[0][1]).toEqual({ kind: "edit", path: ["a", "b"], prev: "옛것", next: "새것" });
  });

  /** 원본은 `<input>` 이 준 문자열을 그대로 내보내서 `42` 가 `"42"` 가 됐다. */
  it("숫자를 고쳐도 숫자로 남는다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ id: 1024 }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /id 고치기/ }));
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "2048" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange).toHaveBeenCalledWith({ id: 2048 }, expect.anything());
  });

  it("참거짓은 고를 수 있다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ active: true }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /active 고치기/ }));
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "false" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange).toHaveBeenCalledWith({ active: false }, expect.anything());
  });

  /** 원본은 `null` 자리에 문자열밖에 넣을 수 없었다. */
  it("타입을 바꿔 null 을 채울 수 있다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ deletedAt: null }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /deletedAt 고치기/ }));
    fireEvent.change(screen.getByLabelText("타입"), { target: { value: "number" } });
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange).toHaveBeenCalledWith({ deletedAt: 7 }, expect.anything());
  });

  it("타입 칸은 지금 타입에서 시작한다", () => {
    render(<TxJsonTree data={{ id: 1024 }} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /id 고치기/ }));
    expect((screen.getByLabelText("타입") as HTMLSelectElement).value).toBe("number");
  });

  it("취소하면 아무 일도 없다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ name: "홍길동" }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /name 고치기/ }));
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "임꺽정" } });
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('"홍길동"')).toBeTruthy();
  });

  it("Enter 로 저장한다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ name: "홍길동" }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /name 고치기/ }));
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "임꺽정" } });
    fireEvent.keyDown(screen.getByLabelText("값"), { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith({ name: "임꺽정" }, expect.anything());
  });

  it("Escape 로 접는다", () => {
    render(<TxJsonTree data={{ name: "홍길동" }} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /name 고치기/ }));
    fireEvent.keyDown(screen.getByLabelText("값"), { key: "Escape" });

    expect(screen.queryByLabelText("값")).toBeNull();
  });

  /** 트리가 모달 안에 있으면, 편집을 접으려다 모달까지 닫히면 안 된다. */
  it("Escape 가 트리 밖으로 새지 않는다", () => {
    const onOuterKeyDown = vi.fn();
    render(
      <div onKeyDown={onOuterKeyDown}>
        <TxJsonTree data={{ name: "홍길동" }} onChange={vi.fn()} />
      </div>
    );

    fireEvent.click(screen.getByRole("button", { name: /name 고치기/ }));
    fireEvent.keyDown(screen.getByLabelText("값"), { key: "Escape" });

    expect(onOuterKeyDown).not.toHaveBeenCalled();
  });
});

describe("TxJsonTree — 줄 넣고 지우기", () => {
  it("지우면 그 줄이 빠진 객체가 온다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ a: 1, b: 2 }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /b 지우기/ }));
    expect(onChange).toHaveBeenCalledWith({ a: 1 }, { kind: "remove", path: ["b"], prev: 2 });
  });

  it("배열에서 지우면 자리가 당겨진다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ list: [1, 2, 3] }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /1 지우기/ }));
    expect(onChange).toHaveBeenCalledWith({ list: [1, 3] }, expect.anything());
  });

  /** 뿌리를 지우면 트리 자체가 없어진다. */
  it("뿌리에는 지우기가 없다", () => {
    render(<TxJsonTree data={{ a: 1 }} onChange={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: /지우기/ })).toHaveLength(1);
  });

  /** 원본은 네이티브 `prompt()` 를 띄웠다. 샌드박스 iframe 에서 막히고 번역도 안 된다. */
  it("키 추가에 prompt 를 쓰지 않는다", () => {
    const prompt = vi.spyOn(window, "prompt");
    render(<TxJsonTree data={{ a: 1 }} onChange={vi.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: /추가/ })[0]);

    expect(prompt).not.toHaveBeenCalled();
    expect(screen.getByLabelText("키")).toBeTruthy();
    prompt.mockRestore();
  });

  it("객체에 새 키를 넣는다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ a: 1 }} onChange={onChange} />);

    fireEvent.click(screen.getAllByRole("button", { name: /추가/ })[0]);
    fireEvent.change(screen.getByLabelText("키"), { target: { value: "b" } });
    fireEvent.change(screen.getByLabelText("타입"), { target: { value: "number" } });
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange).toHaveBeenCalledWith({ a: 1, b: 2 }, { kind: "add", path: ["b"], next: 2 });
  });

  it("키가 비면 넣지 않는다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ a: 1 }} onChange={onChange} />);

    fireEvent.click(screen.getAllByRole("button", { name: /추가/ })[0]);
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  /** 배열에는 키가 없다. 뒤에 붙는다. */
  it("배열에는 키 칸이 없고 뒤에 붙는다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ list: [1] }} onChange={onChange} />);

    const listItem = screen.getByText("list").closest("li")!;
    fireEvent.click(within(listItem).getAllByRole("button", { name: /추가/ })[0]);

    expect(screen.queryByLabelText("키")).toBeNull();

    fireEvent.change(screen.getByLabelText("타입"), { target: { value: "number" } });
    fireEvent.change(screen.getByLabelText("값"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange).toHaveBeenCalledWith({ list: [1, 2] }, { kind: "add", path: ["list", 1], next: 2 });
  });

  it("빈 객체와 빈 배열도 넣을 수 있다", () => {
    const onChange = vi.fn();
    render(<TxJsonTree data={{ a: 1 }} onChange={onChange} />);

    fireEvent.click(screen.getAllByRole("button", { name: /추가/ })[0]);
    fireEvent.change(screen.getByLabelText("키"), { target: { value: "obj" } });
    fireEvent.change(screen.getByLabelText("타입"), { target: { value: "object" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onChange).toHaveBeenCalledWith({ a: 1, obj: {} }, expect.anything());
  });
});

describe("TxJsonTree — 변화 지켜보기", () => {
  it("watch 없이는 반짝이지 않는다", () => {
    const { container, rerender } = render(<TxJsonTree data={{ a: 1 }} />);
    rerender(<TxJsonTree data={{ a: 2 }} />);

    expect(container.querySelector(".tx-json-tree__flash")).toBeNull();
  });

  it("바뀐 줄만 반짝인다", () => {
    const { container, rerender } = render(<TxJsonTree data={{ a: 1, b: 1 }} watch />);
    rerender(<TxJsonTree data={{ a: 2, b: 1 }} watch />);

    const flashes = container.querySelectorAll(".tx-json-tree__flash");
    expect(flashes).toHaveLength(1);
    expect(flashes[0].closest("li")?.textContent).toContain("a");
  });

  it("첫 렌더에는 반짝이지 않는다", () => {
    const { container } = render(<TxJsonTree data={{ a: 1 }} watch />);

    expect(container.querySelector(".tx-json-tree__flash")).toBeNull();
  });

  it("값이 같으면 새 객체여도 조용하다", () => {
    const { container, rerender } = render(<TxJsonTree data={{ a: 1 }} watch />);
    rerender(<TxJsonTree data={{ a: 1 }} watch />);

    expect(container.querySelector(".tx-json-tree__flash")).toBeNull();
  });

  it("여러 자리가 함께 바뀌면 전부 반짝인다", () => {
    const { container, rerender } = render(<TxJsonTree data={{ a: 1, b: 1 }} watch />);
    rerender(<TxJsonTree data={{ a: 2, b: 2 }} watch />);

    expect(container.querySelectorAll(".tx-json-tree__flash")).toHaveLength(2);
  });

  /** 같은 줄이 잇달아 바뀌어도 매번 보여야 한다. 새 요소라야 애니메이션이 다시 돈다. */
  it("같은 줄이 다시 바뀌면 새로 반짝인다", () => {
    const { container, rerender } = render(<TxJsonTree data={{ a: 1 }} watch />);

    rerender(<TxJsonTree data={{ a: 2 }} watch />);
    const first = container.querySelector(".tx-json-tree__flash");

    rerender(<TxJsonTree data={{ a: 3 }} watch />);
    const second = container.querySelector(".tx-json-tree__flash");

    expect(second).not.toBe(first);
  });

  it("반짝임은 스크린리더에 읽히지 않는다", () => {
    const { container, rerender } = render(<TxJsonTree data={{ a: 1 }} watch />);
    rerender(<TxJsonTree data={{ a: 2 }} watch />);

    expect(container.querySelector(".tx-json-tree__flash")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("TxJsonTree — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxJsonTree data={{}} className="my-tree" />);
    const root = container.querySelector('[data-tag="TxJsonTree"]')!;

    expect(root.classList.contains("tx-json-tree")).toBe(true);
    expect(root.classList.contains("my-tree")).toBe(true);
  });

  it("안쪽 슬롯에 클래스를 줄 수 있다", () => {
    const { container } = render(<TxJsonTree data={{ a: 1 }} classNames={{ row: "r1", key: "k1", value: "v1" }} />);

    expect(container.querySelector(".tx-json-tree__row.r1")).toBeTruthy();
    expect(container.querySelector(".tx-json-tree__key.k1")).toBeTruthy();
    expect(container.querySelector(".tx-json-tree__value.v1")).toBeTruthy();
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(<TxJsonTree data={{}} id="tree" data-testid="t" />);
    const root = container.querySelector('[data-tag="TxJsonTree"]') as HTMLElement;

    expect(root.id).toBe("tree");
    expect(root.dataset.testid).toBe("t");
  });
});

describe("TxJsonTree — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxJsonTree.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const source = readFileSync(join(here, "TxJsonTree.tsx"), "utf8") + readFileSync(join(here, "TxJsonTreeNode.tsx"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toMatch(/--tx-json-tree-number-color:\s*var\(--tx-color-primary\)/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxJsonTree/TxJsonTree.css" layer(tx);');
  });

  /** 타입 색은 전역 토큰에서 끌어온다. 새 전역색을 만들면 소비자가 챙길 것이 는다. */
  it("타입 색을 위해 새 전역 토큰을 만들지 않는다", () => {
    for (const name of ["--tx-color-success", "--tx-color-info", "--tx-color-string"]) {
      expect(css, name).not.toContain(name);
    }
  });

  /** 그 역할을 달면 화살표 이동과 roving tabindex 까지 갖춰야 한다. */
  it('갖추지 않은 role="tree" 를 달지 않는다', () => {
    expect(source).not.toMatch(/role=["']tree/);
  });

  /**
   * 반짝임은 `z-index: -1` 로 글자 뒤에 깔린다. 줄이 쌓임 맥락을 만들지 않으면 그 `-1` 이
   * 페이지 배경 뒤까지 내려가 **아무것도 안 보인다.** 둘은 함께 있어야 한다.
   */
  it("반짝임을 줄 안에 가둔다 — z-index: -1 은 isolation 과 짝이다", () => {
    const row = css.match(/\.tx-json-tree__row\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(css).toMatch(/\.tx-json-tree__flash[^}]*z-index:\s*-1/);
    expect(row).toMatch(/isolation:\s*isolate/);
  });

  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");
  });

  it("반짝임 시간이 CSS 와 코드에서 같다", () => {
    const fromCss = css.match(/--tx-json-tree-flash-duration:\s*(\d+)ms/)?.[1];
    const fromSource = readFileSync(join(here, "TxJsonTree.tsx"), "utf8").match(/FLASH_MS\s*=\s*(\d+)/)?.[1];

    expect(fromCss).toBe(fromSource);
  });
});
