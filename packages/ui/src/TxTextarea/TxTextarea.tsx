import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type ChangeEvent, type FocusEvent } from "react";
import { useInput } from "../TxInput/TxInput.hook";
import { cm } from "../tx-ui.utils";
import type { TxTextareaProps, TxTextareaRef } from "./TxTextarea.types";

/**
 * 여러 줄 입력.
 *
 * - `onChangeText` — 값이 바뀔 때마다
 * - `onBlurText` — 포커스가 빠질 때
 * - `autoGrow` — 내용에 맞춰 높이가 늘어난다
 *
 * `value` 를 주면 controlled, 안 주면 uncontrolled 다. 둘 다 `ref.getValue()` 로 현재 값을 읽는다.
 *
 * @example
 * ```tsx
 * <TxTextarea placeholder="내용" onChangeText={setBody} />
 * <TxTextarea autoGrow rows={2} />
 * ```
 *
 * **껍데기는 `TxInput` 과 같은 것을 쓴다** — `.tx-input` 클래스를 함께 건다.
 * 폼 안에 나란히 놓았을 때 테두리·배경·포커스 링이 어긋나면 안 되기 때문이다.
 * 원본은 각자 그려서 **텍스트영역만 배경이 없었다** (다크모드에서 부모가 비쳤다).
 *
 * 명세: `docs/001_ui.md`
 */
export const TxTextarea = forwardRef<TxTextareaRef, TxTextareaProps>(function TxTextarea(
  { id, name, className, style, value, defaultValue, readOnly = false, focusOnMount, autoGrow = false, onChange, onBlur, onChangeText, onBlurText, ...props },
  ref
) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const { currentValue, inputId, setValue } = useInput({ id, name, value, defaultValue });

  // 콜백을 ref 로 붙잡는다. 이유는 TxInput 과 같다 — deps 에 적어도 인라인이면 매 렌더 새 함수다.
  const cbRef = useRef({ onChange, onBlur, onChangeText, onBlurText });
  cbRef.current = { onChange, onBlur, onChangeText, onBlurText };

  useImperativeHandle(
    ref,
    () => ({
      setValue,
      // DOM 에서 직접 읽는다. 클로저로 잡으면 사본이 옛 값을 들고 있게 된다 (TxInput 과 같은 이유).
      getValue: () => areaRef.current?.value ?? "",
      focus: () => areaRef.current?.focus(),
      select: () => areaRef.current?.select()
    }),
    [setValue]
  );

  useEffect(() => {
    if (focusOnMount) areaRef.current?.focus();
  }, [focusOnMount]);

  /**
   * 높이를 내용에 맞춘다.
   *
   * `scrollHeight` 는 **줄어들 때를 못 잡는다** — 지금 높이보다 작아지지 않기 때문이다.
   * 그래서 매번 `auto` 로 되돌린 뒤 다시 잰다. 최소 높이는 CSS 의 `min-height` 가 지킨다.
   */
  const fitHeight = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;

    if (!autoGrow) {
      // 껐을 때 인라인 높이가 남아 있으면 CSS 가 아무리 바뀌어도 그 값에 갇힌다.
      el.style.height = "";
      return;
    }

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoGrow]);

  // 값이 바뀔 때마다 다시 잰다. 타이핑뿐 아니라 ref.setValue·controlled value 변경도 포함된다.
  useEffect(fitHeight, [fitHeight, currentValue]);

  const hdChange = useCallback(
    (evt: ChangeEvent<HTMLTextAreaElement>) => {
      const cb = cbRef.current;
      cb.onChange?.(evt);

      const text = evt.target.value;
      setValue(text);
      cb.onChangeText?.(text);
    },
    [setValue]
  );

  const hdBlur = useCallback((evt: FocusEvent<HTMLTextAreaElement>) => {
    const cb = cbRef.current;
    cb.onBlur?.(evt);
    cb.onBlurText?.(evt.currentTarget.value);
  }, []);

  return (
    // .tx-input 을 함께 건다 — 껍데기를 공유해야 입력창과 나란히 놓았을 때 줄이 맞는다.
    <div data-tag="TxTextarea" data-readonly={readOnly ? "" : undefined} data-disabled={props.disabled ? "" : undefined} data-auto-grow={autoGrow ? "" : undefined} className={cm("tx-input", "tx-textarea", className)} style={style}>
      <textarea
        // 통과 props 를 먼저 편다. 아래 계약 속성은 덮이면 안 된다.
        {...props}
        ref={areaRef}
        id={inputId}
        name={name}
        readOnly={readOnly}
        className="tx-textarea__field"
        value={currentValue}
        onChange={hdChange}
        onBlur={hdBlur}
      />
    </div>
  );
});
