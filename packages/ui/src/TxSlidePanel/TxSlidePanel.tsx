import { useCallback, useEffect, useId, useRef, type KeyboardEvent, type MouseEvent, type SyntheticEvent } from "react";
import { TxIconClose } from "../TxIcons";
import { cm, lockPageScroll } from "../tx-ui.utils";
import type { TxSlidePanelProps } from "./TxSlidePanel.types";

/**
 * 가장자리에서 밀려 나오는 패널(서랍). 상세 보기나 필터 패널에 쓴다.
 *
 * **네이티브 `<dialog>` 다.** `TxModal` 과 같은 바탕이라 포커스 트랩 · 닫을 때 포커스
 * 되돌리기 · 배경 비활성화 · 맨 위 층(top layer)을 **브라우저가 맡는다.** 다른 것은
 * 화면 가운데 뜨느냐 가장자리에서 밀려 나오느냐, 그 하나뿐이다.
 *
 * @example
 * ```tsx
 * <TxSlidePanel open={open} onClose={() => setOpen(false)} side="right" title="필터">
 *   <TxForm>…</TxForm>
 * </TxSlidePanel>
 * ```
 *
 * **닫는 길은 셋이지만 콜백은 하나다** — 닫기 버튼 · 바깥 클릭 · Escape 가 전부 `onClose` 로 온다.
 *
 * 크기는 CSS 변수 하나로 바꾼다 — `.tx-slide-panel { --tx-slide-panel-size: 28rem }`.
 * 좌우면 폭, 위아래면 높이를 뜻한다.
 *
 * 명세: `docs/001_ui/023_TxSlidePanel.md`
 */
export const TxSlidePanel = ({ open, onClose, side = "right", title, closeOnBackdrop = true, closeOnEscape = true, closeLabel = "닫기", hideCloseButton = false, className, classNames, children, ...props }: TxSlidePanelProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);
  const titleId = useId();

  /**
   * 닫아 달라는 요청을 한 번만 흘려보낸다.
   *
   * Escape 는 브라우저의 close request 로도 오고 우리 `keydown` 으로도 오는데,
   * 환경에 따라 둘 다 오는 경우가 있다. 소비자의 `onClose` 가 두 번 불리면
   * 라우팅이나 저장 같은 일이 두 번 일어난다.
   */
  const requestClose = useCallback(() => {
    if (closingRef.current) return;

    closingRef.current = true;
    queueMicrotask(() => (closingRef.current = false));
    onClose();
  }, [onClose]);

  /**
   * 여닫기는 DOM 명령이다. `showModal()` 을 불러야 top layer 와 포커스 트랩이 켜진다.
   *
   * **`showModal` 이 없는 환경(jsdom 등)에서는 속성으로 연다.** 트랩은 없지만 내용은
   * 그려지므로 소비자가 테스트에서 이 컴포넌트를 렌더해도 깨지지 않는다.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      }
      return lockPageScroll();
    }

    if (dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  /**
   * Escape 를 **우리가 직접 받는다.** `cancel` 이벤트에만 기대면 환경을 탄다 —
   * 끼워 넣은 화면이나 자동화 도구에서는 오지 않는다.
   *
   * 원본은 `window` 에 리스너를 걸어서 **패널이 둘 겹치면 한 번에 둘 다 닫혔다.**
   * 포커스가 패널 안에 갇혀 있으므로 `keydown` 은 맨 위의 것에만 올라온다.
   */
  const hdKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDialogElement>) => {
      if (event.key !== "Escape") return;

      // 안 막으면 브라우저가 스스로 닫아 버려서 화면과 `open` 이 갈린다
      event.preventDefault();
      if (closeOnEscape) requestClose();
    },
    [closeOnEscape, requestClose]
  );

  /** UA 가 close request 를 보내는 경로. 위에서 이미 막았으면 오지 않는다. */
  const hdCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (closeOnEscape) requestClose();
    },
    [closeOnEscape, requestClose]
  );

  /**
   * 바깥 클릭. `<dialog>` 의 바탕을 누르면 이벤트의 target 이 `<dialog>` 자신이다.
   *
   * 그래서 안쪽 내용은 `.tx-slide-panel__panel` 이 통째로 받아 낸다 — 원본처럼 안쪽에
   * `stopPropagation` 을 걸지 않는다. 그건 소비자의 부모 클릭 핸들러까지 죽인다.
   */
  const hdClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (closeOnBackdrop && event.target === dialogRef.current) requestClose();
    },
    [closeOnBackdrop, requestClose]
  );

  return (
    <dialog {...props} ref={dialogRef} data-tag="TxSlidePanel" data-side={side} className={cm("tx-slide-panel", className)} aria-labelledby={title == null ? undefined : titleId} onCancel={hdCancel} onKeyDown={hdKeyDown} onClick={hdClick}>
      {/* 바탕 클릭을 가리기 위한 한 겹. 여기부터가 패널의 내용이다 */}
      <div className={cm("tx-slide-panel__panel", classNames?.panel)}>
        <div className={cm("tx-slide-panel__header", classNames?.header)}>
          {/* 제목이 없어도 자리는 남는다 — 닫기 버튼은 언제나 있어야 한다 */}
          <h2 id={titleId} className="tx-slide-panel__title">
            {title}
          </h2>

          {!hideCloseButton && (
            <button type="button" className="tx-slide-panel__close" aria-label={closeLabel} onClick={requestClose}>
              <TxIconClose />
            </button>
          )}
        </div>

        <div className={cm("tx-slide-panel__body", classNames?.body)}>{children}</div>
      </div>
    </dialog>
  );
};
