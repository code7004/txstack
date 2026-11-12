# @txstack/ui

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
