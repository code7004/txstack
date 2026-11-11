# @txstack/ui

## 0.1.0

### Minor Changes

- 첫 버전. Tx\* 컴포넌트 40여 종 — 입력 · 폼 · 표(`TxAgGrid`) · 달력(`TxDayPicker`) · 앱 골격(`TxAppShell` · `TxSideNav` · `TxTabBar` · `TxBreadcrumb`) · 알림 · 대화상자.
  겉모습은 `--tx-*` CSS 변수와 `@layer tx` 로 바꾸고, 스타일시트는 `@txstack/ui/styles.css` 하나다. 다크모드는 토큰만 다시 정의하면 따라온다.
  무거운 선택적 의존(ag-grid · react-day-picker)은 서브패스(`@txstack/ui/aggrid` · `@txstack/ui/daypicker`)로 갈라 두어
  루트를 import 해도 딸려오지 않는다. 런타임 의존은 `clsx` 하나이고, `react` · `react-dom` 은 peer 다.
  AI 코딩 도구가 읽을 가이드를 `node_modules/@txstack/ui/ai/` 에 함께 싣는다(`rules.md` · `llms.txt` · `llms-full.txt`).
