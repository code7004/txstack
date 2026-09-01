# 002 · HttpClient

> 만들어진 클라이언트로 **요청을 보낸다.**

| | |
| --- | --- |
| 진입점 | `@txstack/axios` |
| 내보내는 것 | `HttpClient` · `DeleteOptions` (타입) |
| 소스 | [`packages/axios/src/client.ts`](../../packages/axios/src/client.ts) |
| 테스트 | [001_createHttpClient](001_createHttpClient.md) 의 15개가 함께 지킨다 (`getBlob` 1개 포함) |

## 개발 목적

**봉투를 벗긴 값이 바로 나온다.** `res.data.body.items` 를 화면 코드가 매번 파고들지
않게 하고, 그 규칙(`unwrap`)은 앱이 한 번만 정한다.

## 기능

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

전역 함수로 쓰던 코드를 옮기는 중이라면 [004_singleton](004_singleton.md) 을 본다 —
**권장하지 않는다.**

## 개발 항목

- [x] **구현** — `get` · `post` · `put` · `patch` · `delete` · `getBlob` · `getText`
- [x] **탈출구** — `instance` · `setConfig` · `setBaseURL`
- [x] **Node 에서도 돈다** — `getBlob` 이 환경을 판별한다

## 정한 것 · 고친 것

| 원본 | 지금 | 왜 |
| --- | --- | --- |
| `getBlob` 이 `responseType: "blob"` 고정 | 환경 판별 후 Node 는 arraybuffer → Blob | `blob` 은 XHR 전용이라 **Node 에서 안 돌았다** |
| `del()` | `delete()` | `delete` 는 객체 메서드명으로 유효하다. `Map.prototype.delete` 가 그 예 |
| `getAxios`/`changeAxiosConfig`/`~BaseUrl` | 삭제 | `instance` · `setConfig()` · `setBaseURL()` 의 별칭이었다 |
