# 005 · 유틸과 타입

> 클라이언트 밖에서도 쓰는 순수 함수 셋과 공개 타입.

|             |                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| 진입점      | `@txstack/axios`                                                                                                     |
| 내보내는 것 | `removeUndefined` · `isTokenExpired` · `parseApiError` · 타입 6개                                                    |
| 소스        | [`packages/axios/src/utils.ts`](../../packages/axios/src/utils.ts) · [`types.ts`](../../packages/axios/src/types.ts) |
| 테스트      | 4개                                                                                                                  |

## 개발 목적

세 앱이 각자 갖고 있던 잔 함수들이다. **에러 모양을 하나로 읽는 것**(`parseApiError`)이
특히 그렇다 — 그것이 없으면 앱마다 `err.response?.data?.message ?? err.message` 를 다시 쓴다.

## 기능

```ts
import { removeUndefined, isTokenExpired, parseApiError } from "@txstack/axios";

removeUndefined({ a: 1, b: undefined, c: "  " }); // → { a: 1 }  (공백 문자열도 지운다)
isTokenExpired(expiresAt); // → boolean
parseApiError(err); // unknown → IApiError
```

### 타입

`HttpClient` · `HttpClientOptions` · `DeleteOptions` · `IApiError` · `RequestLog` · `ResponseLog`

## 개발 항목

- [x] **구현** — `packages/axios/src/utils.ts`
- [x] **테스트** — 4개
- [ ] `removeUndefined` 가 이름과 달리 공백 문자열도 지운다. 의도된 동작이지만 이름이 좁게 읽힌다
- [ ] `isTokenExpired` 가 이 패키지에 있는 게 맞는지. HTTP 와 무관한 순수 유틸이고 인증 정책에 가깝다
- [ ] `IApiError` 의 `I` 접두사 — 저장소 전체 네이밍 규약을 정할 때 함께 판단한다

## 정한 것 · 고친 것

사실이 아닌 주석이 하나 있었다 — `delete` 가 예약어라 `del` 을 썼다는 것인데,
**객체 메서드명으로는 유효하다**(`Map.prototype.delete` 가 그 예).
그 판단이 [002_HttpClient](002_HttpClient.md) 의 이름 되돌리기로 이어졌다.
