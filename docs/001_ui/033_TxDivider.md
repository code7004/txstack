# 033 · TxDivider

> 가르는 선.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxDivider` |
| 소스 | [`packages/ui/src/TxDivider/`](../../packages/ui/src/TxDivider) |
| 테스트 | 20개 |

## 개발 목적

가르는 선. 글자가 없으면 `<hr>` 하나지만 **방향(세로)과 가운데 라벨은 `<hr>` 이 못 한다** — 그 둘 때문에 컴포넌트로 산다.

## 기능

### 쓰는 법

```tsx
<TxDivider />
<TxDivider orientation="vertical" />
<TxDivider>또는</TxDivider>
```

**글자가 없으면 네이티브 `<hr>` 하나다.** 브라우저가 이미 "가르는 것" 으로 읽어 주므로
`role` 을 손으로 달 이유가 없다. 글자를 주면 그 글자가 내용이 되고 **선은 장식이 되어**
좌우(또는 위아래)로 갈라진다.

겉모습은 CSS 변수로 바꾼다 — `.tx-divider { --tx-divider-spacing: 2rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxDivider/`
- [x] **테스트** — 20개
- [x] **스토리** — `TxDivider.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### `TxDivider` — 글자가 없으면 `<hr>` 하나다

브라우저가 이미 "가르는 것" 으로 읽으므로 `role` 을 손으로 달지 않는다. 글자를 주면
`<hr>` 이 void 요소라 담지 못하므로 `<div>` 가 되는데, **그때 `role="separator"` 를 달지
않는다** — 그 역할은 자식을 장식으로 보게 만들어서, 달면 정작 읽혀야 할 글자가 안 읽힌다.
선은 `::before` · `::after` 가 그린다.

세로 선은 늘릴 기준이 없는 자리에서 **높이 0 이 되어 사라진다.** `align-self: stretch` 와
`min-block-size: 1lh` 를 함께 둔다.
