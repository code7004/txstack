---
"@txstack/ui": minor
---

`TxLoading` 을 명세에 맞춰 정리하고 **스타일을 자체 CSS 로 옮긴다** (`001-TxLoading-S1`~`S4`).

```tsx
import { TxLoading } from "@txstack/ui";
import "@txstack/ui/styles.css"; // 앱에서 한 번

// rows 가 채워지면 저절로 사라진다
<TxLoading visible={rows} text="목록을 불러오는 중" />;
<TxLoading visible={isNavigating} text="이동 중" fullScreen />;
```

```css
.tx-loading {
  --tx-loading-icon-size: 3em; /* 스피너를 크게 */
  --tx-loading-backdrop-opacity: 60%; /* 딤을 진하게 */
  --tx-loading-z: 9999; /* 앱 헤더보다 위로 */
}
```

## 겉모습이 바뀐다

- **자체 `Dots` 7개가 `TxSpinner` 하나로 바뀐다.** 로딩 시각 언어를 하나로 모으는 결정이다 —
  `TxButton` 의 로딩 표시와 같은 아이콘이 된다.
- **인라인 모드가 가로 한 줄이다** (`◌ 불러오는 중`). 세로 배치는 전체화면에만 남는다.
- **문구의 색과 크기를 정하지 않는다.** `text-xs` 회색 대신 **놓인 자리의 글자를 따라간다** —
  작은 캡션 안에서는 작게, 본문 옆에서는 본문 크기로 나온다. 예전 크기를 유지하려면
  `classNames={{ text: "…" }}` 또는 `.tx-loading__text` 를 조준한다.
- **`prefers-reduced-motion` 을 켠 사용자에게 애니메이션이 느려진다.** `animate-bounce` 는 무조건 튀었다.
  멈추지는 않는다 — 멈추면 "로딩 중" 이라는 정보 자체가 사라진다.

## `fullScreen` 이 `document.body` 로 포털된다

지금까지는 호출한 자리에 `position: fixed` 로 렌더했다. 그래서 **조상에 `transform`·`filter`·`contain`
이 하나라도 있으면 "화면 전체" 가 "그 조상 전체" 로 줄어들었다.** 하필 이 컴포넌트의 대표 용도가
페이지 전환 표시라, 전환 애니메이션(`transform`)과 정면으로 만나는 자리에서 가장 잘 깨졌다.

- 소비자 영향: **전체화면은 호출한 자리에서 상속을 받지 못한다.** 그래서 문구 색만은 토큰이 정한다
  (`--tx-loading-fg`, 기본값 `var(--tx-color-text)`). 인라인 문구는 그대로 상속이다
- SSR: `document` 가 없으면 첫 렌더에 아무것도 내지 않고 하이드레이션 뒤에 붙는다
- `react-dom` 은 이미 peerDependency 다 — 새 의존이 아니다

## 고친 결함

- **`fullScreen` 이 `className` 을 통째로 버렸다.** 오버레이 분기가 `className` 을 쓰지 않아
  소비자가 준 클래스가 에러도 경고도 없이 사라졌다. 이제 두 모드가 같은 노드를 쓴다.
- **전체화면의 문구가 딤 아래에 깔렸다.** 딤이 `absolute` 라 비포지션 형제인 문구보다 나중에 그려졌다
  (스피너만 `z-50` 으로 탈출해 있었다). 딤을 첫 자식으로 두고 안쪽 슬롯을 포지션 요소로 만들어 고쳤다 —
  `z-index` 를 쓰지 않으므로 소비자가 층 숫자를 계산할 일이 없다.
- **`text` 를 주지 않으면 빈 요소가 여백만 남겼다.** 이제 문구가 있을 때만 슬롯을 렌더한다.
- **로딩 상태를 스크린리더에 안내하지 않았다.** 문구가 있으면 래퍼가 `role="status"` 로 그 문구를 읽고,
  없으면 스피너의 기본 안내(`"Loading"`)에 맡긴다. **둘을 겹치지 않는다** — 겹치면 두 번 읽힌다.
- 무효 클래스 `justify-center` 제거 (높이 없는 column flex 에서는 아무 일도 안 한다).

## 공개 API

- **`visible` 의 타입이 `boolean | readonly unknown[]` 이다.** `any[]` 를 걷어냈다.
  **배열 규약은 그대로다** — 배열이 비어 있는 동안 보인다 (`TxCard` 의 `isLoading` 과 같다).
  단, 진짜로 0건인 응답과 로딩 중을 구분하지 못하므로 그 화면에서는 boolean 을 준다.
- **`classNames={{ icon, text, backdrop }}` 이 생겼다.** 안쪽 슬롯을 겨냥하는 자리다.
- **`HTMLAttributes<HTMLDivElement>` 를 통과시킨다** (`style` · `id` · `role` · `aria-*` …).
  `role` 을 주면 기본값을 이긴다.
- `TxLoadingProps` 는 이제 `TxLoading.tsx` 가 선언한다. `TxLoading.types.ts` 를 없앴다 —
  구현이 배럴을 거쳐 자기 타입을 import 하는 순환이 있었다. **import 경로는 배럴 그대로라 소비자 영향은 없다.**

## DOM · 새 토큰

```html
<div class="tx-loading" data-tag="TxLoading" data-full-screen role="status">
  <div class="tx-loading__backdrop"></div>
  <span class="tx-loading__icon">…</span>
  <span class="tx-loading__text">불러오는 중</span>
</div>
```

유틸리티 클래스가 사라졌다. 바깥에서 조준하려면 `.tx-loading[data-full-screen]` 처럼 쓴다.

| 토큰                            | 기본값                     | 쓰임                 |
| ------------------------------- | -------------------------- | -------------------- |
| `--tx-loading-icon-size`        | `1.5em` (전체화면 `2.5em`) | 스피너 크기          |
| `--tx-loading-gap`              | `0.5em` (전체화면 `1em`)   | 아이콘과 문구 사이   |
| `--tx-loading-backdrop-opacity` | `20%`                      | 딤의 진하기          |
| `--tx-loading-backdrop-bg`      | 아래 참고                  | 딤의 색              |
| `--tx-loading-fg`               | `var(--tx-color-text)`     | **전체화면** 문구 색 |
| `--tx-loading-z`                | `50`                       | 전체화면 `z-index`   |

**크기와 간격이 `em` 이다.** 아이콘·문구·간격이 함께 놓인 자리의 글자 크기를 따라간다.

**딤의 색은 리터럴이 아니다.** `--tx-color-state` 에 위 비율을 섞어 만든다. 그 색이 다크모드에서
뒤집히므로 **라이트는 검게 · 다크는 밝게** 덮이고, 컴포넌트 CSS 에 `.dark` 분기가 한 줄도 없다.
진하기만 바꾸려면 `--tx-loading-backdrop-opacity` 하나다.

어느 모드에서나 **어둡게** 덮으려면 섞는 색을 그 자리에서 고정한다. 그때는 문구 색을 함께 준다 —
진한 딤은 배경이 반대쪽으로 넘어가기 때문이다.

```css
.tx-loading[data-full-screen] {
  --tx-color-state: #000;
  --tx-loading-backdrop-opacity: 60%;
  --tx-loading-fg: #fff;
}
```

> `color-mix()` 를 쓴다 — 지원 하한은 `TxButton` 과 같다 (Chrome 111 · Safari 16.2 · Firefox 113).

명세: `docs/001_ui/components/03_TxLoading.md`
