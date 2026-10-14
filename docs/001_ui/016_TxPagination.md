# 016 · TxPagination

> 쪽 번호. **그리드와 무관하다** — 카드 목록이든 표든 서버가 `offset`·`total` 로 주는 자리면 쓴다.

|             |                                                                       |
| ----------- | --------------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                         |
| 내보내는 것 | `TxPagination`                                                        |
| 소스        | [`packages/ui/src/TxPagination/`](../../packages/ui/src/TxPagination) |
| 테스트      | 29개                                                                  |

## 개발 목적

쪽 번호. 그리드의 것이 아니라 **서버가 `offset` · `total` 로 주는 자리면 어디든** 쓰는 별개 부품이라 `TxAgGrid` 에서 갈라냈다.

## 기능

```tsx
<TxPagination currentPage={page} totalRows={total} pageSize={50} onChangePage={setPage} />
```

- `currentPage` 는 **1부터** 센다
- 쪽이 하나뿐이면 아무것도 그리지 않는다 — 고를 것이 없는 자리를 채우지 않는다
- 번호는 `pageButtonCount` 개씩 묶어 보여 주고, `«` `»` 가 묶음째 옮긴다
- 좁은 자리에서는 번호 대신 `‹ 3 / 12 ›` 로 줄어든다 — 아래 "좁은 자리"

### 좁은 자리 (`compact`)

```tsx
<TxPagination compact="auto" … />   // 기본. 놓인 자리가 32rem 보다 좁으면 줄인다
<TxPagination compact … />          // 늘 줄인 모양
<TxPagination compact={false} … />  // 늘 번호 모양 — 좁으면 두 줄로 넘어간다

labels={{ status: (page, total) => `${total}쪽 중 ${page}쪽` }}   // 스크린리더 문구
```

- **화면 폭이 아니라 놓인 자리의 폭**을 본다(container query). 넓은 화면의 옆 패널 안에서도 줄어든다
- 줄인 모양에는 `«` `»` 가 없다 — 넘길 묶음이 보이지 않는다. `‹` `›` 는 그대로 한 쪽씩 옮긴다
- `3 / 12` 는 버튼이 아니라 글자다. 스크린리더에는 `labels.status` 문장이 읽힌다
- `"auto"` 는 자리를 재야 해서 `width: 100%` 다. 정렬은 `--tx-pagination-justify`(기본 `center`)로 바꾼다.
  `TxAgGrid` 의 아래 줄은 이 값을 `flex-end` 로 둔다
- 기준 폭 32rem 은 기본 모양(번호 10개 + 화살표 4개)이 한 줄에 들어가는 폭이다. container query 에는
  변수를 쓸 수 없어 고정이다. 다른 기준이 필요하면 앱이 폭을 재서 `compact` 에 `true`/`false` 를 준다

겉모습은 CSS 변수로 바꾼다 — `.tx-pagination { --tx-pagination-gap: … }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxPagination/`
- [x] **테스트** — 29개
- [x] **스토리** — `TxPagination.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`
