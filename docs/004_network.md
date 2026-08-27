# 004 · `@txstack/network`

**axios 래퍼. 인증·에러·응답봉투 정책을 옵션으로 주입받는다.**

React 를 모른다. 훅도 컨텍스트도 없다. Node 스크립트에서도 그대로 돌아가야 한다.
`axios` 는 peerDependency 다.

## 무엇을 해결하는가

세 프로젝트가 각자 axios 인스턴스를 만들면서 매번 같은 것을 다시 짰다 —
Authorization 헤더 붙이기, 401 이면 로그아웃, `res.data.body` 벗기기, 개발 중 요청 로그.

문제는 그 네 가지가 **프로젝트마다 조금씩 다르다**는 것이다. 봉투 모양이 다르고, 401 처리도 다르다.
그래서 이 패키지는 **그 정책들을 결정하지 않는다. 주입받는다.**

## 공개 API (초안 — temp 구현 기준)

### 만들기

```ts
import { createHttpClient } from "@txstack/network";

const api = createHttpClient({
  baseURL: "/api",

  // 인증 — 매 요청마다 호출된다. 없으면 헤더를 붙이지 않는다.
  getToken: () => localStorage.getItem("accessToken"),
  authHeader: "Authorization", // 기본값
  authScheme: "Bearer", // 기본값. "" 이면 토큰만 넣는다

  // 에러 정책 — 앱이 결정한다
  onUnauthorized: () => logout(),
  onError: (err) => toast.error(parseApiError(err).message),

  // 응답 봉투 해제. 기본값은 res.data 그대로
  unwrap: (data) => (data as { body: unknown }).body,

  // 개발 로그. import.meta.env 를 패키지가 직접 읽지 않는다
  debug: import.meta.env.DEV,
  maskFields: ["password", "privateKey"] // 기본값 있음
});
```

### 쓰기

```ts
const user = await api.get<User>("/users/1");
const list = await api.get<User[]>("/users", { page: 1, size: 20 });
await api.post<void>("/users", { name: "kim" });
await api.put<User>("/users/1", body);
await api.patch<User>("/users/1", body);
await api.del<void>("/users/1");

// 봉투를 거치지 않는 원본 응답
const file = await api.getBlob("/export/xlsx");
const csv = await api.getText("/export/csv");

// 런타임 변경
api.setBaseURL("https://api.staging.example.com");
api.setConfig({ timeout: 30_000 });

// 이 래퍼가 커버 못 하는 케이스는 원본으로 내려간다
api.instance.request({ ... });
```

### 싱글턴 (선택)

인스턴스를 앱 전역에 하나만 두고 싶을 때. **쓰지 않아도 된다.**

```ts
import { initHttpClient, getHttpClient, resetHttpClient } from "@txstack/network";

initHttpClient({ baseURL: "/api" }); // 앱 부팅 시 한 번
const api = getHttpClient(); // 어디서든
resetHttpClient(); // 테스트 teardown
```

### 유틸

```ts
import { removeUndefined, isTokenExpired, parseApiError } from "@txstack/network";

removeUndefined({ a: 1, b: undefined }); // → { a: 1 }
isTokenExpired(expiresAt); // → boolean
parseApiError(err); // unknown → IApiError
```

### 타입

`IApiResponse<T>` · `IApiError` · `HttpClient` · `HttpClientOptions` · `DeleteOptions`

## 결정할 것

- [ ] 싱글턴(`initHttpClient` 계열)을 유지할지. 편하지만 테스트에서 전역 상태가 샌다.
- [ ] `getAxios` / `changeAxiosConfig` / `changeAxiosBaseUrl` 은 `api.instance` · `api.setConfig` ·
      `api.setBaseURL` 과 하는 일이 겹친다. 한쪽으로 정리할지.
- [ ] `del` 이름을 유지할지 (`delete` 는 예약어라 피한 것).
- [ ] `IApiResponse<T>` 를 공개할지. 봉투를 `unwrap` 으로 주입받는 마당에 봉투 타입을 패키지가 아는 게 맞는지.
