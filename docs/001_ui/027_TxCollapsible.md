# 027 · TxCollapsible

> 눌러서 접고 펴는 한 덩이.

|             |                                                                         |
| ----------- | ----------------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                           |
| 내보내는 것 | `TxCollapsible`                                                         |
| 소스        | [`packages/ui/src/TxCollapsible/`](../../packages/ui/src/TxCollapsible) |
| 테스트      | 32개                                                                    |

## 개발 목적

눌러서 접고 펴는 한 덩이. `<details>` 위에 얹어 **접힌 글도 ⌘F 로 찾힌다** — 손으로 짠 접기는 그것을 잃는다.

## 기능

**네이티브 `<details>` 다.** 그래서 여닫기 · 키보드 · 스크린리더가 상태를 읽는 것 ·
**접힌 내용까지 찾아 주는 페이지 내 검색**을 전부 브라우저가 맡는다. 손으로 짠 것은
`aria-expanded` 를 붙이는 것까지는 해도 검색까지는 못 한다.

### 쓰는 법

```tsx
<TxCollapsible title="배송 안내">
  주문 후 2~3일 안에 받아보실 수 있습니다.
</TxCollapsible>

// 값의 주인이 되고 싶으면
<TxCollapsible title="배송 안내" open={open} onOpenChange={setOpen}>…</TxCollapsible>
```

여러 덩이를 묶어 하나씩만 열리게 하려면 **`TxAccordion`** 을 쓴다 — 이것을 부품으로 쓴다.

겉모습은 CSS 변수로 바꾼다 — `.tx-collapsible { --tx-collapsible-padding: 1rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxCollapsible/`
- [x] **테스트** — 32개
- [x] **스토리** — `TxCollapsible.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

신규다. **네이티브 `<details>` 위에 올렸다.** `TxModal` 을 `<dialog>` 로 옮긴 것과 같은
판단이다 — 여닫기 · 키보드 · 스크린리더가 상태를 읽는 것까지는 손으로도 짤 수 있지만,
**접힌 내용을 찾아 주는 페이지 내 검색(⌘F)은 브라우저만 할 수 있다.** 접힌 글이 검색에
안 걸리면 FAQ 나 약관에서는 없는 글이나 마찬가지다.

### `<details>` 는 원래 움직이지 않는다

열리는 순간 내용이 `display` 로 나타났다 사라지므로 사이 값이 없다. `::details-content` 가
그 내용을 가리킬 수 있게 해 주고 `interpolate-size: allow-keywords` 가 `auto` 높이를
오갈 수 있게 해 준다. **아는 브라우저에서만 움직이고 모르는 쪽에서는 즉시 열린다** —
기능이 빠지는 것이지 깨지는 것이 아니다. 테스트가 `@supports` 밖에서 내용 높이를 건드리지
않는지 본다 — 밖에 두면 모르는 브라우저에서 **내용이 잘린다.**

### controlled 인데 소비자가 값을 안 바꾸면 화면이 갈렸다

`<details>` 는 눌리면 **브라우저가 스스로 연다.** 소비자가 `onOpenChange` 를 받고도 값을
안 바꾸면 React 는 prop 이 그대로라 다시 그리지 않고, 그러면 DOM 을 되돌릴 기회가 없다 —
**화면만 열린 채 상태와 갈린다.**

상태를 하나 더 두는 것으로는 안 된다. 두 번째로 누를 때는 그 값이 이미 같아서 React 가
그냥 건너뛰고, **한 번은 되돌아오는데 두 번째부터 샌다.** 그래서 controlled 일 때는
값이 아니라 **다시 그릴 구실**(카운터)을 올린다.

### `defaultOpen` 을 `<details>` 에 넘기지 않는다

React 가 아는 prop 이 아니라 `defaultopen` 속성으로 새어 나간다. 타입은 통과하지만
DOM 에 남는다 — uncontrolled 값을 내부 상태로 들고 있는다.

### 그 밖에 정한 것

- **`disabled` 는 여는 것만 막는다.** 이미 열려 있었다면 내용을 뺏지 않는다 —
  네이티브 `<details>` 에는 `disabled` 가 없으므로 `summary` 의 click 을 막고
  `aria-disabled` 로 알린다
- 브라우저가 붙이는 삼각형은 **두 길로** 지운다 — 표준은 `list-style: none` 이지만
  옛 WebKit 은 `::-webkit-details-marker` 로 그린다
- **`name` 을 그대로 넘긴다.** `<details name>` 은 브라우저가 하나만 열리게 해 주므로
  `TxAccordion` 이 그 길을 쓸 수 있다

### 떨어뜨려 놓고 싶으면 `TxCollapsible` 을 쓴다

`TxAccordion` 은 **이어 붙은 목록**이다. 맞닿은 테두리를 한 겹으로 겹치고 모서리를 바깥에만
남긴다. 상자를 떨어뜨려 쌓는 것은 `TxCollapsible` 여러 개가 이미 하는 일이라, 그것을 위한
`gap` 옵션을 두지 않았다 — 두면 모서리 규칙이 갈라져 둘 다 어중간해진다.
