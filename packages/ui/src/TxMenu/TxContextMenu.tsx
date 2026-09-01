import { useCallback, useRef, useState, type MouseEvent } from "react";
import { cm } from "../tx-ui.utils";
import type { TxContextMenuProps } from "./TxMenu.types";
import { TxMenuCloseContext, TxMenuDivider, TxMenuItem } from "./TxMenuItem";
import { TxMenuShell } from "./TxMenuShell";

/**
 * 오른쪽 버튼을 누르면 **그 자리에** 뜨는 메뉴.
 *
 * ```tsx
 * <TxContextMenu
 *   menu={
 *     <>
 *       <TxContextMenu.Item onClick={copy}>복사</TxContextMenu.Item>
 *       <TxContextMenu.Item onClick={remove}>삭제</TxContextMenu.Item>
 *     </>
 *   }
 * >
 *   <TxAgGrid … />
 * </TxContextMenu>
 * ```
 *
 * **`children` 은 손대는 대상, `menu` 는 떠오르는 것이다** — `TxDropMenu` · `TxTooltip` 과 같다.
 * 표나 그리드처럼 큰 것이 그대로 들어간다.
 *
 * `TxDropMenu` 와 **다른 것은 둘뿐이다** — 여는 방법(오른쪽 버튼)과 뜨는 자리(마우스 좌표).
 * 항목·키보드·포커스는 같은 속(`TxMenuShell`)이 맡으므로 갈릴 자리가 없다.
 *
 * 명세: `docs/001_ui/022_TxMenu.md`
 */
export const TxContextMenuBase = ({ children, menu, button = "right", onOpenChange, maxHeight, menuLabel, className, classNames, ...props }: TxContextMenuProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  const close = useCallback(() => {
    setPoint(null);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const openAt = (event: MouseEvent) => {
    // 브라우저 기본 메뉴를 막지 않으면 우리 것 위에 그것이 겹쳐 뜬다
    event.preventDefault();

    setPoint({ x: event.clientX, y: event.clientY });
    onOpenChange?.(true);
  };

  const hdContextMenu = (event: MouseEvent) => {
    if (button === "right" || button === "both") openAt(event);
  };

  const hdClick = (event: MouseEvent) => {
    if (button === "left" || button === "both") openAt(event);
  };

  return (
    <div {...props} ref={anchorRef} data-tag="TxContextMenu" className={cm("tx-context-menu", className)} onContextMenu={hdContextMenu} onClick={hdClick}>
      {children}

      <TxMenuCloseContext.Provider value={close}>
        <TxMenuShell
          anchorRef={anchorRef}
          // 요소가 아니라 누른 자리에 뜬다
          anchorPoint={point ?? undefined}
          open={point !== null}
          onClose={close}
          menu={menu}
          menuLabel={menuLabel}
          maxHeight={maxHeight}
          className={classNames?.menu}
        />
      </TxMenuCloseContext.Provider>
    </div>
  );
};

export const TxContextMenu = Object.assign(TxContextMenuBase, { Item: TxMenuItem, Divider: TxMenuDivider });
