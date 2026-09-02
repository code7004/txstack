import type { ComponentPropsWithoutRef, ElementType, HTMLAttributes, ReactNode } from "react";

/** 패널이 어디까지 펼쳐지는가. */
export type TxNavBarPanelWidth = "bar" | "item";

export interface TxNavBarProps extends HTMLAttributes<HTMLElement> {
  /**
   * 스크린리더가 읽을 이름. **주면 `<nav>` 가 되고, 안 주면 목록만 그린다.**
   *
   * `TxAppShell` 의 `top` · `header` 는 **셸이 이미 `<nav>` 를 붙이므로** 그 안에서는 주지 않는다 —
   * 주면 `<nav>` 안에 `<nav>` 가 되어 랜드마크가 둘로 읽힌다.
   */
  label?: string;

  /**
   * 패널이 어디까지 펼쳐지는가. 기본 `"bar"` — 메뉴 줄 전체 폭이다.
   *
   * `"item"` 은 항목 아래에만 붙는다. 항목이 많고 패널이 작을 때 쓴다.
   */
  panelWidth?: TxNavBarPanelWidth;

  /**
   * 여는 방법. 기본 `"hover"`.
   *
   * **누르는 것으로도 늘 열린다** — 터치에는 hover 가 없기 때문이다.
   */
  openOn?: "hover" | "click";

  /** 열린 항목이 바뀔 때마다. 닫히면 `null` 이 온다. */
  onOpenChange?: (label: string | null) => void;

  /** `TxNavBar.Item` 들. */
  children?: ReactNode;
}

export type TxNavBarItemProps<E extends ElementType = "a"> = {
  /**
   * 링크로 쓸 것. 기본 `<a>` 이고 `as={NavLink}` 로 갈아끼운다.
   * **패키지가 라우터를 알지 못한다.**
   *
   * `panel` 과 함께 주면 **제목이 링크이고 옆의 `▾` 버튼이 패널을 연다.**
   * `panel` 만 주고 이것을 안 주면 제목 자체가 여는 버튼이다.
   */
  as?: E;

  /** 줄에 보이는 글자. */
  label: ReactNode;

  /**
   * 펼쳐질 것. **주면 이 항목이 메가메뉴가 된다** — 안 주면 그냥 링크다.
   *
   * 안의 배치는 소비자 것이다. 그 배치가 곧 그 사이트의 정보 구조라, 라이브러리가 정하면
   * 도메인 지식이 들어온다.
   *
   * **`as` 를 함께 주면 제목이 링크가 되고 여는 일은 옆의 `▾` 버튼이 맡는다.**
   * 안 주면 제목 자체가 여는 버튼이다.
   */
  panel?: ReactNode;

  /**
   * `panel` 과 `as` 를 함께 줬을 때 생기는 `▾` 버튼의 이름. 기본 `"하위 메뉴"`.
   *
   * 스크린리더는 `"<항목 이름> 하위 메뉴"` 로 읽는다. **번역된 글자를 그대로 준다** —
   * 키를 넘기고 안에서 번역하지 않는다.
   */
  toggleLabel?: string;
} & Omit<ComponentPropsWithoutRef<E>, "children" | "as">;
