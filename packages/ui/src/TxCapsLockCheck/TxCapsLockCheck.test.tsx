import { cleanup, fireEvent, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxInput } from "../TxInput";
import { TxCapsLockCheck } from "./TxCapsLockCheck";

/**
 * 이 컴포넌트는 **경고의 정확도가 전부다.** 손대지 않은 칸에 뜨거나, 떠 있는데 안 읽히면
 * 없느니만 못하다. 그래서 "언제 뜨고 언제 사라지는가" 와 "스크린리더에 닿는가" 를 못 박는다.
 */

afterEach(cleanup);

/**
 * jsdom 의 `KeyboardEvent` 는 CapsLock 상태를 초기화 인자로 받지 않는다. 그리고 React 는
 * 네이티브 이벤트의 `getModifierState` 를 그대로 부르므로, 그 자리에 직접 얹어야 한다.
 */
const capsKey = (el: Element, on: boolean) => {
  const evt = new KeyboardEvent("keydown", { key: "a", bubbles: true });
  Object.defineProperty(evt, "getModifierState", { value: () => on });
  fireEvent(el, evt);
};

const setup = (ui: React.ReactElement) => {
  const { container } = render(ui);
  return {
    container,
    input: container.querySelector("input")!,
    message: () => container.querySelector(".tx-capslock__message")!
  };
};

describe("TxCapsLockCheck — 언제 뜨는가", () => {
  it("처음에는 경고가 없다", () => {
    const { message } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    expect(message().textContent).toBe("");
  });

  it("감싼 입력창에서 Caps Lock 이 켜진 채 키를 누르면 뜬다", () => {
    const { input, message } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    capsKey(input, true);
    expect(message().textContent).toContain("Caps Lock");
  });

  it("꺼진 채 키를 누르면 사라진다", () => {
    const { input, message } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    capsKey(input, true);
    capsKey(input, false);
    expect(message().textContent).toBe("");
  });

  /**
   * 원본은 `window` 에 리스너를 붙여서, 화면 어디서 타이핑하든 반응했다.
   * 로그인 폼을 띄워 둔 채 다른 곳에서 Caps Lock 을 켜면 손대지 않은 칸에 경고가 떴다.
   */
  it("바깥에서 누른 키에는 반응하지 않는다", () => {
    const { container } = render(
      <div>
        <input data-outside />
        <TxCapsLockCheck>
          <TxInput type="password" />
        </TxCapsLockCheck>
      </div>
    );

    capsKey(container.querySelector("[data-outside]")!, true);
    expect(container.querySelector(".tx-capslock__message")!.textContent).toBe("");
  });

  it("포커스가 밖으로 나가면 내린다", () => {
    const { container, input, message } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    capsKey(input, true);
    expect(message().textContent).toContain("Caps Lock");

    fireEvent.blur(container.querySelector(".tx-capslock__field")!, { relatedTarget: document.body });
    expect(message().textContent).toBe("");
  });

  it("창을 벗어나면 내린다 — 다른 창의 상태는 알 수 없다", () => {
    const { input, message } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    capsKey(input, true);
    fireEvent.blur(window);

    expect(message().textContent).toBe("");
  });
});

describe("TxCapsLockCheck — 스크린리더에 닿는가", () => {
  /**
   * 경고가 뜰 때 비로소 만들면 스크린리더가 그 변화를 놓친다.
   * live region 은 **미리 자리잡고 있어야** 안에서 바뀐 내용을 읽어 준다.
   */
  it("안내 영역이 경고 전에도 이미 있다", () => {
    const { message } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    const el = message();
    expect(el).not.toBeNull();
    expect(el.getAttribute("role")).toBe("status");
    expect(el.getAttribute("aria-live")).toBe("polite");
  });

  it("경고가 뜨면 입력창과 이어 준다", () => {
    const { input, message } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    expect(input.getAttribute("aria-describedby")).toBeNull();

    capsKey(input, true);
    expect(input.getAttribute("aria-describedby")).toBe(message().id);
  });

  it("소비자가 준 aria-describedby 를 지우지 않는다", () => {
    const { input, message } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" aria-describedby="hint" />
      </TxCapsLockCheck>
    );

    capsKey(input, true);
    expect(input.getAttribute("aria-describedby")).toBe(`hint ${message().id}`);
  });

  it("표시는 보조 요소라 읽지 않는다", () => {
    const { container, input } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    capsKey(input, true);
    expect(container.querySelector(".tx-capslock__icon")!.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("TxCapsLockCheck — 계약", () => {
  it("text 로 문구를 바꾼다", () => {
    const { input, message } = setup(
      <TxCapsLockCheck text="대문자 잠금 켜짐">
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    capsKey(input, true);
    expect(message().textContent).toContain("대문자 잠금 켜짐");
  });

  it("icon={null} 이면 표시가 없다", () => {
    const { container, input } = setup(
      <TxCapsLockCheck icon={null}>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    capsKey(input, true);
    expect(container.querySelector(".tx-capslock__icon")).toBeNull();
  });

  it("data-tag 와 상태 표시를 붙인다", () => {
    const { container, input } = setup(
      <TxCapsLockCheck>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    const root = container.querySelector('[data-tag="TxCapsLockCheck"]')!;
    expect(root.hasAttribute("data-on")).toBe(false);
    expect(root.getAttribute("data-preserve-space")).toBe("");

    capsKey(input, true);
    expect(root.getAttribute("data-on")).toBe("");
  });

  it("preserveSpace={false} 면 공간 표시가 빠진다", () => {
    const { container } = setup(
      <TxCapsLockCheck preserveSpace={false}>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    expect(container.querySelector('[data-tag="TxCapsLockCheck"]')!.hasAttribute("data-preserve-space")).toBe(false);
  });

  it("className 은 기본 클래스를 교체하지 않고 덧붙는다", () => {
    const { container } = setup(
      <TxCapsLockCheck className="w-80">
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    const root = container.querySelector('[data-tag="TxCapsLockCheck"]')!;
    expect(root.classList.contains("tx-capslock")).toBe(true);
    expect(root.classList.contains("w-80")).toBe(true);
  });

  /** CSS 변수는 아래로만 상속된다. 껍데기가 아닌 곳에 붙으면 토큰을 인라인으로 못 준다. */
  it("style 은 className 과 같은 자리에 붙는다", () => {
    const { container } = setup(
      <TxCapsLockCheck style={{ ["--tx-test" as string]: "1px" }}>
        <TxInput type="password" />
      </TxCapsLockCheck>
    );

    expect(container.querySelector<HTMLElement>('[data-tag="TxCapsLockCheck"]')!.style.getPropertyValue("--tx-test")).toBe("1px");
  });

  it("엘리먼트가 아닌 자식도 그냥 렌더한다", () => {
    const { container } = render(<TxCapsLockCheck>글자만</TxCapsLockCheck>);
    expect(container.querySelector(".tx-capslock__field")!.textContent).toBe("글자만");
  });
});

describe("TxCapsLockCheck — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxCapsLockCheck.css"), "utf8"));
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

  /**
   * 원본은 `&nbsp;` 를 넣어 높이를 잡았는데, 빈 상태에만 글자 크기 클래스가 안 붙어
   * 경고가 뜨는 순간 막으려던 그 점프가 났다. 높이를 계산으로 내면 두 상태가 정확히 맞는다.
   */
  it("빈 줄 높이를 글자 크기에서 계산한다", () => {
    expect(css).toMatch(/\[data-preserve-space\][^{]*\{[^}]*min-height:\s*calc\(var\(--tx-capslock-font-size\) \* var\(--tx-capslock-line-height\)\)/);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    expect(styles).toContain('@import "./TxCapsLockCheck/TxCapsLockCheck.css" layer(tx);');
  });
});
