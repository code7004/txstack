import { useEffect, useRef, useSyncExternalStore } from "react";
import { dismiss, getItems, getPosition, getServerItems, subscribe } from "./TxToast.store";
import { TxToastItem } from "./TxToastItem";

/**
 * **내부 전용.** 떠 있는 알림들을 담는 구석.
 *
 * ## 왜 popover 인가
 *
 * `TxModal` · `TxSlidePanel` 은 네이티브 `<dialog>` 라 **top layer** 에 올라간다.
 * 거기는 `z-index` 로는 닿을 수 없는 층이라, 모달이 떠 있는 동안 알림을 띄우면
 * **모달 뒤에 가려 보이지 않는다.** 저장 실패를 모달 안에서 알릴 때 그게 안 보이면
 * 알림이 아니다.
 *
 * `popover` 도 같은 top layer 를 쓴다. 그래서 이 통을 popover 로 열어 둔다 —
 * **`<dialog>` 와 같은 층에서 나중에 열린 쪽이 위**다.
 *
 * 그 API 가 없는 환경에서는 `--tx-toast-z` 로 물러선다. `TxModal` 이 `showModal` 이
 * 없을 때 속성으로 여는 것과 같은 방식이다.
 */
/**
 * 이 브라우저가 popover 를 아는가.
 *
 * **모르면 속성을 아예 달지 않는다.** 속성만 달고 API 가 없으면 UA 스타일이 통을
 * `display: none` 으로 숨겨 두는데 열 방법이 없어 **영영 안 보인다.** (jsdom 이 정확히
 * 그 상태다.) 이 호스트는 `createRoot` 로 클라이언트에서만 그려지므로 서버와 갈릴 일이 없다.
 */
const SUPPORTS_POPOVER = typeof HTMLElement !== "undefined" && "popover" in HTMLElement.prototype;

export function TxToastHost() {
  const items = useSyncExternalStore(subscribe, getItems, getServerItems);
  const position = useSyncExternalStore(subscribe, getPosition, getPosition);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || !SUPPORTS_POPOVER) return;

    // 빈 통이 top layer 에 남아 있을 이유가 없다
    try {
      host.togglePopover(items.length > 0);
    } catch {
      // 이미 그 상태면 브라우저가 거부한다. 우리가 바라던 상태이므로 넘어간다
    }
  }, [items.length]);

  return (
    <div
      ref={ref}
      data-tag="TxToast"
      data-position={position}
      className="tx-toast"
      // 스스로 열고 닫는다. 바깥을 눌렀다고 알림이 사라지면 안 된다
      popover={SUPPORTS_POPOVER ? "manual" : undefined}
    >
      {/* 아래 구석은 새 것이 아래에 붙어야 위로 밀려 올라가는 것으로 보인다 */}
      {(position.startsWith("bottom") ? items : [...items].reverse()).map((item) => (
        <TxToastItem key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </div>
  );
}
