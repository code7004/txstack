import type { ComponentPropsWithoutRef, ElementType, HTMLAttributes, ReactNode } from "react";

export interface TxSideNavProps extends HTMLAttributes<HTMLElement> {
  /**
   * 스크린리더가 읽을 이름. **주면 `<nav>` 가 되고, 안 주면 목록만 그린다.**
   *
   * `TxAppShell` 의 `left` 는 **셸이 이미 `<nav>` 를 붙이므로** 그 안에서는 주지 않는다.
   */
  label?: string;

  /**
   * **아이콘만 남기고 접는다(rail).** 밖에서 쥐면 controlled 다.
   *
   * 스위치는 그리지 않는다 — 헤더에 두는 앱이 많고, `TxAppShell` 의 `left.collapse` 와
   * 겹치면 접는 길이 둘이 된다. **셸의 접기와 이것은 다른 것이다** — 셸은 패널을 폭 0 으로
   * 감추고, 이쪽은 아이콘 줄로 남는다. 둘 중 하나만 쓴다.
   */
  collapsed?: boolean;
  /** 처음부터 접힌 채로. 이후는 이 컴포넌트가 쥔다. */
  defaultCollapsed?: boolean;
  /** 접힘이 바뀔 때마다. */
  onCollapsedChange?: (collapsed: boolean) => void;

  /** `TxSideNav.Item` · `TxSideNav.Group` 들. */
  children?: ReactNode;
}

export interface TxSideNavGroupProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * 묶음 제목. **접히면 감춰지고 구분선만 남는다** — 좁은 줄에 글자를 밀어 넣으면 잘린다.
   * 이름은 여전히 읽힌다.
   */
  label: string;
  children?: ReactNode;
}

export type TxSideNavItemProps<E extends ElementType = "a"> = {
  /**
   * 링크로 쓸 것. 기본 `<a>` 이고 `as={NavLink}` 로 갈아끼운다.
   * **하위메뉴(`children`)가 있으면 쓰이지 않는다** — 그때는 펼치는 `<button>` 이다.
   */
  as?: E;

  /** 줄에 보이는 글자. **접혀도 읽힌다** — 화면에서만 감춘다. */
  label: string;

  /** 앞에 붙는 그림. **접히면 이것만 남는다.** */
  icon?: ReactNode;

  /** 오른쪽에 붙는 것. 개수 · 상태처럼 짧은 것만 — 접히면 점으로 줄어든다. */
  badge?: ReactNode;

  /** 하위메뉴. **주면 이 항목이 펼치는 항목이 된다.** */
  children?: ReactNode;

  /** 하위메뉴를 처음부터 펼친 채로. */
  defaultOpen?: boolean;
} & Omit<ComponentPropsWithoutRef<E>, "children" | "as">;
