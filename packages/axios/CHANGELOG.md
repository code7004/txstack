# @txstack/axios

## 0.1.0

### Minor Changes

- 첫 버전. 정책 주입식 HTTP 클라이언트(`createHttpClient`). 인증 토큰 · 401 처리 · 응답 봉투 · 로깅을
  패키지가 정하지 않고 옵션으로 받는다. 에러는 `parseApiError` 로 한 모양(`ApiError`)으로 읽는다.
  React 를 쓰지 않아 Node 에서도 돈다. 이미 있는 axios 인스턴스에는 `attachInterceptors` 로 정책만 붙인다.
