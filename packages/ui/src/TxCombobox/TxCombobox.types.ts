import type { CSSProperties, InputHTMLAttributes } from "react";

export interface TxComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "type" | "list"> {
  /** 후보 목록. **값은 보이는 글자 그 자체다** — 자유입력이라 따로 코드값을 두지 않는다. */
  data: readonly string[];

  value?: string;
  defaultValue?: string;
  /** 값이 바뀔 때마다. 목록에서 고르든 직접 치든 똑같이 온다. */
  onChangeText?: (value: string) => void;
  /** **목록에서 골랐을 때만** 온다. 직접 친 것과 구분해야 할 때 쓴다. */
  onPick?: (value: string) => void;

  /**
   * 후보를 걸러내는 규칙. 기본은 대소문자 무시 부분일치다.
   *
   * 초성 검색이나 다른 규칙이 필요하면 여기서 바꾼다. 서버에서 이미 걸러 온다면
   * `(data) => [...data]` 처럼 그대로 돌려주면 된다.
   */
  filter?: (data: readonly string[], keyword: string) => string[];

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
