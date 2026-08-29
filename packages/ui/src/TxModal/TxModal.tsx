import { useCallback, useEffect, useId, useRef, type KeyboardEvent, type MouseEvent, type SyntheticEvent } from "react";
import { TxIconClose } from "../TxIcons";
import { cm, lockPageScroll } from "../tx-ui.utils";
import type { TxModalProps } from "./TxModal.types";
import { TxModalFooter } from "./TxModalFooter";

/**
 * 화면을 덮고 뜨는 창.
 *
 * **네이티브 `<dialog>` 다.** 그래서 포커스 트랩 · 닫을 때 포커스 되돌리기 · 배경 비활성화 ·
 * 맨 위 층(top layer)을 **브라우저가 맡는다.** 손으로 짠 트랩이 중첩 모달이나 동적 내용에서
 * 새는 일이 없고, `overflow: hidden` 조상에 잘리지도 않는다.
 *
 * @example
 * ```tsx
 * <TxModal open={open} onClose={() => setOpen(false)} title="비밀번호 변경">
 *   <TxForm>…</TxForm>
 *   <TxModal.Footer>
 *     <TxButton label="취소" variant="secondary" onClick={() => setOpen(false)} />
 *     <TxButton label="저장" onClick={save} />
 *   </TxModal.Footer>
 * </TxModal>
 * ```
 *
 * **닫는 길은 셋이지만 콜백은 하나다** — 닫기 버튼 · 바깥 클릭 · Escape 가 전부 `onClose` 로 온다.
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-modal { --tx-modal-width: 40rem }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxModalBase = ({ open, onClose, title, closeOnBackdrop = true, size = "md", closeLabel = "닫기", hideCloseButton = false, closeOnEscape = true, className, classNames, children, ...props }: TxModalProps) => {
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
   * 여닫기는 DOM 명령이다. `showModal()` 을 불러야 top layer 와 포커스 트랩이 켜진다 —
   * `open` 속성만 붙이면 그냥 자리를 차지하는 요소일 뿐이다.
   *
   * **`showModal` 이 없는 환경(jsdom 등)에서는 속성으로 연다.** 트랩은 없지만 내용은 그려지므로
   * 소비자가 테스트에서 이 컴포넌트를 렌더해도 깨지지 않는다.
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
   * Escape 를 **우리가 직접 받는다.**
   *
   * `<dialog>` 의 `cancel` 이벤트에만 기대면 환경을 탄다 — 브라우저의 close request 는
   * DOM 이벤트가 아니라 UA 가 판단하는 것이라, 끼워 넣은 화면이나 자동화 도구에서는 오지 않는다.
   * 포커스가 창 안에 갇혀 있으므로 `keydown` 은 반드시 여기로 올라온다.
   *
   * **기본 동작을 막는 것도 중요하다.** 안 막으면 브라우저가 스스로 닫아 버려서
   * 창은 사라졌는데 `open` 은 `true` 로 남는다 — 화면과 상태가 갈린다.
   */
  const hdKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDialogElement>) => {
      if (event.key !== "Escape") return;

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
   * 그래서 안쪽 내용은 `.tx-modal__panel` 이 통째로 받아 낸다 — 원본처럼 안쪽에
   * `stopPropagation` 을 걸지 않는다. 그건 소비자의 부모 클릭 핸들러까지 죽인다.
   */
  const hdClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (closeOnBackdrop && event.target === dialogRef.current) requestClose();
    },
    [closeOnBackdrop, requestClose]
  );

  return (
    <dialog {...props} ref={dialogRef} data-tag="TxModal" data-size={size} className={cm("tx-modal", className)} aria-labelledby={title == null ? undefined : titleId} onCancel={hdCancel} onKeyDown={hdKeyDown} onClick={hdClick}>
      {/* 바탕 클릭을 가리기 위한 한 겹. 여기부터가 모달의 내용이다 */}
      <div className={cm("tx-modal__panel", classNames?.panel)}>
        <div className={cm("tx-modal__header", classNames?.header)}>
          {/* 제목이 없어도 자리는 남는다 — 닫기 버튼은 언제나 있어야 한다 */}
          <h2 id={titleId} className="tx-modal__title">
            {title}
          </h2>

          {!hideCloseButton && (
            <button type="button" className="tx-modal__close" aria-label={closeLabel} onClick={requestClose}>
              <TxIconClose />
            </button>
          )}
        </div>

        <div className={cm("tx-modal__body", classNames?.body)}>{children}</div>
      </div>
    </dialog>
  );
};

export const TxModal = Object.assign(TxModalBase, { Footer: TxModalFooter });
