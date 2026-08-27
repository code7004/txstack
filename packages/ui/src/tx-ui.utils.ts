import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스 문자열을 합친다. 모든 컴포넌트가 `cm("tx-*", className)` 형태로 쓴다 —
 * **기본 클래스를 교체하지 않고 덧붙이는** 것이 계약이다.
 *
 * `twMerge` 는 소비자가 준 Tailwind 유틸리티끼리의 충돌만 정리한다. 우리 클래스(`tx-*`)는
 * Tailwind 가 모르는 이름이라 그대로 통과한다 — **소비자 `className` 이 이기는 것은
 * `twMerge` 가 아니라 `@layer tx` 덕분이다.**
 *
 * 그래서 `tailwind-merge` 를 계속 들고 갈지는 열려 있다. Tailwind 를 안 쓰는 소비자에게는
 * 순수한 무게이기 때문이다. Form 클러스터를 옮기고 나서 판단한다 (docs/001_ui.md "결정할 것").
 */
export function cm(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
