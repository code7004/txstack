import { cm } from "../tx-ui.utils";
import type { TxModalFooterProps } from "./TxModal.types";

/**
 * 모달 아래의 버튼 줄. **오른쪽으로 모인다** — 확인·취소가 앉는 자리다.
 *
 * 없으면 그리지 않는다. 안내만 띄우는 모달에는 버튼 줄이 필요 없다.
 *
 * @example
 * ```tsx
 * <TxModal.Footer>
 *   <TxButton label="취소" variant="secondary" onClick={close} />
 *   <TxButton label="저장" onClick={save} />
 * </TxModal.Footer>
 * ```
 */
export const TxModalFooter = ({ className, ...props }: TxModalFooterProps) => <div {...props} className={cm("tx-modal__footer", className)} data-tag="TxModal.Footer" />;
