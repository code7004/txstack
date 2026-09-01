# 004 · 싱글턴 서브패스

> 전역 함수로 쓰던 코드를 **옮겨오는 동안**의 호환 계층. **권장하지 않는다.**

| | |
| --- | --- |
| 진입점 | `@txstack/axios/singleton` — 서브패스 |
| 내보내는 것 | `initHttpClient` · `getHttpClient` · `resetHttpClient` |
| 소스 | [`packages/axios/src/singleton.ts`](../../packages/axios/src/singleton.ts) |
| 테스트 | 4개 |

## 개발 목적

기존 `initAxios` / `getAxios` 패턴을 쓰던 앱이 **한 번에 다 바꾸지 않고도** 이 패키지로
넘어올 수 있게 한다. 전역 상태라 테스트 격리가 어렵고 클라이언트를 둘 이상 둘 수 없다 —
그래서 **루트 배럴이 아니라 서브패스**에 둔다. "권장은 `createHttpClient`" 가 주석이 아니라
구조로 드러난다.

## 기능

```ts
import { initHttpClient, getHttpClient, resetHttpClient } from "@txstack/axios/singleton";

initHttpClient({ baseURL: "/api" }); // 다시 부르면 새 클라이언트로 교체된다
const api = getHttpClient();
resetHttpClient();                   // 테스트 teardown
```

새로 짜는 앱은 이것 대신 모듈 하나를 둔다 — [002_HttpClient](002_HttpClient.md) 의
"앱에 하나만 두기".

## 개발 항목

- [x] **구현** — `packages/axios/src/singleton.ts`
- [x] **테스트** — 4개
- [x] **서브패스로 가름** — 루트 배럴에 두지 않는다

## 정한 것 · 고친 것

| 원본 | 지금 | 왜 |
| --- | --- | --- |
| 싱글턴이 루트 배럴 | `/singleton` 서브패스 | 권장하지 않는 것이 구조로 드러난다 |
| `initHttpClient` 재호출 시 baseURL 만 갱신 | 새 클라이언트로 교체 | 다른 옵션을 조용히 버려서 원인 추적이 어려웠다 |
