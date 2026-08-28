import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxCard } from "./TxCard";

/**
 * 원본 129줄이 다섯 가지를 겸했다 — 상자 · 접기 · "더보기" 링크 · 로딩 스켈레톤 ·
 * **`displayName` 문자열로 자식을 훑어 슬롯을 가르는 일**.
 *
 * 남긴 것은 상자와 슬롯, 접기까지다. 그래서 여기서 보는 것은
 * "슬롯이 자식을 뒤지지 않고도 자리를 잡는가" 와 "접힘의 주인이 누구인가" 다.
 */

afterEach(cleanup);

describe("TxCard — 상자", () => {
  it("내용을 그대로 담는다", () => {
    render(
      <TxCard>
        <p>내용</p>
      </TxCard>
    );

    expect(screen.getByText("내용")).toBeTruthy();
  });

  it("제목을 주면 제목 줄이 생긴다", () => {
    const { container } = render(<TxCard title="서버 상태">내용</TxCard>);

    expect(screen.getByText("서버 상태")).toBeTruthy();
    expect(container.querySelector(".tx-card__header")).toBeTruthy();
  });

  it("제목이 없고 접을 수도 없으면 제목 줄을 그리지 않는다", () => {
    const { container } = render(<TxCard>내용</TxCard>);
    expect(container.querySelector(".tx-card__header")).toBeNull();
  });

  it("제목은 요소여도 된다", () => {
    render(
      <TxCard
        title={
          <span>
            서버 <strong>3</strong>대
          </span>
        }
      >
        내용
      </TxCard>
    );

    expect(screen.getByText("3").tagName).toBe("STRONG");
  });

  it("className 은 기본 클래스를 덧붙는다", () => {
    const { container } = render(<TxCard className="w-96">내용</TxCard>);

    const card = container.querySelector('[data-tag="TxCard"]')!;
    expect(card.classList.contains("tx-card")).toBe(true);
    expect(card.classList.contains("w-96")).toBe(true);
  });

  /**
   * 원본은 `displayName` 문자열로 자식을 훑어 슬롯을 갈랐다. 조건부 렌더나 `memo` 로
   * 한 겹만 감싸도 못 찾고 엉뚱한 자리에 들어갔다.
   */
  it("푸터는 그냥 내용 안에 둔다 — 자식을 뒤지지 않는다", () => {
    // 조건부로 그려도, 감싸도 자리를 잃지 않는다. 원본은 여기서 못 찾았다
    const showFooter = [1, 2].length > 1;

    const { container } = render(
      <TxCard title="파트너">
        <p>내용</p>
        {showFooter && <TxCard.Footer>마지막 수정 3분 전</TxCard.Footer>}
      </TxCard>
    );

    const footer = container.querySelector(".tx-card__footer")!;
    expect(footer.textContent).toBe("마지막 수정 3분 전");
    expect(footer.closest(".tx-card__body")).toBeTruthy();
  });
});

describe("TxCard — 접기", () => {
  it("접을 수 없으면 버튼이 없다", () => {
    render(<TxCard title="제목">내용</TxCard>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("누르면 내용이 감춰진다", () => {
    const { container } = render(
      <TxCard title="제목" collapsible>
        내용
      </TxCard>
    );

    const body = container.querySelector(".tx-card__body")!;
    expect(body.hasAttribute("hidden")).toBe(false);

    fireEvent.click(screen.getByRole("button"));
    expect(body.hasAttribute("hidden")).toBe(true);
  });

  /**
   * 접어도 요소를 지우지 않는다. `aria-controls` 가 가리키는 곳이 그대로 있어야 하고,
   * 안에 있던 폼 값도 살아남아야 펼쳤을 때 다시 치지 않는다.
   */
  it("접어도 내용을 지우지 않는다 — 감출 뿐이다", () => {
    const { container } = render(
      <TxCard collapsible defaultCollapsed>
        <input defaultValue="치던 값" />
      </TxCard>
    );

    const input = container.querySelector("input")!;
    expect(input).toBeTruthy();
    expect(input.value).toBe("치던 값");
  });

  it("defaultCollapsed 로 접힌 채 시작한다", () => {
    const { container } = render(
      <TxCard title="제목" collapsible defaultCollapsed>
        내용
      </TxCard>
    );

    expect(container.querySelector(".tx-card__body")!.hasAttribute("hidden")).toBe(true);
  });

  it("바뀔 때 콜백이 온다", () => {
    const onChangeCollapsed = vi.fn();
    render(
      <TxCard title="제목" collapsible onChangeCollapsed={onChangeCollapsed}>
        내용
      </TxCard>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onChangeCollapsed).toHaveBeenCalledWith(true);
  });

  /** 원본은 값을 내부 state 로 복사하고 effect 로 맞춰서, 콜백을 받고 안 바꿔도 접혔다. */
  it("collapsed 를 주면 값의 주인은 소비자다 — 콜백만 오고 화면은 그대로", () => {
    const onChangeCollapsed = vi.fn();
    const { container } = render(
      <TxCard title="제목" collapsible collapsed={false} onChangeCollapsed={onChangeCollapsed}>
        내용
      </TxCard>
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onChangeCollapsed).toHaveBeenCalledWith(true);
    expect(container.querySelector(".tx-card__body")!.hasAttribute("hidden")).toBe(false);
  });

  it("collapsible 이 아니면 collapsed 를 줘도 접히지 않는다", () => {
    const { container } = render(
      <TxCard title="제목" collapsed>
        내용
      </TxCard>
    );

    expect(container.querySelector(".tx-card__body")!.hasAttribute("hidden")).toBe(false);
  });
});

describe("TxCard — 스크린리더", () => {
  it("버튼이 펼침 상태와 대상 요소를 알린다", () => {
    const { container } = render(
      <TxCard title="제목" collapsible>
        내용
      </TxCard>
    );

    const button = screen.getByRole("button");
    const body = container.querySelector(".tx-card__body")!;

    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-controls")).toBe(body.id);

    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("버튼의 이름이 다음에 할 일을 가리킨다", () => {
    render(
      <TxCard title="제목" collapsible>
        내용
      </TxCard>
    );

    expect(screen.getByRole("button", { name: "접기" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button", { name: "펼치기" })).toBeTruthy();
  });

  it("이름을 바꿀 수 있다", () => {
    render(
      <TxCard title="제목" collapsible collapseLabel="Collapse" expandLabel="Expand">
        내용
      </TxCard>
    );

    expect(screen.getByRole("button", { name: "Collapse" })).toBeTruthy();
  });

  it("카드를 여럿 놓아도 id 가 겹치지 않는다", () => {
    const { container } = render(
      <>
        <TxCard title="가" collapsible>
          가 내용
        </TxCard>
        <TxCard title="나" collapsible>
          나 내용
        </TxCard>
      </>
    );

    const ids = [...container.querySelectorAll(".tx-card__body")].map((body) => body.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("TxCard — 안 하는 일", () => {
  const source = readFileSync(join(import.meta.dirname, "TxCard.tsx"), "utf8");

  /** 카드가 라우터를 알 이유가 없다. 링크는 소비자가 내용 안에 넣는다. */
  it("라우터를 import 하지 않는다", () => {
    expect(source).not.toContain("react-router");
  });

  /** 로딩 표시는 TxLoading 이 한다. 같은 일을 두 곳이 하면 모양이 갈린다. */
  it("로딩 스켈레톤을 그리지 않는다", () => {
    expect(source).not.toContain("isLoading");
  });

  /** 자식을 훑어 슬롯을 가르면 한 겹만 감싸도 못 찾는다. */
  it("displayName 으로 자식을 훑지 않는다", () => {
    expect(source).not.toContain("displayName");
    expect(source).not.toContain("Children");
  });
});

describe("TxCard — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxCard.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다 — 값이 토큰으로 나가 있다", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toMatch(/background-color:\s*var\(--tx-card-bg\)/);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxCard/TxCard.css" layer(tx);');
  });

  /**
   * 본문은 `display: flex` 다. `hidden` 속성만 믿으면 그 선언이 이겨서 접어도 그대로 보인다.
   */
  it("접힌 본문을 CSS 로도 감춘다", () => {
    expect(css).toContain(".tx-card__body[hidden]");
  });

  /**
   * 펼쳐져 있을 때 제목 줄의 아래가 0 인 것은 본문이 자기 여백을 갖고 있기 때문이다.
   * 접히면 그 본문이 없으므로 아래를 채워야 위아래가 맞는다.
   */
  it("접히면 제목 줄의 위아래 여백이 같아진다", () => {
    const header = css.match(/\.tx-card__header\s*\{([^}]*)\}/)?.[1] ?? "";
    const collapsed = css.match(/\.tx-card\[data-collapsed\]\s+\.tx-card__header\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(header).toContain("padding-bottom: 0");
    expect(collapsed).toContain("padding-bottom: var(--tx-card-padding)");
  });
});
