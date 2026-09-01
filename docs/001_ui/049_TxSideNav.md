# 049 · TxSideNav

> 세로로 서는 내비게이션. **아이콘만 남기고 접히고, 하위메뉴는 트리로 접힌다.**

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxSideNav` · `TxSideNav.Item` · `TxSideNav.Group` |
| 소스 | [`packages/ui/src/TxSideNav/`](../../packages/ui/src/TxSideNav) |
| 테스트 | 27개 |
| 짝 | 가로는 [048_TxNavBar](048_TxNavBar.md) 가 갖는다 |

## 개발 목적

`TxAppShell` 의 `left`(또는 좁을 때의 서랍)에 서는 메뉴다. 세 앱이 각자 만들 때마다
같은 자리에서 같은 것을 빠뜨렸다 — **접으면 이름이 사라져 아이콘만 남고**, 접힌 채로
하위메뉴를 누르면 아무 일도 일어나지 않고, 지금 있는 자리를 색으로만 알렸다.

**요즘은 1차 내비게이션을 세로로 두는 화면이 흔하다**(Linear · Vercel · Notion).
그래서 이 부품은 **자리(SNB)를 주장하지 않는다** — 세로라는 방향만 주장하고, 1차 메뉴를
여기에 담아도 이름이 걸리지 않는다.

## 쓰는 법

```tsx
import { TxAppShell, TxSideNav } from "@txstack/ui";

<TxSideNav collapsed={rail} onCollapsedChange={setRail}>
  <TxSideNav.Item icon={<IconChart />} label="대시보드" as={NavLink} to="/" />
  <TxSideNav.Item icon={<IconBell />} label="알림" badge={2} as={NavLink} to="/alerts" />

  <TxSideNav.Item icon={<IconCog />} label="설정">
    <TxSideNav.Item label="계정" as={NavLink} to="/settings/account" />
    <TxSideNav.Item label="권한" as={NavLink} to="/settings/roles" />
  </TxSideNav.Item>

  <TxSideNav.Group label="바로가기">
    <TxSideNav.Item icon={<IconPlus />} label="새 프로젝트" as="button" onClick={create} />
  </TxSideNav.Group>
</TxSideNav>;
```

셸 안에서는 `label` 을 주지 않는다 — `left` 에 셸이 이미 `<nav>` 를 붙인다.

```tsx
<TxAppShell header={<Brand />} left={<TxSideNav>{items}</TxSideNav>}>
  <Page />
</TxAppShell>
```

## 정한 것

### 접기는 두 가지가 있고 서로 다르다

| 무엇 | 누가 | 결과 |
| --- | --- | --- |
| 패널을 감춘다 | `TxAppShell` 의 `panels.left.collapse` | 폭 `0` — 자리가 사라진다 |
| **아이콘만 남긴다** | **이 부품의 `collapsed`** | 폭이 rail 로 줄고 **아이콘 줄이 남는다** |

**둘 중 하나만 쓴다.** 접는 길이 둘이면 소비자가 무엇을 눌러야 하는지 모른다 —
`TxLayout` 을 자를 때 세운 기준이 그것이었다.

**스위치는 그리지 않는다.** 헤더의 버튼이나 셸의 스위치가 그 자리를 이미 갖고 있어서
여기서 또 그리면 화면에 접는 것이 둘이 된다. `collapsed` 를 밖에서 받고, 안 주면
`defaultCollapsed` 로 스스로 쥔다.

#### `left` 자리가 rail 과 함께 접히게 — 셸이 내용에 맞추면 된다

rail 은 **줄의 폭**을 줄인다. 그런데 셸의 `left` 는 `--tx-app-shell-left-width`(기본 `15rem`)로
**패널의 폭**을 따로 쥐고 있어서, 그냥 두면 좁아진 줄이 넓은 패널 안에 남고 **본문이 자리를
되찾지 못한다.**

**셸이 내용에 맞춰 폭을 잡게 두면 그것으로 끝난다.**

```tsx
<TxAppShell
  left={<TxSideNav collapsed={rail} onCollapsedChange={setRail}>{items}</TxSideNav>}
  style={{ "--tx-app-shell-left-width": "fit-content" }}
/>
```

이 한 줄이면 **rail 이 줄을 줄이는 것만으로 자리가 함께 줄고**, 줄의 전이(`0.18s`)가 자리까지
같이 미끄러진다. 브라우저에서 재 보면 줄 `56px` · 자리 `57px`(테두리 1px)로 정확히 따라온다.

**숫자를 두 곳에 적지 않는다.** 처음에는 `panels={{ left: { size: rail ? 56 : 240 } }}` 로
짝지어 뒀는데, 그러면 rail 폭이 두 곳에 적혀 어긋날 자리가 생긴다.

##### 왜 셸에 rail 을 넣지 않았나 (판단)

두 갈래를 놓고 봤다.

| 안 | 왜 아닌가 |
| --- | --- |
| 셸이 rail 을 안다 (`panels.left.collapse: "rail"`) | 아이콘 줄은 **`TxSideNav` 에만 뜻이 있다.** 셸은 슬롯에 무엇이 오는지 모르는 것이 원칙이고("색과 여백은 슬롯이 정한다"), 그 모드를 넣는 순간 셸이 특정 부품을 알게 된다 |
| `TxSideNav` 가 자리째 갖는다 (테두리 · 크기 조절 · 기억까지) | 셸이 **이미 가진 것을 두 번 만든다.** `TxLayout` 을 자른 이유가 그것이었다 |

**셸은 "내용에 맞춘다" 만 알면 되고, 줄은 자기 폭만 알면 된다.** 서로를 모르는 채로 맞물린다.

줄에는 `max-inline-size: 100%` 도 두었다 — 패널이 폭을 쥐는 자리(끌어서 크기를 바꿨을 때)에서
**줄이 패널보다 넓어져 잘리지 않게** 한다.

### 접혀도 쓸 수 있어야 한다

- **글자를 지우지 않고 화면에서만 뺀다.** `display: none` 이면 스크린리더도 못 읽어
  **아이콘만 남은 줄이 통째로 이름 없는 그림**이 된다. 눈으로 보는 사람에게는 브라우저의
  풍선 도움말(`title`)이 대신 알려 준다
- **개수는 아이콘 모서리의 점으로 줄어든다.** 자리가 없어도 *알릴 것이 있다*는 사실은 보여야 한다
- **접힌 채로 하위메뉴를 누르면 줄이 먼저 펴진다.** 아이콘 줄에는 하위 목록이 설 자리가
  없다 — 아무 일도 안 일어나면 누른 사람은 고장으로 읽는다
- **묶음 제목은 화면에서 사라지고 구분선만 남는다.** 이름은 여전히 읽히므로 스크린리더에는
  묶음이 그대로 있다(`<ul aria-label>`)

### 지금 있는 자리는 라우터가 알린다

`aria-current` 를 그대로 읽는다 — `active` prop 을 또 받으면 **두 곳이 어긋난다.**
그리고 **색만으로 알리지 않는다** — 색을 못 가리는 사람에게도 자리가 보여야 하므로
짚는 막대를 함께 그린다.

### 하위메뉴는 서로를 닫지 않는다

트리를 훑는 동안 접혀 버리면 자리를 잃는다. 여럿을 함께 펴 둘 수 있고, 열림은 항목마다
자기가 쥔다 — 가로(`TxNavBar`)가 **하나만** 열리는 것과 다른 자리다. 그쪽은 큰 패널이
겹치면 안 되고, 이쪽은 목록이 자리를 차지하며 늘어나므로 겹칠 것이 없다.

### 하위 목록은 들여쓴다 (사용자 지적으로 고쳤다)

아이콘 자리만큼 밀어 **부모의 글자와 왼쪽을 맞춘다** — 눈이 계층을 그 선으로 읽는다.
선은 긋지 않는다: 깊이가 둘을 넘지 않게 두는 편이 낫다.

**처음에는 넣었는데 안 먹고 있었다.** 위쪽의 목록 초기화(`.tx-side-nav :is(…)`)가
`padding: 0` 을 갖는데 들여쓰기를 한 겹 선택자로 써서 **특이도에 밀려 조용히 지워졌다.**
선택자를 겹쳐 쓰고, 그 사실을 테스트가 지킨다(초기화보다 뒤에 오는지까지 본다).

### 접힘은 폭 하나에서 나온다

`--tx-side-nav-width` ↔ `--tx-side-nav-rail`. 마크업은 그대로고 **폭만 움직인다** —
그래서 소비자는 항목을 한 번만 선언한다. 깊이는 둘까지만 본다(하위의 하위는 선을 긋지 않는다).

## 개발 항목

- [x] S1 설계 · 합의 — 가로/세로를 가르는 결정은 [048_TxNavBar](048_TxNavBar.md) 가 갖는다
- [x] S2 구현 — `TxSideNav` + `.Item` + `.Group`
- [x] S3 테스트 — 27개. 한 칸 · 하위메뉴 · 접기 · 묶음 · 랜드마크 · CSS 계약
- [x] S4 스토리 — 펼침 · 접힘 · 밖에서 접기 · 글자만 · **With Shell**.
      [048_TxNavBar](048_TxNavBar.md) 와 같이 **항목이 `as="button"` 이라 누르면 본문이 바뀐다**
- [x] 브라우저 확인 — 짚는 막대와 배지 · 하위메뉴 펼침(부모 글자와 왼쪽이 맞는 것) ·
      rail 에서 점이 된 배지 · 접힌 채로 하위메뉴를 눌러 줄이 펴지는 것 ·
      셸 안에서 헤더의 ☰ 로 접으면 **`left` 자리가 함께 줄고** 본문이 넓어지는 것
      (줄 56px · 자리 57px 로 따라온다)
- [ ] 확인 — Storybook 에서 **사용자가** 직접 본다
- [x] `route-meta` 와의 연결 — `getNavigableRoutes` 가 `NavRoute[]` 하나로 통일되어
      **`NavRoute` 한 칸이 `TxSideNav.Item` 한 칸**이 됐다. 두 패키지는 서로를 import 하지
      않으므로 잇는 코드는 소비자 몫이고, 그 15줄은 `apps/storybook` 의 `Recipes/RouteMeta`
      이야기에 있다 ([002_route_meta/003](../002_route_meta/003_getNavigableRoutes.md))
