import { cm } from "../tx-ui.utils";
import type { TxCardFooterProps } from "./TxCard.types";

/**
 * 카드 아래에 붙는 줄. **위에 가는 선이 하나 그이고 카드 폭을 꽉 채운다.**
 *
 * 내용 안에 그냥 두면 된다 — 무엇이 푸터인지 자식을 뒤져 찾지 않는다.
 * (원본은 `displayName` 문자열로 자식을 훑어서, 조건부 렌더나 `memo` 로 한 겹만 감싸도
 * 못 찾고 엉뚱한 자리에 들어갔다.)
 *
 * @example
 * ```tsx
 * <TxCard title="파트너">
 *   <p>내용</p>
 *   <TxCard.Footer>마지막 수정 3분 전</TxCard.Footer>
 * </TxCard>
 * ```
 */
export const TxCardFooter = ({ className, ...props }: TxCardFooterProps) => <div {...props} className={cm("tx-card__footer", className)} data-tag="TxCard.Footer" />;
