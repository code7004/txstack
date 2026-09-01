import { useEffect, useLayoutEffect, useState, type Dispatch, type RefObject, type SetStateAction } from "react";

/**
 * **내부 전용. 움직임을 줄여 달라고 한 사람에게는 멈춘 채로 시작한다.**
 *
 * `useLayoutEffect` 로 잡는다 — 그려지기 전에 멈춰야 한 프레임도 움직이지 않는다.
 * 서버에는 `matchMedia` 가 없으므로 그쪽에서는 "도는 상태" 로 두고 클라이언트에서 고친다.
 *
 * **되돌리지는 않는다.** 설정을 끄면 그때부터 도는 것이 아니라, 사람이 재생을 누를 때
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

/**
 * **내부 전용. 흐르는 데 걸리는 시간을 잰 폭에서 낸다.**
 *
 * 항목이 늘면 그만큼 오래 걸려야 **읽는 속도가 그대로**다. 시간을 고정으로 받으면
 * 항목이 둘일 때와 열일 때의 속도가 달라진다.
 *
 * 폭을 못 재는 자리(서버 · `ResizeObserver` 가 없는 환경)에서는 `undefined` 를 준다.
 * 그때는 CSS 의 기본값이 쓰인다.
 */
export function useFlowDuration(ref: RefObject<HTMLElement | null>, speed: number, enabled: boolean) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => setWidth(node.scrollWidth));
    observer.observe(node);
    setWidth(node.scrollWidth);

    return () => observer.disconnect();
  }, [ref, enabled]);

  if (!width || speed <= 0) return undefined;
  return `${width / speed}s`;
}

/**
 * **내부 전용. 한 줄이 미끄러지는 데 걸리는 시간(ms).**
 *
 * 시간은 CSS 토큰(`--tx-ticker-slide`)이 쥐므로 잰다. 잴 수 없거나 전이가 꺼져 있으면
 * `0` 이다 — 그때는 기다리지 않고 바로 넘어간다.
 */
export function slideMs(node: HTMLElement | null): number {
  if (!node || typeof getComputedStyle !== "function") return 0;

  const [first = ""] = getComputedStyle(node).transitionDuration.split(",");
  const seconds = Number.parseFloat(first);

  return Number.isFinite(seconds) ? seconds * 1000 : 0;
}
