---
"@txstack/ui": minor
---

하단 시트 · 모달 여백을 토큰과 prop 으로 연다. 기본값은 지금 모양 그대로다.

- `TxSlidePanel` `size="auto"` — 내용이 크기를 정한다(`TxModal` 의 `size="auto"` 와 같은 뜻). 위아래면 높이, 좌우면 폭이 내용을 따르고 화면에서 멈춰 본문이 굴러간다. 모바일 하단 시트는 `side="bottom" size="auto"`
- `TxSlidePanel` `--tx-slide-panel-radius`(기본 `0`) — 화면 안쪽을 향한 두 모서리만 둥글게 한다
- `--tx-slide-panel-body-padding` · `--tx-modal-body-padding` — 본문 여백을 머리와 따로 준다(네 값까지). 기본은 각각 `--tx-slide-panel-padding` · `--tx-modal-padding`
- `TxModal.Footer` 가 본문 여백과 상관없이 바닥 · 양옆에 닿는다 — 음수 여백 대신 바탕을 넓혀 그린다. 버튼 자리는 전과 같다
