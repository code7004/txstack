# 014 · `@txstack/dev-guide`

> **프로젝트를 시작할 때 "무엇을 참고한다" 가 아니라 "무엇을 따른다" 로 쓸 수 있는 개발 기준 묶음.**
> 실행 스크립트 이름 · 코딩 규칙 · 커밋 · 문서 프로세스(요구사항 → 계획 → 검증 → 보고) · 문서 양식을
> 버전이 있는 패키지 하나로 낸다. React 를 모르고 런타임 코드가 없다.

**설계는 2026-11-17 합의했다** (아래 "정한 것"). 1단계 본문은 [`packages/dev-guide`](../../packages/dev-guide) 에 있다 — **npm `0.1.0` 배포(2026-11-17).**

## 왜 — 지금은 같은 규칙이 다섯 벌로 퍼져 있다 (2026-11-17 조사)

| 항목          | 지금                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| 실행 스크립트 | `frontend:start` 계열과 `dev:web` 계열 두 갈래. `start` 의 뜻도 다르다 |
| docs 구조     | `requirements → plans → verification → reports` 형과 번호 문서 나열형  |
| 작업 흐름     | 프로젝트마다 작업 흐름 문서가 따로 있다 (`monorepo` 초안 포함)         |
| Prettier      | 한 곳만 다르다(작은따옴표 · 끝 쉼표 all)                               |
| ESLint        | 다섯 곳이 각자 83~179줄                                                |

새 프로젝트는 "기존 프로젝트를 참고한다" 로 시작했다. **복사한 순간 원본과 갈라지고, 원본을 고쳐도 전달되지 않는다.**

## 둘로 나눈다 — 패키지는 기준, 스타터는 골격 (2026-11-17 결정)

|             | `@txstack/dev-guide` (이 패키지)                                   | `monorepo` 저장소 (스타터)                                                                  |
| ----------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 맡는 것     | 규칙 · 문서 프로세스 · 문서 양식 · (2단계) 설정 프리셋 · AI 가이드 | 빈 골격 — `apps/` · 규칙대로 지은 스크립트 · dev-guide 를 가리키는 `CLAUDE.md` · 빈 `docs/` |
| 쓰는 법     | 설치해서 **따른다**. 버전이 오르면 갱신한다                        | 새 프로젝트를 시작할 때 **한 번 복사**한다                                                  |
| 규칙을 갖나 | 갖는다 — 유일한 원본                                               | 갖지 않는다. dev-guide 를 가리키기만 한다                                                   |

`monorepo` 의 `docs/template/` 10장(2026-05-28)은 버리지 않고 1단계 본문의 재료로 쓴다 — 아래 "어디서 가져오나".

## 소비자가 쓰는 모습 — 예제

### 설치

```sh
pnpm add -D -w @txstack/dev-guide
```

`@txstack/ui` 의 `ai/` 가이드처럼 **설치된 버전과 가이드가 늘 같다.** 사이트(`/dev-guide/…`)에도 같은 본문을 싣는다.

### 프로젝트 `CLAUDE.md` · `AGENTS.md` 의 첫 문단

```md
## 개발 기준

이 프로젝트는 **`@txstack/dev-guide`** 를 따른다. 규칙은 설치된 버전에 있다 —
`node_modules/@txstack/dev-guide/llms.txt` (목차), `rules/` (코딩 · 스크립트 · 커밋), `process/` (문서 프로세스).
dev-guide 와 다르게 하는 것은 [docs/rules/00_DEV_GUIDE_DIFF.md](docs/rules/00_DEV_GUIDE_DIFF.md) 에만 적는다.
```

### 작업 하나를 시작할 때 — 양식 복사

```sh
cp node_modules/@txstack/dev-guide/templates/requirements.md docs/requirements/009_first_feature.md
cp node_modules/@txstack/dev-guide/templates/plan.md         docs/plans/009_first_feature.md
```

같은 작업은 같은 번호를 쓴다. 양식을 만드는 CLI(`pnpm dlx @txstack/dev-guide new plan …`)는 후보로만 둔다 — "정한 것" 1.

### (2단계) 설정 프리셋 — 서브패스

```js
// prettier.config.js
export { default } from "@txstack/dev-guide/prettier";
```

```js
// eslint.config.js
import base from "@txstack/dev-guide/eslint";
export default [...base, { ignores: ["vendor/**"] }];
```

```js
// commitlint.config.mjs
export { default } from "@txstack/dev-guide/commitlint";
```

eslint 플러그인 · prettier 는 **선택 peer** 다. 문서만 쓰는 프로젝트는 아무것도 더 설치하지 않는다.

## 패키지 구성

```text
packages/dev-guide/
  README.md          시작하는 법 · CLAUDE.md 에 붙일 문단
  llms.txt           AI 가 읽는 목차 (장마다 한 줄)
  rules/
    scripts.md       실행 스크립트 이름 — <동작>:<대상>[:<변형>], dev / start 의 뜻, 루트 공통 9개
    commits.md       Conventional Commits + 한글 · 브랜치 · 커밋 단위 · 커밋은 요청할 때만
    workspace.md     apps/ · packages/ · pnpm 만 · Node 버전 고정 · 환경 변수
    code.md          TypeScript · React · import · 이름 규칙
  process/
    docs-structure.md  docs/ 폴더 구조 · 번호 규칙 · 색인(README) · CURRENT.md
    workflow.md        요구사항 → 계획 → 구현 → 검증(QA) → 보고, 단계마다 시작 · 끝 조건
    agents.md          사람과 AI 의 몫 · 판단은 멈추고 묻는다 · 상태와 증거
  templates/
    requirements.md  plan.md  verification.md  report.md
    docs-README.md   CURRENT.md  CLAUDE.md  DEV_GUIDE_DIFF.md
  config/            (2단계) prettier · eslint · commitlint
```

**도메인 지식을 넣지 않는다** — 서버 · 클라우드 · 업무 도메인 같은 것은 각 프로젝트의 `docs/` 에 남는다.
txstack 의 다른 패키지와 서로 참조하지 않는다.

## 1단계 목차 — 어디서 가져오나

**원본은 열어 전부 읽은 뒤 옮긴다.** 서로 어긋나면 고르지 않고 "정한 것" 에 올려 합의한다.

| 장                          | 주 재료                                                                             | 함께 보는 것                                                |
| --------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `rules/scripts.md`          | 2026-11-17 합의 (`<동작>:<대상>`, `dev`=개발 · `start`=운영, `check` 의 뜻)         | 오픈소스 36곳 조사 · pnpm `run "/^dev:/"`                   |
| `rules/commits.md`          | txstack `CLAUDE.md` · `commitlint.config.mjs`                                       | monorepo `09_Code_And_Git_Conventions` 8–10장               |
| `rules/workspace.md`        | monorepo `02_Workspace_Architecture` · `07_Environment_Strategy`                    | 기존 프로젝트의 개발 규약                                   |
| `rules/code.md`             | monorepo `09` 2–7장                                                                 | 기존 프로젝트의 기술 규약                                   |
| `process/docs-structure.md` | 기존 프로젝트의 docs 색인 (여섯 칸 · 번호 공유)                                     | 기존 프로젝트의 규약 기재 양식                              |
| `process/workflow.md`       | 기존 프로젝트의 협업 규약                                                           | monorepo `08_Development_Workflow`                          |
| `process/agents.md`         | txstack `CLAUDE.md` 의 절대 규칙 (작업 방식)                                        | 기존 프로젝트의 「지시를 그대로 따르지 않고 다시 제안한다」 |
| `templates/*`               | 기존 프로젝트의 `requirements/` · `plans/` · `verification/` · `reports/` 문서 골격 | 기존 프로젝트의 `plans/`                                    |

## 단계

| 단계 | 하는 일                                                                                | 담당                |
| ---- | -------------------------------------------------------------------------------------- | ------------------- |
| 1    | 이 문서 합의 → `packages/dev-guide` 골격 + 1단계 본문(규칙 · 프로세스 · 양식) → 배포   | 🤖 초안 · 🧑 합의   |
| 2    | 설정 프리셋 — 다섯 프로젝트 설정의 공통분모                                            | 🤖 초안 · 🧑 합의   |
| 3    | `monorepo` 를 dev-guide 를 따르는 골격으로 다시 짠다                                   | 🤖 초안 · 🧑 합의   |
| 4    | 네 프로젝트 적용 — 스크립트 이름 변경표 · `CLAUDE.md` 첫 문단 · `00_DEV_GUIDE_DIFF.md` | 🤖, 저장소마다 커밋 |

## 정한 것 (2026-11-17 사용자 합의)

1. **양식은 손으로 복사한다 (1단계).** CLI 는 쓰는 횟수가 쌓이면 다시 본다 — 런타임 코드가 생기는 일이다.
2. **문서 구조는 가장 정리된 기존 프로젝트의 여섯 칸을 표준으로 한다** — `project · rules · requirements · plans · verification · reports`.
   파일명은 상시 문서 `NN_TITLE.md`, 작업 문서 `nnn_title.md`, 같은 작업은 같은 번호.
3. **체크리스트는 `plans/` 안에(계획 문서의 마지막 절), QA 는 `verification/` 이 맡는다.** 따로 칸을 두지 않는다.
4. **`CURRENT.md`(지금 어디까지 왔나) 를 표준에 넣고, `handoff.md` 는 넣지 않는다** — 인계 내용은 `CURRENT.md` 와 검증 문서가 이미 갖는다.
5. **문서 본문은 한글, 파일 · 폴더 이름은 영문.**
6. **패키지 번호는 `014`.** txstack `CLAUDE.md` 개요의 "범용 React 라이브러리 세트" 와 패키지 표에 "React 의존 X · 문서와 설정" 으로 더한다.

## 1단계 본문을 쓰며 정한 것

- **파일 이름은 실제로 쓰는 방식을 따랐다.** monorepo 초안은 "파일은 전부 kebab-case" 였지만 다섯 프로젝트를 재 보니
  React 컴포넌트는 PascalCase, 프런트의 다른 모듈은 camelCase, NestJS 는 `kebab.종류.ts` 였다 (2026-11-17 측정). `rules/code.md` 2장
- **환경 이름은 `local` · `dev` · `live`.** monorepo 초안의 development · staging · production 이 아니라 기존 프로젝트들이 쓰는 낱말
- **브랜치에 `develop` 을 두지 않았다.** monorepo 초안에 있었지만 어느 프로젝트도 쓰지 않는다
- **작업 번호가 필요 없는 일을 정했다** — 한 줄 수정 · 의존성 올리기는 커밋 메시지가 기록이다. `process/workflow.md` 0장
- **"첫 번은 사람이, 반복은 AI 가" 와 "다시 제안한다" 를 함께 실었다** — txstack 과 기존 프로젝트의 규약에서. `process/agents.md`
- `package.json` 에 `exports` 를 둔다 — 2단계에서 설정 서브패스를 더해도 문서 경로가 막히지 않게 `./rules/*` 같은 패턴으로 열었다

## AI Guide 와의 경계 (2026-11-17 사용자 결정)

[013 AI Guide](../013_ai_guide.md)(`@txstack/ui/ai`)와 **합치지 않고 따로 둔다.**

|           | AI Guide                                         | dev-guide                                                |
| --------- | ------------------------------------------------ | -------------------------------------------------------- |
| 답하는 것 | 화면을 무엇으로 짓나 — 결정표 · 토큰 · 원시 요소 | 프로젝트를 어떻게 굴리나 — 스크립트 · 커밋 · docs · 흐름 |
| 바뀌는 때 | 부품이 바뀔 때 — ui 버전과 묶인다                | 일하는 방식이 바뀔 때                                    |
| 대상      | `@txstack/ui` 를 쓰는 화면                       | 모든 프로젝트 (백엔드만 있는 저장소도)                   |

dev-guide 를 ui 에 넣으면 백엔드 저장소가 UI 라이브러리를 설치해야 하고, AI Guide 를 dev-guide 로 옮기면
빌드가 부품 목록에서 만드는 결정표가 설치된 ui 버전과 어긋난다.

- **부품 고르기 · 토큰은 AI Guide 만 갖는다.** dev-guide `rules/code.md` 5장은 그쪽을 가리키기만 한다
- **`CLAUDE.md` 에는 두 문단을 둔다.** dev-guide `templates/CLAUDE.md` 가 UI 문단의 자리를 비워 두고 출처를 적는다
- **eslint `react/forbid-elements`(원시 요소 경고)는 2단계 프리셋에 넣지 않는다.** Tx 부품 이름과 함께 바뀌므로 AI Guide 에 남는다.
  dev-guide 프리셋은 부품과 상관없는 규칙만 갖는다
- 사이트에서도 두 페이지를 따로 두고 서로 한 줄씩 링크한다

## 배포 전 검토를 반영한 것 (2026-11-17)

- **설치 명령을 둘로** — `-w` 는 워크스페이스 밖에서 `--workspace-root may only be used inside a workspace` 로 실패한다. 일반 저장소 `pnpm add -D`, 모노레포 루트 `-w`
- **README 「새 프로젝트에 붙이기」 한 곳에 순서를 모았다** — 설치 → 폴더 → 기본 양식 → 정보 채우기 → `CLAUDE.md` · `AGENTS.md` 잇기 → 첫 작업.
  명령은 **있는 파일을 덮어쓰지 않고 이름을 알려 준다** — 손으로 합친다
- **README 「버전을 올릴 때」** — 판을 올리면 AI 가 읽는 규칙이 바로 바뀌므로 작업 하나로 다룬다. 복사한 양식은 저절로 안 바뀐다.
  0.x 동안 patch = 문구, minor = 규칙 변경. **dev-guide 의 changeset 은 무엇이 바뀌었는지를 규칙의 말로 쓴다** — 소비자가 그것을 읽고 판단한다
- **`CHANGELOG.md` 를 처음부터 두고 패키지에 싣는다** — 설치본에서 바로 읽힌다
- **검증** — `scripts/dev-guide.test.ts`(실리는 파일 · 링크 · 양식 표 · 양식을 놓는 자리 기준의 링크)와
  `pnpm verify:packages dev-guide`(워크스페이스가 아닌 저장소에 설치하고 README 의 sh 블록을 그대로 실행, 두 번 실행해도 덮어쓰지 않는지)

## 남은 것

- [x] `0.1.0` 배포 (2026-11-17) — `pnpm publish` + 브라우저 2FA + Staged Packages 승인. 일반 저장소에서 `pnpm add -D` 로 받아 21개 파일 확인
- [ ] 사이트 · AI 가이드(`scripts/ai-guide.mjs`)에 싣기
- [x] 2단계 — 설정 프리셋 (prettier · eslint · commitlint · lint-staged) — [001_config_presets](001_config_presets.md). `0.2.0` 배포 (2026-11-17). import 규칙 셋 · `node({ decorators })` 는 `0.3.0` 대기
- [ ] 3단계 — `monorepo` 스타터 — 골격 · 앱 둘 완료(커밋 전). dev-guide `0.3.0` 배포 뒤 올려 백엔드 예외를 프리셋 옵션으로 바꾼다
- [ ] 4단계 — 네 프로젝트 적용
