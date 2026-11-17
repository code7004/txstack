import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
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
 * **`children` 은 손대는 대상, `menu` 는 떠오르는 것이다** — 이미 있는 것을 감싸는 부품이라 `TxTooltip` 과 같다.
 * 표나 그리드처럼 큰 것이 그대로 들어간다. 스스로 버튼을 만드는 `TxDropMenu` 는 반대로 children 이 항목이다.
 *
 * `TxDropMenu` 와 **속에서 다른 것은 둘뿐이다** — 여는 방법(오른쪽 버튼)과 뜨는 자리(마우스 좌표).
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

  /** 감싼 요소의 가운데. 키보드로 열 때 뜨는 자리다 — 누른 좌표가 없다 */
  const center = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 };
  };

  const openAt = (event: MouseEvent | KeyboardEvent, at?: { x: number; y: number }) => {
    // 브라우저 기본 메뉴를 막지 않으면 우리 것 위에 그것이 겹쳐 뜬다
    event.preventDefault();

    // 키보드가 만든 click · contextmenu(Enter · 메뉴 키 · Shift+F10)는 좌표가 (0, 0) 이다 — 화면 왼쪽 위가 아니라 가운데에 띄운다
    const mouse = "clientX" in event && (event.clientX !== 0 || event.clientY !== 0) ? { x: event.clientX, y: event.clientY } : null;
    setPoint(at ?? mouse ?? center());
    onOpenChange?.(true);
  };

  const opensOnLeft = button === "left" || button === "both";

  const hdContextMenu = (event: MouseEvent) => {
    if (button === "right" || button === "both") openAt(event);
  };

  const hdClick = (event: MouseEvent) => {
    if (opensOnLeft) openAt(event);
  };

  /** 왼쪽 클릭으로 여는 자리는 키보드로도 연다 — 감싼 요소 자체에 포커스가 있을 때만(안의 입력을 가로채지 않는다) */
  const hdKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!opensOnLeft || event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") openAt(event, center());
  };

  return (
    /*
      role 을 주지 않는다 — `role="button"` 이면 감싼 표 · 목록의 내용이 스크린리더에서 읽히지 않는다.
      왼쪽 클릭으로 여는 자리만 Tab 으로 닿게 하고 Enter · Space 로 연다.
    */
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- 감싼 내용을 그대로 두려고 role 을 주지 않는다(위 주석)
    <div
      {...props}
      ref={anchorRef}
      data-tag="TxContextMenu"
      className={cm("tx-context-menu", className)}
      tabIndex={opensOnLeft ? (props.tabIndex ?? 0) : props.tabIndex}
      onContextMenu={hdContextMenu}
      onClick={hdClick}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (!event.defaultPrevented) hdKeyDown(event);
      }}
    >
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
