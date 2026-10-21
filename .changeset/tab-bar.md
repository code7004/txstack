---
"@txstack/ui": minor
---

모바일 하단 탭바를 더한다 — 자리는 `TxAppShell` 의 `tabBar`, 항목은 새 부품 `TxTabBar`.

- `TxAppShell` `tabBar` — `breakpoint` 보다 좁을 때만 화면 아래에 붙는다. `<nav aria-label="하단 탭">`(`labels.tabBar`) · `classNames.tabBar`. 서 있는 동안 셸 아래에 탭바 높이만큼 자리를 비우고(`data-tab-bar`), 아이폰 홈 표시줄(`env(safe-area-inset-bottom)`)을 아래 여백에 더한다. 서랍(햄버거)은 그대로 남는다
- 토큰 `--tx-app-shell-tab-bar-height` · `-padding-top` · `-padding-bottom` · `-bg` · `-border-width` · `-border-color` · `-fade`(기본 `0`) · `-fade-color`
- `TxTabBar` · `TxTabBar.Item`(`as` · `label` · `icon` · `badge`) — 항목을 같은 폭으로 나누고 아이콘 위 · 글자 아래로 세운다. 지금 탭은 라우터의 `aria-current` 를 읽어 색 · 굵기 · 위쪽 막대로 알린다
- 토큰 `--tx-tab-bar-icon-size` · `-gap` · `-font-size` · `-font-weight` · `-color` · `-current-color` · `-current-font-weight` · `-indicator-size`(0 이면 막대 없음) · `-indicator-width` · `-indicator-color` · `-max-width` · `-padding-inline` · `-badge-bg` · `-badge-fg`
