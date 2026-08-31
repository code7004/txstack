import { TxButton } from "../TxButton";
import { TxIconClose } from "../TxIcons";
import { TxProgress } from "../TxProgress";
import { cm } from "../tx-ui.utils";
import type { TxUploadItem } from "./TxFileUpload.types";
import { formatBytes } from "./TxFileUpload.utils";

export interface TxFileUploadItemProps {
  item: TxUploadItem;
  className?: string;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

const STATUS_TEXT: Record<TxUploadItem["status"], string> = {
  ready: "대기",
  uploading: "올리는 중",
  done: "완료",
  failed: "실패",
  canceled: "취소됨"
};

/**
 * **내부 전용.** 파일 한 줄.
 *
 * 진행률은 `TxProgress` 가 그린다 — 같은 것을 두 곳이 그리면 모양이 갈린다.
 */
export function TxFileUploadItem({ item, className, onRetry, onRemove }: TxFileUploadItemProps) {
  const failed = item.status === "failed";

  return (
    <li data-tag="TxFileUpload.Item" data-status={item.status} className={cm("tx-file-upload__item", className)}>
      <div className="tx-file-upload__info">
        <span className="tx-file-upload__name" title={item.file.name}>
          {item.file.name}
        </span>
        <span className="tx-file-upload__meta">
          {formatBytes(item.file.size)} · {failed ? (item.error ?? STATUS_TEXT.failed) : STATUS_TEXT[item.status]}
        </span>
      </div>

      {/* 올리는 동안에만 막대를 둔다. 끝난 뒤에도 두면 무엇을 기다리는지 헷갈린다 */}
      {item.status === "uploading" && <TxProgress className="tx-file-upload__progress" value={item.progress} label={`${item.file.name} 올리는 중`} />}

      <div className="tx-file-upload__actions">
        {/* **파일 단위로 다시 시도한다.** 하나가 실패했다고 다 올린 것까지 다시 보내지 않는다 */}
        {failed && <TxButton label="다시" variant="secondary" onClick={() => onRetry(item.id)} />}

        <button type="button" className="tx-file-upload__remove" aria-label={`${item.file.name} 빼기`} onClick={() => onRemove(item.id)}>
          <TxIconClose />
        </button>
      </div>
    </li>
  );
}
