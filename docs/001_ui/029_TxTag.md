# 029 · TxTag

> 작은 이름표. 상태 · 개수 · 분류를 한 낱말로 붙인다.

|             |                                                         |
| ----------- | ------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                           |
| 내보내는 것 | `TxTag`                                                 |
| 소스        | [`packages/ui/src/TxTag/`](../../packages/ui/src/TxTag) |
| 테스트      | 35개                                                    |

## 개발 목적

상태 · 개수 · 분류를 한 낱말로 붙이는 이름표. 누를 수 있고 지울 수 있는 Chip 도 여기로 흡수했다. **혼자 서는 것**이라 무언가에 얹히는 `TxBadge` 와 다르다.

## 기능

### 쓰는 법

```tsx
<TxTag>초안</TxTag>
<TxTag variant="success">완료</TxTag>
<TxTag variant="warning" dot>대기</TxTag>
<TxTag variant="danger" appearance="outline">실패</TxTag>

<TxTag variant="info" onRemove={() => drop("서울")}>서울</TxTag>
<TxTag onClick={() => filter("vip")}>VIP</TxTag>
<TxTag onClick={() => setPlatform("all")} selected={platform === "all"}>전체</TxTag>
```

갈래는 **`TxAlert` · `TxToast` 와 같은 어휘**에 `neutral` 하나가 더 있다.

**`onClick` 을 주면 글자가 눌리고, `onRemove` 를 주면 지우기(×)가 붙는다.**
둘 다 안 주면 읽기만 하는 이름표다. **켜고 끄는 칩이면 `selected` 를 함께 준다** — 글자 버튼에
`aria-pressed` 가, 루트에 `data-selected` 가 붙는다.

겉모습은 CSS 변수로 바꾼다 — `.tx-tag { --tx-tag-radius: 0.25rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxTag/`
- [x] **테스트** — 42개
- [x] **스토리** — `TxTag.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

신규다. `TxAlert` 과 같은 방식으로 짰다 — **갈래는 `--tx-tag-accent` 하나만 갈아 끼우고**
바탕·테두리·점 색이 전부 거기서 섞여 나온다.

### `neutral` 을 더한 이유

태그에는 **색이 뜻을 갖지 않는 라벨**이 흔하다 — 개수, 분류, 그냥 이름표. 그런 자리에
`info`(브랜드색)를 쓰면 안 해도 될 강조가 붙는다. 그래서 다섯 번째를 두고 **기본으로 삼았다.**
전역 토큰은 안 늘었다 — `neutral` 은 본문 색을 그대로 쓴다.

### `solid` 를 두지 않았다 (판단)

배경을 갈래색으로 꽉 채우는 방식이다. **못 하는 이유가 팔레트에 있다** — `success` 와
`warning` 은 라이트/다크에서 밝기가 뒤집히고(`#15803d` ↔ `#4ade80`), 그 위에 얹을 글자색을
한 벌로 정할 수 없다. 다크에서 밝은 노랑 위에 흰 글자는 읽히지 않는다.

갈래마다 "그 위의 글자색" 토큰을 전역에 두면 되지만, 그러면 **소비자가 브랜드색을 덮을 때
그 짝까지 함께 내야 한다.** 요구가 실제로 오기 전에는 늘리지 않는다.

### 갈래색을 그대로 글자에 쓰면 대비가 모자랐다 (재서 고쳤다)

처음에는 `--tx-tag-fg: var(--tx-tag-accent)` 였다. 다크에서 재 보니 **`info` 2.74:1,
`danger` 2.94:1** 로, 12px 굵은 글씨에 필요한 4.5:1 에 한참 못 미쳤다. 원인은 팔레트에 있다 —
`--tx-color-primary` 와 `--tx-color-danger` 는 **흰 글자를 얹는 버튼 배경용**으로 고른 값이라
다크에서도 어둡다.

**글자색을 본문 색 쪽으로 당겨 만든다.**

```css
--tx-tag-fg: color-mix(in oklab, var(--tx-tag-accent) 65%, var(--tx-color-text));
```

본문 색은 라이트에서 어둡고 다크에서 밝으므로, 그쪽으로 섞으면 **어느 모드에서든 바탕에서
멀어진다.** 컴포넌트가 모드를 알 필요가 없다.

**비율은 브라우저에서 재서 정했다.** 70% 로 두면 다크에서 `info` 4.40 · `danger` 4.46 으로
아슬하게 모자라, 65% + 바탕 10% 로 낮췄다. 지금은 **라이트 6.00~~17.74, 다크 4.85~~16.20** 으로
열 조합이 전부 4.5:1 을 넘는다. 작은 점과 가는 테두리도 같은 색에서 뽑는다 — 갈래색
그대로면 다크 바탕에 묻힌다.

### 누르는 것이 아니다

처음에는 읽는 것만 하게 두었다. **누를 수 있고 지울 수 있는 것(Chip)은 따로 만들지 않고**
요구가 오면 이 컴포넌트가 흡수하기로 했고, 실제로 그렇게 됐다 — 바로 아래 절이다.

### `TxTag` 가 Chip 을 흡수했다 — 버튼 안의 버튼을 피하며

`onClick`(누르기)과 `onRemove`(지우기)를 더했다. **태그 전체를 버튼으로 감싸지 않는다** —
지우기도 버튼이라 감싸면 `<button>` 안의 `<button>` 이 되어 못 쓰는 마크업이 된다.
글자만 버튼이 되고 지우기는 그 옆에 따로 선다.

### 선택 상태 `selected` · hover 토큰 (settlemint 에서 요구됐다)

settlemint 홈의 연동 플랫폼 칩은 **눌러서 하나를 켜는 걸러내기**다. 선택 상태를 줄 자리가 없어 앱이
`data-selected` 로 겉만 칠하고 숨김 글자로 상태를 읽혔다. 또 hover 바탕이 갈래색과 surface 를 섞어 계산돼,
선택 바탕을 검정으로 칠한 칩이 손을 얹는 순간 **회색으로 바랬다** — 앱은 `--tx-color-surface` 를 덮어 우회했다.

```tsx
<TxTag onClick={() => onSelect("all")} selected={selected === "all"}>
  전체
</TxTag>
```

```css
.sm-chip {
  --tx-tag-selected-bg: var(--sm-text-strong);
  --tx-tag-selected-fg: var(--sm-text-inverse);
  --tx-tag-selected-border-color: var(--sm-text-strong);
  /* 필요하면 hover 도 직접 — 기본은 선택 바탕 위에 상태색을 얹는다 */
  --tx-tag-hover-bg: …;
}
```

| 정한 것                                                       | 왜                                                                                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 이름은 `selected`, ARIA 는 `aria-pressed`                     | `pressed` 는 `TxButton` 의 `--tx-button-bg-pressed` 가 이미 "누르는 동안(:active)" 뜻으로 쓴다. 겹치면 토큰 이름이 헷갈린다      |
| **`onClick` 과 함께일 때만** 뜻이 있다                        | 누를 수 없는 것에 눌림 상태는 없다. 겉만 선택된 것처럼 보이면 거짓이 된다 — 그래서 `data-selected` 도 붙지 않는다                |
| `selected={false}` 도 알린다 (`aria-pressed="false"`)         | "켜고 끄는 칩" 이라는 사실 자체가 정보다. 안 주면 그냥 누르는 태그다                                                             |
| 지우기(×)에는 붙지 않는다                                     | 지우기는 켜고 끄는 것이 아니다                                                                                                   |
| 기본 겉모습 — 바탕을 조금 진하게 + **테두리를 글자색으로**    | 색만으로 가르지 않는다. 테두리가 모양으로도 상태를 알린다. 토큰은 `--tx-tag-selected-bg` · `-fg` · `-border-color`               |
| 선택은 `--tx-tag-fg` 를 다시 정의하지 않고 값으로 직접 칠한다 | `--tx-tag-selected-fg` 의 기본값이 `--tx-tag-fg` 라, 거꾸로 정의하면 고리가 생긴다                                               |
| 점(`dot`)은 `currentColor`                                    | 선택돼 글자색이 바뀌면 점도 따라간다                                                                                             |
| hover 바탕은 `--tx-tag-hover-bg` 하나로 모았다                | soft · outline · 선택이 각자 이 값만 다시 정한다. 선택된 칩은 **선택 바탕 위에 상태색을 얹는다**(`TxButton` 의 hover 와 같은 식) |

**토큰은 태그 자신에 준다**(`.tx-tag` 나 거기 붙인 클래스). 부모에 주면 태그가 자기 기본값으로 덮는다.
