import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { TxPopup } from "../TxPopup";
import { cm } from "../tx-ui.utils";
import type { TxTooltipProps } from "./TxTooltip.types";

/** 탭 순서에 들어가는 것들. 감싼 내용이 이미 포커스를 받는지 가릴 때 쓴다. */
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** 터치로 길게 누르는 시간. */
const LONG_PRESS = 500;

/**
 * 올리면 뜨는 짧은 설명.
 *
 * ```tsx
 * <TxTooltip tip="삭제하면 되돌릴 수 없다">
 *   <TxButton label="삭제" variant="danger" />
 * </TxTooltip>
 * ```
 *
 * **여는 길이 셋이다** — 마우스를 올리거나, 키보드로 포커스하거나, 터치로 길게 누른다.
 * 닫는 것은 벗어나기 · Escape · 바깥 누르기다.
 *
 * - `tip` 은 `ReactNode` 다. 표 안에서 JSON 트리를 띄우는 자리가 그렇다
 * - **툴팁 위로 마우스를 올려도 안 닫힌다.** 긴 내용을 읽거나 글자를 긁을 수 있다
 * - 감싼 내용이 이미 포커스를 받으면(버튼 등) **감싸개는 탭 순서에 끼어들지 않는다.**
 *   글자만 감쌌으면 감싸개가 대신 받는다 — 그래야 키보드로도 볼 수 있다
 *
 * 겉모습은 CSS 변수로 바꾼다 — `.tx-tooltip { --tx-tooltip-bg: … }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxTooltip = ({ tip, children, openDelay = 300, closeDelay = 100, maxWidth = "20rem", disabled = false, className, classNames, ...props }: TxTooltipProps) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const focusTargetRef = useRef<HTMLElement | null>(null);

  const [open, setOpen] = useState(false);
  const [selfFocusable, setSelfFocusable] = useState(false);
  const tipId = useId();

  const clear = () => clearTimeout(timerRef.current);

  const schedule = useCallback((next: boolean, delay: number) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(next), delay);
  }, []);

  // 트리거가 사라진 뒤 타이머가 돌 이유가 없다. 원본은 이걸 안 껐다.
  useEffect(() => clear, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  /**
   * 감싼 내용이 이미 포커스를 받는지 본다.
   *
   * 버튼을 감쌌으면 그 버튼이 포커스를 받으므로 감싸개까지 탭 순서에 넣으면 **한 컨트롤에
   * 탭 정거장이 둘**이 된다. 글자만 감쌌으면 아무도 못 받으니 감싸개가 대신 받아야 한다 —
   * 그러지 않으면 키보드만 쓰는 사람에게 이 툴팁은 존재하지 않는다.
   */
  useEffect(() => {
    focusTargetRef.current = anchorRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
    setSelfFocusable(!focusTargetRef.current);
  }, [children]);

  /**
   * 설명은 **포커스를 받는 그 요소**에 걸어야 스크린리더가 읽어 준다.
   * 조상에 걸면 읽히지 않는다. 감싸개가 포커스를 받는 경우는 아래 JSX 가 직접 건다.
   */
  useEffect(() => {
    const target = focusTargetRef.current;
    if (!target || selfFocusable) return;

    const previous = target.getAttribute("aria-describedby");

    if (open) target.setAttribute("aria-describedby", previous ? `${previous} ${tipId}` : tipId);
    else if (previous) target.setAttribute("aria-describedby", previous.replace(tipId, "").trim());

    return () => {
      // 소비자가 원래 걸어 둔 것을 지우지 않는다
      if (previous) target.setAttribute("aria-describedby", previous);
      else target.removeAttribute("aria-describedby");
    };
  }, [open, selfFocusable, tipId]);

  /** 터치에는 hover 가 없다. 길게 누르는 것으로 대신한다. */
  const hdPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (disabled || event.pointerType !== "touch") return;
    schedule(true, LONG_PRESS);
  };

  const hdPointerUp = (event: PointerEvent<HTMLSpanElement>) => {
    // 이미 떠 있으면 그대로 둔다. 손을 뗐다고 닫으면 읽을 새가 없다
    if (event.pointerType === "touch" && !open) clear();
  };

  const hdPointerEnter = (event: PointerEvent<HTMLSpanElement>) => {
    // 터치는 위의 길게 누르기가 맡는다. 여기서 열면 톡 건드려도 떠 버린다
    if (disabled || event.pointerType === "touch") return;
    schedule(true, openDelay);
  };

  const hdPointerLeave = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === "touch") return;
    schedule(false, closeDelay);
  };

  return (
    <>
      <span
        {...props}
        ref={anchorRef}
        data-tag="TxTooltip"
        className={cm("tx-tooltip-anchor", className)}
        // 감싼 내용이 포커스를 못 받을 때만 감싸개가 받는다
        tabIndex={selfFocusable ? 0 : undefined}
        aria-describedby={selfFocusable && open ? tipId : undefined}
        onPointerEnter={hdPointerEnter}
        onPointerLeave={hdPointerLeave}
        onPointerDown={hdPointerDown}
        onPointerUp={hdPointerUp}
        onPointerCancel={hdPointerUp}
        // focusin/focusout 은 올라온다. 감싼 버튼에 포커스가 가도 여기서 받는다
        onFocus={() => !disabled && (clear(), setOpen(true))}
        onBlur={() => (clear(), setOpen(false))}
      >
        {children}
      </span>

      {/* 포털·뒤집기·바깥 클릭·Escape 는 TxPopup 이 맡는다 */}
      <TxPopup anchorRef={anchorRef} open={open && !disabled} onClose={() => setOpen(false)} matchAnchorWidth={false} id={tipId} role="tooltip" className="tx-tooltip">
        <div
          className={cm("tx-tooltip__body", classNames?.tip)}
          style={{ maxWidth }}
          // 툴팁 위에서는 안 닫힌다. 긴 내용을 읽거나 글자를 긁을 수 있어야 한다
          onPointerEnter={clear}
          onPointerLeave={() => schedule(false, closeDelay)}
        >
          {tip}
        </div>
      </TxPopup>
    </>
  );
};
