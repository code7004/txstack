import type { CSSProperties, ReactNode } from "react";

/** 목록 한 줄. `value` 를 생략하면 `name` 이 값이 된다. */
export interface TxDropdownItem<T = unknown> {
  name: string;
  value?: T;
}

/** 원시값 배열이나 `TxDropdownItem` 배열을 받는다. 섞어 써도 된다. */
export type TxDropdownData = readonly (string | number | boolean | undefined | TxDropdownItem<unknown>)[];

/** `data` 에서 값의 타입을 뽑아낸다. `[1, 2, 3]` 이면 `number` 다. */
export type TxDropdownValueOf<TData> = TData extends readonly (infer U)[] ? (U extends TxDropdownItem<infer V> ? V : U) : never;

/** 목록이 열렸을 때 한 줄을 직접 그리고 싶을 때 받는 정보. */
export interface TxDropdownItemRender<T = unknown> {
  item: TxDropdownItem<T>;
  /** 골라진 항목인가. */
  selected: boolean;
  /** 키보드로 짚고 있는 항목인가. */
  active: boolean;
  multiple: boolean;
}

interface TxDropdownCommon {
  /** 닫혀 있을 때 늘 이 글자를 보여 준다. 고른 값과 무관하다. */
  fixedHead?: string;
  /** 고른 것이 없을 때 보여 줄 글자. 기본 `"선택"`. */
  placeholder?: string;

  /** 목록 글자를 번역한다. 기본은 그대로 둔다. */
  locale?: (text: string) => string;
  /** 목록 한 줄을 직접 그린다. */
  renderItem?: (info: TxDropdownItemRender) => ReactNode;

  /** 목록이 넘칠 때의 최대 높이. 기본 `"20rem"`. */
  maxHeight?: number | string;

  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  /** `className` 과 같은 자리에 붙는다. 토큰을 인라인으로 줄 때 쓴다. */
  style?: CSSProperties;
  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { head?: string; list?: string; item?: string };
  "aria-label"?: string;
}

export interface TxDropdownProps<TData extends TxDropdownData = TxDropdownData> extends TxDropdownCommon {
  data: TData | undefined;
  /**
   * 고른 값. **prop 을 주면 controlled** 다.
   *
   * `undefined` 도 값으로 쓸 수 있다 — `value={undefined}` 를 명시하면 "값이 `undefined` 인 항목"
   * 이 골라진 것으로 본다. prop 자체를 생략한 것과 다르다.
   */
  value?: TxDropdownValueOf<TData>;
  /** 목록 맨 위에 "선택 안 함" 을 넣는다. 고르면 값이 `undefined` 로 간다. */
  addNoChoiceItem?: boolean;

  /** 고른 줄 전체. */
  onChangeValue?: (item: TxDropdownItem<TxDropdownValueOf<TData> | undefined>) => void;
  /** 고른 값이 문자열일 때. */
  onChangeText?: (value: string | undefined) => void;
  /** 고른 값이 숫자일 때. */
  onChangeNumber?: (value: number | undefined) => void;
  /** 고른 값이 참/거짓일 때. */
  onChangeBool?: (value: boolean | undefined) => void;
}

export interface TxDropdownMultiProps<TData extends TxDropdownData = TxDropdownData> extends TxDropdownCommon {
  data: TData | undefined;
  /** 고른 값들. **prop 을 주면 controlled** 다. */
  value?: TxDropdownValueOf<TData>[];
  /** 처음에 전부 골라 둔다. controlled 일 때는 무시된다. */
  defaultAllChecked?: boolean;

  onChangeValue?: (items: TxDropdownItem<TxDropdownValueOf<TData>>[]) => void;
  onChangeText?: (values: string[]) => void;
  onChangeNumber?: (values: number[]) => void;
  onChangeBool?: (values: boolean[]) => void;

  /**
   * **주면 "확인" 버튼이 생기고 `onChange*` 는 불리지 않는다.**
   *
   * 여러 개를 고르는 동안 값이 바뀔 때마다 서버를 치지 않으려는 자리에 쓴다.
   * 버튼을 누를 때 한 번만 온다.
   */
  onSubmitValue?: (items: TxDropdownItem<TxDropdownValueOf<TData>>[]) => void;
  onSubmitText?: (values: string[]) => void;
  onSubmitNumber?: (values: number[]) => void;
  onSubmitBool?: (values: boolean[]) => void;

  /** 확인 버튼의 글자. 기본 `"확인"`. */
  submitLabel?: string;
}
