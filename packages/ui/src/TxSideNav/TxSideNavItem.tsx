import { useContext, useId, useState, type ElementType } from "react";
import { cm } from "../tx-ui.utils";
import { TxSideNavContext } from "./TxSideNav.context";
import type { TxSideNavItemProps } from "./TxSideNav.types";

/**
 * 세로 줄의 한 칸.
 *
 * `children` 을 주면 **하위메뉴를 펼치는 항목**(`<button aria-expanded>`)이고,
 * 안 주면 **그냥 링크**다. 링크는 `as` 로 갈아끼운다 — `as={NavLink}` · `as="a"`.
 *
 * 명세: `docs/001_ui/049_TxSideNav.md`
 */
export function TxSideNavItem<E extends ElementType = "a">({ as, label, icon, badge, children, defaultOpen = false, className, ...rest }: TxSideNavItemProps<E>) {
  const shared = useContext(TxSideNavContext);
  const collapsed = shared?.collapsed ?? false;

  const id = useId();
  const [open, setOpen] = useState(defaultOpen);

  /**
   * **접혀도 이름은 읽힌다.** 화면에서만 감춘다 — `display: none` 으로 지우면 스크린리더도
   * 못 읽어 아이콘만 남은 줄이 통째로 이름 없는 그림이 된다. 눈으로 보는 사람에게는
   * 브라우저의 풍선 도움말이 대신 알려 준다.
   */
  const face = (
    <>
      {icon && (
        <span className="tx-side-nav__icon" aria-hidden>
          {icon}
        </span>
      )}
      <span className="tx-side-nav__label">{label}</span>
      {badge !== undefined && <span className="tx-side-nav__badge">{badge}</span>}
    </>
  );

  if (!children) {
    const Tag = (as ?? "a") as ElementType;

    return (
      <li className="tx-side-nav__item">
        <Tag {...rest} title={collapsed ? label : undefined} className={cm("tx-side-nav__link", className)}>
          {face}
        </Tag>
      </li>
    );
  }

  return (
    <li className="tx-side-nav__item" data-open={open ? "" : undefined}>
      <button
        type="button"
        className={cm("tx-side-nav__link", className)}
        title={collapsed ? label : undefined}
        aria-expanded={open}
        aria-controls={open ? `${id}-sub` : undefined}
        onClick={() => {
          /**
           * 접힌 줄에는 하위 목록이 설 자리가 없다. **먼저 펼치고 나서 연다** —
           * 아무 일도 안 일어나면 누른 사람은 고장으로 읽는다.
           */
          if (collapsed) {
            shared?.expand();
            setOpen(true);
            return;
          }

          setOpen((prev) => !prev);
        }}
      >
        {face}
        <span className="tx-side-nav__chevron" aria-hidden>
          ▾
        </span>
      </button>

      {/* 닫힌 하위메뉴를 감춘 채로 두면 그 안의 링크가 Tab 에 잡힌다 */}
      {open && (
        <ul id={`${id}-sub`} className="tx-side-nav__sub">
          {children}
        </ul>
      )}
    </li>
  );
}
