/**
 * `@txstack/axios` — axios 래퍼.
 *
 * **React 를 모른다.** 훅도 컨텍스트도 없다. Node 스크립트에서도 그대로 돈다.
 *
 * 인증 헤더·401 처리·응답 봉투·로깅은 **패키지가 결정하지 않는다.** 옵션으로 주입받는다.
 *
 * 전역 싱글턴(`initHttpClient` 계열)은 `@txstack/axios/singleton` 서브패스에 있다.
 * 권장하지 않으므로 이 배럴에서 내보내지 않는다 — 이유는 그 파일 주석에 있다.
 *
 * 설계: docs/004_axios.md
 */
export { createHttpClient } from "./client";
export { attachInterceptors } from "./interceptors";
export { isTokenExpired, parseApiError, removeUndefined } from "./utils";

export type { DeleteOptions, HttpClient, HttpClientOptions, IApiError, RequestLog, ResponseLog } from "./types";
