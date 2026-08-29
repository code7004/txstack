import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxAlert } from "./TxAlert";

/**
 * 신규 컴포넌트다. **`variant` 어휘를 `TxToast` · `TxBadge` 가 물려받으므로**
 * 여기서 정한 네 갈래가 셋의 기준이 된다.
 *
 * 가장 조심한 것은 **색만으로 뜻을 전하지 않는 것**이다 — 색을 못 보는 사람과
 * 스크린리더에는 아무것도 남지 않는다 (WCAG 1.4.1).
 */

afterEach(cleanup);

const alertOf = (container: HTMLElement) => container.querySelector('[data-tag="TxAlert"]') as HTMLElement;

describe("TxAlert — 그리기", () => {
  it("내용을 그린다", () => {
    render(<TxAlert>저장하지 못했습니다.</TxAlert>);
    expect(screen.getByText("저장하지 못했습니다.")).toBeTruthy();
  });

  it("제목과 본문을 함께 그린다", () => {
    render(<TxAlert title="결제 수단이 곧 만료됩니다">9월 30일 이후에는 중단됩니다.</TxAlert>);

    expect(screen.getByText("결제 수단이 곧 만료됩니다")).toBeTruthy();
    expect(screen.getByText("9월 30일 이후에는 중단됩니다.")).toBeTruthy();
  });

  it("제목 없이 본문만도 된다", () => {
    const { container } = render(<TxAlert>본문뿐</TxAlert>);
    expect(container.querySelector(".tx-alert__title")).toBeNull();
  });

  it("버튼 줄을 담는다", () => {
    render(
      <TxAlert title="제목">
        본문
        <TxAlert.Actions>
          <button type="button">카드 변경</button>
        </TxAlert.Actions>
      </TxAlert>
    );

    expect(screen.getByRole("button", { name: "카드 변경" })).toBeTruthy();
  });
});

describe("TxAlert — 갈래", () => {
  it("기본은 info 다", () => {
    const { container } = render(<TxAlert>내용</TxAlert>);
    expect(alertOf(container).dataset.variant).toBe("info");
  });

  it.each(["info", "success", "warning", "danger"] as const)("variant=%s 를 그대로 싣는다 — 색은 CSS 가 정한다", (variant) => {
    const { container } = render(<TxAlert variant={variant}>내용</TxAlert>);
    expect(alertOf(container).dataset.variant).toBe(variant);
  });

  it("갈래마다 아이콘이 다르다", () => {
    const { container: info } = render(<TxAlert variant="info">내용</TxAlert>);
    const { container: danger } = render(<TxAlert variant="danger">내용</TxAlert>);

    expect(info.querySelector(".tx-alert__icon")?.innerHTML).not.toBe(danger.querySelector(".tx-alert__icon")?.innerHTML);
  });

  it("아이콘을 끌 수 있다", () => {
    const { container } = render(
      <TxAlert icon={false}>내용</TxAlert>
    );
    expect(container.querySelector(".tx-alert__icon")).toBeNull();
  });

  it("아이콘을 갈아끼울 수 있다", () => {
    render(<TxAlert icon={<span>🔔</span>}>내용</TxAlert>);
    expect(screen.getByText("🔔")).toBeTruthy();
  });
});

describe("TxAlert — 스크린리더", () => {
  /** 색과 아이콘만으로 알리면 색을 못 보는 사람에게 아무것도 남지 않는다. */
  it("갈래를 글자로도 알린다", () => {
    render(<TxAlert variant="danger">저장 실패</TxAlert>);
    expect(screen.getByText("오류:")).toBeTruthy();
  });

  it.each([
    ["info", "안내:"],
    ["success", "완료:"],
    ["warning", "주의:"],
    ["danger", "오류:"]
  ] as const)("%s 는 %s 로 읽힌다", (variant, label) => {
    render(<TxAlert variant={variant}>내용</TxAlert>);
    expect(screen.getByText(label)).toBeTruthy();
  });

  it("갈래 글자를 바꿀 수 있다", () => {
    render(
      <TxAlert variant="danger" variantLabel="Error">
        내용
      </TxAlert>
    );

    expect(screen.getByText("Error:")).toBeTruthy();
    expect(screen.queryByText("오류:")).toBeNull();
  });

  /** 기본 아이콘은 장식이다. 뜻은 글자가 나른다. */
  it("아이콘은 스크린리더에 읽히지 않는다", () => {
    const { container } = render(<TxAlert>내용</TxAlert>);
    expect(container.querySelector(".tx-alert__icon svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  /** 페이지에 처음부터 있던 안내를 읽어 주면 읽는 흐름을 끊는다. */
  it("기본은 라이브 리전이 아니다", () => {
    const { container } = render(<TxAlert variant="danger">내용</TxAlert>);
    expect(alertOf(container).hasAttribute("role")).toBe(false);
  });

  it("announce 를 켜면 나타날 때 읽힌다", () => {
    render(
      <TxAlert variant="success" announce>
        저장했습니다
      </TxAlert>
    );

    expect(screen.getByRole("status")).toBeTruthy();
  });

  /** 오류는 하던 말이 끝나기를 기다리지 않는다. */
  it("announce 한 danger 는 즉시 읽힌다", () => {
    render(
      <TxAlert variant="danger" announce>
        저장 실패
      </TxAlert>
    );

    expect(screen.getByRole("alert")).toBeTruthy();
  });
});

describe("TxAlert — 닫기", () => {
  it("onClose 가 없으면 닫기 버튼이 없다", () => {
    render(<TxAlert>내용</TxAlert>);
    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
  });

  it("onClose 를 주면 닫기 버튼이 생긴다", () => {
    const onClose = vi.fn();
    render(<TxAlert onClose={onClose}>내용</TxAlert>);

    screen.getByRole("button", { name: "닫기" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("닫기는 진짜 버튼이다", () => {
    render(<TxAlert onClose={vi.fn()}>내용</TxAlert>);

    const close = screen.getByRole("button", { name: "닫기" });
    expect(close.tagName).toBe("BUTTON");
    expect(close.getAttribute("type")).toBe("button");
  });

  it("닫기 버튼의 이름을 바꿀 수 있다", () => {
    render(
      <TxAlert onClose={vi.fn()} closeLabel="Dismiss">
        내용
      </TxAlert>
    );

    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
  });
});

describe("TxAlert — 겉", () => {
  it("className 은 덧붙는다 — 교체하지 않는다", () => {
    const { container } = render(<TxAlert className="my-alert">내용</TxAlert>);
    const root = alertOf(container);

    expect(root.classList.contains("tx-alert")).toBe(true);
    expect(root.classList.contains("my-alert")).toBe(true);
  });

  it("안쪽 슬롯에 클래스를 줄 수 있다", () => {
    const { container } = render(
      <TxAlert title="제목" classNames={{ icon: "i1", title: "t1", body: "b1" }}>
        본문
      </TxAlert>
    );

    expect(container.querySelector(".tx-alert__icon.i1")).toBeTruthy();
    expect(container.querySelector(".tx-alert__title.t1")).toBeTruthy();
    expect(container.querySelector(".tx-alert__body.b1")).toBeTruthy();
  });

  it("나머지 props 는 바깥으로 간다", () => {
    const { container } = render(
      <TxAlert id="a1" data-testid="alert">
        내용
      </TxAlert>
    );

    const root = alertOf(container);
    expect(root.id).toBe("a1");
    expect(root.dataset.testid).toBe("alert");
  });

  it("data-tag 를 단다", () => {
    const { container } = render(<TxAlert>내용</TxAlert>);
    expect(alertOf(container).dataset.tag).toBe("TxAlert");
  });
});

describe("TxAlert — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxAlert.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toMatch(/background-color:\s*var\(--tx-alert-bg\)/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxAlert/TxAlert.css" layer(tx);');
  });

  /** 갈래가 갈리는 것은 색 하나뿐이다. 그래야 갈래를 늘려도 손댈 곳이 한 군데다. */
  it("갈래마다 accent 하나만 갈아 끼운다", () => {
    for (const variant of ["success", "warning", "danger"]) {
      const rule = css.match(new RegExp(`\\.tx-alert\\[data-variant="${variant}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";

      expect(rule, variant).toMatch(/--tx-alert-accent:/);
      // 바탕·테두리·아이콘 색은 accent 에서 섞어 만든다. 갈래가 따로 정하지 않는다
      expect(rule.match(/--tx-alert-[\w-]+:/g), variant).toHaveLength(1);
    }
  });

  /** 늘리기로 정한 것은 하나뿐이다. info 는 primary 가 겸한다. */
  it("info 를 위해 전역 토큰을 만들지 않는다", () => {
    expect(css).not.toContain("--tx-color-info");
    expect(tokens).toContain("--tx-color-success:");
    expect(tokens).not.toContain("--tx-color-info:");
  });

  /** `display: none` 은 스크린리더에서도 사라진다. 화면에서만 감춰야 한다. */
  it("갈래 글자를 화면에서만 감춘다", () => {
    const rule = css.match(/\.tx-alert__label\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).not.toMatch(/display:\s*none/);
    expect(rule).not.toMatch(/visibility:\s*hidden/);
    expect(rule).toMatch(/clip-path:/);
  });

  it("prefers-reduced-motion 을 지킨다", () => {
    expect(css).toContain("prefers-reduced-motion");
  });
});
