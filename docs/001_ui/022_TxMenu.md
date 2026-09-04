# 022 · TxMenu

> 눌러서 펼치는 메뉴와 우클릭 메뉴. **공개는 둘, 속은 하나다.**

|             |                                                           |
| ----------- | --------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                             |
| 내보내는 것 | `TxContextMenu, TxDropMenu`                               |
| 소스        | [`packages/ui/src/TxMenu/`](../../packages/ui/src/TxMenu) |
| 테스트      | 33개                                                      |

## 개발 목적

눌러서 여는 메뉴(`TxDropMenu`)와 우클릭 메뉴(`TxContextMenu`). **공개는 둘, 속은 `TxMenuShell` 하나**다 — 뜨는 자리만 다르고 항목 · 키보드 · 닫힘 규약이 같다.

## 기능

`TxDropMenu` 는 눌러서 아래로 펼쳐지고, `TxContextMenu` 는 오른쪽 클릭한 자리에 뜬다.

- **`children` 은 손대는 대상, `menu` 는 떠오르는 것이다** — `TxTooltip` 과 같은 규칙이다
- 키보드는 메뉴 규약을 따른다 — ↓ 로 열고, ↑↓ 로 옮기고, Home·End 로 양 끝,
  Escape 로 닫으면 **포커스가 트리거로 돌아온다**
- 항목의 링크는 `as` 로 갈아끼운다. 기본은 `<button>` 이고, 라우터를 주입하면 그것이 된다

### 쓰는 법

```tsx
<TxDropMenu
  menu={
    <>
      <TxDropMenu.Item onClick={changePassword}>비밀번호 변경</TxDropMenu.Item>
      <TxDropMenu.Divider />
      <TxDropMenu.Item as={NavLink} to="/settings">설정</TxDropMenu.Item>
    </>
  }
>
  👤 {username}
</TxDropMenu>

<TxContextMenu menu={<TxContextMenu.Item onClick={remove}>삭제</TxContextMenu.Item>}>
  <div className="h-40">여기서 오른쪽 클릭</div>
</TxContextMenu>
```

## 개발 항목

- [x] **구현** — `packages/ui/src/TxMenu/`
- [x] **테스트** — 33개
- [x] **스토리** — `TxMenu.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

**앞서 "서로 다른 것" 이라고 적었고 그 판단은 맞았다.** 다만 다른 것이 무엇인지 세어 보니
**둘뿐이었다** — 여는 방법(왼쪽 클릭·hover / 오른쪽 클릭)과 뜨는 자리(앵커 아래 / 마우스 좌표).
항목 그리기 · 화살표 이동 · 포커스 · 닫기는 글자 하나까지 같다.

그래서 **`TxMenuShell` 이라는 내부 부품 하나에 그 전부를 두고, 공개는 둘 그대로 둔다.**
`TxDropdownShell` 이 `TxDropdown` 과 `TxDropdownMulti` 에 하는 일과 같은 구조다.

- **하나로 합치지 않은 이유** — 소비자가 쓰는 자리는 정말로 둘이다. `<TxMenu trigger="context">`
  같은 것은 이름이 하는 일을 말해 주지 않는다. **부르는 이름으로 무엇이 뜰지 알아야 한다.**
- **둘로 두되 속을 나누지 않은 이유** — 접근성(메뉴 규약)은 한 번만 만드는 것이 옳다.
  둘로 두면 한쪽만 고쳐지고 다른 쪽은 남는다. 원본이 정확히 그랬다.
- `TxDropMenu.Item` 과 `TxContextMenu.Item` 은 **이름만 둘이고 같은 부품**이다.

### `children` 은 손대는 대상, `menu` 는 떠오르는 것

메뉴 계열의 API 를 정하면서 **`TxTooltip` 의 `tip` 과 같은 규칙으로 맞췄다.**
`children` 에는 누르거나 오른쪽 버튼을 댈 것이 오고, 뜨는 내용은 prop 으로 준다.

```tsx
<TxTooltip tip="설명">     <button>버튼</button>       </TxTooltip>
<TxDropMenu menu={<…/>}>   👤 {username}                </TxDropMenu>
<TxContextMenu menu={<…/>}><TxAgGrid … />               </TxContextMenu>
```

셋이 같은 모양이라 하나를 익히면 나머지가 따라온다. `menu` · `children` 을 컴포넌트마다
다르게 두면 소비자는 매번 문서를 다시 본다.

### 라우터 주입 — 계획대로 마지막 두 곳이었다

원본 둘은 `react-router-dom` 의 `NavLink` 를 직접 import 했다. **줄은 기본이 `<button>` 이고
링크는 `as` 로 갈아끼운다** — `as={NavLink}` · `as={Link}` · `as="a"`. peer 가 늘지 않고
Next.js·TanStack Router 소비자도 그대로 쓴다. (`TxCard` 는 링크를 아예 잘라서 주입이
필요 없어졌으므로, 3차에서 계획한 링크 주입은 이 둘로 끝났다.)

### 원본에 없던 것 — 메뉴 규약 전부

원본 둘에는 `role="menu"` 도, 화살표 이동도, 포커스 관리도 없었다. 그냥 `<div>` 가 뜨고
마우스로만 눌렀다. **키보드만 쓰는 사람에게는 없는 기능이었다.**

- 열면 첫 줄로 포커스가 들어가고, 닫으면 **트리거로 돌아온다.** 안 돌리면 포커스가 `<body>` 로
  떨어져 처음부터 Tab 을 다시 눌러야 한다
- ↑↓ 로 옮기고 양 끝에서 감긴다. Home · End 로 양 끝
- 줄은 `tabIndex={-1}` 이다. **줄마다 탭 정거장을 만들면 열 줄짜리 메뉴에 Tab 이 열 번이다**
- 메뉴 안에서 Tab 은 빠져나가는 것이 아니라 **닫는 것**이다 (메뉴 규약)
- `TxDropMenu` 는 ↓ 로도 열린다

**포커스를 옮기는 일은 `TxMenuShell` 이 갖고 `TxPopup` 은 그대로 두었다.** `TxPopup` 이 옮기면
드롭다운·콤보박스에서 타이핑이 끊긴다 — 목록형 위젯은 포커스를 앵커에 두는 것이 표준이다.

### 팝업 안에서 팝업이 열리면 서로를 "바깥" 으로 봤다

메뉴 안에 테마 드롭다운을 하나 놓자마자 드러난 결함이다. 안쪽 목록은 `document.body` 로
포털되므로 **바깥 메뉴가 보기에 자기 밖이다.** 값을 고르는 순간 메뉴가 닫혀서
그 조합을 아예 쓸 수 없었고, Escape 한 번에 둘이 함께 닫혔다.

`TxPopup` 이 **열려 있는 팝업을 순서대로 쌓아 두고**, 두 가지를 가린다.

- 바깥 클릭 — **나보다 나중에 열린 팝업 안이면 바깥이 아니다**
- Escape — **맨 위의 것만 닫는다.** 겹쳐 있으면 위에서부터 하나씩 걷힌다

원본에도 있던 결함이지만 원본 메뉴에는 애초에 그런 조합이 없어 드러나지 않았다.
`TxDropdown` · `TxCombobox` · `TxDayPicker` · `TxTooltip` 도 같은 바탕이므로 함께 고쳐졌다.

### 화살표는 항목이 아닌 컨트롤에도 닿는다

메뉴 안에 드롭다운을 놓았을 때 화살표가 그것을 건너뛰면 **키보드로는 닿을 길이 없다** —
메뉴 안에서 Tab 은 닫는 키이기 때문이다. 그래서 이동 대상에 `[role="combobox"]` 를 넣었다.

### 그 밖에 고친 것

- **`z-index` 를 각자 박아 두었다.** 쌓임 순서는 `TxPopup` 의 `--tx-popup-z` 하나가 정한다
- 두 메뉴가 각자 클래스를 갖지 않는다 — 겉모습도 `.tx-menu__*` 하나다
- hover 로 여는 메뉴도 **눌러서 열린다.** 터치에는 hover 가 없다
- 오른쪽 버튼 메뉴는 브라우저 기본 메뉴를 막는다. 안 막으면 그 위에 겹쳐 뜬다

## `TxDropMenu` — `children` 은 버튼 안의 내용이다

스토리를 브라우저에서 보다 콘솔이 잡아 준 것이다. 트리거를 감싸는 것이 이미 `<button>` 이라
`children` 에 버튼을 넣으면 **`<button>` 안의 `<button>`** 이 된다. 타입으로는 못 막으므로
prop 설명에 적었다. (스토리 하나가 그러고 있어서 함께 고쳤다.)
