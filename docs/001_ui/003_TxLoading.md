# 003 · TxLoading

> "로딩 중" 을 화면에 세우는 자리. **언제 보일지**와 **옆에 붙는 문구**, **전체화면 딤**을 맡는다.

|             |                                                                 |
| ----------- | --------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                   |
| 내보내는 것 | `TxLoading`                                                     |
| 소스        | [`packages/ui/src/TxLoading/`](../../packages/ui/src/TxLoading) |
| 테스트      | 30개                                                            |

## 개발 목적

"언제 보일지" 를 화면마다 다시 계산하던 것을 없앤다. 배열을 그대로 받아 비어 있는 동안 보여 주고, 옆에 붙는 문구와 전체화면 딤까지 맡는다.

## 기능

- `visible` 에 **배열**을 주면 그 배열이 비어 있는 동안 보인다. `data.length === 0` 을 따로 계산하지 않는다
- `fullScreen` 은 `document.body` 로 포털된다 — 조상의 `transform` 안에 갇히지 않는다
- 문구의 색·크기를 정하지 않는다. 놓인 자리의 글자를 따라간다

### 쓰는 법

```tsx
<TxLoading visible={rows} text="목록을 불러오는 중" />
<TxLoading visible={isNavigating} text="이동 중" fullScreen />
```

아이콘 크기·딤·쌓임 순서는 CSS 변수로 바꾼다 — `.tx-loading { --tx-loading-icon-size: 3em }`.

회전 아이콘 자체는 `TxSpinner` 가 소유한다. 속도는 `--tx-spinner-duration` 이다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxLoading/`
- [x] **테스트** — 30개
- [x] **스토리** — `TxLoading.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`
