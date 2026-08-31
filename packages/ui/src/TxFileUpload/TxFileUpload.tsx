import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { cm } from "../tx-ui.utils";
import type { TxFileUploadProps, TxUploadItem } from "./TxFileUpload.types";
import { TxFileUploadItem } from "./TxFileUploadItem";
import { formatBytes, nextUploadId } from "./TxFileUpload.utils";

/**
 * 파일을 골라 올리는 자리.
 *
 * @example
 * ```tsx
 * <TxFileUpload
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024}
 *   uploader={async (file, { onProgress, signal }) => {
 *     await api.upload(file, { onUploadProgress: (e) => onProgress(e.progress * 100), signal });
 *   }}
 * />
 * ```
 *
 * **어디로 어떻게 보내는지 모른다.** 주소도 헤더도 응답 봉투도 앱의 것이라 `uploader` 로
 * 주입받는다 — 그것을 패키지가 정하면 그 규약을 쓰는 앱에서만 쓸 수 있다.
 *
 * **다시 시도는 파일 단위다.** 열 개 중 하나가 실패했다고 다 올린 아홉을 또 보내지 않는다.
 *
 * **끌어다 놓기와 눌러서 고르기가 둘 다 된다.** 숨긴 `<input type="file">` 을 함께 두는
 * 것이 그 때문이다 — 끌어다 놓기만 두면 키보드로는 파일을 고를 길이 없다.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxFileUpload = ({ uploader, accept, multiple = true, maxSize, maxFiles, disabled = false, onChange, className, classNames, children, ...props }: TxFileUploadProps) => {
  const [items, setItems] = useState<TxUploadItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  /** 파일마다의 취소 손잡이. 줄을 빼면 올리던 것도 끊는다 */
  const abortsRef = useRef(new Map<string, AbortController>());

  useEffect(() => {
    const aborts = abortsRef.current;
    // 화면에서 사라지는데 요청이 살아 있으면 응답이 허공에 떨어진다
    return () => aborts.forEach((controller) => controller.abort());
  }, []);

  const patch = useCallback(
    (id: string, next: Partial<TxUploadItem>) => {
      setItems((current) => {
        const updated = current.map((item) => (item.id === id ? { ...item, ...next } : item));
        onChange?.(updated);
        return updated;
      });
    },
    [onChange]
  );

  const run = useCallback(
    async (item: TxUploadItem) => {
      if (!uploader) return;

      const controller = new AbortController();
      abortsRef.current.set(item.id, controller);
      patch(item.id, { status: "uploading", progress: 0, error: undefined });

      try {
        await uploader(item.file, {
          onProgress: (percent) => patch(item.id, { progress: Math.min(Math.max(percent, 0), 100) }),
          signal: controller.signal
        });

        // 뺀 줄의 응답이 늦게 오면 없는 줄을 고치게 된다
        if (!controller.signal.aborted) patch(item.id, { status: "done", progress: 100 });
      } catch (error) {
        if (controller.signal.aborted) return;
        patch(item.id, { status: "failed", error: error instanceof Error ? error.message : undefined });
      } finally {
        abortsRef.current.delete(item.id);
      }
    },
    [uploader, patch]
  );

  const accepted = useCallback(
    (files: File[]) => {
      const room = maxFiles == null ? files.length : Math.max(0, maxFiles - items.length);

      return files.slice(0, room).map<TxUploadItem>((file) => {
        // 크기는 **고르는 순간** 본다. 올려 보고 나서 알려 주면 그동안 기다린 것이 헛수고다
        const tooBig = maxSize != null && file.size > maxSize;

        return {
          id: nextUploadId(),
          file,
          status: tooBig ? "failed" : "ready",
          progress: 0,
          error: tooBig ? `${formatBytes(maxSize)} 까지 올릴 수 있습니다` : undefined
        };
      });
    },
    [items.length, maxFiles, maxSize]
  );

  const add = useCallback(
    (files: File[]) => {
      const next = accepted(files);
      if (next.length === 0) return;

      setItems((current) => {
        const updated = [...current, ...next];
        onChange?.(updated);
        return updated;
      });

      next.filter((item) => item.status === "ready").forEach(run);
    },
    [accepted, onChange, run]
  );

  const remove = useCallback(
    (id: string) => {
      abortsRef.current.get(id)?.abort();
      abortsRef.current.delete(id);

      setItems((current) => {
        const updated = current.filter((item) => item.id !== id);
        onChange?.(updated);
        return updated;
      });
    },
    [onChange]
  );

  const retry = useCallback(
    (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (item) void run(item);
    },
    [items, run]
  );

  const hdInput = (evt: ChangeEvent<HTMLInputElement>) => {
    add([...(evt.target.files ?? [])]);
    // 같은 파일을 다시 골라도 change 가 오게 비운다
    evt.target.value = "";
  };

  const hdDrop = (evt: DragEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setDragging(false);
    if (disabled) return;

    add([...evt.dataTransfer.files]);
  };

  return (
    <div {...props} data-tag="TxFileUpload" data-disabled={disabled ? "" : undefined} className={cm("tx-file-upload", className)}>
      {/*
        **끌어다 놓는 자리이자 누르는 버튼이다.** 끌어다 놓기만 두면 키보드로는 파일을
        고를 길이 없어서, 진짜 `<button>` 으로 두고 숨긴 `<input>` 을 대신 누른다.
      */}
      <button
        type="button"
        className={cm("tx-file-upload__dropzone", classNames?.dropzone)}
        data-dragging={dragging ? "" : undefined}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(evt) => {
          evt.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={hdDrop}
      >
        {children ?? (
          <>
            <span className="tx-file-upload__hint">파일을 끌어다 놓거나 눌러서 고르세요</span>
            {accept != null && <span className="tx-file-upload__accept">{accept}</span>}
            {maxSize != null && <span className="tx-file-upload__accept">최대 {formatBytes(maxSize)}</span>}
          </>
        )}
      </button>

      {/*
        진짜 `<input type="file">` 이다. 눈에서만 지운다 — `display: none` 이면
        `<form>` 제출에 안 실리고, 파일 고르기 창을 여는 표준 길도 잃는다.
      */}
      <input ref={inputRef} type="file" className="tx-file-upload__input" accept={accept} multiple={multiple} disabled={disabled} tabIndex={-1} onChange={hdInput} />

      {items.length > 0 && (
        <ul className={cm("tx-file-upload__list", classNames?.list)}>
          {items.map((item) => (
            <TxFileUploadItem key={item.id} item={item} className={classNames?.item} onRetry={retry} onRemove={remove} />
          ))}
        </ul>
      )}
    </div>
  );
};
