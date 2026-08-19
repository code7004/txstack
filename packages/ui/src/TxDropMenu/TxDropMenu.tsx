import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { TxDropMenuTheme, type ITxDropMenuItemProps, type ITxDropMenuLinkItemProps, type ITxDropMenuProps } from ".";
import { cm, themeMerge } from "..";

const TX_DROP_MENU_OPEN_EVENT = "tx-drop-menu-open";
const DEFAULT_PANEL_WIDTH = 160;
const DEFAULT_PANEL_HEIGHT = 220;

type TDropMenuPosition = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  maxWidth: number;
  maxHeight: number;
};

export const TxDropMenu = ({ label, children, theme, trigger = "hover", direction = "vertical" }: ITxDropMenuProps) => {
  const stableTheme = useMemo(() => themeMerge(TxDropMenuTheme, theme, "override"), [theme]);
  const [open, _open] = useState(false);
  const [position, _position] = useState<TDropMenuPosition | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number>(0);
  const menuId = useId();

  const openMenu = () => {
    window.clearTimeout(closeTimerRef.current);
    window.dispatchEvent(new CustomEvent(TX_DROP_MENU_OPEN_EVENT, { detail: menuId }));
    _open(true);
  };

  const closeMenu = () => {
    window.clearTimeout(closeTimerRef.current);
    _open(false);
  };

  const scheduleCloseMenu = () => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => _open(false), 120);
  };

  const hdMouseEnter = () => trigger === "hover" && openMenu();
  const hdMouseLeave = () => trigger === "hover" && scheduleCloseMenu();
  const hdPanelMouseEnter = () => trigger === "hover" && window.clearTimeout(closeTimerRef.current);
  const hdPanelMouseLeave = () => trigger === "hover" && scheduleCloseMenu();
  const hdClick = () => {
    if (trigger !== "click") return;

    _open((visible) => {
      if (!visible) window.dispatchEvent(new CustomEvent(TX_DROP_MENU_OPEN_EVENT, { detail: menuId }));
      return !visible;
    });
  };

  useEffect(() => {
    const hdOpenOtherMenu = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== menuId) closeMenu();
    };

    window.addEventListener(TX_DROP_MENU_OPEN_EVENT, hdOpenOtherMenu);
    return () => window.removeEventListener(TX_DROP_MENU_OPEN_EVENT, hdOpenOtherMenu);
  }, [menuId]);

  useEffect(() => {
    return () => window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open || trigger !== "click") return;

    const hdPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target) || panelRef.current?.contains(target)) return;
      _open(false);
    };

    document.addEventListener("pointerdown", hdPointerDown);
    return () => document.removeEventListener("pointerdown", hdPointerDown);
  }, [open, trigger]);

  useEffect(() => {
    if (!open) return;

    // 레이아웃 overflow 영향을 피하기 위해 body 기준 위치를 다시 계산한다.
    const updatePosition = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;

      const panelRect = panelRef.current?.getBoundingClientRect();
      const gap = 4;
      const margin = 16;
      const edgeBuffer = 64;
      const panelWidth = panelRect?.width ?? DEFAULT_PANEL_WIDTH;
      const panelHeight = panelRect?.height ?? DEFAULT_PANEL_HEIGHT;
      const maxWidth = Math.max(0, window.innerWidth - margin * 2);
      const maxHeight = Math.max(0, window.innerHeight - margin * 2);
      const rightSpace = window.innerWidth - rect.left - margin;
      const bottomSpace = window.innerHeight - rect.bottom - margin;
      const useRightAlign = rightSpace < panelWidth + edgeBuffer || rect.right > window.innerWidth - edgeBuffer;
      const useTopAlign = bottomSpace < panelHeight + edgeBuffer || rect.bottom > window.innerHeight - edgeBuffer;
      const topBelow = rect.bottom + gap;
      const bottomAbove = window.innerHeight - rect.top + gap;

      _position({
        ...(useRightAlign ? { right: Math.max(margin, window.innerWidth - rect.right) } : { left: Math.max(margin, rect.left) }),
        ...(useTopAlign ? { bottom: Math.max(margin, bottomAbove) } : { top: Math.max(margin, topBelow) }),
        maxWidth,
        maxHeight
      });
    };

    updatePosition();
    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const panelNode =
    open && position
      ? createPortal(
          <div
            ref={panelRef}
            data-tag="TxDropMenu.Panel"
            className={cm(stableTheme.panel, direction === "vertical" ? "flex flex-col" : "flex flex-row")}
            onClick={() => trigger === "click" && _open(false)}
            onMouseEnter={hdPanelMouseEnter}
            onMouseLeave={hdPanelMouseLeave}
            style={{
              position: "fixed",
              left: position.left,
              right: position.right,
              top: position.top,
              bottom: position.bottom,
              maxWidth: position.maxWidth,
              maxHeight: position.maxHeight,
              overflow: "auto"
            }}
          >
            {children}
          </div>,
          document.body
        )
      : null;

  return (
    <div data-tag="TxDropMenu" ref={ref} className={stableTheme.wrapper} onMouseEnter={hdMouseEnter} onMouseLeave={hdMouseLeave}>
      <div className={stableTheme.label} onClick={hdClick}>
        {label}
      </div>
      {panelNode}
    </div>
  );
};

const Item = ({ children, className, ...props }: ITxDropMenuItemProps) => (
  <div data-tag="TxDropMenu.Item" className={cm(TxDropMenuTheme.item, className)} {...props}>
    {children}
  </div>
);

const LinkItem = ({ to, children, className }: ITxDropMenuLinkItemProps) => (
  <NavLink to={to} className={({ isActive }) => cm(TxDropMenuTheme.item, className, isActive && "font-semibold underline")}>
    {children}
  </NavLink>
);

const Divider = () => <div data-tag="TxDropMenu.Divider" className="my-1 border-t border-gray-200 dark:border-gray-700" />;

TxDropMenu.Item = Item;
TxDropMenu.LinkItem = LinkItem;
TxDropMenu.Divider = Divider;
