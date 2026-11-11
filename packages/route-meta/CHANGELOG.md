# @txstack/route-meta

## 0.1.0

### Minor Changes

- 첫 버전. 라우트를 메타데이터(아이콘 · 경로 · 권한 · 라벨)로 한 트리에 적고, 거기서 라우터 설정
  (`buildRouteObjects` · `RouteTreeRenderer`), 메뉴(`getNavRoutes`), 지금 화면(`useCurrentRoute`),
  브레드크럼(`useBreadcrumbs` · 라우터 밖에서는 `getBreadcrumbs`)을 만든다. 경로 매칭은 `react-router-dom` 의 `matchRoutes` 를 따른다.
