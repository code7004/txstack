# CLAUDE.md

txstack 작업 시 지켜야 할 핵심 규약입니다. 상세 배경은 `docs/`를 참고하세요.

## 🔖 현재 진행 상태 (2026-08-19)

**작업을 이어받는다면 [`docs/ROADMAP.md`](docs/ROADMAP.md) 를 먼저 읽는다.**
무엇이 끝났고 다음에 뭘 할 차례인지가 거기 있다. 상세는 각 트랙 문서로 들어간다.

- **배포는 최하위 우선순위다.** 되돌릴 수 없으므로, 되돌릴 수 있는 동안(트랙 0~4) 최대한 다듬는다.
- 작업은 **패키지별 트랙**으로 진행한다 — 0 공통 · 1 ui · 2 hooks · 3 route-meta · 4 network · 9 배포.
- job 은 **30분~1시간 단위**다. 하나를 끝내고 커밋할 수 있어야 한다.
- 담당 표기 — 🧑 사용자 직접 · 🤖 Claude · 🤝 함께. **🧑 job 은 Claude 가 대신 하지 않는다.**
- `001` · `001-2` · `003` 은 작업 이력이다. 미결 항목은 전부 트랙으로 옮겼다.

## 프로젝트 개요

- pnpm workspace 모노레포. **npm 에 배포되는 범용 React 라이브러리**다.
- `packages/*` 4종이 각각 독립 배포된다. `apps/playground` 는 배포하지 않는 검증용 샘플 앱이다.

| 패키지                | 역할                                   | React 의존 |
| --------------------- | -------------------------------------- | ---------- |
| `@txstack/ui`         | Tx\* UI 컴포넌트 (Tailwind v4 기반)    | O          |
| `@txstack/hooks`      | 범용 React 훅                          | O          |
| `@txstack/route-meta` | 라우트 메타 정의 · 렌더러 · 네비게이션 | O          |
| `@txstack/network`    | axios 기반 HTTP 클라이언트             | **X**      |

- 원본은 `black-message` / `usertics` / `chain-wallet-service` 의 `src/core` 다. 이관 근거는 `docs/plans/001`.

## 필수 규칙

- **패키지 매니저는 pnpm만 사용한다.** npm/yarn lockfile을 만들지 않는다.
- **Node `24.14.0`, pnpm `>=10.0.0`.**
- **커밋/푸시는 사용자가 명시적으로 요청할 때만** 한다. 자동 커밋 금지.
- **npm publish 는 사용자가 명시적으로 요청할 때만** 한다. 되돌릴 수 없다.
- 기존 사용자 변경사항을 되돌리지 않는다. 관련 없는 diff는 건드리지 않는다.
- 커밋 메시지는 Conventional Commits + 한글 (예: `feat: TxDropdown 다중선택 지원`). commitlint/husky가 검사한다.
- ESLint/Prettier 설정은 **루트가 소유**한다. 패키지 개별 설정을 추가하지 않는다.
- **원본 3개 저장소(`black-message` 등)를 수정하지 않는다.** 이 저장소는 추출본이다. 역이식은 별도 요구사항(`002`)이다.

## 패키지 경계 (가장 중요)

- **의존 방향은 `ui → hooks` 하나만 허용한다.** `hooks` / `route-meta` / `network` 는 서로 참조하지 않는다. 순환 금지.
- **앱 전역(ambient) 타입·전역 변수에 의존하지 않는다.** 소비자 프로젝트에는 그 전역이 없다.
  - 전역 `IAxiosResponse`, `$http`, `_`, `$d`, `$t` 같은 것을 쓰면 안 된다. 필요한 타입은 패키지가 직접 export 한다.
- **런타임 정책(인증 토큰, 401 처리, 응답 봉투 형태)을 패키지가 결정하지 않는다.** 전부 옵션으로 주입받는다.
- **`react` / `react-dom` / `react-router-dom` / `ag-grid-*` 는 peerDependencies** 다. dependencies 로 옮기면 소비 앱에서 React 인스턴스가 중복되어 hooks 가 깨진다.
- 무거운 선택적 의존(ag-grid, react-day-picker)은 **subpath export** 로 격리하고 `peerDependenciesMeta.optional` 로 표시한다.
- 도메인 지식(블랙/문자/지갑/유저타입 등)을 패키지 코드에 넣지 않는다. 발견하면 옵션이나 제네릭으로 뽑는다.

## Tailwind v4 (소비자 영향)

- `@txstack/ui` 의 테마는 런타임 CSS 가 아니라 **Tailwind 클래스 문자열**이다.
- 소비 앱이 `@source "../node_modules/@txstack/ui/dist";` 를 지정하지 않으면 **클래스가 purge 되어 스타일이 전부 사라진다.**
- 테마 관련 변경 시 이 제약이 깨지지 않는지 확인하고, README 안내 문구도 함께 갱신한다.
- 다크모드는 `dark:` variant(class 전략) 기준이다.

## 작업 방식

- 새 기능/패키지 구조/배포 관련 작업은 먼저 `docs/`와 `docs/plans/`의 관련 문서를 확인한다.
- 구현 전 변경 범위가 어느 패키지까지인지 분리해서 판단한다. **패키지 경계를 넘는 변경은 계획 문서를 먼저 갱신한다.**
- 구현 후 변경 범위에 맞는 최소 검증을 실행하고, 실행하지 못한 검증은 이유를 남긴다.
- 관련 문서가 있는 기능을 바꿨다면 문서 업데이트 필요 여부도 함께 판단한다.
- **공개 API(export)를 바꿨다면 changeset 을 함께 작성한다.**

## 구현 순서 원칙

- 도메인/요구사항이 불명확한 기능은 playground 에 먼저 구현해 사용 흐름을 확인한다.
- 공개 API 형태(props, 옵션, 반환 타입)에 대해 사용자 승인을 받은 뒤 내부 구현으로 넘어간다.
- 소비자가 어떻게 쓸지를 먼저 예제 코드로 적고, 그 예제가 자연스러운 방향으로 API 를 맞춘다.

## 검증 (작업 후 반드시 실행)

- 전체: `pnpm check` (lint + 전 패키지 typecheck + 회귀 테스트)
- 테스트: `pnpm test` / 워치 `pnpm test:watch` — vitest. 패키지별로 node·jsdom 환경이 갈린다
- 린트: `pnpm lint` / 자동수정 `pnpm lint:fix`
- 빌드: `pnpm build` — `dist/*.js` 와 `dist/*.d.ts` 가 생성되는지 확인
- 배포 산출물 점검: 해당 패키지에서 `npm pack --dry-run` 으로 포함 파일 목록 확인
- 화면 변경: `pnpm dev` (playground) 로 실제 렌더 확인

## 자주 쓰는 명령

```sh
pnpm i                    # 설치
pnpm check                # lint + typecheck + test
pnpm test                 # 회귀 테스트 (vitest)
pnpm build                # packages/* 전체 빌드
pnpm dev                  # playground 실행
pnpm changeset            # 변경 기록 작성 (배포 전 필수)
pnpm release:version      # changeset -> 버전/CHANGELOG 반영
pnpm release:publish      # 빌드 후 npm 배포 (사용자 요청 시에만)
```

## 버전 / 배포

- **changesets** 로 패키지별 독립 버전을 매긴다. 모노레포지만 버전은 묶이지 않는다.
- scope 패키지이므로 `--access public` 이 필요하다 (`.changeset/config.json` 의 `access: public`).
- 초기에는 `alpha` 태그로 배포한다.
- **breaking change 판정**: export 제거/이름 변경, props 필수화, peerDeps 범위 축소, 기본 동작 변경은 major.
- `apps/playground` 는 `private: true` 이며 changesets `ignore` 대상이다.

## 문서 구조 (V 모델)

`docs/`는 소프트웨어 생명주기(V 모델)에 맞춰 5개 범주로 나눈다. 번호로 범위를 한정하지 말고 **폴더의 성격**으로 이해한다.

| 범주             | 위치                 | 성격                                            | 파일명         |
| ---------------- | -------------------- | ----------------------------------------------- | -------------- |
| **Rules(규약)**  | `docs/rules/`        | 항상 따르는 아키텍처·컨벤션·가드레일. 상시 유효 | `NN_TITLE.md`  |
| **Requirements** | `docs/requirements/` | 원 요청·요구사항 정의 (무엇을/왜)               | `nnn_title.md` |
| **Plans**        | `docs/plans/`        | 작업사항 = 구현 계획 (어떻게)                   | `nnn_title.md` |
| **Verification** | `docs/verification/` | 검증 = 테스트 계획·수행·결과 (제대로 됐나)      | `nnn_title.md` |
| **Reports**      | `docs/reports/`      | 산출물 = 메신저 전달 요약 + 작업 종합           | `nnn_title.md` |

### 원칙

- **작업은 항상 `Rules` 문서를 따른다.** 패키지 구조나 배포를 바꾸기 전에 관련 `Rules`를 먼저 확인한다.
- 하나의 요구사항은 **같은 번호 `nnn`을 공유**하며 아래 순서로 흐른다:
  **`nnn` 요구사항 → `nnn` 작업사항 → `nnn` 검증 → `nnn` 산출물**
  (한 요청이 여러 계획으로 갈라지면 `002`, `002-2`처럼 접미어를 쓴다.)
- Rules는 번호(`NN`)를 쓰고 요구사항 흐름과 무관하게 상시 갱신한다.

### 기재 양식

- **Requirements** — 배경/목적, 요구사항 목록(수용 기준), 영향 범위(패키지/playground/배포), 제약·비고.
- **Plans** — 관련 요구사항 링크, 설계·변경 범위, 공개 API 영향, 작업 항목, 검증 방법.
- **Verification** — 관련 `Plans` 링크, 검증 항목, 수행 절차(재현 스텝), 결과(통과/실패·증거). 수용 기준과 매핑한다.
- **Reports** — 무엇을 만들었나(요약), 변경/커밋, 검증 결과, 배포 상태, 관련 링크. 메신저로 그대로 전달 가능한 수준으로 압축.
- **Rules** — 형식 자유. 상단에 "언제 확인해야 하는지"를 한 줄로 남긴다.

### Rules 인덱스

`docs/rules/README.md` 참고.
