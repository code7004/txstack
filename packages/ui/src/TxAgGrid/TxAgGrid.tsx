import type { ColDef, GridApi, GridReadyEvent, SortChangedEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { cm } from "../tx-ui.utils";
import { TxPagination } from "../TxPagination";
import { useTxAgGridTheme } from "./TxAgGrid.context";
import type { TxAgGridProps, TxAgGridSort } from "./TxAgGrid.types";
import { TX_AG_GRID_INDEX_COL_ID, TX_AG_GRID_OFFSET_KEY, applyEditable, applyLocale, applySortState, applySortable, buildColumnDefs, createIndexColumn, mergeColumnDefs, prependIndexColumn } from "./TxAgGrid.utils";

/**
 * ag-grid 위에 **목록 화면에서 늘 하는 일**을 얹은 표.
 *
 * - 열을 **필드 이름만으로** 만든다 (`option.headers`). 안 주면 첫 행의 키에서 만든다
 * - `offset` 을 주면 맨 앞에 순번(`#`) 열이 붙는다. **행 데이터는 건드리지 않는다**
 * - `pagination` 을 주면 아래에 쪽 번호가 붙는다 (`TxPagination`)
 * - 서버 정렬은 `option.serverSortColumns` + `onChangeSort` 다 — 화살표만 그리고 순서는 서버가 정한다
 *
 * @example
 * ```tsx
 * <TxAgGrid
 *   rowData={data?.rows}
 *   isLoading={isLoading}
 *   offset={offset}
 *   defaultColDef={{ flex: 1 }}
 *   option={{ headers: ["id", "name"], editColumns: ["name"] }}
 *   pagination={{ currentPage, totalRows, pageSize: 50, onChangePage }}
 * />
 * ```
 *
 * **모듈 등록은 소비 앱이 한다** — `ModuleRegistry.registerModules([AllCommunityModule])`.
 * 라이브러리가 대신 하면 필요한 모듈만 고르거나 enterprise 모듈을 쓰는 선택지를 뺏는다.
 *
 * 명세: `docs/001_ui.md`
 */
export function TxAgGrid<TData = unknown>({
  rowData,
  columnDefs,
  option,
  isLoading,
  loading,
  offset,
  locale,
  sortState,
  onChangeSort,
  onSortChanged,
  onGridReady,
  context,
  pagination,
  theme,
  className,
  headerHeight,
  groupHeaderHeight,
  ...props
}: TxAgGridProps<TData>) {
  const resolvedTheme = useTxAgGridTheme(theme);
  const apiRef = useRef<GridApi<TData> | null>(null);

  /*
    첫 행의 키로 열을 만드는 경로가 있어서, 열의 입력은 rowData 전체가 아니라 키 목록이다.
    행이 바뀔 때마다 열을 다시 만들면 그리드가 폭과 정렬 상태를 잃는다.
  */
  const fieldSignature = useMemo(() => {
    const firstRow = rowData?.[0];
    return firstRow && typeof firstRow === "object" ? Object.keys(firstRow).join(" ") : "";
  }, [rowData]);

  const resolvedColumnDefs = useMemo(
    () => {
      const base = columnDefs?.length ? columnDefs : buildColumnDefs(option?.headers, option?.addHeaders, option?.hiddenHeaders, rowData);

      const merged = mergeColumnDefs(base, option?.customColumnDefs);
      const editable = applyEditable(merged, option?.editColumns);
      const sortable = applySortable(editable, option?.sortColumns, "client");
      const serverSortable = applySortable(sortable, option?.serverSortColumns, "server");
      const sorted = applySortState(serverSortable, sortState);
      const localized = applyLocale(sorted, locale);

      if (offset == null) return localized;

      // 선택 열이 맨 앞에 오면 고정 자리를 다투므로 그때는 순번을 고정하지 않는다.
      return prependIndexColumn(localized, createIndexColumn<TData>(!option?.rowSelection));
    },
    // rowData 자체가 아니라 키 목록이 열을 정한다. offset 은 열이 아니라 context 로 간다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnDefs, fieldSignature, locale, offset == null, option, sortState]
  );

  /** 순번은 `context` 에서 읽는다. 소비자가 준 `context` 는 그대로 함께 간다. */
  const resolvedContext = useMemo(() => ({ ...context, [TX_AG_GRID_OFFSET_KEY]: offset ?? 0 }), [context, offset]);

  /*
    `context` 만 바뀌면 그리드는 이미 그린 셀을 다시 계산하지 않는다.
    쪽을 넘겨도 행 데이터가 그대로인 경우가 있어서(같은 내용의 다음 쪽) 여기서 직접 새로 그린다.
  */
  useEffect(() => {
    apiRef.current?.refreshCells({ force: true, columns: [TX_AG_GRID_INDEX_COL_ID] });
  }, [offset]);

  const hdGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      apiRef.current = event.api;
      onGridReady?.(event);
    },
    [onGridReady]
  );

  const hdSortChanged = useCallback(
    (event: SortChangedEvent<TData>) => {
      const active = event.api.getColumnState().find((column) => !!column.colId && !!column.sort);

      onChangeSort?.({ key: active?.colId, value: active?.sort ?? "none" } as TxAgGridSort<TData>);
      onSortChanged?.(event);
    },
    [onChangeSort, onSortChanged]
  );

  return (
    // 높이는 CSS 가 소유한다. 원본은 기본값이 Tailwind 문자열이라 className 을 주면 통째로 교체됐다.
    <div data-tag="TxAgGrid" className={cm("tx-ag-grid", className)}>
      <div className="tx-ag-grid__viewport">
        <AgGridReact<TData>
          {...props}
          theme={resolvedTheme}
          context={resolvedContext}
          rowData={rowData}
          columnDefs={resolvedColumnDefs as ColDef<TData>[]}
          rowSelection={option?.rowSelection}
          loading={loading ?? isLoading ?? false}
          headerHeight={option?.hiddenHeader ? 0 : headerHeight}
          groupHeaderHeight={option?.hiddenHeader ? 0 : groupHeaderHeight}
          onGridReady={hdGridReady}
          onSortChanged={hdSortChanged}
        />
      </div>

      {pagination && (
        <div className="tx-ag-grid__footer">
          <TxPagination currentPage={pagination.currentPage} totalRows={pagination.totalRows} pageSize={pagination.pageSize} pageButtonCount={pagination.pageButtonCount} maxPage={pagination.maxPage} onChangePage={pagination.onChangePage} />
        </div>
      )}
    </div>
  );
}
