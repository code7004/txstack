import { cm } from "../tx-ui.utils";
import type { TxFormFlexProps } from "./TxForm.types";

/**
 * 한 줄에 여럿을 나란히 놓는 자리. **자식이 남는 폭을 똑같이 나눠 갖는다.**
 *
 * 그게 `TxFlex` 와 다른 점이다 — 그쪽은 내용만큼만 차지한다. 여기서는 필드 둘을
 * 반씩, 버튼 둘을 반씩 놓는 것이 기본이라 자식마다 `flex-1` 을 적지 않아도 된다.
 *
 * @example
 * ```tsx
 * <TxForm.Flex>
 *   <TxForm.Input caption="시" />
 *   <TxForm.Input caption="분" />
 * </TxForm.Flex>
 * ```
 *
 * 폭을 나누고 싶지 않은 자식은 `className` 으로 되돌린다 — `<TxButton className="flex-none" />`.
 */
export const TxFormFlex = ({ className, ...props }: TxFormFlexProps) => <div {...props} className={cm("tx-form-flex", className)} data-tag="TxForm.Flex" />;
