# @txstack/hooks

## 0.1.1

### Patch Changes

- `useObjectState` · `useUrlQuery` 의 JSDoc 예제를 고쳤다. "검색어가 있으면 `page: 1`" 처럼 적으면 검색어가 있는 동안
  페이지를 넘길 수 없다. `postParse` 는 무엇이 바뀌었는지 모르기 때문이다. 예제를 언제나 지킬 규칙(날짜 범위 · 페이지 크기 한도)으로 바꾸고,
  함께 바뀌는 필드는 `{ keyword, page: 1 }` 처럼 한 번에 넘기라고 적었다. 동작은 그대로다.
- README 를 다시 썼다 — 어떤 상황에서 쓰는지부터 말하고, 예제 결과는 실제 출력과 맞췄다.
  npm 의 홈페이지 링크가 문서 사이트의 패키지 API 페이지(`https://code7004.github.io/txstack/api/<패키지>`)로 간다.
  코드는 바뀌지 않았다.

## 0.1.0

### Minor Changes

- 첫 버전. 범용 React 훅 둘 — `useObjectState`(객체 상태를 일부 필드만 병합해 고친다)와
  `useUrlQuery`(URL 쿼리스트링을 화면 상태처럼 쓴다. 새로고침 · 공유 · 즐겨찾기가 그대로 복원된다).
  훅마다 진입점이 하나다(`@txstack/hooks/useObjectState` · `@txstack/hooks/useUrlQuery`).
  `react-router-dom` 은 `useUrlQuery` 를 쓸 때만 필요하다.
