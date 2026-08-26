import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TxLoading } from "./TxLoading";

/**
 * `001-TxLoading-S3`. 명세는 `docs/001_ui/components/03_TxLoading.md`.
 *
 * **S2 에서 고친 결함을 못박는 것이 이 파일의 목적이다.** 각 테스트에 결함 ID 를 달아 두었고,
 * 그 ID 로 명세의 감사표를 찾아가면 왜 이 동작이어야 하는지가 있다.
 *
 * **jsdom 에는 스타일시트가 없다.** 그래서 아래쪽 "CSS 계약" 블록은 `TxLoading.css` 를 **텍스트로 읽어**
 * 검사한다. 이 컴포넌트의 D2("딤이 문구 위에 그려진다")는 페인트 순서에서 벌어진 일이라
 * 렌더 결과만 보는 테스트는 결함을 되살려도 통과한다. **결과를 못 보면 원인을 본다** —
 * `TxSpinner` 2차에서 만든 방식이다 (docs/902_testing/README.md 관찰 5).
 *
 * **`fullScreen` 은 `document.body` 로 포털된다.** RTL 의 `container` 안에 없으므로
 * 그쪽을 뒤지는 헬퍼(`findIn`)와 문서 전체를 뒤지는 헬퍼(`find`)를 따로 둔다 —
 * 이 구분 자체가 "포털됐는가" 를 검사하는 수단이다.
 */

// RTL 자동 cleanup 은 afterEach 가 전역일 때만 등록된다. 이 저장소는 globals 를 켜지 않았으므로 직접 붙인다.
afterEach(cleanup);

/** 문서 전체에서 찾는다. 포털된 것도 잡힌다 */
const find = (ui: React.ReactElement) => {
  render(ui);
  return document.body.querySelector<HTMLElement>('[data-tag="TxLoading"]');
};

/** RTL 컨테이너 **안에서만** 찾는다. 포털된 것은 안 잡힌다 */
const findIn = (ui: React.ReactElement) => {
  const { container } = render(ui);
  return container.querySelector<HTMLElement>('[data-tag="TxLoading"]');
};

/** null 이 아님을 보장하고 돌려준다. 매 테스트에서 옵셔널 체이닝을 반복하지 않기 위한 것 */
const shown = (ui: React.ReactElement) => {
  const el = find(ui);
  if (!el) throw new Error("TxLoading 이 렌더되지 않았다");
  return el;
};

describe("TxLoading — 표시 여부", () => {
  it("visible 을 주지 않으면 보인다 — 기본값이 true 다", () => {
    expect(find(<TxLoading text="불러오는 중" />)).not.toBeNull();
  });

  it("visible={false} 면 아무것도 렌더하지 않는다", () => {
    // text 가 남아 있어도 꺼져야 한다. 예전에 text 유무로 표시를 결정해 오버레이가 안 꺼진 적이 있다.
    expect(find(<TxLoading visible={false} text="불러오는 중" />)).toBeNull();
  });

  it("visible={true} 면 보인다", () => {
    expect(find(<TxLoading visible text="불러오는 중" />)).not.toBeNull();
  });

  it("빈 배열을 주면 보인다 — 배열 규약 (§5 Q1)", () => {
    // TxCard 의 isLoading 과 같은 규약이다. 소비자가 data.length === 0 을 계산하지 않는다.
    expect(find(<TxLoading visible={[]} text="목록을 불러오는 중" />)).not.toBeNull();
  });

  it("채워진 배열을 주면 사라진다 — 배열 규약 (§5 Q1)", () => {
    expect(find(<TxLoading visible={[1, 2, 3]} text="목록을 불러오는 중" />)).toBeNull();
  });
});

describe("TxLoading — 구조", () => {
  it("data-tag 를 붙인다", () => {
    expect(shown(<TxLoading />).getAttribute("data-tag")).toBe("TxLoading");
  });

  it("아이콘 슬롯 안에서 TxSpinner 를 쓴다 (C5)", () => {
    const el = shown(<TxLoading text="불러오는 중" />);
    const icon = el.querySelector(".tx-loading__icon");

    // 자체 Dots 를 쓰고 있던 것을 TxSpinner 로 바꿨다. 로딩 시각 언어를 하나로 모으는 결정이다
    // (TxSpinner §5 Q2). 여기가 다시 갈라지면 이 테스트가 깨진다.
    expect(icon).not.toBeNull();
    expect(icon?.querySelector('[data-tag="TxSpinner"]')).not.toBeNull();
  });

  it("text 를 주면 문구 슬롯에 나온다", () => {
    const el = shown(<TxLoading text="불러오는 중" />);

    expect(el.querySelector(".tx-loading__text")?.textContent).toBe("불러오는 중");
  });

  it("text 가 없으면 문구 슬롯 자체가 없다 (D3)", () => {
    const el = shown(<TxLoading />);

    // 예전에는 무조건 렌더해서, 문구 없이 쓰면 빈 요소가 여백만 남겼다.
    expect(el.querySelector(".tx-loading__text")).toBeNull();
  });

  it("인라인에는 딤이 없다", () => {
    expect(shown(<TxLoading text="불러오는 중" />).querySelector(".tx-loading__backdrop")).toBeNull();
  });
});

describe("TxLoading — className", () => {
  it("className 은 기본 클래스를 교체하지 않고 덧붙는다", () => {
    const cls = shown(<TxLoading className="my-loader" />).getAttribute("class") ?? "";

    expect(cls).toContain("tx-loading");
    expect(cls).toContain("my-loader");
  });

  it("fullScreen 에서도 className 이 붙는다 (D1)", () => {
    const cls = shown(<TxLoading className="my-loader" text="이동 중" fullScreen />).getAttribute("class") ?? "";

    // **이것이 D1 의 회귀 감시다.** 오버레이가 별도 분기였던 시절에는 className 을 아예 쓰지 않아
    // 소비자가 준 클래스가 에러도 경고도 없이 사라졌다. 두 모드가 같은 노드를 써야 이게 성립한다.
    expect(cls).toContain("tx-loading");
    expect(cls).toContain("my-loader");
  });

  it("classNames 슬롯 3종이 각자의 자리에 붙는다", () => {
    const el = shown(<TxLoading text="이동 중" fullScreen classNames={{ icon: "s-icon", text: "s-text", backdrop: "s-backdrop" }} />);

    expect(el.querySelector(".tx-loading__icon")?.className).toContain("s-icon");
    expect(el.querySelector(".tx-loading__text")?.className).toContain("s-text");
    expect(el.querySelector(".tx-loading__backdrop")?.className).toContain("s-backdrop");
  });

  it("className 은 소비자가 쓰는 스타일 방식을 묻지 않는다", () => {
    // 순수 CSS 클래스든 Tailwind 유틸이든 CSS Modules 해시든 그대로 나간다. 라이브러리는 판단하지 않는다.
    for (const given of ["my-loader", "text-blue-500", "styles_loader__a1b2"]) {
      expect(shown(<TxLoading className={given} />).getAttribute("class")).toContain(given);
      cleanup();
    }
  });
});

describe("TxLoading — 전체화면", () => {
  it("document.body 직속으로 포털된다 (D5)", () => {
    const el = shown(<TxLoading text="이동 중" fullScreen />);

    // position: fixed 는 조상의 transform·filter·contain 안에서 그 조상 기준이 된다.
    // body 직속이면 그 조상이 없다. 이게 이 컴포넌트에서 포털을 쓰는 이유 전부다.
    expect(el.parentElement).toBe(document.body);
  });

  it("인라인은 포털되지 않는다 — 호출한 자리에 남는다", () => {
    expect(findIn(<TxLoading text="불러오는 중" />)).not.toBeNull();
    cleanup();
    expect(findIn(<TxLoading text="이동 중" fullScreen />)).toBeNull();
  });

  it("data-full-screen 이 값 없는 속성으로 나간다 (20_design §3)", () => {
    expect(shown(<TxLoading text="이동 중" fullScreen />).getAttribute("data-full-screen")).toBe("");
    cleanup();
    expect(shown(<TxLoading text="불러오는 중" />).getAttribute("data-full-screen")).toBeNull();
  });

  it("딤이 첫 자식이다 (D2)", () => {
    const el = shown(<TxLoading text="이동 중" fullScreen />);

    // **트리 순서가 페인트 순서다.** 딤이 뒤로 가면 문구 위에 그려진다 — z-index 를 쓰지 않으므로
    // 순서가 계약이다. 나머지 절반(안쪽 슬롯이 포지션 요소여야 한다)은 CSS 계약 블록이 지킨다.
    expect(el.firstElementChild?.className).toContain("tx-loading__backdrop");
  });
});

describe("TxLoading — 접근성", () => {
  it("문구가 있으면 래퍼가 안내하고 스피너는 장식이다 (A1)", () => {
    const el = shown(<TxLoading text="불러오는 중" />);

    // live region 을 겹치면 같은 내용이 두 번 읽힌다. 안내는 한 자리에서만 한다.
    expect(el.getAttribute("role")).toBe("status");
    expect(el.querySelector('[data-tag="TxSpinner"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  it("문구가 없으면 스피너가 안내한다 (A1)", () => {
    const el = shown(<TxLoading />);
    const spinner = el.querySelector('[data-tag="TxSpinner"]');

    // 읽을 내용이 없는 live region 은 침묵한다. 그 경우에만 스피너의 기본 안내에 맡긴다.
    expect(el.getAttribute("role")).toBeNull();
    expect(spinner?.getAttribute("role")).toBe("status");
    expect(spinner?.getAttribute("aria-hidden")).toBeNull();
  });

  it("role 을 주면 기본값을 이긴다", () => {
    expect(shown(<TxLoading text="저장 실패" role="alert" />).getAttribute("role")).toBe("alert");
  });
});

describe("TxLoading — 그 밖의 계약", () => {
  it("HTMLAttributes 를 그대로 통과시킨다", () => {
    const el = shown(<TxLoading id="page-loader" style={{ opacity: 0.5 }} />);

    expect(el.getAttribute("id")).toBe("page-loader");
    expect(el.style.opacity).toBe("0.5");
  });
});

/**
 * **여기서부터는 렌더 결과가 아니라 `TxLoading.css` 를 읽는다.**
 *
 * jsdom 에는 스타일시트가 없어 캐스케이드도 페인트 순서도 볼 수 없다. 그런데 이 컴포넌트의
 * 결함(D2)이 바로 거기서 났다. **결과를 못 보면 원인을 본다.**
 *
 * **값은 검사하지 않는다.** "딤이 20% 인가" 를 테스트가 잡으면 진하기를 고칠 때마다 테스트를 고치게 된다.
 * 검사하는 것은 **바뀌면 소비자가 깨지는 것**뿐이다 (docs/902_testing/README.md 관찰 6).
 */
describe("TxLoading — CSS 계약", () => {
  const here = import.meta.dirname;

  // 주석 안의 예시 선택자가 검사에 걸리면 안 된다. 선언만 남긴다.
  const css = readFileSync(join(here, "TxLoading.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("문구 슬롯이 포지션 요소다 — 안 그러면 딤이 그 위에 그려진다 (D2)", () => {
    // **이것이 D2 의 회귀 감시다.** 이 한 줄이 빠지면 딤(absolute)이 문구(비포지션)보다 나중에
    // 그려져 문구가 딤 아래로 들어간다. 예전 구현에서 스피너만 z-50 으로 탈출해 있던 이유다.
    expect(css).toMatch(/\.tx-loading__text\s*\{[^}]*position:\s*relative/);
  });

  it("색을 선언하는 자리는 전체화면 문구 하나뿐이다 (§5 Q3 · D6)", () => {
    // 인라인 문구는 놓인 자리에서 색을 상속받는다. 그 선택자에 color 가 들어오면 캡션 안에서도
    // 본문 색으로 나온다. 전체화면은 body 직속이라 상속의 출발점이 없어 예외다.
    //
    // at-rule(@media 등)이 생기면 이 얕은 파서가 깨진다. 그때는 선택자별로 나눠 검사한다.
    const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, sel, body]) => ({ sel: sel.trim(), body }));
    // `background-color` 와 `--tx-color-*` 는 걸리지 않는다 — color 앞이 `-` 다.
    const colored = rules.filter((r) => /(^|[\s;])color\s*:/.test(r.body));

    expect(colored.map((r) => r.sel)).toEqual([".tx-loading[data-full-screen] .tx-loading__text"]);
  });

  it("전체화면 문구 색이 토큰으로 나가 있고 --tx-color-text 를 기본값으로 받는다 (D6)", () => {
    // 리터럴 색으로 굳히면 다크모드에서 딤은 밝아지는데 문구는 안 따라온다 — 실측으로 잡은 결함이다.
    expect(css).toMatch(/--tx-loading-fg:\s*var\(--tx-color-text\)/);
    expect(css).toMatch(/color:\s*var\(--tx-loading-fg\)/);
  });

  it("font-size 는 아이콘 슬롯 한 곳뿐이다 (§5 Q3)", () => {
    // 문구에 크기를 박으면 캡션 안에서도 본문 안에서도 같은 크기로 나온다.
    expect(css.match(/font-size\s*:/g)).toHaveLength(1);
    expect(css).toMatch(/font-size:\s*var\(--tx-loading-icon-size\)/);
  });

  it(".dark 분기가 없다 (20_design §6)", () => {
    // 다크모드 재정의는 tokens.css 한 곳이 소유한다. 여기 분기가 생기면 소비자가 색 하나를
    // 바꿀 때 라이트/다크를 따로 찾아다녀야 한다.
    expect(css).not.toContain(".dark");
  });

  it("딤 색이 --tx-color-state 에서 파생된다", () => {
    // 리터럴 색으로 되돌리면 다크모드에서 딤이 안 뒤집힌다 — 위 테스트가 통과한 채로 그렇게 된다.
    expect(css).toMatch(/--tx-loading-backdrop-bg:\s*color-mix\([^;]*var\(--tx-color-state\)/);
  });

  it(".tx-spinner 를 직접 조준하지 않는다", () => {
    // 남의 컴포넌트 클래스를 밖에서 덮기 시작하면 어느 쪽이 이기는지가 import 순서에 달린다.
    // 아이콘 크기는 슬롯의 font-size 로 정한다 — TxSpinner 가 1em 이라 따라온다.
    expect(css).not.toContain(".tx-spinner");
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    const bundleEntry = readFileSync(join(here, "..", "styles.css"), "utf8");

    expect(bundleEntry).toContain("./TxLoading/TxLoading.css");
  });
});
