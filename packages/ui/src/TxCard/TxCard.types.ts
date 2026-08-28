import type { HTMLAttributes, ReactNode } from "react";

export interface TxCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 제목. 없으면 제목 줄을 그리지 않는다 — 접을 수 있는 카드는 예외다(접는 버튼이 거기 있다). */
  title?: ReactNode;

  /** 접을 수 있게 한다. 제목 줄 오른쪽에 버튼이 붙는다. */
  collapsible?: boolean;

  /**
   * 접힘. **주면 controlled** 다 — 값의 주인은 소비자이고,
   * `onChangeCollapsed` 를 받고도 안 바꾸면 접히지 않는다.
   */
  collapsed?: boolean;
  /** 처음에 접어 둔다. controlled 일 때는 무시된다. 기본 `false`. */
  defaultCollapsed?: boolean;

  onChangeCollapsed?: (collapsed: boolean) => void;

  /** 펼쳐져 있을 때 버튼의 이름. 기본 `"접기"`. */
  collapseLabel?: string;
  /** 접혀 있을 때 버튼의 이름. 기본 `"펼치기"`. */
  expandLabel?: string;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { header?: string; title?: string; body?: string };

  children?: ReactNode;
}

export type TxCardFooterProps = HTMLAttributes<HTMLDivElement>;
