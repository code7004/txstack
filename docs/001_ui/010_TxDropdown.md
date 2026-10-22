# 010 · TxDropdown

> 하나를 고르는 드롭다운.

|             |                                                                   |
| ----------- | ----------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                     |
| 내보내는 것 | `TxDropdown, TxDropdownMulti`                                     |
| 소스        | [`packages/ui/src/TxDropdown/`](../../packages/ui/src/TxDropdown) |
| 테스트      | 41개                                                              |

## 개발 목적

하나(또는 여럿)를 고르는 목록. 원본이 키보드 트랩이었고 팝업 위치를 자체 계산했다 — 규약을 갖춘 것으로 재작성했고, 그 과정에서 `TxPopup` 이 떨어져 나왔다.

## 기능

```tsx
<TxDropdown data={["서울", "부산", "대구"]} onChangeText={setCity} />
<TxDropdown data={[1, 2, 3]} value={qty} onChangeNumber={setQty} />
```

`data` 는 원시값 배열이나 `{ name, value }` 배열을 받는다. **값의 타입이 `data` 에서 추론되어**
숫자 배열을 주면 `onChangeNumber` 가 숫자를 준다 — 세터를 그대로 꽂아도 된다.

`value` 를 주면 controlled 다. **`value={undefined}` 도 값으로 친다** — prop 자체를 생략한 것과
다르게, 값이 `undefined` 인 항목이 골라진 것으로 본다.

목록은 화면 맨 위 층으로 띄운다. `overflow: hidden` 안에 넣어도 잘리지 않고,
아래가 좁으면 위로 뒤집는다.

겉모습은 CSS 변수로 바꾼다 — `.tx-dropdown { --tx-dropdown-height: … }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxDropdown/`
- [x] **테스트** — 44개
- [x] **스토리** — `TxDropdown.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### 머리는 고른 줄을 목록에 보이던 그대로 보인다 (2026-10-22)

`locale` 은 목록의 이름을 번역하는데, **고른 뒤 머리에는 원문(키)이 나왔다** — usertics 적용 준비에서 드러났다
(`locale={$t}` 33곳). 이제 고른 줄의 이름은 머리에서도 `locale` 을 거친다.
`placeholder` · `fixedHead` 는 소비자가 직접 준 글자라 **다시 번역하지 않는다** — `TxDropdownMulti` 와 같은 규칙이다.
번역할 글자라면 넘기기 전에 번역해 넘긴다(`placeholder={$t("지역")}`).

원본 848줄에서 결함이 가장 많이 나왔다.

**키보드 트랩이었다.** `Tab` 을 가로채 다음 항목으로 이동시켜서 **열린 드롭다운에서 빠져나갈 수
없었다.** 각 줄에 `tabIndex={0}` 이 붙어 줄이 100개면 탭 순서에 100개가 들어갔고,
`aria-activedescendant` 가 없어 스크린리더는 어느 줄이 활성인지 몰랐다.

**200ms 디바운스가 모든 클릭에 걸려 있었다.** 주석은 "정렬 헤더 연속 클릭 방지" 인데
열기·항목선택·전체선택 전부에 적용돼서, **다중 선택에서 빠르게 두 개를 고르면 두 번째가 무시됐다.**

**목록이 잘렸다.** `position: absolute` + `z-20` 이라 `overflow: hidden` 조상 안에서 잘리고,
화면 아래쪽에서 열면 밖으로 나갔다.
