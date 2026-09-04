# 016 · TxPagination

> 쪽 번호. **그리드와 무관하다** — 카드 목록이든 표든 서버가 `offset`·`total` 로 주는 자리면 쓴다.

|             |                                                                       |
| ----------- | --------------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                         |
| 내보내는 것 | `TxPagination`                                                        |
| 소스        | [`packages/ui/src/TxPagination/`](../../packages/ui/src/TxPagination) |
| 테스트      | 20개                                                                  |

## 개발 목적

쪽 번호. 그리드의 것이 아니라 **서버가 `offset` · `total` 로 주는 자리면 어디든** 쓰는 별개 부품이라 `TxAgGrid` 에서 갈라냈다.

## 기능

```tsx
<TxPagination currentPage={page} totalRows={total} pageSize={50} onChangePage={setPage} />
```

- `currentPage` 는 **1부터** 센다
- 쪽이 하나뿐이면 아무것도 그리지 않는다 — 고를 것이 없는 자리를 채우지 않는다
- 번호는 `pageButtonCount` 개씩 묶어 보여 주고, `«` `»` 가 묶음째 옮긴다

겉모습은 CSS 변수로 바꾼다 — `.tx-pagination { --tx-pagination-gap: … }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxPagination/`
- [x] **테스트** — 20개
- [x] **스토리** — `TxPagination.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`
