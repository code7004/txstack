# 004 진행 보드 — @txstack/network

> **공개 기능 하나가 작업 항목이다.** 규칙은 [06_COMPONENT_FLOW](../00_foundation/06_COMPONENT_FLOW.md).
> 상태 표기: 없음(미착수) · `🔄` · `✅` · `⏸` · `❌` — `S4`(스토리북)는 `ui` 가 아니므로 해당 없음

## 새 창을 여는 법

```
docs/README.md 와 docs/004_network/items/01_types.md 를 읽고 004-types-S1 부터 진행해줘.
```

## 진행 순서

이 순서가 **항목 문서 파일 이름의 번호**다 — `items/01_types.md` … `05_singleton.md`.
폴더를 열면 다음에 뭘 할 차례인지 바로 보인다. **번호는 나중에 당기지 않는다** —
폐기(`❌`)된 항목의 번호도 비워 둔 채 남긴다. 당기면 이미 적힌 링크와 커밋 메시지가 다른 것을 가리킨다.

**`types` 를 먼저 한다.** `IApiResponse<T>` 가 응답 봉투 모양을 규정하고 있어서,
이걸 그대로 둘지 주입으로 뺄지에 따라 `createHttpClient` · `attachInterceptors` · `utils` 가 전부 달라진다.

| 순서 | 항목                                                 | S1  | S2  | S3  | S5  | S6  | 코드  | 착수 전 판단                                              |
| ---- | ---------------------------------------------------- | --- | --- | --- | --- | --- | ----- | --------------------------------------------------------- |
| 1    | [types](items/01_types.md)                           |     |     |     |     |     | 88행  | **`IApiResponse` 봉투를 패키지가 정해도 되나**            |
| 2    | [createHttpClient](items/02_createHttpClient.md)     |     |     |     |     |     | 86행  | "초기화를 쉽게" 의 실체. 테스트 이미 있음                 |
| 3    | [attachInterceptors](items/03_attachInterceptors.md) |     |     |     |     |     | 104행 | **"로그" 의 실체.** 인증·401 은 정책 — 주입으로 뺄 것인가 |
| 4    | [utils](items/04_utils.md)                           |     |     |     |     |     | 67행  | `isTokenExpired` — 인증 정책 누출                         |
| 5    | [singleton](items/05_singleton.md)                   |     |     |     |     |     | 49행  | **필요성부터.** 테스트를 어렵게 만든다                    |

## 이 패키지의 최우선 미결

| 질문                                                                | 어디서                                      |
| ------------------------------------------------------------------- | ------------------------------------------- |
| 요청 범위("로그와 초기화")를 넘는 것 — 401 처리·응답 봉투·토큰 만료 | `types` · `attachInterceptors` · `utils` S1 |
| 로그 형태 — 무엇을·어느 수준으로·끄는 법·민감정보 마스킹            | `attachInterceptors` S1                     |
| 에러 형태 — axios 에러를 그대로 던지나, 감싸나                      | `types` S1                                  |
| axios 결합도 — 감추나 드러내나                                      | `createHttpClient` S1                       |
| **React 비의존 유지** — Node·서버에서도 동작해야 한다               | 전 항목                                     |
