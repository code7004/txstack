# @txstack/ui

Tailwind v4 기반 `Tx*` React 컴포넌트 모음. 폼·테이블·오버레이·내비게이션을 다크모드까지 포함해 제공한다.

```sh
pnpm add @txstack/ui
```

`react` / `react-dom` / `react-router-dom` / `framer-motion` 은 peerDependency 다.

## 호환성

- **ESM 전용이다.** CommonJS `require()` 로는 불러올 수 없다 — `ERR_PACKAGE_PATH_NOT_EXPORTED` 가 난다.
  Node 가 내보내는 메시지(`No "exports" main defined`)는 원인을 알려주지 않으니 주의한다.
- TypeScript 의 `moduleResolution` 은 `bundler` · `node16` · `nodenext` 중 하나여야 한다.
  구형 `node` 설정에서는 **루트 엔트리만 해석되고 서브패스는 해석되지 않는다.**

## ⚠ Tailwind v4 설정 (필수)

이 패키지의 스타일은 런타임 CSS 가 아니라 **Tailwind 클래스 문자열**이다.
아래 `@source` 지정이 없으면 Tailwind 가 `node_modules` 안을 스캔하지 않아 **클래스가 전부 purge 되고 스타일이 하나도 적용되지 않는다.**

```css
/* src/index.css */
@import "tailwindcss";
@source "../node_modules/@txstack/ui/dist";
```

경로는 CSS 파일 기준 상대경로다. 모노레포에서 호이스팅됐다면 실제 `node_modules` 위치에 맞춘다.
다크모드는 `dark:` variant(class 전략) 기준이므로, `<html>` 이나 `<body>` 에 `dark` 클래스를 토글한다.

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

모든 컴포넌트는 `theme` prop 으로 기본 테마를 부분 재정의할 수 있다. 병합은 `themeMerge` 가 담당한다.

- `merge` (기본): 문자열 클래스는 `cm()` 으로 병합한다. Tailwind 충돌은 뒤쪽이 이긴다.
- `override`: 문자열 클래스를 교체한다.

```tsx
<TxButton theme={{ variant: { primary: "bg-emerald-500 hover:bg-emerald-600" } }}>저장</TxButton>
```

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
