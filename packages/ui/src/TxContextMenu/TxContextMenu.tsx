import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { cm, themeMerge } from "../tx-ui.utils";
import { TxContextMenuTheme } from "./TxContextMenu.theme";
import type { ITxContextMenuProps, TTxContextMenuItem } from "./TxContextMenu.types";

const DEFAULT_MENU_WIDTH = 240;
const DEFAULT_ITEM_HEIGHT = 40;
const VIEWPORT_PADDING = 8;

type TMenuPosition = {
  x: number;
  y: number;
};

function resolvePosition(event: React.MouseEvent, itemCount: number): TMenuPosition {
  const menuHeight = itemCount * DEFAULT_ITEM_HEIGHT;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = event.clientX - 10;
  let y = event.clientY - 10;

  if (x + DEFAULT_MENU_WIDTH + VIEWPORT_PADDING > viewportWidth) x = viewportWidth - DEFAULT_MENU_WIDTH - VIEWPORT_PADDING;
  if (y + menuHeight + VIEWPORT_PADDING > viewportHeight) y = viewportHeight - menuHeight - VIEWPORT_PADDING;

  return {
    x: Math.max(VIEWPORT_PADDING, x),
    y: Math.max(VIEWPORT_PADDING, y)
  };
}

export const TxContextMenu = ({ options, mouse = "right", comp, children, label = "메뉴", theme, className }: ITxContextMenuProps) => {
  const stableTheme = useMemo(() => themeMerge(TxContextMenuTheme, theme, "override"), [theme]);
  const [visible, _visible] = useState(false);
  const [position, _position] = useState<TMenuPosition>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const visibleOptions = useMemo(() => options.filter((option) => !option.hide), [options]);

  const close = useCallback(() => _visible(false), []);

  const open = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      _position(resolvePosition(event, visibleOptions.length));
      _visible(true);
    },
    [visibleOptions.length]
  );

  function hdTrigger(event: React.MouseEvent) {
    if (event.type === "contextmenu" && (mouse === "right" || mouse === "both")) open(event);
    if (event.type === "click" && (mouse === "left" || mouse === "both")) open(event);
  }

  async function hdClick(item: TTxContextMenuItem) {
    if (item.disabled) return;

    try {
      await item.onClick?.();
    } finally {
      close();
    }
  }

  useEffect(() => {
    if (!visible) return;

    const hdPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      close();
    };

    const hdKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", hdPointerDown);
    window.addEventListener("keydown", hdKeyDown);

    return () => {
      document.removeEventListener("pointerdown", hdPointerDown);
      window.removeEventListener("keydown", hdKeyDown);
    };
  }, [close, visible]);

  return (
    <div data-tag="TxContextMenu" className="relative">
      <div onClick={hdTrigger} onContextMenu={hdTrigger}>
        {children ?? comp ?? label}
      </div>

      {visible &&
        createPortal(
          <div ref={menuRef} className={cm(stableTheme.wrapper, className)} style={{ top: position.y, left: position.x }}>
            {visibleOptions.map((option, index) => {
              if (option.type === "divider") return <div key={index} className={stableTheme.divider} />;

              const itemClassName = cm(stableTheme.item, option.disabled && stableTheme.disabledItem);
              if (option.to && !option.disabled) {
                return (
                  <NavLink key={index} to={option.to} className={itemClassName} onClick={close}>
                    {option.label}
                  </NavLink>
                );
              }

              return (
                <button key={index} type="button" className={cm(itemClassName, "text-left")} disabled={option.disabled} onClick={() => hdClick(option)}>
                  {option.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

TxContextMenu.displayName = "TxContextMenu";
