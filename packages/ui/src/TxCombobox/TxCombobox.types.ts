import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

/**
 * 객체로 주는 후보. **보이는 글자(`label`)와 고르면 오는 값(`value`)이 따로다** —
 * 그래서 글자가 같은 후보도 가를 수 있다.
 *
 * ```tsx
 * { value: "/api/axios#timeout", label: "timeout", description: "응답을 기다리는 최대 시간(ms)", hint: "axios" }
 * ```
 */
export interface TxComboboxOption {
  /** 고르면 `onPick` 으로 오는 값. */
  value: string;
  /** 목록과 입력란에 보이는 이름. 없으면 `value` 다. 기본 거르기도 이것을 본다. */
  label?: string;
  /** 이름 아래 작은 둘째 줄. */
  description?: ReactNode;
  /** 이름 오른쪽의 흐린 글자 — 위치 · 분류 같은 것. */
  hint?: ReactNode;
}

/** 후보 한 개 — 글자이거나 객체. */
export type TxComboboxItem = string | TxComboboxOption;

/**
 * **후보 타입에 대해 제네릭이다.** 글자 목록을 주면 `T` 가 `string` 이 되고, 객체를 주면 그 객체가 된다 —
 * `data` · `filter` · `onPick` 의 타입이 서로 맞는다.
 */
export interface TxComboboxProps<T extends TxComboboxItem = string> extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "type" | "list"> {
  /**
   * 후보 목록. 글자이거나 객체(`TxComboboxOption`)다.
   *
   * **입력란의 값은 언제나 글자다** — 목록에 없는 글자도 그대로 들어간다. 객체 후보를 골라도
   * 입력란에는 `label` 이 들어가고, `value` 는 `onPick` 으로만 온다.
   */
  data: readonly T[];
  value?: string;
  defaultValue?: string;
  /** 입력란의 글자가 바뀔 때마다. 목록에서 고르든 직접 치든 똑같이 온다. */
  onChangeText?: (value: string) => void;
  /**
   * **목록에서 골랐을 때만** 온다. 직접 친 것과 구분해야 할 때 쓴다.
   *
   * 글자 후보면 그 글자가, 객체 후보면 그 `value` 가 온다. 둘째 인자는 고른 후보 그대로다.
   */
  onPick?: (value: string, item: T) => void;
  /**
   * 후보를 걸러내는 규칙. 기본은 대소문자 무시 부분일치이고, 객체 후보는 `label` 을 본다.
   *
   * 초성 검색이나 다른 규칙이 필요하면 여기서 바꾼다. 서버에서 이미 걸러 온다면
   * `(data) => [...data]` 처럼 그대로 돌려주면 된다.
   */
  filter?: (data: readonly T[], keyword: string) => T[];
  /**
   * 한 번에 보여 줄 후보의 최대 개수. 기본은 제한 없이 전부 보여 주고 안에서 스크롤한다.
   *
   * 잘라내면 마지막에 몇 개가 더 있는지 알리는 줄이 붙는다 — 없으면 사용자가
   * 목록이 잘린 줄 모른다.
   */
  limit?: number;
  /** 잘렸을 때 붙는 안내. 기본 `"…n개 더 있습니다"`. */
  moreLabel?: (hidden: number) => string;
  /** 목록이 넘칠 때의 최대 높이. 기본 `"20rem"`. */
  maxHeight?: number | string;
  /** `className` 과 같은 자리에 붙는다. 토큰을 인라인으로 줄 때 쓴다. */
  style?: CSSProperties;
  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { field?: string; list?: string; item?: string };
}
