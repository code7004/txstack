import { colorSchemeDarkBlue, themeAlpine, themeBalham, themeMaterial, themeQuartz, type ColDef, type ColGroupDef } from "ag-grid-community";
import { AGGrid_Theme_TYPE, type ITxAgGridColumn, type ITxAgGridColumnDef, type ITxAgGridFieldKey, type ITxAgGridSortChange } from "./TxAgGrid.types";
import { TxAgGridInnerHeader } from "./TxAgGridIcon";

const TX_AG_GRID_OFFSET_FIELD = "#";
const TX_AG_GRID_OFFSET_COLUMN: ColDef<any> = {
  field: TX_AG_GRID_OFFSET_FIELD,
  headerName: "#",
  width: 56,
  minWidth: 56,
  maxWidth: 60,
  pinned: "left",
  lockPinned: true,
  sortable: false,
  editable: false,
  resizable: false,
  suppressMovable: true,
  cellClass: "text-center",
  headerClass: "text-center"
};

function getOffsetColumnDef<TData = any>(useRowSelection?: boolean): ColDef<TData> {
  if (!useRowSelection) return TX_AG_GRID_OFFSET_COLUMN as ColDef<TData>;

  return {
    ...TX_AG_GRID_OFFSET_COLUMN,
    pinned: undefined,
    lockPinned: false
  } as ColDef<TData>;
}

function hasField<TData>(column: ITxAgGridColumn<TData>): column is ColDef<TData> & { field: string } {
  return "field" in column && typeof column.field === "string";
}

function withHeaderDecoration<TData>(column: ColDef<TData>, options: { showEdit?: boolean; showSortable?: boolean }): ColDef<TData> {
  const currentHeaderComponentParams = (column.headerComponentParams ?? {}) as { showEdit?: boolean; showSortable?: boolean };

  return {
    ...column,
    headerComponentParams: {
      ...currentHeaderComponentParams,
      innerHeaderComponent: TxAgGridInnerHeader,
      showEdit: currentHeaderComponentParams.showEdit || options.showEdit
    }
  };
}

function appendHeaderClass<TData>(column: ColDef<TData>, nextClassName: string): ColDef<TData>["headerClass"] {
  const currentHeaderClass = column.headerClass;

  if (!currentHeaderClass) return nextClassName;
  if (typeof currentHeaderClass === "string") return `${currentHeaderClass} ${nextClassName}`;
  if (Array.isArray(currentHeaderClass)) return [...currentHeaderClass, nextClassName];
  return currentHeaderClass;
}

export function getAgGridTheme(id?: AGGrid_Theme_TYPE) {
  switch (id) {
    case AGGrid_Theme_TYPE.QuartzDarkBlue:
      return themeQuartz.withPart(colorSchemeDarkBlue);
    case AGGrid_Theme_TYPE.Alpine:
      return themeAlpine;
    case AGGrid_Theme_TYPE.Balham:
      return themeBalham;
    case AGGrid_Theme_TYPE.Material:
      return themeMaterial;
    default:
      return themeQuartz;
  }
}

export function applyOffsetRowData<TData = any>(rowData?: TData[] | null, offset?: number): TData[] {
  if (!rowData?.length) return rowData ?? [];
  if (offset == null) return rowData;

  return rowData.map((row, index) => {
    if (!row || typeof row !== "object") return row;
    return { ...(row as object), [TX_AG_GRID_OFFSET_FIELD]: offset + index + 1 } as TData;
  });
}

export function appendOffsetColumn<TData = any>(columnDefs?: ITxAgGridColumnDef<TData> | null, offset?: number, useRowSelection?: boolean): ITxAgGridColumnDef<TData> | undefined {
  if (offset == null) return columnDefs ?? undefined;
  if (!columnDefs?.length) return [getOffsetColumnDef<TData>(useRowSelection)];

  const offsetColumnDef = getOffsetColumnDef<TData>(useRowSelection);
  const offsetColumns: ITxAgGridColumnDef<TData> = [];
  const otherColumns: ITxAgGridColumnDef<TData> = [];

  columnDefs.forEach((column) => {
    if ("field" in column && column.field === TX_AG_GRID_OFFSET_FIELD) {
      offsetColumns.push({ ...offsetColumnDef, ...column } as ColDef<TData>);
      return;
    }

    otherColumns.push(column);
  });

  if (!offsetColumns.length) {
    offsetColumns.push(offsetColumnDef);
  }

  return [...offsetColumns, ...otherColumns];
}

export function buildColumnDefs<TData = any>(headers?: ITxAgGridFieldKey<TData>[], addHeaders?: ITxAgGridFieldKey<TData>[], hiddenHeaders?: ITxAgGridFieldKey<TData>[], rowData?: TData[] | null): ITxAgGridColumnDef<TData> | undefined {
  const hiddenHeaderSet = new Set(hiddenHeaders ?? []);
  const toColumnDef = (field: ITxAgGridFieldKey<TData>): ColDef<TData> => ({ field: field as ColDef<TData>["field"] });
  const appendHeaders = (columnDefs: ColDef<TData>[]) => {
    if (!addHeaders?.length) return columnDefs;

    const existingFields = new Set(
      columnDefs.reduce<string[]>((fields, column) => {
        if (typeof column.field === "string") fields.push(column.field);
        return fields;
      }, [])
    );
    const extraColumns = addHeaders.filter((field) => !hiddenHeaderSet.has(field) && !existingFields.has(String(field))).map(toColumnDef);

    return [...columnDefs, ...extraColumns];
  };

  if (headers?.length) {
    return appendHeaders(headers.filter((field) => !hiddenHeaderSet.has(field)).map(toColumnDef));
  }

  const firstRow = rowData?.[0];
  if (!firstRow || typeof firstRow !== "object") {
    return appendHeaders([]);
  }

  return appendHeaders(
    Object.keys(firstRow)
      .filter((field): field is ITxAgGridFieldKey<TData> => !hiddenHeaderSet.has(field as ITxAgGridFieldKey<TData>))
      .map(toColumnDef)
  );
}

export function mergeColumnDefs<TData = any>(columnDefs?: ITxAgGridColumnDef<TData> | null, customColumnDefs?: ITxAgGridColumnDef<TData> | null): ITxAgGridColumnDef<TData> | undefined {
  if (!columnDefs?.length) return undefined;
  if (!customColumnDefs?.length) return columnDefs;

  const customMap = new Map<string, ColDef<TData>>();
  customColumnDefs.forEach((column) => {
    if (hasField(column)) customMap.set(column.field, column);
  });

  const mergedColumnDefs = columnDefs.map((column) => {
    if (!hasField(column)) return column;

    const customColumn = customMap.get(column.field);
    if (!customColumn) return column;

    return { ...column, ...customColumn };
  });

  return mergedColumnDefs;
}

function matchGridColumns<TData = any>(targetColumns?: "*" | "none" | (keyof TData | string)[]) {
  if (!targetColumns || targetColumns === "none") {
    return () => false;
  }

  if (targetColumns === "*") {
    return () => true;
  }

  const targetColumnSet = new Set((targetColumns as string[]) ?? []);
  return (field?: string | null) => !!field && targetColumnSet.has(field);
}

export function applyEditableColumns<TData = any>(columnDefs?: ColDef<TData>[] | null, editColumns?: "*" | (keyof TData | string)[]): ColDef<TData>[] | null | undefined {
  if (!columnDefs?.length) return columnDefs;
  if (!editColumns) return columnDefs;

  const isMatchedColumn = matchGridColumns(editColumns);

  return columnDefs.map((column) => {
    if (!isMatchedColumn(column.field)) return column;

    return withHeaderDecoration(
      {
        ...column,
        editable: true
      },
      { showEdit: true }
    );
  });
}

export function applySortableColumns<TData = any>(columnDefs?: ColDef<TData>[] | null, sortColumns?: "*" | "none" | (keyof TData | string)[]): ColDef<TData>[] | null | undefined {
  if (!columnDefs?.length) return columnDefs;
  if (!sortColumns || sortColumns === "none") return columnDefs;

  const isMatchedColumn = matchGridColumns(sortColumns);

  return columnDefs.map((column) => {
    if (!isMatchedColumn(column.field)) return column;

    return withHeaderDecoration(
      {
        ...column,
        sortable: true,
        headerClass: appendHeaderClass(column, "tx-ag-grid-sortable")
      },
      {}
    );
  });
}

export function applyServerSortColumns<TData = any>(columnDefs?: ColDef<TData>[] | null, serverSortColumns?: "*" | "none" | (keyof TData | string)[]): ColDef<TData>[] | null | undefined {
  if (!columnDefs?.length) return columnDefs;
  if (!serverSortColumns || serverSortColumns === "none") return columnDefs;

  const isMatchedColumn = matchGridColumns(serverSortColumns);

  return columnDefs.map((column) => {
    if (!isMatchedColumn(column.field)) return column;

    return withHeaderDecoration(
      {
        ...column,
        sortable: true,
        // 서버 정렬 컬럼은 정렬 UI만 grid에 맡기고 실제 행 순서는 서버 응답으로 유지한다.
        comparator: () => 0,
        headerClass: appendHeaderClass(column, "tx-ag-grid-sortable")
      },
      {}
    );
  });
}

export function applySortState<TData = any>(columnDefs?: ColDef<TData>[] | null, sortState?: ITxAgGridSortChange<TData>): ColDef<TData>[] | null | undefined {
  if (!columnDefs?.length) return columnDefs;

  const sortKey = sortState?.value !== "none" ? sortState?.key : undefined;
  const sortValue = sortState?.value !== "none" ? sortState?.value : undefined;

  return columnDefs.map((column) => {
    if (!column.field) return column;

    return {
      ...column,
      sort: sortKey && column.field === sortKey ? sortValue : undefined,
      sortIndex: undefined
    };
  });
}

function isColumnGroup<TData>(column: ITxAgGridColumn<TData>): column is ColGroupDef<TData> {
  return "children" in column && Array.isArray(column.children);
}

export function applyLocalizedHeaders<TData = any>(columnDefs?: ITxAgGridColumnDef<TData> | null, locale?: (text: string) => string): ITxAgGridColumnDef<TData> | undefined {
  if (!columnDefs?.length) return columnDefs ?? undefined;
  if (!locale) return columnDefs;

  return columnDefs.map((column) => {
    if (isColumnGroup(column)) {
      return {
        ...column,
        headerName: column.headerName ? locale(column.headerName) : column.headerName,
        children: applyLocalizedHeaders(column.children as ITxAgGridColumnDef<TData>, locale)
      };
    }

    const nextHeaderName = column.headerName ? locale(column.headerName) : typeof column.field === "string" ? locale(column.field) : column.headerName;
    return {
      ...column,
      headerName: nextHeaderName
    };
  });
}
