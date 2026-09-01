# 004 · useCurrentRouteNode

> 지금 어느 노드에 있는지 — 타이틀 · 브레드크럼이 여기서 나온다.

| | |
| --- | --- |
| 진입점 | `@txstack/route-meta` |
| 내보내는 것 | `useCurrentRouteNode` · `CurrentRoute` |
| 소스 | [`packages/route-meta/src/hooks.ts`](../../packages/route-meta/src/hooks.ts) |
| 테스트 | 8개 (jsdom + `MemoryRouter`) |

## 개발 목적

화면 제목 · 브레드크럼 · "지금 이 메뉴" 표시를 **주소에서 파생**시킨다. 화면마다 제목을
손으로 적으면 경로가 바뀔 때 어긋난다.

## 기능

```tsx
import { useCurrentRouteNode } from "@txstack/route-meta";

const { node, meta, matches, params, pathname } = useCurrentRouteNode(routes);

document.title = meta?.label ?? "";
const crumbs = matches.map((n) => n.meta?.label).filter(Boolean); // 루트 → 현재
```

**트리는 모듈 상수로 둔다.** 그러면 `tree` 와 주소가 그대로일 때 같은 객체를 돌려주므로
`useEffect` 의존성에 그대로 넣어도 된다.

## 개발 항목

- [x] **구현** — `packages/route-meta/src/hooks.ts`
- [x] **테스트** — 8개. **정적 경로를 동적 경로보다 뒤에 선언해 두고** `/users/new` 가
      `/users/:id` 에 가로채이지 않는지 못 박았다. 원본이라면 실패하는 테스트다
- [x] **매칭을 직접 하지 않는다** — `matchRoutes` 에 위임한다

## 정한 것 · 고친 것

### 자체 정규식이 라우터와 어긋났던 이유

원본은 `findRouteNode` 가 경로 매칭을 **자체 정규식으로** 했다. 세 가지가 어긋났다.

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

**해결은 매칭을 직접 하지 않는 것이다.** [`buildRouteObjects`](002_buildRouteObjects.md) 가
`handle` 에 원본 노드를 심고, `matchRoutes` 결과에서 되찾는다. **화면에 렌더된 라우트와
항상 같은 노드가 나온다.**

### 매 렌더 재계산하지 않는다

원본은 렌더마다 전체 트리를 다시 훑고 새 객체를 반환했다 — 소비자 `useEffect` 가 무한히
도는 원인이었다. `useMemo` 로 잡는다.
