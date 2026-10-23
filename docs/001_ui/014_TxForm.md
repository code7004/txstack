# 014 · TxForm

> 폼 한 줄을 짜는 계층. 캡션 · 에러 · 필수 표시를 컨트롤과 **잇는다.**

|             |                                                           |
| ----------- | --------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                             |
| 내보내는 것 | `TxForm, TxFormField`                                     |
| 소스        | [`packages/ui/src/TxForm/`](../../packages/ui/src/TxForm) |
| 테스트      | 39개                                                      |

## 개발 목적

캡션 · 에러 · 필수 표시를 컨트롤과 **이어 주는** 계층. 원본은 그 배선이 통째로 없어서, 캡션이 어떤 컨트롤과도 이어지지 않고 에러가 화면에만 떴다.

## 기능

코어 배럴이 `react-day-picker` 를 import 하면 optional peer 가 성립하지 않는다.
날짜 필드는 `@txstack/ui/daypicker` 의 `TxFormDayPicker` · `TxFormDayPickerRange` 다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxForm/`
- [x] **테스트** — 39개
- [x] **스토리** — `TxForm.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

옮길 실질 코드가 거의 없는 자리인데 **결함이 14건** 나왔다. 재작성했다.

**캡션이 `<label>` 이 아니었다.** `<div>` 로 그려서 어떤 컨트롤과도 이어지지 않았다 —
스크린리더는 이름 없는 입력으로 읽었고, 캡션을 눌러도 포커스가 가지 않았다.
**에러도 마찬가지였다.** `aria-invalid` 도 `aria-describedby` 도 없어서 화면에만 떴다.

이제 필드가 `id` 를 만들어 셋을 잇는다. **컨트롤의 종류에 따라 잇는 방법이 다르다.**

| 컨트롤                                      | 방법              | 왜                                                 |
| ------------------------------------------- | ----------------- | -------------------------------------------------- |
| `Input` `SearchInput` `Textarea` `Combobox` | `<label for>`     | `<input>`·`<textarea>` 는 이름을 붙일 수 있다      |
| `Dropdown` `DayPicker`                      | `aria-labelledby` | 헤드가 `<div>`·`<button>` 이라 `for` 가 안 먹는다  |
| `CheckBox`                                  | 잇지 않는다       | `label` 로 자기 이름을 이미 갖고 있다. 겹쳐 읽힌다 |

**가리키는 곳이 없는 `htmlFor` 를 만들지 않는다.** `TxForm.Field` 는 `htmlFor` 를 준 때만
캡션을 `<label>` 로 그리고, 안 주면 `<span>` 이다.

이 배선을 위해 이미 나간 컴포넌트 세 곳에 통로를 열었다 — `TxDropdown` 과 `TxDayPicker` 는
props 타입이 닫혀 있어 `aria-describedby` 조차 넘길 수 없었고, `TxInputLike` 는 `id` 가 없었다.
**넷 다 더하기만 했다.**

### `labelWidth` 는 아무 일도 하지 않고 있었다

Context 로 내려간 값을 읽는 것은 `TxForm.Label` 뿐이었는데, 필드는 `Label` 이 아니라
`caption` 으로 그린다. **그래서 어떤 필드도 정렬되지 않았다** — 그걸 보여주던 스토리가
일어나지 않는 일을 보여주고 있었다.

값의 모양도 문제였다. `"w-24"` 라는 **Tailwind 클래스 문자열**이라 Tailwind 를 쓰지 않는
소비자에게는 아무 값도 아니다. 지금은 CSS 길이(`"6rem"`)를 받아 `--tx-form-label-width` 를
세우고, **배치는 CSS 가 정한다.** Context 도 리렌더도 없고, 소비자가 그 변수를 직접 덮어도 똑같이 동작한다.

### 메시지는 자리가 하나다

원본은 `warning` 과 `error` 를 **같은 좌표**(`absolute -bottom-5 left-0`)에 그려서 둘이 있으면
글자가 포개졌다. 스토리 문서에는 "error 가 우선한다" 고 적혀 있었지만 그렇게 만드는 코드가 없었다.

이제 슬롯 하나에 `error` 가 우선한다. 문구 앞에 붙던 영어 하드코딩(`warning ` · `error `)도 없앴다 —
소비자가 바꿀 수 없었고 스크린리더도 그대로 읽었다.

**빈 자리를 미리 잡아 둔다.** 에러가 떴다 사라져도 아래 줄이 밀리지 않고, live region 이
먼저 자리잡고 있어야 안에서 바뀐 내용이 읽힌다 (`TxCapsLockCheck` 에서 겪은 것과 같다).
높이는 글자 크기에서 계산하므로 `--tx-form-message-reserve: 0` 한 줄로 되돌릴 수 있다.

### 그 밖에 고친 것

- **`data-tag` 가 통과 props 에 덮였다.** 스프레드보다 앞에 있어서, `TxForm.Input` 이 넘긴
  값이 `TxForm.Field` 라는 이름을 지웠다. 게다가 `SearchInput` 이 `data-tag="TxForm.Input"` 을
  주고 있었다 — 복붙 실수다. 지금은 필드가 늘 `TxForm.Field` 이고 컨트롤이 자기 이름을 갖는다
- **`className` 의 목적지가 컴포넌트마다 달랐다.** `Input` 은 필드 상자로, `Dropdown` 은
  구조분해에서 빠져 드롭다운 자체로 샜다. 지금은 전부 **필드 상자**다 — 그리드에 놓는 자리다
- **입력창마다 `w-full` 이 박혀 있었다.** 소비자가 폭을 되돌릴 수 없다. 그리드 항목은 칸을
  저절로 채우므로 클래스가 필요 없다
- **타입이 거짓말했다.** `TxFormInput` 이 필드 테마 타입의 값을 `TxInput` 의 `theme` 으로 넘겼다
- **순환 참조.** `TxForm.hook.ts` 가 배럴을 import 하고 배럴이 그 훅을 내보냈다
- 죽은 테마 키 둘(`field.readOnly` · `field.surface`)과 `theme` prop 전체를 걷어냈다
- `memo` 셋 · `useMemo` 둘 · `useCallback` 하나가 전부 헛일이었다. `children` 을 받거나
  인라인 객체를 deps 로 삼아서 매 렌더 새 참조였다. "렌더마다 반복될 수 있어 안정화한다" 는
  주석이 붙어 있었지만 사실이 아니었다

### 밀도는 배치가 정한다 — prop 을 늘리지 않았다

원본이 캡션을 테두리에 얹고 메시지를 띄운 이유는 **공간을 적게 쓰려던 것**이었다.
그 대가가 겹침이었다. 그렇다고 자리를 다 잡으면 한 행이 두 배가 된다.

같은 필드를 배치만 바꿔 재 본 값이다.

| 조합                                          | 필드   | 한 행      |
| --------------------------------------------- | ------ | ---------- |
| 기본 — 세로 쌓기 + 메시지 자리 예약           | 87.5px | **99.5px** |
| `labelWidth` — 캡션이 왼쪽으로                | 62px   | **74px**   |
| `labelWidth` + `--tx-form-message-reserve: 0` | 44px   | **56px**   |
| (원본 — 노치 + 겹침)                          | 40px   | ~52px      |

**세 번째가 원본만큼 조밀한데 겹치지 않는다.** 그래서 새 prop 을 만들지 않았다 —
`labelWidth` 와 토큰 하나가 이미 그 일을 한다.

**기본값은 안전한 쪽에 뒀다.** 라이브러리의 기본이 "에러가 뜨면 줄이 밀린다" 이면
소비자는 그걸 겪고 나서야 알게 된다. 반대로 조밀하게 만드는 것은 한 줄이면 되고,
그 줄을 쓰는 사람은 무엇을 맞바꾸는지 알고 쓴다. `Density` 스토리가 셋을 나란히 보여 준다.

### 캡션을 테두리에 얹는다 — `captionPlacement="border"` (2026-10-23, 사용자 결정)

```tsx
// 검색 툴바 — 이 줄 안의 필드는 캡션이 컨트롤의 윗 테두리에 얹힌다
<TxForm.Flex captionPlacement="border">
  <TxForm.SearchInput caption="검색어" className="flex-[3]" onSubmitText={search} />
  <TxForm.Dropdown caption="금액필터" data={FIELDS} value={field} onChangeText={setField} />
  <TxForm.Input caption="총입금 이상" type="number" onSubmitNumber={setLow} />
  <TxForm.Input caption="총입금 이하" type="number" onSubmitNumber={setHigh} />
</TxForm.Flex>

// 폼 전체에 줄 수도 있다
<TxForm captionPlacement="border" onSubmit={save}>
  <TxForm.Input caption="이름" value={name} onChangeText={setName} error={nameError} />
</TxForm>
```

**왜 지금 다시 보는가.** 위 결정은 **폼**을 보고 내렸다 — 캡션을 왼쪽으로 보내면(`labelWidth`) 조밀하고
겹치지 않는다. 그런데 소비자 둘에서 나온 자리는 **툴바**(표 위의 검색 · 필터 한 줄)다.

- 툴바는 가로로 빽빽하다. `labelWidth` 는 캡션마다 가로 칸을 떼어 줘서 그만큼 컨트롤이 좁아진다
- 위에 쌓으면 캡션 한 줄 + 메시지 한 줄이 늘어 한 행이 두 배가 된다 — usertics 의 가입자 표 위가 그랬다
- black-message 는 이미 `FilterDropdown` 을 따로 만들어 이 모양을 잇고 있다. usertics 도 같은 것이 필요하다.
  앱마다 컨트롤마다 감싸개가 늘어나는 자리다

**원본의 겹침은 되살리지 않는다.** 원본이 겹친 것은 **메시지**를 띄웠기 때문이다(`absolute -bottom-5`).
이 안은 **캡션만** 얹고 메시지는 지금처럼 컨트롤 아래 제자리에 둔다.

| 무엇                 | 이 안에서                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 캡션                 | 컨트롤의 윗 테두리 왼쪽에 얹힌다. 테두리 선이 글자를 가로지르지 않게 바탕(`--tx-form-caption-bg`, 기본 표면색)을 깐다                            |
| 캡션의 뜻            | 그대로 진짜 `<label>` · `aria-labelledby` 다. 눌러도 컨트롤로 포커스가 간다                                                                      |
| 메시지               | 컨트롤 아래 제자리. **빈 자리는 잡지 않는다**(`--tx-form-message-reserve` 기본 0) — 툴바에 메시지가 뜰 일이 드물다. 잡고 싶으면 그 토큰을 덮는다 |
| 위 여백              | 얹힌 캡션의 절반 높이만큼 필드 위에 둔다 — 윗줄 · 카드 제목과 겹치지 않게                                                                        |
| `labelWidth` 와 함께 | `border` 가 이긴다. 둘은 캡션을 놓는 자리라 한 번에 하나다                                                                                       |
| 체크박스             | 얹지 않는다 — 테두리가 없는 컨트롤이라 위에 쌓던 그대로 둔다                                                                                     |

**정한 것**

1. **이름은 `captionPlacement`** — `"top"`(기본) · `"border"`. 왼쪽은 이미 `labelWidth` 하나로 켜지므로
   `"start"` 는 만들지 않았다. `floatingCaption`(불리언)은 자리가 하나 더 생기면 이름이 또 늘어서 버렸다
2. **`TxForm` 과 `TxForm.Flex` 둘에 붙는다.** 툴바는 `<form>` 이 아닌 경우가 많다
3. **가까운 쪽이 이긴다.** 그래서 **CSS 자손 선택자로 하지 않았다** — 바깥 폼의 속성이 안쪽 줄의 필드까지
   똑같이 짚어 바깥이 이길 수 있다(셸 안의 셸에서 겪은 것과 같다). 대신 폼 · 줄이 컨텍스트로 값을 내려 주고
   **필드가 자기 표시(`data-caption-placement`)를 갖는다.** 값을 안 준 줄은 공급하지 않아 바깥 값이 흘러든다
4. **`labelWidth` 보다 이긴다.** `labelWidth` 의 규칙이 표시가 없는 필드에만 걸리게(`:not([data-caption-placement])`)
   바꿨다 — `"top"` 을 준 줄도 `labelWidth` 폼 안에서 위에 쌓인다

체크박스는 `:has(> .tx-checkbox)` 로 걸러 위에 쌓던 그대로 둔다. 캡션 글자는 이 배치에서만 기본 `0.75rem` 이다.

### `TxForm.Flex` 는 폭을 나눈다

`TxFlex` 와 겹쳐 보이지만 다르다 — **자식이 남는 폭을 똑같이 나눠 갖는다.**
원본 스토리가 버튼마다 `className="flex-1"` 을 붙이고 있던 자리다. `TxFlex` 는 내용만큼만 차지한다.

전역 토큰이 하나 늘었다 — `--tx-color-warning`.

**밝은 노랑을 쓰지 않는다.** 원본은 `text-yellow-300` 이었는데 흰 바탕에서 대비가 1.32:1 이라
작은 글씨로는 사실상 안 보였다 (AA 기준 4.5:1). 흰 바탕에서 그 기준을 넘는 노랑은
`yellow-700`(`#a16207`, 4.92:1) 뿐이다. 다크는 바탕이 어두우니 반대로 밝은 노랑
(`#facc15`, 11.66:1)이 읽힌다.
