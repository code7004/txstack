# 003 · getNavigableRoutes

> 같은 트리에서 **GNB · 사이드 메뉴**를 뽑는다.

|             |                                                                              |
| ----------- | ---------------------------------------------------------------------------- |
| 진입점      | `@txstack/route-meta`                                                        |
| 내보내는 것 | `getNavigableRoutes` · `CanAccess` · `NavRoute`                              |
| 소스        | [`packages/route-meta/src/utils.ts`](../../packages/route-meta/src/utils.ts) |
| 테스트      | 11개 (**node 환경**)                                                         |

## 개발 목적

메뉴를 따로 선언하지 않는다. 경로를 바꿔도 **고칠 곳이 한 곳**이고, 메뉴만 죽은 링크가
되는 일이 없다.

## 기능

```tsx
import { getNavigableRoutes } from "@txstack/route-meta";

const menu = getNavigableRoutes(routes, (perms) => perms.some((p) => user.roles.includes(p)));
```

**돌아오는 것은 `NavRoute[]` 다.** 위아래가 같은 형태라 재귀가 한 갈래다.

```tsx
interface NavRoute {
  key: string; // 트리에 쓴 키 그대로
  path: string; // index route 는 메뉴에 안 오르므로 언제나 있다
  meta?: RouteMeta;
  children?: NavRoute[]; // 살아남은 자식이 없으면 필드가 없다
}
```

그래서 메뉴를 그리는 쪽이 이렇게 짧다.

```tsx
const item = (n: NavRoute) => (
  <TxSideNav.Item key={n.key} icon={n.meta?.icon} label={n.meta?.label ?? n.key} as={NavLink} to={n.path}>
    {n.children?.map(item)}
  </TxSideNav.Item>
);

<TxSideNav>{menu.map(item)}</TxSideNav>;
```

**`RouteNode` 를 그대로 흘리지 않는다.** 메뉴를 그리는 자리에 `element` · `loader` 같은
실행 계층이 섞여 들어올 이유가 없다. 순서는 **트리에 쓴 순서**를 지킨다.

**권한 모델은 라이브러리가 정하지 않는다.** 단일 권한이든 다중이든 계층이든, 판정 함수를
주는 쪽이 결정한다. `canAccess` 는 **`meta.permissions` 가 있는 노드에만 호출된다** —
권한이 없는 노드는 언제나 노출된다.

판정 함수를 주지 않으면 권한이 걸린 노드는 전부 빠진다.

```tsx
const publicMenu = getNavigableRoutes(routes);
```

빠지는 것은 셋이다 — `enabled: false` · `meta.hidden` · index route(경로가 없다).
라우터 쪽 규칙과의 차이는 [002_buildRouteObjects](002_buildRouteObjects.md) 의 표를 본다.

## 개발 항목

- [x] **구현** — `packages/route-meta/src/utils.ts`
- [x] **테스트** — 11개
- [x] **형태를 하나로 통일했다** — `NavRoute[]`. 최상위는 키를 버린 배열, `children` 은
      키 있는 객체였다. 메뉴를 실제로 그려 보니 재귀가 두 형태를 다뤄야 했다

## 정한 것 · 고친 것

| 원본                                                | 지금                            | 왜                                                                                                                                 |
| --------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `getNavigableRoutes(tree, permission?: string)`     | `canAccess` 판정 함수 주입      | 사용자는 권한을 여럿 가질 수 있다. 권한 모델은 앱이 정한다                                                                         |
| 살아남은 자식을 `path` 로 다시 묶음                 | 원본 키 보존                    | `detail` 이 `/users/:id` 로 바뀌어, 키로 접근하던 코드가 조용히 깨졌다                                                             |
| 자식이 전부 걸러지면 원본 `children` 이 그대로 남음 | `children` 을 달지 않음         | `{ ...node }` 로 퍼뜨린 탓에 **숨긴 자식이 메뉴 데이터에 다시 나타났다.** 빈 배열도 주지 않는다 — 있으면 "펼치는 항목" 으로 보인다 |
| `RouteNode[]` 를 그대로 반환 (자식은 키 있는 객체)  | `NavRoute[]` — 위아래 같은 형태 | 재귀가 두 형태를 다뤄야 했고, 메뉴 데이터에 `element` · `loader` 가 섞여 있었다                                                    |
