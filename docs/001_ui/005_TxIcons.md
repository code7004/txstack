# 005 · TxIcons

> **내부 전용 아이콘. 배럴(`src/index.ts`)에서 내보내지 않는다.**

| | |
| --- | --- |
| 진입점 | **내부 전용** — 배럴에서 내보내지 않는다 |
| 내보내는 것 | `TxIcons` |
| 소스 | [`packages/ui/src/TxIcons/`](../../packages/ui/src/TxIcons) |
| 테스트 | 18개 |

## 개발 목적

컴포넌트가 스스로 그려야 하는 아이콘 몇 개. **소비자에게 팔지 않는다** — 두어 개짜리 세트는 쓸모가 없고, 공개하면 이름과 모양이 공개 API 가 되어 바꿀 때마다 major 다.

## 기능

두 개짜리 아이콘 세트는 소비자에게 쓸모가 없다 — 소비자는 이미 자기 세트(lucide·heroicons…)를
쓴다. 공개하면 이름과 모양이 공개 API 가 되어 바꿀 때마다 major 다.
**닫는 건 major 지만 나중에 여는 건 minor** 이므로 지금은 닫아 둔다.

소비자가 아이콘을 갈아끼워야 하는 자리(입력창의 지우기·검색 버튼)는
그 컴포넌트가 prop 으로 받는 쪽이 맞다. `TxInput` 을 옮길 때 판단한다.

## 두 가지 규약

- **`width`/`height` 가 `1em`** — 놓인 자리의 `font-size` 를 따라간다
- **`fill="currentColor"`** — 놓인 자리의 `color` 를 따라간다

`TxSpinner` 와 같은 규약이다. 그래서 버튼이나 문단 안에 넣으면 저절로 맞는다.
크기를 따로 주려면 `width`/`height` 를 넘긴다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxIcons/`
- [x] **테스트** — 18개
- [x] **스토리** — `TxIcons.stories.tsx`
- [ ] **CSS** — 없다

## 정한 것 · 고친 것

7개 중 **`TxIconClose` · `TxIconSearch` 둘만** 가져왔다.

- `IconSortAsc` · `IconSortDesc` · `IconLayout` 은 **쓰는 곳이 하나도 없었다.**
  정렬 아이콘 2개는 제외 확정된 `TxCoolTable` 것이었다
- `IconDragHandle*` 2개는 `TxLayout`(3차 후보) 것이라 그때 함께 온다

**배럴에서 내보내지 않는다.** 두 개짜리 세트는 소비자에게 쓸모가 없고(이미 lucide·heroicons 를 쓴다),
공개하면 이름과 모양이 공개 API 가 되어 바꿀 때마다 major 다.
**닫는 건 major 지만 나중에 여는 건 minor** 라 지금은 닫는다.

소비자가 아이콘을 갈아끼워야 하는 자리(입력창의 지우기·검색 버튼)는 그 컴포넌트가 prop 으로
받는 쪽이 맞다 — `TxInput` 을 옮길 때 판단한다.

두 규약이 조합의 근거다: **`1em`** (놓인 자리의 `font-size`) · **`currentColor`** (놓인 자리의 `color`).
`TxSpinner` 와 같다.

안 가져온 5개에 결함이 몰려 있었다 — `IconDragHandleHonrizonBold` 오타, `IconLayout` 의
kebab-case DOM 속성(React 콘솔 경고), `SVGRepo_*` 껍데기 `<g>` 3중첩(하드코딩 `id` 라 같은
페이지에 둘만 놓여도 중복), `1em` 누락. 가져온 둘에는 하나도 없다.

`TxForm.DayPicker` / `DayPickerRange` 는 **루트 배럴에 없다.** `@txstack/ui/daypicker` 가
가져간다 — 코어가 `react-day-picker` 를 import 하면 optional peer 가 성립하지 않는다.
이 분리는 temp 에서 이미 지켜져 있다.

### 아이콘을 `TxIcons` 에 넣지 않았다 (판단)

갈래마다 붙는 아이콘 네 개는 `TxAlert` 안에 둔다. **`TxIcons` 에 이름을 더하는 것은
공개 API 를 늘리는 일**이라 따로 정할 문제다. `TxToast` 는 같은 어휘를 쓰므로 여기서
가져다 쓴다. (`TxDropdown` 의 화살표, `TxJsonTree` 의 펼침표가 같은 선례다.)

### `title` 이 `HTMLAttributes` 와 부딪힌다

`title` 은 DOM 속성이라 `string` 만 받는데 우리는 `ReactNode` 를 받는다. `Omit` 으로
가려냈다 — `TxModal` 이 이미 같은 자리를 지나갔다.
