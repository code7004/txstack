import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cm } from "../tx-ui.utils";

export interface TxPopupProps {
  /** 이 요소 아래(또는 위)에 붙는다. 바깥 클릭을 가릴 때도 쓴다. */
  anchorRef: RefObject<HTMLElement | null>;

  /**
   * 주면 **요소가 아니라 이 점**에 붙는다. 우클릭 메뉴가 마우스 자리에 뜰 때 쓴다.
   *
   * 뒤집기와 화면 안으로 가두기는 그대로 돈다 — 기준만 크기 0 인 점이 될 뿐이다.
   */
  anchorPoint?: { x: number; y: number };
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

/**
 * 지금 열려 있는 팝업들. 나중에 열린 것이 뒤에 온다.
 *
 * 팝업 안에서 또 팝업이 열리면(메뉴 안의 드롭다운) **겹친 것들이 서로를 "바깥" 으로 본다** —
 * 안쪽에서 값을 고르는 순간 바깥 메뉴가 닫히고, Escape 한 번에 둘이 함께 닫힌다.
 * 누가 위에 있는지 알아야 그 둘을 가릴 수 있어서 여기에 쌓는다.
 */
const openPopups: HTMLElement[] = [];

/**
 * 최대 높이를 픽셀로 읽는다. `"none"` 처럼 숫자가 아니면 **제한 없음**으로 본다 —
 * 달력처럼 내용이 정해진 높이를 갖는 팝업이 그렇다.
 */
const toPx = (value: number | string) => {
  if (typeof value === "number") return value;

  const px = Number.parseFloat(value) * (value.endsWith("rem") ? 16 : 1);
  return Number.isFinite(px) ? px : Infinity;
};

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
export function TxPopup({ anchorRef, anchorPoint, open, onClose, matchAnchorWidth = true, maxHeight = "20rem", className, children, ...rest }: TxPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width?: number } | null>(null);

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const popup = popupRef.current;
    if (!popup || (!anchor && !anchorPoint)) return;

    // 점을 주면 크기 0 인 사각형으로 본다. 아래 계산은 그대로 돈다
    const rect = anchorPoint ? { top: anchorPoint.y, bottom: anchorPoint.y, left: anchorPoint.x, width: 0 } : anchor!.getBoundingClientRect();
    const height = Math.min(popup.scrollHeight, toPx(maxHeight));
    const width = matchAnchorWidth ? rect.width : popup.offsetWidth;

    // 아래가 좁고 위가 더 넓으면 뒤집는다. 둘 다 좁으면 아래에 두고 안에서 스크롤한다.
    const below = window.innerHeight - rect.bottom - GAP;
    const above = rect.top - GAP;
    const flip = below < height && above > below;

    const top = flip ? Math.max(EDGE, rect.top - GAP - height) : rect.bottom + GAP;
    const left = Math.min(Math.max(EDGE, rect.left), Math.max(EDGE, window.innerWidth - width - EDGE));

    setPos({ top, left, width: matchAnchorWidth ? rect.width : undefined });
  }, [anchorRef, anchorPoint, matchAnchorWidth, maxHeight]);

  // 첫 배치는 그려지기 전에 끝내야 한다. 안 그러면 왼쪽 위에서 제자리로 튀는 것이 보인다.
  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open, place]);

  /** 열려 있는 동안만 쌓아 둔다. 겹친 팝업끼리 누가 위인지는 이 순서가 답한다. */
  useEffect(() => {
    const popup = popupRef.current;
    if (!open || !popup) return;

    openPopups.push(popup);

    return () => {
      const at = openPopups.indexOf(popup);
      if (at >= 0) openPopups.splice(at, 1);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    /** 나보다 나중에 열린 팝업들. 내 위에 겹쳐 있는 것들이다. */
    const later = () => openPopups.slice(openPopups.indexOf(popupRef.current!) + 1);

    const hdPointerDown = (evt: PointerEvent) => {
      const target = evt.target as Node;
      if (popupRef.current?.contains(target) || anchorRef.current?.contains(target)) return;

      // 내 위에 겹쳐 뜬 팝업 안이면 바깥이 아니다. 메뉴 안의 드롭다운에서 값을 고르는 동안
      // 메뉴가 닫혀 버리면 그 조합을 쓸 수 없다
      if (later().some((el) => el.contains(target))) return;

      onClose();
    };
    const hdKey = (evt: KeyboardEvent) => {
      if (evt.key !== "Escape") return;

      // 맨 위의 것만 닫는다. 겹쳐 있으면 위에서부터 하나씩 걷힌다
      if (later().length) return;

      onClose();
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
