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
   * **줄 전체가 함께 쓰는 패널 하나.** 주면 어느 항목에 얹어도 이 패널이 줄 폭으로 열린다 —
   * 사이트의 메뉴 전체를 한눈에 펼쳐 보이는 모양이다. 항목은 그냥 링크로 둔다.
   *
   * ```tsx
   * <TxNavBar panel={<SiteMap />}>
   *   <TxNavBar.Item label="Documents" as={NavLink} to="/docs" />
   *   <TxNavBar.Item label="API" as={NavLink} to="/api" />
   * </TxNavBar>
   * ```
   *
   * **마우스로 얹을 때만 열린다** — 여는 버튼이 없으므로 키보드 · 터치로는 열 수 없다.
   * 그래서 이 패널은 **지름길**이다. 안의 링크는 전부 제목이 가리키는 화면에서도 닿아야 한다.
   * 키보드 · 터치로도 열려야 하면 항목마다 하위(children)를 준다.
   *
   * 자기 하위(children)를 가진 항목에 얹으면 그 항목의 패널이 열린다. `openOn="click"` 이면
   * 이 패널은 열리지 않는다.
   */
  panel?: ReactNode;

  /**
   * 패널이 어디까지 펼쳐지는가. 기본 `"bar"` — 메뉴 줄 전체 폭이다.
   * 줄의 `panel` 은 이 값과 상관없이 늘 줄 폭이다.
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

  /**
   * 링크이면서 패널을 여는 항목(`as` + `children`)의 `▾` 버튼을 언제 보일지. 기본 `"always"`.
   *
   * - `"always"` — 늘 보인다. 펼칠 것이 있다는 표시이기도 하다
   * - `"focus"` — 평소에는 숨고 **키보드 포커스가 오면** 보인다. 마우스는 얹으면 열리므로 없어도 된다.
   *   숨은 동안에는 자리도 차지하지 않는다
   *
   * **터치에는 얹는 동작이 없어 `"focus"` 에서는 열 방법이 사라진다** — 터치 기기를 쓰지 않는
   * 화면에서만 고른다. 완전히 없애는 값은 두지 않는다 — 키보드로 열 길이 없어진다.
   *
   * `openOn="click"` 이면 이 값과 상관없이 늘 보인다. 얹어서 열리지 않으니 마우스에게도 이 버튼뿐이다.
   */
  toggle?: "always" | "focus";

  /**
   * 열린 항목이 바뀔 때마다. 닫히면 `null` 이 온다.
   * 줄의 `panel` 이 열리면 **처음 얹은 항목의 글자**가 온다 — 그 안에서 옮겨 다니는 동안은 다시 오지 않는다.
   */
  onOpenChange?: (label: string | null) => void;

  /** `TxNavBar.Item` 들. */
  children?: ReactNode;
}

export type TxNavBarItemProps<E extends ElementType = "a"> = {
  /**
   * 링크로 쓸 것. 기본 `<a>` 이고 `as={NavLink}` 로 갈아끼운다.
   * **패키지가 라우터를 알지 못한다.**
   *
   * `children` 과 함께 주면 **제목이 링크이고 옆의 `▾` 버튼이 패널을 연다.**
   * `children` 만 주고 이것을 안 주면 제목 자체가 여는 버튼이다.
   */
  as?: E;

  /** 줄에 보이는 글자. */
  label: ReactNode;

  /**
   * 그 항목 아래 펼쳐질 패널. **주면 이 항목이 메가메뉴가 된다** — 안 주면 그냥 링크다.
   *
   * 안의 배치는 소비자 것이다. 그 배치가 곧 그 사이트의 정보 구조라, 라이브러리가 정하면
   * 도메인 지식이 들어온다.
   *
   * **`as` 를 함께 주면 제목이 링크가 되고 여는 일은 옆의 `▾` 버튼이 맡는다.**
   * 안 주면 제목 자체가 여는 버튼이다.
   *
   * children 인 이유: 항목이 스스로 버튼을 만들어 펼치는 부품이라 children 이 품는 것은 하위다 —
   * `TxSideNav.Item` · `TxDropMenu` 와 같다(docs/001_ui/900_common.md 「children 은 품는 것」).
   */
  children?: ReactNode;

  /**
   * `children` 과 `as` 를 함께 줬을 때 생기는 `▾` 버튼의 이름. 기본 `"하위 메뉴"`.
   *
   * 스크린리더는 `"<항목 이름> 하위 메뉴"` 로 읽는다. **번역된 글자를 그대로 준다** —
   * 키를 넘기고 안에서 번역하지 않는다.
   */
  toggleLabel?: string;
} & Omit<ComponentPropsWithoutRef<E>, "children" | "as">;

/**
 * 줄 맨 오른쪽의 **전체 메뉴 칸**. 누르면 메뉴 전체(보통 `TxSiteMap`)가 줄 전체 폭으로 열린다.
 *
 * 명세: `docs/001_ui/050_TxSiteMap.md`
 */
export interface TxNavBarSiteMapProps {
  /** 칸에 보이는 것. 기본 `"🗺️"`. */
  icon?: ReactNode;
  /**
   * 스크린리더가 읽을 이름. 기본 `"전체 메뉴"`.
   *
   * 칸에는 아이콘만 보이므로 **이것이 버튼의 이름이다.** 번역된 글자를 그대로 준다.
   */
  label?: string;
  /** 펼칠 것 — 보통 `TxSiteMap`. */
  children: ReactNode;
}
