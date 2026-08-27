import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxFlex } from "./TxFlex";

/**
 * 명세: `docs/001_ui.md`
 *
 * **이 컴포넌트의 결함 둘은 전부 CSS 쪽에서 났다.**
 *
 * - D1: 기본값이 `className="gap-2"` 라 소비자가 `className` 을 주는 순간 간격이 사라졌다
 * - D2: `flex`·`gap-2` 를 클래스 문자열로 내는데 배포 CSS 에 그 규칙이 없었다 —
 *   Tailwind 없는 소비자는 `display: flex` 조차 못 받았다
 *
 * jsdom 에는 스타일시트가 없어 둘 다 렌더 결과로는 안 보인다. 그래서 아래쪽 "CSS 계약" 블록이
 * `TxFlex.css` 를 **텍스트로 읽어** 검사한다 (`TxSpinner` 2차에서 만든 방식,
 * docs/001_ui.md).
 */

// RTL 자동 cleanup 은 afterEach 가 전역일 때만 등록된다. 이 저장소는 globals 를 켜지 않았다.
afterEach(cleanup);

const flex = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const el = container.querySelector<HTMLElement>('[data-tag="TxFlex"]');
  if (!el) throw new Error("TxFlex 가 렌더되지 않았다");
  return el;
};

describe("TxFlex — className", () => {
  it("기본 클래스는 tx-flex 하나뿐이다 — 간격도 클래스로 내지 않는다 (D1)", () => {
    const cls = flex(<TxFlex />).getAttribute("class") ?? "";

    // 예전에는 `flex gap-2` 두 개였고, `gap-2` 는 기본값 파라미터라 소비자가 className 을
    // 주는 순간 사라졌다. 스타일은 전부 CSS 가 소유한다 — 여기에 클래스가 하나라도 늘면 D1 이다.
    //
    // "간격이 없다" 를 따로 검사하지 않는다. 이 한 줄이 그 상위집합이고, 나눠 두면 변이 하나에
    // 둘이 같이 깨진다.
    expect(cls.trim().split(/\s+/)).toEqual(["tx-flex"]);
  });

  it("className 은 기본 클래스를 교체하지 않고 덧붙는다 (D1)", () => {
    const cls = flex(<TxFlex className="flex-col" />).getAttribute("class") ?? "";

    // **이것이 D1 의 회귀 감시다.** 기본값 파라미터를 다시 넣는 순간 이 테스트가 깨진다.
    // 실제 앱 코드(`Shell.tsx:47`)가 방향만 주고 간격을 잃은 상태였다.
    expect(cls).toContain("tx-flex");
    expect(cls).toContain("flex-col");
  });

  it("className 은 소비자가 쓰는 스타일 방식을 묻지 않는다", () => {
    for (const given of ["my-row", "flex-col", "styles_row__a1b2"]) {
      expect(flex(<TxFlex className={given} />).getAttribute("class")).toContain(given);
      cleanup();
    }
  });
});

describe("TxFlex — 구조", () => {
  it("data-tag 를 붙인다", () => {
    expect(flex(<TxFlex />).getAttribute("data-tag")).toBe("TxFlex");
  });

  it("children 을 그대로 렌더한다", () => {
    const el = flex(
      <TxFlex>
        <span>하나</span>
        <span>둘</span>
      </TxFlex>
    );

    expect(el.children.length).toBe(2);
    expect(el.textContent).toBe("하나둘");
  });

  it("div 를 렌더한다", () => {
    expect(flex(<TxFlex />).tagName).toBe("DIV");
  });

  it("안쪽 슬롯을 두지 않는다 — 자식이 직속이다", () => {
    // 슬롯을 끼우면 소비자의 flex 자식이 하나로 뭉쳐 배치가 무너진다.
    const el = flex(
      <TxFlex>
        <span id="a" />
      </TxFlex>
    );

    expect(el.firstElementChild?.id).toBe("a");
  });
});

describe("TxFlex — 그 밖의 계약", () => {
  it("HTMLAttributes 를 그대로 통과시킨다", () => {
    const el = flex(<TxFlex id="row" role="group" onClick={() => {}} />);

    expect(el.getAttribute("id")).toBe("row");
    expect(el.getAttribute("role")).toBe("group");
  });

  it("style 로 토큰을 이 인스턴스만 바꿀 수 있다", () => {
    const el = flex(<TxFlex style={{ "--tx-flex-gap": "2rem" } as React.CSSProperties} />);

    expect(el.style.getPropertyValue("--tx-flex-gap")).toBe("2rem");
  });

  it("통과 props 가 data-tag 를 덮지 못한다", () => {
    // 밖에서 뒤집히면 셀렉터로 쓰는 표식이 어긋난다 (20_design §3).
    const el = flex(<TxFlex {...({ "data-tag": "밖에서" } as Record<string, string>)} />);

    expect(el.getAttribute("data-tag")).toBe("TxFlex");
  });
});

/**
 * **여기서부터는 렌더 결과가 아니라 `TxFlex.css` 를 읽는다.**
 *
 * 이 컴포넌트가 하는 일이 `display` 와 `gap` 둘뿐이라, **그 두 줄이 곧 계약이다.**
 * 값은 검사하지 않는다 — 간격을 고칠 때마다 테스트를 고치게 되면 안 된다
 * (docs/001_ui.md).
 */
describe("TxFlex — CSS 계약", () => {
  const here = import.meta.dirname;

  // 주석 안의 예시 코드가 검사에 걸리면 안 된다. 선언만 남긴다.
  const css = readFileSync(join(here, "TxFlex.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("display: flex 를 선언한다 (D2)", () => {
    // **이것이 D2 의 회귀 감시다.** 이 줄이 없으면 Tailwind 없는 소비자는
    // `display: flex` 조차 못 받는다 — 그게 이행 전 상태였다.
    expect(css).toMatch(/display:\s*flex/);
  });

  it("간격이 토큰으로 나가 있다 (D1)", () => {
    expect(css).toMatch(/--tx-flex-gap:\s*\S/);
    expect(css).toMatch(/gap:\s*var\(--tx-flex-gap\)/);
  });

  it("방향·정렬·줄바꿈을 선언하지 않는다", () => {
    // 여기서 정하면 소비자가 `className` 으로 바꿀 때마다 우리 선언과 싸운다.
    expect(css).not.toMatch(/^\s*(flex-direction|align-items|justify-content|flex-wrap|flex-flow)\s*:/m);
  });

  it("색과 크기를 선언하지 않는다 — 놓인 자리에서 상속받는다", () => {
    expect(css).not.toMatch(/^\s*(color|background|font-size|width|height)[\w-]*\s*:/m);
  });

  it(".dark 분기가 없다 (20_design §6)", () => {
    expect(css).not.toContain(".dark");
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    const bundleEntry = readFileSync(join(here, "..", "styles.css"), "utf8");

    expect(bundleEntry).toContain("./TxFlex/TxFlex.css");
  });
});
