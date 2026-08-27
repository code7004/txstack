import type { CSSProperties, ReactNode } from "react";

/** `[시작, 끝]`. 아직 안 골랐으면 `undefined` 다. */
export type TxDateRange = [Date | undefined, Date | undefined];

interface TxDayPickerCommon {
  /** 고른 것이 없을 때 보여 줄 글자. */
  placeholder?: string;
  /** 보여 줄 형식. `YYYY` `YY` `MM` `DD` `HH` `mm` `ss` 를 쓴다. 기본 `"YYYY-MM-DD"`. */
  format?: string;
  disabled?: boolean;

  className?: string;
  /** `className` 과 같은 자리에 붙는다. 토큰을 인라인으로 줄 때 쓴다. */
  style?: CSSProperties;

  /** 트리거 버튼의 `id`. 바깥 캡션이 `aria-labelledby` 로 가리킬 때 필요하다. */
  id?: string;
  /**
   * 껍데기가 `<button>` 이라 이름은 aria 로 붙인다.
   * 캡션을 밖에서 그려 주는 쪽(`TxFormDayPicker`)은 `aria-labelledby` 를 쓴다.
   */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export interface TxDayPickerProps extends TxDayPickerCommon {
  value?: Date;
  defaultValue?: Date;
  /** 고른 날짜. 그날 00:00 으로 맞춰서 준다. */
  onChange?: (date: Date | undefined) => void;

  /** 고른 뒤에도 달력을 열어 둔다. 기본 `false`. */
  keepOpen?: boolean;
}

export interface TxDayPickerRangeProps extends TxDayPickerCommon {
  value?: TxDateRange;
  defaultValue?: TxDateRange;

  /** 기간이 정해질 때마다. 시작은 00:00, 끝은 23:59:59.999 로 맞춰서 준다. */
  onChange?: (range: TxDateRange) => void;
  /** 같은 값을 밀리초로. `onChange` 와 함께 불린다. */
  onChangeNums?: (range: [number | undefined, number | undefined]) => void;

  /**
   * **주면 "확인" 버튼이 생기고 `onChange*` 는 불리지 않는다.**
   *
   * 기간을 고치는 동안 값이 바뀔 때마다 서버를 치지 않으려는 자리에 쓴다.
   * 확인하지 않고 닫으면 열기 전 상태로 되돌아간다.
   */
  onSubmit?: (range: TxDateRange) => void;
  onSubmitNums?: (range: [number | undefined, number | undefined]) => void;
  /** 확인 버튼의 글자. 기본 `"확인"`. */
  submitLabel?: string;

  /**
   * 고를 수 있는 최대 일수.
   *
   * 시작일을 고르면 **범위를 넘는 날짜는 아예 눌리지 않는다.** 원본은 고르고 나서
   * `alert()` 로 알리고 값을 보정했는데, 브라우저 모달로 흐름을 끊는 데다 문구를 바꿀 수도
   * 없었다. 못 고르게 하는 편이 알리는 것보다 낫다.
   */
  maxDays?: number;

  /** 달력 위에 넣을 것. "최근 7일" 같은 버튼을 두는 자리다 — `ref` 로 값을 넣는다. */
  header?: ReactNode;
  /** 달력 아래에 넣을 것. */
  footer?: ReactNode;

  /** 한 번에 보여 줄 달의 수. 기본 `2`. */
  numberOfMonths?: number;
  /** 고른 뒤에도 달력을 열어 둔다. 기본 `true` — 기간은 두 번 눌러야 정해지기 때문이다. */
  keepOpen?: boolean;
}

export interface TxDayPickerRangeRef {
  getValue: () => TxDateRange;
  /** 기간을 넣는다. `header` 의 프리셋 버튼이 이걸 부른다. */
  setValue: (range: TxDateRange) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}
