import { useSyncExternalStore } from "react";
import { TxButton } from "../TxButton";
import { TxModal } from "../TxModal";
import { getCurrent, getLabels, getServerCurrent, settle, subscribe } from "./TxDialog.store";

/**
 * **내부 전용.** 줄의 맨 앞 요청을 그린다.
 *
 * `TxModal` 을 그대로 쓴다 — 포커스 트랩 · Escape 가 이미 거기서 해결돼 있다.
 * 여기서 더하는 것은 **버튼 두 개와 그 답을 약속으로 돌려보내는 일**뿐이다.
 */
export function TxDialogHost() {
  /*
    바깥 클릭으로 닫지 않고, 오른쪽 위 X 도 없다. 네이티브 alert · confirm 이 그렇듯
    답하기 전에는 닫히지 않는다 — 바깥을 잘못 누른 것이 "취소를 골랐다" 가 되면 그건 답이 아니다.
    X 도 마찬가지다. 취소 버튼이 이미 있는데 같은 뜻의 길이 둘이면 답이 둘로 보인다.
  */
  const current = useSyncExternalStore(subscribe, getCurrent, getServerCurrent);
  const labels = getLabels();

  const options = current?.options ?? {};
  const isConfirm = current?.kind === "confirm";

  /** Escape. **`confirm` 에서는 취소로 친다.** */
  const close = () => {
    if (current) settle(current.id, false);
  };

  return (
    <TxModal open={current !== null} onClose={close} title={options.title} size={options.size} closeOnBackdrop={false} hideCloseButton className="tx-dialog">
      {/* 줄바꿈을 그대로 보인다. 네이티브 confirm 과 같다 */}
      <div className="tx-dialog__message">{options.message}</div>

      <TxModal.Footer>
        {isConfirm && <TxButton label={options.cancelLabel ?? labels.cancel} variant="secondary" onClick={close} />}
        <TxButton
          label={options.confirmLabel ?? labels.confirm}
          variant={options.tone === "danger" ? "danger" : "primary"}
          // 열리자마자 Enter 로 답할 수 있게 확인에 포커스를 둔다
          autoFocus
          onClick={() => {
            if (current) settle(current.id, true);
          }}
        />
      </TxModal.Footer>
    </TxModal>
  );
}
