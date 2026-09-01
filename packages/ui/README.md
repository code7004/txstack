# @txstack/ui

Tx\* React 컴포넌트. 목표는 두 가지 — **쉬운 사용법, 쉬운 커스터마이징.**

| 진입점                   | 내용               | 추가 peer 의존                      |
| ------------------------ | ------------------ | ----------------------------------- |
| `@txstack/ui`            | 대부분의 컴포넌트  | 없음                                |
| `@txstack/ui/aggrid`     | `TxAgGrid`         | `ag-grid-community` `ag-grid-react` |
| `@txstack/ui/daypicker`  | `TxDayPicker` 계열 | `react-day-picker` `dayjs`          |
| `@txstack/ui/styles.css` | 전체 스타일시트    | —                                   |

루트 배럴을 import 한 소비자는 무거운 선택적 의존을 **설치하지 않아도 동작한다.**

> **아직 npm 에 배포되지 않았다.** 컴포넌트를 이식 중이다.
> 전체 설계와 이행 계획은 [docs/001_ui](../../docs/001_ui/000_README.md).

## 지금 있는 것

`TxSpinner` · `TxButton` · `TxFlex` · `TxLoading`.

```tsx
import { TxButton, TxFlex, TxLoading, TxSpinner } from "@txstack/ui";
import "@txstack/ui/styles.css";

<TxFlex>
  <TxButton label="취소" variant="ghost" />
  <TxButton label="저장" onClick={async () => { await save(); }} />
</TxFlex>

<TxLoading visible={rows} text="목록을 불러오는 중" />
```

`onClick` 이 **Promise 를 반환하면** 해제될 때까지 버튼이 잠기고 스피너가 뜬다. 연타해도 한 번만 실행된다.
`TxLoading` 의 `visible` 에 **배열**을 주면 그 배열이 비어 있는 동안 보인다.

```sh
pnpm add @txstack/ui react react-dom
```

## 스타일

스타일시트는 **하나만 import 한다.**

```tsx
import "@txstack/ui/styles.css";
```

커스터마이징은 **CSS 커스텀 프로퍼티 토큰**으로 한다. 전역 토큰 한 줄만 바꾸면
`hover` · `focus` · `.dark` 가 저절로 따라온다 — 상태별로 하나씩 덮을 필요가 없다.

```css
:root {
  --tx-color-primary: #7c3aed;
  --tx-radius: 9999px;
}
```

컴포넌트 하나만 바꾸려면 그 컴포넌트 토큰을 덮는다.

```css
.tx-button {
  --tx-button-bg: #111;
}
```

### `className` 이 그냥 먹는다

모든 스타일이 `@layer tx` 안에 있다. **레이어를 안 쓰는 평범한 CSS 는 레이어 안 CSS 를
특이도와 무관하게 이긴다** — 순수 CSS · Sass · CSS Modules 를 쓰는 쪽은 아무것도 안 해도 된다.

**Tailwind 를 쓴다면 한 줄이 필요하다.** `tx` 가 preflight 뒤, 유틸리티 앞이어야 한다.

```css
@layer theme, base, tx, components, utilities;

@import "tailwindcss";
@import "@txstack/ui/styles.css";
```

### 다크 모드

`.dark` 클래스 전략이다. 토글 시점은 소비자가 통제한다.
