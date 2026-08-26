# 002 진행 보드 — @txstack/route-meta

> **공개 기능 하나가 작업 항목이다.** 규칙은 [06_COMPONENT_FLOW](../00_foundation/06_COMPONENT_FLOW.md).
> 상태 표기: 없음(미착수) · `🔄` · `✅` · `⏸` · `❌` — `S4`(스토리북)는 `ui` 가 아니므로 해당 없음

## 새 창을 여는 법

```
docs/README.md 와 docs/002_route_meta/items/01_RouteNode.md 를 읽고 002-RouteNode-S1 부터 진행해줘.
```

## 진행 순서

이 순서가 **항목 문서 파일 이름의 번호**다 — `items/01_RouteNode.md` … `05_RouteRenderer.md`.
폴더를 열면 다음에 뭘 할 차례인지 바로 보인다. **번호는 나중에 당기지 않는다** —
폐기(`❌`)된 항목의 번호도 비워 둔 채 남긴다. 당기면 이미 적힌 링크와 커밋 메시지가 다른 것을 가리킨다.

**`RouteNode`(타입 정의)를 먼저 한다.** 이 패키지의 모든 파생(라우터 설정·메뉴·런타임 매칭)이
트리 타입에서 나오므로, 타입이 흔들리면 나머지를 다시 써야 한다.

| 순서 | 항목                                                   | S1  | S2  | S3  | S5  | S6  | 코드               | 착수 전 판단                                            |
| ---- | ------------------------------------------------------ | --- | --- | --- | --- | --- | ------------------ | ------------------------------------------------------- |
| 1    | [RouteNode](items/01_RouteNode.md)                     |     |     |     |     |     | `types.ts` 57행    | `RouteMeta` 에 무엇이 들어가나 (icon·label·scope)       |
| 2    | [getNavigableRoutes](items/02_getNavigableRoutes.md)   |     |     |     |     |     | `utils.ts:65`      | **`permission` 파라미터** — 패키지가 권한을 알아도 되나 |
| 3    | [buildRouteObjects](items/03_buildRouteObjects.md)     |     |     |     |     |     | `utils.ts:21`      | react-router-dom 결합을 어댑터로 뺄 것인가              |
| 4    | [useCurrentRouteNode](items/04_useCurrentRouteNode.md) |     |     |     |     |     | `hooks.ts` 102행   | 매칭 규칙을 명세로 뽑을 수 있나                         |
| 5    | [RouteRenderer](items/05_RouteRenderer.md)             |     |     |     |     |     | `renderer.ts` 23행 | 이 컴포넌트가 필요한가 (23행)                           |

## 이 패키지의 최우선 미결

| 질문                                                                            | 어디서         |
| ------------------------------------------------------------------------------- | -------------- |
| `scope` 가 권한인가 메뉴 표시 범위인가                                          | `RouteNode` S1 |
| "코딩시 추적" 을 타입 수준에서 어디까지 보장하나                                | `RouteNode` S1 |
| 기존 정책 3개 (모든 노드 `path` 명시 · 절대경로 · index route 미사용) 유지 여부 | `RouteNode` S1 |
| 회귀 테스트가 `utils.test.ts` 1개뿐                                             | 각 항목 S3     |
