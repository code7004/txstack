import type { CustomInnerHeaderProps } from "ag-grid-react";

export interface TxAgGridHeaderProps extends CustomInnerHeaderProps {
  /** 이 열을 고칠 수 있다는 표시를 붙인다. `option.editColumns` 가 넣어 준다. */
  editable?: boolean;
}

/**
 * **내부 전용.** 헤더 글자 옆에 "고칠 수 있음" 점을 찍는다.
 *
 * 원본 이름은 `TxAgGridIconEdit` 였는데 아이콘이 아니라 헤더 렌더러다.
 * 점은 `aria-hidden` 이다 — 편집 가능 여부는 셀 자체가 알린다.
 */
export function TxAgGridHeader({ displayName, editable }: TxAgGridHeaderProps) {
  return (
    <span data-tag="TxAgGrid.Header" className="tx-ag-grid__header">
      {editable && <span aria-hidden="true" className="tx-ag-grid__editable-dot" />}
      <span className="tx-ag-grid__header-text">{displayName}</span>
    </span>
  );
}
