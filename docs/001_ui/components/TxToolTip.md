# TxToolTip

> **플로우 S1~S6 작업 항목.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md)
> 상태: **미착수**

## 새 창에서 시작하는 법

```
docs/README.md 와 docs/001_ui/components/TxToolTip.md 를 읽고 001-TxToolTip-S1 부터 진행해줘.
```

단계를 하나 끝내면 이 문서의 진행 표와 [30_tasks.md](../30_tasks.md) 보드를 함께 갱신한다.

## 진행

| 단계 | 내용                                           | job ID             | 상태 | 비고                                              |
| ---- | ---------------------------------------------- | ------------------ | ---- | ------------------------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝                | `001-TxToolTip-S1` |      |                                                   |
| `S2` | 구현 = 감사 결과 반영 🧑/🤖                    | `001-TxToolTip-S2` |      |                                                   |
| `S3` | 테스트 🤖                                      | `001-TxToolTip-S3` |      |                                                   |
| `S4` | 스토리북 🤖                                    | `001-TxToolTip-S4` |      | 기존 스토리 있음 — 양식에 맞춰 개편               |
| 🧑   | **사용자 확인** — Storybook 에서 직접 만져본다 | —                  |      | 통과하면 S5 로. 고칠 게 나오면 S2~S4 를 다시 돈다 |
| `S5` | 문서 사이트 🤖                                 | `001-TxToolTip-S5` |      |                                                   |
| `S6` | Claude 가이드 🤖                               | `001-TxToolTip-S6` |      |                                                   |

표기: 없음(미착수) · `🔄` · `✅` · `⏸` · `❌`

## 1. 현재 코드 인벤토리 (자동 수집 · 2026-08-25)

| 항목           | 값                                                     |
| -------------- | ------------------------------------------------------ |
| 위치           | `packages/ui/src/TxToolTip/`                           |
| 코드 행수      | 135행 (스토리 제외)                                    |
| 파일           | `TxToolTip.stories.tsx` · `TxToolTip.tsx` · `index.ts` |
| named export   | `TxTooltipTheme` · `TxTooltip`                         |
| default export | 없음                                                   |
| props 타입     | `ITxTooltipProps`                                      |
| `.theme.ts`    | **없음**                                               |
| `.types.ts`    | **없음**                                               |
| 테스트         | **없음**                                               |
| `data-tag`     | 있음                                                   |
| 스토리         | `Overlay/TxTooltip` (스토리 5개)                       |

### 착수 전에 알아야 할 것

- **폴더명과 심볼 불일치**: 폴더 `TxToolTip` vs export `TxTooltip`
- `.theme.ts` 파일 없이 `TxTooltipTheme` 을 구현 파일에서 export

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
양식 예시는 [TxSpinner.md](TxSpinner.md) 를 본다.

## 6. 사용 예제 🤝

흔한 케이스 1개 + 커스터마이징 케이스 1개. **복붙 가능해야 한다.**

## 7. 하지 않는 것 🤝

범위 밖.
