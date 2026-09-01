# 042 · TxBreadcrumb

> 계층 경로. `<nav>` 안의 `<ol>` 이다.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxBreadcrumb` |
| 소스 | [`packages/ui/src/TxBreadcrumb/`](../../packages/ui/src/TxBreadcrumb) |
| 테스트 | 24개 |

## 개발 목적

계층 경로. **마지막 칸은 링크가 아니고**(지금 있는 자리다), 길면 가운데를 접는다. 라우터는 주입받는다.

## 기능

**`<nav>` 안의 `<ol>` 이다.** 순서가 뜻을 갖는 목록이므로 `<ul>` 이 아니고,
스크린리더가 "경로, 목록, 3개 항목" 으로 읽는다.

- **마지막 칸은 링크가 아니라 글자**이고 `aria-current="page"` 가 붙는다 —
  지금 있는 자리를 다시 누르게 두면 어디로 가는지 알 수 없다
- 가르는 `/` 는 **CSS 가 그린다.** 글자로 넣으면 스크린리더가 칸마다 "슬래시" 를 읽는다
- 길면 가운데를 접는다 — `maxItems` · `itemsAfterCollapse`
- 라우터는 `as` 로 갈아끼운다 — `TxDropMenu.Item` 과 같은 규약이다

### 쓰는 법

```tsx
<TxBreadcrumb>
  <TxBreadcrumb.Item as={NavLink} to="/">홈</TxBreadcrumb.Item>
  <TxBreadcrumb.Item as={NavLink} to="/orders">주문</TxBreadcrumb.Item>
  <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
</TxBreadcrumb>
```

## 개발 항목

- [x] **구현** — `packages/ui/src/TxBreadcrumb/`
- [x] **테스트** — 24개
- [x] **스토리** — `TxBreadcrumb.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### `TxBreadcrumb` — 마지막 칸은 링크가 아니다

`as` 로 링크를 줘도 마지막이면 글자로 그린다. **지금 있는 자리를 다시 누르게 두면 어디로
가는지 알 수 없다.** 대신 `aria-current="page"` 가 붙어 스크린리더가 "지금 여기" 를 안다.

`<nav>` 안의 **`<ol>`** 이다 — 순서가 뜻을 갖는 목록이라 `<ul>` 이 아니다.
가르는 `/` 는 **CSS 가 그린다.** 글자로 넣으면 스크린리더가 칸마다 "슬래시" 를 읽어
정작 경로가 안 읽힌다.

### `Children.toArray` 가 조각을 한 개로 센다 (테스트가 잡았다)

소비자가 칸을 `<>…</>` 로 묶거나 `map` 으로 만들어 넣는 일이 흔한데, 그대로 두면
**경로 전체가 한 칸이 되어** 가름표도 안 생기고 "지금 자리" 가 엉뚱한 데 붙는다.
조각을 재귀로 펴낸다.

### 프로그램 스크롤에는 이벤트가 안 왔다 (도구 한계)

브라우저에서 `scrollTop` 을 코드로 바꿔도 스크롤 이벤트가 배달되지 않아 처음엔 결함으로
보였다. **직접 붙인 리스너조차 안 불리는 것**을 보고 도구 쪽 한계로 가렸고, 이벤트를
손으로 보내니 세 자리(맨 위·가운데·맨 아래)가 모두 맞았다. 툴팁의 스크롤 추적에서
겪은 것과 같은 종류다.
