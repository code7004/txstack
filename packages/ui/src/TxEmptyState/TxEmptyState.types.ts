import type { HTMLAttributes, ReactNode } from "react";

/**
 * 왜 비었는가. **넷을 가르는 것이 이 컴포넌트의 요지다** —
 * "없음" 이라고만 하면 사용자가 다음에 무엇을 할지 알 수 없다.
 */
export type TxEmptyStateVariant =
  /** 아직 하나도 만들지 않았다. 만들라고 권할 자리다. */
  | "no-data"
  /** 찾았지만 안 나왔다. 조건을 고치라고 할 자리다. */
  | "no-result"
  /** 불러오다 실패했다. 다시 시도할 자리다. */
  | "error"
  /** 볼 권한이 없다. 요청하거나 돌아갈 자리다. */
  | "no-permission";

export interface TxEmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 왜 비었는가. 기본 `"no-data"`. */
  variant?: TxEmptyStateVariant;

  /** 굵은 한 줄. 안 주면 갈래마다 정해진 기본 문구가 나온다. **`null` 이면 그 줄이 없다.** */
  title?: ReactNode;

  /** 그 아래 설명. 안 주면 갈래마다 정해진 기본 문구가 나온다. **`null` 이면 그 줄이 없다.** */
  description?: ReactNode;

  /**
   * 위쪽 그림. 기본은 갈래마다 정해진 것이 붙는다.
   *
   * `false` 로 끄거나 다른 것으로 갈아끼운다. 색과 크기는 놓인 자리를 따라온다.
   */
  icon?: ReactNode | false;

  /** 아래에 붙는 버튼 줄. */
  children?: ReactNode;
}
