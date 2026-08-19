import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef } from "react";
import { appendOffsetColumn, applyEditableColumns, applyLocalizedHeaders, applyOffsetRowData, applyServerSortColumns, applySortableColumns, applySortState, buildColumnDefs, mergeColumnDefs, TxAgGridPagination, type ITxAgGrid } from ".";
import { useTxAgGridContext } from "./TxAgGrid.context";

function getRowDataFieldSignature<TData>(rowData?: TData[] | null) {
  const firstRow = rowData?.[0];
  if (!firstRow || typeof firstRow !== "object") return "";

  return Object.keys(firstRow).join("\u0000");
}

function shallowEqualRecord(a?: Record<string, unknown> | null, b?: Record<string, unknown> | null) {
  if (a === b) return true;
  if (!a || !b) return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => a[key] === b[key]);
}

function useShallowStableRecord<T extends Record<string, unknown> | undefined>(value: T): T {
  const ref = useRef<T>(value);

  if (!shallowEqualRecord(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

export default function TxAgGrid<TData = any>({
  isLoading,
  loading,
  offset,
  className = "flex flex-1 min-h-0 flex-col",
  rowData,
  columnDefs,
  option,
  pagination,
  locale,
  sortState,
  onSortChanged,
  onChangeSort,
  defaultColDef,
  headerHeight,
  groupHeaderHeight,
  floatingFiltersHeight,
  pivotHeaderHeight,
  pivotGroupHeaderHeight,
  ...props
}: ITxAgGrid<TData>) {
  const { theme } = useTxAgGridContext();
  const resolvedRowData = useMemo(() => applyOffsetRowData(rowData, offset), [offset, rowData]);
  const stableDefaultColDef = useShallowStableRecord(defaultColDef as Record<string, unknown> | undefined);
  const hasOffsetColumn = offset != null;
  const rowDataFieldSignature = getRowDataFieldSignature(rowData);
  const columnDefSourceRowDataRef = useRef<{ rowData?: TData[] | null; signature: string }>({ rowData, signature: rowDataFieldSignature });

  if (rowDataFieldSignature && columnDefSourceRowDataRef.current.signature !== rowDataFieldSignature) {
    columnDefSourceRowDataRef.current = { rowData, signature: rowDataFieldSignature };
  }

  const shouldInferColumnsFromRowData = !columnDefs?.length && !option?.headers?.length;
  // const inferredColumnSignature = shouldInferColumnsFromRowData ? columnDefSourceRowDataRef.current.signature : '';
  const columnDefSourceRowData = shouldInferColumnsFromRowData ? columnDefSourceRowDataRef.current.rowData : undefined;
  // 초기 로딩과 서버 재조회 로딩 모두 grid overlay로 처리해 화면 교체를 줄인다.
  const resolvedLoading = loading ?? isLoading ?? false;

  const resolvedColumnDefs = useMemo(() => {
    // console.log('[TxAgGrid] build columnDefs', {
    //   hasColumnDefs: !!columnDefs?.length,
    //   inferredColumnSignature,
    //   headers: option?.headers,
    //   addHeaders: option?.addHeaders,
    //   hiddenHeaders: option?.hiddenHeaders,
    //   hasOffsetColumn,
    // });

    const base = columnDefs?.length ? columnDefs : buildColumnDefs(option?.headers, option?.addHeaders, option?.hiddenHeaders, columnDefSourceRowData);
    const merged = mergeColumnDefs(base, option?.customColumnDefs);
    const withOffset = appendOffsetColumn(merged, hasOffsetColumn ? 0 : undefined, !!option?.rowSelection);
    const editableDefs = applyEditableColumns(withOffset, option?.editColumns);
    const sortableDefs = applySortableColumns(editableDefs, option?.sortColumns);
    const serverSortableDefs = applyServerSortColumns(sortableDefs, option?.serverSortColumns);
    const sortedStateDefs = applySortState(serverSortableDefs, sortState);
    const defs = applyLocalizedHeaders(sortedStateDefs, locale);
    return defs;
  }, [
    columnDefSourceRowData,
    columnDefs,
    hasOffsetColumn,
    // inferredColumnSignature,
    locale,
    option?.customColumnDefs,
    option?.headers,
    option?.addHeaders,
    option?.hiddenHeaders,
    option?.editColumns,
    option?.sortColumns,
    option?.serverSortColumns,
    option?.rowSelection,
    sortState
  ]);

  const hdSortChanged = useCallback<NonNullable<ITxAgGrid<TData>["onSortChanged"]>>(
    (event) => {
      const activeSort = event.api.getColumnState().find((column) => !!column.colId && !!column.sort);

      onChangeSort?.({
        key: activeSort?.colId as Extract<keyof TData, string> | (string & {}) | undefined,
        value: activeSort?.sort ?? "none"
      });
      onSortChanged?.(event);
    },
    [onChangeSort, onSortChanged]
  );

  return (
    <div className={className}>
      <div className="min-h-0 flex-1">
        <AgGridReact
          theme={theme}
          loading={resolvedLoading}
          rowData={resolvedRowData}
          columnDefs={resolvedColumnDefs}
          rowSelection={option?.rowSelection}
          onSortChanged={hdSortChanged}
          defaultColDef={stableDefaultColDef}
          headerHeight={option?.hiddenHeader ? 0 : headerHeight}
          groupHeaderHeight={option?.hiddenHeader ? 0 : groupHeaderHeight}
          floatingFiltersHeight={option?.hiddenHeader ? 0 : floatingFiltersHeight}
          pivotHeaderHeight={option?.hiddenHeader ? 0 : pivotHeaderHeight}
          pivotGroupHeaderHeight={option?.hiddenHeader ? 0 : pivotGroupHeaderHeight}
          {...props}
        />
      </div>

      {pagination && pagination.totalRows > pagination.pageSize && (
        <div className="ag-paging-panel">
          <div className="flex min-h-11 w-full items-center justify-end gap-2 py-1">
            <TxAgGridPagination
              currentPage={pagination.currentPage}
              totalRows={pagination.totalRows}
              pageSize={pagination.pageSize}
              pageButtonCount={pagination.pageButtonCount}
              suppressPageStepNavigation={pagination.suppressPageStepNavigation}
              suppressPageGroupNavigation={pagination.suppressPageGroupNavigation}
              onChangePage={pagination.onChangePage}
              onChangePageGroup={pagination.onChangePageGroup}
              maxPage={pagination.maxPage}
              theme={pagination.theme}
            />
          </div>
        </div>
      )}
    </div>
  );
}
