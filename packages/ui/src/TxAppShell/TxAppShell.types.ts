import type { HTMLAttributes, ReactNode } from "react";

/** 헤더가 어떻게 머무는가. */
export type TxAppShellSticky = boolean | "hide";

/**
 * 끌어서 크기를 바꾸고 접었다 펼 수 있는 자리. **본문은 남는 만큼 갖는다.**
 */
export type TxAppShellPanelSlot = "left" | "right" | "bottom";

export interface TxAppShellResizeLimit {
  /** 이보다 작게는 못 줄인다(px). 기본 `120`. */
  min?: number;
  /**
   * 이보다 크게는 못 늘린다(px).
   *
   * **안 줘도 된다** — 본문이 `240px` 은 남도록 셸이 조인다. 화면이 좁아지면
   * 그 한계도 같이 줄어든다.
   */
  max?: number;
}

/**
 * 한 패널이 무엇을 할 수 있는가. **자리마다 한 곳에서 끝난다.**
 *
 * @example
 * ```tsx
 * <TxAppShell panels={{ left: { resize: true, collapse: true, defaultSize: 280 } }} />
 * ```
 */
export interface TxAppShellPanel {
  /** 끌어서 크기를 바꾼다. `true` 면 기본 한계로 켠다. */
  resize?: boolean | TxAppShellResizeLimit;

  /** 접었다 편다. **경계선 가운데에 스위치가 생긴다.** */
  collapse?: boolean;

  /** 처음 크기(px). 안 주면 CSS 기본값이 산다. 이후는 셸이 쥔다. */
  defaultSize?: number;

  /** 처음부터 접힌 채로 시작한다. 이후는 셸이 쥔다. */
  defaultCollapsed?: boolean;

  /** 크기를 밖에서 쥔다(px). **주면 이쪽이 이긴다** — 셸은 기억하지 않는다. */
  size?: number;

  /** 접힘을 밖에서 쥔다. **주면 이쪽이 이긴다** — 셸은 기억하지 않는다. */
  collapsed?: boolean;
}

/** 패널이 바뀌었을 때 오는 것. */
export interface TxAppShellPanelChange {
  /** 지금 크기(px). 아직 한 번도 안 바꿨으면 없다 — CSS 기본값이 살아 있다는 뜻이다. */
  size?: number;

  /** 지금 접혀 있는가. */
  collapsed: boolean;

  /**
   * 손을 뗐는가. **끄는 동안에는 `false` 로 계속 온다.**
   *
   * 저장은 `settled` 일 때만 하면 된다.
   */
  settled: boolean;
}

export interface TxAppShellLabels {
  /** 본문으로 건너뛰는 링크의 글자. 기본 `"본문으로 건너뛰기"`. */
  skip?: string;
  /** 햄버거 버튼의 이름. 기본 `"메뉴 열기"`. */
  menu?: string;
  /** 위쪽 띠의 이름. 기본 `"주 메뉴"`. */
  top?: string;
  /** 왼쪽 패널의 이름. 기본 `"하위 메뉴"`. */
  left?: string;
  /** 오른쪽 패널의 이름. 기본 `"관련 정보"`. */
  right?: string;
  /** 아래 패널의 이름. 기본 `"아래 패널"`. */
  bottom?: string;
  /**
   * 접었다 펴는 스위치의 이름. 자리 이름을 받아 만든다. 기본은 **자리 이름 그대로** —
   * 접혔는지는 `aria-expanded` 가 말하므로 이름까지 바꾸면 두 번 말하는 것이 된다.
   */
  toggle?: (name: string) => string;
  /**
   * 크기 조절 손잡이의 이름. 자리 이름을 받아 만든다.
   * 기본 `` (name) => `${name} 크기 조절` ``.
   */
  resize?: (name: string) => string;
}

export interface TxAppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** 맨 위 줄. 로고 · 검색 · 사용자 메뉴가 놓이는 자리다. */
  header?: ReactNode;

  /**
   * 헤더 아래에 붙는 전체 폭 띠. 사이트 전체를 도는 메뉴가 놓인다.
   *
   * **헤더와 한 덩어리다** — `sticky` 를 같이 탄다.
   */
  top?: ReactNode;

  /**
   * 왼쪽 패널. 지금 있는 자리의 하위 메뉴다.
   *
   * **좁아지면 서랍으로 간다** — 헤더에 햄버거가 생기고 같은 노드를 그대로 그린다.
   */
  left?: ReactNode;

  /** 오른쪽 패널. 관련 글 · 목차처럼 곁들이는 것이 놓인다. */
  right?: ReactNode;

  /** 아래 패널. 콘솔 · 로그 · 미리보기 자리다. 폭은 `bottomSpan` 이 정한다. */
  bottom?: ReactNode;

  /**
   * 아래 패널이 어디까지 덮는가. 기본 `"main"`.
   *
   * - `"main"` — **좌우 패널을 비켜 본문 폭만.** `좌 · (본문 · 아래) · 우` 로 짜인다.
   *   좌우 패널이 바닥까지 선다 (AWS 콘솔 쪽)
   * - `"screen"` — **좌우까지 아우르는 전체 폭.** 좌우 패널이 그 위에서 끝난다 (VS Code 쪽)
   *
   * 업계가 갈리는 자리라 고르게 열어 두었다. 크기를 빌려 오는 곳도 따라 달라진다 —
   * 전체 폭이면 패널 줄의 높이에서, 본문 폭이면 본문의 높이에서 빌린다.
   */
  bottomSpan?: "screen" | "main";

  /** 맨 아래 줄. */
  footer?: ReactNode;

  /**
   * 헤더가 어떻게 머무는가. 기본 `true`.
   *
   * `"hide"` 는 **내리면 숨고 올리면 나온다** — 긴 글에서 화면을 돌려준다.
   * `false` 면 내용과 같이 굴러간다.
   */
  sticky?: TxAppShellSticky;

  /**
   * 자리마다 무엇을 할 수 있는지. **크기 조절 · 접기 · 처음 값 · 밖에서 쥐기가 한 곳이다.**
   *
   * @example
   * ```tsx
   * <TxAppShell
   *   panels={{
   *     left: { resize: true, collapse: true, defaultSize: 280 },
   *     right: { resize: { min: 200, max: 520 }, collapse: true, defaultCollapsed: true },
   *     bottom: { resize: { min: 100 } }
   *   }}
   *   onPanelChange={(slot, { size, collapsed, settled }) => settled && save(slot, size, collapsed)}
   * />
   * ```
   *
   * 손잡이는 **키보드로도 움직인다** — 화살표로 16px, `Home`/`End` 로 끝까지.
   * 서랍으로 간 `left` 에는 손잡이도 스위치도 없다. 그건 서랍의 몫이다.
   */
  panels?: Partial<Record<TxAppShellPanelSlot, TxAppShellPanel>>;

  /**
   * 크기나 접힘이 바뀔 때마다 온다. **끄는 동안에는 `settled: false` 로 계속 온다.**
   *
   * **저장은 소비자 몫이다** — 어디에 남길지는 앱이 정할 일이라 패키지가 고르지 않는다.
   * 받아 둔 값은 `panels[slot].defaultSize` · `defaultCollapsed` 로 돌려준다.
   */
  onPanelChange?: (slot: TxAppShellPanelSlot, change: TxAppShellPanelChange) => void;

  /**
   * 이 폭(px)보다 좁아지면 **왼쪽 패널이 서랍으로 간다.** 기본 `960`.
   *
   * 화면 폭을 잰다 — 셸은 화면 전체를 짜는 것이라 그것이 맞는 자리다.
   * (`TxGrid` 는 놓인 자리의 폭을 보므로 다르다.)
   */
  breakpoint?: number;

  /** 스크린리더가 읽을 글자들. */
  labels?: TxAppShellLabels;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { header?: string; top?: string; left?: string; right?: string; bottom?: string; main?: string; footer?: string };

  children?: ReactNode;
}
