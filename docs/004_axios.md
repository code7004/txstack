# 004 · `@txstack/axios`

**axios 래퍼. 인증·에러·응답봉투·로깅 정책을 옵션으로 주입받는다.**

React 를 모른다. 훅도 컨텍스트도 없다. Node 스크립트에서도 그대로 돌아간다.
`axios >=1.6` 은 peerDependency 다.

**이식 완료.** 아래는 초안이 아니라 실제 공개 API 다.

## 무엇을 해결하는가

세 프로젝트가 각자 axios 인스턴스를 만들면서 매번 같은 것을 다시 짰다 —
Authorization 헤더 붙이기, 401 이면 로그아웃, `res.data.body` 벗기기, 개발 중 요청 로그.

문제는 그 네 가지가 **프로젝트마다 조금씩 다르다**는 것이다. 봉투 모양이 다르고, 401 처리도 다르다.
그래서 이 패키지는 **그 정책들을 결정하지 않는다. 주입받는다.**

## 진입점

| 진입점                     | 내용                                             |
| -------------------------- | ------------------------------------------------ |
| `@txstack/axios`           | `createHttpClient` · `attachInterceptors` · 유틸 |
| `@txstack/axios/singleton` | `initHttpClient` 계열 — **권장하지 않는다**      |

## 공개 API

### 만들기

```ts
import { createHttpClient } from "@txstack/axios";

const api = createHttpClient({
  baseURL: "/api",

  // 인증 — 매 요청마다 호출된다. 반환값이 없으면 헤더를 붙이지 않는다.
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

### 쓰기

```ts
const user = await api.get<User>("/users/1");
const list = await api.get<User[]>("/users", { page: 1, size: 20 });
await api.post<void>("/users", { name: "kim" });
await api.put<User>("/users/1", body);
await api.patch<User>("/users/1", body);
await api.delete<void>("/users/1", { params: { force: true } });

// 봉투를 거치지 않는 원본 응답
const file = await api.getBlob("/export/xlsx"); // 브라우저·Node 양쪽에서 Blob
const csv = await api.getText("/export/csv");

// 런타임 변경
api.setBaseURL("https://api.staging.example.com");
api.setConfig({ timeout: 30_000 });

// 이 래퍼가 커버 못 하는 케이스는 원본으로 내려간다
api.instance.request({ ... });
```

### 앱에 하나만 두기

**`initHttpClient` 가 필요 없다. ESM 모듈 자체가 싱글턴이다.**

```ts
// src/lib/api.ts — 앱에 이 파일 하나만 두면 된다
export const api = createHttpClient({ baseURL: import.meta.env.VITE_API_URL });
```

어디서 몇 번 import 해도 같은 인스턴스다. baseURL 이 부팅 후에 정해진다면
(서버에서 config 를 받아오는 식) 먼저 만들어두고 그때 `api.setBaseURL(ip)` 를 부른다.

### 로깅 — 콘솔 밖으로 내보내기

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

`maskFields` 기본값은 `password` · `privateKey` · `token` · `accessToken` · `refreshToken` 이고,
**훅에 넘기기 전에** 적용된다 — 주입된 로거가 값을 외부로 보낼 수 있기 때문이다.
최상위 키만 본다. 중첩된 값은 소비자가 `onRequest` 에서 직접 처리한다.

### 싱글턴 서브패스 (권장하지 않음)

기존 `initAxios`/`getAxios` 패턴을 쓰던 코드를 **옮겨오는 동안**의 호환 계층이다.
전역 상태라 테스트 격리가 어렵고 클라이언트를 둘 이상 둘 수 없다.

```ts
import { initHttpClient, getHttpClient, resetHttpClient } from "@txstack/axios/singleton";

initHttpClient({ baseURL: "/api" }); // 다시 부르면 새 클라이언트로 교체된다
const api = getHttpClient();
resetHttpClient(); // 테스트 teardown
```

### 유틸

```ts
import { removeUndefined, isTokenExpired, parseApiError } from "@txstack/axios";

removeUndefined({ a: 1, b: undefined, c: "  " }); // → { a: 1 }  (공백 문자열도 지운다)
isTokenExpired(expiresAt); // → boolean
parseApiError(err); // unknown → IApiError
```

### 타입

`HttpClient` · `HttpClientOptions` · `DeleteOptions` · `IApiError` · `RequestLog` · `ResponseLog`

## 이식하며 고친 것

원본을 그대로 옮기지 않았다. 라이브러리 경계에 어긋나거나 사실과 다른 부분을 정리했다.

| 원본                                       | 지금                                    | 왜                                                                      |
| ------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------- |
| `withCredentials` 기본 `true`              | `false` (axios 기본값)                  | 라이브러리가 크로스오리진 쿠키 정책을 몰래 뒤집으면 안 된다             |
| `Content-Type: application/json` 기본 헤더 | 넣지 않음 + FormData 면 비켜줌          | boundary 가 빠져 **파일 업로드가 깨진다**                               |
| `getBlob` 이 `responseType: "blob"` 고정   | 환경 판별 후 Node 는 arraybuffer → Blob | `blob` 은 XHR 전용이라 **Node 에서 안 돌았다**                          |
| 요청 에러에서 무조건 `console.error`       | 제거 (`debug` 뒤로)                     | 라이브러리가 소비자 콘솔을 오염시킨다                                   |
| `del()`                                    | `delete()`                              | `delete` 는 객체 메서드명으로 유효하다. `Map.prototype.delete` 가 그 예 |
| `debug` 가 `console` 출력만                | `onRequest`/`onResponse` 훅 추가        | 수집(모니터링·Sentry·파일)이 불가능했다                                 |
| 싱글턴이 루트 배럴                         | `/singleton` 서브패스                   | "권장은 `createHttpClient`" 가 주석이 아니라 구조로 드러난다            |
| `initHttpClient` 재호출 시 baseURL 만 갱신 | 새 클라이언트로 교체                    | 다른 옵션을 조용히 버려서 원인 추적이 어려웠다                          |
| `getAxios`/`changeAxiosConfig`/`~BaseUrl`  | 삭제                                    | `getHttpClient().instance` · `.setConfig()` · `.setBaseURL()` 의 별칭   |
| `IApiResponse<T>`                          | 삭제                                    | 특정 서비스의 봉투 모양. `unwrap` 을 주입받는 패키지가 들 이유가 없다   |

마스킹 범위도 넓혔다 — 원본은 `data` 만 가렸는데 `params` 도 가린다. 쿼리스트링에 토큰이 실릴 수 있다.

## 검증

테스트 29개. 원본 18개를 옮기고 위 변경분을 덮는 11개를 더했다.
`vitest` 의 `node` 프로젝트에서 돈다 — **React 없이 도는 것이 테스트로 증명된다.**

## 남은 것

- [ ] `removeUndefined` 가 이름과 달리 공백 문자열도 지운다. 의도된 동작이지만 이름이 좁게 읽힌다.
      쓰는 자리가 생기면 이름을 다시 본다.
- [ ] `isTokenExpired` 가 이 패키지에 있는 게 맞는지. HTTP 와 무관한 순수 유틸이고 인증 정책에 가깝다.
- [ ] `IApiError` 의 `I` 접두사. 저장소 전체 네이밍 규약을 정할 때 함께 판단한다.
