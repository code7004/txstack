# 004 · TxSpinner

> 로딩 중임을 알리는 회전 아이콘.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxSpinner` |
| 소스 | [`packages/ui/src/TxSpinner/`](../../packages/ui/src/TxSpinner) |
| 테스트 | 20개 |

## 개발 목적

회전 아이콘 하나. 크기와 색을 상속받아 어디에 넣어도 맞으므로 버튼 · 로딩 · 빈 상태가 전부 이것을 쓴다. **표시 여부 판단은 하지 않는다** — 그건 `TxLoading` 몫이다.

## 기능

크기와 색을 **부모에게서 상속**받는다 — 기본값이 `1em` + `currentColor` 라
버튼이나 문단 안에 넣으면 글자 크기·색에 저절로 맞는다.

문구·오버레이·표시 여부 판단은 이 컴포넌트가 하지 않는다 → `TxLoading`.

### 쓰는 법

```tsx
<TxSpinner />                                    // 상속에 맡긴다
<TxSpinner size={24} />                          // 크기만 지정
<TxSpinner decorative />                         // 옆에 읽을 문구가 이미 있을 때
```

회전 속도는 CSS 변수로 바꾼다 — `.tx-spinner { --tx-spinner-duration: 2s }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxSpinner/`
- [x] **테스트** — 20개
- [x] **스토리** — `TxSpinner.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`
