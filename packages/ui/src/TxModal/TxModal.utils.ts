/**
 * **내부 전용.** 모달이 떠 있는 동안 배경 스크롤을 멈춘다.
 *
 * `<dialog>` 는 배경을 비활성화하지만 **스크롤은 막지 않는다.** 그래서 모달 뒤 페이지가
 * 휠에 따라 움직인다 — 원본이 그랬다.
 *
 * 모달이 겹쳐 뜰 수 있으므로 **세어 둔다.** 안쪽 모달이 닫힐 때 바깥 모달이 아직 떠 있는데
 * 스크롤이 풀려 버리면 안 된다.
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
