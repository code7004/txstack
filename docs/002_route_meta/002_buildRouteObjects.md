# 002 · buildRouteObjects

> 트리를 React Router 의 `RouteObject[]` 로 바꾼다.

| | |
| --- | --- |
| 진입점 | `@txstack/route-meta` |
| 내보내는 것 | `buildRouteObjects` |
| 소스 | [`packages/route-meta/src/utils.ts`](../../packages/route-meta/src/utils.ts) |
| 테스트 | 6개 (**node 환경** — DOM 없이 돈다) |

## 개발 목적

선언한 트리를 **라우터가 먹는 모양으로** 옮긴다. 여기서 `handle` 에 원본 노드를 심어 두는
것이 뒤의 두 기능(현재 위치 · 브레드크럼)을 가능하게 한다 — 경로 매칭을 직접 짜지 않아도 된다.

## 기능

```tsx
import { buildRouteObjects } from "@txstack/route-meta";
import { useRoutes } from "react-router-dom";

function App() {
  return useRoutes(buildRouteObjects(routes));
}
```

**라우터 계층의 필터 규칙은 메뉴와 다르다.**

| | 라우터 | 메뉴 |
| --- | --- | --- |
| `enabled: false` | 제외 | 제외 |
| `meta.hidden` | **등록** | 제외 |
| `meta.permissions` | **등록** | `canAccess` 판정 |
| index route | 등록 | 제외 (경로가 없다) |

**`hidden` 인 라우트도 주소로는 접근돼야 한다.** 메뉴에 안 보일 뿐이다.
권한도 라우터는 등록만 하고, 막는 것은 앱의 가드가 한다.

## 개발 항목

- [x] **구현** — `packages/route-meta/src/utils.ts`
- [x] **테스트** — 6개. node 환경에서 도는 것이 곧 "DOM 없이 동작한다" 는 증거다
- [x] **`handle` 에 원본 노드를 싣는다** — 매칭을 라우터에 위임하는 근거

## 정한 것 · 고친 것

**배럴을 import 하지 않는다.** 원본은 `hooks.ts` · `renderer.ts` 가 배럴을 통해 서로를
참조해 순환이 생겼고 tree-shaking 을 방해했다. 모듈을 직접 참조한다.
