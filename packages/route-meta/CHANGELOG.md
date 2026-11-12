# @txstack/route-meta

## 0.1.2

### Patch Changes

- README 문구를 다듬었다 — 비유 대신 기술 용어를 쓰고, 장담하던 문장을 실제 동작 설명으로 바꿨다. 코드 변경은 없다.

## 0.1.1

### Patch Changes

- README 를 다시 썼다 — 어떤 상황에서 쓰는지부터 말하고, 예제 결과는 실제 출력과 맞췄다.
  npm 의 홈페이지 링크가 문서 사이트의 패키지 API 페이지(`https://code7004.github.io/txstack/api/<패키지>`)로 간다.
  코드는 바뀌지 않았다.

## 0.1.0

### Minor Changes

- 첫 버전. 라우트를 메타데이터(아이콘 · 경로 · 권한 · 라벨)로 한 트리에 적고, 거기서 라우터 설정
  (`buildRouteObjects` · `RouteTreeRenderer`), 메뉴(`getNavRoutes`), 지금 화면(`useCurrentRoute`),
  브레드크럼(`useBreadcrumbs` · 라우터 밖에서는 `getBreadcrumbs`)을 만든다. 경로 매칭은 `react-router-dom` 의 `matchRoutes` 를 따른다.
