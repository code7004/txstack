# @txstack/dev-guide

**프로젝트를 시작할 때 "참고한다" 가 아니라 "따른다" 로 쓰는 개발 기준.**
실행 스크립트 이름 · 커밋 · 작업 공간 · 코드 규칙과, 요구사항 → 계획 → 구현 → 검증 → 보고로 이어지는
문서 프로세스, 그리고 그 문서들의 양식이 들어 있다. 런타임 코드가 없다 — 마크다운 묶음이다.

```sh
pnpm add -D -w @txstack/dev-guide
```

설치된 버전과 가이드가 늘 같다. 판이 오르면 갱신하고, 바뀐 규칙은 저장소의 [CHANGELOG](https://github.com/code7004/txstack/blob/main/packages/dev-guide/CHANGELOG.md) 에서 본다.

## 프로젝트에 붙이기

`CLAUDE.md` · `AGENTS.md` 첫머리에 이 문단을 둔다 (양식: [templates/CLAUDE.md](templates/CLAUDE.md)).

```md
## 개발 기준

이 프로젝트는 **`@txstack/dev-guide`** 를 따른다. 규칙은 설치된 버전에 있다 —
`node_modules/@txstack/dev-guide/llms.txt` (목차), `rules/` (스크립트 · 커밋 · 작업 공간 · 코드), `process/` (문서 프로세스 · AI 와 일하는 법).
dev-guide 와 다르게 하는 것은 [docs/rules/00_DEV_GUIDE_DIFF.md](docs/rules/00_DEV_GUIDE_DIFF.md) 에만 적는다.
```

**다르게 하는 것은 `docs/rules/00_DEV_GUIDE_DIFF.md` 한 곳에만 적는다** (양식: [templates/DEV_GUIDE_DIFF.md](templates/DEV_GUIDE_DIFF.md)).
dev-guide 의 규칙을 프로젝트 문서에 옮겨 적지 않는다 — 옮긴 순간 갈라진다.

## 들어 있는 것

| 장                                                     | 무엇                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| [rules/scripts.md](rules/scripts.md)                   | 실행 스크립트 이름 — `<동작>:<대상>[:<변형>]`, `dev` · `start` 의 뜻 |
| [rules/commits.md](rules/commits.md)                   | Conventional Commits + 한글 · 커밋 단위 · 브랜치 · 커밋 훅           |
| [rules/workspace.md](rules/workspace.md)               | pnpm · Node 고정 · `apps/` 와 `packages/` · 의존성 · 환경 변수       |
| [rules/code.md](rules/code.md)                         | 파일 · 이름 · TypeScript · import · 화면 · 서버 · 주석 · 테스트      |
| [process/docs-structure.md](process/docs-structure.md) | `docs/` 여섯 칸 · 파일 이름과 번호 · `CURRENT.md` · 색인             |
| [process/workflow.md](process/workflow.md)             | 요구사항 → 계획 → 구현 → 검증(QA) → 보고, 단계마다 시작 · 끝 조건    |
| [process/agents.md](process/agents.md)                 | 사람과 AI 의 몫 · 다시 제안하기 · 증거로 말하기                      |
| [templates/](templates)                                | 아래 양식                                                            |

## 양식 — 복사해서 쓴다

| 양식                                             | 놓는 곳                           |
| ------------------------------------------------ | --------------------------------- |
| [requirements.md](templates/requirements.md)     | `docs/requirements/nnn_title.md`  |
| [plan.md](templates/plan.md)                     | `docs/plans/nnn_title.md`         |
| [verification.md](templates/verification.md)     | `docs/verification/nnn_title.md`  |
| [report.md](templates/report.md)                 | `docs/reports/nnn_title.md`       |
| [rule.md](templates/rule.md)                     | `docs/rules/NN_TITLE.md`          |
| [docs-README.md](templates/docs-README.md)       | `docs/README.md`                  |
| [CURRENT.md](templates/CURRENT.md)               | 저장소 루트                       |
| [CLAUDE.md](templates/CLAUDE.md)                 | 저장소 루트 (`AGENTS.md` 도 같게) |
| [DEV_GUIDE_DIFF.md](templates/DEV_GUIDE_DIFF.md) | `docs/rules/00_DEV_GUIDE_DIFF.md` |

```sh
cp node_modules/@txstack/dev-guide/templates/requirements.md docs/requirements/009_market_sync.md
cp node_modules/@txstack/dev-guide/templates/plan.md         docs/plans/009_market_sync.md
```

## 담지 않는 것

**도메인 지식 · 특정 서버 · 특정 클라우드의 절차.** 그것은 각 프로젝트의 `docs/project/` · `docs/rules/` 가 갖는다.
eslint · prettier · commitlint 설정 프리셋은 다음 판에 서브패스로 더한다.

MIT
