import type { ElementType } from "react";
import { cm } from "../tx-ui.utils";
import type { TxTabBarItemProps } from "./TxTabBar.types";

/**
 * 탭 줄의 한 칸. **늘 이동하는 링크다** — `as` 로 갈아끼운다(`as={NavLink}` · `as="a"`).
 *
 * 지금 있는 탭은 라우터가 붙여 주는 `aria-current` 를 그대로 읽는다. `active` prop 을 따로 받으면
 * 두 곳이 어긋난다(`TxSideNav` 와 같은 규칙).
 *
 * 명세: `docs/001_ui/051_TxTabBar.md`
 */
export function TxTabBarItem<E extends ElementType = "a">({ as, label, icon, badge, className, ...rest }: TxTabBarItemProps<E>) {
  const Tag = (as ?? "a") as ElementType;

  return (
    <li className="tx-tab-bar__item">
      <Tag {...rest} className={cm("tx-tab-bar__link", className)}>
        {/* 아이콘이 없어도 칸을 비워 둔다 — 글자 줄이 칸마다 같은 높이에 선다 */}
        <span className="tx-tab-bar__icon" aria-hidden>
          {icon}
        </span>
        <span className="tx-tab-bar__label">{label}</span>
        {/* 아이콘 모서리에 얹히는 것은 CSS 가 옮긴다. 글자 뒤에 두어 "알림 2" 로 읽힌다 */}
        {badge !== undefined && <span className="tx-tab-bar__badge">{badge}</span>}
      </Tag>
    </li>
  );
}
