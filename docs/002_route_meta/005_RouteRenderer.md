# 005 · RouteRenderer

> `buildRouteObjects` + `useRoutes` 를 감싼 **얇은 포장**.

|             |                                                                                      |
| ----------- | ------------------------------------------------------------------------------------ |
| 진입점      | `@txstack/route-meta`                                                                |
| 내보내는 것 | `RouteRenderer`                                                                      |
| 소스        | [`packages/route-meta/src/renderer.tsx`](../../packages/route-meta/src/renderer.tsx) |
| 테스트      | 없다 — 감싸는 `buildRouteObjects` 의 테스트가 지킨다                                 |

## 개발 목적

앱의 `App.tsx` 가 하는 일이 **한 줄**이 되게 한다. 트리를 `useMemo` 로 잡아 주므로
소비자가 그것을 잊어 매 렌더 라우터를 다시 만드는 일이 없다.

## 기능

```tsx
import { RouteRenderer } from "@txstack/route-meta";

<RouteRenderer data={routes} />;
```

직접 쓰고 싶으면 [`buildRouteObjects`](002_buildRouteObjects.md) 를 그대로 부른다 —
이쪽이 하는 일은 그것뿐이다.

## 개발 항목

- [x] **구현** — `packages/route-meta/src/renderer.tsx`
- [x] **배럴을 import 하지 않는다** — 모듈을 직접 참조해 순환을 끊었다
