# @txstack/axios

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

- 첫 버전. 정책 주입식 HTTP 클라이언트(`createHttpClient`). 인증 토큰 · 401 처리 · 응답 봉투 · 로깅을
  패키지가 정하지 않고 옵션으로 받는다. 에러는 `parseApiError` 로 한 모양(`ApiError`)으로 읽는다.
  React 를 쓰지 않아 Node 에서도 돈다. 이미 있는 axios 인스턴스에는 `attachInterceptors` 로 정책만 붙인다.
