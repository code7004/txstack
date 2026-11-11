# @txstack/axios

axios 를 감싼 HTTP 클라이언트입니다. 토큰을 어디서 읽을지, 401 이 오면 무엇을 할지, 서버 응답이 `{ body }` 로 오는지
`{ data }` 로 오는지는 앱마다 다릅니다. 이 패키지는 그런 것을 정하지 않고, 앱이 옵션으로 넘기게 합니다.
그래서 어느 프로젝트에 붙여도 그 프로젝트의 규칙대로 동작합니다.

React 를 쓰지 않으므로 Node 스크립트에서도 그대로 쓸 수 있습니다.

```sh
npm install @txstack/axios axios
```

`axios` 1.6 이상이 함께 설치되어 있어야 합니다(peerDependency).

## 시작하기

앱에 파일 하나를 두고 클라이언트를 만들어 내보냅니다. 화면에서는 이것만 가져다 씁니다.

```ts
// src/lib/api.ts
import { createHttpClient } from "@txstack/axios";

export const api = createHttpClient({
  baseURL: "/api",
  getToken: () => localStorage.getItem("accessToken"), // 요청마다 불러 Authorization: Bearer <토큰> 을 붙입니다
  onUnauthorized: () => logout(), // 401 이 오면 불립니다
  unwrap: (data) => (data as { body: unknown }).body // 서버가 { body: ... } 로 감싸 보낸다면
});
```

```ts
const user = await api.get<User>("/users/1");
const page = await api.get<User[]>("/users", { page: 1, size: 20 }); // 두 번째 인자는 쿼리입니다
await api.post("/users", { name: "kim" });
await api.delete("/users/1", { params: { force: true } }); // DELETE 는 params 와 body 를 함께 줄 수 있습니다

const file = await api.getBlob("/export/xlsx"); // 파일 다운로드 — 브라우저와 Node 모두 Blob 을 돌려줍니다
const csv = await api.getText("/export/csv");
```

`unwrap` 은 일반 요청에만 적용됩니다. `getBlob` · `getText` 는 원본 응답을 그대로 돌려줍니다.

## 오류 다루기

서버마다 오류 응답의 모양이 조금씩 다릅니다. `parseApiError` 는 axios 오류든, 네트워크 끊김이든, 평범한 `Error` 든
`{ statusCode, message }` 한 가지 모양으로 맞춰 줍니다. 화면에서는 이 둘만 보여 주면 됩니다.

```ts
import { parseApiError } from "@txstack/axios";

try {
  await api.post("/users", form);
} catch (err) {
  const { statusCode, message } = parseApiError(err);
  toast.error(`${statusCode} ${message}`);
}
```

모든 오류 응답을 한곳에서 보고 싶다면 `onError` 를 넘깁니다. 401 일 때는 `onUnauthorized` 와 `onError` 가 둘 다 불립니다.

## 로그 남기기

요청과 응답을 콘솔이 아닌 곳(모니터링 서버, Sentry 등)으로 보내고 싶을 때는 `onRequest` · `onResponse` 를 씁니다.

```ts
createHttpClient({
  baseURL: "/api",
  onRequest: (log) => monitor.track("request", log), // { method, url, params, data }
  onResponse: (log) => {
    if (log.durationMs > 3000) reportSlow(log); // { status, method, url, data, durationMs }
  }
});
```

개발 중에 콘솔로 보고 싶다면 `debug: true` 만 주면 됩니다. 훅을 직접 넘긴 자리는 그 훅이 우선합니다.

비밀번호나 토큰이 로그로 새지 않도록, `password` · `privateKey` · `token` · `accessToken` · `refreshToken` 필드는
**로그로 넘기기 전에 가려집니다.** 중첩된 객체와 URL 쿼리까지 가리며, 가릴 필드 이름은 `maskFields` 로 바꿀 수 있습니다.
실제로 서버에 보내는 요청은 바뀌지 않습니다.

## 옵션 한눈에 보기

| 옵션                        | 하는 일                                                        | 기본값                                      |
| --------------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| `baseURL`                   | 요청 주소의 앞부분 (필수)                                      | —                                           |
| `getToken`                  | 요청마다 토큰을 돌려줍니다. 없으면 인증 헤더를 붙이지 않습니다 | —                                           |
| `authHeader` · `authScheme` | 인증 헤더 이름과 스킴                                          | `"Authorization"` · `"Bearer"`              |
| `unwrap`                    | 응답 본문에서 실제 데이터를 꺼냅니다                           | 본문 그대로                                 |
| `onUnauthorized`            | 401 응답이 오면 불립니다                                       | —                                           |
| `onError`                   | 모든 오류 응답에서 불립니다                                    | —                                           |
| `onRequest` · `onResponse`  | 요청 · 응답 로그를 받습니다                                    | —                                           |
| `debug`                     | 훅을 주지 않은 자리에 콘솔 로거를 붙입니다                     | `false`                                     |
| `maskFields`                | 로그에서 가릴 필드 이름                                        | `password` · `token` 등 5개                 |
| `withCredentials`           | 다른 도메인 요청에 쿠키를 싣습니다                             | `false` (쿠키 인증을 쓰는 앱이 직접 켭니다) |
| `headers` · `timeout`       | 모든 요청에 붙일 헤더와 제한 시간                              | —                                           |

`Content-Type` 은 `headers` 에 고정하지 않는 편이 좋습니다. 평범한 객체는 JSON 으로, `FormData` 는 파일 업로드 형식으로
axios 가 알아서 정합니다.

이 래퍼가 다루지 않는 경우에는 `api.instance` 로 원본 axios 인스턴스를 꺼내 쓸 수 있습니다.

## 이미 axios 인스턴스가 있다면

기존 코드를 한 번에 바꾸기 어렵다면, 가지고 있는 인스턴스에 인증 · 401 처리 · 로그 정책만 붙일 수 있습니다.

```ts
import axios from "axios";
import { attachInterceptors } from "@txstack/axios";

const instance = axios.create({ baseURL: "/api" });
attachInterceptors(instance, { baseURL: "/api", getToken, onUnauthorized: logout });
```

`initHttpClient` · `getHttpClient` 로 전역 클라이언트를 두던 코드라면 `@txstack/axios/singleton` 이 있습니다.
옮겨 오는 동안 쓰라고 둔 것이라 새 코드에는 권하지 않습니다. 위의 "시작하기" 처럼 모듈에서 내보내면 같은 효과를 얻습니다.

## 지원 환경

- ESM 전용이고, TypeScript 타입 선언이 들어 있습니다.
- 브라우저와 Node 모두에서 동작합니다.

## 같은 시리즈

[`@txstack/ui`](https://www.npmjs.com/package/@txstack/ui) · [`@txstack/hooks`](https://www.npmjs.com/package/@txstack/hooks) ·
[`@txstack/route-meta`](https://www.npmjs.com/package/@txstack/route-meta) · [`@txstack/fns`](https://www.npmjs.com/package/@txstack/fns)

문서와 예제: <https://code7004.github.io/txstack/>

## 라이선스

MIT
