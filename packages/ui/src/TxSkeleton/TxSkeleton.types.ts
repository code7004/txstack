import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

/** 어떤 모양의 자리를 잡아 두는가. */
export type TxSkeletonVariant = "text" | "circle" | "rect";

export interface TxSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 모양. 기본 `"text"`.
   *
   * **이것을 주면 자식에서 모양을 가져오지 않는다.** `lines` · `width` · `height` 도 같다.
   */
  variant?: TxSkeletonVariant;

  /**
   * 몇 줄인가. `variant="text"` 일 때만 쓴다. 기본 `1`.
   *
   * 두 줄 이상이면 **마지막 줄이 짧다** — 문단은 원래 그렇게 끝나므로,
   * 그래야 글이 올 자리처럼 보인다.
   *
   * **여러 줄로 감길 글**에는 이쪽을 쓴다. 자식에서 가져오는 방식은 한 요소당 한 줄이다.
   */
  lines?: number;

  /** 폭. 안 주면 `text` · `rect` 는 꽉 차고 `circle` 은 정해진 크기다. */
  width?: CSSProperties["width"];

  /** 높이. `rect` 의 크기를 정할 때 주로 쓴다. */
  height?: CSSProperties["height"];

  /**
   * 불러오는 중인가. 기본 `true`.
   *
   * **`false` 가 되면 `children` 을 그대로 낸다** — 껍데기를 남기지 않아서, 밖에서
   * 삼항으로 가르던 것과 결과가 같다. 불러오는 동안에는 `aria-busy` 를 스스로 붙인다.
   */
  loading?: boolean;

  /**
   * 다 불러온 뒤에 나올 것.
   *
   * **모양을 안 주면 이것에서 가져온다** — 값이 아직 없는 자리(빈 요소)만 회색으로 칠하므로,
   * 붙박이 글은 그대로 보이고 크기는 진짜 배치에서 나온다. 자식을 훑거나 재지 않는다.
   *
   * **JSX 는 삼항과 달리 먼저 평가된다.** 그래서 불러오는 동안에도 안전한 값이어야 한다 —
   * `user.name` 이 아니라 `user?.name` 이다. 값을 좁혀 쓰던 코드라면 밖에서 삼항으로
   * 가르는 편이 낫다.
   *
   * 가져오는 방식에는 걸리는 데가 셋 있다. **셋 다 회색 막대가 안 나올 뿐 배치는 멀쩡하다.**
   *
   * - `{user?.name ?? "—"}` 처럼 **대체값을 넣으면** 비어 있지 않아 안 칠해진다
   * - `<p> {name} </p>` 처럼 **공백이 끼면** 비어 있지 않아 안 칠해진다
   * - 한 요소당 **한 줄**이다. 여러 줄로 감길 글에는 `lines` 를 쓴다
   */
  children?: ReactNode;
}
