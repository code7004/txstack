# @txstack/dev-guide

**프로젝트를 시작할 때 "참고한다" 가 아니라 "따른다" 로 쓰는 개발 기준.**
실행 스크립트 이름 · 커밋 · 작업 공간 · 코드 규칙과, 요구사항 → 계획 → 구현 → 검증 → 보고로 이어지는
문서 프로세스, 그리고 그 문서들의 양식이 들어 있다. 런타임 코드가 없다 — 마크다운 묶음이다.

## 설치

```sh
pnpm add -D @txstack/dev-guide        # 일반 저장소
```

```sh
pnpm add -D -w @txstack/dev-guide     # pnpm 모노레포 — 루트에 한 번
```

설치된 버전과 가이드가 늘 같다. 무엇이 바뀌었는지는 함께 설치되는 [CHANGELOG.md](CHANGELOG.md) 에 있다.

## 새 프로젝트에 붙이기

**이미 있는 파일은 덮어쓰지 않는다.** 아래 명령은 없는 파일만 만들고, 있는 파일은 이름을 알려 준다 — 그 파일은 양식과 비교해 손으로 합친다.

**1. 설치** — 위의 [설치](#설치).

**2 · 3. 문서 폴더를 만들고 기본 양식을 놓는다** — 저장소 루트에서.

```sh
G=node_modules/@txstack/dev-guide/templates
put() { if [ -e "$2" ]; then echo "이미 있다 — 양식과 비교해 손으로 합친다: $2"; else cp "$G/$1" "$2"; fi; }
mkdir -p docs/project docs/rules docs/requirements docs/plans docs/verification docs/reports
put docs-README.md     docs/README.md
put CURRENT.md         CURRENT.md
put CLAUDE.md          CLAUDE.md
put CLAUDE.md          AGENTS.md
put DEV_GUIDE_DIFF.md  docs/rules/00_DEV_GUIDE_DIFF.md
put rule.md            docs/project/01_PROJECT_OVERVIEW.md
```

**4. 프로젝트 정보를 채운다.** `<…>` 자리를 채운다 — `CURRENT.md` 의 지금 상태, `docs/project/01_PROJECT_OVERVIEW.md` 의 서비스 소개,
`docs/rules/00_DEV_GUIDE_DIFF.md` 의 **따르는 판**(설치한 버전). 다르게 할 것이 없으면 표는 비워 둔다.

**5. `CLAUDE.md` · `AGENTS.md` 를 잇는다.** 새로 만들었으면 `<…>` 만 채운다. 이미 있던 파일이면 맨 위에 아래 문단을 넣는다.
UI 를 `@txstack/ui` 로 짓는다면 그 아래에 `@txstack/ui` 의 `ai/rules.md` 「소비자 프로젝트 시작 묶음」 문단도 넣는다.

```md
## 개발 기준

이 프로젝트는 **`@txstack/dev-guide`** 를 따른다. 규칙은 설치된 버전에 있다 —
`node_modules/@txstack/dev-guide/llms.txt` (목차), `rules/` (스크립트 · 커밋 · 작업 공간 · 코드), `process/` (문서 프로세스 · AI 와 일하는 법).
dev-guide 와 다르게 하는 것은 [docs/rules/00_DEV_GUIDE_DIFF.md](docs/rules/00_DEV_GUIDE_DIFF.md) 에만 적는다.
```

**6. 첫 작업을 쓴다.** 번호와 이름을 정하고 양식 셋을 복사한 뒤, `docs/README.md` 의 「작업」 링크를 그 이름으로 고친다.

```sh
G=node_modules/@txstack/dev-guide/templates
n=001_first_feature   # <작업 번호>_<이름>
cp "$G/requirements.md" "docs/requirements/$n.md"
cp "$G/plan.md"         "docs/plans/$n.md"
cp "$G/verification.md" "docs/verification/$n.md"
```

양식 안의 `nnn_title.md` 링크도 같은 이름으로 바꾼다. 무엇을 언제 쓰는지는 [process/workflow.md](process/workflow.md).

**dev-guide 의 규칙을 프로젝트 문서에 옮겨 적지 않는다** — 옮긴 순간 갈라진다. 다르게 하는 것만 `00_DEV_GUIDE_DIFF.md` 에 적는다.

## 버전을 올릴 때

판을 올리면 **AI 가 읽는 규칙이 그 자리에서 바뀐다.** 그래서 올리는 것 자체를 작업 하나로 다룬다.

1. 설치된 `CHANGELOG.md` 에서 지금 판과 새 판 사이에 바뀐 규칙을 읽는다
2. `docs/rules/00_DEV_GUIDE_DIFF.md` 와 비교한다 — 예외로 두었던 규칙이 바뀌었나, 새 규칙이 이 프로젝트와 부딪히나
3. 영향을 본다 — 스크립트 이름 · `docs/` 구조 · 진행 중인 작업 문서 · `CLAUDE.md` 의 문단
4. 받아들일 것과 예외로 둘 것을 정해 `00_DEV_GUIDE_DIFF.md` 표에 날짜와 함께 적는다
5. **따르는 판**을 고치고, 받아들인 규칙대로 프로젝트를 맞춘다
6. 한 커밋에 담는다 — `chore: dev-guide 0.2.0 을 따른다`

**이미 복사한 양식은 저절로 바뀌지 않는다.** 설치된 규칙만 바뀐다. 새 작업부터 새 양식을 쓰고, 진행 중인 문서는 그대로 둬도 된다.
`CURRENT.md` · `docs/README.md` · `CLAUDE.md` 처럼 계속 쓰는 문서는 새 양식과 비교해 필요한 것만 옮긴다.

### 판 번호의 뜻

| 판            | 무엇이 바뀌나                                          | 위의 절차  |
| ------------- | ------------------------------------------------------ | ---------- |
| patch `0.1.x` | 문구 · 오타 · 예시. 따르는 방법은 그대로               | 필요 없다  |
| minor `0.x.0` | 규칙을 더하거나 바꾸거나 뺐다 · 양식의 구조가 바뀌었다 | **밟는다** |

1.0 이후에는 규칙을 바꾸거나 빼면 major, 더하면 minor, 문구는 patch 다.

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
| [llms.txt](llms.txt)                                   | AI 가 먼저 읽는 목차                                                 |
| [CHANGELOG.md](CHANGELOG.md)                           | 판마다 바뀐 규칙                                                     |

## 양식

| 양식                                             | 놓는 곳                                               |
| ------------------------------------------------ | ----------------------------------------------------- |
| [requirements.md](templates/requirements.md)     | `docs/requirements/nnn_title.md`                      |
| [plan.md](templates/plan.md)                     | `docs/plans/nnn_title.md`                             |
| [verification.md](templates/verification.md)     | `docs/verification/nnn_title.md`                      |
| [report.md](templates/report.md)                 | `docs/reports/nnn_title.md`                           |
| [rule.md](templates/rule.md)                     | `docs/rules/NN_TITLE.md` · `docs/project/NN_TITLE.md` |
| [docs-README.md](templates/docs-README.md)       | `docs/README.md`                                      |
| [CURRENT.md](templates/CURRENT.md)               | 저장소 루트 `CURRENT.md`                              |
| [CLAUDE.md](templates/CLAUDE.md)                 | 저장소 루트 `CLAUDE.md` · `AGENTS.md`                 |
| [DEV_GUIDE_DIFF.md](templates/DEV_GUIDE_DIFF.md) | `docs/rules/00_DEV_GUIDE_DIFF.md`                     |

## 담지 않는 것

**도메인 지식 · 특정 서버 · 특정 클라우드의 절차.** 그것은 각 프로젝트의 `docs/project/` · `docs/rules/` 가 갖는다.
**화면 부품을 고르는 규칙**도 담지 않는다 — `@txstack/ui` 의 `ai/rules.md` 가 갖는다.
eslint · prettier · commitlint 설정 프리셋은 다음 판에 서브패스로 더한다.

MIT
