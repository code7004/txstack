import { useContext, useId, type ElementType } from "react";
import { cm } from "../tx-ui.utils";
import { TxNavBarContext } from "./TxNavBar.context";
import type { TxNavBarItemProps } from "./TxNavBar.types";

/**
 * 메뉴 줄의 한 칸.
 *
 * `panel` 을 주면 **펼쳐지는 항목**(`<button aria-expanded>`)이고, 안 주면 **그냥 링크**다.
 * 링크는 `as` 로 갈아끼운다 — `as={NavLink}` · `as={Link}` · `as="a"`.
 *
 * 명세: `docs/001_ui/048_TxNavBar.md`
 */
export function TxNavBarItem<E extends ElementType = "a">({ as, label, panel, className, ...rest }: TxNavBarItemProps<E>) {
  const shared = useContext(TxNavBarContext);
  const id = useId();

  const open = shared?.openId === id;
  const text = typeof label === "string" ? label : id;

  if (!panel) {
    const Tag = (as ?? "a") as ElementType;

    return (
      <li className="tx-nav-bar__item">
        <Tag {...rest} className={cm("tx-nav-bar__link", className)}>
          {label}
        </Tag>
      </li>
    );
  }

  return (
    <li
      className="tx-nav-bar__item"
      data-open={open ? "" : undefined}
      // 얹는 것은 마우스만이다. 손가락에는 hover 가 없고, 있는 척하면 눌러도 안 열린다
      onPointerEnter={(event) => event.pointerType === "mouse" && shared?.hover(id, text)}
    >
      <button
        type="button"
        className={cm("tx-nav-bar__trigger", className)}
        // 줄이 화살표로 옮겨 다닐 때 찾는 표시다
        data-nav-trigger=""
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        onClick={() => shared?.toggle(id, text)}
      >
        {label}
        <span className="tx-nav-bar__chevron" aria-hidden>
          ▾
        </span>
      </button>

      {/*
        **열릴 때만 그린다.** 감춘 채로 두면 그 안의 링크가 Tab 에 잡히고, 스크린리더가
        닫힌 메뉴의 내용을 읽는다. `aria-controls` 도 그때만 가리킨다 — 없는 id 를
        가리키면 거짓이 된다.
      */}
      {open && (
        <div id={`${id}-panel`} className="tx-nav-bar__panel">
          {panel}
        </div>
      )}
    </li>
  );
}
