# 041 · TxSwitch

> 그 자리에서 바로 켜고 끄는 자리.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxSwitch` |
| 소스 | [`packages/ui/src/TxSwitch/`](../../packages/ui/src/TxSwitch) |
| 테스트 | 24개 |

## 개발 목적

그 자리에서 바로 켜고 끄는 것. `TxCheckBox` 와 **뜻이 달라서**(제출해야 반영되는 것 대 즉시 반영되는 것) 갈라 두었다.

## 기능

```tsx
<TxSwitch label="알림 받기" defaultChecked onChangeBool={setPush} />
```

**`TxCheckBox` 와 하는 말이 다르다.** 체크박스는 "이것을 고르겠다" 를 **모아 두었다가
제출**하는 자리고, 스위치는 **누르는 즉시 켜지고 꺼진다.** 스크린리더도 "선택됨" 이
아니라 "켜짐 / 꺼짐" 으로 읽는다(`role="switch"`).

그래서 **확인 버튼이 뒤따르는 폼에는 체크박스**를 쓴다. 눌러 놓고 저장을 안 눌렀는데
켜진 것처럼 보이면 거짓말이 된다.

진짜 `<input type="checkbox">` 라 Tab 으로 도달해 Space 로 켜지고, `name` · `value` ·
`disabled` 가 그대로 통하므로 **`<form>` 안에서 그냥 제출된다.**

겉모습은 CSS 변수로 바꾼다 — `.tx-switch { --tx-switch-track-width: 3rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxSwitch/`
- [x] **테스트** — 24개
- [x] **스토리** — `TxSwitch.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### `TxSwitch` 를 `TxCheckBox` 에서 갈랐다 (결정됨)

`TxCheckBox` 가 이미 `variant="toggle"` 로 스위치를 하고 있었다. **겉모습이 아니라
하는 말이 달라서** 갈랐다 — 체크박스는 "이것을 고르겠다" 를 **모아 두었다가 제출**하고,
스위치는 **누르는 즉시 반영**된다. 스크린리더도 "선택됨" 과 "켜짐/꺼짐" 으로 다르게 읽는다.

가른 뒤 **`TxCheckBox` 에서 `variant` 를 걷어냈다.** 남겨 두면 같은 일에 답이 둘이 되고,
한쪽만 고쳐진다 — `TxBadge`/`TxTag` 때와 같은 판단이다. 토큰도 `--tx-switch-*` 로 따로
가져간다: 스위치 크기를 바꾸려다 체크박스가 함께 바뀌면 안 된다.
