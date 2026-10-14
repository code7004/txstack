import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TxPagination } from "./TxPagination";

/**
 * 원본은 `TxAgGrid` 안에 묶여 있었고, 페이지 수 상한에 `10000` 이라는 매직넘버가 박혀 있었다.
 * 그 1만은 검색엔진이 돌려주는 결과 창의 한계였다 — 백엔드 사정이 UI 로 새어 든 것이다.
 * 그래서 "누가 상한을 정하는가" 와 "쪽 계산이 맞는가" 를 여러 각도에서 못 박는다.
 */

afterEach(cleanup);

const pageButtons = () =>
  screen
    .getAllByRole("button")
    .map((button) => button.textContent)
    .filter((text) => !!text && /^\d+$/.test(text));

describe("TxPagination — 쪽 계산", () => {
  it("전체 행과 쪽 크기로 쪽수를 정한다", () => {
    render(<TxPagination currentPage={1} totalRows={95} pageSize={10} />);
    expect(pageButtons()).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  });

  it("마지막 묶음은 남는 만큼만 그린다", () => {
    render(<TxPagination currentPage={11} totalRows={125} pageSize={10} />);
    expect(pageButtons()).toEqual(["11", "12", "13"]);
  });

  it("쪽이 하나뿐이면 아무것도 그리지 않는다 — 고를 것이 없다", () => {
    const { container } = render(<TxPagination currentPage={1} totalRows={7} pageSize={10} />);
    expect(container.firstChild).toBeNull();
  });

  it("행이 없어도 그리지 않는다", () => {
    const { container } = render(<TxPagination currentPage={1} totalRows={0} pageSize={10} />);
    expect(container.firstChild).toBeNull();
  });

  /** 상한은 소비자가 준다. 컴포넌트가 백엔드 사정을 알지 못한다. */
  it("maxPage 를 넘는 쪽은 만들지 않는다", () => {
    render(<TxPagination currentPage={1} totalRows={100000} pageSize={10} maxPage={3} />);
    expect(pageButtons()).toEqual(["1", "2", "3"]);
  });

  it("maxPage 를 안 주면 상한이 없다 — 1만 같은 숫자를 숨겨 두지 않는다", () => {
    render(<TxPagination currentPage={1001} totalRows={100000} pageSize={10} pageButtonCount={3} />);
    // 묶음은 자리가 고정이다. 지금 쪽을 가운데 두려고 움직이지 않는다 — 누를 때마다 번호가 흔들린다
    expect(pageButtons()).toEqual(["1000", "1001", "1002"]);
  });
});

describe("TxPagination — 이동", () => {
  it("번호를 누르면 그 쪽이 온다", () => {
    const onChangePage = vi.fn();
    render(<TxPagination currentPage={1} totalRows={100} pageSize={10} onChangePage={onChangePage} />);

    fireEvent.click(screen.getByRole("button", { name: "4쪽" }));
    expect(onChangePage).toHaveBeenCalledWith(4);
  });

  /** 원본은 같은 쪽을 눌러도 콜백이 나갔고, 묶음을 넘을 때는 콜백 둘이 동시에 나갔다. */
  it("같은 쪽을 다시 눌러도 콜백이 오지 않는다", () => {
    const onChangePage = vi.fn();
    render(<TxPagination currentPage={3} totalRows={100} pageSize={10} onChangePage={onChangePage} />);

    fireEvent.click(screen.getByRole("button", { name: "3쪽" }));
    expect(onChangePage).not.toHaveBeenCalled();
  });

  it("한 쪽씩 · 묶음째 이동이 각각 동작한다", () => {
    const onChangePage = vi.fn();
    render(<TxPagination currentPage={11} totalRows={1000} pageSize={10} onChangePage={onChangePage} />);

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(onChangePage).toHaveBeenLastCalledWith(10);

    fireEvent.click(screen.getByRole("button", { name: "다음 묶음" }));
    expect(onChangePage).toHaveBeenLastCalledWith(21);

    fireEvent.click(screen.getByRole("button", { name: "이전 묶음" }));
    expect(onChangePage).toHaveBeenLastCalledWith(1);
  });

  it("끝에서는 더 나가지 않는다", () => {
    const onChangePage = vi.fn();
    render(<TxPagination currentPage={1} totalRows={30} pageSize={10} onChangePage={onChangePage} />);

    const prev = screen.getByRole("button", { name: "이전" }) as HTMLButtonElement;
    const prevGroup = screen.getByRole("button", { name: "이전 묶음" }) as HTMLButtonElement;

    expect(prev.disabled).toBe(true);
    expect(prevGroup.disabled).toBe(true);

    fireEvent.click(prev);
    expect(onChangePage).not.toHaveBeenCalled();
  });

  it("마지막 쪽에서는 다음이 막힌다", () => {
    render(<TxPagination currentPage={3} totalRows={30} pageSize={10} />);
    expect((screen.getByRole("button", { name: "다음" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "다음 묶음" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("화살표를 숨길 수 있다", () => {
    render(<TxPagination currentPage={1} totalRows={100} pageSize={10} hideStepButtons hideGroupButtons />);
    expect(screen.queryByRole("button", { name: "다음" })).toBeNull();
    expect(screen.queryByRole("button", { name: "다음 묶음" })).toBeNull();
  });
});

describe("TxPagination — 스크린리더", () => {
  it("지금 쪽을 aria-current 로 알린다", () => {
    render(<TxPagination currentPage={2} totalRows={100} pageSize={10} />);
    expect(screen.getByRole("button", { name: "2쪽" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "1쪽" }).hasAttribute("aria-current")).toBe(false);
  });

  it("nav 로 감싸고 이름을 준다", () => {
    render(<TxPagination currentPage={1} totalRows={100} pageSize={10} />);
    expect(screen.getByRole("navigation").getAttribute("aria-label")).toBe("페이지 이동");
  });

  /** 번역된 문구를 그대로 준다. 키를 주고 안에서 번역하는 이중 경로를 만들지 않는다. */
  it("문구를 통째로 바꿀 수 있다", () => {
    render(<TxPagination currentPage={1} totalRows={100} pageSize={10} labels={{ nav: "Pages", next: "Next", page: (page) => `Page ${page}` }} />);

    expect(screen.getByRole("navigation").getAttribute("aria-label")).toBe("Pages");
    expect(screen.getByRole("button", { name: "Next" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Page 1" })).toBeTruthy();
  });
});

/**
 * 좁은 자리에서는 번호 대신 `‹ 3 / 12 ›`. `"auto"` 는 둘 다 그리고 CSS 가 고르므로
 * jsdom 에서는 "무엇이 DOM 에 있는가" 와 "CSS 가 어떻게 고르는가" 를 따로 본다.
 */
describe("TxPagination — 줄인 모양 (compact)", () => {
  const status = () => document.querySelector(".tx-pagination__status");

  it("기본은 auto — 번호와 3 / 12 를 둘 다 그리고 CSS 가 고른다", () => {
    render(<TxPagination currentPage={3} totalRows={120} pageSize={10} />);
    expect(screen.getByRole("navigation").getAttribute("data-compact")).toBe("auto");
    expect(pageButtons()).toHaveLength(10);
    expect(status()?.textContent).toContain("3 / 12");
  });

  it("compact 면 번호와 « » 없이 ‹ 3 / 12 › 만 그린다", () => {
    render(<TxPagination compact currentPage={3} totalRows={120} pageSize={10} />);
    expect(pageButtons()).toEqual([]);
    expect(screen.queryByRole("button", { name: "이전 묶음" })).toBeNull();
    expect(screen.queryByRole("button", { name: "다음 묶음" })).toBeNull();
    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual(["이전", "다음"]);
    expect(status()?.textContent).toContain("3 / 12");
  });

  it("compact 에서도 ‹ › 로 한 쪽씩 옮긴다", () => {
    const onChangePage = vi.fn();
    render(<TxPagination compact currentPage={3} totalRows={120} pageSize={10} onChangePage={onChangePage} />);
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(onChangePage).toHaveBeenLastCalledWith(4);
  });

  it("compact={false} 면 3 / 12 를 그리지 않는다 — 지금까지의 모양", () => {
    render(<TxPagination compact={false} currentPage={3} totalRows={120} pageSize={10} />);
    expect(status()).toBeNull();
    expect(pageButtons()).toHaveLength(10);
  });

  it("maxPage 가 있으면 전체 쪽수도 그 상한을 따른다", () => {
    render(<TxPagination compact currentPage={2} totalRows={100000} pageSize={10} maxPage={5} />);
    expect(status()?.textContent).toContain("2 / 5");
  });

  it("스크린리더에는 숫자 기호 대신 문장으로 읽힌다", () => {
    render(<TxPagination compact currentPage={3} totalRows={120} pageSize={10} />);
    expect(status()?.querySelector("[aria-hidden]")?.textContent).toBe("3 / 12");
    expect(status()?.textContent).toContain("12쪽 중 3쪽");
  });

  it("그 문장도 바꿀 수 있다", () => {
    render(<TxPagination compact currentPage={3} totalRows={120} pageSize={10} labels={{ status: (page, total) => `Page ${page} of ${total}` }} />);
    expect(status()?.textContent).toContain("Page 3 of 12");
  });
});

describe("TxPagination — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxPagination.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");
  const source = readFileSync(join(here, "TxPagination.tsx"), "utf8");

  it("색을 하드코딩하지 않는다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxPagination/TxPagination.css" layer(tx);');
  });

  /**
   * 원본은 버튼마다 Tailwind 클래스 덩어리를 발라 `TxButton` 의 색과 상태를 통째로 덮었다.
   * 그러면 `--tx-color-primary` 한 줄을 바꿔도 페이지 번호만 따라오지 않는다.
   */
  it("버튼의 색을 다시 칠하지 않는다 — TxButton 이 그린다", () => {
    expect(css).not.toContain("background-color");
    expect(css).not.toContain("--tx-button-bg");
    expect(source).toContain("variant=");
  });

  /** 화면 폭(@media)이 아니라 놓인 자리의 폭으로 고른다 — 옆 패널 안에서도 맞아야 한다. */
  it("auto 는 container query 로 고른다", () => {
    expect(css).toContain("container: tx-pagination / inline-size");
    expect(css).toMatch(/@container tx-pagination \(max-width: [\d.]+rem\)/);
    expect(css).not.toContain("@media");
  });

  it("줄인 모양을 강제할 때(true/false)는 container query 에 걸리지 않는다", () => {
    const query = css.slice(css.indexOf("@container"));
    expect(query).not.toMatch(/\.tx-pagination(?!\[data-compact="auto"\])[ .]/);
  });

  it("TxButton 뒤에 실린다 — 토큰을 덮으려면 순서가 뒤여야 한다", () => {
    expect(styles.indexOf("TxPagination/TxPagination.css")).toBeGreaterThan(styles.indexOf("TxButton/TxButton.css"));
  });
});
