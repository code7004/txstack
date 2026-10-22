---
"@txstack/ui": minor
---

`TxDayPicker` · `TxDayPickerRange`(와 `TxFormDayPicker` · `TxFormDayPickerRange`)에 `min` · `max` 를 더한다 — 고를 수 있는 범위다. 그 밖의 날은 눌리지 않고 그 밖의 달로는 넘어가지 않는다. 양 끝 날은 고를 수 있고 날짜 단위로 본다(HTML `<input type="date" min max>` 와 같다). 오늘까지만이면 `max={new Date()}`. `maxDays` 와 함께 주면 둘 다 건다. 고른 것이 없을 때 펴는 달도 범위 안으로 당긴다. 값(`value` · `ref.setValue`)은 고치지 않는다 — 고르는 손만 막는다.
