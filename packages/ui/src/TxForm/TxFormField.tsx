import { forwardRef, useId, type AriaAttributes, type ReactNode } from "react";
import { cm } from "../tx-ui.utils";
import type { TxFormFieldProps } from "./TxForm.types";

/**
 * 컨트롤 하나가 앉는 자리. **캡션과 메시지 자리를 대신 그려 준다.**
 *
 * `TxForm.Input` 같은 필드들이 안에서 이걸 쓴다. 직접 쓰는 것은 **손수 짠 컨트롤**을
 * 같은 줄맞춤에 넣을 때다.
 *
 * @example
 * ```tsx
 * <TxForm.Field caption="커스텀" htmlFor="my-ctl" error="직접 검증한다">
 *   <MyControl id="my-ctl" aria-describedby="my-ctl-message" />
 * </TxForm.Field>
 * ```
 *
 * 명세: `docs/001_ui.md`
 */
export const TxFormField = forwardRef<HTMLDivElement, TxFormFieldProps>(function TxFormField({ caption, warning, error, htmlFor, captionId, messageId, className, children, ...props }, ref) {
  /**
   * **자리는 하나다.** 원본은 warning 과 error 를 둘 다 `absolute -bottom-5 left-0` 에 그려서
   * 둘이 있으면 글자가 포개졌다. 스토리 문서에는 "error 가 우선한다" 고 적혀 있었지만
   * 그렇게 만드는 코드가 없었다.
   */
  const message = error ?? warning;
  const tone = error != null ? "error" : warning != null ? "warning" : undefined;
  const msgId = messageId ?? (htmlFor ? `${htmlFor}-message` : undefined);

  return (
    // data-tag 를 스프레드 뒤에 둔다. 원본은 앞에 둬서 통과 props 가 이름을 덮어썼다.
    <div {...props} ref={ref} className={cm("tx-form-field", className)} data-tag="TxForm.Field">
      {caption != null && (
        <FieldCaption id={captionId} htmlFor={htmlFor}>
          {caption}
        </FieldCaption>
      )}

      {children}

      {/*
        메시지 요소는 **늘 자리에 있다.** 필요할 때 만들어 넣으면 live region 이 동작하지 않아
        화면에는 떠도 안 읽힐 수 있다 (TxCapsLockCheck 에서 겪은 것과 같다).
        높이도 미리 잡아 둬서 메시지가 뜰 때 아래 줄이 밀리지 않는다.
      */}
      <p id={msgId} className="tx-form-field__message" data-tag="TxForm.Message" data-tone={tone} aria-live="polite">
        {message}
      </p>
    </div>
  );
});

/**
 * **가리키는 곳이 없는 `htmlFor` 를 만들지 않는다.** `htmlFor` 가 있으면 `<label>`,
 * 없으면 `<span>` 이다 — `<label for>` 는 `<input>` 처럼 이름을 붙일 수 있는 요소에만 먹는다.
 */
const FieldCaption = ({ id, htmlFor, children }: { id?: string; htmlFor?: string; children: ReactNode }) =>
  htmlFor ? (
    <label id={id} htmlFor={htmlFor} className="tx-form-field__caption">
      {children}
    </label>
  ) : (
    <span id={id} className="tx-form-field__caption">
      {children}
    </span>
  );

interface ControlWiringParams {
  id?: string;
  caption?: ReactNode;
  warning?: ReactNode;
  error?: ReactNode;
  describedBy?: string;
  invalid?: AriaAttributes["aria-invalid"];
  /**
   * 이름을 어떻게 잇는가.
   *
   * - `"for"` — `<input>` 계열. `<label for>` 가 그대로 먹는다
   * - `"labelledby"` — `<div role="combobox">`·`<button>` 처럼 `for` 가 안 먹는 컨트롤
   * - `"none"` — 컨트롤이 자기 이름을 이미 갖고 있다 (`TxCheckBox` 의 `label`).
   *   캡션까지 이름으로 이으면 둘이 겹쳐 읽힌다
   */
  naming: "for" | "labelledby" | "none";
}

/**
 * **내부 전용.** 필드와 컨트롤 사이의 `id` · aria 배선을 한 자리에서 만든다.
 *
 * 원본에는 이 배선이 통째로 없었다 — 캡션은 `<div>` 라 컨트롤과 이어지지 않았고,
 * 에러는 화면에만 떠서 스크린리더에 닿지 않았다.
 */
export function useTxFormControl({ id, caption, warning, error, describedBy, invalid, naming }: ControlWiringParams) {
  const reactId = useId();
  const controlId = id ?? reactId;
  const captionId = `${controlId}-caption`;
  const messageId = `${controlId}-message`;

  const hasMessage = (error ?? warning) != null;
  const described = [describedBy, hasMessage ? messageId : undefined].filter(Boolean).join(" ");

  return {
    field: {
      caption,
      warning,
      error,
      messageId,
      captionId: caption != null ? captionId : undefined,
      htmlFor: naming === "for" ? controlId : undefined
    },
    control: {
      id: controlId,
      "aria-labelledby": naming === "labelledby" && caption != null ? captionId : undefined,
      "aria-describedby": described || undefined,
      // 소비자가 직접 준 값이 이긴다. 안 줬으면 error 의 유무가 정한다.
      "aria-invalid": invalid !== undefined ? invalid !== false && invalid !== "false" : error != null ? true : undefined
    }
  };
}
