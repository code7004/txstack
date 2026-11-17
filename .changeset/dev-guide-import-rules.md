---
"@txstack/dev-guide": minor
---

eslint 프리셋에 import 규칙 셋을 더했다 — `import/no-duplicates` · `import/first` · `import/no-self-import` (오류). 파일 하나만 보는 규칙이라 경로 해석기가 필요 없다. `eslint-plugin-import` 를 선택 peer 로 설치한다. `node()` 에 `decorators: true` 를 주면 `consistent-type-imports` 를 끈다 — NestJS 처럼 생성자 인자의 타입을 런타임에 읽어 주입하는 서버를 위한 것이다.
