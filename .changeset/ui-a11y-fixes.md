---
"@txstack/ui": patch
---

접근성 결함 둘을 고쳤다. `TxDayPicker` · `TxDayPickerRange` 의 트리거가 `role="combobox"` 가 되어 폼 오류(`aria-invalid`)가 스크린리더에 전달된다 — 전에는 버튼 역할이라 무시됐다. 테스트에서 트리거를 찾는다면 `getByRole("combobox")` 로 바꾼다. `TxContextMenu` 를 왼쪽 클릭으로 여는 자리(`button="left"` · `"both"`)는 Tab 으로 닿고 Enter · Space 로 열린다. 키보드로 열면 감싼 요소의 가운데에 뜬다 — 전에는 화면 왼쪽 위에 떴다.
