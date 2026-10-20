import type { ComponentPropsWithoutRef, ElementType, HTMLAttributes, ReactNode } from "react";

/** 두 메뉴가 함께 받는 것. */
interface TxMenuCommonProps {
  /** 메뉴가 열리고 닫힐 때. */
  onOpenChange?: (open: boolean) => void;

  /** 최대 높이. 넘치면 메뉴 안에서 스크롤된다. 기본 `"20rem"`. */
  maxHeight?: number | string;

  /** 스크린리더가 읽을 메뉴의 이름. */
  menuLabel?: string;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { menu?: string };
}

export interface TxDropMenuProps extends TxMenuCommonProps, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * 눌러서 여는 것. **트리거 버튼 안에 들어가는 내용이다** — 글자든 아이콘이든 온다.
   * `TxNavBar.Item` 의 `label` 과 같은 자리다.
   *
   * 버튼을 또 넣지 않는다. 감싼 것이 이미 `<button>` 이라 `<button>` 안의 `<button>` 이 된다.
   */
  label: ReactNode;

  /**
   * 떠오르는 메뉴 — `TxDropMenu.Item` · `TxDropMenu.Divider` 들.
   *
   * **부품이 스스로 버튼을 만들고 그 아래 펼치는 것이라 children 이 펼쳐질 내용이다** —
   * `TxSideNav.Item` · `TxNavBar.Item` 과 같다. 이미 있는 것을 감싸는 `TxContextMenu` 는 반대로
   * children 이 대상이고 메뉴는 `menu` 다(docs/001_ui/900_common.md 「children 은 품는 것」).
   */
  children: ReactNode;

  /**
   * 여는 방법. 기본 `"click"`. `TxNavBar` 와 같은 이름이다.
   *
   * `"hover"` 는 GNB 처럼 훑어 보는 자리에 쓴다. **누르는 것으로도 열린다** —
   * 터치에는 hover 가 없기 때문이다.
   */
  openOn?: "click" | "hover";
}

export interface TxContextMenuProps extends TxMenuCommonProps, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 오른쪽 버튼을 누를 대상. 표나 그리드처럼 큰 것이 그대로 들어간다. */
  children: ReactNode;

  /**
   * 떠오르는 메뉴. **`TxTooltip` 의 `tip` 과 같은 자리다** — 이미 있는 것을 감싸는 부품이라
   * `children` 은 손대는 대상이고 뜨는 것은 prop 으로 준다.
   */
  menu: ReactNode;

  /**
   * 어느 버튼으로 여는가. 기본 `"right"`.
   *
   * `"both"` 는 왼쪽 클릭으로도 연다 — 터치 화면을 함께 받을 때 쓴다.
   */
  button?: "right" | "left" | "both";
}

/**
 * 메뉴 한 줄.
 *
 * 기본은 `<button>` 이고, `as` 로 링크 컴포넌트를 갈아끼운다 —
 * `as={NavLink}` · `as={Link}` · `as="a"`. **패키지가 라우터를 알지 못한다.**
 */
export type TxMenuItemProps<E extends ElementType = "button"> = {
  as?: E;
  /** 눌렀을 때 메뉴를 닫지 않는다. 안에서 값을 고르는 줄에 쓴다. */
  keepOpen?: boolean;
} & Omit<ComponentPropsWithoutRef<E>, "as">;

export type TxMenuDividerProps = HTMLAttributes<HTMLDivElement>;
