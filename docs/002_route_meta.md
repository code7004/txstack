# 002 · `@txstack/route-meta`

**라우트를 메타데이터 트리 하나로 선언하고, 거기서 라우터·메뉴·현재위치를 전부 파생시킨다.**

`react` / `react-router-dom` 은 peerDependency 다.

**이식 완료.** 아래는 초안이 아니라 실제 공개 API 다.

## 무엇을 해결하는가

세 프로젝트 모두 라우트 정의와 GNB 메뉴 정의를 **따로** 들고 있었다.
경로를 바꾸면 두 곳을 고쳐야 하고, 한 곳을 잊으면 메뉴만 죽은 링크가 된다.
권한 필터도 라우터와 메뉴에 각각 있었다.

그래서 **트리 하나를 단일 출처(SSOT)로 두고** 나머지를 함수로 뽑는다.

```
RouteTree (단일 출처)
   ├─ buildRouteObjects   → React Router 의 RouteObject[]
   ├─ getNavigableRoutes  → GNB / 사이드 메뉴
   └─ useCurrentRouteNode → 현재 위치 · 브레드크럼
```

## 공개 API

### 정의

```tsx
import type { RouteTree } from "@txstack/route-meta";

export const routes: RouteTree = {
  dashboard: {
    path: "/dashboard",
    element: <Dashboard />,
    meta: { label: "대시보드", icon: <IconHome /> }
  },
  users: {
    path: "/users",
    element: <UserLayout />,
    meta: { label: "회원", icon: <IconUser />, permissions: ["ADMIN"] },
    children: {
      home: { index: true, element: <UserList /> }, // 기본 화면. path 를 가질 수 없다
      detail: {
        path: "/users/:id", // 절대경로로 쓴다
        element: <UserDetail />,
        meta: { label: "회원 상세", hidden: true } // 메뉴에는 안 나온다
      }
    }
  },
  legacy: {
    path: "/legacy",
    element: <Legacy />,
    enabled: false // 라우터에도 메뉴에도 없다
  }
};
```

**`RouteNode` 는 두 종류의 합집합이다.**

|            | `PathRouteNode`                                                       | `IndexRouteNode` |
| ---------- | --------------------------------------------------------------------- | ---------------- |
| `path`     | **필수**                                                              | **가질 수 없다** |
| `children` | 가능                                                                  | **가질 수 없다** |
| 나머지     | `element` · `loader` · `action` · `errorElement` · `meta` · `enabled` | 동일             |

`RouteMeta`: `label` · `icon` · `description` · `hidden` · `permissions` · `onClick`

### 실행 — 라우터

```tsx
import { buildRouteObjects } from "@txstack/route-meta";
import { useRoutes } from "react-router-dom";

function App() {
  return useRoutes(buildRouteObjects(routes));
}
```

`RouteRenderer` 는 위를 감싼 얇은 포장이다. 트리를 `useMemo` 로 잡아 준다.

```tsx
import { RouteRenderer } from "@txstack/route-meta";

<RouteRenderer data={routes} />;
```

### 내비게이션 — 메뉴

```tsx
import { getNavigableRoutes } from "@txstack/route-meta";

const menu = getNavigableRoutes(routes, (perms) => perms.some((p) => user.roles.includes(p)));
```

**권한 모델은 라이브러리가 정하지 않는다.** 단일 권한이든 다중이든 계층이든, 판정 함수를
주는 쪽이 결정한다. `canAccess` 는 **`meta.permissions` 가 있는 노드에만 호출된다** —
권한이 없는 노드는 언제나 노출된다.

판정 함수를 주지 않으면 권한이 걸린 노드는 전부 빠진다.

```tsx
const publicMenu = getNavigableRoutes(routes);
```

### 런타임 — 현재 위치

```tsx
import { useCurrentRouteNode } from "@txstack/route-meta";

const { node, meta, matches, params, pathname } = useCurrentRouteNode(routes);

document.title = meta?.label ?? "";
const crumbs = matches.map((n) => n.meta?.label).filter(Boolean); // 루트 → 현재
```

**트리는 모듈 상수로 둔다.** 그러면 `tree` 와 주소가 그대로일 때 같은 객체를 돌려주므로
`useEffect` 의존성에 그대로 넣어도 된다.

## 두 계층의 필터 규칙이 다르다

이게 이 패키지의 핵심이다.

|                    | 라우터   | 메뉴               |
| ------------------ | -------- | ------------------ |
| `enabled: false`   | 제외     | 제외               |
| `meta.hidden`      | **등록** | 제외               |
| `meta.permissions` | **등록** | `canAccess` 판정   |
| index route        | 등록     | 제외 (경로가 없다) |

`hidden` 인 라우트도 **주소로는 접근돼야 한다.** 메뉴에 안 보일 뿐이다.

## 정책

- **`PathRouteNode` 는 `path` 를 반드시 갖는다.** 절대경로를 쓴다. 경로 없는 노드가 생기면
  메뉴·브레드크럼 생성이 특수 케이스투성이가 된다.
- **`meta` 는 실행 계층 최상위로 전달되지 않는다.** 라우터는 `meta` 를 모른다.
  다만 `RouteObject.handle` 에 원본 노드가 실린다 — 라우터가 해석하지 않고 실어 나르기만 하는
  자리이고, 그 덕에 경로 매칭을 직접 구현하지 않아도 된다.

## 이식하며 고친 것

| 원본                                                  | 지금                         | 왜                                                                            |
| ----------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| `findRouteNode` 의 자체 정규식 매칭                   | `matchRoutes` 에 위임        | **라우터와 결과가 갈렸다.** 아래 설명                                         |
| index route 를 쓰지 않는다는 주석 + `index` 필드 존재 | 타입으로 갈라 지원           | 문서와 코드가 반대였다. `{ index: true, path }` 는 React Router 런타임 에러다 |
| `getNavigableRoutes(tree, permission?: string)`       | `canAccess` 판정 함수 주입   | 사용자는 권한을 여럿 가질 수 있다. 권한 모델은 앱이 정한다                    |
| 살아남은 자식을 `path` 로 다시 묶음                   | 원본 키 보존                 | `detail` 이 `/users/:id` 로 바뀌어, 키로 접근하던 코드가 조용히 깨졌다        |
| 자식이 전부 걸러지면 원본 `children` 이 그대로 남음   | `children` 을 지움           | `{ ...node }` 로 퍼뜨린 탓에 숨긴 자식이 메뉴 데이터에 다시 나타났다          |
| `hooks.ts`·`renderer.ts` 가 배럴을 import             | 모듈 직접 참조               | 순환 참조. tree-shaking 을 방해한다                                           |
| 매 렌더 전체 트리 재계산 + 새 객체 반환               | `useMemo`                    | 소비자 `useEffect` 가 무한히 도는 원인                                        |
| `RouteNode.path?: string`                             | `PathRouteNode.path: string` | "모든 노드는 path 를 명시한다" 는 정책을 타입으로 강제                        |

### 자체 정규식이 라우터와 어긋났던 이유

**① 순회 순서에 의존했다.**

```ts
for (const key in tree) {
  /* 첫 매칭을 반환 */
}
```

`/users/:id` 가 `/users/new` 보다 앞에 있으면 `/users/new` 요청이 `:id` 노드에 잡혔다.
React Router 는 specificity 로 랭킹해 `/users/new` 를 고른다 — **화면에는 등록 페이지가 뜨는데
타이틀과 브레드크럼은 "회원 상세" 가 됐다.**

**② wildcard fallback 이 무조건 걸렸다.** `for` 루프가 끝나면 그 depth 의 `*` 노드를 반환해서,
자식 탐색이 실패했을 뿐인데 엉뚱한 메타가 나왔다.

**③ 이스케이프가 `*` 까지 이스케이프했다.** `*` 가 `\*` 이 되어 wildcard 정규식이 죽어 있었다.
②의 fallback 이 필요했던 이유가 이것이다.

**해결은 매칭을 직접 하지 않는 것이다.** `buildRouteObjects` 가 `handle` 에 원본 노드를 심고,
`matchRoutes` 결과에서 되찾는다. 화면에 렌더된 라우트와 항상 같은 노드가 나온다.

## 검증

테스트 21개.

- `utils.test.ts` 13개 — **node 환경**에서 돈다. 두 함수가 DOM 없이 동작한다는 증거다.
- `hooks.test.tsx` 8개 — jsdom + `MemoryRouter`. **정적 경로를 동적 경로보다 뒤에 선언해 두고**
  `/users/new` 가 `/users/:id` 에 가로채이지 않는지 못 박았다. 원본이라면 실패하는 테스트다.

## 남은 것

- [ ] `RouteMeta.onClick` 이 여기 있는 게 맞는지. 라우트 메타에 핸들러가 섞이면 직렬화가 안 된다.
      쓰는 자리가 실제로 있는지 확인하고 판단한다.
- [ ] `getNavigableRoutes` 가 최상위는 배열, `children` 은 키 있는 트리를 준다. 형태가 섞여 있다.
      메뉴를 실제로 그려 보고 다시 본다.
