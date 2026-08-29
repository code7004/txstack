import type { HTMLAttributes, ReactNode } from "react";
import type { TxAlertVariant } from "../TxAlert";

/**
 * 갈래. **`TxAlert` · `TxToast` 의 넷을 그대로 물려받고 `neutral` 이 하나 더 있다.**
 *
 * 뱃지에는 **색이 뜻을 갖지 않는 라벨**이 흔하다 — 개수, 분류, 그냥 이름표.
 * 그런 자리에 `info`(브랜드색)를 쓰면 안 해도 될 강조가 붙는다.
 */
export type TxBadgeVariant = TxAlertVariant | "neutral";

/**
 * 칠하는 방식.
 *
 * `solid`(배경을 갈래색으로 꽉 채우는 것)는 **두지 않았다** — 갈래색이 라이트/다크에서
 * 밝기가 뒤집히는 것들이 있어(`success` · `warning`) 그 위에 얹을 글자색을 한 벌로는
 * 정할 수 없다. 자세한 것은 `docs/001_ui.md`.
 */
export type TxBadgeAppearance = "soft" | "outline";

export interface TxBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 어떤 갈래인가. 기본 `"neutral"`. */
  variant?: TxBadgeVariant;

  /** 칠하는 방식. 기본 `"soft"` — 옅은 바탕에 갈래색 글자다. */
  appearance?: TxBadgeAppearance;

  /** 글자 앞에 작은 점을 찍는다. 상태를 나타내는 뱃지에 쓴다. */
  dot?: boolean;

  children?: ReactNode;
}
