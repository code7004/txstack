# @txstack/ui

관리자 화면을 만들 때 필요한 React 컴포넌트 모음입니다. 버튼 · 입력 · 폼 · 표 · 모달부터 사이드 메뉴가 있는
앱 골격까지 40여 가지가 들어 있습니다.

두 가지를 목표로 만들었습니다. **props 몇 개로 바로 쓸 수 있을 것**, 그리고 **CSS 변수 몇 줄로 우리 서비스의 모습으로 바꿀 수 있을 것.**

```sh
npm install @txstack/ui
```

`react` · `react-dom` 18 이상이 필요합니다.

## 시작하기

스타일시트를 한 번 불러오고, 컴포넌트를 가져다 씁니다.

```tsx
import "@txstack/ui/styles.css";
import { TxButton, TxFlex, TxLoading } from "@txstack/ui";

<TxFlex>
  <TxButton label="취소" variant="ghost" />
  <TxButton label="저장" onClick={async () => { await save(); }} />
</TxFlex>

<TxLoading visible={rows} text="목록을 불러오는 중" />
```

자주 손이 가는 부분은 컴포넌트가 미리 처리합니다. 예를 들어 `TxButton` 의 `onClick` 이 Promise 를 돌려주면,
끝날 때까지 버튼이 잠기고 스피너가 돕니다. 여러 번 눌러도 한 번만 실행됩니다.
`TxLoading` 의 `visible` 에 배열을 넘기면 그 배열이 비어 있는 동안만 보입니다.

## 들어 있는 것

| 종류         | 컴포넌트                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 입력         | `TxInput` · `TxSearchInput` · `TxTextarea` · `TxNumberInput` · `TxCheckBox` · `TxRadio` · `TxSwitch` · `TxSlider` · `TxCapsLockCheck`  |
| 고르기       | `TxDropdown` · `TxDropdownMulti` · `TxCombobox` · `TxDayPicker` · `TxFileUpload`                                                       |
| 폼           | `TxForm` — 라벨 · 오류 메시지 · 배치를 한 번에 묶습니다                                                                                |
| 표 · 데이터  | `TxAgGrid` · `TxPagination` · `TxJsonTree`                                                                                             |
| 버튼 · 메뉴  | `TxButton` · `TxCopyButton` · `TxMenu` (`TxDropMenu` · `TxContextMenu`)                                                                |
| 겹쳐 뜨는 것 | `TxModal` · `TxDialog` · `TxSlidePanel` · `TxTooltip` · `TxToast`                                                                      |
| 알림 · 상태  | `TxAlert` · `TxLoading` · `TxSpinner` · `TxSkeleton` · `TxProgress` · `TxEmptyState` · `TxBadge` · `TxTag` · `TxTicker`                |
| 배치 · 묶음  | `TxFlex` · `TxGrid` · `TxCard` · `TxDivider` · `TxTabs` · `TxCollapsible` · `TxAccordion` · `TxScrollArea` · `TxCarousel` · `TxAvatar` |
| 앱 골격      | `TxAppShell` · `TxNavBar` · `TxSideNav` · `TxTabBar` · `TxBreadcrumb`                                                                  |

컴포넌트마다 무엇을 할 수 있는지는 [Storybook](https://code7004.github.io/txstack/storybook/) 에서 직접 눌러 보며 확인할 수 있습니다.

### 표와 달력은 따로 가져옵니다

`TxAgGrid` 는 ag-grid 를, `TxDayPicker` 는 react-day-picker 를 씁니다. 둘 다 무거운 라이브러리라서
루트(`@txstack/ui`)와 분리해 두었습니다. 루트만 쓰는 앱은 이 라이브러리들을 설치하지 않아도 됩니다.

| 쓰려는 것                                                     | 가져오는 곳             | 함께 설치할 것                            |
| ------------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| 표 (`TxAgGrid` 계열)                                          | `@txstack/ui/aggrid`    | `ag-grid-community@35` `ag-grid-react@35` |
| 달력 (`TxDayPicker` · `TxDayPickerRange` · `TxFormDayPicker`) | `@txstack/ui/daypicker` | `react-day-picker@10`                     |

```tsx
import { TxAgGrid, type TxAgGridOption } from "@txstack/ui/aggrid";
import { TxDayPicker } from "@txstack/ui/daypicker";
```

ag-grid 모듈 등록은 앱에서 합니다. 필요한 모듈만 고르거나 Enterprise 판을 쓸 수 있게 하려는 것입니다.

```ts
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
```

## 모습 바꾸기

### 색 · 모서리 · 크기는 CSS 변수로

모든 겉모습은 `--tx-*` CSS 변수로 정해져 있습니다. 전체에 걸린 변수 하나를 바꾸면
hover · focus · 다크 모드까지 따라 바뀝니다. 상태마다 하나씩 덮어쓸 필요가 없습니다.

```css
:root {
  --tx-color-primary: #7c3aed; /* 브랜드 색 */
  --tx-radius: 9999px; /* 모든 모서리를 둥글게 */
}
```

강조색은 두 가지입니다. 버튼 바탕처럼 **채우는** `--tx-color-primary`, 그리고 흰 바탕 위에서 글자 · 테두리 · 포커스 링으로
**읽히는** `--tx-color-primary-strong` 입니다. 브랜드 색이 밝은 노랑이나 하늘색이라면 둘을 따로 정해야 글자가 잘 보입니다.

컴포넌트 하나만 바꾸고 싶다면 그 컴포넌트의 변수를 덮어씁니다.

```css
.tx-button {
  --tx-button-bg: #111;
}
```

### className 은 그냥 먹힙니다

모든 스타일은 `@layer tx` 안에 들어 있습니다. 레이어를 쓰지 않은 평범한 CSS 는 선택자가 얼마나 구체적이든 레이어 안의 스타일을 이깁니다.
그래서 순수 CSS · Sass · CSS Modules 로 `className` 을 주면 따로 할 일이 없습니다.

**Tailwind 를 쓴다면 한 줄이 필요합니다.** `tx` 레이어가 Tailwind 의 기본 스타일 뒤, 유틸리티 클래스 앞에 오도록 순서를 적어 줍니다.

```css
/* src/index.css — Tailwind 진입 CSS 의 맨 위 */
@layer theme, base, tx, components, utilities;

@import "tailwindcss";
```

```ts
// src/main.tsx — Tailwind 를 먼저, txstack 을 뒤에
import "./index.css";
import "@txstack/ui/styles.css";
```

레이어 순서는 처음 나온 순서로 정해집니다. 순서를 적은 CSS 가 가장 먼저 불리도록 진입 파일에서 바로 import 하세요.
지연 로딩되는 화면에서 불러오면 순서가 어긋날 수 있습니다.

앱 전체에 걸 기본 모습(변수 값, 컴포넌트 기본 스타일)은 txstack 전용 CSS 파일 하나에 모아 두세요.
컴포넌트 기본 스타일을 덮어쓰는 규칙은 `@layer components` 안에 넣습니다. 레이어 밖에 두면 화면에서 준 `className` 보다 강해집니다.

### 다크 모드

`dark` 클래스를 붙인 요소의 안쪽이 다크 모드가 됩니다. 보통은 `<html>` 에 붙입니다. 언제 붙일지(시스템 설정을 따를지, 토글을 둘지)는 앱이 정합니다.
다크 모드 색을 바꾸고 싶다면 `.dark` 아래에서 같은 변수를 다시 정의하면 됩니다.

## AI 코딩 도구와 함께 쓰기

패키지 안에 AI 코딩 도구가 읽을 가이드가 들어 있습니다. 설치한 버전과 내용이 항상 같습니다.

- `node_modules/@txstack/ui/ai/rules.md` — 만들려는 화면에 어떤 컴포넌트를 쓸지, 직접 만들면 안 되는 요소, 토큰으로 바꾸는 법
- `node_modules/@txstack/ui/ai/llms.txt` · `llms-full.txt` — 컴포넌트 목록과 전체 문서

Claude Code · Cursor 같은 도구의 프로젝트 지침(`CLAUDE.md` 등)에서 `rules.md` 를 읽게 해 두면, 이미 있는 컴포넌트를 새로 만드는 일이 줄어듭니다.

## 지원 환경

- ESM 전용이고, TypeScript 타입 선언이 들어 있습니다.
- React 18 · 19 에서 확인했습니다.
- 런타임 의존성은 `clsx` 하나입니다.

## 같은 시리즈

[`@txstack/hooks`](https://www.npmjs.com/package/@txstack/hooks) · [`@txstack/route-meta`](https://www.npmjs.com/package/@txstack/route-meta) ·
[`@txstack/axios`](https://www.npmjs.com/package/@txstack/axios) · [`@txstack/fns`](https://www.npmjs.com/package/@txstack/fns)

문서와 예제: <https://code7004.github.io/txstack/>

## 라이선스

MIT
