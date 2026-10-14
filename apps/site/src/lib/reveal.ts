/** 강조가 머무는 시간. CSS 의 `site-reveal` 애니메이션 길이와 같다 */
const HIGHLIGHT_MS = 2400;

/**
 * **검색으로 고른 자리를 보여 준다** — 그 자리로 굴리고 잠깐 밝힌다.
 *
 * 라우터의 이동만으로는 부족하다. 지금 주소와 같은 곳을 고르면 라우터가 움직이지 않아 굴러가지
 * 않고, 다른 페이지면 그 페이지가 그려진 뒤에야 자리가 생긴다. 그래서 **자리가 생길 때까지
 * 몇 프레임 기다렸다가** 직접 굴린다. 강조는 `:target` 이 아니라 속성으로 한다 —
 * `history.pushState` 로 바꾼 주소에는 `:target` 이 따라오지 않는다.
 */
export function revealAnchor(id: string, tries = 60) {
  const node = document.getElementById(id);

  if (!node) {
    if (tries > 0) requestAnimationFrame(() => revealAnchor(id, tries - 1));
    return;
  }

  node.scrollIntoView({ block: "start" });

  // 같은 자리를 연달아 고르면 애니메이션을 처음부터 다시 돌린다
  node.removeAttribute("data-revealed");
  void node.offsetWidth;
  node.setAttribute("data-revealed", "");

  window.setTimeout(() => node.removeAttribute("data-revealed"), HIGHLIGHT_MS);
}
