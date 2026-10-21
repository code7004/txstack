---
"@txstack/ui": minor
---

테두리 두께 · 선택 상태를 토큰과 prop 으로 연다. 기본값은 지금 모양 그대로다.

- `TxAppShell` — `--tx-app-shell-border-width`(기본 `1px`). 헤더 · 패널 · 푸터 경계선의 두께. `0` 이면 선이 자리도 차지하지 않는다
- `TxCollapsible` — `--tx-collapsible-border-width`(기본 `1px`). `TxAccordion` 의 맞닿은 테두리 겹치기도 따라간다
- `TxButton` — `--tx-button-border-width`(기본 `0`) · `--tx-button-border-color`(기본 `transparent`). 선 하나짜리 알약 버튼을 토큰으로 만든다
- `TxTag` — `selected` prop. `onClick` 과 함께 주면 글자 버튼에 `aria-pressed`, 루트에 `data-selected` 가 붙는다. 겉모습은 `--tx-tag-selected-bg` · `--tx-tag-selected-fg` · `--tx-tag-selected-border-color`
- `TxTag` — `--tx-tag-hover-bg`. 누를 수 있는 태그의 hover 바탕. 선택된 칩은 선택 바탕 위에 상태색을 얹어 회색으로 바래지 않는다
- `TxTag` 의 점(`dot`)이 글자색(`currentColor`)을 따른다 — 선택돼 글자색이 바뀌면 점도 바뀐다
