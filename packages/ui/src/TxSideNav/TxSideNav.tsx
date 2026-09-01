import { useCallback, useMemo, useState } from "react";
import { cm } from "../tx-ui.utils";
import { TxSideNavContext } from "./TxSideNav.context";
import { TxSideNavGroup } from "./TxSideNavGroup";
import { TxSideNavItem } from "./TxSideNavItem";
import type { TxSideNavProps } from "./TxSideNav.types";

/**
 * 세로로 서는 내비게이션. **아이콘만 남기고 접히고, 하위메뉴는 트리로 접힌다.**
 *
 * @example
 * ```tsx
 * <TxSideNav collapsed={rail} onCollapsedChange={setRail}>
 *   <TxSideNav.Item icon={<IconChart />} label="대시보드" as={NavLink} to="/" />
 *   <TxSideNav.Item icon={<IconBell />} label="알림" badge={2} as={NavLink} to="/alerts" />
 *
 *   <TxSideNav.Item icon={<IconCog />} label="설정">
 *     <TxSideNav.Item label="계정" as={NavLink} to="/settings/account" />
 *   </TxSideNav.Item>
 *
 *   <TxSideNav.Group label="바로가기">
 *     <TxSideNav.Item icon={<IconPlus />} label="새 프로젝트" as="button" onClick={create} />
 *   </TxSideNav.Group>
 * </TxSideNav>
 * ```
 *
 * **세로만 한다.** 가로로 도는 줄 — 큰 패널이 떠오르는 메가메뉴 — 는 `TxNavBar` 가 갖는다.
 * 1차 내비게이션을 세로로 두는 화면이면 **여기에 그 내용을 담는다.** 이 부품은 자리(GNB·SNB)를
 * 주장하지 않고 방향만 주장한다.
 *
 * **접기는 두 가지가 있고 서로 다르다.** `TxAppShell` 의 `left.collapse` 는 패널을 폭 0 으로
 * 감추고, 이쪽의 `collapsed` 는 **아이콘 줄로 남긴다.** 둘 중 하나만 쓴다 —
 * 접는 길이 둘이면 소비자가 무엇을 눌러야 하는지 모른다.
 *
 * 스위치는 그리지 않는다. 헤더의 버튼이나 셸의 스위치가 그 자리를 이미 갖고 있어서,
 * 여기서 또 그리면 화면에 접는 것이 둘이 된다.
 *
 * 명세: `docs/001_ui/049_TxSideNav.md`
 */
export function TxSideNav({ label, collapsed, defaultCollapsed = false, onCollapsedChange, className, children, ...props }: TxSideNavProps) {
  const [inner, setInner] = useState(defaultCollapsed);
  const rail = collapsed ?? inner;

  const expand = useCallback(() => {
    if (collapsed === undefined) setInner(false);
    onCollapsedChange?.(false);
  }, [collapsed, onCollapsedChange]);

  const shared = useMemo(() => ({ collapsed: rail, expand }), [rail, expand]);

  const inside = (
    <div {...props} data-tag="TxSideNav" data-collapsed={rail ? "" : undefined} className={cm("tx-side-nav", className)}>
      <TxSideNavContext.Provider value={shared}>
        <ul className="tx-side-nav__list">{children}</ul>
      </TxSideNavContext.Provider>
    </div>
  );

  // 자리가 이미 <nav> 인 곳(셸의 left)에서는 label 을 주지 않는다. 랜드마크가 둘이 된다
  return label === undefined ? inside : <nav aria-label={label}>{inside}</nav>;
}

TxSideNav.Item = TxSideNavItem;
TxSideNav.Group = TxSideNavGroup;
