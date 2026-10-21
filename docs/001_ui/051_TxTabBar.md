# 051 · TxTabBar

> 좁은 화면의 아래쪽에 붙는 탭 줄. **항목은 같은 폭으로 나눠 서고, 아이콘 위 · 글자 아래다.**

|             |                                                                  |
| ----------- | ---------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                    |
| 내보내는 것 | `TxTabBar` · `TxTabBar.Item`                                     |
| 소스        | [`packages/ui/src/TxTabBar/`](../../packages/ui/src/TxTabBar)    |
| 테스트      | 17개 (+ `TxAppShell` 의 `tabBar` 11개)                           |
| 짝          | 자리는 [044_TxAppShell](044_TxAppShell.md) 의 `tabBar` 가 갖는다 |

## 개발 목적

모바일 화면의 주 이동 줄. settlemint 홈에서 요구됐다 — `TxAppShell` 의 `bottom` 은 **본문 아래의 콘솔 · 로그 패널**이라
탭바 자리가 없었고, 앱이 짠 탭바는 셸이 이미 아는 것을 다시 정해야 했다(언제 보일지 · 본문 아래 자리 비우기 · 아이폰 홈 표시줄).
그리고 **지금 탭을 글자색으로만** 알리고 있었다 — `TxSideNav` 에서 막은 일이 다시 생겼다.

## 기능

**자리는 셸이, 항목은 이 부품이 맡는다.** 가로 메뉴가 `top` + `TxNavBar`, 세로 메뉴가 `left` + `TxSideNav` 로 갈린 것과 같은 결이다 —
셸은 슬롯에 무엇이 오는지 모르고, 부품은 자기가 어디 놓이는지 모른다.

### 쓰는 법

```tsx
import { TxAppShell, TxSideNav, TxTabBar } from "@txstack/ui";

<TxAppShell
  breakpoint={1024}
  header={<Brand />}
  left={<TxSideNav>{nav.map(toSideItem)}</TxSideNav>}
  tabBar={
    <TxTabBar>
      <TxTabBar.Item icon={<IconHome />} label="홈" as={NavLink} to="/" end />
      <TxTabBar.Item icon={<IconList />} label="정산 내역" as={NavLink} to="/settlements" />
      <TxTabBar.Item icon={<IconGift />} label="숨은 보상" badge={2} as={NavLink} to="/rewards" />
    </TxTabBar>
  }
>
  <Outlet />
</TxAppShell>;
```

| 누가          | 하는 일                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 셸의 `tabBar` | **`breakpoint` 보다 좁을 때만** 그린다 · `<nav aria-label="하단 탭">` · 화면 아래 고정 · **셸 아래에 탭바 높이만큼 자리를 비운다** · 아이폰 홈 표시줄 · 위쪽 페이드 |
| `TxTabBar`    | 항목을 같은 폭으로 나눈다 · 아이콘 칸 → 간격 → 글자 · 지금 탭(`aria-current`) · 개수(`badge`)                                                                       |

- **항목은 늘 링크다** — `as={NavLink}` · `as="a"`. 하위메뉴를 펼치는 일은 없다(그건 서랍과 `TxSideNav` 의 일이다)
- **지금 탭은 라우터의 `aria-current` 를 그대로 읽는다.** `active` prop 을 받지 않는다 — 두 곳이 어긋난다
- 셸 밖에서 혼자 쓸 때만 `label` 을 준다 — 그때 스스로 `<nav>` 가 된다. 셸의 `tabBar` 안에서는 주지 않는다(셸이 이미 `<nav>` 다)
- 아이콘은 `aria-hidden` 이고 **글자가 이름이다.** `badge` 는 이름에 함께 읽힌다(`"숨은 보상 2"`)

### 서랍은 남는다

탭바에 다 안 드는 메뉴(보통 4~5개가 한계)는 **서랍(햄버거)에 남는다.** 두 메뉴는 **같은 라우트 배열에서 뽑는다**
(`@txstack/route-meta` 의 `getNavRoutes`) — 셸이 "모바일용 메뉴를 따로 받지 않는다" 고 정한 이유(둘이 어긋난다)를 그렇게 지킨다.

### 토큰

**자리 — `TxAppShell`(`.tx-app-shell`)에서 준다**

| 토큰                                    | 기본                          | 무엇                                                            |
| --------------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `--tx-app-shell-tab-bar-height`         | `3.5rem`                      | 위 · 아래 여백을 포함한 높이. 홈 표시줄 자리는 따로 더해진다    |
| `--tx-app-shell-tab-bar-padding-top`    | `0.375rem`                    | 위 여백                                                         |
| `--tx-app-shell-tab-bar-padding-bottom` | `0.375rem`                    | 아래 여백. **여기에 `env(safe-area-inset-bottom)` 이 더해진다** |
| `--tx-app-shell-tab-bar-bg`             | `--tx-color-surface`          | 바탕                                                            |
| `--tx-app-shell-tab-bar-border-width`   | `--tx-app-shell-border-width` | 위 경계선 두께 — 헤더 선과 따로 끈다                            |
| `--tx-app-shell-tab-bar-border-color`   | `--tx-app-shell-border-color` | 위 경계선 색                                                    |
| `--tx-app-shell-tab-bar-fade`           | `0`                           | 탭바 바로 위에서 본문이 흐려지는 높이                           |
| `--tx-app-shell-tab-bar-fade-color`     | `--tx-app-shell-tab-bar-bg`   | 페이드가 닿는 색(보통 화면 바탕)                                |

**항목 — `TxTabBar`(`.tx-tab-bar`)에서 준다**

| 토큰                               | 기본                         | 무엇                                      |
| ---------------------------------- | ---------------------------- | ----------------------------------------- |
| `--tx-tab-bar-icon-size`           | `1.25rem`                    | 아이콘 칸 한 변. 아이콘은 가운데에 앉는다 |
| `--tx-tab-bar-gap`                 | `0.25rem`                    | 아이콘 칸 ↔ 글자                          |
| `--tx-tab-bar-font-size`           | `0.6875rem`                  | 글자                                      |
| `--tx-tab-bar-font-weight`         | `600`                        | 나머지 탭의 굵기                          |
| `--tx-tab-bar-color`               | 본문색 55%                   | 나머지 탭의 글자 · 아이콘(`currentColor`) |
| `--tx-tab-bar-current-color`       | `--tx-color-primary-strong`  | 지금 탭의 글자 · 아이콘                   |
| `--tx-tab-bar-current-font-weight` | `700`                        | 지금 탭의 굵기                            |
| `--tx-tab-bar-indicator-size`      | `2px`                        | 지금 탭 위쪽 막대 두께. **`0` 이면 없다** |
| `--tx-tab-bar-indicator-width`     | `1.5rem`                     | 막대 폭                                   |
| `--tx-tab-bar-indicator-color`     | `--tx-tab-bar-current-color` | 막대 색                                   |
| `--tx-tab-bar-max-width`           | `none`                       | 항목 줄의 최대 폭 — 넘으면 가운데 모인다  |
| `--tx-tab-bar-padding-inline`      | `0`                          | 항목 줄 좌우 여백                         |
| `--tx-tab-bar-badge-bg` · `-fg`    | danger · on-accent           | 개수                                      |

settlemint(Figma M1)의 값은 이렇게 맞춘다.

```css
.tx-app-shell {
  --tx-app-shell-tab-bar-height: 84px;
  --tx-app-shell-tab-bar-padding-top: 8px;
  --tx-app-shell-tab-bar-padding-bottom: 24px;
  --tx-app-shell-tab-bar-bg: #ffffff;
  --tx-app-shell-tab-bar-border-width: 1px;
  --tx-app-shell-tab-bar-border-color: #e5e7eb;
  --tx-app-shell-tab-bar-fade: 40px;
  --tx-app-shell-tab-bar-fade-color: #f9f9f9;
}

.tx-tab-bar {
  --tx-tab-bar-icon-size: 20px;
  --tx-tab-bar-gap: 4px;
  --tx-tab-bar-font-size: 11px;
  --tx-tab-bar-font-weight: 700;
  --tx-tab-bar-current-font-weight: 700;
  --tx-tab-bar-color: #9ca3af;
  --tx-tab-bar-current-color: #374151;
  --tx-tab-bar-indicator-size: 0;
  --tx-tab-bar-max-width: 390px;
  --tx-tab-bar-padding-inline: 20px;
}
```

**막대와 굵기 차이를 둘 다 끄면 지금 탭은 색으로만 보인다.** 디자인이 그렇게 정했다면 쓰되, 스크린리더에는
여전히 `aria-current` 가 알린다. 기본값은 막대 · 굵기 · 색 셋 다 쓴다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxTabBar/` · `TxAppShell` 의 `tabBar` · `labels.tabBar` · `classNames.tabBar`
- [x] **테스트** — 17개 + 셸 11개(좁을 때만 · 이름 · 자리 비우기 표시 · 서랍과 함께 · `bottom` 과 따로 · CSS 계약 넷)
- [x] **스토리** — `TxTabBar.stories.tsx`(셸 안에서 · 토큰) · `TxAppShell.stories.tsx`(하단 탭바)
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · 자리를 갖지 않음 · 같은 폭

## 정한 것

### 셸 슬롯 + 부품, 둘 다 (사용자 결정)

세 갈래를 놓고 봤다.

| 안                  | 왜 아닌가 / 왜인가                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| 셸 슬롯 `tabBar` 만 | 자리는 풀리지만 항목(지금 탭 표시 · 아이콘 배치)이 여전히 앱 몫이라 **색만으로 알리는 일이 남는다**           |
| 부품 `TxTabBar` 만  | 항목은 풀리지만 언제 보일지 · 본문 여백 · 고정 위치를 **여전히 앱이 정한다** — settlemint 가 겪은 것의 절반   |
| **둘 다** (고른 것) | 셸은 자리, 부품은 항목. 서로를 모른다. `tabBar` 에 앱이 짠 것을 넣어도 되고 `TxTabBar` 를 셸 밖에서 써도 된다 |

### 이름은 `tabBar` — 방향 이름의 예외

셸의 슬롯은 방향으로 이름을 짓는다(`top` · `left` · `bottom` …). 그런데 `bottom` 은 이미 콘솔 패널이라 방향으로는 지을 수 없다.
그래서 **하는 일**로 지었다. `BNB` 같은 약어는 [044](044_TxAppShell.md) 에서 피한 그대로다.

### 본문 자리는 셸 아래 여백으로 비운다

탭바는 `position: fixed` 라 그대로 두면 본문 맨 아래 줄을 덮는다. 셸이 탭바를 그리는 동안 루트에 `data-tab-bar` 를 붙이고
그만큼 아래 여백을 준다(`border-box` — 아니면 `min-block-size: 100dvh` 를 넘어 늘 굴러간다). 푸터도 탭바 위에서 끝난다.

### 아이폰 홈 표시줄은 아래 여백에 더한다

높이 토큰에 적으면 기기마다 값이 달라진다. `env(safe-area-inset-bottom)` 을 **아래 여백과 전체 높이에 함께** 더한다 —
소비자는 Figma 값(84 · 8 · 24)을 그대로 적는다. 홈 표시줄이 없는 기기에서는 0 이다.
(이 값이 0 이 아니려면 앱의 `<meta name="viewport">` 에 `viewport-fit=cover` 가 있어야 한다.)

### 위쪽 페이드는 토큰으로만 연다

셸이 그리되 **기본은 없다**(`0`). 탭바 위의 본문을 흐리는 것은 디자인의 선택이라 기본으로 켜면 안 원하는 화면이 끄러 와야 한다.
가상요소라 마크업이 늘지 않고, `pointer-events: none` 이라 그 아래 버튼이 눌린다. 경계선 위에서 시작해 선을 덮지 않는다.

### 경계선은 셸의 것을 기본으로 받되 따로 끈다

헤더 선은 없애고(`--tx-app-shell-border-width: 0`) 탭바 위 선만 두는 화면이 흔하다(settlemint 가 그렇다).
그래서 탭바 선은 `--tx-app-shell-tab-bar-border-width` · `-color` 로 따로 있고, 기본값만 셸의 것을 받는다.

### 서랍은 최상위 층이라 탭바를 덮는다

서랍(`TxSlidePanel`)은 모달 `<dialog>` 라 최상위 층에 뜬다. 탭바의 `z-index` 와 겨루지 않는다.
