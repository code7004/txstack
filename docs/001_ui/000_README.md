# 001 · `@txstack/ui`

**Tx\* React 컴포넌트. 목표는 두 가지 — 쉬운 사용법, 쉬운 커스터마이징.**

이 폴더가 `ui` 패키지의 문서다. **여기는 목록과 진행 상황만 갖는다** —
컴포넌트 하나하나의 목적 · 기능 · 개발 항목은 각자의 문서에 있고,
컴포넌트에 속하지 않는 규약은 [900_공통규약](900_common.md) 이 갖는다.

저장소 전체의 상태와 다음 할 일은 [docs/README](../README.md) 가 갖는다.

## 무엇을 해결하는가

세 프로젝트가 같은 모달, 같은 드롭다운, 같은 표를 각자 복사해 들고 있었다.
한 곳에서 버그를 고쳐도 나머지 둘은 그대로였다.

**그냥 옮기는 것이 아니다.** 원본은 앱 전역 타입 · 도메인 지식 · `import.meta.env` 에
묶여 있었고, **그걸 걷어내야 라이브러리가 된다.**
판정 기준은 하나다 — **네 번째 프로젝트가 설치해서 그대로 쓸 수 있는가.**

## 진입점

무거운 선택적 의존은 **서브패스로 가른다.** 루트 배럴을 import 한 소비자는
`ag-grid` 나 `react-day-picker` 를 설치하지 않아도 동작해야 한다.

| 진입점 | 내용 | 추가 peer |
| --- | --- | --- |
| `@txstack/ui` | 대부분의 컴포넌트 | 없음 |
| `@txstack/ui/aggrid` | `TxAgGrid` 계열 | `ag-grid-community` `ag-grid-react` |
| `@txstack/ui/daypicker` | `TxDayPicker` 계열 | `react-day-picker` |
| `@txstack/ui/styles.css` | 전체 스타일시트 | — |

```tsx
import { TxButton, TxModal } from "@txstack/ui";
import { TxAgGrid } from "@txstack/ui/aggrid";
import "@txstack/ui/styles.css";
```

`tokens.css` 는 별도 진입점이 아니다 — `styles.css` 가 `@import` 로 먼저 싣는다.

## 개발 리스트

**47개가 끝났다. 컴포넌트 테스트 1,514개.** 번호는 **만든 차례**다 —
새로 만드는 것은 뒤에 붙고, 번호는 다시 매기지 않는다.

| 번호 | 컴포넌트 | 무엇 | 테스트 |
| --- | --- | --- | --- |
| 001 | [`TxButton`](001_TxButton.md) | 누르면 뭔가 일어나는 자리 | 41 |
| 002 | [`TxFlex`](002_TxFlex.md) | 가로로 늘어놓는 자리 | 16 |
| 003 | [`TxLoading`](003_TxLoading.md) | "로딩 중" 을 화면에 세우는 자리 | 30 |
| 004 | [`TxSpinner`](004_TxSpinner.md) | 로딩 중임을 알리는 회전 아이콘 | 20 |
| 005 | [`TxIcons`](005_TxIcons.md) *(내부)* | 내부 전용 아이콘 | 18 |
| 006 | [`TxInput`](006_TxInput.md) | 한 줄 입력 | 43 |
| 007 | [`TxTextarea`](007_TxTextarea.md) | 여러 줄 입력 | 29 |
| 008 | [`TxCheckBox`](008_TxCheckBox.md) | 고르는 자리 | 32 |
| 009 | [`TxCapsLockCheck`](009_TxCapsLockCheck.md) | 비밀번호를 칠 때 Caps Lock 이 켜져 있으면 알려 준다 | 22 |
| 010 | [`TxDropdown`](010_TxDropdown.md) | 하나를 고르는 드롭다운 | 41 |
| 011 | [`TxPopup`](011_TxPopup.md) *(내부)* | 앵커에 붙어 뜨는 층 | 0 |
| 012 | [`TxCombobox`](012_TxCombobox.md) | 직접 쳐 넣으면서 후보도 고르는 입력창 | 35 |
| 013 | [`TxDayPicker`](013_TxDayPicker.md) `/daypicker` | 날짜 하나를 고른다 | 43 |
| 014 | [`TxForm`](014_TxForm.md) | 폼 한 줄을 짜는 계층 | 39 |
| 015 | [`TxAgGrid`](015_TxAgGrid.md) `/aggrid` | ag-grid 위에 목록 화면에서 늘 하는 일을 얹은 표 | 43 |
| 016 | [`TxPagination`](016_TxPagination.md) | 쪽 번호 | 20 |
| 017 | [`TxModal`](017_TxModal.md) | 화면을 덮고 뜨는 창 | 35 |
| 018 | [`TxDialog`](018_TxDialog.md) | 네이티브 alert · confirm 을 대신하는 확인창 | 21 |
| 019 | [`TxTabs`](019_TxTabs.md) | 탭 | 29 |
| 020 | [`TxCard`](020_TxCard.md) | 내용을 담는 상자 | 26 |
| 021 | [`TxTooltip`](021_TxTooltip.md) | 올리면 뜨는 짧은 설명 | 31 |
| 022 | [`TxMenu`](022_TxMenu.md) | 눌러서 펼치는 메뉴와 우클릭 메뉴 | 33 |
| 023 | [`TxSlidePanel`](023_TxSlidePanel.md) | 가장자리에서 밀려 나오는 패널(서랍) | 48 |
| 024 | [`TxJsonTree`](024_TxJsonTree.md) | 임의의 객체를 접을 수 있는 트리로 그린다 | 100 |
| 025 | [`TxAlert`](025_TxAlert.md) | 페이지 안에 박히는 안내 상자 | 38 |
| 026 | [`TxToast`](026_TxToast.md) | 떴다 사라지는 알림 | 35 |
| 027 | [`TxCollapsible`](027_TxCollapsible.md) | 눌러서 접고 펴는 한 덩이 | 32 |
| 028 | [`TxAccordion`](028_TxAccordion.md) | 여러 덩이를 이어 붙이고 하나씩만 열리게 한다 | 37 |
| 029 | [`TxTag`](029_TxTag.md) | 작은 이름표 | 35 |
| 030 | [`TxSkeleton`](030_TxSkeleton.md) | 내용이 올 자리를 미리 잡아 두는 회색 덩이 | 45 |
| 031 | [`TxBadge`](031_TxBadge.md) | 무언가에 붙는 알림 점·개수 | 26 |
| 032 | [`TxCopyButton`](032_TxCopyButton.md) | 눌러서 글자를 복사하는 버튼 | 21 |
| 033 | [`TxDivider`](033_TxDivider.md) | 가르는 선 | 20 |
| 034 | [`TxEmptyState`](034_TxEmptyState.md) | 보여 줄 것이 없을 때 그 자리에 놓는 안내 | 27 |
| 035 | [`TxGrid`](035_TxGrid.md) | 칸을 나눠 담는 자리 | 18 |
| 036 | [`TxProgress`](036_TxProgress.md) | 얼마나 왔는지 보여 주는 막대 | 32 |
| 037 | [`TxFileUpload`](037_TxFileUpload.md) | 파일을 골라 올리는 자리 | 24 |
| 038 | [`TxNumberInput`](038_TxNumberInput.md) | 숫자를 넣고 올리고 내리는 자리 | 38 |
| 039 | [`TxRadio`](039_TxRadio.md) | 여럿 중 하나를 고르는 자리 | 24 |
| 040 | [`TxSlider`](040_TxSlider.md) | 값을 끌어 고르는 자리 | 24 |
| 041 | [`TxSwitch`](041_TxSwitch.md) | 그 자리에서 바로 켜고 끄는 자리 | 24 |
| 042 | [`TxBreadcrumb`](042_TxBreadcrumb.md) | 계층 경로 | 24 |
| 043 | [`TxScrollArea`](043_TxScrollArea.md) | 넘치는 내용을 굴려 보는 자리 | 18 |
| 044 | [`TxAppShell`](044_TxAppShell.md) | 화면 전체를 짜는 껍데기 | 71 |
| 045 | [`TxAvatar`](045_TxAvatar.md) | 사람 한 명을 나타내는 동그란 칸 | 28 |
| 046 | [`TxTicker`](046_TxTicker.md) | 저절로 움직이는 공지 줄 | 28 |
| 047 | [`TxCarousel`](047_TxCarousel.md) | 여러 장을 옆으로 넘겨 보는 자리 | 50 |

*(내부)* 는 배럴에서 내보내지 않는 부품이다 — 소비자가 이름을 볼 수 없다.
`/daypicker` `/aggrid` 는 서브패스 전용이다.

## 아직 없는 것

| 무엇 | 상태 | 먼저 정할 것 |
| --- | --- | --- |
| 메가메뉴 (`TxNavBar`) | **다음 차례** | **`TxAppShell` 이 `header` 를 이미 가졌다.** 무엇이 셸 몫이고 무엇이 남는지부터 |
| `TxTable` | 예정 | **어디까지가 `TxAgGrid` 몫인지.** `columns` 를 ag-grid `colDef` 의 부분집합으로 잡을지가 첫 갈림길 |

## 자른 것 · 안 만드는 것

이식 대상 26개 중 **23개를 가져왔다.** 나머지와, 후보였다가 접은 것들이다.

| 무엇 | 왜 |
| --- | --- |
| `TxCoolTable` (1,024줄) | 표는 `TxAgGrid` 가 맡는다 |
| `TxTheme` (29줄) | Tailwind 클래스 문자열 상수. 토큰 방식과 어긋난다 — [900_공통규약](900_common.md) |
| `TxHeader` (62줄) | 실체가 `text-xl font-semibold` 를 건 `<div>` 였다 |
| `TxLayout` (447줄) | 앱 사용 0회. **`TxAppShell` 이 그 자리를 대신한다** — 한 화면에 셸이 둘일 일이 없다 |
| `TxClipboardButton` | 버튼이 아니라 `<div onClick>` 이었다. **`TxCopyButton` 으로 되살렸다** |
| `TxScrollTop` | 앱이 다섯 줄로 짠다 |
| `TxRating` | 도메인 냄새가 난다 |
| `TxImage` | 프레임워크가 각자 자기 것을 갖고 있다 |

## 문서 규칙

- **컴포넌트 하나에 문서 하나.** 파일 이름은 `NNN_TxName.md`, 번호는 만든 차례다
- **문서는 설명이 아니라 예제 코드로 쓴다.** 사용법 스니펫이 곧 API 합의서다
- **"기능" 절의 출처는 컴포넌트의 JSDoc 이다.** 소비자가 Storybook 에서 보는 것과 같은 글이라,
  둘 중 하나만 고치면 어긋난다 — 고칠 때 함께 본다
- **상태(무엇이 끝났고 다음이 무엇인지)는 [docs/README](../README.md) 한 곳에만 쓴다**
- 아직 만들지 않은 것을 만든 것처럼 쓰지 않는다. **없으면 "없음" 이라고 쓴다**
