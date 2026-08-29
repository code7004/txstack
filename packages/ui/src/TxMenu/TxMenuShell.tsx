import { useCallback, useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { TxPopup } from "../TxPopup";
import { cm } from "../tx-ui.utils";

/**
 * 메뉴 안에서 화살표로 옮겨 다닐 것들. **항목이 아닌 컨트롤도 여기 걸린다** —
 * 메뉴 안에 드롭다운을 하나 놓았을 때 화살표가 그것을 건너뛰면 키보드로는 닿을 길이 없다.
 * (`role="combobox"` 는 `TxDropdown` · `TxCombobox` 의 헤드다.)
 */
const FOCUSABLE =
  '[role="menuitem"]:not([aria-disabled="true"]), [role="combobox"], a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)';

export interface TxMenuShellProps {
  anchorRef: RefObject<HTMLElement | null>;
  /** 주면 요소가 아니라 이 점에 뜬다. 우클릭 메뉴가 쓴다. */
  anchorPoint?: { x: number; y: number };

  open: boolean;
  onClose: () => void;

  menu: ReactNode;
  menuLabel?: string;
  maxHeight?: number | string;
  className?: string;

  /** 닫을 때 포커스를 되돌릴 곳. 안 주면 앵커로 돌아간다. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * **내부 전용.** `TxDropMenu` 와 `TxContextMenu` 가 함께 쓰는 속.
 *
 * 두 메뉴가 다른 것은 **여는 방법과 뜨는 자리** 둘뿐이고, 나머지는 전부 여기 있다 —
 * 항목 그리기 · 키보드 · 포커스 · 닫기. 그래서 접근성을 한 번만 만든다.
 * (`TxDropdownShell` 이 `TxDropdown` 과 `TxDropdownMulti` 에 하는 일과 같다.)
 *
 * ## 포커스
 *
 * **열면 첫 항목으로 들어가고 닫으면 트리거로 돌아온다.** 메뉴는 그렇게 다루는 것이 규약이다 —
 * `TxPopup` 은 포커스를 옮기지 않으므로(목록형 위젯 기준) 그 일을 여기서 한다.
 */
export function TxMenuShell({ anchorRef, anchorPoint, open, onClose, menu, menuLabel, maxHeight = "20rem", className, returnFocusRef }: TxMenuShellProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  const items = useCallback(() => [...(menuRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])], []);

  /**
   * 열리면 첫 줄로 포커스를 옮기고, 닫히면 트리거로 되돌린다.
   *
   * 되돌리지 않으면 메뉴를 닫은 뒤 포커스가 `<body>` 로 떨어져서, 키보드만 쓰는 사람은
   * 처음부터 Tab 을 다시 눌러야 한다.
   */
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      // 팝업이 자리를 잡은 뒤에 옮긴다
      const frame = requestAnimationFrame(() => items()[0]?.focus());
      return () => cancelAnimationFrame(frame);
    }

    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;

    const back = returnFocusRef?.current ?? anchorRef.current;
    back?.focus();
  }, [open, items, anchorRef, returnFocusRef]);

  const move = (from: number, delta: number) => {
    const list = items();
    if (!list.length) return;

    // 양 끝에서 감긴다. 목록이 길 때 끝에서 처음으로 가려고 되짚지 않아도 된다
    const next = (from + delta + list.length) % list.length;
    list[next]?.focus();
  };

  const hdKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const current = list.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(current, 1);
        break;

      case "ArrowUp":
        event.preventDefault();
        move(current, -1);
        break;

      case "Home":
        event.preventDefault();
        list[0]?.focus();
        break;

      case "End":
        event.preventDefault();
        list[list.length - 1]?.focus();
        break;

      // 메뉴에서 Tab 은 빠져나가는 것이 아니라 닫는 것이다. 규약이 그렇다
      case "Tab":
        onClose();
        break;
    }
  };

  return (
    <TxPopup anchorRef={anchorRef} anchorPoint={anchorPoint} open={open} onClose={onClose} matchAnchorWidth={false} maxHeight={maxHeight} className="tx-menu">
      <div ref={menuRef} role="menu" aria-label={menuLabel} className={cm("tx-menu__list", className)} onKeyDown={hdKeyDown}>
        {menu}
      </div>
    </TxPopup>
  );
}
