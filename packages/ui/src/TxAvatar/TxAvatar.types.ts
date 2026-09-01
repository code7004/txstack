import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";

/** 크기 셋. 그 밖의 크기는 `--tx-avatar-size` 토큰으로 준다. */
export type TxAvatarSize = "sm" | "md" | "lg";

/** 모양. 기본은 동그라미다. */
export type TxAvatarShape = "circle" | "square";

export interface TxAvatarProps extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  /** 사진. **못 불러오면 이니셜로 떨어진다.** */
  src?: string;

  /**
   * 누구인가. **이니셜의 원본이자 스크린리더가 읽는 이름이다.**
   *
   * `alt` 를 따로 받지 않는다 — 사진이 떨어져도 읽히는 것이 바뀌지 않아야 한다.
   */
  name?: string;

  /**
   * 이니셜을 직접 준다. 안 주면 `name` 에서 만든다.
   *
   * 만드는 규칙은 둘이다 — 띄어 쓴 이름은 **덩어리마다 첫 글자**(`"Jaehoon Kim"` → `"JK"`),
   * 붙여 쓴 한글 이름은 **뒤 두 글자**(`"김재훈"` → `"재훈"`).
   */
  initials?: string;

  /** 사진도 이름도 없을 때 그릴 것. 기본은 사람 모양이다. */
  icon?: ReactNode;

  /** 크기. 기본 `"md"`. */
  size?: TxAvatarSize;

  /** 모양. 기본 `"circle"`. */
  shape?: TxAvatarShape;

  /** 주면 `<button>` 이 된다. 프로필을 여는 자리에 쓴다. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface TxAvatarGroupProps extends HTMLAttributes<HTMLElement> {
  /**
   * 아바타로 보여 줄 최대 개수. **넘치면 그 뒤에 `+2` 한 칸이 더 붙는다.**
   *
   * 안 주면 준 만큼 전부 보인다.
   */
  max?: number;

  /** `+2` 칸의 크기. **겹쳐 놓은 아바타들과 같은 값을 준다.** 기본 `"md"`. */
  size?: TxAvatarSize;
  /** `+2` 칸의 모양. 기본 `"circle"`. */
  shape?: TxAvatarShape;

  /** `+2` 를 스크린리더가 읽는 말. 기본은 `"외 2명"`. */
  moreLabel?: (rest: number) => string;

  children?: ReactNode;
}
