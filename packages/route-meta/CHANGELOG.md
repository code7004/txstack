# @txstack/route-meta

## 0.1.0

### Minor Changes

- 첫 버전.

  **`@txstack/ui`** — Tx\* 컴포넌트 40여 종. 겉모습은 `--tx-*` CSS 변수와 `@layer tx` 로 바꾸고,
  스타일시트는 `@txstack/ui/styles.css` 하나다. 무거운 선택적 의존(ag-grid · react-day-picker)은
  서브패스(`@txstack/ui/aggrid` · `@txstack/ui/daypicker`)로 갈라 두어 루트를 import 해도 딸려오지 않는다.
  런타임 의존은 `clsx` 하나이고, `react` · `react-dom` 은 peer 다.

  **`@txstack/hooks`** — 범용 훅과 URL 쿼리 상태.

  **`@txstack/route-meta`** — 라우트를 메타데이터(아이콘 · 경로 · 권한)로 다룬다.

  **`@txstack/axios`** — 정책 주입식 HTTP 클라이언트. 인증 토큰 · 401 처리 · 응답 봉투를
  패키지가 정하지 않고 옵션으로 받는다. React 를 쓰지 않는다.
