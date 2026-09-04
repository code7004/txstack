# 001 · createHttpClient

> 클라이언트를 만든다. **정책은 전부 여기서 주입받는다.**

|             |                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 진입점      | `@txstack/axios`                                                                                                                     |
| 내보내는 것 | `createHttpClient` · `HttpClientOptions`                                                                                             |
| 소스        | [`packages/axios/src/client.ts`](../../packages/axios/src/client.ts) · [`interceptors.ts`](../../packages/axios/src/interceptors.ts) |
| 테스트      | 15개 (**node 환경**)                                                                                                                 |

## 개발 목적

세 프로젝트가 각자 axios 인스턴스를 만들면서 매번 같은 것을 다시 짰다 — Authorization
헤더 붙이기, 401 이면 로그아웃, `res.data.body` 벗기기, 개발 중 요청 로그.

문제는 그 넷이 **프로젝트마다 조금씩 다르다**는 것이다. 봉투 모양이 다르고 401 처리도 다르다.
그래서 이 패키지는 **정책을 결정하지 않는다. 주입받는다.**

## 기능

```ts
import { createHttpClient } from "@txstack/axios";

const api = createHttpClient({
  baseURL: "/api",

  // 인증 — 매 요청마다 호출된다. 반환값이 없으면 헤더를 붙이지 않는다
  getToken: () => localStorage.getItem("accessToken"),
  authHeader: "Authorization", // 기본값
  authScheme: "Bearer", // 기본값. "" 이면 토큰만 넣는다

  // 에러 정책 — 앱이 결정한다
  onUnauthorized: () => logout(),
  onError: (err) => toast.error(parseApiError(err).message),

  // 응답 봉투 해제. 기본값은 res.data 그대로
  unwrap: (data) => (data as { body: unknown }).body,

  // 쿠키 인증을 쓴다면 명시적으로 켠다. 기본값은 axios 와 같은 false
  withCredentials: true
});
```

**`Content-Type` 을 `headers` 에 고정하지 않는 편이 좋다.** axios 가 본문 종류를 보고 정한다 —
평범한 객체면 `application/json`, `FormData` 면 boundary 가 붙은 `multipart/form-data`.
(고정해 두더라도 `FormData` 를 보낼 때는 인터셉터가 비켜준다.)

로깅 옵션(`onRequest` · `onResponse` · `debug` · `maskFields`)은
[003_logging](003_logging.md) 이 갖는다.

## 개발 항목

- [x] **구현** — `client.ts` + `interceptors.ts`
- [x] **테스트** — 15개. **React 없이 도는 것**이 node 프로젝트에서 증명된다
- [x] **정책 주입** — 인증 · 401 · 에러 · 봉투 · 쿠키 전부 옵션이다
- [x] `attachInterceptors` 를 따로 내보낸다 — 이미 있는 axios 인스턴스에 붙일 때 쓴다

## 정한 것 · 고친 것

| 원본                                       | 지금                           | 왜                                                                    |
| ------------------------------------------ | ------------------------------ | --------------------------------------------------------------------- |
| `withCredentials` 기본 `true`              | `false` (axios 기본값)         | 라이브러리가 크로스오리진 쿠키 정책을 몰래 뒤집으면 안 된다           |
| `Content-Type: application/json` 기본 헤더 | 넣지 않음 + FormData 면 비켜줌 | boundary 가 빠져 **파일 업로드가 깨진다**                             |
| 요청 에러에서 무조건 `console.error`       | 제거 (`debug` 뒤로)            | 라이브러리가 소비자 콘솔을 오염시킨다                                 |
| `IApiResponse<T>`                          | 삭제                           | 특정 서비스의 봉투 모양. `unwrap` 을 주입받는 패키지가 들 이유가 없다 |
