# @txstack/hooks

## 0.1.0

### Minor Changes

- 첫 버전. 범용 React 훅 둘 — `useObjectState`(객체 상태를 일부 필드만 병합해 고친다)와
  `useUrlQuery`(URL 쿼리스트링을 화면 상태처럼 쓴다. 새로고침 · 공유 · 즐겨찾기가 그대로 복원된다).
  훅마다 진입점이 하나다(`@txstack/hooks/useObjectState` · `@txstack/hooks/useUrlQuery`).
  `react-router-dom` 은 `useUrlQuery` 를 쓸 때만 필요하다.
