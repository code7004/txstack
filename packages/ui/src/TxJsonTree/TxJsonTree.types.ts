import type { HTMLAttributes } from "react";

/** JSON 이 가질 수 있는 여섯 가지. */
export type TxJsonType = "string" | "number" | "boolean" | "null" | "object" | "array";

/** 값이 있는 자리. 객체는 키, 배열은 인덱스다 — 둘을 구분해서 담는다. */
export type TxJsonPath = (string | number)[];

/** 무엇이 어떻게 바뀌었나. `onChange` 의 둘째 인자로 온다. */
export interface TxJsonChange {
  /** `"edit"` 값 바꿈 · `"add"` 새 줄 · `"remove"` 줄 지움. */
  kind: "edit" | "add" | "remove";
  path: TxJsonPath;
  /** 바뀌기 전 값. `"add"` 에는 없다. */
  prev?: unknown;
  /** 바뀐 뒤 값. `"remove"` 에는 없다. */
  next?: unknown;
}

export interface TxJsonTreeProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 그릴 것. 어떤 값이든 온다 — 객체·배열·원시값 모두. */
  data: unknown;

  /**
   * 고쳤을 때. **주면 편집이 켜지고, 안 주면 읽기 전용이다.**
   *
   * 첫 인자는 **바뀐 것이 반영된 새 객체 전체**다. 원본을 건드리지 않으므로
   * `setData` 에 그대로 연결하면 된다 — 경로를 타고 들어가 불변으로 복사하는 일은
   * 이쪽이 맡는다. 둘째 인자로 무엇이 어떻게 바뀌었는지가 함께 온다.
   */
  onChange?: (next: unknown, change: TxJsonChange) => void;

  /**
   * `data` 가 바뀌면 **바뀐 줄이 잠깐 반짝인다.** 기본 `false`.
   *
   * 폴링하는 응답처럼 밖에서 계속 흘러 들어오는 값을 볼 때 쓴다. 이전 값과 비교해
   * 달라진 자리만 짚으므로, 큰 객체에서 무엇이 움직였는지가 눈에 든다.
   */
  watch?: boolean;

  /**
   * 처음에 이 깊이까지 펼친다. 기본은 전부 펼침.
   *
   * `0` 이면 맨 윗줄만 보이고 나머지는 접힌 채로 시작한다. 큰 응답을 볼 때 쓴다.
   */
  defaultExpandedDepth?: number;

  /** 키 이름을 번역한다. 값은 건드리지 않는다. */
  locale?: (key: string) => string;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { row?: string; key?: string; value?: string };
}
