# 008 · TxCheckBox

> 고르는 자리. 네모를 눌러 체크한다.

|             |                                                                   |
| ----------- | ----------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                     |
| 내보내는 것 | `TxCheckBox`                                                      |
| 소스        | [`packages/ui/src/TxCheckBox/`](../../packages/ui/src/TxCheckBox) |
| 테스트      | 32개                                                              |

## 개발 목적

고르는 자리. 원본은 `<div>` 에 클릭을 붙인 가짜였다 — 진짜 `<input type="checkbox">` 로 다시 만들어 폼 · 키보드 · 스크린리더가 저절로 따라오게 한다.

## 기능

```tsx
<TxCheckBox label="동의합니다" onChangeBool={setAgreed} />
```

**그 자리에서 바로 켜고 끄는 것은 `TxSwitch` 다.** 체크박스는 "이것을 고르겠다" 를
모아 두었다가 제출하는 자리고, 스위치는 누르는 즉시 반영된다 — 스크린리더도
"선택됨" 과 "켜짐/꺼짐" 으로 다르게 읽는다.

`checked` 를 주면 controlled, `defaultChecked` 를 주면 uncontrolled 다.
`name` · `value` · `disabled` · `required` 같은 표준 속성이 그대로 통과하므로
**`<form>` 안에서 그냥 제출된다.**

전체가 하나의 `<label>` 이라 글을 눌러도 토글되고, Tab 으로 도달해 Space 로 켠다.

색·크기는 CSS 변수로 바꾼다 — 앱 전체는 `:root { --tx-color-primary: … }`,
이 컴포넌트만은 `.tx-checkbox { --tx-checkbox-size: … }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxCheckBox/`
- [x] **테스트** — 32개
- [x] **스토리** — `TxCheckBox.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

원본은 `<div onClick>` 이었다. 키보드로 도달할 수 없고, 스크린리더가 체크박스로 읽지 않고,
**`<form>` 안에서 값이 제출되지 않았다.** `TxForm` 에 들어갈 컴포넌트인데 폼 필드로 동작하지 않았다.

시각적으로만 숨긴 **진짜 `<input type="checkbox">`** 를 `<label>` 로 감싸는 표준 구조로 다시 만들었다.
그러면 키보드·스크린리더·폼 제출이 전부 공짜로 따라오고, `name` · `value` · `required` 같은
표준 속성도 그냥 통과한다. **`display: none` 으로 지우면 안 된다** — 그러면 Tab 도 폼 제출도 죽는다.

상태를 CSS 가 `:checked` 로 읽으므로 **컴포넌트가 체크 상태를 들지 않는다.** 원본은 `value` 를
내부 state 로 복사하고 effect 로 동기화해서, controlled 로 쓰는데 콜백을 안 주면 어긋났다.

원본의 `variant="toggle"` 은 **`TxSwitch` 로 갈라냈고, 이 컴포넌트에서는 `variant` 를 걷어냈다.**
즉시 반영되는 켜고 끄기는 뜻이 달라서다 — 근거는 [041_TxSwitch](041_TxSwitch.md).

체크 여부는 **`value` 가 아니라 `checked`** 다. 원본은 `value` 에 boolean 을 받았는데, 표준
체크박스에서 `value` 는 폼 제출 때 실리는 문자열이다. 표준 속성을 그대로 통과시키므로 뜻도 표준을 따른다.

```tsx
<TxCheckBox value={agreed} />    // 원본 — 타입 에러
<TxCheckBox checked={agreed} />  // 지금
```

죽은 prop 세 개(`borderColor` · `fillColor` · `cursorColor`)를 걷어냈다. 타입에 선언만 있고
구현에서 꺼내 쓰지도 않았다. 대신 `disabled` 가 없던 것을 채웠다.
