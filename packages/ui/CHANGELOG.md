# @txstack/ui

## 0.1.5

### Patch Changes

- README 의 제목 · 표 머리글을 영어로 맞췄다 (Getting started · What's included · Requirements · Related packages · License 등). 본문과 코드는 바뀌지 않았다. ui 는 문서 · 스토리 · 주석의 개발 용어도 함께 정리했다 (부품 → 컴포넌트, 화면 껍데기 → app shell).

## 0.1.4

### Patch Changes

- 0916364: 접근성 결함 둘을 고쳤다. `TxDayPicker` · `TxDayPickerRange` 의 트리거가 `role="combobox"` 가 되어 폼 오류(`aria-invalid`)가 스크린리더에 전달된다 — 전에는 버튼 역할이라 무시됐다. 테스트에서 트리거를 찾는다면 `getByRole("combobox")` 로 바꾼다. `TxContextMenu` 를 왼쪽 클릭으로 여는 자리(`button="left"` · `"both"`)는 Tab 으로 닿고 Enter · Space 로 열린다. 키보드로 열면 감싼 요소의 가운데에 뜬다 — 전에는 화면 왼쪽 위에 떴다.

## 0.1.3

### Patch Changes

- 문서와 주석에서 특정 프로젝트를 가리키던 출처 표시를 일반 표현으로 바꿨다 — `ui` 의 `ai/` 가이드 · `styles.css` 주석, `axios` 의 타입 주석. 예제 데이터의 업무 낱말도 일반 관리 화면 데이터로 바꿨다. 코드 동작은 바뀌지 않았다.

## 0.1.2

### Patch Changes

- README 문구를 다듬었다 — 비유 대신 기술 용어를 쓰고, 장담하던 문장을 실제 동작 설명으로 바꿨다. 코드 변경은 없다.

## 0.1.1

### Patch Changes

- README 를 다시 썼다 — 어떤 상황에서 쓰는지부터 말하고, 예제 결과는 실제 출력과 맞췄다.
  npm 의 홈페이지 링크가 문서 사이트의 패키지 API 페이지(`https://code7004.github.io/txstack/api/<패키지>`)로 간다.
  코드는 바뀌지 않았다.

## 0.1.0

### Minor Changes

- 첫 버전. Tx\* 컴포넌트 40여 종 — 입력 · 폼 · 표(`TxAgGrid`) · 달력(`TxDayPicker`) · 앱 골격(`TxAppShell` · `TxSideNav` · `TxTabBar` · `TxBreadcrumb`) · 알림 · 대화상자.
  겉모습은 `--tx-*` CSS 변수와 `@layer tx` 로 바꾸고, 스타일시트는 `@txstack/ui/styles.css` 하나다. 다크모드는 토큰만 다시 정의하면 따라온다.
  무거운 선택적 의존(ag-grid · react-day-picker)은 서브패스(`@txstack/ui/aggrid` · `@txstack/ui/daypicker`)로 갈라 두어
  루트를 import 해도 딸려오지 않는다. 런타임 의존은 `clsx` 하나이고, `react` · `react-dom` 은 peer 다.
  AI 코딩 도구가 읽을 가이드를 `node_modules/@txstack/ui/ai/` 에 함께 싣는다(`rules.md` · `llms.txt` · `llms-full.txt`).
