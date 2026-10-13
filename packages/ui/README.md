# @txstack/ui

Tx\* React 컴포넌트. 목표는 두 가지 — **쉬운 사용법, 쉬운 커스터마이징.**

```sh
pnpm add @txstack/ui react react-dom
```

| 진입점                   | 내용                                   | 추가 peer 의존                      |
| ------------------------ | -------------------------------------- | ----------------------------------- |
| `@txstack/ui`            | 대부분의 컴포넌트                      | 없음                                |
| `@txstack/ui/aggrid`     | `TxAgGrid` 계열                        | `ag-grid-community` `ag-grid-react` |
| `@txstack/ui/daypicker`  | `TxDayPicker` 계열 · `TxFormDayPicker` | `react-day-picker`                  |
| `@txstack/ui/styles.css` | 전체 스타일시트                        | —                                   |

루트를 import 한 소비자는 무거운 선택적 의존을 **설치하지 않아도 동작한다.**
`ag-grid` 관련은 값이든 타입이든 전부 `/aggrid`, 날짜 선택 관련은 전부 `/daypicker` 에서 꺼낸다.

```tsx
import { TxButton, TxFlex, TxLoading } from "@txstack/ui";
import { TxAgGrid, type TxAgGridOption } from "@txstack/ui/aggrid";
import "@txstack/ui/styles.css";

<TxFlex>
  <TxButton label="취소" variant="ghost" />
  <TxButton label="저장" onClick={async () => { await save(); }} />
</TxFlex>

<TxLoading visible={rows} text="목록을 불러오는 중" />
```

`onClick` 이 **Promise 를 반환하면** 해제될 때까지 버튼이 잠기고 스피너가 뜬다. 연타해도 한 번만 실행된다.
`TxLoading` 의 `visible` 에 **배열**을 주면 그 배열이 비어 있는 동안 보인다.

`TxAgGrid` 를 쓰면 **ag-grid 모듈 등록은 앱이 한다** — 필요한 모듈만 고르거나 enterprise 를 쓸 수 있게.

```ts
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
```

## 컴포넌트

| 무엇          | 컴포넌트                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 입력          | `TxInput` · `TxSearchInput` · `TxTextarea` · `TxNumberInput` · `TxCheckBox` · `TxRadio` · `TxSwitch` · `TxSlider` · `TxCapsLockCheck`  |
| 고르기        | `TxDropdown` · `TxDropdownMulti` · `TxCombobox` · `TxDayPicker` _(/daypicker)_ · `TxFileUpload`                                        |
| 폼            | `TxForm` — 캡션 · 에러 · 배치를 한 줄로 묶는다                                                                                         |
| 표 · 데이터   | `TxAgGrid` _(/aggrid)_ · `TxPagination` · `TxJsonTree`                                                                                 |
| 누르기        | `TxButton` · `TxCopyButton` · `TxMenu` (`TxDropMenu` · `TxContextMenu`)                                                                |
| 겹쳐 뜨는 것  | `TxModal` · `TxDialog` · `TxSlidePanel` · `TxTooltip` · `TxToast`                                                                      |
| 알리기 · 상태 | `TxAlert` · `TxLoading` · `TxSpinner` · `TxSkeleton` · `TxProgress` · `TxEmptyState` · `TxBadge` · `TxTag` · `TxTicker`                |
| 담기 · 배치   | `TxFlex` · `TxGrid` · `TxCard` · `TxDivider` · `TxTabs` · `TxCollapsible` · `TxAccordion` · `TxScrollArea` · `TxCarousel` · `TxAvatar` |
| 화면 · 길찾기 | `TxAppShell` · `TxNavBar` · `TxSideNav` · `TxBreadcrumb`                                                                               |

컴포넌트마다 무엇을 할 수 있는지는 [docs/001_ui](https://github.com/code7004/txstack/blob/main/docs/001_ui/000_README.md) 에서
한 장씩 본다.

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

**강조색은 둘이다** — 채우는 `--tx-color-primary` 와 면 위에서 글자 · 선 · 포커스 링으로
읽히는 `--tx-color-primary-strong`. 브랜드색이 밝으면 둘을 각각 줘야 글자가 읽힌다.

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

`styles.css` 를 JS 에서 import 하면 순서가 번들러 손에 넘어간다. Tailwind 진입 CSS 안에서 `@import` 한다.

### 다크 모드

`.dark` 클래스 전략이다. 토글 시점은 소비자가 통제한다.

## 라이선스

MIT
