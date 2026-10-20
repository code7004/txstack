import { useContext, useId } from "react";
import { TxNavBarContext } from "./TxNavBar.context";
import type { TxNavBarSiteMapProps } from "./TxNavBar.types";

/**
 * 줄 맨 오른쪽의 **전체 메뉴 칸**. 항목별 패널은 한 묶음의 하위만 보이므로, 메뉴 전체는
 * 따로 연 지도에서 본다 — 지도는 상위 항목과 줄을 맞추지 않으니 어긋날 것이 없다.
 *
 * 세 가지가 보통 항목과 다르다.
 *
 * - **늘 맨 오른쪽에 선다.** 어디에 넣어도 같다 — 자리를 소비자가 맞추면 `<li>` 에 손이 닿지 않는다
 * - **늘 줄 전체 폭으로 열린다.** 줄의 `panelWidth` 가 `"item"` 이어도 그렇다 — 전체를 펼치는 자리다
 * - **누를 때만 열린다.** 줄이 `trigger="hover"` 여도 얹어서 열지 않는다 — 줄 맨 오른쪽은
 *   계정 메뉴 쪽으로 가는 마우스가 지나가는 자리다. 버튼이라 키보드 · 터치로도 열린다
 *
 * 열고 닫는 나머지 규칙(하나만 열림 · Escape · 바깥으로 나가면 닫힘 · 안의 링크를 누르면 닫힘)은
 * 줄의 것을 그대로 탄다.
 *
 * 명세: `docs/001_ui/050_TxSiteMap.md`
 */
export function TxNavBarSiteMap({ icon = "🗺️", label = "전체 메뉴", children }: TxNavBarSiteMapProps) {
  const shared = useContext(TxNavBarContext);
  const id = useId();
  const open = shared?.openId === id;

  return (
    // onPointerEnter 를 달지 않는다 — 얹어서 열지 않는다
    <li className="tx-nav-bar__item" data-site-map="" data-open={open ? "" : undefined}>
      <button type="button" data-nav-trigger="" aria-label={label} aria-expanded={open} aria-controls={open ? `${id}-panel` : undefined} className="tx-nav-bar__trigger" onClick={() => shared?.toggle(id, label)}>
        {/* 이름은 aria-label 이 맡는다. 이모지를 그대로 두면 "지도" 따위로 한 번 더 읽힌다 */}
        <span aria-hidden>{icon}</span>
      </button>

      {/* 열릴 때만 그린다 — 다른 패널과 같은 이유다. 감춘 채로 두면 안의 링크가 Tab 에 잡힌다 */}
      {open && (
        <div id={`${id}-panel`} className="tx-nav-bar__panel" data-site-map="">
          {children}
        </div>
      )}
    </li>
  );
}
