import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import type { TxAlertVariant } from "../TxAlert";

/**
 * 갈래. **`TxAlert` · `TxToast` 의 넷을 그대로 물려받고 `neutral` 이 하나 더 있다.**
 *
 * 태그에는 **색이 뜻을 갖지 않는 라벨**이 흔하다 — 개수, 분류, 그냥 이름표.
 * 그런 자리에 `info`(브랜드색)를 쓰면 안 해도 될 강조가 붙는다.
 */
export type TxTagVariant = TxAlertVariant | "neutral";

/**
 * 칠하는 방식.
 *
 * `solid`(배경을 갈래색으로 꽉 채우는 것)는 **두지 않았다** — 갈래색이 라이트/다크에서
 * 밝기가 뒤집히는 것들이 있어(`success` · `warning`) 그 위에 얹을 글자색을 한 벌로는
 * 정할 수 없다. 자세한 것은 `docs/001_ui/029_TxTag.md`.
 */
export type TxTagAppearance = "soft" | "outline";

export interface TxTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "onClick"> {
  /** 어떤 갈래인가. 기본 `"neutral"`. */
  variant?: TxTagVariant;

  /** 칠하는 방식. 기본 `"soft"` — 옅은 바탕에 갈래색 글자다. */
  appearance?: TxTagAppearance;

  /** 글자 앞에 작은 점을 찍는다. 상태를 나타내는 태그에 쓴다. */
  dot?: boolean;

  /**
   * 주면 **글자가 눌리는 것**이 된다. 걸러내기 조건처럼 눌러서 쓰는 태그에 쓴다.
   *
   * 태그 전체가 아니라 글자만 버튼이 된다 — `onRemove` 와 함께 쓰면 지우기도 버튼이라
   * 통째로 감싸면 `<button>` 안의 `<button>` 이 된다.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>;

  /** 주면 오른쪽에 지우기(×) 버튼이 생긴다. */
  onRemove?: MouseEventHandler<HTMLButtonElement>;

  /** 지우기 버튼의 이름. 스크린리더가 읽는다. 기본 `"지우기"`. */
  removeLabel?: string;

  children?: ReactNode;
}
