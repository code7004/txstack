# 050 · TxSiteMap

> 메뉴 전체를 한 판에 펼쳐 보이는 지도. **묶음 하나가 한 열이고, 하위는 그 아래 목록이다.**

|             |                                                                                     |
| ----------- | ----------------------------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                                       |
| 내보내는 것 | `TxSiteMap` · `TxSiteMap.Group` · `TxSiteMap.Item` · `TxNavBar.SiteMap`             |
| 소스        | `packages/ui/src/TxSiteMap/` (아직 없다)                                            |
| 상태        | **API 확정.** `TxNavBar.SiteMap` 구현됨 · `TxSiteMap` 은 사용자 첫 구현 차례        |
| 짝          | 여는 자리는 [048_TxNavBar](048_TxNavBar.md) 의 맨 오른쪽 칸(`TxNavBar.SiteMap`)이다 |

## 개발 목적

black-message GNB 를 **항목별 드롭다운**(`panelWidth="item"`)으로 옮기자 위아래가 어긋나는
문제는 사라졌지만, 한 번에 **한 묶음의 하위만** 보인다. 줄이 함께 쓰는 패널(`panel` on `TxNavBar`)로
전체를 펼치면 열이 상위 항목과 따로 놓여 **어느 열이 어느 항목의 것인지 헷갈렸다** — 하위가 없는
항목은 열이 없어 한 칸씩 밀렸다.

그래서 둘을 가른다. **항목 아래에는 그 항목의 하위만**, **전체는 따로 연 지도에서.**
지도는 상위 항목과 줄을 맞추지 않으므로 어긋날 것이 없다 — 열마다 묶음 이름이 머리에 붙는다.

이미 쓸 곳이 둘이다. `apps/site` 의 `SITE_MAP`(직접 짠 20줄)과 black-message 의 GNB 다.

## 쓰는 법

### 지도만 — 어디에 놓아도 된다

```tsx
import { TxSiteMap } from "@txstack/ui";

<TxSiteMap>
  <TxSiteMap.Group label="문자관리" as={NavLink} to="/message">
    <TxSiteMap.Item label="발송파일" as={NavLink} to="/message/sendedmessagefilelist" />
    <TxSiteMap.Item label="실패파일" as={NavLink} to="/message/failedgroups" />
  </TxSiteMap.Group>
  <TxSiteMap.Group label="블랙관리" as={NavLink} to="/black" />
</TxSiteMap>;
```

페이지 한 장(`/sitemap`) · 모달 · 서랍 어디에 놓아도 같은 모양이다. **여는 일은 지도의 몫이 아니다.**

### GNB 맨 오른쪽 칸에서 연다 — `TxNavBar.SiteMap`

```tsx
<TxNavBar panelWidth="item">
  {menus.map((menu) => (
    <TxNavBar.Item key={menu.key} label={menu.meta?.label} as={NavLink} to={menu.path}>
      {menu.children && <SubMenu items={menu.children} />}
    </TxNavBar.Item>
  ))}

  {/* 늘 줄 맨 오른쪽에 선다. 기본 아이콘은 🗺️, 줄 전체 폭으로 열린다 */}
  <TxNavBar.SiteMap>
    <SiteMapOf routes={menus} />
  </TxNavBar.SiteMap>
</TxNavBar>
```

```tsx
// 아이콘 · 이름을 바꾼다
<TxNavBar.SiteMap icon={<IconGrid />} label="All menus">
  …
</TxNavBar.SiteMap>
```

### route-meta 와 잇기 — 소비자 몫

`@txstack/ui` 는 `@txstack/route-meta` 를 import 하지 않는다(의존은 `ui → hooks` 하나뿐).
`NavRoute` 를 그리는 것은 소비자가 몇 줄로 한다 — `TxNavBar` · `TxSideNav` 와 같다.

```tsx
const SiteMapOf = ({ routes }: { routes: NavRoute[] }) => (
  <TxSiteMap>
    {routes.map((group) => (
      <TxSiteMap.Group key={group.key} label={group.meta?.label ?? group.key} as={NavLink} to={group.path}>
        {group.children?.map(function item(route): ReactNode {
          return (
            <TxSiteMap.Item key={route.key} label={route.meta?.label ?? route.key} as={NavLink} to={route.path}>
              {route.children?.map(item)}
            </TxSiteMap.Item>
          );
        })}
      </TxSiteMap.Group>
    ))}
  </TxSiteMap>
);
```

## 공개 API 초안

```ts
interface TxSiteMapProps extends HTMLAttributes<HTMLDivElement> {
  /** `TxSiteMap.Group` 들. 하나가 한 열이다. */
  children?: ReactNode;
  /** 안쪽 슬롯. 바깥 겉은 `className` 이 맡는다. */
  classNames?: { group?: string; title?: string; list?: string; item?: string };
}

/** 한 열. 머리(`label`)도 링크일 수 있다 — `as` 를 주면 링크, 안 주면 글자다. */
type TxSiteMapGroupProps<E extends ElementType = "span"> = {
  as?: E;
  label: ReactNode;
  /** `TxSiteMap.Item` 들. 없으면 머리만 선다. */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "children">;

/** 목록 한 줄. 자식 `TxSiteMap.Item` 을 주면 그 아래로 한 단 들여 이어 간다. */
type TxSiteMapItemProps<E extends ElementType = "a"> = {
  as?: E;
  label: ReactNode;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, "as" | "children">;

/** `TxNavBar` 의 맨 오른쪽 칸. 누르면 지도가 줄 전체 폭으로 열린다. */
interface TxNavBarSiteMapProps {
  /** 칸에 보이는 것. 기본 `"🗺️"`. */
  icon?: ReactNode;
  /** 스크린리더가 읽을 이름. 기본 `"전체 메뉴"`. 아이콘만 보이므로 이것이 버튼의 이름이다. */
  label?: string;
  /** 펼칠 것 — 보통 `TxSiteMap`. */
  children: ReactNode;
}
```

## 정한 것 (합의됨)

| 무엇      | 제안                                                                  | 왜                                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 이름      | **`TxSiteMap`** (`TxRouteTreeMap` 아님)                               | `RouteTree` 는 route-meta 의 말이고 ui 는 route-meta 를 모른다. route-meta 를 안 쓰는 앱도 쓴다                                                                                                                    |
| 모양      | **합성 JSX** (`Group` · `Item` + `as`) — 데이터 배열이 아니다         | 이 패키지의 링크 부품(`TxNavBar` · `TxSideNav` · `TxBreadcrumb`)이 전부 이 모양이다. 배열로 받으면 링크 속성 이름(`href` · `to`)을 패키지가 정해야 한다                                                            |
| 여는 자리 | **`TxNavBar.SiteMap`** — 줄 맨 오른쪽에 저절로 선다                   | 사용자 결정. 자리를 소비자가 맞추게 하면(`margin-inline-start: auto`) 항목의 `<li>` 에 손이 닿지 않는다 — 부품이 갖는다                                                                                            |
| 아이콘    | 기본 **`🗺️`**, `icon` 으로 바꾼다                                     | 사용자 결정. `☰` 는 피한다 — `TxAppShell` 이 좁은 화면의 서랍에 이미 쓴다                                                                                                                                         |
| 패널 폭   | 줄의 `panelWidth` 와 **상관없이 늘 줄 전체 폭**                       | 전체를 펼치는 자리라 항목 폭이 뜻이 없다. 줄이 `"item"` 이어도 이 칸만 넓게 열린다                                                                                                                                 |
| 여는 방법 | **누를 때만** — 줄이 `trigger="hover"` 여도 얹어서 열지 않는다        | 줄 맨 오른쪽은 마우스가 지나가는 자리다(계정 메뉴 · 다크 토글 쪽으로 가는 길). 지나가기만 해도 화면 폭 패널이 덮이면 성가시다. 버튼이라 키보드 · 터치로도 열린다 — 줄이 함께 쓰는 패널의 "마우스 전용" 한계가 없다 |
| 지금 위치 | 지도 안의 링크는 `aria-current` 를 그대로 둔다 — 부품은 손대지 않는다 | `NavLink` 가 붙인다. 지도는 그것을 굵기로 보여 주기만 한다                                                                                                                                                         |
| 열 배치   | 가로로 나란히, 넘치면 줄바꿈(`flex-wrap`), 간격은 `--tx-site-map-gap` | 묶음 수가 앱마다 다르다. 열 수를 고정하지 않는다                                                                                                                                                                   |

## 경계

- **링크를 누르면 닫힌다** — `TxNavBar` 패널의 기존 규칙(`<a href>` 클릭, 보조키 제외)을 그대로 탄다
- **TxSiteMap 은 여닫지 않는다** — 그냥 그린다. 여는 것은 그것을 담는 쪽(`TxNavBar.SiteMap` · 모달 · 페이지)이다
- **권한 · 숨김을 거르지 않는다** — 받은 것을 그린다. route-meta 를 쓰면 `getNavRoutes` 가 이미 거른 것을 넘긴다

## 개발 항목

| 단계                                                                                                                              | 담당 |
| --------------------------------------------------------------------------------------------------------------------------------- | ---- |
| ✅ S1 — 이 문서로 공개 API 합의                                                                                                   | 🤝   |
| `TxSiteMap` · `Group` · `Item` 첫 구현                                                                                            | 🧑   |
| ✅ `TxNavBar.SiteMap` — 기존 `TxNavBar` 를 넓히는 일(맨 오른쪽 칸 · 늘 줄 폭 · 누를 때만). 테스트 11개 · 스토리 `Site Map Corner` | 🤖   |
| 테스트(동작 + CSS 계약) · 스토리                                                                                                  | 🤖   |
| `apps/site` 의 `SITE_MAP` 을 이것으로 바꾸기                                                                                      | 🤖   |
| black-message GNB 에 붙이기                                                                                                       | 🧑   |
| Storybook 확인                                                                                                                    | 🧑   |
