# @txstack/network

axios 기반 HTTP 클라이언트. **React 에 의존하지 않는다.**

```sh
pnpm add @txstack/network axios
```

`axios` 는 peerDependency 다.

## 설계 원칙

이 패키지는 **앱의 정책을 결정하지 않는다.** 인증 토큰을 어디서 읽는지, 401 이면 무엇을 하는지,
응답 봉투가 어떤 모양인지는 전부 소비자가 옵션으로 주입한다. 전역 axios 를 건드리지도 않는다.

## `createHttpClient`

```ts
import { createHttpClient } from "@txstack/network";

export const api = createHttpClient({
  baseURL: "/api",
  getToken: () => sessionStorage.getItem("token"),
  onUnauthorized: () => store.dispatch(logout()),
  debug: import.meta.env.DEV
});

const users = await api.get<IUser[]>("/users", { page: 1 });
await api.post("/users", { name: "kim" });
await api.del("/users/1");
const csv = await api.getText("/users/export");
```

### 응답 봉투 해제

서버가 `{ success, body }` 같은 봉투로 감싼다면 `unwrap` 으로 벗긴다. 기본값은 `res.data` 그대로다.

```ts
const api = createHttpClient({
  baseURL: "/api",
  unwrap: (data) => (data as { body: unknown }).body
});

const users = await api.get<IUser[]>("/users"); // 이미 벗겨진 body
```

### 옵션

| 옵션                        | 기본값                     | 설명                                        |
| --------------------------- | -------------------------- | ------------------------------------------- |
| `baseURL` (필수)            | —                          | `"/api"` 또는 절대 URL                      |
| `withCredentials`           | `true`                     | 쿠키 전송                                   |
| `headers` / `timeout`       | —                          | axios 기본값에 병합                         |
| `getToken`                  | —                          | 매 요청마다 호출. 반환값이 있으면 헤더 주입 |
| `authHeader` / `authScheme` | `Authorization` / `Bearer` | 인증 헤더 형태                              |
| `onUnauthorized`            | —                          | 401 응답 시 호출                            |
| `onError`                   | —                          | 모든 에러 응답에서 호출                     |
| `unwrap`                    | `res.data`                 | 응답 봉투 해제기                            |
| `debug`                     | `false`                    | 요청/응답 콘솔 로깅                         |
| `maskFields`                | password 등 5종            | debug 로깅 시 가릴 필드                     |

### 메서드

| 메서드                           | 봉투 해제 | 용도                |
| -------------------------------- | --------- | ------------------- |
| `get` `post` `put` `patch` `del` | O         | 일반 REST 호출      |
| `getBlob`                        | X         | 파일 다운로드       |
| `getText`                        | X         | CSV/텍스트 응답     |
| `instance`                       | —         | 원본 axios 인스턴스 |
| `setBaseURL` / `setConfig`       | —         | 런타임 설정 변경    |

`del` 은 query 와 body 를 동시에 받는다: `api.del("/users", { params: { ids }, body: payload })`

## 유틸

```ts
import { parseApiError, removeUndefined, isTokenExpired } from "@txstack/network";

try {
  await api.post("/users", removeUndefined(form)); // 빈 값 키 제거
} catch (e) {
  const { statusCode, message } = parseApiError(e); // axios/Error/그 외를 한 형태로 정규화
}
```

## 전역 싱글턴 (호환 계층)

기존 `initAxios`/`getAxios` 패턴을 옮겨오기 위한 것이다. **신규 코드에서는 `createHttpClient` 를 쓴다.**
싱글턴은 테스트 격리가 어렵고 클라이언트를 둘 이상 둘 수 없다.

```ts
import { initHttpClient, getHttpClient, resetHttpClient } from "@txstack/network";

initHttpClient({ baseURL: "/api" });
const api = getHttpClient();
```

## 라이선스

MIT
