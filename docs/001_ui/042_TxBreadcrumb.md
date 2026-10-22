# 042 · TxBreadcrumb

> 계층 경로. `<nav>` 안의 `<ol>` 이다.

|             |                                                                       |
| ----------- | --------------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                         |
| 내보내는 것 | `TxBreadcrumb`                                                        |
| 소스        | [`packages/ui/src/TxBreadcrumb/`](../../packages/ui/src/TxBreadcrumb) |
| 테스트      | 37개                                                                  |

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
  <TxBreadcrumb.Item as={NavLink} to="/">
    홈
  </TxBreadcrumb.Item>
  <TxBreadcrumb.Item as={NavLink} to="/orders">
    주문
  </TxBreadcrumb.Item>
  <TxBreadcrumb.Item>8213</TxBreadcrumb.Item>
</TxBreadcrumb>
```

### 목록으로 그리기 — `items` · `itemAs`

칸이 손으로 적는 것이 아니라 **어딘가에서 만들어져 오는 목록**이면 `items` 로 넘긴다.
라우트 트리에서는 `@txstack/route-meta` 의 [`useBreadcrumbs`](../002_route_meta/006_useBreadcrumbs.md) 가 이 모양을 준다.

```tsx
<TxBreadcrumb
  itemAs={NavLink}
  items={[
    { label: "홈", path: "/" },
    { label: "주문", path: "/orders" },
    { label: "8213" } // path 가 없으면 글자
  ]}
/>;

// 라우트 트리에서 — 화면은 prop 이 없다
<TxBreadcrumb items={useBreadcrumbs(routeTree)} itemAs={NavLink} />;
```

위 `children` 모양과 **같은 것을 그린다.** 마지막 칸은 글자 · 가운데 접기 · 가름표가 그대로 적용된다.

| prop        | 기본                                                 | 하는 일                                                                                   |
| ----------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `items`     | —                                                    | 칸 목록. **`children` 과 함께 줄 수 없다**(타입이 막는다)                                 |
| `itemAs`    | `"a"`                                                | `path` 가 있는 칸을 그릴 것. `TxBreadcrumb.Item` 의 `as` 로 그대로 간다                   |
| `itemProps` | `"a"` 면 `{ href: path }`, 컴포넌트면 `{ to: path }` | 칸 하나에서 링크 props 를 만든다. `to` 도 `href` 도 아닌 라우터(Next 의 `Link` 등)만 준다 |

```ts
export interface TxBreadcrumbItemData {
  /** 없으면 순번을 쓴다. route-meta 의 칸은 트리 키가 있다. */
  key?: Key;
  label: ReactNode;
  /** 없으면 링크가 아니라 글자다. */
  path?: string;
  /** 지금 자리. 마지막 칸에는 저절로 붙는다. */
  current?: boolean;
}

type TxBreadcrumbProps = ({ children?: ReactNode; items?: never } & Common) | ({ items: readonly TxBreadcrumbItemData[]; itemAs?: ElementType; itemProps?: (item: TxBreadcrumbItemData) => object; children?: never } & Common);
```

**`children` 이 아니라 데이터 prop 인 이유** — [900_common](900_common.md) 의 「`children` 은 그 부품이 품는 것」은
**손으로 적는 칸**에 그대로다(위 모양은 바뀌지 않는다). `items` 는 칸이 **다른 데서 만들어져 오는** 경우의 길이다 —
`map` 으로 `TxBreadcrumb.Item` 을 만드는 세 줄을 소비자마다 쓰게 하지 않는다. `TxAccordion` 의 `items` 와 같은 자리다.

**`itemProps` 기본이 `to` 인 이유** — 이 세트의 라우터 peer 가 `react-router-dom` 이고, 그 `Link` · `NavLink` 가 `to` 를 받는다.
`"a"` 는 HTML 이라 `href` 다. 그 밖의 라우터만 직접 준다: `itemProps={(item) => ({ href: item.path })}`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxBreadcrumb/`
- [x] **테스트** — 37개
- [x] **스토리** — `TxBreadcrumb.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`
- [x] **`items` · `itemAs` · `itemProps`**(2026-10-22) — 13개: `children` 과 같은 DOM · path 없는 칸은 글자 ·
      `"a"` 는 `href` · 컴포넌트는 `to` · `itemProps` 가 이긴다 · `key` 없으면 순번 · 접기와 함께 · `children` 과 함께 못 준다(타입) · route-meta 를 import 하지 않는다

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
