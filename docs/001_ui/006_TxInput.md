# 006 · TxInput

> 한 줄 입력. **문자열과 숫자를 한 자리에서 다룬다.**

|             |                                                             |
| ----------- | ----------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                               |
| 내보내는 것 | `TxInput, TxSearchInput`                                    |
| 소스        | [`packages/ui/src/TxInput/`](../../packages/ui/src/TxInput) |
| 테스트      | 43개                                                        |

## 개발 목적

문자열과 숫자를 한 자리에서 다룬다. 값 변화 · Enter · blur 를 콜백 셋으로 갈라, 앱마다 다르게 붙이던 배선을 한 규약으로 모은다. 껍데기(`TxInputLike`)를 나눠 갖는 컴포넌트가 여럿이다.

## 기능

- `onChangeText` / `onChangeNumber` — 값이 바뀔 때마다. 숫자로 못 읽으면 `undefined`
- `onSubmitText` / `onSubmitNumber` — Enter 를 눌렀을 때
- `onBlurNumber` — 포커스가 빠질 때

`value` 를 주면 controlled, 안 주면 uncontrolled 다. 둘 다 `ref.getValue()` 로 현재 값을 읽는다.

### 쓰는 법

```tsx
<TxInput placeholder="이름" onChangeText={setName} />
<TxInput type="number" value={qty} onChangeNumber={(n) => setQty(n ?? 0)} />
<TxInput onEnter={() => search()} />
```

겉모습은 CSS 변수로 바꾼다 — 앱 전체는 `:root { --tx-color-surface: … }`,
이 컴포넌트만은 `.tx-input { --tx-input-height: … }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxInput/`
- [x] **테스트** — 43개
- [x] **스토리** — `TxInput.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

기반 4개와 달리 **Tailwind 클래스 문자열에서 CSS 로 새로 옮긴 첫 컴포넌트**다. 여기서 정해진 것들:

- **테두리·배경·포커스 링은 래퍼(`.tx-input`)가 소유하고 `<input>` 은 투명하다.**
  아이콘을 나란히 놓아도 테두리가 하나로 보여야 하기 때문이다 — `TxSearchInput` 이 그 구조를 쓴다.
- **껍데기를 함께 쓰는 컴포넌트는 `.tx-input` 클래스를 같이 건다.** `TxInputLike` 가 그렇다 (`TxDayPicker` 가 쓴다).
  폼 안에 나란히 놓았을 때 높이와 테두리가 어긋나면 안 된다.
- **`style` 은 `className` 과 같은 자리(껍데기)에 건다.** CSS 변수는 아래로만 상속되므로
  안쪽 요소에 걸면 껍데기가 읽는 토큰이 안 바뀐다 — 소비자가 `style={{ "--tx-…": … }}` 로
  값을 줘도 아무 일도 일어나지 않는다.
- **바깥 선택자로 안쪽을 덮는다.** `.tx-search-input .tx-input` 이 안쪽 껍데기를 지운다.
  원본은 `theme` prop 으로 클래스를 비웠는데 그 prop 은 폐기됐다. CSS 로 풀면 공개 API 가 늘지 않는다.

전역 토큰 두 개가 늘었다 — `--tx-color-surface`(입력 가능한 표면) · `--tx-color-border`(그 테두리).
`--tx-color-muted` 와 다르다: 그쪽은 보조 버튼처럼 바탕에 눌러앉는 자리다.

**Storybook 이 버그를 하나 잡았다.** `AlignsWithTxInput` 스토리에서 `TxSearchInput` 이 40px 이어야 할
자리에서 42px 로 나왔다 — 껍데기에 높이가 없어 내용 위에 자기 테두리가 얹혔다.
jsdom 에는 레이아웃이 없어 테스트로는 안 보인다. **사람이 보는 자리가 실제로 값을 했다.**
