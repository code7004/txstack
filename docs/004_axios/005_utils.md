# 005 · 유틸과 타입

> 에러를 한 모양으로 읽는 함수와 공개 타입.

|             |                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| 진입점      | `@txstack/axios`                                                                                                     |
| 내보내는 것 | `parseApiError` · 타입 6개                                                                                           |
| 소스        | [`packages/axios/src/utils.ts`](../../packages/axios/src/utils.ts) · [`types.ts`](../../packages/axios/src/types.ts) |
| 테스트      | 1개                                                                                                                  |

## 개발 목적

**에러 모양을 하나로 읽는다.** 그것이 없으면 앱마다 `err.response?.data?.message ?? err.message` 를 다시 쓴다.

## 기능

```ts
import { parseApiError, type ApiError } from "@txstack/axios";

const { statusCode, message }: ApiError = parseApiError(err); // axios 에러 · Error · 그 외 → 한 모양
```

### 타입

`HttpClient` · `HttpClientOptions` · `DeleteOptions` · `ApiError` · `RequestLog` · `ResponseLog`

## 개발 항목

- [x] **구현** — `packages/axios/src/utils.ts`
- [x] **테스트** — 1개
- [x] **배포 전 정리** (2026-11-11) — 아래 "첫 배포 전에 뺀 것 · 바꾼 것"

## 정한 것 · 고친 것

### 첫 배포 전에 뺀 것 · 바꾼 것 (2026-11-11)

세 프로젝트(`black-message` · `usertics` · `settlemint`)에 적용한 뒤, 실제 쓰임을 근거로 정했다.
npm 에 올리기 전이라 깨지는 소비자가 없다.

| 전                | 지금       | 근거                                                                                                                |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `removeUndefined` | 뺐다       | 쓰는 곳 0. 이름과 달리 공백 문자열도 지웠다. lodash `omitBy` 한 줄이라 `fns` 로도 옮기지 않는다                     |
| `isTokenExpired`  | 뺐다       | 쓰는 곳 0. `!expiresAt \|\| Date.now() > expiresAt` 한 줄이고 HTTP 가 아니라 인증 정책이다 — 패키지가 정하지 않는다 |
| `IApiError`       | `ApiError` | 다섯 패키지에서 `I` 접두사는 이것 하나였다. 별칭은 두지 않았다                                                      |

필요해지면 다시 더한다 — 더하는 것은 깨는 변경이 아니다.

사실이 아닌 주석이 하나 있었다 — `delete` 가 예약어라 `del` 을 썼다는 것인데,
**객체 메서드명으로는 유효하다**(`Map.prototype.delete` 가 그 예).
그 판단이 [002_HttpClient](002_HttpClient.md) 의 이름 되돌리기로 이어졌다.
