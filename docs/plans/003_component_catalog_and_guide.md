# 003. 컴포넌트 카탈로그 · 가이드 · 예제 — 작업 계획

- 관련 요구사항: [003 요구사항](../requirements/003_component_catalog_and_guide.md)
- 착수일: 2026-08-19
- 상태: P1 완료 / P2 대기
- 검증: [003 검증](../verification/003_component_catalog_and_guide.md)

## Phase

| ID  | 내용                                    | 수용 기준 | 상태    |
| --- | --------------------------------------- | --------- | ------- |
| P0  | Storybook 10 구성 + 예시 스토리 1종     | R1·R3     | ✅ 완료 |
| P1  | 스토리 형식 확정 → `Tx*` 27종으로 확장  | R1·R2·R4  | ✅ 완료 |
| P2  | 가이드 화면 (설치 → Tailwind → 첫 화면) | R5        | ⬜      |
| P3  | playground 예제에 소스 코드 노출        | R6        | ⬜      |
| P4  | 정적 사이트 배포                        | R7        | ⬜      |

## P0 결과 (완료)

- `apps/storybook` — Storybook 10.5.9 + `@storybook/react-vite`, 포트 6310, 비배포(`private: true`)
- 스토리 위치: `packages/ui/src/**/*.stories.tsx` (컴포넌트 옆)
- Vite alias 로 `@txstack/ui` 를 **소스**에 연결 — playground 와 같은 이유(HMR)
- Tailwind v4 `@source "../../../packages/ui/src"` — 이것이 없으면 카탈로그의 스타일이 전부 purge 된다
- 다크모드: 툴바 전역 토글 → `document.documentElement.classList.toggle("dark")`.
  소비자와 같은 방식이어야 테마 검증이 의미를 갖는다.

### P0 이 즉시 잡아낸 결함

Storybook 을 띄우자마자 `Cannot access 'TxClassBorderColor' before initialization` 으로 죽었다.
`packages/ui` 의 41개 파일이 자기 패키지 배럴(`".."`)에서 **값**을 가져와 순환이 생긴 것이다.
playground 는 배럴로 진입해 초기화 순서가 우연히 맞았고, Storybook 은 컴포넌트를 직접 진입점으로
삼아 순서가 뒤집혔다.

→ 커밋 `refactor(ui): 컴포넌트가 패키지 배럴에서 값을 import 하던 순환 제거` 로 해소.

**이것이 카탈로그를 먼저 만든 이유를 그대로 보여준다.** 컴포넌트를 독립적으로 렌더하는 행위 자체가
검증이다. 27종을 등재하는 과정에서 같은 종류의 결함이 더 나올 것으로 본다.

## P1 — 스토리 형식

`TxButton` 을 표준으로 삼는다 ([TxButton.stories.tsx](../../packages/ui/src/TxButton/TxButton.stories.tsx)).

```
title       "<그룹>/<컴포넌트명>"   그룹: Form · Data · Overlay · Layout · Feedback
tags        ["autodocs"]           타입에서 props 표를 자동 생성 (R2)
parameters  docs.description       컴포넌트가 답해야 할 질문을 산문으로. 주의점 우선
args        기본값                  첫 스토리가 바로 조작 가능하도록
argTypes    control · description   열거형은 select, 함수·theme 은 control: false
```

스토리 구성 순서:

1. `기본` — args 만 있는 최소형. 컨트롤 조작용
2. 변형 축별 나열 (`Variant`, `Color`, `Size` 등) — 한눈에 비교
3. 상태 (`비활성`, `로딩`, `에러`)
4. `테마_덮어쓰기` — `theme` prop 으로 부분 교체하는 법. **`Tx*` 공통 규약이라 전 컴포넌트에 넣는다**

### 그룹 분류 (27종)

| 그룹     | 컴포넌트                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Form     | TxButton · TxInput · TxSearchInput · TxTextarea · TxCheckBox · TxDropdown · TxDropdownMulti · TxForm · TxCapsLockCheck |
| Data     | TxCard · TxJsonTree · TxCoolTable · TxAgGrid↗                                                                          |
| Overlay  | TxModal · TxSlidePanel · TxDropMenu · TxContextMenu · TxToolTip · TxTabs                                               |
| Layout   | TxFlex · TxLayout · TxHeader                                                                                           |
| Feedback | TxSpinner · TxLoading · TxClipboardButton                                                                              |
| Date↗    | TxDayPicker · TxDayPickerRange                                                                                         |

↗ 는 서브패스 컴포넌트 (R4).

## 공개 API 영향

없음. 스토리는 `dist` 와 `npm pack` 산출물에 포함되지 않는다(검증함).
다만 **P1 진행 중 결함이 나오면 API 가 바뀔 수 있고**, 그때는 changeset 을 함께 쓴다.

## 검증 방법

- `pnpm check` — 스토리도 `packages/ui` 의 typecheck 대상이다
- `pnpm --filter @txstack/storybook dev` 로 렌더 확인, 콘솔 에러 0건
- `pnpm build` 후 `dist` 에 스토리 유입 0건 · `npm pack --dry-run` 목록에 `.stories.` 0건
- 결과는 `docs/verification/003_*.md` 에 기록

## P1 결과 (완료)

- **27종 등재 / 스토리 106개 / 자동 docs 27개.** 전부 렌더 확인, 에러 0건. 상세는 [003 검증](../verification/003_component_catalog_and_guide.md).
- 그룹별 스토리 수: Form 39 · Overlay 24 · Data 17 · Layout 10 · Feedback 8 · Date 8

### P1 이 추가로 잡아낸 결함 2건

| 결함                                                                       | 처리                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `TxCapsLockCheck` · `TxSpinner` · `TxTooltip` 의 props 인터페이스 미export | export + `I<컴포넌트명>Props` 로 이름 통일. changeset 작성         |
| `tags: ["autodocs"]` 가 동작하지 않음 (docs 0개)                           | Storybook 10 은 docs 가 별도 패키지 — `@storybook/addon-docs` 등록 |

두 번째는 특히 짚어둘 만하다. 태그만 달고 넘어갔다면 **R2 를 충족했다고 착각한 채** 끝났을 것이다.
수용 기준은 "태그를 달았다" 가 아니라 "docs 페이지가 생성됐다" 로 확인해야 한다.

### 스토리 작성에서 걸린 TypeScript 함정

| 증상                                                 | 원인·해결                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 필수 prop 이 있으면 `render` 만 있는 스토리가 거부됨 | meta 의 `args` 에 기본값을 채운다 (`children: null` 포함)                            |
| `decorators` 를 쓰면 `TS2742`(비이식적 타입)         | `satisfies Meta<...>` 대신 `const meta: Meta<typeof X>` 명시 주석을 쓴다             |
| `as const` 배열이 리터럴 타입으로 좁혀짐             | 드롭다운 `data` 는 `string[]` 로 선언한다. 안 그러면 `useState<string>` 과 안 맞는다 |
