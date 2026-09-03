# 012 · TxCombobox

> 직접 쳐 넣으면서 후보도 고르는 입력창.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxCombobox` |
| 소스 | [`packages/ui/src/TxCombobox/`](../../packages/ui/src/TxCombobox) |
| 테스트 | 35개 |

## 개발 목적

직접 쳐 넣으면서 후보도 고르는 입력. **원본에 없던 신규**다 — 자유 입력과 목록 선택을 한 칸에서 해야 하는 자리가 반복해서 나왔다.

## 기능

```tsx
<TxCombobox data={["서울", "부산", "대구"]} value={city} onChangeText={setCity} />
```

**목록에 없는 값도 그대로 들어간다.** 그게 `TxDropdown` 과 갈리는 지점이다 —
정해진 것 중에서만 고르게 하려면 그쪽을 쓴다.

- 포커스하면 후보가 전부 뜨고, 치기 시작하면 걸러진다
- `↑↓` 로 짚고 `Enter` 로 고른다. `Esc` 로 닫아도 **친 글자는 남는다**
- `Home` · `End` 는 가로채지 않는다 — 글자 안에서 커서를 옮기는 키다
- 후보가 하나도 없으면 목록을 닫는다. 새 값을 치는 중이라는 뜻이다

목록은 화면 맨 위 층으로 뜬다. `overflow: hidden` 안에 넣어도 잘리지 않는다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxCombobox/`
- [x] **테스트** — 35개
- [x] **스토리** — `TxCombobox.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

**자유입력 + 자동완성.** 포커스하면 후보가 뜨고, 타이핑으로 걸러지고, ↑↓/Enter/Esc 로 고르되
**목록에 없는 값도 그대로 입력된다.**

`TxDropdown` 은 이걸 못 한다 — 검색·필터·자유입력이 하나도 없는 순수 select 다. 실제 공백이다.

`TxDropdown` 에서 뽑아 둔 `TxPopup` 위에 올렸다. 그래서 포털·뒤집기·바깥클릭·Escape 와
키보드 패턴(`aria-activedescendant`, 하이라이트 스크롤 추적, Tab 비가로채기)이 그대로 따라왔다.

**값은 보이는 글자 그 자체다.** `TxDropdown` 처럼 `{ name, value }` 를 받지 않는다 —
목록에 없는 글자를 쳤을 때 대응할 코드값이 없기 때문이다. 코드값이 필요하면 그건 `TxDropdown` 의 일이다.

`Home`·`End` 를 **가로채지 않는 것**이 `TxDropdown` 과 다른 점이다. 글자 안에서 커서를 옮기는
키라 목록 이동에 뺏기면 편집이 불편해진다.

후보가 하나도 없으면 목록을 닫는다. 자유입력이라 새 값을 치는 중일 뿐이고, 빈 상자를 띄울 이유가 없다.

기본은 제한 없이 전부 보여 주고 안에서 스크롤한다. `limit` 을 주면 잘라내고
**몇 개가 더 있는지 알리는 줄**이 붙는다 — 없으면 사용자는 이게 전부인 줄 안다.

앱 쪽 시제품에서 채운 것들:

- **접근성 전체** — `role="combobox"` · `aria-expanded` · `aria-controls` · `aria-activedescendant`,
  목록의 `role="listbox"`/`option`. 없으면 스크린리더에 입력창 하나로만 들린다
- **포털** — `position: absolute` 로 띄우면 `overflow: hidden` 조상에 잘린다.
  테이블 필터 안에 넣으면 바로 겪는다
- **하이라이트 스크롤 추적** — 목록에 최대 높이가 있으면 ↓ 로 보이는 영역을 벗어날 때 따라가야 한다
- **후보 개수 제한을 알리기** — 잘라서 보여 준다면 더 있다는 표시가 필요하다
- 색은 전부 토큰으로

`TxModal` 도 포털을 안 쓴다 — `legacy` 에서 `TxDropMenu`·`TxContextMenu`·`TxSlidePanel`·`TxToolTip`
은 `createPortal` 을 쓰는데 `TxDropdown`(고쳤다)과 `TxModal` 만 빠져 있었다. `TxModal` 은
3차에서 `TxPopup` 을 쓸지 함께 본다.

- [x] `TxForm.Combobox` — **만들었다.** 자유입력 칸도 캡션·에러 배선이 똑같이 필요하다.
