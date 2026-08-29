import type { HTMLAttributes, ReactNode } from "react";

export interface TxAccordionItem {
  /** 늘 보이는 줄. **`ReactNode` 라 배지·아이콘이 그대로 들어간다.** */
  title: ReactNode;

  /** 펼치면 나오는 것. */
  content: ReactNode;

  /** 눌러도 열리지 않는다. 이미 열려 있었다면 그대로 열려 있다. */
  disabled?: boolean;
}

/** 몇 번째 것들이 열려 있는가. 하나만 열리는 모드에서도 배열이다. */
export type TxAccordionValue = number[];

export interface TxAccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children" | "defaultValue"> {
  items: TxAccordionItem[];

  /** 여럿이 함께 열릴 수 있다. 기본 `false` — 하나가 열리면 다른 것이 닫힌다. */
  multiple?: boolean;

  /**
   * 열려 있는 것들의 번호. **주면 controlled** 다 — 값의 주인은 소비자이고,
   * `onChange` 를 받고도 안 바꾸면 화면도 안 바뀐다.
   *
   * 하나만 쓸 때는 숫자 하나로 줘도 된다.
   */
  value?: number | TxAccordionValue;

  /** 처음에 열어 둘 것. controlled 일 때는 무시된다. */
  defaultValue?: number | TxAccordionValue;

  /**
   * 열린 것이 바뀔 때. **늘 배열로 온다** — 하나만 열리는 모드에서도 마찬가지라,
   * 받는 쪽에서 타입을 좁힐 일이 없다. 다 닫히면 빈 배열이다.
   */
  onChange?: (value: TxAccordionValue) => void;

  /**
   * 제목을 이 깊이의 머리말로 감싼다 — `2` 면 `<h2>`.
   *
   * **주면 스크린리더 사용자가 머리말 목록으로 건너뛸 수 있다.** 다만 깊이는 그 페이지의
   * 짜임을 아는 쪽이 정해야 한다 — `<h1>` 아래에 `<h4>` 를 놓으면 오히려 어지럽다.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;

  /** 오른쪽 화살표를 없앤다. */
  hideMarker?: boolean;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { item?: string; summary?: string; title?: string; marker?: string; body?: string };
}
