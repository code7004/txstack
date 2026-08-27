import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cm } from "../tx-ui.utils";

export interface TxPopupProps {
  /** 이 요소 아래(또는 위)에 붙는다. */
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  /** 바깥을 누르거나 Escape 를 눌렀을 때. */
  onClose: () => void;

  /** 앵커와 같은 폭으로 맞춘다. 기본 `true`. */
  matchAnchorWidth?: boolean;
  /** 넘치면 안에서 스크롤한다. 기본 `20rem`. */
  maxHeight?: number | string;

  id?: string;
  role?: string;
  className?: string;
  children?: ReactNode;
  /** 스크린리더용 이름. `role` 을 줄 때 함께 준다. */
  "aria-label"?: string;
  "aria-multiselectable"?: boolean;
  "aria-activedescendant"?: string;
}

const GAP = 4;
const EDGE = 8;

const toPx = (value: number | string) => (typeof value === "number" ? value : Number.parseFloat(value) * (value.endsWith("rem") ? 16 : 1));

/**
 * **내부 전용. 배럴에서 내보내지 않는다.**
 *
 * 앵커에 붙어 뜨는 층. `TxDropdown` 계열이 쓰고, 앞으로 `TxCombobox` 와 메뉴 계열도 쓴다.
 *
 * 이 부품이 맡는 것은 넷이다.
 *
 * 1. **포털** — `document.body` 로 낸다. 조상의 `overflow: hidden` 이나 `transform` 안에 갇히면
 *    목록이 잘리거나 엉뚱한 자리에 뜬다
 * 2. **위치** — 앵커 아래가 좁으면 위로 뒤집고, 화면 밖으로 나가지 않게 가둔다
 * 3. **바깥 클릭** — `pointerdown` 을 **캡처 단계**에서 듣는다. 버블 단계면 중간에서
 *    `stopPropagation` 한 코드에 막혀 안 닫힌다
 * 4. **Escape**
 *
 * **포커스는 옮기지 않는다.** 목록형 위젯은 포커스를 앵커에 두고 `aria-activedescendant` 로
 * 활성 항목을 가리키는 것이 표준이다. 포커스를 팝업으로 옮기면 타이핑이 끊긴다.
 */
export function TxPopup({ anchorRef, open, onClose, matchAnchorWidth = true, maxHeight = "20rem", className, children, ...rest }: TxPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width?: number } | null>(null);

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const popup = popupRef.current;
    if (!anchor || !popup) return;

    const rect = anchor.getBoundingClientRect();
    const height = Math.min(popup.scrollHeight, toPx(maxHeight));
    const width = matchAnchorWidth ? rect.width : popup.offsetWidth;

    // 아래가 좁고 위가 더 넓으면 뒤집는다. 둘 다 좁으면 아래에 두고 안에서 스크롤한다.
    const below = window.innerHeight - rect.bottom - GAP;
    const above = rect.top - GAP;
    const flip = below < height && above > below;

    const top = flip ? Math.max(EDGE, rect.top - GAP - height) : rect.bottom + GAP;
    const left = Math.min(Math.max(EDGE, rect.left), Math.max(EDGE, window.innerWidth - width - EDGE));

    setPos({ top, left, width: matchAnchorWidth ? rect.width : undefined });
  }, [anchorRef, matchAnchorWidth, maxHeight]);

  // 첫 배치는 그려지기 전에 끝내야 한다. 안 그러면 왼쪽 위에서 제자리로 튀는 것이 보인다.
  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open, place]);

  useEffect(() => {
    if (!open) return;

    const hdPointerDown = (evt: PointerEvent) => {
      const target = evt.target as Node;
      if (popupRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    const hdKey = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") onClose();
    };

    // 스크롤은 캡처로 듣는다. 조상 어디가 스크롤돼도 따라가야 한다.
    document.addEventListener("pointerdown", hdPointerDown, true);
    document.addEventListener("keydown", hdKey);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);

    return () => {
      document.removeEventListener("pointerdown", hdPointerDown, true);
      document.removeEventListener("keydown", hdKey);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, onClose, place, anchorRef]);

  // SSR 에는 document 가 없다. 뜨는 층은 클라이언트에서 의미가 생기므로 이 절충을 받아들인다.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      {...rest}
      ref={popupRef}
      data-tag="TxPopup"
      className={cm("tx-popup", className)}
      style={{
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        width: pos?.width,
        maxHeight,
        // 자리를 잡기 전 한 프레임 동안 엉뚱한 곳에 보이지 않게 한다.
        visibility: pos ? undefined : "hidden"
      }}
    >
      {children}
    </div>,
    document.body
  );
}
