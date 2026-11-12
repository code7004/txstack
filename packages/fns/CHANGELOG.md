# @txstack/fns

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

- 첫 버전. 세 서비스가 복사해 쓰던 `extensions.ts` · `util.ts` 에서 범용 함수만 꺼냈다.
  루트(`@txstack/fns`)에서 전부 가져오고, 그룹 진입점 13개(`num` · `date` · `rand` · `str` · `obj` · `arr` · `form` ·
  `async` · `math` · `phone-kr` · `browser/cookie` · `browser/css` · `browser/file`)도 둔다.
  함수 이름은 패키지 안에서 겹치지 않는다. React 와 런타임 의존이 없다.
