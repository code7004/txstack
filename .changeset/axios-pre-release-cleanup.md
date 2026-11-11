---
"@txstack/axios": minor
---

`removeUndefined` · `isTokenExpired` 를 내보내지 않는다. 빈 값을 뺀 쿼리는 lodash `omitBy(params, (v) => v === undefined || String(v).trim() === "")`, 토큰 만료는 앱의 인증 코드에서 `!expiresAt || Date.now() > expiresAt` 로 판단한다. 에러 타입 `IApiError` 는 `ApiError` 로 이름을 바꾼다 — `parseApiError` 가 돌려주는 모양은 그대로다.
