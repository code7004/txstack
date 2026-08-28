import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AllCommunityModule, ModuleRegistry, themeBalham } from "ag-grid-community";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TxAgGrid } from "./TxAgGrid";
import { TxAgGridProvider } from "./TxAgGrid.context";

/**
 * 열 계산은 `TxAgGrid.utils.test.ts` 가 본다. 여기서는 **그리드에 실제로 닿는지**만 본다 —
 * 순번 열이 화면에 나오는가, 쪽 번호가 붙는가, 테마가 Provider 를 타는가.
 */

interface Row {
  id: number;
  name: string;
}

const ROWS: Row[] = [
  { id: 1, name: "가" },
  { id: 2, name: "나" },
  { id: 3, name: "다" }
];

beforeAll(() => {
  // 모듈 등록은 소비 앱의 일이다. 테스트도 소비자라 여기서 한다.
  ModuleRegistry.registerModules([AllCommunityModule]);

  // jsdom 에는 없다. 없으면 ag-grid 가 크기를 재다가 멈춘다.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(cleanup);

/** ag-grid 헤더는 안쪽에 여백과 아이콘이 함께 들어 있다. 글자만 본다. */
const headerTexts = () => screen.getAllByRole("columnheader").map((cell) => cell.textContent?.trim());

describe("TxAgGrid — 그리드에 닿는다", () => {
  it("행과 열을 그린다", async () => {
    render(<TxAgGrid<Row> rowData={ROWS} option={{ headers: ["id", "name"] }} />);

    await waitFor(() => expect(screen.getByText("나")).toBeTruthy());
    // ag-grid 가 field 를 사람이 읽는 글자로 다듬는다 (id -> Id)
    expect(headerTexts()).toEqual(["Id", "Name"]);
  });

  it("locale 이 헤더 글자를 바꾼다", async () => {
    render(<TxAgGrid<Row> rowData={ROWS} option={{ headers: ["id", "name"] }} locale={(text) => ({ id: "번호", name: "이름" })[text] ?? text} />);

    await waitFor(() => expect(headerTexts()).toEqual(["번호", "이름"]));
  });

  /** 원본은 행마다 객체를 복사해 `#` 키를 심었다. 소비자 객체에 없던 필드가 생겼다. */
  it("offset 을 주면 순번이 나오고, 준 행 객체는 그대로다", async () => {
    const rows: Row[] = [{ id: 7, name: "가" }];
    render(<TxAgGrid<Row> rowData={rows} offset={50} option={{ headers: ["id"] }} />);

    await waitFor(() => expect(screen.getByText("51")).toBeTruthy());
    expect(Object.keys(rows[0])).toEqual(["id", "name"]);
  });

  it("offset 이 없으면 순번 열도 없다", async () => {
    render(<TxAgGrid<Row> rowData={ROWS} option={{ headers: ["id", "name"] }} />);

    await waitFor(() => expect(screen.getByText("가")).toBeTruthy());
    expect(headerTexts()).toEqual(["Id", "Name"]);
  });
});

describe("TxAgGrid — 쪽 번호", () => {
  it("pagination 을 주면 아래에 붙는다", async () => {
    const onChangePage = vi.fn();
    const { container } = render(<TxAgGrid<Row> rowData={ROWS} option={{ headers: ["id"] }} pagination={{ currentPage: 1, totalRows: 120, pageSize: 10, onChangePage }} />);

    await waitFor(() => expect(container.querySelector(".tx-pagination")).toBeTruthy());
    expect(screen.getByRole("navigation")).toBeTruthy();
  });

  it("안 주면 그리지 않는다", async () => {
    const { container } = render(<TxAgGrid<Row> rowData={ROWS} option={{ headers: ["id", "name"] }} />);

    await waitFor(() => expect(screen.getByText("가")).toBeTruthy());
    expect(container.querySelector(".tx-pagination")).toBeNull();
  });

  /**
   * 원본은 껍데기를 ag-grid 의 `ag-paging-panel` 안에 그렸다. 그건 ag-grid 것이라
   * 그쪽이 이름이나 구조를 바꾸면 조용히 깨진다. 지금은 그리드 **바깥**에 우리 자리가 있다.
   */
  it("쪽 번호가 그리드 바깥에 선다", async () => {
    const { container } = render(<TxAgGrid<Row> rowData={ROWS} pagination={{ currentPage: 1, totalRows: 120, pageSize: 10 }} />);

    await waitFor(() => expect(container.querySelector(".tx-ag-grid__footer")).toBeTruthy());

    const footer = container.querySelector(".tx-ag-grid__footer")!;
    expect(footer.parentElement?.getAttribute("data-tag")).toBe("TxAgGrid");
    expect(footer.closest(".tx-ag-grid__viewport")).toBeNull();
  });
});

describe("TxAgGrid — 겉", () => {
  /** 원본은 className 의 기본값이 Tailwind 문자열이라, 소비자가 주는 순간 높이가 사라졌다. */
  it("className 은 기본 클래스를 덧붙는다 — 교체가 아니다", async () => {
    const { container } = render(<TxAgGrid<Row> rowData={ROWS} className="my-grid" />);

    const root = container.querySelector('[data-tag="TxAgGrid"]')!;
    expect(root.classList.contains("tx-ag-grid")).toBe(true);
    expect(root.classList.contains("my-grid")).toBe(true);
  });

  it("Provider 의 테마를 쓴다", async () => {
    const { container } = render(
      <TxAgGridProvider theme={themeBalham}>
        <TxAgGrid<Row> rowData={ROWS} />
      </TxAgGridProvider>
    );

    // ag-grid 는 테마를 클래스로 심는다. 어느 테마인지가 아니라 "우리 것이 아닌 게 갔다" 를 본다
    await waitFor(() => expect(container.querySelector("[class*='ag-theme']")).toBeTruthy());
  });
});

describe("TxAgGrid — CSS 계약", () => {
  const here = import.meta.dirname;
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "");

  const css = strip(readFileSync(join(here, "TxAgGrid.css"), "utf8"));
  const tokens = strip(readFileSync(join(here, "..", "tokens.css"), "utf8"));
  const styles = readFileSync(join(here, "..", "styles.css"), "utf8");

  it("색을 하드코딩하지 않는다", () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g) ?? []).toEqual([]);
  });

  it(".dark 분기를 갖지 않는다", () => {
    expect(css).not.toContain(".dark");
  });

  it("참조하는 전역 토큰이 전부 tokens.css 에 정의돼 있다", () => {
    const referenced = new Set([...css.matchAll(/var\(\s*(--tx-(?:color|state|radius|focus)[\w-]*)/g)].map((match) => match[1]));
    expect([...referenced].filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
  });

  it("styles.css 에 실려 나간다", () => {
    expect(styles).toContain('@import "./TxAgGrid/TxAgGrid.css" layer(tx);');
  });

  /**
   * 줄·헤더·셀의 겉모습은 ag-grid 의 Theming API 가 소유한다. 우리가 그 안을 덮으면
   * 같은 것을 두 곳이 정하게 되고, 소비자가 테마를 바꿔도 우리 규칙이 남아 어긋난다.
   */
  it("ag-grid 내부 클래스를 겨냥하지 않는다", () => {
    expect(css.match(/\.ag-[\w-]+/g) ?? []).toEqual([]);
  });
});
