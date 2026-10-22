---
"@txstack/route-meta": minor
"@txstack/ui": minor
---

브레드크럼을 라우트 트리에서 만든다 — 화면마다 칸을 손으로 적지 않는다.

- `@txstack/route-meta` `useBreadcrumbs(tree)` — 지금 주소까지의 칸 목록(`{ key, path, label, meta }[]`)을 준다. `path` 는 실제 주소(`/users/8213`)다. 바로 앞 칸과 주소가 같으면(기본 화면 · index) 앞 칸만 남는다. `label` 이 없는 노드는 빠지고, `hidden` · `permissions` 는 보지 않는다
- `@txstack/route-meta` `RouteMeta.breadcrumb` — `false` 면 그 노드만 경로에서 빠진다(아래 칸은 남는다). 레이아웃만 맡는 루트(`/` 의 셸)에 준다
- `@txstack/route-meta` `RouteHandle.key` — `buildRouteObjects` 가 `handle` 에 트리 키도 싣는다
- `@txstack/ui` `TxBreadcrumb` `items` · `itemAs` · `itemProps` — 칸을 목록으로 넘긴다. 손으로 적은 것과 같이 그린다(마지막 칸은 글자 · 접기 · 가름표). `path` 가 없는 칸은 글자다. `itemAs` 기본은 `"a"`(`href`), 컴포넌트면 `to` 로 건다. `children` 과 함께 줄 수 없다

```tsx
<TxBreadcrumb items={useBreadcrumbs(routeTree)} itemAs={NavLink} />
```
