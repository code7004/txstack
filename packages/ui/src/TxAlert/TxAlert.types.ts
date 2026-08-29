import type { HTMLAttributes, ReactNode } from "react";

/**
 * 알림의 갈래. **`TxToast` · `TxTag` 가 같은 어휘를 쓴다** —
 * 하나를 익히면 셋에 통한다.
 *
 * `info` 는 `--tx-color-primary` 를 쓴다. 브랜드색과 안내색을 가르고 싶은 자리가
 * 있지만, 그 요구가 오기 전에 전역 토큰을 늘리면 소비자가 챙길 것만 는다.
 */
export type TxAlertVariant = "info" | "success" | "warning" | "danger";

export interface TxAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 어떤 갈래인가. 기본 `"info"`. */
  variant?: TxAlertVariant;

  /** 굵은 첫 줄. 없으면 본문만 그린다. */
  title?: ReactNode;

  /**
   * 왼쪽 아이콘. 기본은 갈래마다 정해진 것이 붙는다.
   *
   * `false` 로 끄거나 다른 것으로 갈아끼운다. **색과 크기는 놓인 자리를 따라오므로**
   * 아이콘 쪽에서 정하지 않는다.
   */
  icon?: ReactNode | false;

  /**
   * 주면 오른쪽에 닫기 버튼이 생긴다. **안 주면 닫을 수 없다** —
   * 페이지에 박혀 있어야 하는 안내가 그 자리다.
   *
   * 사라지는 것은 소비자가 정한다. 이 콜백을 받고도 안 지우면 그대로 남는다.
   */
  onClose?: () => void;

  /** 닫기 버튼의 이름. 스크린리더가 읽는다. 기본 `"닫기"`. */
  closeLabel?: string;

  /**
   * **나타나는 순간 스크린리더가 읽는다.** 기본 `false`.
   *
   * 저장 결과처럼 **동작에 대한 답으로 새로 나타나는** 알림에만 켠다. 페이지에 처음부터
   * 있던 안내를 읽어 주면 읽는 흐름을 끊는다. 켜면 `danger` 는 즉시, 나머지는 하던 말이
   * 끝난 뒤에 읽힌다.
   */
  announce?: boolean;

  /**
   * 갈래를 알리는 글자. 화면에는 안 보이고 스크린리더만 읽는다.
   * 기본은 `안내` · `완료` · `주의` · `오류`.
   */
  variantLabel?: string;

  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { icon?: string; title?: string; body?: string };

  children?: ReactNode;
}

export type TxAlertActionsProps = HTMLAttributes<HTMLDivElement>;
