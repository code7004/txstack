# 007 · getBreadcrumbs

> `useBreadcrumbs` 의 순수 함수판. **라우터 밖에서** 주소 하나로 경로 칸을 만든다.

|             |                                                                              |
| ----------- | ---------------------------------------------------------------------------- |
| 진입점      | `@txstack/route-meta`                                                        |
| 내보내는 것 | `getBreadcrumbs`                                                             |
| 소스        | [`packages/route-meta/src/utils.ts`](../../packages/route-meta/src/utils.ts) |
| 테스트      | `breadcrumbs.test.ts` (**node 환경** — 라우터 · DOM 없이 돈다)               |

## 개발 목적

`useBreadcrumbs` 는 주소를 라우터(`useLocation`)에서 읽는다. 그래서 **라우터 밖에서는 쓸 수 없었다** —

- 주소를 상태로 들고 있는 시연 · 미리보기(사이트 홈의 route 데모가 그랬다. 라우터의 내부 Context 를 바꿔 끼워야 했다 — docs/reports/2026-10-22 R7)
- 렌더 전에 탭 제목 · 로그를 만들 때, 서버에서 그릴 때
- 라우터를 띄우지 않는 테스트

**규칙은 한 곳이다.** `useBreadcrumbs` 는 이제 이 함수를 지금 주소로 부르는 얇은 포장이다.
칸이 되는 규칙(루트 빼기 · 같은 주소 합치기 · label 없는 노드 빼기)은 [006](006_useBreadcrumbs.md) 의 표 그대로다.

## 쓰는 법

```ts
import { getBreadcrumbs } from "@txstack/route-meta";

getBreadcrumbs(routes, "/user/dormant");
// → [{ key: "Users", path: "/user", label: "유저관리", meta }, { key: "DormantUsers", path: "/user/dormant", label: "휴면유저", meta }]

getBreadcrumbs(routes, "/user/dormant?page=2#top"); // 쿼리 · 조각은 보지 않는다 — 위와 같다
getBreadcrumbs(routes, "/nowhere"); // → []
```

### `basename` — 앱이 하위 경로에 있을 때

라우터에 `basename` 을 줬다면(`<BrowserRouter basename="/admin">`) **같은 값을 넘긴다.** 라우터 안의 주소(`useLocation`)는
`basename` 을 뗀 것이지만, `window.location.pathname` 은 붙은 것이다 — 그대로 넘기면 아무것도 맞지 않는다.

```ts
getBreadcrumbs(routes, window.location.pathname, "/admin"); // "/admin/user/dormant" → 유저관리 / 휴면유저
```

칸의 `path` 는 `basename` 을 뗀 라우터 안의 주소다 — `NavLink` 의 `to` 에 그대로 넣는다.

### 주소를 상태로 들고 있을 때 — 그리는 것은 같다

```tsx
const [path, setPath] = useState("/members/list");
<TxBreadcrumb items={getBreadcrumbs(tree, path)} itemAs="button" itemProps={(item) => ({ onClick: () => setPath(item.path!) })} />;
```

### 타입

```ts
export function getBreadcrumbs(tree: RouteTree, pathname: string, basename?: string): Breadcrumb[];
```

- **부를 때마다 새 배열이다.** 렌더 안에서 identity 가 필요하면 `useMemo` 로 잡거나 `useBreadcrumbs` 를 쓴다
- 트리를 라우터 형식으로 바꾸는 일은 **트리마다 한 번만** 한다(트리 객체를 키로 기억한다). 트리는 모듈 상수로 둔다

## 정한 것

- **이름은 `getNavRoutes` 와 짝이다.** 순수 함수는 `get…`, 라우터에서 주소를 읽는 것은 `use…`
- **주소는 문자열 하나다.** `Location` 객체를 받지 않는다 — 경로 칸은 `pathname` 만 보고, 문자열에 쿼리 · 조각이 붙어 와도 떼고 본다
- **`basename` 은 선택이다.** react-router 의 `matchRoutes(routes, location, basename)` 와 같은 자리 · 같은 뜻이다

## 개발 항목

- [x] **구현** — `utils.ts` 의 `getBreadcrumbs`. `hooks.ts` 의 `useBreadcrumbs` 는 이것을 `useLocation().pathname` 으로 부른다
- [x] **테스트** — node 환경. 006 의 표 · `basename` · 쿼리와 조각 · 트리 두 개를 번갈아 넘겨도 섞이지 않는지
- [x] **사이트** — 홈 route 데모가 `UNSAFE_LocationContext` 대신 이것을 쓴다
