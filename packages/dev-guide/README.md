# @txstack/dev-guide

프로젝트마다 반복해서 정리하던 개발 규칙과 문서 양식을 한곳에 모은 패키지입니다.
실행 스크립트 이름, 코드 작성, 커밋 규칙과 함께 요구사항 정리부터 계획 · 구현 · 검증 · 보고까지
이어지는 작업 절차를 제공합니다.

새 프로젝트를 시작하거나 여러 저장소의 개발 기준을 맞출 때 사용할 수 있습니다.
공통 규칙은 설치된 패키지에서 확인하고, 프로젝트별로 다르게 적용하는 내용만 별도 문서에 기록합니다.
Claude Code 나 Codex 같은 AI 코딩 도구에도 같은 기준을 안내할 수 있습니다.

마크다운 문서와 템플릿으로 구성되어 있으며, 런타임 코드나 의존성은 없습니다.

## 설치

```sh
pnpm add -D @txstack/dev-guide        # 일반 저장소
```

```sh
pnpm add -D -w @txstack/dev-guide     # pnpm 모노레포 — 루트에 한 번
```

개발 가이드는 패키지에 포함되어 있어, 설치한 버전의 규칙과 양식을 그대로 확인할 수 있습니다.
버전별 변경 내용은 함께 설치되는 [CHANGELOG.md](CHANGELOG.md) 에서 확인할 수 있습니다.

## 프로젝트에 적용하기

설치만으로 규칙이 적용되지는 않습니다. 아래 순서로 문서를 준비하고 AI 도구의 지침에 연결합니다.
**기존 파일은 덮어쓰지 않습니다** — 이미 있는 파일은 경로를 알려 주므로, 템플릿과 비교해 필요한 내용을 반영하세요.

**1. 설치합니다** — 위의 [설치](#설치).

**2. 저장소 루트에서 문서 폴더와 기본 파일을 만듭니다.**

```sh
G=node_modules/@txstack/dev-guide/templates
put() { if [ -e "$2" ]; then echo "기존 파일이 있어 생성을 건너뜁니다 — 템플릿과 비교해 반영하세요: $2"; else cp "$G/$1" "$2"; fi; }
mkdir -p docs/project docs/rules docs/requirements docs/plans docs/verification docs/reports
put docs-README.md     docs/README.md
put CURRENT.md         CURRENT.md
put CLAUDE.md          CLAUDE.md
put CLAUDE.md          AGENTS.md
put DEV_GUIDE_DIFF.md  docs/rules/00_DEV_GUIDE_DIFF.md
put rule.md            docs/project/01_PROJECT_OVERVIEW.md
```

**3. 프로젝트 정보를 입력합니다.** `<…>` 표시를 프로젝트에 맞는 내용으로 바꾸세요 — `CURRENT.md` 의 현재 상태,
`docs/project/01_PROJECT_OVERVIEW.md` 의 서비스 소개, `docs/rules/00_DEV_GUIDE_DIFF.md` 의 **적용 버전**(설치한 버전).
공통 규칙과 다르게 적용할 내용이 없다면 차이점 문서의 예시 행을 지우고 표를 비워 두세요.

**4. AI 도구의 프로젝트 지침을 설정합니다.** Claude Code 는 `CLAUDE.md`, Codex 는 `AGENTS.md` 를 읽습니다.
새로 만든 파일은 `<…>` 만 채우면 됩니다. 기존 파일이라면 맨 위에 아래 문단을 추가하세요.
`@txstack/ui` 를 사용한다면 그 아래에 `@txstack/ui` 의 `ai/rules.md` 「소비자 프로젝트 시작 묶음」 문단도 함께 추가할 수 있습니다.

```md
## 개발 기준

이 프로젝트는 **`@txstack/dev-guide`** 를 따른다. 규칙은 설치된 버전에 있다 —
`node_modules/@txstack/dev-guide/llms.txt` (목차), `rules/` (스크립트 · 커밋 · 작업 공간 · 코드), `process/` (문서 프로세스 · AI 와 일하는 법).
dev-guide 와 다르게 하는 것은 [docs/rules/00_DEV_GUIDE_DIFF.md](docs/rules/00_DEV_GUIDE_DIFF.md) 에만 적는다.
```

**5. 첫 작업 문서를 작성합니다.** 작업 번호와 이름을 정하고 요구사항 · 계획 · 검증 템플릿을 복사한 뒤,
`docs/README.md` 의 「작업」 링크를 그 이름으로 바꾸세요.

```sh
G=node_modules/@txstack/dev-guide/templates
n=001_first_feature   # <작업 번호>_<이름>
cp "$G/requirements.md" "docs/requirements/$n.md"
cp "$G/plan.md"         "docs/plans/$n.md"
cp "$G/verification.md" "docs/verification/$n.md"
```

템플릿 안의 `nnn_title.md` 링크도 같은 이름으로 바꿉니다. 문서별 작성 시점과 역할은 [process/workflow.md](process/workflow.md) 에서 확인할 수 있습니다.

**공통 규칙은 패키지를 참조하고, 프로젝트별 예외만 기록하세요.** 규칙을 프로젝트 문서에 복사해 관리하면
패키지를 업데이트해도 변경 사항이 반영되지 않습니다.

## 업데이트하기

패키지를 업데이트하면 AI 도구가 참조하는 개발 규칙도 함께 바뀝니다. 규칙이 바뀌는 업데이트는
프로젝트에 미치는 영향을 검토한 뒤 적용하세요.

1. 업데이트할 버전의 [CHANGELOG](https://github.com/code7004/txstack/blob/main/packages/dev-guide/CHANGELOG.md) 를 저장소에서 먼저 확인합니다 —
   설치된 `CHANGELOG.md` 에는 아직 새 버전의 기록이 없습니다
2. 기존 예외(`docs/rules/00_DEV_GUIDE_DIFF.md`)에 영향을 주거나 프로젝트의 규칙과 충돌하는 변경이 있는지 확인합니다
3. 스크립트 · 문서 구조 · 진행 중인 작업 · AI 지침에 미치는 영향을 확인합니다
4. 적용할 변경과 프로젝트별 예외를 정해 `00_DEV_GUIDE_DIFF.md` 에 날짜와 함께 기록합니다
5. 업데이트한 뒤 **적용 버전**을 고치고, 채택한 규칙에 맞게 프로젝트를 수정합니다.
   함께 설치된 `CHANGELOG.md` 와 규칙 문서를 기준으로 다시 점검합니다
6. 관련 변경은 하나의 커밋으로 관리합니다 — 예: `chore: dev-guide 0.2.0 적용`

**프로젝트에 복사한 템플릿은 자동으로 업데이트되지 않습니다.** 새 작업부터 새 템플릿을 쓰고,
진행 중인 문서는 그대로 두어도 됩니다. `CURRENT.md` · `docs/README.md` · `CLAUDE.md` 처럼 계속 쓰는 문서는
새 템플릿과 비교해 필요한 내용만 반영하세요.

### 버전 정책

| 버전          | 바뀌는 것                                               | 적용 절차             |
| ------------- | ------------------------------------------------------- | --------------------- |
| patch `0.1.x` | 문구 · 오타 · 예시. 규칙을 적용하는 방법은 그대로입니다 | 별도 영향 검토 불필요 |
| minor `0.x.0` | 규칙의 추가 · 변경 · 삭제, 템플릿 구조 변경             | **영향 검토 후 적용** |

1.0 이후에는 기존 규칙의 변경 · 삭제는 major, 규칙 추가는 minor, 문구 수정은 patch 버전으로 배포합니다.

## 문서

| 문서                                                   | 내용                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| [rules/scripts.md](rules/scripts.md)                   | 실행 스크립트 이름 — `<동작>:<대상>[:<변형>]`, `dev` · `start` 의 뜻   |
| [rules/commits.md](rules/commits.md)                   | Conventional Commits + 한글 · 커밋 단위 · 브랜치 · 커밋 훅             |
| [rules/workspace.md](rules/workspace.md)               | pnpm · Node 고정 · `apps/` 와 `packages/` · 의존성 · 환경 변수         |
| [rules/code.md](rules/code.md)                         | 파일 · 이름 · TypeScript · import · 화면 · 서버 · 주석 · 테스트        |
| [process/docs-structure.md](process/docs-structure.md) | docs 폴더 구성 · 파일 이름과 번호 · `CURRENT.md` · 색인                |
| [process/workflow.md](process/workflow.md)             | 요구사항 → 계획 → 구현 → 검증(QA) → 보고, 단계별 시작 조건과 완료 기준 |
| [process/agents.md](process/agents.md)                 | 사용자와 AI 도구의 역할 · 다시 제안하기 · 증거로 말하기                |
| [llms.txt](llms.txt)                                   | AI 도구가 먼저 읽는 목차                                               |
| [CHANGELOG.md](CHANGELOG.md)                           | 버전별 규칙 변경 내역                                                  |

## 문서 템플릿

| 문서 템플릿                                      | 복사할 위치                                           |
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

## 제공 범위

업무 도메인, 서버 구성, 클라우드별 운영 절차는 포함하지 않습니다. 해당 내용은 각 프로젝트의
`docs/project/` 또는 `docs/rules/` 에서 관리합니다.

UI 컴포넌트 선택과 사용 규칙은 `@txstack/ui` 의 AI Guide(`ai/rules.md`)에서 별도로 제공합니다.

ESLint · Prettier · commitlint 설정 프리셋은 현재 제공하지 않습니다. 후속 단계에서 검토할 예정입니다.

MIT
