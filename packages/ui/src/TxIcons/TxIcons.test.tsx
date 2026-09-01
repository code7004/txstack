import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TxIconCheck, TxIconClose, TxIconSearch } from ".";

/**
 * 아이콘은 **내부 전용**이라 공개 API 계약이 없다. 대신 이것들이 조합되는 근거인
 * 두 가지 규약을 못 박는다 — 크기는 `1em`, 색은 `currentColor`.
 *
 * 둘 중 하나라도 깨지면 `TxInput` 안에서 아이콘만 따로 노는데, 그건 아이콘을 넣은 자리에서
 * 원인을 찾기 어렵다.
 *
 * 명세: `docs/001_ui/005_TxIcons.md`
 */

afterEach(cleanup);

const ICONS = [
  ["TxIconClose", TxIconClose],
  ["TxIconSearch", TxIconSearch],
  ["TxIconCheck", TxIconCheck]
] as const;

const svg = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const el = container.querySelector("svg");
  if (!el) throw new Error("svg 가 렌더되지 않았다");
  return el;
};

describe.each(ICONS)("%s", (_name, Icon) => {
  it("크기가 1em 이다 — 놓인 자리의 font-size 를 따라간다", () => {
    const el = svg(<Icon />);

    expect(el.getAttribute("width")).toBe("1em");
    expect(el.getAttribute("height")).toBe("1em");
  });

  it("width·height 를 주면 기본값을 이긴다", () => {
    const el = svg(<Icon width={32} height={32} />);

    expect(el.getAttribute("width")).toBe("32");
    expect(el.getAttribute("height")).toBe("32");
  });

  it("색을 고정하지 않는다 — currentColor 로 상속받는다", () => {
    const el = svg(<Icon />);
    const fills = [...el.querySelectorAll("path")].map((p) => p.getAttribute("fill"));

    expect(fills.length).toBeGreaterThan(0);
    expect(fills.every((f) => f === "currentColor")).toBe(true);
  });

  it("SVGProps 를 그대로 통과시킨다", () => {
    const el = svg(<Icon className="my-icon" aria-hidden data-x="1" />);

    expect(el.getAttribute("class")).toBe("my-icon");
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("data-x")).toBe("1");
  });

  it("viewBox 를 갖는다 — 없으면 크기 지정이 먹지 않는다", () => {
    expect(svg(<Icon />).getAttribute("viewBox")).toBeTruthy();
  });

  /**
   * 원본의 일부 아이콘에는 아이콘 사이트에서 받아온 `<g id="SVGRepo_bgCarrier">` 껍데기가
   * 남아 있었다. 빈 그룹인데다 **`id` 가 하드코딩이라 같은 페이지에 아이콘이 둘만 있어도
   * id 가 중복된다.** 가져온 둘에는 없고, 앞으로도 들이지 않는다.
   */
  it("하드코딩된 id 를 갖지 않는다 — 같은 페이지에 둘 이상 놓이면 중복된다", () => {
    expect(svg(<Icon />).querySelectorAll("[id]")).toHaveLength(0);
  });
});
