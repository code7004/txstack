import type { ColDef, ColGroupDef, ValueGetterParams } from "ag-grid-community";
import type { TxAgGridColumn, TxAgGridColumnDef, TxAgGridColumnFilter, TxAgGridField, TxAgGridSort } from "./TxAgGrid.types";
import { TxAgGridHeader } from "./TxAgGridHeader";

/** 순번 열의 `colId`. `field` 를 쓰지 않는다 — 행 데이터에 없는 열이기 때문이다. */
export const TX_AG_GRID_INDEX_COL_ID = "tx-index";

const hasField = <TData>(column: TxAgGridColumn<TData>): column is ColDef<TData> & { field: string } => "field" in column && typeof column.field === "string";

const isGroup = <TData>(column: TxAgGridColumn<TData>): column is ColGroupDef<TData> => "children" in column && Array.isArray(column.children);

/** 순번 열이 `offset` 을 읽어 가는 자리. 그리드 `context` 에 실어 보낸다. */
export const TX_AG_GRID_OFFSET_KEY = "txAgGridOffset";

/**
 * 순번 열. **행 데이터도 클로저도 건드리지 않는다.**
 *
 * 원본은 행마다 객체를 복사해 `#` 키를 심었다. 소비자가 준 객체에 없던 필드가 생기고,
 * 매번 새 객체라 `getRowId` 없이 쓰면 그리드가 행을 처음부터 다시 만든다.
 *
 * **`offset` 을 클로저로 잡지 않는 것이 중요하다.** 잡으면 쪽을 넘겨도 그리드가 들고 있던
 * 옛 함수가 그대로 불려서 순번이 1부터 다시 시작한다 — Storybook 에서 실제로 그렇게 나왔다.
 * 그래서 값은 그릴 때 `context` 에서 읽는다.
 */
export function createIndexColumn<TData>(pinned: boolean): ColDef<TData> {
  return {
    colId: TX_AG_GRID_INDEX_COL_ID,
    headerName: "#",
    width: 56,
    minWidth: 56,
    maxWidth: 60,
    // 선택 체크박스가 맨 앞에 고정되면 자리를 다투므로 그때는 고정하지 않는다.
    pinned: pinned ? "left" : undefined,
    lockPinned: pinned,
    sortable: false,
    editable: false,
    resizable: false,
    suppressMovable: true,
    cellClass: "tx-ag-grid__index-cell",
    headerClass: "tx-ag-grid__index-header",
    valueGetter: (params: ValueGetterParams<TData>) => {
      if (params.node?.rowIndex == null) return "";

      const offset = (params.context as Record<string, unknown> | undefined)?.[TX_AG_GRID_OFFSET_KEY];
      return (typeof offset === "number" ? offset : 0) + params.node.rowIndex + 1;
    }
  };
}

export function prependIndexColumn<TData>(columnDefs: TxAgGridColumnDef<TData>, indexColumn: ColDef<TData>): TxAgGridColumnDef<TData> {
  // 소비자가 같은 colId 로 열을 주면 그쪽 설정이 이긴다. 순서만 우리가 정한다.
  const custom = columnDefs.find((column) => "colId" in column && column.colId === TX_AG_GRID_INDEX_COL_ID);
  const rest = columnDefs.filter((column) => column !== custom);

  return [{ ...indexColumn, ...custom }, ...rest];
}

/** `headers` · `addHeaders` · `hiddenHeaders` 로 열을 만든다. 셋 다 없으면 첫 행의 키를 쓴다. */
export function buildColumnDefs<TData>(headers: TxAgGridField<TData>[] | undefined, addHeaders: TxAgGridField<TData>[] | undefined, hiddenHeaders: TxAgGridField<TData>[] | undefined, rowData: TData[] | null | undefined): TxAgGridColumnDef<TData> {
  const hidden = new Set<string>(hiddenHeaders ?? []);
  const firstRow = rowData?.[0];
  const inferred = headers?.length ? headers : firstRow && typeof firstRow === "object" ? (Object.keys(firstRow) as TxAgGridField<TData>[]) : [];

  const fields = [...inferred, ...(addHeaders ?? [])].filter((field) => !hidden.has(field));

  // 중복은 앞의 것을 남긴다 — addHeaders 는 "없으면 덧붙인다" 는 뜻이다.
  return [...new Set(fields)].map((field) => ({ field }) as ColDef<TData>);
}

/** `field` 가 같은 열을 찾아 덮어쓴다. 없는 `field` 는 무시한다. */
export function mergeColumnDefs<TData>(columnDefs: TxAgGridColumnDef<TData>, customColumnDefs?: TxAgGridColumnDef<TData>): TxAgGridColumnDef<TData> {
  if (!customColumnDefs?.length) return columnDefs;

  const custom = new Map<string, ColDef<TData>>();
  customColumnDefs.forEach((column) => {
    if (hasField(column)) custom.set(column.field, column);
  });

  return columnDefs.map((column) => (hasField(column) ? { ...column, ...custom.get(column.field) } : column));
}

const matcher = <TData>(filter?: TxAgGridColumnFilter<TData> | "*" | TxAgGridField<TData>[]) => {
  if (!filter || filter === "none") return () => false;
  if (filter === "*") return () => true;

  const set = new Set<string>(filter);
  return (field?: string | null) => !!field && set.has(field);
};

/** 고칠 수 있는 열. 헤더에 점을 붙여 눈에 띄게 한다. */
export function applyEditable<TData>(columnDefs: TxAgGridColumnDef<TData>, editColumns?: "*" | TxAgGridField<TData>[]): TxAgGridColumnDef<TData> {
  if (!editColumns) return columnDefs;
  const matches = matcher<TData>(editColumns);

  return columnDefs.map((column) => {
    if (isGroup(column) || !matches(column.field)) return column;

    return {
      ...column,
      editable: true,
      headerComponentParams: { ...column.headerComponentParams, innerHeaderComponent: TxAgGridHeader, editable: true }
    };
  });
}

/**
 * 정렬 가능한 열로 만든다.
 *
 * `server` 면 **행 순서를 그리드가 바꾸지 않는다** — 비교 함수가 항상 0 을 돌려주므로
 * 헤더의 화살표만 움직이고 순서는 서버가 준 그대로 남는다.
 */
export function applySortable<TData>(columnDefs: TxAgGridColumnDef<TData>, filter: TxAgGridColumnFilter<TData> | undefined, mode: "client" | "server"): TxAgGridColumnDef<TData> {
  if (!filter || filter === "none") return columnDefs;
  const matches = matcher<TData>(filter);

  return columnDefs.map((column) => {
    if (isGroup(column) || !matches(column.field)) return column;

    return { ...column, sortable: true, ...(mode === "server" ? { comparator: () => 0 } : {}) };
  });
}

/** 바깥이 들고 있는 정렬 상태를 열에 반영한다. */
export function applySortState<TData>(columnDefs: TxAgGridColumnDef<TData>, sortState?: TxAgGridSort<TData>): TxAgGridColumnDef<TData> {
  if (!sortState) return columnDefs;

  const key = sortState.value === "none" ? undefined : sortState.key;
  const value = sortState.value === "none" ? undefined : sortState.value;

  return columnDefs.map((column) => {
    if (isGroup(column) || !column.field) return column;
    return { ...column, sort: column.field === key ? value : null, sortIndex: undefined };
  });
}

/** 헤더 글자를 번역한다. 묶음 열의 자식까지 내려간다. */
export function applyLocale<TData>(columnDefs: TxAgGridColumnDef<TData>, locale?: (text: string) => string): TxAgGridColumnDef<TData> {
  if (!locale) return columnDefs;

  return columnDefs.map((column) => {
    if (isGroup(column)) {
      return {
        ...column,
        headerName: column.headerName ? locale(column.headerName) : column.headerName,
        children: applyLocale(column.children as TxAgGridColumnDef<TData>, locale)
      };
    }

    // headerName 이 없으면 field 를 키로 번역한다. 둘 다 없으면 건드리지 않는다.
    const source = column.headerName ?? (typeof column.field === "string" ? column.field : undefined);
    return source ? { ...column, headerName: locale(source) } : column;
  });
}
