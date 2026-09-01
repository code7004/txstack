import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cm } from "../tx-ui.utils";
import type { TxDropMenuProps } from "./TxMenu.types";
import { TxMenuCloseContext, TxMenuDivider, TxMenuItem } from "./TxMenuItem";
import { TxMenuShell } from "./TxMenuShell";

/** hover 로 열 때, 트리거에서 메뉴로 마우스를 옮기는 사이. */
const HOVER_CLOSE_DELAY = 120;

/**
 * 눌러서 아래로 펼쳐지는 메뉴.
 *
 * ```tsx
 * <TxDropMenu
 *   menu={
 *     <>
 *       <TxDropMenu.Item onClick={changePassword}>비밀번호 변경</TxDropMenu.Item>
 *       <TxDropMenu.Divider />
 *       <TxDropMenu.Item as={NavLink} to="/settings">설정</TxDropMenu.Item>
 *     </>
 *   }
 * >
 *   👤 {username}
 * </TxDropMenu>
 * ```
 *
 * **`children` 은 손대는 대상, `menu` 는 떠오르는 것이다** — `TxTooltip` 과 같은 규칙이다.
 *
 * 키보드는 메뉴 규약을 따른다 — ↓ 로 열고, ↑↓ 로 옮기고, Home·End 로 양 끝,
 * Escape 로 닫으면 **포커스가 트리거로 돌아온다.**
 *
 * 명세: `docs/001_ui/022_TxMenu.md`
 */
export const TxDropMenuBase = ({ children, menu, trigger = "click", onOpenChange, maxHeight, menuLabel, className, classNames, ...props }: TxDropMenuProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);

  const change = useCallback(
    (next: boolean) => {
      clearTimeout(timerRef.current);
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  /** hover 로 열 때만. 트리거와 메뉴 사이를 지나는 동안 닫히면 못 쓴다. */
  const scheduleClose = () => {
    if (trigger !== "hover") return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => change(false), HOVER_CLOSE_DELAY);
  };

  const hdTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // ↓ 로도 연다. 메뉴 규약이고, 열자마자 첫 줄로 들어가므로 손이 이어진다
    if (event.key !== "ArrowDown" || open) return;

    event.preventDefault();
    change(true);
  };

  return (
    <div
      {...props}
      data-tag="TxDropMenu"
      className={cm("tx-drop-menu", className)}
      onPointerEnter={(event) => trigger === "hover" && event.pointerType !== "touch" && change(true)}
      onPointerLeave={(event) => event.pointerType !== "touch" && scheduleClose()}
    >
      <button
        ref={triggerRef}
        type="button"
        className="tx-drop-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        // hover 로 여는 메뉴도 눌러서 열린다. 터치에는 hover 가 없다
        onClick={() => change(!open)}
        onKeyDown={hdTriggerKeyDown}
      >
        {children}
      </button>

      <TxMenuCloseContext.Provider value={() => change(false)}>
        <TxMenuShell anchorRef={triggerRef} open={open} onClose={() => change(false)} menu={menu} menuLabel={menuLabel} maxHeight={maxHeight} className={classNames?.menu} returnFocusRef={triggerRef} />
      </TxMenuCloseContext.Provider>
    </div>
  );
};

export const TxDropMenu = Object.assign(TxDropMenuBase, { Item: TxMenuItem, Divider: TxMenuDivider });
