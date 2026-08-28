import type { ColDef, ColGroupDef, RowSelectionOptions, Theme } from "ag-grid-community";
import type { AgGridReactProps } from "ag-grid-react";

/** `TData` 의 키이거나, 아직 타입에 없는 임의의 필드 이름. */
export type TxAgGridField<TData> = Extract<keyof TData, string> | (string & {});

export type TxAgGridColumn<TData> = ColDef<TData> | ColGroupDef<TData>;
export type TxAgGridColumnDef<TData> = TxAgGridColumn<TData>[];

/** `"*"` 전부 · `"none"` 없음 · 배열이면 그 필드만. */
export type TxAgGridColumnFilter<TData> = "*" | "none" | TxAgGridField<TData>[];

export type TxAgGridSortValue = "asc" | "desc" | "none";

export interface TxAgGridSort<TData = unknown> {
  key?: TxAgGridField<TData>;
  value: TxAgGridSortValue;
}

/**
 * 열을 어떻게 만들지. **`columnDefs` 를 직접 주면 이 중 `headers` 계열은 쓰이지 않는다.**
 */
export interface TxAgGridOption<TData = unknown> {
  /** 보여 줄 필드와 그 순서. 안 주면 첫 행의 키에서 만든다. */
  headers?: TxAgGridField<TData>[];
  /** `headers` 뒤에 덧붙일 필드. 이미 있는 것은 무시된다. */
  addHeaders?: TxAgGridField<TData>[];
  /** 빼고 싶은 필드. `headers` 보다 세다. */
  hiddenHeaders?: TxAgGridField<TData>[];

  /** 만들어진 열을 `field` 로 찾아 덮어쓴다. 폭·렌더러·포맷을 여기서 준다. */
  customColumnDefs?: TxAgGridColumnDef<TData>;

  /** 헤더 줄을 숨긴다. */
  hiddenHeader?: boolean;

  /** 고칠 수 있는 열. 헤더에 점이 붙어 눈에 띈다. */
  editColumns?: "*" | TxAgGridField<TData>[];

  /** 브라우저에서 정렬하는 열. */
  sortColumns?: TxAgGridColumnFilter<TData>;
  /**
   * **서버가 정렬하는 열.** 정렬 UI 만 그리드가 그리고 행 순서는 서버 응답을 그대로 둔다.
   * 헤더를 누르면 `onChangeSort` 가 오고, 다시 조회한 결과를 `rowData` 로 주면 된다.
   */
  serverSortColumns?: TxAgGridColumnFilter<TData>;

  rowSelection?: RowSelectionOptions | "single" | "multiple";
}

export interface TxAgGridPagination {
  currentPage: number;
  totalRows: number;
  pageSize: number;
  pageButtonCount?: number;
  maxPage?: number;
  onChangePage?: (page: number) => void;
}

export interface TxAgGridProps<TData = unknown> extends Omit<AgGridReactProps<TData>, "columnDefs" | "pagination" | "rowData" | "theme"> {
  rowData?: TData[] | null;
  /** 직접 만든 열. 주면 `option.headers` 계열보다 우선한다. */
  columnDefs?: TxAgGridColumnDef<TData>;

  option?: TxAgGridOption<TData>;

  /** `loading` 과 같다. 서버 훅이 주는 이름 그대로 꽂을 수 있게 둘 다 받는다. */
  isLoading?: boolean;

  /**
   * 맨 앞에 순번(`#`) 열을 붙인다. **그 쪽의 첫 행 번호**를 준다 — 2쪽 50개씩이면 `50`.
   *
   * 행 데이터는 건드리지 않는다. 번호는 그릴 때 행 위치에서 계산한다.
   */
  offset?: number;

  /** 헤더 글자를 번역한다. 안 주면 `headerName` 이나 `field` 를 그대로 쓴다. */
  locale?: (text: string) => string;

  /** 지금 정렬 상태. 서버 정렬에서 화면과 서버를 맞추는 자리다. */
  sortState?: TxAgGridSort<TData>;
  /** 정렬이 바뀌었을 때. `{ key, value }` 로 온다. */
  onChangeSort?: (sort: TxAgGridSort<TData>) => void;

  /** 주면 그리드 아래에 쪽 번호가 붙는다. `TxPagination` 이 그린다. */
  pagination?: TxAgGridPagination;

  /**
   * 이 그리드만의 테마. 안 주면 `TxAgGridProvider` 의 것, 그것도 없으면 ag-grid 의 Quartz 다.
   * 값은 `ag-grid-community` 가 내보내는 Theme 객체다.
   */
  theme?: Theme;
}
