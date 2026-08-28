import type { ColDef } from "ag-grid-community";
import { describe, expect, it } from "vitest";
import { TX_AG_GRID_INDEX_COL_ID, TX_AG_GRID_OFFSET_KEY, applyEditable, applyLocale, applySortState, applySortable, buildColumnDefs, createIndexColumn, mergeColumnDefs, prependIndexColumn } from "./TxAgGrid.utils";

/**
 * 열을 만드는 규칙이 이 컴포넌트의 전부다. **`.test.ts` 라 node 에서 돈다** —
 * 열 계산이 DOM 없이도 성립한다는 것까지 이 파일이 지킨다.
 */

interface Row {
  id: number;
  name: string;
  createdAt: string;
}

const ROWS: Row[] = [
  { id: 1, name: "가", createdAt: "2026-01-01" },
  { id: 2, name: "나", createdAt: "2026-01-02" }
];

const fields = (columnDefs: (ColDef<Row> | object)[]) => columnDefs.map((column) => ("field" in column ? column.field : "colId" in column ? column.colId : undefined));

describe("buildColumnDefs — 열을 필드 이름으로 만든다", () => {
  it("headers 의 순서를 그대로 쓴다", () => {
    expect(fields(buildColumnDefs<Row>(["name", "id"], undefined, undefined, ROWS))).toEqual(["name", "id"]);
  });

  it("headers 가 없으면 첫 행의 키에서 만든다", () => {
    expect(fields(buildColumnDefs<Row>(undefined, undefined, undefined, ROWS))).toEqual(["id", "name", "createdAt"]);
  });

  it("행도 headers 도 없으면 빈 열이다", () => {
    expect(buildColumnDefs<Row>(undefined, undefined, undefined, null)).toEqual([]);
  });

  it("hiddenHeaders 가 headers 보다 세다", () => {
    expect(fields(buildColumnDefs<Row>(["id", "name"], undefined, ["name"], ROWS))).toEqual(["id"]);
  });

  it("addHeaders 는 뒤에 붙고, 이미 있으면 늘어나지 않는다", () => {
    expect(fields(buildColumnDefs<Row>(["id"], ["createdAt", "id"], undefined, ROWS))).toEqual(["id", "createdAt"]);
  });

  it("addHeaders 도 hiddenHeaders 에 걸리면 빠진다", () => {
    expect(fields(buildColumnDefs<Row>(["id"], ["createdAt"], ["createdAt"], ROWS))).toEqual(["id"]);
  });
});

describe("mergeColumnDefs — field 로 찾아 덮어쓴다", () => {
  it("같은 field 의 설정을 덮는다", () => {
    const merged = mergeColumnDefs<Row>([{ field: "id" }, { field: "name" }], [{ field: "name", width: 200, headerName: "이름" }]);

    expect(merged[1]).toMatchObject({ field: "name", width: 200, headerName: "이름" });
    expect(merged[0]).toEqual({ field: "id" });
  });

  it("없는 field 는 새 열을 만들지 않는다 — 열의 목록은 headers 가 정한다", () => {
    expect(fields(mergeColumnDefs<Row>([{ field: "id" }], [{ field: "createdAt", width: 100 }]))).toEqual(["id"]);
  });
});

describe("순번 열 — 행 데이터도 클로저도 건드리지 않는다", () => {
  const valueOf = (rowIndex: number | null, offset?: number) => {
    const valueGetter = createIndexColumn<Row>(true).valueGetter as (params: { node: { rowIndex: number | null }; context: unknown }) => unknown;
    return valueGetter({ node: { rowIndex }, context: offset == null ? undefined : { [TX_AG_GRID_OFFSET_KEY]: offset } });
  };

  it("값을 행 위치와 offset 에서 계산한다", () => {
    expect(valueOf(0, 50)).toBe(51);
    expect(valueOf(3, 50)).toBe(54);
  });

  /**
   * offset 을 클로저로 잡으면 쪽을 넘겨도 그리드가 들고 있던 옛 함수가 불려서
   * 순번이 1부터 다시 시작한다. 값은 그릴 때 context 에서 읽어야 한다.
   */
  it("offset 을 클로저로 잡지 않는다 — 같은 열이 새 offset 을 따라온다", () => {
    const column = createIndexColumn<Row>(true);
    const valueGetter = column.valueGetter as (params: { node: { rowIndex: number }; context: unknown }) => unknown;

    expect(valueGetter({ node: { rowIndex: 0 }, context: { [TX_AG_GRID_OFFSET_KEY]: 0 } })).toBe(1);
    expect(valueGetter({ node: { rowIndex: 0 }, context: { [TX_AG_GRID_OFFSET_KEY]: 20 } })).toBe(21);
  });

  it("context 가 없어도 1부터 센다", () => {
    expect(valueOf(0)).toBe(1);
  });

  it("아직 자리를 못 잡은 행은 비운다", () => {
    expect(valueOf(null, 50)).toBe("");
  });

  it("field 를 갖지 않는다 — 행에 없는 열이다", () => {
    const column = createIndexColumn<Row>(true);
    expect(column.field).toBeUndefined();
    expect(column.colId).toBe(TX_AG_GRID_INDEX_COL_ID);
  });

  it("맨 앞에 붙는다", () => {
    const withIndex = prependIndexColumn<Row>([{ field: "id" }], createIndexColumn<Row>(true));
    expect(fields(withIndex)).toEqual([TX_AG_GRID_INDEX_COL_ID, "id"]);
  });

  it("선택 열이 있으면 고정하지 않는다 — 고정 자리를 다툰다", () => {
    expect(createIndexColumn<Row>(true).pinned).toBe("left");
    expect(createIndexColumn<Row>(false).pinned).toBeUndefined();
  });

  it("소비자가 같은 colId 로 준 설정이 이긴다", () => {
    const withIndex = prependIndexColumn<Row>([{ colId: TX_AG_GRID_INDEX_COL_ID, width: 120 } as ColDef<Row>, { field: "id" }], createIndexColumn<Row>(true));

    expect(withIndex).toHaveLength(2);
    expect(withIndex[0]).toMatchObject({ colId: TX_AG_GRID_INDEX_COL_ID, width: 120 });
  });
});

describe("applyEditable — 고칠 수 있는 열", () => {
  it("고른 열만 editable 이 된다", () => {
    const [id, name] = applyEditable<Row>([{ field: "id" }, { field: "name" }], ["name"]) as ColDef<Row>[];

    expect(id.editable).toBeUndefined();
    expect(name.editable).toBe(true);
  });

  it('"*" 는 전부다', () => {
    const columns = applyEditable<Row>([{ field: "id" }, { field: "name" }], "*") as ColDef<Row>[];
    expect(columns.every((column) => column.editable)).toBe(true);
  });

  it("헤더에 표시가 붙는다", () => {
    const [name] = applyEditable<Row>([{ field: "name" }], "*") as ColDef<Row>[];
    expect(name.headerComponentParams).toMatchObject({ editable: true });
  });

  it("안 주면 아무것도 바꾸지 않는다", () => {
    const columns: ColDef<Row>[] = [{ field: "id" }];
    expect(applyEditable<Row>(columns, undefined)).toBe(columns);
  });
});

describe("applySortable — 클라이언트 정렬과 서버 정렬", () => {
  it("클라이언트 정렬은 비교 함수를 건드리지 않는다", () => {
    const [column] = applySortable<Row>([{ field: "id" }], ["id"], "client") as ColDef<Row>[];

    expect(column.sortable).toBe(true);
    expect(column.comparator).toBeUndefined();
  });

  /** 화살표만 그리고 행 순서는 서버가 준 그대로 남아야 한다. */
  it("서버 정렬은 비교 함수가 항상 0 이라 순서를 바꾸지 않는다", () => {
    const [column] = applySortable<Row>([{ field: "id" }], "*", "server") as ColDef<Row>[];

    expect(column.sortable).toBe(true);

    // ag-grid 의 comparator 는 함수이거나 정렬 방향별 묶음이다. 우리는 함수 하나를 넣는다
    const comparator = column.comparator as (a: unknown, b: unknown) => number;
    expect(comparator(1, 2)).toBe(0);
    expect(comparator(2, 1)).toBe(0);
  });

  it('"none" 과 undefined 는 아무것도 하지 않는다', () => {
    const columns: ColDef<Row>[] = [{ field: "id" }];
    expect(applySortable<Row>(columns, "none", "client")).toBe(columns);
    expect(applySortable<Row>(columns, undefined, "client")).toBe(columns);
  });
});

describe("applySortState — 바깥의 정렬 상태를 열에 반영한다", () => {
  it("고른 열만 정렬 표시를 갖는다", () => {
    const [id, name] = applySortState<Row>([{ field: "id" }, { field: "name" }], { key: "id", value: "desc" }) as ColDef<Row>[];

    expect(id.sort).toBe("desc");
    expect(name.sort).toBeNull();
  });

  it('"none" 이면 전부 지운다', () => {
    const [id] = applySortState<Row>([{ field: "id", sort: "asc" }], { key: "id", value: "none" }) as ColDef<Row>[];
    expect(id.sort).toBeNull();
  });

  it("상태를 안 주면 그리드가 들고 있는 것을 건드리지 않는다", () => {
    const columns: ColDef<Row>[] = [{ field: "id", sort: "asc" }];
    expect(applySortState<Row>(columns, undefined)).toBe(columns);
  });
});

describe("applyLocale — 헤더 글자를 번역한다", () => {
  const upper = (text: string) => text.toUpperCase();

  it("headerName 이 있으면 그것을, 없으면 field 를 번역한다", () => {
    const [withName, withoutName] = applyLocale<Row>([{ field: "id", headerName: "번호" }, { field: "name" }], upper) as ColDef<Row>[];

    expect(withName.headerName).toBe("번호");
    expect(withoutName.headerName).toBe("NAME");
  });

  it("묶음 열의 자식까지 내려간다", () => {
    const [group] = applyLocale<Row>([{ headerName: "group", children: [{ field: "id" }] }], upper) as { headerName: string; children: ColDef<Row>[] }[];

    expect(group.headerName).toBe("GROUP");
    expect(group.children[0].headerName).toBe("ID");
  });

  it("안 주면 그대로 둔다 — field 를 headerName 으로 베끼지 않는다", () => {
    const [column] = applyLocale<Row>([{ field: "id" }], undefined) as ColDef<Row>[];
    expect(column.headerName).toBeUndefined();
  });
});
