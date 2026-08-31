import { useCallback, useEffect, useRef, useState } from "react";
import { TxButton } from "../TxButton";
import { cm } from "../tx-ui.utils";
import type { TxCopyButtonProps } from "./TxCopyButton.types";
import { writeToClipboard } from "./TxCopyButton.utils";

/**
 * 눌러서 글자를 복사하는 버튼.
 *
 * @example
 * ```tsx
 * <TxCopyButton value={apiKey} />
 * <TxCopyButton value={() => editor.getValue()} label="설정 복사" variant="secondary" />
 * ```
 *
 * **복사했는지 알려 준다.** 눌러도 아무 일이 없어 보이면 복사가 됐는지 알 길이 없다 —
 * 잠깐 글자가 바뀌고, 그 소식이 **스크린리더에도 간다.**
 *
 * 겉은 `TxButton` 이 그린다 — `variant` 도 그쪽 것을 그대로 쓴다.
 *
 * 명세: `docs/001_ui.md`
 */
export const TxCopyButton = ({ value, label = "복사", copiedLabel = "복사했습니다", failedLabel = "복사 실패", duration = 1500, onCopied, className, ...props }: TxCopyButtonProps) => {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const hdClick = useCallback(async () => {
    const text = typeof value === "function" ? value() : value;
    const ok = await writeToClipboard(text);

    setState(ok ? "copied" : "failed");
    if (ok) onCopied?.(text);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setState("idle"), duration);
  }, [value, duration, onCopied]);

  const text = state === "copied" ? copiedLabel : state === "failed" ? failedLabel : label;

  return (
    <>
      {/*
        `data-tag` 를 주지 않는다. `TxButton` 이 그것을 계약 속성으로 잠가 두어 밖에서 덮이지
        않으므로, 넘겨 봐야 조용히 버려진다. **이것은 버튼이 맞으니** 그 표시를 그대로 두고,
        여기 것은 `.tx-copy-button` 과 `data-state` 가 알린다.
      */}
      <TxButton {...props} data-state={state} className={cm("tx-copy-button", className)} label={text} onClick={hdClick} />

      {/*
        버튼의 글자가 바뀌는 것만으로는 스크린리더가 읽지 않는다 — 포커스가 그 위에
        있을 때만 다시 읽히고, 마우스로 눌렀다면 아무 소식이 없다. 그래서 따로 알린다.
      */}
      <span className="tx-copy-button__status" role="status" aria-live="polite">
        {state === "idle" ? "" : text}
      </span>
    </>
  );
};
