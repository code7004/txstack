import { useLayoutEffect, type Dispatch, type SetStateAction } from "react";

/**
 * **내부 전용. 움직임을 줄여 달라고 한 사람에게는 멈춘 채로 시작한다.**
 *
 * 저절로 움직이는 부품이 둘 이상이라 규약을 한 곳에 둔다 — `TxTicker` · `TxCarousel`.
 *
 * `useLayoutEffect` 로 잡는다. 그려지기 전에 멈춰야 **한 프레임도 움직이지 않는다.**
 * 서버에는 `matchMedia` 가 없으므로 그쪽에서는 "도는 상태" 로 두고 클라이언트에서 고친다.
 *
 * **되돌리지는 않는다.** 설정을 끄면 그때부터 도는 것이 아니라 사람이 재생을 누를 때
 * 돈다 — 손으로 멈춘 것을 설정 변경이 덮으면 안 된다.
 */
export function usePauseWhenReduced(setRunning: Dispatch<SetStateAction<boolean>>) {
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => query.matches && setRunning(false);

    apply();
    query.addEventListener("change", apply);

    return () => query.removeEventListener("change", apply);
  }, [setRunning]);
}

/** 움직임을 줄여 달라고 했는가. **지금 이 순간**을 묻는 자리에 쓴다 (스크롤 방식 고르기 등). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
