import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxSpinner } from "./TxSpinner";

/**
 * `001-TxSpinner-S3` (2차). 명세는 `docs/001_ui/components/01_TxSpinner.md`.
 *
 * **S2 에서 고친 결함을 못박는 것이 이 파일의 목적이다.** 각 테스트에 결함 ID 를 달아 두었고,
 * 그 ID 로 명세의 감사표를 찾아가면 왜 이 동작이어야 하는지가 있다.
 *
 * **jsdom 의 한계를 알고 쓴다.** 여기에는 스타일시트가 로드되지 않는다. D1("클래스가 `width`
 * 속성을 이긴다")은 CSS 캐스케이드에서 벌어진 일이라, `width` 속성만 확인하는 테스트는 결함을
 * 되살려도 그대로 통과한다 — 1차에서 실제로 확인했다.
 *
 * 그래서 아래쪽 "CSS 계약" 블록은 **`TxSpinner.css` 를 텍스트로 읽어 검사한다.**
 * 결과를 못 보면 원인을 보는 수밖에 없다. 파일을 읽는 테스트는 보통 냄새가 나지만,
 * 여기서는 그게 D1 을 되살아나지 못하게 막는 유일한 자동 수단이다.
 * 렌더된 실제 크기·회전 검증은 브라우저에서만 가능하다 → Storybook(🧑 게이트).
 *
 * `@testing-library/jest-dom` 은 쓰지 않는다. 여기서 필요한 건 속성·클래스 확인뿐이라
 * 기본 matcher 로 충분하고, 의존을 하나 덜 얹는 편이 낫다.
 */

// RTL 자동 cleanup 은 afterEach 가 전역일 때만 등록된다. 이 저장소는 globals 를 켜지 않았으므로 직접 붙인다.
afterEach(cleanup);

const renderSpinner = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const svg = container.querySelector("svg");
  if (!svg) throw new Error("TxSpinner 가 svg 를 렌더하지 않았다");
  return svg;
};

describe("TxSpinner — 크기", () => {
  it("size 가 width 와 height 속성 둘 다로 나간다", () => {
    const svg = renderSpinner(<TxSpinner size="1.5em" />);

    // 주의: 이 검사만으로는 D1 을 못 잡는다. 옛 구현도 두 속성은 똑같이 내보냈고,
    // 문제는 CSS 가 그중 width 를 덮어썼다는 것이다. D1 감시는 "CSS 계약" 블록이 한다.
    expect(svg.getAttribute("width")).toBe("1.5em");
    expect(svg.getAttribute("height")).toBe("1.5em");
  });

  it("size 를 주지 않으면 1em 이다 — 부모 font-size 를 따른다 (Q3)", () => {
    const svg = renderSpinner(<TxSpinner />);

    expect(svg.getAttribute("width")).toBe("1em");
    expect(svg.getAttribute("height")).toBe("1em");
  });

  it("size 에 number 를 주면 px 로 들어간다 (Q3)", () => {
    const svg = renderSpinner(<TxSpinner size={24} />);

    expect(svg.getAttribute("width")).toBe("24");
  });
});

describe("TxSpinner — className", () => {
  it("기본 클래스는 tx-spinner 하나뿐이다 (D3)", () => {
    const cls = renderSpinner(<TxSpinner />).getAttribute("class") ?? "";

    // 클래스가 늘면 그 안에 무엇이 들었는지 소비자가 알 수 없게 된다. 스타일은 전부 CSS 가 소유한다.
    // items-center 는 svg 에서 아무 효과도 없던 무효 클래스였다 (D3).
    expect(cls.trim().split(/\s+/)).toEqual(["tx-spinner"]);
  });

  it("className 은 기본 클래스를 교체하지 않고 덧붙는다 (D2)", () => {
    const cls = renderSpinner(<TxSpinner className="my-spinner" />).getAttribute("class") ?? "";

    // D2 는 "기본값 파라미터라 병합되지 않는다" 였다. S2 에서 기본값 자체를 없애 증상이 사라졌으므로
    // 이건 회귀 감시가 아니라 **계약을 못박는 가드**다 — 기본값을 다시 넣는 순간 이 테스트가 깨진다.
    expect(cls).toContain("tx-spinner");
    expect(cls).toContain("my-spinner");
  });

  it("className 은 소비자가 쓰는 스타일 방식을 묻지 않는다", () => {
    // 순수 CSS 클래스든 Tailwind 유틸이든 CSS Modules 해시든 그대로 나간다. 라이브러리는 판단하지 않는다.
    for (const given of ["my-spinner", "text-blue-500", "styles_spinner__a1b2"]) {
      expect(renderSpinner(<TxSpinner className={given} />).getAttribute("class")).toContain(given);
    }
  });
});

describe("TxSpinner — 접근성", () => {
  it("기본은 status 로 안내한다 (A1)", () => {
    const svg = renderSpinner(<TxSpinner />);

    expect(svg.getAttribute("role")).toBe("status");
    expect(svg.getAttribute("aria-label")).toBe("Loading");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
  });

  it("aria-label 을 주면 기본 문구를 이긴다 (A1)", () => {
    const svg = renderSpinner(<TxSpinner aria-label="불러오는 중" />);

    // 기본값이 영어라 언어를 강제하지 않으려면 이 경로가 반드시 열려 있어야 한다.
    expect(svg.getAttribute("aria-label")).toBe("불러오는 중");
  });

  it("decorative 는 안내를 끈다 (A2)", () => {
    const svg = renderSpinner(<TxSpinner decorative />);

    // 옆에 이미 읽을 문구가 있는 자리(버튼 안 등)에서 중복 안내를 막는 스위치다.
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();
    expect(svg.getAttribute("aria-label")).toBeNull();
  });

  it("decorative 는 소비자가 준 aria-label·role 도 버린다 (A2)", () => {
    const svg = renderSpinner(<TxSpinner decorative role="img" aria-label="불러오는 중" />);

    // 1차 Storybook 확인에서 잡힌 결함이다. 둘을 같이 주는 건 모순이고, aria-hidden 요소에 남은
    // 라벨은 읽히지도 않으면서 마크업만 어지럽힌다. 명세(§2)가 "빼고" 라고 적혀 있으니 뺀다.
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();
    expect(svg.getAttribute("aria-label")).toBeNull();
  });

  it("decorative 가 꺼져 있으면 role 도 덮을 수 있다", () => {
    expect(renderSpinner(<TxSpinner role="img" />).getAttribute("role")).toBe("img");
  });
});

describe("TxSpinner — 그 밖의 계약", () => {
  it("data-tag 를 붙인다 (C4)", () => {
    expect(renderSpinner(<TxSpinner />).getAttribute("data-tag")).toBe("TxSpinner");
  });

  it("SVGProps 를 그대로 통과시킨다", () => {
    const svg = renderSpinner(<TxSpinner id="loader" style={{ opacity: 0.5 }} />);

    expect(svg.getAttribute("id")).toBe("loader");
    expect(svg.style.opacity).toBe("0.5");
  });

  it("색을 상속받는다 — 색을 고정하지 않는다", () => {
    expect(
      renderSpinner(<TxSpinner />)
        .querySelector("path")
        ?.getAttribute("fill")
    ).toBe("currentColor");
  });
});

/**
 * **여기서부터는 렌더 결과가 아니라 `TxSpinner.css` 를 읽는다.**
 *
 * jsdom 에는 스타일시트가 없어서 캐스케이드를 볼 수 없다. 그런데 이 컴포넌트의 결함(D1)은
 * 바로 그 캐스케이드에서 났다. **결과를 못 보면 원인을 본다** — 그게 이 블록이다.
 */
describe("TxSpinner — CSS 계약", () => {
  // jsdom 환경에서는 전역 URL 이 jsdom 구현으로 바뀌어 있어 readFileSync 가 받지 못한다.
  const here = import.meta.dirname;

  // 주석 안의 예시 코드가 검사에 걸리면 안 된다. 선언만 남긴다.
  const css = readFileSync(join(here, "TxSpinner.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("크기를 선언하지 않는다 — size 속성이 이긴다 (D1)", () => {
    // **이것이 D1 의 회귀 감시다.** .tx-spinner 에 width 가 한 줄 들어오는 순간
    // CSS 가 width/height 속성을 다시 이기고 D1 이 되살아난다.
    expect(css).not.toMatch(/^\s*(width|height|inline-size|block-size|min-|max-|font-size)\s*:/m);
  });

  it("색을 선언하지 않는다 — 부모에게서 상속받는다", () => {
    expect(css).not.toMatch(/^\s*(color|fill|stroke|background)[\w-]*\s*:/m);
  });

  it("모션 저감에서 멈추지 않고 늦춘다 (A3)", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
    // animation: none 이나 animation-play-state: paused 로 바뀌면 "로딩 중" 정보가 사라진다.
    expect(css).toMatch(/animation-duration:\s*var\(--tx-spinner-duration-reduced\)/);
    expect(css).not.toMatch(/animation(-name)?:\s*none|animation-play-state/);
  });

  it("소비자가 속도를 바꿀 수 있다 — 값이 토큰으로 나가 있다", () => {
    expect(css).toMatch(/--tx-spinner-duration:\s*\S/);
    expect(css).toMatch(/animation:[^;]*var\(--tx-spinner-duration\)/);
  });

  it("keyframes 이름에 tx- 접두가 붙는다", () => {
    // 전역 이름공간이라, spin 같은 이름을 쓰면 소비자 앱의 keyframes 와 조용히 부딪힌다.
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(([, name]) => name);

    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(name, `접두 없는 keyframes: ${name}`).toMatch(/^tx-/);
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    const bundleEntry = readFileSync(join(here, "..", "styles.css"), "utf8");

    expect(bundleEntry).toContain("./TxSpinner/TxSpinner.css");
  });
});
