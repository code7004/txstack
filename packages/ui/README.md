# @txstack/ui

`Tx*` React 컴포넌트 모음. 폼·테이블·오버레이·내비게이션을 다크모드까지 포함해 제공한다.
스타일은 **자체 CSS + `--tx-*` 토큰**으로 옮기는 중이고, 아직 Tailwind 클래스 문자열을 쓰는
컴포넌트가 남아 있다 → [스타일 설정](#스타일-설정).

```sh
pnpm add @txstack/ui
```

`react` / `react-dom` / `react-router-dom` / `framer-motion` 은 peerDependency 다.

## 호환성

- **ESM 전용이다.** CommonJS `require()` 로는 불러올 수 없다 — `ERR_PACKAGE_PATH_NOT_EXPORTED` 가 난다.
  Node 가 내보내는 메시지(`No "exports" main defined`)는 원인을 알려주지 않으니 주의한다.
- TypeScript 의 `moduleResolution` 은 `bundler` · `node16` · `nodenext` 중 하나여야 한다.
  구형 `node` 설정에서는 **루트 엔트리만 해석되고 서브패스는 해석되지 않는다.**

> **⚠ 이행 중이다 (2026-08-26).** 이 문서는 **지금 코드에 있는 그대로**를 적은 것이다.
> 스타일을 Tailwind 클래스 문자열에서 **자체 CSS + `--tx-*` 토큰**으로 옮기는 중이다
> (`docs/001_ui/20_design.md`). **26종 중 2종(`TxSpinner`·`TxButton`)이 옮겨졌고**,
> 그 둘은 `theme` prop 이 없다. 나머지 24종은 아직 예전 방식이다.
> **아직 배포된 버전은 없다.** 이행이 끝나면 아래 `@source` 절이 사라진다.

## 스타일 설정

**옮긴 컴포넌트와 안 옮긴 컴포넌트가 서로 다른 것을 요구한다.** 지금은 둘 다 해야 한다.

### 1. `styles.css` 를 import 한다 — 옮긴 2종에 필요하다

```tsx
// 앱 엔트리에서 한 번
import "@txstack/ui/styles.css";
```

빠뜨리면 `TxSpinner`·`TxButton` 의 스타일이 하나도 안 나온다.

> **Sass 를 쓴다면 `.scss` 안이 아니라 JS 에서 import 한다.** Sass 는 `.css` 로 끝나는 `@import` 를
> 해석하지 않고 그대로 흘려보내서, 번들러가 풀어주지 않으면 브라우저가 그 문자열을 URL 로 알고 실패한다.
> Vite 는 풀어주지만 **JS 에서 import 하면 그 갈림길 자체가 없다.**

### 2. Tailwind 를 쓴다면 레이어 순서를 적는다

`styles.css` 의 내용은 전부 **`tx` 캐스케이드 레이어** 안에 있다. 레이어에 없는 CSS 는 레이어에
있는 CSS 를 **특이도와 무관하게 이기기** 때문이다 — 우리가 레이어 밖에 있으면 `className` 으로
무엇을 주든 `.tx-button` 이 정한 속성이 꿈쩍도 하지 않는다.

```css
/* src/index.css */
@layer theme, base, tx, components, utilities;

@import "tailwindcss";
@import "@txstack/ui/styles.css"; /* JS 에서 import 했다면 생략 */
```

`tx` 는 **preflight(`base`) 뒤, 유틸리티 앞**이어야 한다. 앞에 두면 preflight 가 버튼의 배경과
여백을 지우고, 뒤에 두면 `className` 이 안 먹는다.

**순수 CSS · Sass · CSS Modules 를 쓴다면 이 절은 필요 없다.** 레이어를 안 쓰는 CSS 가 항상 이긴다.

### 3. `@source` 지정 — 아직 안 옮긴 24종에 필요하다

```css
@source "../node_modules/@txstack/ui/dist";
```

이 컴포넌트들의 스타일은 여전히 **Tailwind 클래스 문자열**이다. 이 줄이 없으면 Tailwind 가
`node_modules` 를 스캔하지 않아 **클래스가 전부 purge 되고 스타일이 하나도 안 남는다.**
경로는 CSS 파일 기준 상대경로다. 모노레포에서 호이스팅됐다면 실제 위치에 맞춘다.

> **이 줄은 임시다.** 옮긴 컴포넌트가 늘어날수록 필요 없어지고, 26종이 끝나면 삭제된다.
> 그때부터 **Tailwind 를 쓰지 않는 프로젝트에서도 전부 동작한다.**

### 다크모드

**`<html>` 이나 `<body>` 에 `dark` 클래스를 토글한다.** 양쪽 방식 모두 이 전략이다 —
옮긴 컴포넌트는 `.dark` 에서 토큰을 재정의하고, 안 옮긴 쪽은 Tailwind `dark:` variant 를 쓴다.

### 값 바꾸기 — 옮긴 컴포넌트는 CSS 변수다

```css
:root {
  --tx-color-primary: #7c3aed;
  --tx-radius: 9999px;
}
```

`hover` · 눌린 색 · 포커스 링 · 다크모드가 이 한 줄에서 따라온다. 상태 색은 배경에서 계산되므로
따로 줄 필요가 없다 (`color-mix()` — **2023년 이후 브라우저**가 필요하다).

## 엔트리

무거운 선택적 의존을 쓰는 컴포넌트는 서브패스로 분리되어 있다.
**코어 엔트리를 import 해도 ag-grid / react-day-picker 는 로드되지 않으므로, 설치하지 않아도 동작한다.**

| import                  | 추가로 설치할 peer                   | 포함                                                      |
| ----------------------- | ------------------------------------ | --------------------------------------------------------- |
| `@txstack/ui`           | —                                    | 아래 "코어 컴포넌트" 전부                                 |
| `@txstack/ui/aggrid`    | `ag-grid-community`, `ag-grid-react` | `TxAgGrid` 및 그리드 테마·페이지네이션                    |
| `@txstack/ui/daypicker` | `react-day-picker`, `dayjs`          | `TxDayPicker`, `TxDayPickerRange`, `TxFormDayPicker` 계열 |

```ts
import { TxButton, TxForm, TxModal } from "@txstack/ui";
import { TxAgGrid } from "@txstack/ui/aggrid";
import { TxDayPickerRange } from "@txstack/ui/daypicker";
```

### ag-grid 모듈 등록 (`/aggrid` 사용 시 필수)

ag-grid 는 트리셰이킹을 위해 명시적 모듈 등록을 요구한다. 라이브러리가 대신 등록하면 필요한 모듈만 고르거나
enterprise 모듈을 쓰는 선택지를 뺏게 되므로, **소비 앱이 직접 한다.**

```ts
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);
```

빠뜨리면 그리드가 빈 화면으로 뜨고 콘솔에 ag-grid error #272 가 찍힌다.
테마는 `TxAgGridProvider` 로 주입한다 (`themeId` 를 앱의 다크모드 상태에 물리면 된다).

## 코어 컴포넌트

| 분류     | 컴포넌트                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------- |
| 입력     | `TxInput` `TxSearchInput` `TxTextarea` `TxCheckBox` `TxDropdown` `TxDropdownMulti`                    |
| 폼       | `TxForm` (`.Field` `.Flex` `.Label` `.Input` `.SearchInput` `.Textarea` `.Dropdown` `.DropdownMulti`) |
| 표시     | `TxCard` `TxCoolTable`(deprecated) `TxJsonTree` `TxTabs` `TxLoading` `TxSpinner`                      |
| 오버레이 | `TxModal` `TxSlidePanel` `TxToolTip` `TxDropMenu` `TxContextMenu`                                     |
| 레이아웃 | `TxLayout` `TxHeader` `TxFlex`                                                                        |
| 기타     | `TxButton` `TxClipboardButton` `TxCapsLockCheck` `TxTheme` `TxIcons`                                  |

## 테마

**컴포넌트에 따라 방식이 다르다.** 이행 중이라 그렇다.

### 옮긴 컴포넌트 (`TxSpinner` · `TxButton`) — CSS 변수

`theme` prop 이 **없다.** 값은 `--tx-*` 토큰으로, 이 인스턴스의 겉은 `className`,
안쪽 슬롯은 `classNames` 로 바꾼다.

```tsx
<TxButton label="저장" className="my-cta" classNames={{ label: "truncate" }} />
```

```css
/* 앱 전체 */
:root {
  --tx-color-primary: #7c3aed;
}

/* 이 variant 만 — 없던 이름도 만들 수 있다 */
.tx-button[data-variant="brand"] {
  --tx-button-bg: #0f172a;
  --tx-button-fg: #fff;
  --tx-color-state: #fff; /* 배경이 아주 어두울 때 필요하다 — 아래 참고 */
}
```

> **배경이 아주 어둡거나(라이트 모드) 아주 밝으면(다크 모드) hover 가 안 보인다.**
> 상태 색을 배경에 섞어 만드는데, 섞는 색과 배경이 가까우면 값이 거의 안 움직이기 때문이다.
> 그 자리에만 `--tx-color-state` 를 반대쪽으로 주면 된다.

상태·변종은 `data-*` 로 나가므로 바깥에서 조준할 수 있다 (`data-variant` · `data-loading`).

### 나머지 24종 — `theme` prop

기본 테마를 부분 재정의한다. 병합은 `themeMerge` 가 담당한다.

- `merge` (기본): 문자열 클래스는 `cm()` 으로 병합한다. Tailwind 충돌은 뒤쪽이 이긴다.
- `override`: 문자열 클래스를 교체한다.

```tsx
<TxCard theme={{ wrapper: "border-emerald-500" }} />
```

**이 경로는 컴포넌트가 옮겨질 때마다 하나씩 사라진다.** `TxThemeProvider` 는 만들었다가 폐기했다 —
전역 브랜딩이 `:root` 한 줄이면 되기 때문이다.

유틸도 함께 export 한다: `cm`, `themeMerge`, `getDisplayName`, `copyToClipboard`, `getItemKey`, `numberToPeriod`.

## 원본 코드에서 달라진 점

이 패키지는 사내 3개 프로젝트의 `src/core/tx-ui` 를 합쳐 만들었다. 옮기면서 바뀐 공개 API 는 다음과 같다.

| 변경                                                            | 이유                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `TxForm.DayPicker` → `TxFormDayPicker` (`/daypicker`)           | 코어가 `react-day-picker` 를 import 하면 optional peer 가 성립하지 않음 |
| `TxForm.DayPickerRange` → `TxFormDayPickerRange` (`/daypicker`) | 위와 동일                                                               |
| `TxDayPickekRange` → `TxDayPickerRange`                         | 원본 오타 정정. 기존 이름은 deprecated 별칭으로 남겨둠                  |
| `TxAgGrid` → `@txstack/ui/aggrid`                               | ag-grid 를 쓰지 않는 소비자에게 설치를 강요하지 않기 위해               |

내부적으로는 `lodash` 와 `dayjs` 의존을 코어에서 제거했다 (동작은 동일함을 대조 검증).

## 라이선스

MIT
