# 003 · 로깅

> 요청 · 응답을 **콘솔 밖으로** 내보낸다.

| | |
| --- | --- |
| 진입점 | `@txstack/axios` (`createHttpClient` 의 옵션) |
| 내보내는 것 | `RequestLog` · `ResponseLog` (타입) |
| 소스 | [`packages/axios/src/interceptors.ts`](../../packages/axios/src/interceptors.ts) |
| 테스트 | 5개 |

## 개발 목적

원본은 `debug` 가 **콘솔 출력만** 했다. 그래서 모니터링 · Sentry · 파일로 **수집하는 것이
불가능**했다. 훅으로 내보내면 어디로 보낼지는 앱이 정한다.

## 기능

```ts
const api = createHttpClient({
  baseURL: "/api",

  onRequest: (log) => {
    // { method, url, params, data }  ← maskFields 적용된 값
  },
  onResponse: (log) => {
    // { status, method, url, data, durationMs }
    if (log.durationMs > 3000) reportSlowRequest(log);
  }
});
```

`debug: true` 는 **훅을 안 준 자리에만 기본 콘솔 로거를 붙이는 편의 플래그**다.
브라우저에서는 `%c` 색상 그룹으로, Node 에서는 평범한 `console.group` 으로 찍는다.

### 가리기

`maskFields` 기본값은 `password` · `privateKey` · `token` · `accessToken` · `refreshToken` 이고,
**훅에 넘기기 전에** 적용된다 — 주입된 로거가 값을 외부로 보낼 수 있기 때문이다.

최상위 키만 본다. 중첩된 값은 소비자가 `onRequest` 에서 직접 처리한다.

## 개발 항목

- [x] **구현** — `onRequest` · `onResponse` · `debug` · `maskFields`
- [x] **테스트** — 5개
- [x] **마스킹이 훅보다 먼저 돈다** — 순서가 뒤집히면 가리는 의미가 없다

## 정한 것 · 고친 것

| 원본 | 지금 | 왜 |
| --- | --- | --- |
| `debug` 가 `console` 출력만 | `onRequest`/`onResponse` 훅 추가 | 수집(모니터링·Sentry·파일)이 불가능했다 |
| `data` 만 가림 | `params` 도 가림 | **쿼리스트링에 토큰이 실릴 수 있다** |
