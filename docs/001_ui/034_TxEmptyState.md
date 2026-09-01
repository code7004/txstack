# 034 · TxEmptyState

> 보여 줄 것이 없을 때 그 자리에 놓는 안내.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxEmptyState` |
| 소스 | [`packages/ui/src/TxEmptyState/`](../../packages/ui/src/TxEmptyState) |
| 테스트 | 27개 |

## 개발 목적

보여 줄 것이 없을 때 그 자리에 놓는 안내. **없음에도 갈래가 있다** — 자료 없음 · 검색 결과 없음 · 오류 · 권한 없음은 사용자가 할 일이 서로 다르다.

## 기능

### 쓰는 법

```tsx
{rows.length === 0 && (
  <TxEmptyState variant="no-result">
    <TxButton label="조건 지우기" variant="secondary" onClick={reset} />
  </TxEmptyState>
)}
```

**왜 비었는지를 넷으로 가른다** — `no-data`(아직 안 만듦) · `no-result`(찾았는데 없음) ·
`error`(불러오다 실패) · `no-permission`(권한 없음). 넷은 **사용자가 다음에 할 일이 다르다.**
"없음" 이라고만 적으면 그 다음이 없다.

문구를 안 주면 갈래마다 정해진 것이 나온다. `title` · `description` 으로 덮고,
**`null` 을 주면 그 줄이 아예 없어진다.**

겉모습은 CSS 변수로 바꾼다 — `.tx-empty-state { --tx-empty-state-padding: 4rem 1rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxEmptyState/`
- [x] **테스트** — 27개
- [x] **스토리** — `TxEmptyState.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### `TxEmptyState` — 넷을 가르는 것이 요지다

`no-data` · `no-result` · `error` · `no-permission` 은 **사용자가 할 일이 서로 다르다.**
"없음" 이라고만 적으면 그 다음이 없으므로 갈래마다 문구와 그림을 따로 둔다.

**바탕도 테두리도 칠하지 않고, `error` 만 갈래색을 쓴다.** 나머지 셋은 잘못이 아니라
상태라, 붉히면 없는 문제를 있는 것처럼 보이게 한다 — 눈에 띄어야 하는 것은 `TxAlert` 쪽이다.

문구에서 **`??` 를 쓰면 `null` 에도 기본값이 돌아온다.** "안 준 것"(기본 문구)과
"일부러 비운 것"(줄 없음)을 가르려고 `=== undefined` 로 갈랐다. 테스트가 그 셋을 지킨다 —
안 준 것 · `null` · 빈 문자열.
