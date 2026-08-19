---
"@txstack/ui": minor
---

props 인터페이스 3종을 export 한다.

`TxCapsLockCheck` · `TxSpinner` · `TxTooltip` 은 props 인터페이스를 선언만 하고 내보내지 않아,
소비자가 이 컴포넌트를 감싸는 래퍼를 만들 때 props 타입을 참조할 수 없었다. 나머지 컴포넌트는
전부 내보내고 있어 일관성도 깨져 있었다.

- `ITxCapsLockCheckProps` (신규 export)
- `ITxSpinnerProps` (신규 export, 기존 내부 이름 `TxSpinnerProps`)
- `ITxTooltipProps` (신규 export)

이름은 `I<컴포넌트명>Props` 규칙에 맞췄다. 이전에는 내보내지 않았으므로 소비자 마이그레이션은 없다.
