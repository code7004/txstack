# useUrlQuery

> **@txstack/hooks 의 작업 항목.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md)
> 상태: **미착수**

## 새 창에서 시작하는 법

```
docs/README.md 와 docs/003_hooks/items/04_useUrlQuery.md 를 읽고 003-useUrlQuery-S1 부터 진행해줘.
```

단계를 끝내면 이 문서의 진행 표와 [30_tasks.md](../30_tasks.md) 보드를 함께 갱신한다.

## 진행

| 단계 | 내용                                            | job ID               | 상태 | 비고                                              |
| ---- | ----------------------------------------------- | -------------------- | ---- | ------------------------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝                 | `003-useUrlQuery-S1` |      |                                                   |
| `S2` | 구현 = 감사 결과 반영 🧑/🤖                     | `003-useUrlQuery-S2` |      |                                                   |
| `S3` | 테스트 🤖                                       | `003-useUrlQuery-S3` |      |                                                   |
| `S4` | 스토리북                                        | —                    | —    | `ui` 패키지가 아니므로 해당 없음                  |
| 🧑   | **사용자 확인** — playground·예제로 직접 써본다 | —                    | —    | 통과하면 S5 로. 고칠 게 나오면 S2~S3 을 다시 돈다 |
| `S5` | 문서 사이트 (예제·코드) 🤖                      | `003-useUrlQuery-S5` |      |                                                   |
| `S6` | Claude 가이드 🤖                                | `003-useUrlQuery-S6` |      |                                                   |

## 1. 현재 코드 인벤토리 (2026-08-25)

| 항목      | 값                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| 위치      | `packages/hooks/src/useUrlQuery.ts`                                                                                    |
| 코드 행수 | 268행                                                                                                                  |
| export    | `useUrlQuery` · `UseUrlQueryOptions` · `searchQuery` · `getUrlQuery` · `pushUrlQuery` · `updateUrlQuery` · `(default)` |

### 착수 전에 알아야 할 것

- **이 패키지의 핵심.** 268행 — 요청에 명시된 유일한 훅
- `@txstack/hooks/router` 서브패스에 있다 (루트 배럴을 react-router-dom 과 분리). 이 구조 유지 여부 판단
- 훅 외에 모듈 함수 4개(`searchQuery`·`getUrlQuery`·`pushUrlQuery`·`updateUrlQuery`)를 함께 export 한다 — 공개 API 인지 내부용인지 판단
- `export default useUrlQuery` 와 named export 가 공존한다
- 옵션 7개(`defaults`·`urlKeys`·`queryTypes`·`postParse`·`afterParse`·`encode`·`replace`) — 이게 다 필요한지가 설계 질문

## 2. 목적 🤝

왜 있나. 없으면 소비자가 무엇을 직접 해야 하나.

## 3. 공개 API 🤝

시그니처. **소비자가 어떻게 쓰는지를 예제 코드로 먼저 적는다.**

## 4. 주입 지점 🤝

정책을 소비자가 어떻게 주입하나. [01_ARCHITECTURE §4-2](../../00_foundation/01_ARCHITECTURE.md) 를 따른다.

## 5. 현행 코드 감사 (S1 핵심)

판정: **유지 / 수정 / 폐기** ← 결론을 여기 적는다

| ID  | 분류 | 내용 | 근거 (파일:행) |
| --- | ---- | ---- | -------------- |
|     |      |      |                |

분류는 `결함` · `정책누출` · `규약이탈` · `설계질문` 로 나눈다.
양식 예시는 [001_ui/components/01_TxSpinner.md](../../001_ui/components/01_TxSpinner.md) 를 본다.

## 6. 사용 예제 🤝

복붙 가능한 최소 예제 + 옵션을 쓰는 예제.

## 7. 하지 않는 것 🤝

범위 밖.
