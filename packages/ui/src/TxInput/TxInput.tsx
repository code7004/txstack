import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type ChangeEvent, type FocusEvent, type KeyboardEvent } from "react";
import { cm } from "../tx-ui.utils";
import { useInput } from "./TxInput.hook";
import type { TxInputProps, TxInputRef } from "./TxInput.types";
import { parseTxInputNumber } from "./TxInput.utils";

/**
 * 한 줄 입력. **문자열과 숫자를 한 자리에서 다룬다.**
 *
 * - `onChangeText` / `onChangeNumber` — 값이 바뀔 때마다. 숫자로 못 읽으면 `undefined`
 * - `onSubmitText` / `onSubmitNumber` — Enter 를 눌렀을 때
 * - `onBlurNumber` — 포커스가 빠질 때
 *
 * `value` 를 주면 controlled, 안 주면 uncontrolled 다. 둘 다 `ref.getValue()` 로 현재 값을 읽는다.
 *
 * @example
 * ```tsx
 * <TxInput placeholder="이름" onChangeText={setName} />
 * <TxInput type="number" value={qty} onChangeNumber={(n) => setQty(n ?? 0)} />
 * <TxInput onEnter={() => search()} />
 * ```
 *
 * 겉모습은 CSS 변수로 바꾼다 — 앱 전체는 `:root { --tx-color-surface: … }`,
 * 이 컴포넌트만은 `.tx-input { --tx-input-height: … }`.
 *
 * 명세: `docs/001_ui/006_TxInput.md`
 */
export const TxInput = forwardRef<TxInputRef, TxInputProps>(function TxInput(
  { id, name, className, style, value, defaultValue, readOnly = false, focusOnMount, onChange, onBlur, onEnter, onChangeText, onChangeNumber, onSubmitText, onSubmitNumber, onBlurNumber, ...props },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  // setValue 가 controlled 여부를 안에서 가린다. 여기서 또 확인하지 않는다.
  const { currentValue, inputId, setValue } = useInput({ id, name, value, defaultValue });

  // 파일 입력은 값을 React 가 들 수 없다. value 를 주면 브라우저가 거부한다.
  const isFile = props.type === "file";

  /**
   * 콜백을 ref 로 붙잡는다.
   *
   * 원본은 `useCallback` 의 deps 에 `props` 객체를 통째로 넣어서 **매 렌더 새 함수**가 됐다.
   * 그러면 `useCallback` 도 바깥의 `memo()` 도 아무 일을 하지 않는다. 소비자는 핸들러를
   * 인라인으로 넘기는 것이 보통이라 deps 에 하나씩 적어도 마찬가지다.
   */
  const cbRef = useRef({ onChange, onBlur, onEnter, onChangeText, onChangeNumber, onSubmitText, onSubmitNumber, onBlurNumber });
  cbRef.current = { onChange, onBlur, onEnter, onChangeText, onChangeNumber, onSubmitText, onSubmitNumber, onBlurNumber };

  /**
   * `getValue` 는 ref 에서 직접 읽는다.
   *
   * 원본은 `currentValue` 를 클로저로 잡고 deps 에 넣었는데, `TxSearchInput` 이 그 객체를
   * **스프레드로 복사**해 쓰면서 사본이 옛 값을 들고 있었다. DOM 에서 읽으면 그 문제가 없다.
   */
  useImperativeHandle(
    ref,
    () => ({
      setValue,
      getValue: () => inputRef.current?.value ?? "",
      focus: () => inputRef.current?.focus(),
      select: () => inputRef.current?.select()
    }),
    [setValue]
  );

  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);

  const hdChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const cb = cbRef.current;
      cb.onChange?.(evt);

      const text = evt.target.value;
      setValue(text);

      cb.onChangeText?.(text);
      cb.onChangeNumber?.(parseTxInputNumber(text));
    },
    [setValue]
  );

  const hdKeyDown = useCallback((evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key !== "Enter") return;

    const cb = cbRef.current;
    cb.onEnter?.(evt);

    const next = evt.currentTarget.value;
    cb.onSubmitText?.(next);
    cb.onSubmitNumber?.(parseTxInputNumber(next));
  }, []);

  const hdBlur = useCallback((evt: FocusEvent<HTMLInputElement>) => {
    const cb = cbRef.current;
    cb.onBlur?.(evt);
    cb.onBlurNumber?.(parseTxInputNumber(evt.currentTarget.value));
  }, []);

  return (
    // 스타일은 TxInput.css 가 소유한다. 여기서는 기본 클래스만 걸고 className 을 덧붙인다.
    <div data-tag="TxInput" data-readonly={readOnly ? "" : undefined} data-disabled={props.disabled ? "" : undefined} className={cm("tx-input", className)} style={style}>
      <input
        // 통과 props 를 먼저 편다. 아래 계약 속성은 덮이면 안 된다.
        {...props}
        ref={inputRef}
        id={inputId}
        name={name}
        readOnly={readOnly}
        className="tx-input__field"
        value={isFile ? undefined : currentValue}
        onChange={hdChange}
        onKeyDown={hdKeyDown}
        onBlur={hdBlur}
      />
    </div>
  );
});
