# 051 · TxTabBar — 모바일 하단 탭바 (제안 · 결정 대기)

> 좁은 화면의 아래쪽에 붙는 탭 줄. **아직 만들지 않았다** — 셸의 슬롯으로 둘지, 부품으로 둘지, 둘 다인지를 정해야 한다.

|        |                                                                                    |
| ------ | ---------------------------------------------------------------------------------- |
| 상태   | **제안.** 코드 없음. 사용자 결정을 기다린다                                        |
| 요구처 | settlemint 홈 (`apps/web/src/app/AppLayout.tsx` 의 `MobileTabBar`, `txstack-gap:`) |
| 관련   | [044_TxAppShell](044_TxAppShell.md) · [049_TxSideNav](049_TxSideNav.md)            |

## 왜 나왔나

`TxAppShell` 의 `bottom` 은 **본문 아래의 콘솔 · 로그 패널**이다(끌어서 크기 조절 · 접기). 모바일 하단 탭바가
아니다 — 이름을 방향으로 정할 때 `BNB` 를 피한 이유가 이것이었다([044](044_TxAppShell.md) "이름은 방향으로 간다").
그래서 settlemint 는 탭바를 앱에서 짰고, 그 과정에서 셸이 아는 것을 앱이 다시 정해야 했다.

| 앱이 다시 정한 것                   | settlemint 에서                                  | 셸은 이미 아는가                          |
| ----------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| 언제 보이나 (좁을 때만)             | Tailwind `lg:hidden` — 셸의 `breakpoint` 와 따로 | **안다** — `breakpoint` 를 JS 로 잰다     |
| 본문이 탭바에 가리지 않게 아래 여백 | 화면마다 아래 패딩                               | 본문 자리를 셸이 갖는다                   |
| 고정 위치 · 쌓임 순서 · 위쪽 페이드 | `fixed bottom-0 z-20` + 페이드 `div`             | 서랍 · 헤더의 쌓임을 셸이 정한다          |
| 아이폰 홈 표시줄 자리               | `pb-6` 로 어림                                   | 없음 (`env(safe-area-inset-bottom)`)      |
| 랜드마크 이름                       | `<nav aria-label="하단 탭">`                     | 셸이 `top` · `left` 에 붙이는 일과 같다   |
| 지금 있는 탭 표시                   | `NavLink` 의 `isActive` 로 글자색만              | `TxSideNav` 가 `aria-current` + 막대로 함 |

**색만으로 지금 탭을 알리고 있다** — `TxSideNav` 에서 막은 일이 탭바에서 다시 생긴다. 이것이 부품으로 올릴 근거다.

## 지켜야 할 기존 결정

[044](044_TxAppShell.md) 는 **"모바일용 메뉴를 따로 받지 않는다"** 고 정했다 — 둘을 받으면 어긋나고, 어긋난 쪽은 좁은 화면에서만
보여 가장 늦게 발견된다. 탭바는 그 결정과 부딪힌다: **탭바는 좁은 화면 전용 메뉴다.**

풀 길은 하나다 — **탭바의 항목도 같은 라우트 트리에서 나온다.** `@txstack/route-meta` 의 `getNavRoutes` 가 `left` 와
탭바에 같은 배열을 준다. 탭바에 다 안 들어가는 항목(보통 4~5개가 한계)은 서랍에 남는다.

## 세 갈래

### 가. 셸 슬롯 `tabBar` — 자리만 셸이 갖는다

```tsx
<TxAppShell header={<Brand />} left={<TxSideNav>{items}</TxSideNav>} tabBar={<MyTabs />}>
  <Outlet />
</TxAppShell>
```

- 셸이 하는 것: `breakpoint` 보다 좁을 때만 그린다 · 화면 아래에 붙인다 · **본문 아래에 탭바 높이만큼 자리를 비운다** ·
  `env(safe-area-inset-bottom)` · `<nav aria-label>`(기본 `"하단 탭"`) · 서랍이 열리면 서랍 아래로
- 항목은 앱이 짠다. 지금 탭 표시 · 아이콘 배치는 여전히 앱 몫이라 **색만으로 알리는 일은 그대로 남을 수 있다**
- 토큰: `--tx-app-shell-tab-bar-height` · `--tx-app-shell-tab-bar-bg`

### 나. 부품 `TxTabBar` 만 — 자리는 앱이 정한다

```tsx
<TxTabBar label="하단 탭">
  <TxTabBar.Item icon={<IconHome />} label="홈" as={NavLink} to="/" end />
  <TxTabBar.Item icon={<IconList />} label="정산 내역" as={NavLink} to="/settlements" />
  <TxTabBar.Item icon={<IconGift />} label="숨은 보상" badge={2} as={NavLink} to="/rewards" />
</TxTabBar>
```

- `TxSideNav.Item` 과 같은 모양(`icon` · `label` · `badge` · `as` 주입). 지금 탭은 라우터의 `aria-current` 를 읽고 **막대 · 굵기로도** 알린다
- 언제 보일지 · 본문 여백 · 고정 위치는 **여전히 앱이 정한다** — settlemint 가 겪은 것 중 절반이 남는다

### 다. 둘 다 — 셸은 자리, 부품은 항목 (권하는 안)

```tsx
<TxAppShell header={<Brand />} left={<TxSideNav>{nav.map(toSideItem)}</TxSideNav>} tabBar={<TxTabBar>{nav.slice(0, 4).map(toTabItem)}</TxTabBar>}>
  <Outlet />
</TxAppShell>
```

가로 메뉴가 `top` + `TxNavBar`, 세로 메뉴가 `left` + `TxSideNav` 로 갈린 것과 같은 결이다 — **셸은 슬롯에 무엇이 오는지 모르고,
부품은 자기가 어디 놓이는지 모른다.** `tabBar` 에 앱이 짠 것을 넣어도 되고, `TxTabBar` 를 셸 밖에서 써도 된다.

## 정해야 할 것

1. **가 · 나 · 다 중 어느 것인가** — 권하는 것은 다
2. 탭바가 있을 때 **헤더의 햄버거(서랍)를 남기나** — 남기면 메뉴가 둘, 없애면 탭바에 안 든 항목이 갈 곳이 없다.
   제안: 남긴다(서랍은 전체 메뉴, 탭바는 지름길)
3. 위쪽 페이드(settlemint 의 40px 그라데이션)를 셸이 그리나 — 제안: 토큰(`--tx-app-shell-tab-bar-fade`, 기본 `0`)으로만 연다
4. 슬롯 이름 — `tabBar` (방향 이름 규칙의 예외다. `bottom` 이 이미 있어 방향으로는 이름을 지을 수 없다)

**결정이 나면** S1 문서를 이 장에서 다시 쓰고, 다면 `044` 에 슬롯 절을 더한다. 그 전까지 소비자는 앱에서 짜고 `txstack-gap:` 주석을 남긴다
([013_ai_guide](../013_ai_guide.md) 5장).
