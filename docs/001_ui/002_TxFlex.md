# 002 · TxFlex

> 가로로 늘어놓는 자리. `display: flex` 와 **간격 기본값**을 준다. 그게 전부다.

|             |                                                           |
| ----------- | --------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                             |
| 내보내는 것 | `TxFlex`                                                  |
| 소스        | [`packages/ui/src/TxFlex/`](../../packages/ui/src/TxFlex) |
| 테스트      | 16개                                                      |

## 개발 목적

버튼 둘을 나란히 두려고 매번 `flex gap-2` 를 치던 것을 없앤다. 방향과 정렬은 소비자 몫으로 두고 **간격 기본값만** 준다 — 그 이상을 정하면 배치의 주인이 뒤바뀐다.

## 기능

- **`className` 은 기본 클래스를 교체하지 않고 덧붙는다.** 방향을 바꿔도 간격이 남는다
- 간격은 CSS 변수로 바꾼다 — `.tx-flex { --tx-flex-gap: 1rem }`

### 쓰는 법

```tsx
<TxFlex>
  <TxButton label="취소" variant="ghost" />
  <TxButton label="저장" />
</TxFlex>

<TxFlex className="flex-col">…</TxFlex>   // 방향은 소비자가 정한다
```

화면 골격은 이 컴포넌트가 하지 않는다 → `TxLayout`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxFlex/`
- [x] **테스트** — 16개
- [x] **스토리** — `TxFlex.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`
