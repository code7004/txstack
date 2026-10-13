import { useCallback, useEffect, useId, useMemo, useRef, useState, type FocusEvent as ReactFocusEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { cm } from "../tx-ui.utils";
import { TxNavBarContext } from "./TxNavBar.context";
import { TxNavBarItem } from "./TxNavBarItem";
import type { TxNavBarProps } from "./TxNavBar.types";

/**
 * 손이 줄 밖으로 나간 뒤 닫기까지 기다리는 시간. **`TxDropMenu` 와 같은 값이다** —
 * 항목과 패널 사이를 지나가는 순간 닫히면 쓸 수 없다.
 */
const HOVER_CLOSE_DELAY = 120;

/** 줄의 `panel` 이 열렸을 때의 `openId`. 항목의 id(`useId`)와 겹치지 않는다 */
const BAR = "tx-nav-bar";

/**
 * 가로로 도는 내비게이션 줄. **항목에 `panel` 을 주면 메가메뉴가 된다.**
 *
 * @example
 * ```tsx
 * const menu = (
 *   <>
 *     <TxNavBar.Item label="제품" panel={<ProductPanel />} />
 *     <TxNavBar.Item label="가격" as={NavLink} to="/pricing" />
 *   </>
 * );
 *
 * <TxAppShell header={<Brand />} top={<TxNavBar>{menu}</TxNavBar>}>…</TxAppShell>
 * ```
 *
 * **가로만 한다.** 세로로 세우는 것 — 아이콘만 남기고 접히거나 하위메뉴가 트리로 접히는 것 —
 * 은 `TxSideNav` 가 갖는다. 좁은 화면에서는 셸이 `left` 를 서랍으로 옮기고 그 안에
 * `TxSideNav` 가 선다.
 *
 * **자리와 랜드마크는 `TxAppShell` 이 갖는다** — `top` 이 그 자리이고 `<nav>` 도 셸이 붙인다.
 * 이 컴포넌트는 **줄 안의 항목 · 패널 · 키보드**만 맡는다. 홀로 쓸 때만 `label` 을 주면
 * 스스로 `<nav>` 가 된다.
 *
 * **열림은 줄이 하나로 쥔다.** 그래서 항목 사이를 지나가도 깜빡이지 않고 갈아탄다.
 *
 * 줄에 `panel` 을 주면 **모든 항목이 패널 하나를 함께 쓴다** — 어느 항목에 얹어도 같은
 * 패널이 줄 폭으로 열린다. 마우스 전용 지름길이라 항목은 그대로 링크다.
 *
 * `role="menu"` 를 쓰지 않는다. 패널 안에는 링크 목록 · 설명 · 그림이 오는데 메뉴 규약
 * 안에서는 그것들이 제대로 읽히지 않는다 — 여는 항목은 `<button aria-expanded>` 다.
 *
 * 명세: `docs/001_ui/048_TxNavBar.md`
 */
export function TxNavBar({ label, panel, panelWidth = "bar", openOn = "hover", onOpenChange, className, children, ...props }: TxNavBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const [openId, setOpenId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const openChangeRef = useRef(onOpenChange);
  openChangeRef.current = onOpenChange;

  /** 같은 것을 두 번 알리지 않는다. **알림은 상태 갱신 밖에서** — 갱신 함수는 두 번 불릴 수 있다. */
  const toldRef = useRef<string | null>(null);

  const open = useCallback((id: string | null, text: string | null) => {
    clearTimeout(closeTimer.current);
    setOpenId(id);

    if (toldRef.current === id) return;

    toldRef.current = id;
    openChangeRef.current?.(id === null ? null : text);
  }, []);

  const shared = useMemo(
    () => ({
      hoverable: openOn === "hover",
      openId,
      toggle: (id: string, text: string) => open(openId === id ? null : id, text),
      hover: (id: string, text: string) => openOn === "hover" && open(id, text)
    }),
    [openId, open, openOn]
  );

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  /**
   * **화살표로 항목 사이를 옮긴다.** 여는 항목만 옮겨 다닌다(링크는 Tab 이 맡는다).
   *
   * 옮긴 뒤 열려 있던 것은 **열린 채로 이어진다** — 훑어 보는 동작이 끊기지 않는다.
   */
  const move = (from: HTMLElement, delta: number | "first" | "last") => {
    const root = rootRef.current;
    if (!root) return;

    const triggers = [...root.querySelectorAll<HTMLButtonElement>("[data-nav-trigger]")];
    if (!triggers.length) return;

    const at = triggers.indexOf(from as HTMLButtonElement);
    const next = delta === "first" ? 0 : delta === "last" ? triggers.length - 1 : (at + delta + triggers.length) % triggers.length;

    triggers[next]?.focus();
    if (openId !== null) triggers[next]?.click();
  };

  const hdKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>("[data-nav-trigger]");

    switch (event.key) {
      case "Escape":
        if (openId === null) return;

        event.stopPropagation();
        open(null, null);

        // 닫은 뒤 포커스는 그 항목으로 돌아온다. 안 그러면 문서 처음으로 튄다
        rootRef.current?.querySelector<HTMLButtonElement>('[data-nav-trigger][aria-expanded="true"]')?.focus();
        break;

      case "ArrowLeft":
      case "ArrowRight":
        if (!trigger) return;

        event.preventDefault();
        move(trigger, event.key === "ArrowLeft" ? -1 : 1);
        break;

      case "Home":
      case "End":
        if (!trigger) return;

        event.preventDefault();
        move(trigger, event.key === "Home" ? "first" : "last");
        break;
    }
  };

  /**
   * **줄의 패널은 항목에 얹으면 열린다.** 항목 사이의 빈틈이나 줄 오른쪽의 빈자리에서는
   * 열지 않는다 — 머리 줄을 가로지르기만 해도 패널이 덮이면 성가시다.
   *
   * 자기 `panel` 을 가진 항목은 건너뛴다. 그 항목은 스스로 자기 패널을 연다.
   */
  const hdPointerOver = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (!panel || openOn !== "hover" || event.pointerType !== "mouse") return;

    const item = (event.target as Element).closest(".tx-nav-bar__item");
    if (!item || item.querySelector("[data-nav-trigger]")) return;

    open(BAR, item.textContent ?? "");
  };

  /**
   * **패널 안의 링크를 누르면 닫는다.** SPA 에서는 링크가 문서를 바꾸지 않아, 닫지 않으면
   * 새 화면을 패널이 덮은 채 남는다. `TxAppShell` 의 서랍과 같은 규칙이다 — 이 화면을
   * 떠나지 않는 클릭(새 탭 · 내려받기 · 보조키)은 그대로 둔다.
   */
  const hdClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (openId === null) return;

    const link = (event.target as Element).closest("a[href]");
    if (!link?.closest(".tx-nav-bar__panel")) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.getAttribute("target") === "_blank" || link.hasAttribute("download")) return;

    open(null, null);
  };

  /** 줄 밖으로 포커스가 나가면 닫는다. **패널 안에 있는 동안은 열려 있어야 한다.** */
  const hdBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (openId === null) return;
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;

    open(null, null);
  };

  const inner = (
    <div
      {...props}
      ref={rootRef}
      data-tag="TxNavBar"
      data-panel-width={panelWidth}
      className={cm("tx-nav-bar", className)}
      onKeyDown={hdKeyDown}
      onBlur={hdBlur}
      onClick={hdClick}
      // 얹은 손이 줄 밖으로 나가면 닫는다. 항목과 패널 사이를 지나는 순간은 살려 둔다
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse" || openId === null) return;

        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => open(null, null), HOVER_CLOSE_DELAY);
      }}
      onPointerEnter={() => clearTimeout(closeTimer.current)}
    >
      <TxNavBarContext.Provider value={shared}>
        <ul className="tx-nav-bar__list" onPointerOver={hdPointerOver}>
          {children}
        </ul>
      </TxNavBarContext.Provider>

      {/* 열릴 때만 그린다 — 항목의 패널과 같은 이유다. 감춘 채로 두면 안의 링크가 Tab 에 잡힌다 */}
      {panel && openId === BAR && (
        <div id={panelId} className="tx-nav-bar__panel" data-shared="">
          {panel}
        </div>
      )}
    </div>
  );

  // 자리가 이미 <nav> 인 곳(셸의 top·header)에서는 label 을 주지 않는다. 랜드마크가 둘이 된다
  return label === undefined ? inner : <nav aria-label={label}>{inner}</nav>;
}

TxNavBar.Item = TxNavBarItem;
