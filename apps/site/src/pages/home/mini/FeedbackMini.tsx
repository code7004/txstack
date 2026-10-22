import { TxButton, TxDialog, TxToast } from "@txstack/ui";

export function FeedbackMini() {
  return (
    <div className="flex flex-wrap gap-2">
      <TxButton
        label="삭제 (확인 창)"
        variant="danger"
        onClick={async () => {
          const yes = await TxDialog.confirm({ title: "항목을 삭제할까요?", message: "샘플이라 실제로 지워지지는 않습니다.", tone: "danger", confirmLabel: "삭제" });
          TxToast.show(yes ? { variant: "info", title: "삭제했습니다" } : { title: "취소했습니다" });
        }}
      />
      <TxButton label="저장 (알림)" variant="secondary" onClick={() => void TxToast.show({ variant: "success", title: "저장했습니다" })} />
    </div>
  );
}
