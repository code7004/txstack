import type { KeyboardEvent, ReactNode } from "react";
import { cm } from "../tx-ui.utils";
import { TxIconClose } from "../TxIcons";

export interface TxInputLikeProps {
  value?: string;
  placeholder?: string;
  className?: string;

  onClick?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  /** 주면 값이 있을 때 지우기 버튼이 나온다. */
  onClear?: () => void;

  /** 트리거 버튼의 `id`. 바깥의 캡션이 `aria-labelledby` 로 가리킬 때 필요하다. */
  id?: string;
  ariaLabel?: string;
  /** 이름을 밖에서 그려 줄 때. `TxForm.DayPicker` 의 캡션이 쓴다. */
  ariaLabelledBy?: string;
  /** 설명(에러·안내)을 밖에서 그려 줄 때. */
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  /**
   * 열림 상태. **부모가 준다.**
   *
   * 원본은 `aria-expanded={false}` 를 하드코딩했다. 열려 있어도 항상 `false` 라
   * 스크린리더가 틀린 상태를 들었다. 여는 쪽만이 이걸 안다.
   */
  ariaExpanded?: boolean;
  /** 눌렀을 때 뜨는 것의 종류. 기본 `"dialog"` — 지금 쓰는 곳이 달력이라서다. */
  ariaHasPopup?: "listbox" | "menu" | "dialog" | "tree" | "grid";
  /** 뜨는 것의 `id`. 스크린리더가 둘을 이어 준다. */
  ariaControls?: string;

  children?: ReactNode;
}

/**
 * **내부 전용. 배럴에서 내보내지 않는다.**
 *
 * 입력창처럼 생겼지만 실제로는 버튼인 자리. **지금 쓰는 곳은 `TxDayPicker` 와 `TxDayPickerRange`** 로,
 * 닫혀 있을 때 고른 날짜를 보여 주는 껍데기다.
 *
 * 값을 직접 타이핑하지 않고 눌러서 고르는 자리라, `<input>` 대신 `<button>` 이어야
 * 스크린리더가 "누르면 무언가 뜬다" 를 읽어 준다.
 *
 * **`aria-expanded` 를 하드코딩하지 않는다.** 여는 쪽이 상태를 주입한다.
 * 공개하지 않는 이유도 이것이다 — 열림 상태를 모르는 소비자가 쓰면 접근성이 거짓이 된다.
 * 필요해지면 `TxDayPicker` 를 옮길 때 다시 판단한다.
 *
 * 겉모습은 `.tx-input` 을 그대로 쓴다. 껍데기가 같아야 입력창과 나란히 놓았을 때 줄이 맞는다.
 *
 * 명세: `docs/001_ui/006_TxInput.md`
 */
export function TxInputLike({ id, value, placeholder = "", className, onClick, onKeyDown, onClear, ariaLabel, ariaLabelledBy, ariaDescribedBy, ariaInvalid, ariaExpanded, ariaHasPopup = "dialog", ariaControls, children }: TxInputLikeProps) {
  const hasValue = Boolean(value);

  return (
    /*
      지우기 버튼을 트리거 안에 넣지 않는다. 버튼 안에 버튼은 유효하지 않은 마크업이고,
      원본처럼 SVG 에 onClick 을 걸면 키보드로 도달할 수 없다. 형제로 나란히 둔다.
    */
    <div data-tag="TxInputLike" data-empty={hasValue ? undefined : ""} className={cm("tx-input", "tx-input-like", className)}>
      <button
        type="button"
        id={id}
        className="tx-input-like__trigger"
        onClick={onClick}
        onKeyDown={onKeyDown}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-haspopup={ariaHasPopup}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
      >
        <span className="tx-input-like__value">{children ?? (hasValue ? value : placeholder)}</span>
      </button>

      {onClear && hasValue && (
        <button type="button" className="tx-input-like__clear" onClick={onClear} aria-label="지우기">
          <TxIconClose />
        </button>
      )}
    </div>
  );
}
