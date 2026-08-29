import { cm } from "../tx-ui.utils";
import type { TxAlertActionsProps } from "./TxAlert.types";

/**
 * 알림 안의 버튼 줄. 본문 아래에 붙는다.
 *
 * @example
 * ```tsx
 * <TxAlert variant="warning" title="결제 수단이 곧 만료됩니다">
 *   9월 30일 이후에는 자동 결제가 중단됩니다.
 *   <TxAlert.Actions>
 *     <TxButton label="카드 변경" />
 *   </TxAlert.Actions>
 * </TxAlert>
 * ```
 */
export const TxAlertActions = ({ className, ...props }: TxAlertActionsProps) => <div {...props} data-tag="TxAlert.Actions" className={cm("tx-alert__actions", className)} />;
