import type { ComponentPropsWithoutRef, ElementType, HTMLAttributes, ReactNode } from "react";

export interface TxTabBarProps extends HTMLAttributes<HTMLElement> {
  /**
   * 스크린리더가 읽을 이름. **주면 `<nav>` 가 되고, 안 주면 목록만 그린다.**
   *
   * `TxAppShell` 의 `tabBar` 는 **셸이 이미 `<nav>` 를 붙이므로** 그 안에서는 주지 않는다.
   */
  label?: string;

  /** `TxTabBar.Item` 들. 같은 폭으로 나눠 선다. */
  children?: ReactNode;
}

export type TxTabBarItemProps<E extends ElementType = "a"> = {
  /** 링크로 쓸 것. 기본 `<a>` 이고 `as={NavLink}` 로 갈아끼운다. */
  as?: E;

  /** 아이콘 아래에 보이는 글자. 항목의 이름이기도 하다. */
  label: string;

  /** 글자 위에 서는 그림. 크기는 `--tx-tab-bar-icon-size` 칸 가운데에 앉는다. */
  icon?: ReactNode;

  /** 아이콘 모서리에 얹히는 것. 개수처럼 짧은 것만. 링크의 이름에 함께 읽힌다. */
  badge?: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "children" | "as">;
