# 019 · TxTabs

> 탭. **머리말 한 줄과 그 아래 본문 한 칸.**

|             |                                                           |
| ----------- | --------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                             |
| 내보내는 것 | `TxTabs`                                                  |
| 소스        | [`packages/ui/src/TxTabs/`](../../packages/ui/src/TxTabs) |
| 테스트      | 29개                                                      |

## 개발 목적

탭. 원본은 `role="tablist"` 만 있고 **키보드 규약이 없었다** — 화살표 이동도, `aria-controls` 도, 선택 표시도 없이 겉모습만 탭이었다.

## 기능

```tsx
<TxTabs
  tabs={[
    { label: "정보", content: <UserInfo /> },
    { label: "기록", content: <History /> }
  ]}
/>
```

- `label` 은 `ReactNode` 다 — 배지·아이콘이 그대로 들어간다
- **`content` 를 안 주면 패널을 그리지 않는다.** 전환 스위치로만 쓸 수 있다
- `value` 를 주면 controlled, 안 주면 uncontrolled

키보드는 WAI-ARIA 탭 규약을 따른다. **탭 줄 전체가 Tab 한 번**이고, 그 안에서
←→ 로 옮기며 Home·End 로 양 끝에 간다. 화살표를 누르면 **그 자리에서 바로 전환된다.**

겉모습은 CSS 변수로 바꾼다 — `.tx-tabs { --tx-tabs-accent: … }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxTabs/`
- [x] **테스트** — 29개
- [x] **스토리** — `TxTabs.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

원본 51줄. 겉으로는 접근성이 있는 것처럼 보였지만 **탭 규약을 하나도 지키지 않았다.**

- **화살표 키로 옮길 수 없었다.** `role="tablist"` 를 달면 따라와야 하는 규약이다
- **roving tabindex 가 없었다.** 탭마다 탭 순서에 들어가서 **열 개면 Tab 을 열 번** 눌러야 지나갔다
- **`aria-selected` 가 없었다.** 어느 것이 골라졌는지 스크린리더가 몰랐다
- **패널과 이어지지 않았다.** `role="tabpanel"` 도 `aria-controls`↔`aria-labelledby` 도 없었다

지금은 넷 다 채웠다. 화살표는 **옮기는 즉시 전환**하고(WAI-ARIA 가 본문이 가벼울 때 권하는 방식),
비활성 탭은 건너뛰며, 양 끝에서 감긴다. `Home`·`End` 도 받는다.

### 항목이 요소를 갖는다

원본은 본문을 `renderBody` 로만 받았다. `tabData` 라는 prop 이 타입에 있고 JSDoc 에
"body 데이터 배열" 설명까지 붙어 있었지만 **구현이 꺼내 쓰지 않는 죽은 prop** 이었다
(`TxAgGrid` 의 `colWidths` 와 같은 종류다).

```tsx
<TxTabs
  tabs={[
    { label: "정보", content: <UserInfo /> },
    {
      label: (
        <span>
          신규 <Badge>3</Badge>
        </span>
      ),
      content: <NewList />
    },
    { label: "보관", content: <Archive />, disabled: true }
  ]}
/>
```

`renderHead` · `renderBody` 는 잘랐다. `label` 이 `ReactNode` 라 배지·아이콘이 그대로
들어가고 `content` 가 본문을 받으니 할 일이 없다. 특히 **`renderHead` 는 주는 순간
`role="tab"` 과 키보드 규약이 통째로 사라져** 접근성을 소비자에게 떠넘기고 있었다.

**`content` 를 하나도 안 주면 패널을 그리지 않는다.** 앱의 사이드바가 탭을 전환 스위치로만
쓰는데, 그 쓰임을 그대로 살렸다.

### 그 밖에 고친 것

- **controlled 인데 값을 내부 state 로 복사**하고 effect 로 맞췄다. 소비자가 `onChange` 를
  받고 값을 안 바꿔도 화면이 멋대로 넘어갔다 — `TxCheckBox`·`TxDayPicker` 와 같은 결함이다
- **`ref.changeTab()` 이 `onChange` 를 안 불렀다.** 클릭 경로와 다르게 동작해서 ref 로 바꾸면
  소비자는 바뀐 것을 몰랐다. 명령형 핸들 자체를 걷어냈다 — `value`/`onChange` 로 충분하다
- `useState(value || 0)` — `0` 이 falsy 라 우연히만 맞았다
- JSDoc 이 `tabs` 를 "문자열 배열" 이라고 적어 두었는데 실제 타입은 `ReactNode[]` 였다

### 탭 줄에 세로 스크롤이 생기고 있었다

Storybook 에서 잡혔다. **`overflow-x` 를 주면 CSS 규칙상 세로도 `auto` 가 된다.**
거기에 탭의 `margin-bottom: -1px`(밑줄을 줄의 테두리에 겹치려던 것)이 1px 을 넘겨서
탭 줄에 **세로 스크롤바**가 생겼다.

회색 밑줄을 테두리가 아니라 **안쪽 그림자**(`box-shadow: inset`)로 그려 넘침 자체를 없앴다 —
안쪽 그림자는 자식보다 아래에 칠해지므로 골라진 탭의 밑줄이 자리를 다투지 않고 그대로 덮는다.

가로 스크롤바도 감췄다. 밑줄이 1px 인데 그 자리에 스크롤바가 앉으면 굵은 회색 막대가 밑줄을
가린다. 감춰도 다루는 길은 남는다 — ←→ 로 옮기면 브라우저가 포커스를 따라 줄을 밀어 준다
(마지막 탭까지 가면 `scrollLeft` 가 실제로 움직이는 것을 확인했다).

**골라진 탭을 클래스가 아니라 `[aria-selected="true"]` 로 칠한다.** 화면에 보이는 것과
스크린리더가 듣는 것이 같은 근거에서 나와야 둘이 어긋나지 않는다. CSS 계약 테스트가 이걸 지킨다.
