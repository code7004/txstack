import type { HTMLAttributes, ReactNode } from "react";

export interface TxTabItem {
  /** 머리말. **`ReactNode` 라 배지·아이콘이 그대로 들어간다.** */
  label: ReactNode;

  /**
   * 본문. **안 주면 패널을 아예 그리지 않는다** — 탭을 전환 스위치로만 쓰는 자리가 그렇다.
   *
   * 하나라도 준 항목이 있으면 패널 자리가 생긴다.
   */
  content?: ReactNode;

  /** 고를 수 없게 한다. 화살표 키도 건너뛴다. */
  disabled?: boolean;

  /** 스크린리더가 읽을 이름. `label` 이 글자가 아닐 때(아이콘만 있을 때) 준다. */
  "aria-label"?: string;
}

export interface TxTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  tabs: TxTabItem[];

  /**
   * 고른 탭의 번호. **주면 controlled** 다 — 값의 주인은 소비자이고,
   * `onChange` 를 받고도 안 바꾸면 화면도 안 바뀐다.
   */
  value?: number;
  /** 처음에 고를 탭. controlled 일 때는 무시된다. 기본 `0`. */
  defaultValue?: number;

  /** 고른 탭이 바뀔 때. **같은 탭을 다시 눌러도 오지 않는다.** */
  onChange?: (index: number) => void;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { list?: string; tab?: string; panel?: string };

  /** 탭 줄의 이름. 한 화면에 탭이 여럿일 때 스크린리더가 구분한다. */
  "aria-label"?: string;
}
