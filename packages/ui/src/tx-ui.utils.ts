import clsx, { type ClassValue } from "clsx";

/**
 * 클래스 문자열을 합친다. 모든 컴포넌트가 `cm("tx-*", className)` 형태로 쓴다 —
 * **기본 클래스를 교체하지 않고 덧붙이는** 것이 계약이다.
 *
 * **`tailwind-merge` 를 쓰지 않는다.** 그것은 Tailwind 유틸리티끼리의 충돌을 정리하는
 * 물건인데, 우리 컴포넌트는 자기 `className` 에 Tailwind 를 하나도 싣지 않는다 —
 * 전부 `tx-*` 와 CSS 변수다. 그러니 정리할 충돌 자체가 없었다.
 *
 * **소비자의 `className` 이 이기는 것은 `@layer tx` 덕분이다.** 레이어 밖의 규칙은
 * 특성도와 무관하게 레이어 안을 이긴다. 그 일을 하지 않는 의존을 Tailwind 를 안 쓰는
 * 소비자에게까지 지울 이유가 없다.
 *
 * 그래서 이 규칙이 깨지지 않는지를 `index.test.ts` 가 지킨다.
 */
export function cm(...inputs: ClassValue[]) {
  return clsx(...inputs);
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
