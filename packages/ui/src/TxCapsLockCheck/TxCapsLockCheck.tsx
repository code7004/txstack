import { cloneElement, isValidElement, useEffect, useId, useState, type FocusEvent, type KeyboardEvent, type ReactElement } from "react";
import { cm } from "../tx-ui.utils";
import type { TxCapsLockCheckProps } from "./TxCapsLockCheck.types";

/**
 * 비밀번호를 칠 때 Caps Lock 이 켜져 있으면 알려 준다.
 *
 * ```tsx
 * <TxCapsLockCheck>
 *   <TxInput type="password" placeholder="비밀번호" />
 * </TxCapsLockCheck>
 * ```
 *
 * **감싼 입력창 안에서 키를 누를 때만 반응한다.** 그래서 화면 다른 곳에서 타이핑하다
 * Caps Lock 을 켜도 손대지 않은 칸에 경고가 뜨지 않는다.
 *
 * 경고가 뜨면 입력창과 이어 준다(`aria-describedby`) — 스크린리더가 그 칸에서 바로 안내한다.
 * 창을 벗어나거나 포커스가 빠지면 경고를 내린다.
 *
 * 색·글자 크기는 CSS 변수로 바꾼다 — `.tx-capslock { --tx-capslock-color: … }`.
 *
 * 명세: `docs/001_ui/009_TxCapsLockCheck.md`
 */
export function TxCapsLockCheck({ children, text = "Caps Lock 이 켜져 있습니다.", icon = "⚠️", preserveSpace = true, className, style, classNames }: TxCapsLockCheckProps) {
  const [on, setOn] = useState(false);
  const messageId = useId();

  /**
   * `getModifierState` 는 키 이벤트에만 있다. 그래서 **마우스로 눌러 들어온 직후에는 알 수 없고**,
   * 첫 글자를 칠 때 알게 된다. 브라우저가 주는 정보의 한계다.
   */
  const hdKey = (evt: KeyboardEvent<HTMLDivElement>) => setOn(evt.getModifierState?.("CapsLock") ?? false);

  // 포커스가 이 안을 벗어나면 내린다. 안에서 옮겨 다니는 것은 그대로 둔다.
  const hdBlur = (evt: FocusEvent<HTMLDivElement>) => {
    if (!evt.currentTarget.contains(evt.relatedTarget)) setOn(false);
  };

  useEffect(() => {
    // 다른 창으로 넘어가면 상태를 알 수 없다. 남겨 두면 틀린 경고가 된다.
    const clear = () => setOn(false);
    window.addEventListener("blur", clear);
    return () => window.removeEventListener("blur", clear);
  }, []);

  /**
   * 경고가 떠 있는 동안만 입력창과 잇는다.
   *
   * 자식이 엘리먼트 하나일 때만 이어 줄 수 있다. 여럿이거나 문자열이면 그냥 렌더한다 —
   * 그때도 아래 안내 영역은 그대로 동작한다.
   */
  const field =
    on && isValidElement<{ "aria-describedby"?: string }>(children)
      ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
          "aria-describedby": [children.props["aria-describedby"], messageId].filter(Boolean).join(" ")
        })
      : children;

  return (
    <div data-tag="TxCapsLockCheck" data-on={on ? "" : undefined} data-preserve-space={preserveSpace ? "" : undefined} className={cm("tx-capslock", className)} style={style}>
      <div className={cm("tx-capslock__field", classNames?.field)} onKeyDown={hdKey} onKeyUp={hdKey} onBlur={hdBlur}>
        {field}
      </div>

      {/*
        **안내 영역은 언제나 여기 있다.** 경고가 뜰 때 비로소 만들면 스크린리더가 그 변화를 놓친다 —
        live region 은 미리 자리잡고 있어야 안에서 바뀐 내용을 읽어 준다.
      */}
      <p id={messageId} role="status" aria-live="polite" className={cm("tx-capslock__message", classNames?.message)}>
        {on && (
          <>
            {icon != null && (
              <span aria-hidden="true" className="tx-capslock__icon">
                {icon}
              </span>
            )}
            {text}
          </>
        )}
      </p>
    </div>
  );
}
