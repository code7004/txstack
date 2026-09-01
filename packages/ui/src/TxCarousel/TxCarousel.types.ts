import type { HTMLAttributes, ReactNode } from "react";

export interface TxCarouselProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /**
   * 한 화면에 몇 장을 보일지. 기본 `1`.
   *
   * `--tx-carousel-per-view` 토큰에 그대로 실린다 — **반응형이 필요하면 이 prop 대신
   * CSS 에서 그 토큰을 미디어 쿼리로 바꾼다**(인라인으로 실린 값이 이기기 때문이다).
   * 폭을 직접 정하고 싶으면(옆 장이 살짝 보이게 하는 식) `--tx-carousel-item` 을 준다.
   */
  perView?: number;

  /**
   * 끝에서 처음으로, 처음에서 끝으로 **돌아간다.** 기본 `false`.
   *
   * 기본이 `false` 인 이유는 **양 끝에서 잠기는 화살표가 어디쯤인지 알려 주기** 때문이다.
   * 켜면 화살표가 잠기지 않는다. 장을 복제하지 않으므로 **되감기는 것이 보인다.**
   */
  loop?: boolean;

  /**
   * 마우스로 끌어서 넘긴다. 기본 `true`.
   *
   * **손가락은 원래 된다** — 브라우저의 스크롤이라 스와이프가 공짜다. 이 옵션은 마우스에만
   * 해당한다. 4px 을 넘게 끌어야 시작하므로 **글자를 긁거나 누르는 것을 방해하지 않는다.**
   */
  drag?: boolean;

  /** 좌우 화살표를 그린다. 기본 `true`. **끝에서는 잠긴다** — `loop` 를 켜면 안 잠긴다. */
  arrows?: boolean;

  /** 아래 점을 그린다. 기본 `true`. 누르면 그 장으로 간다. */
  dots?: boolean;

  /**
   * 저절로 넘어간다. 기본 `false`.
   *
   * 켜면 **멈춤 버튼이 함께 생긴다** — 저절로 움직이는 것에는 멈출 수단이 있어야 한다
   * (WCAG 2.2.2). 얹거나 초점이 가도 멈추고, 움직임을 줄여 달라고 한 사람에게는
   * 멈춘 채로 시작한다. `TxTicker` 와 같은 규약이다.
   */
  autoPlay?: boolean;

  /** 저절로 넘어가는 간격(ms). 기본 `5000`. */
  interval?: number;

  /**
   * 멈춤 버튼을 **화면에 그린다.** 기본 `true`. `autoPlay` 일 때만 의미가 있다.
   *
   * `false` 여도 없어지지 않는다 — 화면에서만 감추고 초점이 오면 나타난다.
   */
  controls?: boolean;

  /** 지금 몇 번째인가. 밖에서 쥐면 controlled 다. */
  index?: number;
  /** 처음에 보여 줄 장. 기본 `0`. */
  defaultIndex?: number;
  /** 장이 바뀔 때마다. */
  onChange?: (index: number) => void;

  /** 스크린리더가 읽을 이름. 기본 `"슬라이드"`. */
  label?: string;
  /** 이전 버튼의 이름. 기본 `"이전"`. */
  prevLabel?: string;
  /** 다음 버튼의 이름. 기본 `"다음"`. */
  nextLabel?: string;
  /** 도는 중에 보이는 멈춤 버튼 이름. 기본 `"멈춤"`. */
  pauseLabel?: string;
  /** 멈춰 있을 때 보이는 버튼 이름. 기본 `"재생"`. */
  playLabel?: string;

  /** 장들. **자식 하나가 한 장이다.** */
  children?: ReactNode;
}
