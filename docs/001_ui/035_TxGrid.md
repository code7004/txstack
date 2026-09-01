# 035 · TxGrid

> 칸을 나눠 담는 자리. 폼을 2단·3단으로 앉힐 때 쓴다.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxGrid` |
| 소스 | [`packages/ui/src/TxGrid/`](../../packages/ui/src/TxGrid) |
| 테스트 | 18개 |

## 개발 목적

폼 2단 · 3단 배치. `TxFlex` 는 있는데 Grid 가 없었다. **미디어 쿼리를 쓰지 않고** 놓인 자리의 폭을 보고 접는다.

## 기능

### 쓰는 법

```tsx
<TxGrid columns={2}>
  <TxForm.Input caption="이름" />
  <TxForm.Input caption="전화" />
  <TxGrid.Item span="full">
    <TxForm.Textarea caption="메모" />
  </TxGrid.Item>
</TxGrid>
```

**좁아지면 알아서 한 칸으로 접힌다.** 칸 하나가 `--tx-grid-min`(기본 `14rem`)보다
좁아질 상황이면 브라우저가 칸 수를 줄인다 — **화면 크기를 재거나 미디어 쿼리를 쓰지 않으므로**
컴포넌트가 놓인 자리의 폭에 반응한다. 사이드바 안에 넣어도 맞는다.

한 줄로만 늘어놓을 것이면 `TxFlex` 다. 이쪽은 **칸이 맞아떨어져야 할 때**다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxGrid/`
- [x] **테스트** — 18개
- [x] **스토리** — `TxGrid.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### `TxGrid` — 미디어 쿼리를 쓰지 않는다

`auto-fit` 과 `minmax` 가 칸 수를 정하므로 **화면이 아니라 놓인 자리의 폭**에 반응한다.
같은 코드를 사이드바에 넣으면 거기 폭에 맞춰 접힌다 (재 보니 18rem 에서 한 칸, 34rem 에서 두 칸).
`minmax(min(…, 100%), …)` 의 `min()` 이 없으면 최소 폭이 자리보다 클 때 넘쳐서
가로 스크롤이 생긴다. `TxGrid.Item` 의 `span` 도 `min()` 으로 칸 수를 넘지 못하게 가둔다.
