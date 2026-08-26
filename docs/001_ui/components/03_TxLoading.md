# TxLoading

> **플로우 S1~S6 작업 항목.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md)
> 상태: **미착수**

## 새 창에서 시작하는 법

```
docs/README.md 와 docs/001_ui/components/03_TxLoading.md 를 읽고 001-TxLoading-S1 부터 진행해줘.
```

단계를 하나 끝내면 이 문서의 진행 표와 [30_tasks.md](../30_tasks.md) 보드를 함께 갱신한다.

## 진행

| 단계 | 내용                                           | job ID             | 상태 | 비고                                              |
| ---- | ---------------------------------------------- | ------------------ | ---- | ------------------------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝                | `001-TxLoading-S1` |      |                                                   |
| `S2` | 구현 = 감사 결과 반영 🧑/🤖                    | `001-TxLoading-S2` |      |                                                   |
| `S3` | 테스트 🤖                                      | `001-TxLoading-S3` |      |                                                   |
| `S4` | 스토리북 🤖                                    | `001-TxLoading-S4` |      | 기존 스토리 있음 — 양식에 맞춰 개편               |
| 🧑   | **사용자 확인** — Storybook 에서 직접 만져본다 | —                  |      | 통과하면 S5 로. 고칠 게 나오면 S2~S4 를 다시 돈다 |
| `S5` | 문서 사이트 🤖                                 | `001-TxLoading-S5` |      |                                                   |
| `S6` | Claude 가이드 🤖                               | `001-TxLoading-S6` |      |                                                   |

표기: 없음(미착수) · `🔄` · `✅` · `⏸` · `❌`

## 1. 현재 코드 인벤토리 (자동 수집 · 2026-08-25)

| 항목           | 값                                                                            |
| -------------- | ----------------------------------------------------------------------------- |
| 위치           | `packages/ui/src/TxLoading/`                                                  |
| 코드 행수      | 43행 (스토리 제외)                                                            |
| 파일           | `TxLoading.stories.tsx` · `TxLoading.tsx` · `TxLoading.types.ts` · `index.ts` |
| named export   | `TxLoading`                                                                   |
| default export | 없음                                                                          |
| props 타입     | `TxLoadingProps`                                                              |
| `.theme.ts`    | **없음**                                                                      |
| `.types.ts`    | 있음                                                                          |
| 테스트         | **없음**                                                                      |
| `data-tag`     | 있음                                                                          |
| 스토리         | `Feedback/TxLoading` (스토리 3개)                                             |

### 착수 전에 알아야 할 것

- `.theme.ts` 없음. className 을 `cm` 없이 템플릿 문자열로 이어붙인다
- `visible?: boolean | any[]` — `any` 사용
- **자체 `Dots` 를 쓰고 `TxSpinner` 를 쓰지 않는다.** 그런데 스토리 설명은 "스피너에 문구와 전체화면 옵션을 얹은 것" — 문서/구현 불일치
- `animate-bounce` 가 `prefers-reduced-motion` 미대응

### `001-TxSpinner-S1` 에서 넘어온 결정 (2026-08-25 합의)

이 두 가지는 **여기서 다시 논의하지 않는다.** 어떻게 반영할지만 정한다.

1. **역할 분리 확정** — `TxSpinner` = 회전 아이콘 하나 / **`TxLoading` = 문구 + 표시 여부 판단 + `fullScreen` 오버레이.**
   따라서 `Dots` 를 `TxSpinner` 로 교체한다. 로딩 시각 언어를 하나로 통일하는 것이 목적이고,
   기존 스토리 설명("스피너에 문구를 얹은 것")이 사실이 된다. **겉모습이 바뀌므로 changeset 필수.**
2. **모션 저감은 끄지 않고 늦춘다** — `animate-bounce` 에도 `motion-reduce:` 로 **느린 대안**을 준다.
   멈추면 "로딩 중"이라는 정보 자체가 사라진다. 근거: [TxSpinner §4 접근성 A3](01_TxSpinner.md#접근성)

근거 원문: [TxSpinner §5 Q2](01_TxSpinner.md#q2--로딩-시각-언어를-하나로)

## 2. 목적 🤝

왜 있나. 없으면 소비자가 무엇을 직접 해야 하나.

## 3. 공개 API 🤝

props · 콜백 시그니처. [03_CONVENTIONS](../../00_foundation/03_CONVENTIONS.md) 의 이름 규칙을 따른다.

## 4. 커스터마이징 지점 🤝

어디까지 바꿀 수 있나. **파일럿 2차 `TxButton` 에서 확정한 방침을 따른다.**

## 5. 현행 코드 감사 (S1 핵심)

판정: **유지 / 수정 / 폐기** ← 결론을 여기 적는다

| ID  | 분류 | 내용 | 근거 (파일:행) |
| --- | ---- | ---- | -------------- |
|     |      |      |                |

분류는 `결함` · `접근성` · `규약이탈` · `설계질문` 로 나눈다.
양식 예시는 [01_TxSpinner.md](01_TxSpinner.md) 를 본다.

## 6. 사용 예제 🤝

흔한 케이스 1개 + 커스터마이징 케이스 1개. **복붙 가능해야 한다.**

## 7. 하지 않는 것 🤝

범위 밖.
