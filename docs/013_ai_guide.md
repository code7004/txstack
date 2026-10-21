# 013 · AI 가이드 — txstack 을 먼저 쓰는 규칙

> 소비자 프로젝트의 AI 코딩 도구(Claude Code · Codex 등)가 **화면을 짜기 전에 txstack 부품을 찾게 하는 규칙.**
> 부품 하나하나의 사용법은 각 부품 문서가 갖는다. 이 장은 **무엇을 고르고 무엇을 만들지 말지**만 정한다.

**이 가이드는 설치된 txstack 과 같은 버전이다.** `@txstack/ui` 를 설치하면 함께 온다.

| 무엇                         | 설치된 자리 (`node_modules/@txstack/ui/ai/`) | 사이트 (`https://code7004.github.io/txstack` 뒤) |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------ |
| 이 규칙                      | `ai/rules.md`                                | `/ai/rules.md`                                   |
| 목차 (부품마다 한 줄)        | `ai/llms.txt`                                | `/llms.txt`                                      |
| 전체 본문 (규칙 + 문서 전부) | `ai/llms-full.txt`                           | `/llms-full.txt`                                 |
| 부품 문서 한 장              | `ai/docs/001_ui/NNN_TxName.md`               | `/ai/docs/001_ui/…`                              |
| 패키지 README                | `ai/packages/<이름>/README.md`               | `/ai/packages/…`                                 |

**부품을 쓰기 전에 그 부품 문서 한 장을 읽는다.** props 의 정확한 타입은 `dist/*.d.ts` 가 갖는다.

---

## 1. 네 가지 원칙

1. **짜기 전에 찾는다.** 화면 요소를 만들기 전에 아래 결정표에서 부품을 찾는다. 있으면 그것을 쓴다
2. **원시 요소로 다시 만들지 않는다.** `<button>` · `<details>` · 손으로 짠 모달 · 토스트 · 드롭다운 · 카드 · GNB 는
   txstack 에 이미 있다 — 접근성 · 키보드 · 다크모드 · 토큰이 거기서 이미 풀려 있다
3. **겉모습은 토큰으로 바꾼다.** 부품 CSS 를 덮지 않는다. `--tx-*` 변수를 다시 정의한다
4. **부품이 정말 못 하는 것만 앱에서 만든다.** 그리고 그 자리에 이유를 남긴다 — txstack 을 보완할 후보다

## 2. 결정표 — 만들려는 것 → 쓸 부품

진입점이 적혀 있지 않으면 `@txstack/ui` 다.

### 누르기 · 고르기 · 입력

| 만들려는 것                                   | 쓸 부품                               | 짚을 것                                                                                             |
| --------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 버튼 · 제출 버튼 · 위험한 동작 버튼           | `TxButton`                            | `type` 기본값이 `"button"` 이다. 제출은 `type="submit"`. `onClick` 이 Promise 면 끝날 때까지 잠긴다 |
| 선 하나짜리 알약 버튼 (흰 바탕 + 테두리)      | `TxButton` + 토큰                     | `--tx-button-border-width` · `--tx-button-border-color`. `className` 으로 `border` 를 덮지 않는다   |
| 아이콘만 있는 버튼 (닫기 ✕ · 검색 ⌕ · 더보기) | `TxButton icon`                       | 정사각형이 된다. **`aria-label` 을 함께 준다**                                                      |
| 눌러서 글자 복사                              | `TxCopyButton`                        |                                                                                                     |
| ⋯ 더보기 메뉴 · 눌러서 펼치는 동작 목록       | `TxDropMenu`                          |                                                                                                     |
| 우클릭 메뉴                                   | `TxContextMenu`                       |                                                                                                     |
| 한 줄 입력 · 검색창                           | `TxInput` · `TxSearchInput`           |                                                                                                     |
| 여러 줄 입력                                  | `TxTextarea`                          |                                                                                                     |
| 숫자 입력 (올리고 내리기)                     | `TxNumberInput`                       | `type="number"` 를 쓰지 않는다                                                                      |
| 체크박스 · 라디오 · 켜고 끄는 스위치          | `TxCheckBox` · `TxRadio` · `TxSwitch` | 스위치는 "바로 적용", 체크박스는 "제출할 때 적용"                                                   |
| 값을 끌어서 고르기 (범위 포함)                | `TxSlider`                            |                                                                                                     |
| 하나 고르는 select · 여러 개 고르기           | `TxDropdown` · `TxDropdownMulti`      |                                                                                                     |
| 쳐 넣으면서 후보 고르기 (자동완성)            | `TxCombobox`                          |                                                                                                     |
| 날짜 고르기                                   | `TxDayPicker`                         | 진입점 `@txstack/ui/daypicker` + `react-day-picker`                                                 |
| 파일 고르기 · 끌어다 놓기                     | `TxFileUpload`                        | 어디로 보낼지는 앱이 정한다                                                                         |
| 비밀번호 칸의 Caps Lock 경고                  | `TxCapsLockCheck`                     |                                                                                                     |
| 폼의 캡션 · 필수 표시 · 오류 문구 · 2단 배치  | `TxForm` · `TxFormField`              | 캡션 · 오류를 입력란과 `<label>` · `aria-*` 로 잇는다                                               |

### 담기 · 배치

| 만들려는 것                                    | 쓸 부품         | 짚을 것                                                      |
| ---------------------------------------------- | --------------- | ------------------------------------------------------------ |
| 상자 · 카드 · 제목 단 패널                     | `TxCard`        | 테두리 · 모서리 · 그림자 · 여백을 여기서 정한다. 접기도 된다 |
| 펼침 · 접기 한 덩이 ("자세히 보기", FAQ 한 줄) | `TxCollapsible` | 네이티브 `<details>` 위라 접힌 글도 페이지 검색에 찾힌다     |
| 여러 덩이 중 하나씩만 펼치기                   | `TxAccordion`   |                                                              |
| 가로로 늘어놓기 · 간격                         | `TxFlex`        |                                                              |
| 2단 · 3단 칸 나누기                            | `TxGrid`        |                                                              |
| 구분선                                         | `TxDivider`     |                                                              |
| 탭                                             | `TxTabs`        |                                                              |
| 넘치는 내용을 굴리는 영역                      | `TxScrollArea`  | 양 끝이 흐려져 더 있다는 것을 알린다                         |
| 여러 장을 옆으로 넘기기 (캐러셀)               | `TxCarousel`    |                                                              |
| 저절로 흐르는 공지 줄                          | `TxTicker`      |                                                              |

### 표시 · 상태

| 만들려는 것                               | 쓸 부품                            | 짚을 것                                                                                                               |
| ----------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 상태 이름표 · 분류 · 개수 (`완료` `대기`) | `TxTag`                            |                                                                                                                       |
| 누를 수 있는 칩 · 지울 수 있는 필터 칩    | `TxTag onClick` · `TxTag onRemove` | Chip 이 따로 없다 — `TxTag` 가 맡는다                                                                                 |
| 켜고 끄는 필터 칩 (하나 · 여럿 고르기)    | `TxTag onClick selected`           | `selected` 가 `aria-pressed` 와 선택 겉모습(`--tx-tag-selected-*`)을 함께 준다. `data-selected` 를 손으로 달지 않는다 |
| 아이콘 · 아바타 위의 알림 점 · 개수       | `TxBadge`                          | 혼자 서는 이름표는 `TxTag`, 무언가에 **얹히는** 것은 `TxBadge`                                                        |
| 사람 한 명의 동그란 사진 · 이니셜         | `TxAvatar` · `TxAvatarGroup`       |                                                                                                                       |
| 올리면 뜨는 짧은 설명                     | `TxTooltip`                        |                                                                                                                       |
| 진행률 막대                               | `TxProgress`                       |                                                                                                                       |
| 객체 · JSON 을 접히는 트리로 보기         | `TxJsonTree`                       |                                                                                                                       |

### 기다림 · 빈 자리 · 알림

| 만들려는 것                                     | 쓸 부품                                                 | 짚을 것                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 내용이 올 자리를 미리 잡는 회색 덩이 (스켈레톤) | `TxSkeleton`                                            | `loading` 하나로 분기까지 맡는다. 삼항으로 가르지 않는다                                                           |
| "불러오는 중" 영역 · 전체 화면 딤               | `TxLoading`                                             |                                                                                                                    |
| 회전 아이콘 하나                                | `TxSpinner`                                             |                                                                                                                    |
| 데이터 없음 · 검색 결과 없음 · 오류 · 권한 없음 | `TxEmptyState`                                          | `variant` 로 넷을 가른다 — 다음에 할 일이 다르다                                                                   |
| 페이지 안에 박히는 안내 · 경고 상자             | `TxAlert`                                               |                                                                                                                    |
| 떴다 사라지는 알림 (토스트)                     | `TxToast.show(…)`                                       | **Provider 없이** 어디서든 부른다 — 컴포넌트 밖 · axios 인터셉터에서도                                             |
| `alert` · `confirm` 대신                        | `await TxDialog.alert(…)` · `await TxDialog.confirm(…)` | `window.alert` · `window.confirm` 을 쓰지 않는다                                                                   |
| 화면을 덮는 창 (모달)                           | `TxModal`                                               | 크기를 내용에 맡기려면 `size="auto"`. 본문 여백만 따로는 `--tx-modal-body-padding`                                 |
| 가장자리에서 밀려 나오는 서랍 (상세 · 필터)     | `TxSlidePanel`                                          |                                                                                                                    |
| 모바일 하단 시트 (내용만큼 올라오는 아래 패널)  | `TxSlidePanel side="bottom" size="auto"`                | 위 모서리는 `--tx-slide-panel-radius`, 본문 여백은 `--tx-slide-panel-body-padding`. 손으로 짠 시트를 만들지 않는다 |

### 화면 껍데기 · 내비게이션

| 만들려는 것                                    | 쓸 부품                          | 짚을 것                                                                                               |
| ---------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 화면 전체 껍데기 (헤더 · 사이드 · 본문 · 푸터) | `TxAppShell`                     | 머무는 헤더 · 본문으로 건너뛰기 · 좁아지면 `left` 를 서랍으로 · 크기 조절까지 셸이 한다               |
| 사이트 GNB · 가로 메뉴 줄 · 메가메뉴           | `TxNavBar`                       | `TxAppShell` 의 `top` 에 넣는다. 패널 속은 앱이 짠다                                                  |
| 세로 사이드 메뉴 · 아이콘 rail · 하위 트리     | `TxSideNav`                      | `TxAppShell` 의 `left` 에 넣는다                                                                      |
| 모바일 하단 탭바 (좁은 화면의 주 이동 줄)      | `TxAppShell tabBar` + `TxTabBar` | 셸의 `tabBar` 는 좁을 때만 화면 아래에 붙고 본문 자리를 비운다. `bottom` 은 콘솔 패널이라 쓰지 않는다 |
| 브레드크럼 (지금 위치 경로)                    | `TxBreadcrumb`                   | 경로 자체는 `@txstack/route-meta` 의 `useCurrentRoute` 가 준다                                        |

### 데이터 · 앱 구조

| 만들려는 것                                          | 쓸 것                               | 짚을 것                                                                               |
| ---------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| 표 (정렬 · 페이지 · 편집 · 선택)                     | `TxAgGrid`                          | 진입점 `@txstack/ui/aggrid`. **가벼운 표는 따로 없다.** ag-grid 모듈 등록은 앱이 한다 |
| 쪽 번호                                              | `TxPagination`                      | 표와 무관하다 — 카드 목록에도 쓴다                                                    |
| 라우트 · 메뉴 · 지금 위치 · 권한별 메뉴              | `@txstack/route-meta`               | 라우트 트리 하나에서 라우터 · 메뉴 · 브레드크럼을 파생시킨다                          |
| 검색 조건 · 필터 · 페이지를 주소(URL)에 담기         | `@txstack/hooks/useUrlQuery`        |                                                                                       |
| 객체 상태를 부분 병합으로                            | `@txstack/hooks/useObjectState`     |                                                                                       |
| API 클라이언트 (토큰 · 401 · 오류 메시지)            | `@txstack/axios` `createHttpClient` | 정책은 옵션으로 주입한다. 앱마다 axios 인스턴스를 새로 짜지 않는다                    |
| 숫자 · 날짜 · 전화번호 · 폼 값 · 쿠키 같은 작은 함수 | `@txstack/fns`                      | lodash 에 있는 것은 fns 에 없다 — 그건 lodash 를 쓴다                                 |

결정표에 없는 것을 만들려 하면 **먼저 `llms.txt` 의 부품 목록을 훑는다.** 그래도 없으면 5장으로 간다.

## 3. 직접 만들지 말 원시 요소

| 이렇게 짜지 않는다                                                            | 대신                                                                     | 이유                                                                                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `<button>`                                                                    | `TxButton`                                                               | `type` 기본값 · 비동기 연타 잠금 · 포커스 링 · 토큰이 빠진다. 폼 안의 `<button>` 은 의도치 않게 제출한다     |
| `<input>` · `<textarea>` · `<select>`                                         | `TxInput` · `TxTextarea` · `TxDropdown`                                  | 캡션 · 오류 연결과 토큰이 빠진다                                                                             |
| `<input type="checkbox · radio · range · number · file">`                     | `TxCheckBox` · `TxRadio` · `TxSlider` · `TxNumberInput` · `TxFileUpload` |                                                                                                              |
| `<details>` · `<summary>`, `useState` 로 짠 펼침                              | `TxCollapsible` · `TxAccordion`                                          | 손으로 짠 펼침은 접힌 글이 페이지 검색에 안 찾히고, `<details>` 를 그대로 쓰면 열림 애니메이션 · 토큰이 없다 |
| `<dialog>`, `fixed inset-0` 으로 짠 모달, `window.alert` · `confirm`          | `TxModal` · `TxDialog`                                                   | 포커스 가두기 · Escape · 뒤 화면 스크롤 잠금 · 토스트와의 층 순서를 다시 풀어야 한다                         |
| 손으로 짠 토스트 · 스낵바                                                     | `TxToast`                                                                | 모달 위에 떠야 하고(`popover`), 올리면 시계가 멈춰야 한다                                                    |
| 손으로 짠 드롭다운 · 팝오버 · 메뉴                                            | `TxDropdown` · `TxDropMenu` · `TxTooltip`                                | 바깥 클릭 · 화면 끝 넘침 · 방향키 · 팝업 안의 팝업을 다시 풀어야 한다                                        |
| `border rounded shadow p-4` 를 단 카드 `<div>`                                | `TxCard`                                                                 | 화면마다 모서리 · 그림자가 갈라진다. 다크모드가 토큰으로 안 따라온다                                         |
| 상태 칩 `<span className="rounded-full bg-green-100 …">`                      | `TxTag`                                                                  | 상태색 네 갈래와 대비(AA)가 이미 맞춰져 있다                                                                 |
| `<hr>`                                                                        | `TxDivider`                                                              |                                                                                                              |
| `<table>`                                                                     | `TxAgGrid`                                                               | 정렬 · 페이지 · 선택 · 테마가 표 하나로 간다                                                                 |
| 손으로 짠 `<header>` + `<nav>` GNB · 하단 탭바, 헤더 · 사이드 그리드 레이아웃 | `TxAppShell` · `TxNavBar` · `TxSideNav` · `TxTabBar`                     | 랜드마크 이름 · 건너뛰기 링크 · 좁은 화면 서랍 · 키보드 메뉴 규약이 빠진다                                   |
| 회색 `animate-pulse` 덩이                                                     | `TxSkeleton`                                                             |                                                                                                              |
| "데이터가 없습니다" 한 줄                                                     | `TxEmptyState`                                                           | 왜 비었는지, 다음에 무엇을 할지가 빠진다                                                                     |

**금지가 아닌 것** — `<div>` · `<section>` · `<h1>`~`<h6>` · `<p>` · `<ul>` 같은 구조 요소, 이동하는 링크(`<a>` · 라우터의
`<Link>` · `<NavLink>`). **이동은 링크로, 동작은 `TxButton` 으로** 가른다.

## 4. 커스터마이징 — 부품 CSS 를 덮지 않는다

**스타일시트는 한 번만 싣는다.** 이 줄이 없으면 아무 스타일도 없다.

```ts
import "@txstack/ui/styles.css";
```

**겉모습은 토큰을 다시 정의한다.** 전역 토큰 한 줄이면 `hover` · `focus` · 다크모드가 따라온다.

```css
:root {
  --tx-color-primary: #7c3aed; /* 채우는 색 — 버튼 배경 · 체크 · 진행 막대 */
  --tx-color-primary-strong: #6d28d9; /* 면 위에서 읽히는 색 — 현재 메뉴 · 탭 · 포커스 링 */
  --tx-radius: 0.5rem;
}

/* 부품 하나만 — 그 부품의 루트 클래스에서 그 부품 토큰을 덮는다 */
.tx-button {
  --tx-button-icon-size: 2.75rem;
}
```

- **강조색은 둘이다.** 브랜드색이 밝으면(민트 · 파스텔) `--tx-color-primary` 와 `--tx-color-primary-strong` 을 각각 준다
- **다크모드는 `<html>` 의 `.dark` 클래스 하나다** — `document.documentElement.classList.toggle("dark", isDark)`.
  다크용 값도 토큰으로 준다(`.dark { --tx-color-primary: … }`). 부품마다 `.dark` 규칙을 쓰지 않는다
- **부품 안쪽 클래스(`.tx-card__header` 같은 것)를 덮지 않는다.** `!important` 도 쓰지 않는다. 그러고 싶어지면
  토큰이 모자라다는 신호다 → 5장처럼 기록한다
- **`className` 은 자리(바깥 여백 · 폭 · 배치)에 쓴다.** 색 · 모서리 · 안쪽 여백은 토큰이 맡는다
- **선을 없애려면 색이 아니라 두께를 0 으로 둔다** — `--tx-app-shell-border-width` · `--tx-collapsible-border-width`.
  색만 `transparent` 로 두면 보이지 않는 1px 이 자리를 차지해 높이가 어긋난다
- **부품 토큰은 그 부품 자신(`.tx-tag` 나 거기 붙인 클래스)에 준다.** 부모 요소에 주면 부품이 자기 기본값으로 덮는다

**Tailwind 를 쓰는 앱은 레이어 순서를 먼저 못 박는다.** 안 하면 `tx` 레이어가 Tailwind 뒤에 붙어
화면에서 준 유틸리티 클래스가 부품 CSS 에 진다. 순서는 처음 나온 순서로 정해지므로 **Tailwind 진입 CSS 를 먼저** 불러온다.

```css
/* src/styles/tailwind.css */
@layer theme, base, tx, components, utilities;

@import "tailwindcss";
```

```css
/* src/styles/txstack.css */
@import "@txstack/ui/styles.css";
@import "./txstack-theme.css"; /* 토큰 재정의 — 레이어 밖에 둬도 된다 */

@layer components {
  /* 부품 기본값을 굳이 덮어야 할 때만 — 레이어 안이라 화면의 className 이 여전히 이긴다 */
}
```

```ts
// src/main.tsx — 이 순서로
import "./styles/tailwind.css";
import "./styles/txstack.css";
```

## 5. 부품이 못 하는 것 — 이때만 앱에서 만든다

부품 문서에 **"하지 않는다"** 고 적힌 것은 억지로 끼워 맞추지 않는다. 앱에서 직접 만들고 **이유를 남긴다.**

| 부품                  | 하지 않는 것                                                                         | 그럼                                                                               |
| --------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `TxAppShell` `bottom` | **모바일 하단 탭바가 아니다.** 본문 아래의 콘솔 · 로그 패널 자리다(끌어서 크기 조절) | 하단 탭바는 `tabBar` 자리 + `TxTabBar` 를 쓴다(2장)                                |
| `TxAppShell`          | 로고 · 메뉴 구조 · 로그인 상태를 정하지 않는다 — 전부 슬롯이다                       | 슬롯에 넣는다. **좁은 화면 서랍 · 햄버거는 셸이 한다** — 따로 만들지 않는다        |
| `TxNavBar`            | 스스로 접히지 않는다. 메가 패널의 속(링크 배치 · 그림)을 정하지 않는다               | 좁은 화면은 셸의 `left` 서랍에 `TxSideNav` 를 둔다. 패널 속은 `TxGrid` 등으로 짠다 |
| `TxSideNav`           | 접는 스위치를 그리지 않는다                                                          | `collapsed` 를 앱이 쥐고 헤더 버튼 등에서 바꾼다                                   |
| `TxCard`              | 로딩 표시 · 카드 전체가 링크가 되는 것                                               | 로딩은 `TxLoading` · `TxSkeleton`, 링크는 카드 **안**에 둔다                       |
| `TxFileUpload`        | 서버로 보내지 않는다                                                                 | 업로드 요청은 앱이(`@txstack/axios` 등)                                            |
| `TxAgGrid`            | ag-grid 모듈을 등록하지 않는다. 가벼운 읽기 전용 표는 없다                           | `ModuleRegistry.registerModules([...])` 를 앱이 한 번 부른다. 표는 늘 `TxAgGrid`   |
| (없음)                | 맨 위로 버튼 · 별점 · 이미지 최적화 · 사이트맵 판(`TxSiteMap`, 아직 공개 전)         | 앱이 만든다. 이미지는 프레임워크 것을 쓴다                                         |

**기록하는 법** — 직접 만든 자리에 `txstack-gap:` 주석으로 무엇이 왜 없었는지 적는다. 나중에 찾아 모아
txstack 에 올릴지 정한다.

```tsx
// txstack-gap: 맨 위로 버튼 — txstack 에 없다(앱이 짠다)
export function ScrollTopButton() { … }
```

부품 CSS 를 덮고 싶어진 자리도 같은 주석을 단다(`txstack-gap: TxCard 머리 높이 토큰 없음`).

## 6. 소비자 프로젝트 시작 묶음

### `CLAUDE.md` · `AGENTS.md` 에 붙일 문단

```md
## UI 는 txstack 을 먼저 쓴다

이 프로젝트의 UI 부품은 `@txstack/ui` 다. 화면 요소를 만들기 전에 txstack 가이드를 읽는다.
가이드는 설치된 버전과 같다 — `node_modules/@txstack/ui/ai/rules.md` (규칙 · 결정표),
`node_modules/@txstack/ui/ai/llms.txt` (부품 목록), 부품 한 장은 `node_modules/@txstack/ui/ai/docs/001_ui/`.

- 버튼 · 입력 · 펼침 · 카드 · 이름표 · 모달 · 토스트 · 드롭다운 · GNB · 화면 껍데기는 **Tx\* 부품을 쓴다.**
  `<button>` · `<details>` · 손으로 짠 모달 · 토스트 · 드롭다운 · 카드를 만들지 않는다
- 부품을 쓰기 전에 그 부품 문서 한 장을 읽는다
- 겉모습은 `--tx-*` 토큰으로 바꾼다. 부품 CSS(`.tx-*`)를 덮지 않고 `!important` 를 쓰지 않는다
- 부품이 못 하는 것만 직접 만들고, 그 자리에 `// txstack-gap: <무엇> — <이유>` 를 남긴다
- eslint `react/forbid-elements` 경고를 끌 때는 이유를 같이 적는다
```

### eslint — 대체품이 있는 원시 요소에 경고

`eslint-plugin-react` 의 `react/forbid-elements` 를 쓴다. **오류가 아니라 경고로 둔다** — 5장의 경우가 있다.

```js
// eslint.config.js
import react from "eslint-plugin-react";

const txstackFirst = {
  files: ["src/**/*.{jsx,tsx}"],
  plugins: { react },
  rules: {
    "react/forbid-elements": [
      "warn",
      {
        forbid: [
          { element: "button", message: "TxButton 을 쓴다 — 아이콘만 있으면 <TxButton icon aria-label>" },
          { element: "input", message: "TxInput · TxCheckBox · TxRadio · TxSlider · TxNumberInput · TxFileUpload 중 하나를 쓴다" },
          { element: "textarea", message: "TxTextarea 를 쓴다" },
          { element: "select", message: "TxDropdown · TxDropdownMulti 를 쓴다" },
          { element: "details", message: "TxCollapsible · TxAccordion 을 쓴다" },
          { element: "summary", message: "TxCollapsible 의 title 을 쓴다" },
          { element: "dialog", message: "TxModal · TxDialog 를 쓴다" },
          { element: "table", message: "TxAgGrid(@txstack/ui/aggrid) 를 쓴다" },
          { element: "hr", message: "TxDivider 를 쓴다" }
        ]
      }
    ]
  }
};

export default [
  // …앱의 기존 설정
  txstackFirst
];
```

**예외는 그 줄에서 끄고 이유를 적는다.** `--` 뒤가 이유다(eslint 9).

<!-- prettier-ignore -->
```tsx
<label className="color-field">
  배경색
  {/* eslint-disable-next-line react/forbid-elements -- txstack-gap: 색 고르기, txstack 에 색 입력이 없다 */}
  <input type="color" value={color} onChange={(evt) => setColor(evt.target.value)} />
</label>
```

### 버전을 올릴 때

가이드는 패키지와 같이 온다. 규칙 문단이 `node_modules/@txstack/ui/ai/` 를 가리키게 해 두면 **txstack 을 올리는 것만으로
가이드도 그 버전이 된다.** 가이드를 소비자 저장소에 복사해 두지 않는다 — 복사본은 버전이 어긋난다.

<!-- ai-guide:end — 이 아래는 txstack 을 고치는 사람 것이다. 배포되는 가이드에 실리지 않는다 -->

---

## 이 장을 고칠 때

**가이드는 빌드가 만든다.** 손으로 따로 관리하는 큰 문서를 두지 않는다 — 원본은 이 장과 기존 문서다.

| 산출물                | 만드는 곳                                                       | 언제                                    |
| --------------------- | --------------------------------------------------------------- | --------------------------------------- |
| `packages/ui/ai/`     | `@txstack/ui` 의 `build` (`node ../../scripts/ai-guide.mjs ai`) | `pnpm build` · `pnpm pack` 전           |
| 사이트 `/llms.txt` 등 | `apps/site/vite.config.ts` 의 `aiGuide()` 플러그인              | `pnpm site:dev` (메모리) · `site:build` |

생성기는 [`scripts/ai-guide.mjs`](../scripts/ai-guide.mjs) 하나다. 묶는 것:

- 이 장의 `ai-guide:end` 표시 **위쪽** → `rules.md`
- `docs/001_ui` · `002_route_meta` · `003_hooks` · `004_axios` · `012_fns` 의 장들 → `docs/…` (폴더 구조 그대로)
- `packages/*/README.md` → `packages/…`
- 부품 목록(`llms.txt`)은 각 장의 제목 · 첫 인용문 · 진입점 줄에서 뽑는다. **배럴에서 내보내지 않는 부품**(`TxIcons` ·
  `TxPopup` · 아직 공개 전인 것)은 목록에서 빠진다

**뺀 것** — `docs/012_fns/001_proposal.md`(결정 기록. 옛 이름이 섞여 있어 AI 가 그 이름을 쓰게 된다),
`docs/README.md` · `005`~`011`(진행 상태 · 사이트 계획 — 소비자가 지킬 규칙이 아니다).

**결정표는 손으로 쓴다** — "무엇을 만들려 할 때 무엇을 고르나" 는 문서에서 뽑을 수 없다. 대신
`scripts/ai-guide.test.ts` 가 지킨다: 결정표 · 원시 요소 표에 적힌 `Tx*` 이름이 전부 실제로 내보내지는지,
내보내는 부품이 결정표에 하나도 빠지지 않았는지. **새 부품을 만들면 결정표에 한 줄을 더한다** — 안 하면 테스트가 깨진다.
