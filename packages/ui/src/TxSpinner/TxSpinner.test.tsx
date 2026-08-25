import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TxSpinner } from "./TxSpinner";

/**
 * `001-TxSpinner-S3`. 명세는 `docs/001_ui/components/TxSpinner.md`.
 *
 * **S2 에서 고친 결함을 못박는 것이 이 파일의 목적이다.** 각 테스트에 결함 ID 를 달아 두었고,
 * 그 ID 로 명세의 감사표를 찾아가면 왜 이 동작이어야 하는지가 있다.
 *
 * 클래스 문자열을 검사하는 테스트가 있는데, 이건 구현 세부가 아니라 **커스터마이징 계약**이다.
 * 소비자가 무엇을 덮을 수 있고 무엇이 남는가는 공개 약속이다.
 *
 * **jsdom 의 한계를 알고 쓴다.** 여기에는 Tailwind CSS 가 없다. D1("`w-full` 이 `width` 속성을
 * 이긴다")은 CSS 캐스케이드에서 벌어진 일이라, `width` 속성만 확인하는 테스트는 결함을 되살려도
 * 그대로 통과한다 — 실제로 확인했다. 그래서 D1 의 회귀 감시는 **기본 클래스에 크기 유틸이
 * 없다**는 쪽으로 건다. 렌더된 실제 크기 검증은 이 계층에서 할 수 없다.
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
    // 문제는 CSS 가 그중 width 를 덮어썼다는 것이다. D1 감시는 아래 클래스 테스트가 한다.
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

  it("기본 클래스가 크기를 건드리지 않는다 — size 가 이긴다 (D1 · D3)", () => {
    const cls = renderSpinner(<TxSpinner />).getAttribute("class") ?? "";

    // **이것이 D1 의 회귀 감시다.** 기본 클래스에 크기 유틸이 하나라도 들어오면
    // 그 순간 CSS 가 width/height 속성을 다시 이기고 D1 이 되살아난다.
    // items-center 는 svg 에서 아무 효과가 없던 무효 클래스다 (D3).
    for (const token of cls.split(/\s+/).filter(Boolean)) {
      expect(token, `크기를 건드리는 기본 클래스: ${token}`).not.toMatch(/^(w-|h-|size-|min-w-|max-w-|min-h-|max-h-)/);
    }
    expect(cls).not.toContain("items-center");
  });
});

describe("TxSpinner — className", () => {
  it("className 은 기본 클래스를 교체하지 않고 병합된다 (D2)", () => {
    const cls = renderSpinner(<TxSpinner className="text-blue-500" />).getAttribute("class") ?? "";

    // D2 는 "기본값 파라미터라 병합되지 않는다" 였다. S2 에서 기본값 자체를 없애 증상이 사라졌으므로
    // 이건 회귀 감시가 아니라 **계약을 못박는 가드**다 — 기본값을 다시 넣는 순간 이 테스트가 깨진다.
    expect(cls).toContain("animate-spin");
    expect(cls).toContain("text-blue-500");
    // 색은 같은 계열이라 tailwind-merge 가 정리한다 — 소비자가 준 쪽만 남는다.
    expect(cls).not.toContain("text-current");
  });

  it("모션 저감에서 회전을 멈추지 않고 늦춘다 (A3)", () => {
    const cls = renderSpinner(<TxSpinner />).getAttribute("class") ?? "";

    expect(cls).toContain("animate-spin");
    expect(cls).toContain("motion-reduce:[animation-duration:2s]");
  });

  it("className 으로 크기를 덮을 수 있다 — cm 이 충돌을 정리한다", () => {
    const cls = renderSpinner(<TxSpinner className="size-6" />).getAttribute("class") ?? "";

    expect(cls).toContain("size-6");
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

    // Storybook 확인에서 잡힌 결함이다. 둘을 같이 주는 건 모순이고, aria-hidden 요소에 남은
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
    const svg = renderSpinner(<TxSpinner />);

    expect(svg.getAttribute("class")).toContain("text-current");
    expect(svg.querySelector("path")?.getAttribute("fill")).toBe("currentColor");
  });
});
