# @txstack/axios

axios 래퍼. **인증·에러·응답봉투·로깅 정책을 옵션으로 주입받는다.**
React 를 모른다 — Node 스크립트에서도 그대로 돌아간다.

> **아직 npm 에 배포되지 않았다.** 전체 설계는 [docs/004_axios.md](../../docs/004_axios.md).

```sh
pnpm add @txstack/axios axios
```

`axios >=1.6` 은 peerDependency 다.

## 쓰기

```ts
// src/lib/api.ts — 앱에 이 파일 하나만 두면 된다. ESM 모듈 자체가 싱글턴이다.
import { createHttpClient } from "@txstack/axios";

export const api = createHttpClient({
  baseURL: "/api",
  getToken: () => localStorage.getItem("accessToken"),
  onUnauthorized: () => logout(),
  unwrap: (data) => (data as { body: unknown }).body
});
```

```ts
const user = await api.get<User>("/users/1");
const list = await api.get<User[]>("/users", { page: 1, size: 20 });
await api.post<void>("/users", { name: "kim" });
await api.delete<void>("/users/1", { params: { force: true } });

const file = await api.getBlob("/export/xlsx"); // 브라우저·Node 양쪽에서 Blob
```

## 이 패키지가 정하지 않는 것

토큰을 어디서 읽는지, 401 에 무엇을 할지, 응답 봉투가 `{ body }` 인지 `{ data }` 인지,
로그를 콘솔에 찍을지 모니터링 서버로 보낼지 — **전부 옵션으로 주입받는다.**

`withCredentials` 기본값도 axios 와 같은 `false` 다. 쿠키 인증을 쓰는 앱이 명시적으로 켠다.

## 로깅

```ts
createHttpClient({
  baseURL: "/api",
  onRequest: (log) => {
    /* { method, url, params, data } */
  },
  onResponse: (log) => {
    if (log.durationMs > 3000) reportSlow(log);
  },
  debug: true // 훅을 안 준 자리에만 기본 콘솔 로거를 붙인다
});
```

민감한 필드(`password` · `privateKey` · `token` · `accessToken` · `refreshToken`)는
**훅에 넘기기 전에** 가려진다. `maskFields` 로 바꿀 수 있다.

## 서브패스

| 진입점                     | 내용                                                            |
| -------------------------- | --------------------------------------------------------------- |
| `@txstack/axios`           | `createHttpClient` · `attachInterceptors` · 유틸 · 타입         |
| `@txstack/axios/singleton` | `initHttpClient` 계열. 기존 `getAxios` 패턴 이행용 — 권장 안 함 |
