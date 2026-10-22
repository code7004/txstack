# 006 · useBreadcrumbs

> 지금 주소까지 온 길을 **칸 목록으로** 준다. 그리지는 않는다 — 그리는 것은 `TxBreadcrumb` 이다.

|             |                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| 진입점      | `@txstack/route-meta`                                                                         |
| 내보내는 것 | `useBreadcrumbs` · `Breadcrumb`                                                               |
| 소스        | [`packages/route-meta/src/hooks.ts`](../../packages/route-meta/src/hooks.ts)                  |
| 테스트      | 12개 (`breadcrumbs.test.tsx`) + `handle` 의 키 1개 (`utils.test.ts`)                          |
| 짝          | 그리는 쪽은 [001_ui/042_TxBreadcrumb](../001_ui/042_TxBreadcrumb.md) 의 `items` · `itemAs` 다 |

## 개발 목적

black-message 의 회원 목록에 `TxBreadcrumb` 을 붙이다 나왔다. 화면마다 칸을 손으로 적으면

```tsx
<TxBreadcrumb>
  <TxBreadcrumb.Item as={NavLink} to="/user">
    유저관리
  </TxBreadcrumb.Item>
  <TxBreadcrumb.Item>휴면유저</TxBreadcrumb.Item>
</TxBreadcrumb>
```

**`routeTree` 에 이미 있는 이름과 주소를 다시 쓰는 것**이라 편한 것이 없고, 경로 이름을 바꾸면 화면마다 어긋난다.
[`useCurrentRoute`](004_useCurrentRoute.md) 의 `matches` 가 이미 루트부터 지금까지의 노드를 주지만, 칸으로 쓰려면
화면마다 루트를 빼고 · 같은 주소를 합치고 · 실제 주소를 다시 만들어야 했다. **그 규칙을 여기 한 곳에 둔다.**

**그리지 않는 이유** — 의존 방향은 `ui → hooks` 하나다. route-meta 가 `TxBreadcrumb` 을 그리면 ui 를 import 해야 하고,
ui 가 트리를 받으면 route-meta 를 import 해야 한다. 그래서 **데이터는 여기서, 그리기는 ui 에서** 하고 둘 사이는
`{ key, path, label }` 모양 하나로 잇는다.

## 쓰는 법

```tsx
import { useBreadcrumbs } from "@txstack/route-meta";
import { TxBreadcrumb } from "@txstack/ui";
import { NavLink } from "react-router-dom";

const crumbs = useBreadcrumbs(routeTree);
// /user/dormant 에서
// → [{ key: "Users",        path: "/user",         label: "유저관리", meta },
//    { key: "DormantUsers", path: "/user/dormant", label: "휴면유저", meta }]

<TxBreadcrumb items={crumbs} itemAs={NavLink} />;
```

**트리는 화면마다 넘기지 않는다.** 지금 위치는 주소가 정한다 — 트리 전체를 앱에서 한 번 감싸 두면 화면은 prop 이 없다.

```tsx
// 앱 — apps/frontend/src/components/PageBreadcrumb.tsx
export function PageBreadcrumb() {
  return <TxBreadcrumb items={useBreadcrumbs(routeTree)} itemAs={NavLink} />;
}

// 화면 — 어디서든
<PageBreadcrumb />;
```

### 루트를 빼는 법 — `meta.breadcrumb: false`

레이아웃만 맡는 노드(셸 · 로그인 뒤의 `/`)는 모든 경로의 맨 앞에 붙는다. **그 노드에 `breadcrumb: false` 를 준다.**
그 칸만 빠지고 아래 칸은 그대로 나온다.

```tsx
export const routeTree = {
  Contents: {
    path: "/",
    element: <AppShell />,
    meta: { label: "Contents", hidden: true, breadcrumb: false }, // ← 경로에 안 나온다
    children: {
      Users: { path: "/user", meta: { label: "유저관리" }, children: { … } }
    }
  }
} satisfies RouteTree;
```

**`hidden` 으로 빼지 않는 이유** — `hidden` 은 "메뉴에 안 보인다" 다. `MessageGroupDetail`(발송상세)처럼 메뉴에는
없지만 경로에는 나와야 하는 화면이 있다. 두 뜻을 한 필드에 겹치면 둘 중 하나가 틀린다. 그래서 **`hidden` 은 경로에 영향이 없다.**

**자동으로 빼지 않는 이유** — `path: "/"` 를 무조건 빼면 "홈 / 주문 / 8213" 처럼 홈을 첫 칸으로 두는 앱이 못 쓴다.
라이브러리가 어느 것이 루트인지 추측하지 않는다.

### 칸이 되는 규칙

| 노드                                            | 칸                                                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| `meta.breadcrumb: false`                        | **빠진다.** 아래 칸은 남는다                                            |
| `meta.label` 이 없다                            | **빠진다.** `key` 는 식별자라 화면에 내지 않는다                        |
| 바로 앞 칸과 **주소가 같다** (index route 포함) | **하나로 합친다 — 앞 칸을 남긴다** (아래 「정한 것」)                   |
| `meta.hidden`                                   | 영향 없음 — 나온다                                                      |
| `meta.permissions`                              | 영향 없음 — 이미 그 화면에 들어와 있다                                  |
| 동적 경로 `/users/:id`                          | `path` 는 **실제 주소**(`/users/8213`)다. `label` 은 트리의 글자 그대로 |
| 매칭이 없다 (404)                               | 빈 배열                                                                 |

black-message 트리(`Contents` 에 `breadcrumb: false`)에서 나오는 것:

| 주소                          | 매칭 사슬                                       | 칸                  |
| ----------------------------- | ----------------------------------------------- | ------------------- |
| `/user/dormant`               | Contents · Users · DormantUsers                 | 유저관리 / 휴면유저 |
| `/user`                       | Contents · Users · UsersIndex(`/user`)          | 유저관리            |
| `/dashboard`                  | Contents · Dashboard · DashboardIndex(index)    | 대시보드            |
| `/message/messagegroupdetail` | Contents · Message · MessageGroupDetail(hidden) | 문자관리 / 발송상세 |
| `/black`                      | Contents · BlackUsers                           | 블랙관리            |

### 칸의 글자를 바꿀 때 — 받은 배열을 고친다

"회원 상세" 대신 회원 이름을 보이고 싶으면 **받은 배열을 고쳐서 넘긴다.** 훅에 옵션을 두지 않는다 —
이름은 데이터를 불러온 화면만 안다.

```tsx
const crumbs = useBreadcrumbs(routeTree).map((crumb) => (crumb.key === "UserDetail" ? { ...crumb, label: user.name } : crumb));
```

### 타입

```ts
export interface Breadcrumb {
  /** 트리에 쓴 키. `React` 의 `key` 로도 쓴다. */
  key: string;
  /** 실제 주소. 동적 세그먼트가 채워져 있다(`/users/8213`). */
  path: string;
  /** `meta.label`. 이것이 없는 노드는 칸이 되지 않는다. */
  label: ReactNode;
  meta?: RouteMeta;
}

export function useBreadcrumbs(tree: RouteTree): Breadcrumb[];

// RouteMeta 에 하나 더한다
interface RouteMeta {
  /** `false` 면 경로(브레드크럼)에 칸으로 나오지 않는다. 아래 칸은 그대로다. 기본 `true`. */
  breadcrumb?: boolean;
}
```

**반환값 identity** — [`useCurrentRoute`](004_useCurrentRoute.md) 와 같다. `tree` 와 주소가 그대로면 같은 배열이다.

## 정한 것

### 같은 주소가 겹치면 앞 칸을 남긴다 (2026-10-22 합의)

`/user` 에서 `Users`(유저관리)와 `UsersIndex`(활성유저)가 둘 다 `/user` 다. **"유저관리" 하나가 된다.**
index 는 부모의 기본 화면이라 부모 이름이 그 자리 이름이다. 다른 두 길은 버렸다.

- 뒤 칸("활성유저") — 지금 화면 이름은 맞지만 어느 메뉴 아래인지 사라진다
- 둘 다("유저관리 / 활성유저") — 앞 칸 링크가 지금 화면을 다시 가리킨다. 지금 자리를 다시 누르게 두지 않는다는
  `TxBreadcrumb` 의 규칙과 어긋난다

**"같은 주소" 는 끝 `/` 를 떼고 비교한다.** `matchRoutes` 는 index · 부모와 같은 경로의 자식에 `/user/` 를 준다.
칸의 `path` 에도 끝 `/` 가 없다.

### 키는 `handle` 에 함께 싣는다

노드 객체에는 키가 없다(키는 부모 객체의 속성 이름이다). [`buildRouteObjects`](002_buildRouteObjects.md) 가
`handle` 에 노드와 함께 키를 심는다 — `RouteHandle.key`.

## 개발 항목

- [x] **S1 합의** — 이 문서 (2026-10-22)
- [x] **구현** — `hooks.ts` 의 `useBreadcrumbs`, `types.ts` 의 `Breadcrumb` · `RouteMeta.breadcrumb` · `RouteHandle.key`
- [x] **테스트** — 12개. black-message 모양의 트리로 위 다섯 주소를 그대로 못 박았다. 끝 `/` · 루트를 빼지 않은 트리 · identity 포함
- [x] **문서** — [001_RouteTree](001_RouteTree.md) 의 `RouteMeta`, [000_README](000_README.md) 의 그림
- [x] **Storybook** — `Recipes/RouteMeta` 의 경로 줄이 `TxBreadcrumb items={useBreadcrumbs(routes)}` 다
