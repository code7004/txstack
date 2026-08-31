import type { ComponentPropsWithoutRef, ElementType, HTMLAttributes, ReactNode } from "react";

export interface TxBreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** `TxBreadcrumb.Item` 들. */
  children?: ReactNode;

  /**
   * 이 수를 넘으면 가운데를 접는다. 안 주면 접지 않는다.
   *
   * **첫 줄과 마지막 몇 개는 남긴다** — 어디서 왔고 지금 어디인지가 경로의 요점이라,
   * 그 둘을 지우면 접는 뜻이 없다.
   */
  maxItems?: number;

  /** 접었을 때 끝에서 몇 개를 남길지. 기본 `2`. */
  itemsAfterCollapse?: number;

  /** 줄 사이에 넣을 것. 기본은 CSS 가 그리는 `/` 다. */
  separator?: ReactNode;

  /** 스크린리더가 읽을 이름. 기본 `"경로"`. */
  label?: string;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { list?: string; item?: string };
}

/**
 * 경로 한 칸.
 *
 * 기본은 `<span>` 이고 링크로 쓰려면 `as` 로 갈아끼운다 —
 * `as={NavLink}` · `as={Link}` · `as="a"`. **패키지가 라우터를 알지 못한다.**
 */
export type TxBreadcrumbItemProps<E extends ElementType = "span"> = {
  as?: E;
  /**
   * 지금 있는 자리인가. **마지막 칸에는 저절로 붙으므로 보통 줄 필요가 없다.**
   *
   * 켜지면 링크가 아니라 글자가 되고 `aria-current="page"` 가 붙는다 —
   * 지금 있는 자리를 다시 누르게 두면 어디로 가는지 알 수 없다.
   */
  current?: boolean;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "current">;
