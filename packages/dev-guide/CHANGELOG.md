# @txstack/dev-guide

## 0.4.1

### Patch Changes

- README 의 제목 · 표 머리글을 영어로 맞췄다 (Getting started · What's included · Requirements · Related packages · License 등). 본문과 코드는 바뀌지 않았다. ui 는 문서 · 스토리 · 주석의 개발 용어도 함께 정리했다 (부품 → 컴포넌트, 화면 껍데기 → app shell).

## 0.4.0

### Minor Changes

- 54db2bb: `rules/terms.md` 를 더했다 — 개발 용어는 영어로 쓰고 한국어로 지어 부르지 않는다(부품 → component, 겹쳐 뜨는 것 → overlay, 화면 껍데기 → app shell). 분류 이름 · 표 머리글 같은 이름 자리는 영어, 설명은 한국어. 굳은 음역(컴포넌트 · 토큰 · 훅)과 일반 낱말은 그대로 둔다.

## 0.3.0

### Minor Changes

- bfe934e: eslint 프리셋에 import 규칙 셋을 더했다 — `import/no-duplicates` · `import/first` · `import/no-self-import` (오류). 파일 하나만 보는 규칙이라 경로 해석기가 필요 없다. `eslint-plugin-import` 를 선택 peer 로 설치한다. `node()` 에 `decorators: true` 를 주면 `consistent-type-imports` 를 끈다 — NestJS 처럼 생성자 인자의 타입을 런타임에 읽어 주입하는 서버를 위한 것이다.

## 0.2.0

### Minor Changes

- 9983a34: 설정 프리셋을 더했다 — `@txstack/dev-guide/prettier` · `/commitlint` · `/lint-staged` · `/eslint`(`base` · `react` · `node`). 도구와 플러그인은 선택 peer 라 쓰는 것만 설치한다. `jsx-a11y` recommended 를 켠다(의도된 예외는 그 줄에서 끄고 이유를 적는다). `.prettierignore` 템플릿과 커밋 훅 내용을 더했다.

## 0.1.2

### Patch Changes

- npm 의 홈페이지 링크가 문서 사이트의 Dev Guide 페이지(`https://code7004.github.io/txstack/docs/dev-guide`)로 간다. 내용은 바뀌지 않았다.

## 0.1.1

### Patch Changes

- 11737d8: README 를 다른 패키지와 같은 '습니다' 체로 다듬었다 — 무엇을 제공하고 어디에 쓰는지부터 소개하고, 적용 절차를 1~5 단계로 정리했다. 업데이트 절차에서 새 버전의 CHANGELOG 는 설치 전에 저장소에서 먼저 확인하도록 순서를 바로잡았다. 차이점 템플릿의 "따르는 판" 을 "적용 버전" 으로 바꿨다. 규칙은 바뀌지 않았다.

## 0.1.0

첫 버전. 버전 정책과 업데이트 절차는 [README](README.md) 「업데이트하기」.

- `rules/` — 실행 스크립트 이름 · 커밋 · 작업 공간 · 코드
- `process/` — docs 여섯 칸 구조 · 요구사항 → 계획 → 구현 → 검증 → 보고 · 사람과 AI 의 몫
- `templates/` — requirements · plan · verification · report · rule · docs-README · CURRENT · CLAUDE · DEV_GUIDE_DIFF
