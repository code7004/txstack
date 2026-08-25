# 001_ui/components — 컴포넌트별 명세

컴포넌트 하나당 문서 하나. **그 컴포넌트에 대한 단일 진실 공급원이다.**

- 이 문서들은 [컴포넌트 플로우](../../00_foundation/06_COMPONENT_FLOW.md) 의 **S1 산출물**이다
- 스토리(S4) · 문서 사이트(S5) · Claude 가이드(S6) 는 이 문서를 **참조·발췌**한다.
  사실이 갈리면 **여기를 고치고 나머지를 맞춘다**
- 진행 상황은 [30_tasks.md](../30_tasks.md) 보드에서 본다

## 목록 (26)

각 문서에는 **자동 수집한 현재 코드 인벤토리**와 **착수 전에 알아야 할 것**이 미리 채워져 있다.

**A. 파일럿** — [TxSpinner](TxSpinner.md) · [TxButton](TxButton.md)

**B. 파일럿에 묶인 것** — [TxLoading](TxLoading.md) · [TxTheme](TxTheme.md)

**C. 존치 판정 먼저** — [TxCoolTable](TxCoolTable.md) · [TxFlex](TxFlex.md) · [TxClipboardButton](TxClipboardButton.md) · [TxIcons](TxIcons.md)

**D. 폼 계열** — [TxInput](TxInput.md) · [TxTextarea](TxTextarea.md) · [TxCheckBox](TxCheckBox.md) · [TxDropdown](TxDropdown.md) · [TxCapsLockCheck](TxCapsLockCheck.md) · [TxForm](TxForm.md)

**E. 오버레이** — [TxModal](TxModal.md) · [TxSlidePanel](TxSlidePanel.md) · [TxDropMenu](TxDropMenu.md) · [TxToolTip](TxToolTip.md) · [TxContextMenu](TxContextMenu.md)

**F. 레이아웃 · 내비** — [TxLayout](TxLayout.md) · [TxHeader](TxHeader.md) · [TxCard](TxCard.md) · [TxTabs](TxTabs.md)

**G. 데이터 · 무거운 의존** — [TxJsonTree](TxJsonTree.md) · [TxAgGrid](TxAgGrid.md) · [TxDayPicker](TxDayPicker.md)

## 작성 상태

| 문서                      | S1 상태                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| [TxSpinner](TxSpinner.md) | **✅ S1·S2 완료 (2026-08-25)** — 판정 **수정**. **S1 작성 양식의 본보기** |
| 그 외 25종                | 스켈레톤 (인벤토리만 채워짐)                                              |

## S1 완료 조건

1. **목적** — 왜 있나. 없으면 소비자가 무엇을 직접 해야 하나
2. **공개 API** — props · 콜백 시그니처
3. **커스터마이징 지점** — 어디까지 바꿀 수 있나
4. **현행 코드 감사** — **유지 / 수정 / 폐기** 판정 + 결함·불필요 코드 목록
5. **사용 예제** — 흔한 케이스 1개 + 커스터마이징 케이스 1개 (복붙 가능)
6. **하지 않는 것** — 범위 밖

양식 예시는 [TxSpinner.md](TxSpinner.md) 를 본다.
