import { cm } from "../tx-ui.utils";
import type { TxFormLabelProps } from "./TxForm.types";

/**
 * 손수 짜는 줄의 라벨. **필드를 쓰면 `caption` 이 이 일을 대신한다.**
 *
 * `htmlFor` 로 컨트롤과 잇는다 — 안 이으면 스크린리더에게는 그냥 지나가는 글자다.
 * 폼에 `labelWidth` 가 있으면 그 너비로 맞춰진다.
 *
 * @example
 * ```tsx
 * <TxForm.Flex>
 *   <TxForm.Label htmlFor="port">포트</TxForm.Label>
 *   <TxInput id="port" type="number" />
 * </TxForm.Flex>
 * ```
 */
export const TxFormLabel = ({ className, ...props }: TxFormLabelProps) => <label {...props} className={cm("tx-form-label", className)} data-tag="TxForm.Label" />;
