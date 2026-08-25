# 03 코드 컨벤션

> **언제 확인하는가**: 새 컴포넌트·훅·모듈을 만들 때, 파일·심볼 이름을 정할 때, 커밋할 때.

여기 있는 것은 **모든 패키지에 공통**인 것뿐이다.
`Tx*` 컴포넌트의 props·콜백 이름 같은 패키지별 규약은 `001_ui/20_design.md` 에서 정한다.

## 1. 언어와 표기

- **코드 · 식별자 · 공개 API 이름 · 커밋 제목의 타입은 영어.**
- **문서 · 주석 · 커밋 본문은 한글.** 설명은 읽는 사람 기준으로 쓴다.
- 주석은 **왜** 를 적는다. 무엇을 하는지는 코드가 말한다.

## 2. 파일·폴더

| 대상             | 규칙                          | 예                          |
| ---------------- | ----------------------------- | --------------------------- |
| 컴포넌트 폴더    | `PascalCase`                  | `packages/ui/src/TxButton/` |
| 컴포넌트 구현    | `<Name>.tsx`                  | `TxButton.tsx`              |
| 타입 전용        | `<Name>.types.ts`             | `TxButton.types.ts`         |
| 스타일/테마 상수 | `<Name>.theme.ts`             | `TxButton.theme.ts`         |
| 스토리           | `<Name>.stories.tsx`          | `TxButton.stories.tsx`      |
| 테스트           | `<대상>.test.ts(x)`           | `tx-ui.utils.test.ts`       |
| 훅               | `camelCase`, `use` 접두       | `useUrlQuery.ts`            |
| 폴더 배럴        | `index.ts` (또는 `index.tsx`) | `TxButton/index.tsx`        |

**배럴은 재수출만 한다.** `index.ts` 에 구현을 넣지 않는다. 무엇이 공개 API 인지 한눈에 보여야 한다.

## 3. 심볼

- 컴포넌트: `PascalCase`. `@txstack/ui` 의 공개 컴포넌트는 **`Tx` 접두사**를 붙인다.
- 훅: `use` + `PascalCase`.
- 타입·인터페이스: `PascalCase`. 접두사 `I` 를 붙이지 않는다.
- props 타입: `<컴포넌트명>Props`.

> **`I` 접두 금지는 2026-08-25 에 재확인된 결정이다** (`001-TxSpinner-S1` Q1).
> 현재 코드에는 `ITx*` 가 53개 남아 있다 — **규약이 맞고 코드가 틀린 상태**다.
> 컴포넌트별 S2 에서 하나씩 고치지 않고 **일괄 리네임 job `001-typenames` 1커밋**으로 정리한다.
> 그때까지 **새로 쓰는 코드는 무조건 `I` 없는 쪽**이다. 근거와 버린 대안: [001_ui/components/TxSpinner.md §5 Q1](../001_ui/components/TxSpinner.md#q1--i-접두-폐지)

- 상수: `UPPER_SNAKE_CASE`. 단, 객체 맵은 `camelCase` 도 허용.
- **불리언은 긍정형**으로. `disabled` (O) / `notEnabled` (X).

## 4. 공개 API 를 만들 때

- **export 하는 모든 것에 의도가 있어야 한다.** "혹시 필요할까봐" 로 export 하지 않는다.
  한 번 내보내면 지우는 게 major 다 → [05_RELEASE.md](05_RELEASE.md)
- 내부 전용은 배럴에서 내보내지 않는다.
- 공개 타입은 **패키지가 직접 정의해서 export** 한다. 앱 전역 타입에 기대지 않는다.
- 옵션 객체를 받는 함수는 **필수 인자를 앞에, 옵션 객체를 뒤에** 둔다.

## 5. 린트·포맷

- **ESLint / Prettier 설정은 루트가 소유한다.** 패키지별 설정을 추가하지 않는다.
- 커밋 시 `lint-staged` 가 `eslint --fix` + `prettier --write` 를 돌린다.
- 린트 규칙을 끄고 싶으면 그 줄에 `eslint-disable` 을 붙이는 대신, **왜 필요한지 먼저 따진다.**
  꼭 필요하면 사유 주석을 함께 남긴다.

## 6. 커밋

**Conventional Commits + 한글.** `commitlint` + `husky` 가 검사한다.

```
feat: TxDropdown 다중선택 지원
fix: useUrlQuery 가 빈 배열을 undefined 로 지우지 않게
docs: 001 요구사항 수용 기준 확정
refactor: TxInput 테마 상수를 theme.ts 로 분리
test: route-meta buildRouteObjects 회귀 테스트 추가
chore: tsup 설정 정리
```

- 타입은 영어, 제목 본문은 한글.
- **한 커밋은 한 가지 일**만 한다. job 단위와 대체로 일치한다.
- 관련 없는 diff 를 함께 커밋하지 않는다.
- **커밋·푸시는 사용자가 명시적으로 요청할 때만.**

## 7. 건드리지 않는 것

- 기존 사용자 변경사항을 되돌리지 않는다. 관련 없는 diff 는 손대지 않는다.
- 패키지 매니저는 **pnpm 만.** npm/yarn lockfile 을 만들지 않는다.
