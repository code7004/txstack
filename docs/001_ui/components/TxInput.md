# TxInput

> **플로우 S1~S6 작업 항목.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md)
> 상태: **미착수**

## 새 창에서 시작하는 법

```
docs/README.md 와 docs/001_ui/components/TxInput.md 를 읽고 001-TxInput-S1 부터 진행해줘.
```

단계를 하나 끝내면 이 문서의 진행 표와 [30_tasks.md](../30_tasks.md) 보드를 함께 갱신한다.

## 진행

| 단계 | 내용                                           | job ID           | 상태 | 비고                                              |
| ---- | ---------------------------------------------- | ---------------- | ---- | ------------------------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝                | `001-TxInput-S1` |      |                                                   |
| `S2` | 구현 = 감사 결과 반영 🧑/🤖                    | `001-TxInput-S2` |      |                                                   |
| `S3` | 테스트 🤖                                      | `001-TxInput-S3` |      |                                                   |
| `S4` | 스토리북 🤖                                    | `001-TxInput-S4` |      | 기존 스토리 있음 — 양식에 맞춰 개편               |
| 🧑   | **사용자 확인** — Storybook 에서 직접 만져본다 | —                |      | 통과하면 S5 로. 고칠 게 나오면 S2~S4 를 다시 돈다 |
| `S5` | 문서 사이트 🤖                                 | `001-TxInput-S5` |      |                                                   |
| `S6` | Claude 가이드 🤖                               | `001-TxInput-S6` |      |                                                   |

표기: 없음(미착수) · `🔄` · `✅` · `⏸` · `❌`

## 1. 현재 코드 인벤토리 (자동 수집 · 2026-08-25)

| 항목           | 값                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 위치           | `packages/ui/src/TxInput/`                                                                                                                                                                                    |
| 코드 행수      | 315행 (스토리 제외)                                                                                                                                                                                           |
| 파일           | `TxInput.hook.ts` · `TxInput.stories.tsx` · `TxInput.theme.ts` · `TxInput.tsx` · `TxInput.types.ts` · `TxInput.utils.ts` · `TxInputLike.tsx` · `TxSearchInput.stories.tsx` · `TxSearchInput.tsx` · `index.ts` |
| named export   | `TxInputTheme` · `TxSearchInputTheme` · `TxInput` · `TxSearchInput`                                                                                                                                           |
| default export | **있음** — 배럴에서 특례 재수출 필요                                                                                                                                                                          |
| props 타입     | `ITxInput` · `ITxInputRef` · `ITxSearchInputProps` · `ITxSearchInputRef` · `ITxInputLikeProps`                                                                                                                |
| `.theme.ts`    | 있음                                                                                                                                                                                                          |
| `.types.ts`    | 있음                                                                                                                                                                                                          |
| 테스트         | **없음**                                                                                                                                                                                                      |
| `data-tag`     | 있음                                                                                                                                                                                                          |
| 스토리         | `Form/TxInput` (스토리 5개) · `Form/TxSearchInput` (스토리 4개)                                                                                                                                               |

### 착수 전에 알아야 할 것

- 한 폴더에 `TxInput`·`TxSearchInput`·`TxInputLike`(default) 3개 — 항목 분리 여부 판단
- 폼 계열의 기준 컴포넌트. `TxTextarea`·`TxDropdown` 이 이 규약을 따라간다

### `001-TxButton-S1` 에서 넘어온 결정·결함 (2026-08-25)

**콜백 이름 규칙이 확정됐다** → [TxButton §5 Q4](TxButton.md#q4--콜백-이름-규칙-추가-합의).
접미어는 살리되 어휘가 닫혔다: `Text` · `Number` · `Int` · `Boolean` · `Item` · `Value`.
**`Numb`·`Bool`·`Nums`·`Float` 금지.** 이 컴포넌트가 그 규칙의 **첫 적용처**다.

이미 확인된 결함 —

- **`onChangeFloat` 와 `onChangeNumber` 가 같은 값을 넘긴다.** `TxInput.tsx:43,45` 가 둘 다 `num` 을
  그대로 준다. 이름만 둘이고 동작이 같으니 `onChangeFloat` 를 없앤다. **`Float` 금지의 실제 근거다**
- `onChangeInt` 는 `Math.trunc` 라 **동작이 다르다.** 살린다
- `onEnter` 가 있다 — `TxButton` 에서는 폐기했지만 **`<input>` 은 사정이 다르다** (Enter 가 click 을
  만들지 않는다). 여기서는 유지가 맞는지 다시 판단한다

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
