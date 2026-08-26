# 001 진행 보드 — @txstack/ui

> **컴포넌트 하나가 작업 항목이다.** 규칙은 [06_COMPONENT_FLOW](../00_foundation/06_COMPONENT_FLOW.md).
> 상태 표기: 없음(미착수) · `🔄`(진행중·확인중) · `✅`(완료·통과) · `↩`(2차 개선으로 되돌림) · `⏸`(보류) · `❌`(폐기)

전체 **26 항목** × 6단계. 인벤토리는 2026-08-25 자동 수집값이다.
`test✗` 는 파일럿 2종을 뺀 24종에 해당한다 — 렌더 테스트 선례는 `TxSpinner`·`TxButton` 이다.

## 새 창을 여는 법

```
docs/README.md 와 docs/001_ui/components/TxInput.md 를 읽고 001-TxInput-S1 ~ S4 까지 진행해줘.
```

한 창에서 **한 항목의 `S1`~`S4`(1차)** 를 이어 돈다. 끝나면 🧑 확인 게이트에서 멈추고 창을 닫는다.
게이트를 통과하면 `S5`·`S6` 를 새 창에서 한다.

## 단계

| 단계 | 내용                                               | 양식 소유                            |
| ---- | -------------------------------------------------- | ------------------------------------ |
| `S1` | 문서 = 명세 + 현행 코드 감사 (유지/수정/폐기 판정) | `001`                                |
| `S2` | 구현 = 감사 결과 반영                              | `001`                                |
| `S3` | 테스트                                             | [902](../902_testing/README.md)      |
| `S4` | 스토리북                                           | [901](../901_storybook/README.md)    |
| `S5` | 문서 사이트                                        | [903](../903_docs_site/README.md)    |
| `S6` | 에이전트 가이드                                    | [904](../904_claude_guide/README.md) |

## 진행 순서

**위에서 아래로 내려간다.** 그룹 안에서는 순서를 바꿔도 된다.

### A. 파일럿

플로우 절차와 커스터마이징 방침을 여기서 확정한다. **나머지는 이게 끝나기 전에 시작하지 않는다.**

| 컴포넌트    | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                                                      | 문서                                 |
| ----------- | --- | --- | --- | --- | --- | --- | --- | ----------------------------------------------------------------------------- | ------------------------------------ |
| `TxSpinner` | ✅  | ✅  | ✅  | ✅  | ✅  | ⏸   | ✅  | 56행 · theme✗ · types(동거) · **test 15** · tag✓ · **스토리5** · named export | [TxSpinner](components/TxSpinner.md) |
| `TxButton`  | ✅  | ✅  | ✅  | ✅  | ✅  | ⏸   | ✅  | 76행 · theme✓ · types(동거) · **test 20** · tag✓ · **스토리6**                | [TxButton](components/TxButton.md)   |

### B. 파일럿에 묶인 것

파일럿의 결정이 그대로 걸리는 항목. 바로 뒤에 붙인다.

| 컴포넌트    | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                               | 문서                                 |
| ----------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------------ | ------------------------------------ |
| `TxLoading` |     |     |     |     |     |     |     | 43행 · theme✗ · types✓ · test✗ · tag✓ · 스토리3        | [TxLoading](components/TxLoading.md) |
| `TxTheme`   |     |     |     |     |     |     |     | 24행 · theme✗ · types✗ · test✗ · tag✗ · **스토리없음** | [TxTheme](components/TxTheme.md)     |

### C. 존치 판정 먼저

**S1 에서 폐기될 수 있다.** 먼저 잘라내면 뒤가 가벼워진다.

| 컴포넌트            | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                                            | 문서                                                 |
| ------------------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| `TxCoolTable`       |     |     |     |     |     |     |     | 1031행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4                   | [TxCoolTable](components/TxCoolTable.md)             |
| `TxFlex`            |     |     |     |     |     |     |     | 7행 · theme✗ · types✗ · test✗ · tag✓ · 스토리3                      | [TxFlex](components/TxFlex.md)                       |
| `TxClipboardButton` |     |     |     |     |     |     |     | 6행 · theme✗ · types✗ · test✗ · tag✗ · 스토리2 · **default export** | [TxClipboardButton](components/TxClipboardButton.md) |
| `TxIcons`           |     |     |     |     |     |     |     | 80행 · theme✗ · types✗ · test✗ · tag✗ · **스토리없음**              | [TxIcons](components/TxIcons.md)                     |

### D. 폼 계열

`TxInput` 이 이 계열의 기준이 된다. 그 다음은 같은 규약의 반복이라 🤖 비중이 커진다.

| 컴포넌트          | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                                              | 문서                                             |
| ----------------- | --- | --- | --- | --- | --- | --- | --- | --------------------------------------------------------------------- | ------------------------------------------------ |
| `TxInput`         |     |     |     |     |     |     |     | 315행 · theme✓ · types✓ · test✗ · tag✓ · 스토리9 · **default export** | [TxInput](components/TxInput.md)                 |
| `TxTextarea`      |     |     |     |     |     |     |     | 105행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4                      | [TxTextarea](components/TxTextarea.md)           |
| `TxCheckBox`      |     |     |     |     |     |     |     | 85행 · theme✓ · types✓ · test✗ · tag✓ · 스토리5                       | [TxCheckBox](components/TxCheckBox.md)           |
| `TxDropdown`      |     |     |     |     |     |     |     | 689행 · theme✓ · types✓ · test✗ · tag✓ · 스토리7                      | [TxDropdown](components/TxDropdown.md)           |
| `TxCapsLockCheck` |     |     |     |     |     |     |     | 60행 · theme✗ · types✗ · test✗ · tag✗ · 스토리3                       | [TxCapsLockCheck](components/TxCapsLockCheck.md) |
| `TxForm`          |     |     |     |     |     |     |     | 251행 · theme✓ · types✓ · test✗ · tag✓ · 스토리5                      | [TxForm](components/TxForm.md)                   |

### E. 오버레이

열림/닫힘·포커스·바깥클릭 규약이 공통이다. 한 항목에서 정하면 나머지가 따라온다.

| 컴포넌트        | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                         | 문서                                         |
| --------------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------ | -------------------------------------------- |
| `TxModal`       |     |     |     |     |     |     |     | 91행 · theme✓ · types✗ · test✗ · tag✓ · 스토리4  | [TxModal](components/TxModal.md)             |
| `TxSlidePanel`  |     |     |     |     |     |     |     | 158행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 | [TxSlidePanel](components/TxSlidePanel.md)   |
| `TxDropMenu`    |     |     |     |     |     |     |     | 217행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 | [TxDropMenu](components/TxDropMenu.md)       |
| `TxToolTip`     |     |     |     |     |     |     |     | 135행 · theme✗ · types✗ · test✗ · tag✓ · 스토리5 | [TxToolTip](components/TxToolTip.md)         |
| `TxContextMenu` |     |     |     |     |     |     |     | 168행 · theme✓ · types✓ · test✗ · tag✓ · 스토리3 | [TxContextMenu](components/TxContextMenu.md) |

### F. 레이아웃 · 내비

| 컴포넌트   | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                         | 문서                               |
| ---------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------ | ---------------------------------- |
| `TxLayout` |     |     |     |     |     |     |     | 403행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 | [TxLayout](components/TxLayout.md) |
| `TxHeader` |     |     |     |     |     |     |     | 28행 · theme✓ · types✗ · test✗ · tag✓ · 스토리3  | [TxHeader](components/TxHeader.md) |
| `TxCard`   |     |     |     |     |     |     |     | 170행 · theme✓ · types✓ · test✗ · tag✓ · 스토리5 | [TxCard](components/TxCard.md)     |
| `TxTabs`   |     |     |     |     |     |     |     | 111행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 | [TxTabs](components/TxTabs.md)     |

### G. 데이터 · 무거운 의존

subpath 격리가 걸린 항목이 있다. 마지막에 둔다.

| 컴포넌트      | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                                                        | 문서                                     |
| ------------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| `TxJsonTree`  |     |     |     |     |     |     |     | 249행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4                                | [TxJsonTree](components/TxJsonTree.md)   |
| `TxAgGrid`    |     |     |     |     |     |     |     | 679행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 · **default export** · subpath | [TxAgGrid](components/TxAgGrid.md)       |
| `TxDayPicker` |     |     |     |     |     |     |     | 399행 · theme✓ · types✓ · test✗ · tag✗ · 스토리8 · subpath                      | [TxDayPicker](components/TxDayPicker.md) |

## 공통 job (컴포넌트에 속하지 않는 것)

파일럿에서 나온 **전 패키지 결정**을 기계적으로 반영하는 job. 컴포넌트별 S2 에 끌고 다니지 않는다.

| job ID          | 내용                                                                                             | 상태 | 근거                                                       |
| --------------- | ------------------------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------- |
| `001-typenames` | `ITx*` 53개 → `Tx*Props` **일괄 리네임 1커밋.** 기계적 치환. 공개 타입이 바뀌므로 changeset 동반 |      | [TxSpinner §5 Q1](components/TxSpinner.md#q1--i-접두-폐지) |

## 완료 조건

- 한 항목은 **6단계가 다 `✅` 이면 끝**이다. 다시 열지 않는다
- `❌` 폐기는 정당한 결과다. S1 에서 끝나고 제거는 S2 에서 한다 (**제거는 major**)
- 단계를 건너뛰면 **비고에 사유를 남긴다**
