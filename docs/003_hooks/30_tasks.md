# 003 진행 보드 — @txstack/hooks

> **훅 하나가 작업 항목이다.** 규칙은 [06_COMPONENT_FLOW](../00_foundation/06_COMPONENT_FLOW.md).
> 상태 표기: 없음(미착수) · `🔄` · `✅` · `⏸` · `❌` — `S4`(스토리북)는 `ui` 가 아니므로 해당 없음

## 새 창을 여는 법

```
docs/README.md 와 docs/003_hooks/items/01_useObjectChanged.md 를 읽고 003-useObjectChanged-S1 부터 진행해줘.
```

## 진행 순서

이 순서가 **항목 문서 파일 이름의 번호**다 — `items/01_useObjectChanged.md` … `04_useUrlQuery.md`.
폴더를 열면 다음에 뭘 할 차례인지 바로 보인다. **번호는 나중에 당기지 않는다** —
폐기(`❌`)된 항목의 번호도 비워 둔 채 남긴다. 당기면 이미 적힌 링크와 커밋 메시지가 다른 것을 가리킨다.

**존치 판정 3건을 먼저 한다.** 요청 범위에 명시된 것은 `useUrlQuery` 하나뿐이고,
나머지 3개는 폐기될 수 있다. 먼저 잘라내면 뒤에서 규약을 맞출 대상이 줄어든다.
각 판정은 S1 하나로 끝난다 (폐기면 S2 에서 제거).

| 순서 | 항목                                               | S1  | S2  | S3  | S5  | S6  | 코드  | 착수 전 판단                                 |
| ---- | -------------------------------------------------- | --- | --- | --- | --- | --- | ----- | -------------------------------------------- |
| 1    | [useObjectChanged](items/01_useObjectChanged.md)   |     |     |     |     |     | 66행  | **존치 판정** — 요청 범위 밖                 |
| 2    | [useSafePolling](items/02_useSafePolling.md)       |     |     |     |     |     | 51행  | **존치 판정** — 정책성이 강함                |
| 3    | [useStateForObject](items/03_useStateForObject.md) |     |     |     |     |     | 65행  | **존치 판정** — `any` 사용                   |
| 4    | [useUrlQuery](items/04_useUrlQuery.md)             |     |     |     |     |     | 268행 | **이 패키지의 핵심.** 옵션 7개가 다 필요한가 |

> 폐기 3건이 확정되면 이 패키지는 `useUrlQuery` 단일 훅 패키지가 된다.
> 그 경우 **패키지 이름(`hooks`)이 맞는지**도 함께 판단한다.

## 이 패키지의 최우선 미결

| 질문                                                                                       | 어디서           |
| ------------------------------------------------------------------------------------------ | ---------------- |
| 타입 변환 방식 — 스키마? 제네릭 추론? 문자열만?                                            | `useUrlQuery` S1 |
| 빈 값 처리 (빈 문자열·빈 배열·`undefined` 를 URL 에서 지우나)                              | `useUrlQuery` S1 |
| `@txstack/hooks/router` 서브패스 분리 구조 유지 여부                                       | `useUrlQuery` S1 |
| 모듈 함수 4개(`searchQuery`·`getUrlQuery`·`pushUrlQuery`·`updateUrlQuery`)를 공개할 것인가 | `useUrlQuery` S1 |
| `export default` 와 named export 공존 정리                                                 | `useUrlQuery` S2 |
