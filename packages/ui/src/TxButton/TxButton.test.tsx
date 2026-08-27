import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxButton } from "./TxButton";

/**
 * `001-TxButton-S3` (2차). 명세: `docs/001_ui.md`.
 *
 * S2 에서 고친 결함을 못박는다. 각 테스트에 결함 ID 를 달아 두었고, 그 ID 로 명세의 감사표를
 * 찾아가면 왜 이 동작이어야 하는지가 있다.
 *
 * **jsdom 에는 스타일시트가 없다.** 그래서 "어떻게 보이는가" 는 여기서 검증할 수 없고,
 * 렌더 결과로는 **그 모습을 만드는 입력**(속성·클래스·호출 횟수)만 지킨다.
 *
 * 아래쪽 "CSS 계약" 블록은 `TxButton.css` · `tokens.css` 를 **텍스트로 읽는다.**
 * 이 컴포넌트의 무거운 결함 하나(D2 — `text` 만 포커스 링을 잃던 것)가 캐스케이드에서 났고,
 * 렌더 결과로는 그게 되살아나도 보이지 않는다. **결과를 못 보면 원인을 본다** — TxSpinner 와 같은 선례다.
 * 실제 렌더 모양은 Storybook 에서 사람이 본다.
 */

afterEach(cleanup);

const renderButton = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const btn = container.querySelector<HTMLButtonElement>('[data-tag="TxButton"]');
  if (!btn) throw new Error("TxButton 이 버튼을 렌더하지 않았다");
  return btn;
};

describe("TxButton — 폼 안전성", () => {
  it("type 기본값이 button 이다 (D1)", () => {
    // 지정하지 않으면 HTML 기본값이 submit 이라, TxForm 안의 모든 버튼이 폼을 제출했다.
    expect(renderButton(<TxButton label="확인" />).type).toBe("button");
  });

  it("type=submit 을 주면 그대로 통과한다 (D1)", () => {
    expect(renderButton(<TxButton label="제출" type="submit" />).type).toBe("submit");
  });

  it("폼 안에서 기본 버튼은 제출하지 않는다 (D1)", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <form onSubmit={onSubmit}>
        <TxButton label="취소" />
      </form>
    );

    container.querySelector<HTMLButtonElement>('[data-tag="TxButton"]')!.click();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("TxButton — variant", () => {
  it("variant 가 data-variant 로 나간다 — 바깥에서 조준하는 자리다", () => {
    for (const variant of ["primary", "secondary", "danger", "ghost", "text"] as const) {
      expect(renderButton(<TxButton label={variant} variant={variant} />).getAttribute("data-variant")).toBe(variant);
      cleanup();
    }
  });

  it("variant 를 주지 않으면 primary 다", () => {
    expect(renderButton(<TxButton label="확인" />).getAttribute("data-variant")).toBe("primary");
  });

  it("라이브러리에 없는 variant 도 그대로 내보낸다 (Q3)", () => {
    // 소비자가 `.tx-button[data-variant="brand"]` 를 CSS 로 정의하면 그대로 먹는다.
    // 컴포넌트가 아는 이름만 통과시키면 그 경로가 막힌다.
    expect(renderButton(<TxButton label="가입" variant="brand" />).getAttribute("data-variant")).toBe("brand");
  });

  it("기본 클래스는 tx-button 하나뿐이다", () => {
    // 클래스가 늘면 그 안에 무엇이 들었는지 소비자가 알 수 없게 된다. 스타일은 전부 CSS 가 소유한다.
    const cls = renderButton(<TxButton label="확인" />).getAttribute("class") ?? "";

    expect(cls.trim().split(/\s+/)).toEqual(["tx-button"]);
  });
});

describe("TxButton — 로딩", () => {
  it("Promise 를 반환하면 잠기고, 풀리면 돌아온다", async () => {
    let resolve!: () => void;
    const btn = renderButton(<TxButton label="저장" onClick={() => new Promise<void>((r) => (resolve = r))} />);

    fireEvent.click(btn);
    await waitFor(() => expect(btn.disabled).toBe(true));

    resolve();
    await waitFor(() => expect(btn.disabled).toBe(false));
  });

  it("잠긴 동안 두 번째 클릭이 실행되지 않는다", async () => {
    const onClick = vi.fn(() => new Promise<void>(() => {}));
    const btn = renderButton(<TxButton label="저장" onClick={onClick} />);

    fireEvent.click(btn);
    await waitFor(() => expect(btn.disabled).toBe(true));
    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("로딩 상태가 data-loading 으로 나간다", async () => {
    const btn = renderButton(<TxButton label="저장" onClick={() => new Promise<void>(() => {})} />);

    expect(btn.getAttribute("data-loading")).toBeNull();

    fireEvent.click(btn);
    // 값 없는 불리언 속성이다. CSS 는 `[data-loading]` 으로 잡으므로 값이 아니라 존재가 계약이다.
    await waitFor(() => expect(btn.getAttribute("data-loading")).toBe(""));
  });

  it("로딩 중에도 라벨이 DOM 에 남는다 — 버튼 폭이 유지된다", async () => {
    const btn = renderButton(<TxButton label="저장" onClick={() => new Promise<void>(() => {})} />);

    fireEvent.click(btn);

    // 라벨을 걷어내고 스피너로 갈아끼우면 누르는 순간 버튼이 줄면서 옆 버튼들이 밀린다.
    // 스피너는 위에 겹치고 라벨은 흐려질 뿐이다.
    await waitFor(() => expect(btn.querySelector(".tx-button__label")?.textContent).toBe("저장"));
  });

  it("기본 로딩 표시는 장식용 스피너다 — 버튼 라벨과 중복 안내되지 않는다", async () => {
    const btn = renderButton(<TxButton label="저장" onClick={() => new Promise<void>(() => {})} />);

    fireEvent.click(btn);

    await waitFor(() => {
      const spinner = btn.querySelector('[data-tag="TxSpinner"]');
      expect(spinner?.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("동기 onClick 은 로딩 상태로 들어가지 않는다 (D5)", () => {
    // 예전에는 동기 핸들러에도 setState(true) 를 걸어 스피너가 한 프레임 깜빡였다.
    const onClick = vi.fn();
    const btn = renderButton(<TxButton label="확인" onClick={onClick} />);

    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn.disabled).toBe(false);
    expect(btn.getAttribute("data-loading")).toBeNull();
  });

  it("disabled 는 로딩이 아니다", () => {
    // 로딩과 비활성은 다른 상태다. 커서가 갈리므로 표식도 갈려야 한다.
    expect(renderButton(<TxButton label="확인" disabled />).getAttribute("data-loading")).toBeNull();
  });
});

describe("TxButton — 접근성", () => {
  it("aria-label 을 자동으로 붙이지 않는다 (D4)", () => {
    // 보이는 글자가 있는 버튼에는 불필요하고, title 과 label 이 다르면 화면과 낭독이 어긋난다.
    const btn = renderButton(<TxButton label="저장" title="눌러서 저장" />);

    expect(btn.getAttribute("aria-label")).toBeNull();
    expect(btn.textContent).toContain("저장");
    expect(btn.getAttribute("title")).toBe("눌러서 저장");
  });

  it("소비자가 준 aria-label 은 그대로 통과한다", () => {
    expect(renderButton(<TxButton aria-label="닫기" />).getAttribute("aria-label")).toBe("닫기");
  });

  it("onEnter 없이도 Enter 로 눌린다 (D3)", () => {
    // 폐기한 onEnter 의 존재 이유가 없었음을 못박는다 — 버튼은 원래 Enter 로 click 이 발생한다.
    const onClick = vi.fn();
    const btn = renderButton(<TxButton label="확인" onClick={onClick} />);

    fireEvent.click(btn); // 브라우저가 Enter 를 click 으로 바꿔 보내는 경로
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("TxButton — 커스터마이징", () => {
  it("className 은 기본 클래스를 교체하지 않고 덧붙는다", () => {
    const cls = renderButton(<TxButton label="확인" className="my-cta" />).getAttribute("class") ?? "";

    expect(cls).toContain("tx-button");
    expect(cls).toContain("my-cta");
  });

  it("className 은 소비자가 쓰는 스타일 방식을 묻지 않는다", () => {
    // 순수 CSS 클래스든 Tailwind 유틸이든 CSS Modules 해시든 그대로 나간다. 라이브러리는 판단하지 않는다.
    for (const given of ["my-cta", "shadow-lg", "styles_btn__a1b2"]) {
      expect(renderButton(<TxButton label="확인" className={given} />).getAttribute("class")).toContain(given);
      cleanup();
    }
  });

  it("classNames.label 이 안쪽 슬롯에 붙는다", () => {
    const label = renderButton(<TxButton label="확인" classNames={{ label: "truncate" }} />).querySelector(".tx-button__label");

    expect(label?.getAttribute("class")).toContain("truncate");
  });

  it("classNames 를 주지 않아도 슬롯 클래스는 그대로 있다", () => {
    // 슬롯을 CSS 로 조준하는 경로(`.tx-button__label { … }`)가 prop 유무에 좌우되면 안 된다.
    expect(renderButton(<TxButton label="확인" />).querySelector(".tx-button__label")?.textContent).toBe("확인");
  });
});

describe("TxButton — 그 밖의 계약", () => {
  it("data-tag 를 붙인다 (C4)", () => {
    expect(renderButton(<TxButton label="확인" />).getAttribute("data-tag")).toBe("TxButton");
  });

  it("label 이 없으면 children 을 쓴다", () => {
    expect(renderButton(<TxButton>내용</TxButton>).textContent).toContain("내용");
  });

  it("ButtonHTMLAttributes 를 그대로 통과시킨다", () => {
    const btn = renderButton(<TxButton label="확인" id="save" form="profile" />);

    expect(btn.getAttribute("id")).toBe("save");
    expect(btn.getAttribute("form")).toBe("profile");
  });

  it("통과 props 가 계약 속성을 덮지 못한다", () => {
    // data-loading 이 밖에서 뒤집히면 화면(스피너)과 실제 상태(잠김)가 어긋난다.
    // data-tag 는 DOM 표식이라 값이 바뀌면 셀렉터가 통째로 빗나간다.
    const btn = renderButton(<TxButton label="확인" data-tag="Other" data-variant="spoofed" data-loading="" />);

    expect(btn.getAttribute("data-tag")).toBe("TxButton");
    expect(btn.getAttribute("data-variant")).toBe("primary");
    expect(btn.getAttribute("data-loading")).toBeNull();
  });
});

/**
 * **여기서부터는 렌더 결과가 아니라 CSS 파일을 읽는다.**
 *
 * jsdom 에는 스타일시트가 없어서 캐스케이드를 볼 수 없다. 그런데 이 컴포넌트의 무거운 결함(D2)이
 * 바로 거기서 났다 — `text` variant 만 공통 스타일을 건너뛰어 포커스 링과 disabled 처리를 잃었다.
 * 검사하는 것은 **계약**뿐이다. 색값·여백 같은 취향은 검사하지 않는다 — 고칠 때마다 테스트를 고치게 된다.
 */
describe("TxButton — CSS 계약", () => {
  // jsdom 환경에서는 전역 URL 이 jsdom 구현으로 바뀌어 있어 readFileSync 가 받지 못한다.
  const here = import.meta.dirname;

  // 주석 안의 예시 코드가 검사에 걸리면 안 된다. 선언만 남긴다.
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxButton.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));

  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }));
  const variantRules = rules.filter((rule) => rule.selector.includes("[data-variant="));

  it("포커스 링을 variant 가 아니라 기본 클래스가 소유한다 (D2)", () => {
    // **이것이 D2 의 회귀 감시다.** 포커스 링 규칙이 variant 를 타는 순간
    // 어떤 variant 는 링이 없는 상태로 다시 갈라진다 — 키보드 사용자가 위치를 못 본다.
    const focusSelectors = rules.filter((rule) => rule.selector.includes(":focus-visible")).map((rule) => rule.selector);

    expect(focusSelectors).toEqual([".tx-button:focus-visible"]);
  });

  it("disabled 처리도 기본 클래스가 소유한다 (D2)", () => {
    const disabledSelectors = rules.filter((rule) => rule.selector.includes(":disabled")).map((rule) => rule.selector);

    expect(disabledSelectors).toContain(".tx-button:disabled");
    for (const selector of disabledSelectors) {
      expect(selector, `variant 별로 disabled 를 다시 정하고 있다: ${selector}`).not.toContain("[data-variant=");
    }
  });

  it("variant 는 구조를 다시 정하지 않는다 — 색만 갈아끼운다", () => {
    for (const { selector, body } of variantRules) {
      expect(body, `${selector} 가 공통 레이아웃을 다시 정한다`).not.toMatch(/^\s*(padding|border-radius|display|position|cursor|outline|font-weight)\s*:/m);
    }
  });

  it("다크모드 분기를 컴포넌트가 갖지 않는다 — 토큰만 재정의하면 따라온다 (D7)", () => {
    // 클래스 문자열 시절 D7 은 `dark:` 를 빼먹어서 났다. 컴포넌트가 .dark 를 아예 모르면 그 실수가 안 난다.
    expect(css).not.toContain(".dark");
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).toMatch(/background-color:\s*var\(--tx-button-bg\)/);
    expect(css).toMatch(/color:\s*var\(--tx-button-fg\)/);

    // 리터럴 색이 남아 있으면 그 자리는 소비자가 못 바꾼다.
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("컴포넌트 토큰이 전역 토큰을 기본값으로 받는다", () => {
    // 전역 하나만 바꿔도 전체가 따라오게 하는 연결고리다. 끊기면 컴포넌트마다 따로 덮어야 한다.
    expect(css).toMatch(/--tx-button-bg:\s*var\(--tx-color-primary\)/);
    expect(css).toMatch(/--tx-button-radius:\s*var\(--tx-radius\)/);
  });

  it("hover·pressed 색이 배경에서 파생된다 (D8)", () => {
    // **이것이 D8 의 회귀 감시다.** 리터럴 색 토큰으로 되돌리는 순간
    // `--tx-color-primary` 만 바꾼 소비자는 "평상시만 보라, hover 는 파랑" 을 다시 만난다.
    for (const state of ["hover", "pressed"]) {
      const declaration = new RegExp(`--tx-button-bg-${state}:\\s*color-mix\\([^;]*var\\(--tx-button-bg\\)`);
      expect(css, `--tx-button-bg-${state} 가 배경에서 파생되지 않는다`).toMatch(declaration);
    }
  });

  it("variant 는 상태 색을 다시 정하지 않는다 (D8)", () => {
    // variant 가 hover 를 직접 잡으면 그 variant 만 파생에서 빠진다 — 결함이 부분적으로 되살아난다.
    // 소비자가 새 variant 를 만들 때 배경 한 줄만 주면 되는 것도 이 규칙 덕분이다.
    for (const { selector, body } of variantRules) {
      expect(body, `${selector} 가 상태 색을 직접 정한다`).not.toMatch(/--tx-button-bg-(hover|pressed)\s*:/);
    }
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    // 정의 없는 var() 는 조용히 아무것도 아닌 값이 된다 — 화면에서만 이상하고 에러는 안 난다.
    const referenced = new Set([...css.matchAll(/var\((--tx-[\w-]+)/g)].map(([, name]) => name).filter((name) => !name.startsWith("--tx-button-")));

    expect(referenced.size).toBeGreaterThan(0);
    for (const name of referenced) {
      expect(tokens, `tokens.css 에 없는 전역 토큰: ${name}`).toMatch(new RegExp(`${name}\\s*:`));
    }
  });

  it("styles.css 에 실려 나간다 — 안 실리면 소비자에게 도달하지 않는다", () => {
    const bundleEntry = readFileSync(join(here, "..", "styles.css"), "utf8");

    expect(bundleEntry).toContain("./TxButton/TxButton.css");
    // 토큰이 먼저 와야 컴포넌트가 그 값을 읽는다. 순서가 곧 캐스케이드다.
    expect(bundleEntry.indexOf("./tokens.css")).toBeLessThan(bundleEntry.indexOf("./TxButton/TxButton.css"));
  });

  it("tx 레이어 안으로 들어간다 — 레이어 밖이면 className 이 안 먹는다", () => {
    // 레이어에 없는 CSS 는 레이어에 있는 CSS 를 특이도와 무관하게 이긴다. 우리가 레이어 밖으로
    // 나가는 순간 `className="rounded-full"`(Tailwind = @layer utilities) 이 조용히 무시된다.
    // Storybook 실측에서 실제로 그랬다 — 명세 §18 참고.
    const bundleEntry = readFileSync(join(here, "..", "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const imports = [...bundleEntry.matchAll(/@import\s+"([^"]+)"([^;]*);/g)];

    expect(imports.length).toBeGreaterThan(0);
    for (const [, spec, rest] of imports) {
      expect(rest, `레이어 없이 실린다: ${spec}`).toContain("layer(tx)");
    }
  });
});

/**
 * 전역 토큰은 `TxButton` 과 함께 태어났지만(job `001-tokens`) 소유자는 패키지 전체다.
 * 여기서 지키는 것은 **다른 컴포넌트가 옮겨 올 때 깨지면 안 되는 계약**뿐이다.
 */
describe("전역 토큰 — tokens.css", () => {
  const here = import.meta.dirname;
  const tokens = readFileSync(join(here, "..", "tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("전역 토큰을 :root 에 정의한다 — 소비자가 :root 한 곳에서 덮는다", () => {
    expect(tokens).toMatch(/:root\s*\{[^}]*--tx-color-primary\s*:/);
  });

  it("다크모드는 .dark 에서 토큰 값만 재정의한다", () => {
    const dark = /\.dark\s*\{([^}]*)\}/.exec(tokens)?.[1] ?? "";
    const properties = dark
      .split(";")
      .map((declaration) => declaration.split(":")[0].trim())
      .filter(Boolean);

    expect(properties.length).toBeGreaterThan(0);
    // 여기에 일반 선언이 들어오기 시작하면 "다크모드 전용 스타일" 이 다시 생기고,
    // 소비자는 색 하나를 바꾸려고 라이트/다크를 따로 찾아다니게 된다.
    for (const property of properties) {
      expect(property, `.dark 에 토큰이 아닌 선언이 있다: ${property}`).toMatch(/^--tx-/);
    }
  });

  it("컴포넌트 토큰을 전역 파일에 두지 않는다", () => {
    // `--tx-button-*` 의 기본값은 컴포넌트 CSS 가 소유한다. 두 곳에 있으면 어느 쪽이 이기는지 외워야 한다.
    expect(tokens).not.toMatch(/--tx-(button|spinner|input|modal)-/);
  });

  it("상태 색을 리터럴 토큰으로 두지 않는다 (D8)", () => {
    // role 마다 `-hover` 짝을 두면 소비자가 색 하나를 바꿀 때 두 개를 맞춰야 하고,
    // 하나를 빠뜨리면 "평상시만 보라" 가 된다. 상태는 색이 아니라 비율로 정한다.
    expect(tokens).not.toMatch(/--tx-color-[\w-]*-(hover|pressed)\s*:/);
    expect(tokens).toMatch(/--tx-state-hover:\s*\d+%/);
    expect(tokens).toMatch(/--tx-state-pressed:\s*\d+%/);
  });

  it("다크모드가 섞는 색을 뒤집는다 — 비율은 그대로다", () => {
    const dark = /\.dark\s*\{([^}]*)\}/.exec(tokens)?.[1] ?? "";

    // 라이트는 어두워지고 다크는 밝아져야 양쪽에서 "눌린 느낌" 이 난다.
    expect(dark).toMatch(/--tx-color-state\s*:/);
    // 비율까지 뒤집으면 두 모드가 따로 놀기 시작한다.
    expect(dark).not.toMatch(/--tx-state-(hover|pressed)\s*:/);
  });
});
