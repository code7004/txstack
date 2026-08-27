import type { SVGProps } from "react";
import { cm } from "../tx-ui.utils";

export interface TxSpinnerProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** 크기. number 는 px 로 해석한다. 기본 `"1em"` — 부모 font-size 를 따른다 */
  size?: number | string;
  /** 장식용으로 쓸 때 켠다. `role`·`aria-label` 을 빼고 `aria-hidden` 을 붙인다 */
  decorative?: boolean;
}

/**
 * 로딩 중임을 알리는 회전 아이콘.
 *
 * 크기와 색을 **부모에게서 상속**받는다 — 기본값이 `1em` + `currentColor` 라
 * 버튼이나 문단 안에 넣으면 글자 크기·색에 저절로 맞는다.
 *
 * 문구·오버레이·표시 여부 판단은 이 컴포넌트가 하지 않는다 → `TxLoading`.
 *
 * @example
 * ```tsx
 * <TxSpinner />                                    // 상속에 맡긴다
 * <TxSpinner size={24} />                          // 크기만 지정
 * <TxSpinner decorative />                         // 옆에 읽을 문구가 이미 있을 때
 * ```
 *
 * 회전 속도는 CSS 변수로 바꾼다 — `.tx-spinner { --tx-spinner-duration: 2s }`.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxSpinner = ({ size = "1em", decorative = false, className, role, "aria-label": ariaLabel, ...props }: TxSpinnerProps) => {
  // 장식용인데 role="status" + aria-label 을 남겨두면 옆의 문구와 중복 안내된다.
  // (TxButton 처럼 버튼에 이미 label 이 붙어 있는 자리가 그렇다.)
  //
  // role·aria-label 을 따로 꺼내 두는 이유: 장식용일 때는 소비자가 준 값이라도 **버려야** 한다.
  // aria-hidden 요소에 남은 라벨은 읽히지도 않으면서 마크업만 어지럽히고, 명세와도 어긋난다.
  const a11y: SVGProps<SVGSVGElement> = decorative ? { "aria-hidden": true } : { role: role ?? "status", "aria-label": ariaLabel ?? "Loading" };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      data-tag="TxSpinner"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      // 회전과 모션 저감 처리는 TxSpinner.css 가 한다. 여기서는 클래스만 건다.
      className={cm("tx-spinner", className)}
      {...props}
      {...a11y}
    >
      <path
        fill="currentColor"
        d="M12 2.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75M7.125 3.556a.75.75 0 0 1 1.025.275l1.5 2.598a.75.75 0 1 1-1.3.75L6.85 4.58a.75.75 0 0 1 .275-1.025m-3.569 3.57a.75.75 0 0 1 1.025-.275l2.598 1.5a.75.75 0 0 1-.75 1.3L3.83 8.15a.75.75 0 0 1-.275-1.025M2.25 12a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75m15 0a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75m-9.797 2.625a.75.75 0 0 1-.274 1.024l-2.598 1.5a.75.75 0 0 1-.75-1.299l2.598-1.5a.75.75 0 0 1 1.024.275m9.094 0a.75.75 0 0 1 1.024-.275l2.598 1.5a.75.75 0 1 1-.75 1.3l-2.598-1.5a.75.75 0 0 1-.274-1.025m-1.922 1.922a.75.75 0 0 1 1.024.274l1.5 2.598a.75.75 0 0 1-1.299.75l-1.5-2.598a.75.75 0 0 1 .275-1.024m-5.25 0a.75.75 0 0 1 .275 1.024l-1.5 2.598a.75.75 0 0 1-1.3-.75l1.5-2.598a.75.75 0 0 1 1.025-.274M12 17.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75"
      ></path>
    </svg>
  );
};
