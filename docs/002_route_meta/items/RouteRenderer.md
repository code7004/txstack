# RouteRenderer

> **@txstack/route-meta 의 작업 항목.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md)
> 상태: **미착수**

## 새 창에서 시작하는 법

```
docs/README.md 와 docs/002_route_meta/items/RouteRenderer.md 를 읽고 002-RouteRenderer-S1 부터 진행해줘.
```

단계를 끝내면 이 문서의 진행 표와 [30_tasks.md](../30_tasks.md) 보드를 함께 갱신한다.

## 진행

| 단계 | 내용                            | job ID                 | 상태 | 비고                             |
| ---- | ------------------------------- | ---------------------- | ---- | -------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝 | `002-RouteRenderer-S1` |      |                                  |
| `S2` | 구현 = 감사 결과 반영 🧑/🤖     | `002-RouteRenderer-S2` |      |                                  |
| `S3` | 테스트 🤖                       | `002-RouteRenderer-S3` |      |                                  |
| `S4` | 스토리북                        | —                      | —    | `ui` 패키지가 아니므로 해당 없음 |
| `S5` | 문서 사이트 (예제·코드) 🤖      | `002-RouteRenderer-S5` |      |                                  |
| `S6` | Claude 가이드 🤖                | `002-RouteRenderer-S6` |      |                                  |

## 1. 현재 코드 인벤토리 (2026-08-25)

| 항목      | 값                                    |
| --------- | ------------------------------------- |
| 위치      | `packages/route-meta/src/renderer.ts` |
| 코드 행수 | 23행                                  |
| export    | `RouteRenderer`                       |

### 착수 전에 알아야 할 것

- 23행. props 가 `{ data: RouteTree }` 뿐 — 이 컴포넌트가 필요한지부터 판단
- `ui` 패키지가 아닌데 컴포넌트를 export 한다. 경계상 맞는지 확인

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
양식 예시는 [001_ui/components/TxSpinner.md](../../001_ui/components/TxSpinner.md) 를 본다.

## 6. 사용 예제 🤝

복붙 가능한 최소 예제 + 옵션을 쓰는 예제.

## 7. 하지 않는 것 🤝

범위 밖.
