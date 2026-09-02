import { useContext, useId, type ElementType, type ReactNode } from "react";
import { cm } from "../tx-ui.utils";
import { TxNavBarContext } from "./TxNavBar.context";
import type { TxNavBarItemProps } from "./TxNavBar.types";

/**
 * 메뉴 줄의 한 칸. **세 가지 모양이 있다.**
 *
 * | 준 것 | 나오는 것 |
 * | --- | --- |
 * | `as` 만 | 그냥 링크 |
 * | `panel` 만 | 제목 자체가 **여는 버튼**(`<button aria-expanded>`) |
 * | `panel` + `as` | **링크 + 옆에 `▾` 버튼** — 제목을 누르면 이동하고 버튼이 패널을 연다 |
 *
 * 셋째가 사이트 내비게이션에서 흔한 모양이다. 제목이 진짜 링크라 **새 탭으로 열기 ·
 * 주소 복사 · 가운데 클릭**이 되고, 여는 일은 버튼이 맡아 `aria-expanded` 가 거짓이 되지
 * 않는다(APG *Disclosure Navigation with Top-Level Links*).
 *
 * 명세: `docs/001_ui/048_TxNavBar.md`
 */
export function TxNavBarItem<E extends ElementType = "a">({ as, label, panel, toggleLabel = "하위 메뉴", className, ...rest }: TxNavBarItemProps<E>) {
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

  /**
   * 패널을 여닫는 것. 셋째 모양에서는 이것만 버튼이고, 둘째 모양에서는 제목이 곧 이것이다.
   *
   * `data-nav-trigger` 는 줄이 **화살표로 옮겨 다닐 때 찾는 표시**다.
   */
  const chevron = (
    <span className="tx-nav-bar__chevron" aria-hidden>
      ▾
    </span>
  );

  const triggerProps = {
    type: "button" as const,
    "data-nav-trigger": "",
    "aria-expanded": open,
    "aria-controls": open ? `${id}-panel` : undefined,
    onClick: () => shared?.toggle(id, text)
  };

  const panelBox: ReactNode = open && (
    /*
      **열릴 때만 그린다.** 감춘 채로 두면 그 안의 링크가 Tab 에 잡히고, 스크린리더가
      닫힌 메뉴의 내용을 읽는다. `aria-controls` 도 그때만 가리킨다 — 없는 id 를
      가리키면 거짓이 된다.
    */
    <div id={`${id}-panel`} className="tx-nav-bar__panel">
      {panel}
    </div>
  );

  // 얹는 것은 마우스만이다. 손가락에는 hover 가 없고, 있는 척하면 눌러도 안 열린다
  const hover = (event: { pointerType: string }) => event.pointerType === "mouse" && shared?.hover(id, text);

  if (as) {
    const Tag = as as ElementType;

    return (
      <li className="tx-nav-bar__item" data-open={open ? "" : undefined} data-linked="" onPointerEnter={hover}>
        <Tag {...rest} className={cm("tx-nav-bar__link", className)}>
          {label}
        </Tag>

        {/* 이름은 항목 이름을 붙여 읽힌다 — 줄에 `▾` 버튼이 여럿이면 서로 구분되지 않는다 */}
        <button {...triggerProps} className="tx-nav-bar__toggle" aria-label={typeof label === "string" ? `${label} ${toggleLabel}` : toggleLabel}>
          {chevron}
        </button>

        {panelBox}
      </li>
    );
  }

  return (
    <li className="tx-nav-bar__item" data-open={open ? "" : undefined} onPointerEnter={hover}>
      <button {...triggerProps} className={cm("tx-nav-bar__trigger", className)}>
        {label}
        {chevron}
      </button>

      {panelBox}
    </li>
  );
}
