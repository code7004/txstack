# 002 · `@txstack/route-meta`

**라우트를 메타데이터 트리 하나로 선언하고, 거기서 라우터 · 메뉴 · 현재위치를 전부 파생시킨다.**

`react` / `react-router-dom` 은 peerDependency 다.

**이식 완료.** 각 장은 초안이 아니라 실제 공개 API 다.
저장소 전체의 상태와 다음 할 일은 [docs/README](../README.md) 가 갖는다.

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

## 개발 리스트

**5개가 끝났다. 테스트 21개.** 번호는 트리를 선언하고 쓰는 차례다.

| 번호 | 무엇 | 하는 일 | 테스트 |
| --- | --- | --- | --- |
| 001 | [`RouteTree`](001_RouteTree.md) | 트리 선언 형식 — 이 패키지의 단일 출처 | 타입 |
| 002 | [`buildRouteObjects`](002_buildRouteObjects.md) | 트리 → React Router `RouteObject[]` | 6 |
| 003 | [`getNavigableRoutes`](003_getNavigableRoutes.md) | 트리 → GNB · 사이드 메뉴 | 7 |
| 004 | [`useCurrentRouteNode`](004_useCurrentRouteNode.md) | 지금 어느 노드인가 — 타이틀 · 브레드크럼 | 8 |
| 005 | [`RouteRenderer`](005_RouteRenderer.md) | 002 를 감싼 얇은 포장 | — |

## 두 계층의 필터 규칙이 다르다

이게 이 패키지의 핵심이다.

| | 라우터 | 메뉴 |
| --- | --- | --- |
| `enabled: false` | 제외 | 제외 |
| `meta.hidden` | **등록** | 제외 |
| `meta.permissions` | **등록** | `canAccess` 판정 |
| index route | 등록 | 제외 (경로가 없다) |

`hidden` 인 라우트도 **주소로는 접근돼야 한다.** 메뉴에 안 보일 뿐이다.

## 정책

- **`PathRouteNode` 는 `path` 를 반드시 갖는다.** 절대경로를 쓴다. 경로 없는 노드가 생기면
  메뉴 · 브레드크럼 생성이 특수 케이스투성이가 된다
- **`meta` 는 실행 계층 최상위로 전달되지 않는다.** 라우터는 `meta` 를 모른다.
  다만 `RouteObject.handle` 에 원본 노드가 실린다 — 그 덕에 경로 매칭을 직접 구현하지 않아도 된다
- **권한 모델은 라이브러리가 정하지 않는다.** 판정 함수를 주입받는다

## 검증

테스트 21개.

- `utils.test.ts` 13개 — **node 환경**에서 돈다. 두 함수가 DOM 없이 동작한다는 증거다
- `hooks.test.tsx` 8개 — jsdom + `MemoryRouter`. **정적 경로를 동적 경로보다 뒤에 선언해 두고**
  `/users/new` 가 `/users/:id` 에 가로채이지 않는지 못 박았다. 원본이라면 실패하는 테스트다

## 남은 것

- [ ] `RouteMeta.onClick` 이 여기 있는 게 맞는지 — [001_RouteTree](001_RouteTree.md)
- [ ] `getNavigableRoutes` 의 반환 형태가 섞여 있다 — [003_getNavigableRoutes](003_getNavigableRoutes.md)

## 문서 규칙

- **공개 API 하나에 문서 하나.** 파일 이름은 `NNN_이름.md`, 번호는 쓰는 차례다
- **문서는 설명이 아니라 예제 코드로 쓴다.** 사용법 스니펫이 곧 API 합의서다
- **상태는 [docs/README](../README.md) 한 곳에만 쓴다**
