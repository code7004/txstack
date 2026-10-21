---
"@txstack/ui": minor
---

알림의 그림 · 닫기 버튼 · 자리, 메뉴의 맞추는 끝을 연다. 기본값은 지금과 같다.

- `TxToast.show` 옵션 `icon?: ReactNode | false` — `TxAlert` 의 `icon` 으로 그대로 넘긴다. `false` 면 그림이 없다
- `TxToast.show` 옵션 `hideCloseButton` — 닫기 버튼을 그리지 않는다. `duration: 0`(사라지지 않는 알림)에는 먹지 않는다
- `TxToast.configure` 도 `icon` · `hideCloseButton` 을 받는다 — 앱 전체 기본. 알림마다 준 값이 이긴다
- `--tx-toast-offset`(기본 `var(--tx-toast-margin)`) — 통의 위 · 아래 자리만 정한다. 좌우 여백 · 최대 폭은 계속 `--tx-toast-margin` 이다
- `TxDropMenu` `align?: "start" | "end"`(기본 `"start"`) — `"end"` 면 메뉴의 오른쪽 끝을 트리거의 오른쪽 끝에 맞춘다. 글 방향을 따르고, 화면 밖으로 나가면 안으로 당긴다
