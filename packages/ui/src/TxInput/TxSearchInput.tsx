import { forwardRef, useImperativeHandle, useRef, useState, type KeyboardEvent } from "react";
import { cm } from "../tx-ui.utils";
import { TxIconClose, TxIconSearch } from "../TxIcons";
import { TxInput } from "./TxInput";
import type { TxInputRef, TxSearchInputProps, TxSearchInputRef } from "./TxInput.types";

/**
 * 검색용 한 줄 입력. `TxInput` 에 **돋보기와 지우기 버튼**을 얹는다.
 *
 * - 돋보기를 누르거나 Enter 를 치면 `onSubmitText`
 * - 값이 있을 때만 지우기 버튼이 나오고, 누르면 `onClear` 와 `onChangeText("")`
 *
 * @example
 * ```tsx
 * <TxSearchInput placeholder="검색어" onSubmitText={search} onClear={() => search("")} />
 * ```
 *
 * 겉모습은 `TxInput` 의 토큰을 그대로 쓴다 — 안쪽 입력의 테두리는 CSS 가 지운다
 * (`.tx-search-input .tx-input`). 원본은 `theme` prop 으로 지웠는데 그 prop 은 폐기됐다.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxSearchInput = forwardRef<TxSearchInputRef, TxSearchInputProps>(function TxSearchInput({ className, onClear, onSubmitText, onChangeText, onEnter, ...props }, ref) {
  const inputRef = useRef<TxInputRef>(null);

  /**
   * 지우기 버튼 표시 여부.
   *
   * 원본은 `showClear` state 를 따로 들었는데, `value` prop 으로 밖에서 값을 바꾸면
   * 상태가 안 따라와 버튼이 어긋났다. **값에서 파생시킨다** —
   * controlled 면 `value`, uncontrolled 면 마지막으로 본 입력값이다.
   */
  const [typed, setTyped] = useState(() => String(props.defaultValue ?? ""));
  const currentText = props.value != null ? String(props.value) : typed;
  const hasValue = currentText.length > 0;

  const submit = () => onSubmitText?.(inputRef.current?.getValue() ?? "");

  const clear = () => {
    inputRef.current?.setValue("");
    setTyped("");
    onChangeText?.("");
    onClear?.("");
  };

  /**
   * 안쪽 ref 를 **스프레드로 복사하지 않는다.**
   *
   * 원본은 `{ ...inputRef.current!, clear, submit }` 였다. 사본이라 안쪽 값이 갱신돼도
   * 옛것을 들고 있었고, 첫 렌더에 `current` 가 비어 있으면 그대로 터졌다.
   * 그때그때 위임하면 두 문제가 다 없다.
   */
  useImperativeHandle(ref, () => ({
    setValue: (v: string) => {
      inputRef.current?.setValue(v);
      setTyped(v);
    },
    getValue: () => inputRef.current?.getValue() ?? "",
    focus: () => inputRef.current?.focus(),
    select: () => inputRef.current?.select(),
    clear,
    submit
  }));

  const hdChangeText = (value: string) => {
    setTyped(value);
    onChangeText?.(value);
  };

  const hdEnter = (evt: KeyboardEvent<HTMLInputElement>) => {
    onEnter?.(evt);
    onSubmitText?.(evt.currentTarget.value);
  };

  return (
    <div data-tag="TxSearchInput" className={cm("tx-search-input", className)}>
      {/*
        원본은 SVG 에 onClick 을 직접 걸었다. 키보드로 도달할 수 없고 스크린리더가
        버튼으로 읽지 않아서, 검색과 지우기를 마우스로만 쓸 수 있었다.
      */}
      <button type="button" className="tx-search-input__button" onClick={submit} aria-label="검색">
        <TxIconSearch />
      </button>

      {/* 통과 props 를 먼저 편다. 아래 두 핸들러는 이 컴포넌트가 소유하므로 덮이면 안 된다 */}
      <TxInput {...props} ref={inputRef} onChangeText={hdChangeText} onEnter={hdEnter} />

      {hasValue && (
        <button type="button" className="tx-search-input__button" onClick={clear} aria-label="검색어 지우기">
          <TxIconClose />
        </button>
      )}
    </div>
  );
});
