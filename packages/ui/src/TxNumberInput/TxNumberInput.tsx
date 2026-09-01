import { forwardRef, useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from "react";
import { cm } from "../tx-ui.utils";
import type { TxNumberInputProps } from "./TxNumberInput.types";
import { clamp, formatNumber, parseNumber, precisionOf, stepBy } from "./TxNumberInput.utils";

/**
 * 숫자를 넣고 올리고 내리는 자리.
 *
 * @example
 * ```tsx
 * <TxNumberInput value={qty} onChange={setQty} min={1} max={99} />
 * <TxNumberInput defaultValue={12000} step={1000} suffix="원" />
 * ```
 *
 * **`<input type="number">` 를 쓰지 않는다.** 휠을 굴리면 값이 바뀌어 스크롤하다 숫자가
 * 틀어지고, 브라우저마다 증감 버튼 모양이 달라 토큰으로 맞출 수 없으며, **천 단위 콤마를
 * 넣으면 값이 비어 버린다.** 대신 `inputMode="decimal"` 로 모바일 키패드를 부르고
 * `role="spinbutton"` 으로 값·범위를 알린다.
 *
 * **타이핑하는 동안에는 콤마를 안 넣는다** — 넣으면 커서가 튄다. 포커스가 빠질 때
 * 끊어 주고 소수 자릿수도 그때 맞춘다.
 *
 * 겉은 `TxInput` 의 상자를 그대로 쓴다 — 폼에서 다른 칸과 높이가 어긋나지 않는다.
 *
 * 명세: `docs/001_ui/038_TxNumberInput.md`
 */
export const TxNumberInput = forwardRef<HTMLInputElement, TxNumberInputProps>(function TxNumberInput(
  { value, defaultValue, onChange, min, max, step = 1, precision, thousandSeparator = true, suffix, hideStepper = false, className, style, disabled, readOnly, onBlur, onKeyDown, ...props },
  ref
) {
  const digits = precision ?? precisionOf(step);
  const format = (next: number) => formatNumber(next, { precision: digits, thousandSeparator });

  const controlled = value !== undefined;
  const [own, setOwn] = useState<number | undefined>(defaultValue);
  const current = controlled ? value : own;

  /** 화면에 보이는 글자. 타이핑하는 동안에는 이쪽이 주인이다. */
  const [text, setText] = useState(() => (current == null ? "" : format(current)));
  const typingRef = useRef(false);

  /**
   * 모양을 **다시 맞출 구실**.
   *
   * 값이 그대로여도 글자는 달라질 수 있다 — `1234` 를 치고 나가면 값은 안 바뀌었지만
   * `1,234` 로 끊어야 한다. 그리고 controlled 인데 소비자가 값을 안 바꾸면 값도 안 바뀌는데,
   * 그때 타이핑한 글자가 남아 있으면 **화면과 값이 갈린다.**
   */
  const [syncTick, setSyncTick] = useState(0);

  // 밖에서 값이 바뀌면 따라간다. 타이핑 중에는 건드리지 않는다 — 커서가 튄다
  useEffect(() => {
    if (typingRef.current) return;
    setText(current == null ? "" : format(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- format 은 매 렌더 새로 만들어진다. 값이 바뀔 때만 맞춘다
  }, [current, digits, thousandSeparator, syncTick]);

  const settle = (next: number | undefined) => {
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  const hdChange = (evt: ChangeEvent<HTMLInputElement>) => {
    typingRef.current = true;
    setText(evt.target.value);
    settle(parseNumber(evt.target.value));
  };

  /**
   * 포커스가 빠질 때 비로소 모양을 다듬는다. 타이핑 중에 하면 커서가 튄다.
   *
   * **글자를 직접 놓지 않는다.** 위의 효과가 `current` 를 보고 놓게 두어야,
   * controlled 인데 소비자가 값을 안 받은 경우에도 화면이 값을 따라간다.
   */
  const hdBlur = (evt: FocusEvent<HTMLInputElement>) => {
    typingRef.current = false;

    const parsed = parseNumber(evt.target.value);
    const next = parsed == null ? undefined : clamp(parsed, min, max);

    if (next !== current) settle(next);
    setSyncTick((tick) => tick + 1);

    onBlur?.(evt);
  };

  const move = (direction: 1 | -1) => {
    const base = current ?? clamp(0, min, max);
    const next = clamp(stepBy(base, step * direction, digits), min, max);

    typingRef.current = false;
    settle(next);
    setSyncTick((tick) => tick + 1);
  };

  /** `role="spinbutton"` 은 ↑↓ 로 움직이는 것이 규약이다. */
  const hdKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(evt);
    if (evt.defaultPrevented || disabled || readOnly) return;

    if (evt.key === "ArrowUp") {
      evt.preventDefault();
      move(1);
    } else if (evt.key === "ArrowDown") {
      evt.preventDefault();
      move(-1);
    }
  };

  const atMin = min != null && current != null && current <= min;
  const atMax = max != null && current != null && current >= max;

  return (
    <div data-tag="TxNumberInput" data-readonly={readOnly ? "" : undefined} data-disabled={disabled ? "" : undefined} className={cm("tx-input tx-number-input", className)} style={style}>
      {!hideStepper && (
        <button type="button" className="tx-number-input__step" aria-label="줄이기" tabIndex={-1} disabled={disabled || readOnly || atMin} onClick={() => move(-1)}>
          −
        </button>
      )}

      <input
        {...props}
        ref={ref}
        type="text"
        // 모바일에서 숫자 키패드를 부른다. `type="number"` 의 부작용은 없다
        inputMode="decimal"
        className="tx-input__field tx-number-input__field"
        value={text}
        disabled={disabled}
        readOnly={readOnly}
        role="spinbutton"
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        // 콤마와 단위가 붙은 글자를 그대로 읽어 준다. 숫자만 읽으면 단위를 놓친다
        aria-valuetext={current == null ? undefined : `${format(current)}${suffix ?? ""}`}
        onChange={hdChange}
        onBlur={hdBlur}
        onKeyDown={hdKeyDown}
      />

      {/* 단위는 눈으로 보는 것이다. 스크린리더에는 위의 `aria-valuetext` 가 간다 */}
      {suffix != null && (
        <span className="tx-number-input__suffix" aria-hidden>
          {suffix}
        </span>
      )}

      {!hideStepper && (
        <button type="button" className="tx-number-input__step" aria-label="늘리기" tabIndex={-1} disabled={disabled || readOnly || atMax} onClick={() => move(1)}>
          +
        </button>
      )}
    </div>
  );
});
