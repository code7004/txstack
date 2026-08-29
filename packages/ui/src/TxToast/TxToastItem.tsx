import { useCallback, useEffect, useRef, useState } from "react";
import { TxAlert } from "../TxAlert";
import type { TxToastItem as Item } from "./TxToast.store";

export interface TxToastItemProps {
  item: Item;
  onDismiss: (id: number) => void;
}

/**
 * **내부 전용.** 알림 하나와 그 시계.
 *
 * 겉은 `TxAlert` 이 그대로 그린다 — 갈래별 색·아이콘·스크린리더용 글자가 거기 있다.
 * 여기서 더하는 것은 **스스로 사라지는 것과, 그것을 멈추는 것**뿐이다.
 */
export function TxToastItem({ item, onDismiss }: TxToastItemProps) {
  const [paused, setPaused] = useState(false);
  /** 남은 시간. 멈췄다 다시 갈 때 처음부터 세지 않으려고 들고 있는다. */
  const leftRef = useRef(item.duration);
  const startedRef = useRef(0);

  const dismiss = useCallback(() => onDismiss(item.id), [onDismiss, item.id]);

  /**
   * **멈출 수 있어야 한다.** 읽는 데 걸리는 시간은 사람마다 다르고, 시간이 정해진 것을
   * 늘리거나 끌 길이 없으면 못 읽고 놓친다 (WCAG 2.2.1). 마우스를 얹거나 **키보드로
   * 안에 들어오면** 멈춘다 — 마우스만 보면 키보드 사용자는 멈출 방법이 없다.
   */
  useEffect(() => {
    if (item.duration <= 0 || paused) return;

    startedRef.current = Date.now();
    const timer = setTimeout(dismiss, leftRef.current);

    return () => {
      clearTimeout(timer);
      leftRef.current = Math.max(0, leftRef.current - (Date.now() - startedRef.current));
    };
  }, [item.duration, paused, dismiss]);

  return (
    <div
      className="tx-toast__item"
      data-tag="TxToast.Item"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* 떴다 사라지는 것이라 나타나는 순간 읽혀야 한다. 갈래에 따라 즉시/나중이 갈린다 */}
      <TxAlert announce variant={item.variant} title={item.title} closeLabel={item.closeLabel ?? "닫기"} onClose={dismiss}>
        {item.message}
      </TxAlert>
    </div>
  );
}
