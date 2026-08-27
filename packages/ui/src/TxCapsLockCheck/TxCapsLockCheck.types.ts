import type { CSSProperties, ReactNode } from "react";

export interface TxCapsLockCheckProps {
  /** 감시할 입력창. 이 안에서 키를 누를 때만 반응한다. */
  children: ReactNode;

  /** 경고 문구. 번역이 필요하면 번역된 문자열을 그대로 준다. */
  text?: string;

  /** 문구 앞에 붙는 표시. 스크린리더는 읽지 않는다. `null` 을 주면 없앤다. */
  icon?: ReactNode;

  /**
   * 경고가 없을 때도 한 줄 높이를 잡아 둔다. 기본 `true`.
   *
   * 끄면 경고가 뜨고 사라질 때마다 아래 내용이 밀린다.
   */
  preserveSpace?: boolean;

  className?: string;
  /** `className` 과 같은 자리에 붙는다. 토큰을 인라인으로 줄 때 쓴다. */
  style?: CSSProperties;
  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { field?: string; message?: string };
}
