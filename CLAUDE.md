# CLAUDE.md

txstack 작업 시 지켜야 할 핵심 규약. **상세는 `docs/` 가 소유한다. 이 문서는 얇게 유지한다.**

## 🔖 시작하기

**작업을 이어받는다면 [`docs/README.md`](docs/README.md) 를 먼저 읽는다.**
이 저장소가 무엇을 만드는지, 어디까지 왔는지, 다음에 뭘 할 차례인지가 거기 있다.

문서 체계를 **2026-08-25 에 새로 짰다.** 이전 문서는 전부 `docs/temp/` 에 있다 — **참고만 한다.**

| 무엇을 하려는가                             | 어디를 읽나                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| 전체 파악 · 다음 할 일 찾기                 | [docs/README.md](docs/README.md)                                                   |
| 패키지 경계 · 의존 방향 판단                | [docs/00_foundation/01_ARCHITECTURE.md](docs/00_foundation/01_ARCHITECTURE.md)     |
| 담당(🧑/🤖/🤝) 판단 · 문서 쓰기 · 세션 운영 | [docs/00_foundation/02_WORKFLOW.md](docs/00_foundation/02_WORKFLOW.md)             |
| 이름 · 파일 구조 · 커밋 메시지              | [docs/00_foundation/03_CONVENTIONS.md](docs/00_foundation/03_CONVENTIONS.md)       |
| 명령 실행 · 검증 범위 · Tailwind 제약       | [docs/00_foundation/04_TOOLING.md](docs/00_foundation/04_TOOLING.md)               |
| 공개 API 변경 · 버전 · 배포                 | [docs/00_foundation/05_RELEASE.md](docs/00_foundation/05_RELEASE.md)               |
| 컴포넌트·훅 하나를 작업 항목으로 잡기       | [docs/00_foundation/06_COMPONENT_FLOW.md](docs/00_foundation/06_COMPONENT_FLOW.md) |
| 주제별 진행 (001~904)                       | `docs/<번호>_<이름>/README.md`                                                     |

## 프로젝트 개요

**여러 프로젝트에서 재사용할 수 있는 범용 React 라이브러리 세트.** npm 에 배포한다.
pnpm workspace 모노레포. `packages/*` 4종이 각각 독립 배포되고, `apps/*` 는 배포하지 않는다.

| 번호  | 패키지                | 역할                                             | React 의존 |
| ----- | --------------------- | ------------------------------------------------ | ---------- |
| `001` | `@txstack/ui`         | Tx\* UI 컴포넌트 — 쉬운 사용법·쉬운 커스터마이징 | O          |
| `002` | `@txstack/route-meta` | 라우트를 메타데이터로 관리 (icon·path·scope)     | O          |
| `003` | `@txstack/hooks`      | `useUrlQuery` — URL params 를 상태처럼           | O          |
| `004` | `@txstack/network`    | axios 확장 — 로그와 초기화                       | **X**      |

지원 트랙: `901` Storybook · `902` Vitest · `903` 문서 사이트 · `904` 에이전트 가이드(**사이트에서 다운로드**, npm 동봉 안 함).

`packages/*` 의 기본 기능은 **이미 구현되어 있다.** 지금 하는 일은 새로 만들기가 아니라,
**하나씩 열어보고 결함·불필요한 것을 정리해 배포 가능한 수준으로 올리는 것**이다.

## 절대 규칙

작업 방식:

- **전체 틀은 사용자가 숙지한다.** "다 만들어" 가 아니다. 설계는 함께 합의하고, **첫 구현은 사용자가 한다.**
  Claude 는 반복 구현·테스트·정리를 맡는다. 판정 기준은 [02_WORKFLOW](docs/00_foundation/02_WORKFLOW.md) 참고.
- **🧑 job 은 Claude 가 대신 하지 않는다.** 막히면 설명·리뷰·대안 제시까지만 한다.
- **판단이 필요한 job 은 사용자 승인 없이 넘어가지 않는다.** 공개 API 형태는 예제 코드로 먼저 합의한다.
- **커밋 / 푸시는 사용자가 명시적으로 요청할 때만.** 자동 커밋 금지.
- **`npm publish` 는 사용자가 명시적으로 요청할 때만.** 되돌릴 수 없다.
- 기존 사용자 변경사항을 되돌리지 않는다. 관련 없는 diff 는 건드리지 않는다.
- **작업 단위는 컴포넌트·기능 하나다.** 계층별로 몰아서 하지 않고 `S1 문서 → S2 구현 → S3 테스트 → S4 스토리북 → 🧑 사용자 확인 → S5 문서사이트 → S6 Claude가이드` 를 수직으로 관통한다. 상세는 [06_COMPONENT_FLOW](docs/00_foundation/06_COMPONENT_FLOW.md).
- **`S1`~`S4`(1차)는 한 창에서 이어 돈다.** 단, **`S1` 의 🤝 는 그대로다** — 판정이 필요하면 창을 안 나눠도 그 자리에서 묻는다.
- **`S4` 뒤에서 멈춘다.** 사용자가 Storybook 에서 직접 확인하고 2차 개선을 지시해야 `S5` 로 간다. **확인 없이 문서화로 넘어가지 않는다.**
- **vitest = 🤖 자동 검증 / Storybook = 🧑 가 직접 보는 자리.** Storybook 에 `play` 함수나 `addon-vitest` 를 넣지 않는다.
  Storybook 에는 `main.ts` 의 `READY` 목록에 올린 **확인 준비가 된 컴포넌트만** 싣는다.

패키지 경계 (어기면 범용 라이브러리가 아니다):

- **의존 방향은 `ui → hooks` 하나만 허용한다.** `hooks` / `route-meta` / `network` 는 서로 참조하지 않는다.
- **앱 전역(ambient) 타입·전역 변수에 의존하지 않는다.** 소비자 프로젝트에는 그 전역이 없다.
- **런타임 정책(인증 토큰, 401 처리, 응답 봉투)을 패키지가 결정하지 않는다.** 옵션으로 주입받는다.
- **`react` / `react-dom` / `react-router-dom` / `ag-grid-*` 는 peerDependencies 다.**
- 도메인 지식(블랙/문자/지갑/유저타입 등)을 패키지 코드에 넣지 않는다.

환경:

- **pnpm 만 사용한다.** npm/yarn lockfile 을 만들지 않는다. Node `24.14.0`, pnpm `>=10.0.0`.
- ESLint / Prettier 설정은 **루트가 소유**한다. 패키지 개별 설정을 추가하지 않는다.
- 커밋 메시지는 Conventional Commits + 한글 (예: `feat: TxDropdown 다중선택 지원`).
- **원본 3개 저장소(`black-message` · `usertics` · `chain-wallet-service`)를 수정하지 않는다.** 읽기만 한다.

## 작업 순서

1. 관련 `docs/00_foundation/` 규약과 해당 번호 폴더 문서를 먼저 읽는다.
2. 변경 범위가 어느 패키지까지인지 분리해서 판단한다. **패키지 경계를 넘는 변경은 문서를 먼저 갱신한다.**
3. 구현 후 [04_TOOLING](docs/00_foundation/04_TOOLING.md) 의 "변경 범위별 최소 검증" 을 실행한다.
   **실행하지 못한 검증은 이유를 남긴다.**
4. **공개 API(export)를 바꿨다면 changeset 을 함께 작성한다.**
5. 문서 상태(`30_tasks.md`, 폴더 `README.md` 의 "다음 할 일") 를 갱신한다.

## 검증 명령

```sh
pnpm check                # lint + typecheck + test  ← 기본
pnpm test                 # 회귀 테스트 (vitest)
pnpm build                # packages/* 전체 빌드
pnpm dev                  # playground 실행
pnpm storybook:dev        # 컴포넌트 카탈로그
pnpm changeset            # 변경 기록 (공개 API 변경 시 필수)
```
