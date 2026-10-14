import { useEffect, useState } from "react";
import { parseApiError } from "@txstack/axios";
import { TxButton, TxCopyButton, TxDialog, TxModal, TxSkeleton, TxToast } from "@txstack/ui";
import { LOG_STATUSES, canRemove, logApi, type ErrorLogDetail } from "./logApi";

interface Props {
  /** 열 로그의 id. `null` 이면 닫힘 */
  id: string | null;
  onClose: () => void;
  onRemoved: () => void;
}

/** 로그 한 건의 상세. 목록에는 없는 스택 트레이스를 여기서 따로 불러옵니다 */
export function LogDetail({ id, onClose, onRemoved }: Props) {
  const [log, setLog] = useState<ErrorLogDetail>();

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLog(undefined);

    logApi
      .detail(id)
      .then((detail) => alive && setLog(detail))
      .catch((error) => TxToast.show({ variant: "danger", title: "상세를 불러오지 못했습니다", message: parseApiError(error).message }));

    return () => {
      alive = false;
    };
  }, [id]);

  const remove = async () => {
    if (!log) return;
    const yes = await TxDialog.confirm({ title: "로그를 지울까요?", message: `${log.id} · ${log.message}`, tone: "danger", confirmLabel: "삭제" });
    if (!yes) return;

    try {
      await logApi.remove(log.id);
      TxToast.show({ variant: "info", title: "지웠습니다", message: log.id });
      onRemoved();
    } catch (error) {
      TxToast.show({ variant: "danger", title: "지우지 못했습니다", message: parseApiError(error).message });
    }
  };

  const removable = log ? canRemove(log) : false;

  return (
    <TxModal open={id !== null} onClose={onClose} title={id ?? undefined} size="lg">
      {!log ? (
        <div className="flex flex-col gap-2">
          <TxSkeleton height="1.25rem" />
          <TxSkeleton height="8rem" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="font-semibold">{log.message}</p>

          <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-500 dark:text-slate-400">요청</dt>
            <dd className="font-mono">
              {log.method} {log.path} → {log.statusCode}
            </dd>
            <dt className="text-slate-500 dark:text-slate-400">상태</dt>
            <dd>{LOG_STATUSES.find((item) => item.value === log.status)?.name}</dd>
            <dt className="text-slate-500 dark:text-slate-400">담당</dt>
            <dd>{log.assignee ?? "—"}</dd>
            <dt className="text-slate-500 dark:text-slate-400">발생</dt>
            <dd>{new Date(log.createdAt).toLocaleString("ko-KR")}</dd>
          </dl>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">스택 트레이스</span>
              <TxCopyButton value={log.stack} label="복사" />
            </div>
            <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">{log.stack}</pre>
          </div>
        </div>
      )}

      <TxModal.Footer>
        {/* 지울 수 없을 때는 버튼을 막고 이유를 옆에 적습니다 */}
        {log && !removable && <span className="me-auto text-xs text-slate-500 dark:text-slate-400">해결됐고 30일이 지난 로그만 지울 수 있습니다</span>}
        <TxButton label="삭제" variant="danger" disabled={!removable} onClick={remove} />
        <TxButton label="닫기" variant="secondary" onClick={onClose} />
      </TxModal.Footer>
    </TxModal>
  );
}
