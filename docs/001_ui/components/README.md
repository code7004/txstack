# 001_ui/components — 컴포넌트별 명세

컴포넌트 하나당 문서 하나. **그 컴포넌트에 대한 단일 진실 공급원이다.**

- 이 문서들은 [컴포넌트 플로우](../../00_foundation/06_COMPONENT_FLOW.md) 의 **S1 산출물**이다
- 스토리(S4) · 문서 사이트(S5) · Claude 가이드(S6) 는 이 문서를 **참조·발췌**한다.
  사실이 갈리면 **여기를 고치고 나머지를 맞춘다**
- 진행 상황은 [30_tasks.md](../30_tasks.md) 보드에서 본다

## 폴더 두 개 — **여기는 진행 중·완료만** (2026-08-26)

| 어디          | 무엇                                                             |
| ------------- | ---------------------------------------------------------------- |
| `components/` | **진행 중이거나 끝난 것.** 지금은 `01`~`04`                      |
| `_pending/`   | **아직 뽑지 않은 것.** 자동 수집 인벤토리만 채워진 스켈레톤 22개 |

**착수할 때 `_pending/` 에서 `components/` 로 꺼낸다.** 그러면 이 폴더를 열었을 때
지금 무엇을 하고 있는지가 바로 보인다 — 26개를 한꺼번에 보지 않는다.

```sh
git mv docs/001_ui/components/_pending/05_TxCoolTable.md docs/001_ui/components/
```

꺼내면서 이 문서의 표와 [30_tasks.md](../30_tasks.md) 의 링크를 `_pending/` 없는 경로로 고친다. **두 곳뿐이다.**

## 목록 (26) — **파일 이름 번호가 작업 순서다**

**위에서 아래로 내려간다.** `01` 부터 시작해 번호대로 하나씩 끝까지 올린다.
번호는 [30_tasks.md](../30_tasks.md) 의 그룹 순서(A~G)를 그대로 편 것이다.

`_pending/` 문서에는 **자동 수집한 현재 코드 인벤토리**와 **착수 전에 알아야 할 것**만 있다.

| #      | 컴포넌트                                              | 그룹                   | 상태                                                |
| ------ | ----------------------------------------------------- | ---------------------- | --------------------------------------------------- |
| **01** | [TxSpinner](01_TxSpinner.md)                          | A 파일럿               | **S6 까지 ✅ (2차)** — 26종의 본보기. `S5` 만 ⏸     |
| **02** | [TxButton](02_TxButton.md)                            | A 파일럿               | **S6 까지 ✅ (2차)** — 토큰·레이어·상태. `S5` 만 ⏸  |
| 03     | [TxLoading](03_TxLoading.md)                          | B 파일럿에 묶인 것     | **🧑 확인까지 ✅.** 포털의 첫 선례 · `S5`⏸ `S6`남음 |
| 04     | [TxTheme](04_TxTheme.md)                              | B 파일럿에 묶인 것     | **❌ 폐기** — 공개 API 에서 제거. 파일은 참조 0에서 |
| 05     | [TxCoolTable](_pending/05_TxCoolTable.md)             | C 존치 판정 먼저       |                                                     |
| 06     | [TxFlex](_pending/06_TxFlex.md)                       | C 존치 판정 먼저       |                                                     |
| 07     | [TxClipboardButton](_pending/07_TxClipboardButton.md) | C 존치 판정 먼저       |                                                     |
| 08     | [TxIcons](_pending/08_TxIcons.md)                     | C 존치 판정 먼저       |                                                     |
| 09     | [TxInput](_pending/09_TxInput.md)                     | D 폼 계열              | 이 계열의 기준이 된다                               |
| 10     | [TxTextarea](_pending/10_TxTextarea.md)               | D 폼 계열              |                                                     |
| 11     | [TxCheckBox](_pending/11_TxCheckBox.md)               | D 폼 계열              |                                                     |
| 12     | [TxDropdown](_pending/12_TxDropdown.md)               | D 폼 계열              |                                                     |
| 13     | [TxCapsLockCheck](_pending/13_TxCapsLockCheck.md)     | D 폼 계열              |                                                     |
| 14     | [TxForm](_pending/14_TxForm.md)                       | D 폼 계열              |                                                     |
| 15     | [TxModal](_pending/15_TxModal.md)                     | E 오버레이             | 열림/닫힘 규약을 여기서 정한다                      |
| 16     | [TxSlidePanel](_pending/16_TxSlidePanel.md)           | E 오버레이             |                                                     |
| 17     | [TxDropMenu](_pending/17_TxDropMenu.md)               | E 오버레이             |                                                     |
| 18     | [TxToolTip](_pending/18_TxToolTip.md)                 | E 오버레이             |                                                     |
| 19     | [TxContextMenu](_pending/19_TxContextMenu.md)         | E 오버레이             |                                                     |
| 20     | [TxLayout](_pending/20_TxLayout.md)                   | F 레이아웃 · 내비      |                                                     |
| 21     | [TxHeader](_pending/21_TxHeader.md)                   | F 레이아웃 · 내비      |                                                     |
| 22     | [TxCard](_pending/22_TxCard.md)                       | F 레이아웃 · 내비      |                                                     |
| 23     | [TxTabs](_pending/23_TxTabs.md)                       | F 레이아웃 · 내비      |                                                     |
| 24     | [TxJsonTree](_pending/24_TxJsonTree.md)               | G 데이터 · 무거운 의존 |                                                     |
| 25     | [TxAgGrid](_pending/25_TxAgGrid.md)                   | G 데이터 · 무거운 의존 | subpath 격리                                        |
| 26     | [TxDayPicker](_pending/26_TxDayPicker.md)             | G 데이터 · 무거운 의존 | subpath 격리                                        |

빈 칸은 미착수다. 단계별 상태(S1~S6)는 [30_tasks.md](../30_tasks.md) 보드가 소유한다 — 여기서 중복하지 않는다.

**그룹 안에서는 순서를 바꿔도 된다.** 그룹을 건너뛰지 않는 것이 중요하다 —
앞 그룹에서 정해지는 규약(파일럿의 커스터마이징, `TxInput` 의 폼 규약, `TxModal` 의 열림/닫힘)이
뒤 그룹에 그대로 걸리기 때문이다.

**번호는 바꾸지 않는다.** 폐기(`❌`)된 컴포넌트의 번호도 비워 둔 채 남긴다 —
번호를 당기면 이미 적힌 링크와 커밋 메시지가 다른 것을 가리키게 된다.

## S1 완료 조건

1. **목적** — 왜 있나. 없으면 소비자가 무엇을 직접 해야 하나
2. **공개 API** — props · 콜백 시그니처
3. **커스터마이징 지점** — 어디까지 바꿀 수 있나
4. **현행 코드 감사** — **유지 / 수정 / 폐기** 판정 + 결함·불필요 코드 목록
5. **사용 예제** — 흔한 케이스 1개 + 커스터마이징 케이스 1개 (복붙 가능)
6. **하지 않는 것** — 범위 밖

양식 예시는 [01_TxSpinner.md](01_TxSpinner.md) 를 본다.
