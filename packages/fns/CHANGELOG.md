# @txstack/fns

## 0.1.0

### Minor Changes

- 첫 버전. 세 서비스가 복사해 쓰던 `extensions.ts` · `util.ts` 에서 범용 함수만 꺼냈다.
  루트(`@txstack/fns`)에서 전부 가져오고, 그룹 진입점 13개(`num` · `date` · `rand` · `str` · `obj` · `arr` · `form` ·
  `async` · `math` · `phone-kr` · `browser/cookie` · `browser/css` · `browser/file`)도 둔다.
  함수 이름은 패키지 안에서 겹치지 않는다. React 와 런타임 의존이 없다.
