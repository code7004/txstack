import type { CustomInnerHeaderProps } from "ag-grid-react";

export interface ITxAgGridInnerHeaderProps extends CustomInnerHeaderProps {
  showEdit?: boolean;
}

export function TxAgGridInnerHeader(props: ITxAgGridInnerHeaderProps) {
  return (
    <div data-tag="TxAgGrid.InnerHeader" className="flex min-w-0 items-center gap-1">
      {props.showEdit && <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500 dark:bg-sky-400" aria-hidden="true" />}
      <span>{props.displayName}</span>
    </div>
  );
}

export const TxAgGridIconEdit = TxAgGridInnerHeader;
