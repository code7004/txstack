import { cm } from "../tx-ui.utils";
import { TxTabBarItem } from "./TxTabBarItem";
import type { TxTabBarProps } from "./TxTabBar.types";

/**
 * 좁은 화면의 아래쪽에 붙는 탭 줄. **항목은 같은 폭으로 나눠 서고, 아이콘 위 · 글자 아래다.**
 *
 * @example
 * ```tsx
 * <TxAppShell header={<Brand />} left={<TxSideNav>{items}</TxSideNav>} tabBar={
 *   <TxTabBar>
 *     <TxTabBar.Item icon={<IconHome />} label="홈" as={NavLink} to="/" end />
 *     <TxTabBar.Item icon={<IconList />} label="내역" as={NavLink} to="/history" />
 *     <TxTabBar.Item icon={<IconBell />} label="알림" badge={2} as={NavLink} to="/alerts" />
 *   </TxTabBar>
 * }>
 *   <Outlet />
 * </TxAppShell>
 * ```
 *
 * **자리는 셸이 갖는다** — 언제 보일지(셸의 `breakpoint` 보다 좁을 때) · 화면 아래에 붙기 ·
 * 본문 아래에 자리 비우기 · 아이폰 홈 표시줄은 `TxAppShell` 의 `tabBar` 가 한다.
 * 이 부품은 **항목만** 그린다. 가로 메뉴가 `top` + `TxNavBar`, 세로 메뉴가 `left` + `TxSideNav` 인 것과 같은 결이다.
 *
 * 지금 탭은 라우터의 `aria-current` 를 읽어 **글자색 · 굵기 · 위쪽 막대**로 알린다. 막대와 굵기는 토큰으로 끌 수 있다.
 *
 * 명세: `docs/001_ui/051_TxTabBar.md`
 */
export function TxTabBar({ label, className, children, ...props }: TxTabBarProps) {
  const inside = (
    <div {...props} data-tag="TxTabBar" className={cm("tx-tab-bar", className)}>
      <ul className="tx-tab-bar__list">{children}</ul>
    </div>
  );

  // 자리가 이미 <nav> 인 곳(셸의 tabBar)에서는 label 을 주지 않는다. 랜드마크가 둘이 된다
  return label === undefined ? inside : <nav aria-label={label}>{inside}</nav>;
}

TxTabBar.Item = TxTabBarItem;
