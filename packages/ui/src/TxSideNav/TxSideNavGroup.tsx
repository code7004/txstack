import { cm } from "../tx-ui.utils";
import type { TxSideNavGroupProps } from "./TxSideNav.types";

/**
 * 항목 몇 개를 묶고 제목을 붙인다.
 *
 * **접히면 제목이 화면에서 사라지고 구분선만 남는다** — 아이콘 줄에 글자를 밀어 넣으면
 * 잘린다. 이름은 여전히 읽히므로 스크린리더에는 묶음이 그대로 있다.
 *
 * 명세: `docs/001_ui/049_TxSideNav.md`
 */
export function TxSideNavGroup({ label, className, children, ...props }: TxSideNavGroupProps) {
  return (
    <li {...props} className={cm("tx-side-nav__group", className)}>
      <span className="tx-side-nav__group-label">{label}</span>

      {/* 묶음의 이름을 목록에 이어 준다 — 스크린리더가 "SHORTCUTS 목록" 으로 읽는다 */}
      <ul className="tx-side-nav__group-list" aria-label={label}>
        {children}
      </ul>
    </li>
  );
}
