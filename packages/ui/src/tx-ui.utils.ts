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

/**
 * **내부 전용.** 화면을 덮는 층이 떠 있는 동안 배경 스크롤을 멈춘다.
 * `TxModal` · `TxSlidePanel` 처럼 `<dialog>` 로 뜨는 것들이 함께 쓴다.
 *
 * `<dialog>` 는 배경을 비활성화하지만 **스크롤은 막지 않는다.** 그래서 뒤 페이지가
 * 휠에 따라 움직인다 — 원본이 그랬다.
 *
 * 층은 겹쳐 뜰 수 있으므로 **세어 둔다.** 안쪽이 닫힐 때 바깥이 아직 떠 있는데
 * 스크롤이 풀려 버리면 안 된다. 원본은 각자 `body.style.overflow` 를 저장·복원해서
 * 둘이 겹치면 어긋났다.
 */
let openCount = 0;
let restore: string | null = null;

export function lockPageScroll() {
  if (openCount === 0) {
    restore = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openCount += 1;

  return () => {
    openCount = Math.max(0, openCount - 1);
    if (openCount > 0) return;

    // 소비자가 원래 주고 있던 값으로 되돌린다. 빈 문자열이면 속성 자체를 지운다
    document.body.style.overflow = restore ?? "";
    restore = null;
  };
}
