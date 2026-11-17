# 실행 스크립트 이름

> 언제 보나: 새 프로젝트의 `package.json` 을 짤 때, 스크립트를 더하거나 이름을 바꿀 때.

**한 줄 규칙: `<동작>:<대상>[:<변형>]`.** 동작이 앞에 온다. `dev:frontend`, `build:frontend:live`, `deploy:backend:dev`.

## 1. 이름 순서

| 형식                   | 예                                               | 언제                                         |
| ---------------------- | ------------------------------------------------ | -------------------------------------------- |
| `<동작>`               | `dev` · `build` · `check`                        | 모든 앱 · 패키지를 대상으로 할 때            |
| `<동작>:<대상>`        | `dev:frontend` · `build:api` · `start:worker`    | 앱 하나를 다룰 때. 대상은 `apps/` 폴더 이름  |
| `<동작>:<대상>:<변형>` | `build:frontend:live` · `dev:api:sms-synthetic`  | 같은 일의 모드 · 환경 · 옵션                 |
| `<동작>:<변형>`        | `build:watch` · `lint:fix` · `format:check`      | 대상 없이 모드만 다를 때                     |
| `<도구>:<동작>` (예외) | `db:migrate` · `docker:up` · `changeset:version` | 앱이 아닌 **도구 · 하위 시스템**의 명령 묶음 |

**도구 이름이 앞에 오는 것만 예외다.** `db:*` · `docker:*` 는 앱이 아니라 묶음 이름이다. 앱 이름을 앞에 두지 않는다 —
`frontend:build` 가 아니라 `build:frontend`. 도구 이름이 앱 이름과 같으면(`admin` 앱과 `admin:create`) 동작이 앞에 오게 바꾼다(`create:admin-user`).

**왜 동작이 앞인가.** pnpm 은 정규식으로 같은 앞부분을 한 번에 돌린다 — `pnpm run "/^dev:(frontend|backend)$/"`.
동작이 앞에 있어야 "dev 전부", "build 전부" 로 묶인다. 널리 쓰이는 오픈소스 36곳(Next.js · Supabase · Cal.com · n8n ·
Payload · MUI · NestJS · Prisma …)의 루트 `package.json` 에서 앱 이름이 들어간 스크립트는 동작-앞 67 · 앱-앞 14 였다(2026-11-17 조사).

## 2. 동작 사전 — 같은 낱말은 늘 같은 뜻

| 동작                       | 뜻                                                                             | 하지 않는 것                                                                     |
| -------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `dev`                      | **개발 실행.** 파일을 고치면 다시 뜬다 (vite · nodemon · `nest start --watch`) | lint 를 먼저 돌리지 않는다 — 걸리면 서버가 안 뜬다                               |
| `start`                    | **운영 실행.** 빌드한 결과를 그대로 띄운다 (`node dist/main`)                  | 감시(watch) · 개발 도구를 쓰지 않는다                                            |
| `build`                    | 배포할 결과를 만든다                                                           |                                                                                  |
| `preview`                  | 빌드 결과를 로컬에서 띄워 본다                                                 |                                                                                  |
| `lint`                     | eslint                                                                         | 고치지 않는다 (`lint:fix` 가 고친다)                                             |
| `typecheck`                | `tsc --noEmit`                                                                 |                                                                                  |
| `test`                     | 테스트를 한 번 돈다                                                            | 감시하지 않는다 (`test:watch`)                                                   |
| `format`                   | prettier 로 고친다                                                             | (`format:check` 는 고치지 않고 확인만)                                           |
| `check`                    | 커밋 · 머지 전에 도는 검사 묶음 — 아래 3장                                     |                                                                                  |
| `deploy`                   | 배포한다                                                                       | 빌드를 빠뜨리지 않는다 (`deploy:x` 가 `build:x` 를 부른다)                       |
| `clean`                    | `node_modules` 등 만든 것을 지운다                                             | **`pnpm store prune` 을 `clean` 이라 부르지 않는다** — PC 전체의 저장소를 지운다 |
| `status` · `logs` · `tail` | 서버 상태 · 최근 로그 · 실시간 로그                                            | `watch` 라 부르지 않는다 — "다시 빌드" 와 헷갈린다                               |

`dev` 와 `start` 의 뜻은 Next.js · Vite 의 기본 템플릿과 같다. `start` 를 개발 서버로 쓰던 것은 Create React App 시절의 관행이다.

**같은 일을 하는 이름을 둘 두지 않는다.** `lint:frontend` 가 있으면 `frontend:lint` 를 지운다.

## 3. 루트에 늘 있는 것

| 스크립트                  | 하는 일                                                                     |
| ------------------------- | --------------------------------------------------------------------------- |
| `dev`                     | 개발 프로세스를 전부 같이 띄운다 — 5장의 예처럼 `pnpm run` 에 정규식을 준다 |
| `build`                   | 전부 빌드한다 — `pnpm -r build`                                             |
| `lint` · `lint:fix`       | 루트에서 eslint 한 번 (설정은 루트가 갖는다)                                |
| `typecheck`               | `pnpm -r typecheck`                                                         |
| `test`                    | 테스트가 있으면 — `pnpm -r test` 또는 `vitest run`                          |
| `format` · `format:check` | prettier                                                                    |
| `check`                   | `lint` + `typecheck` + `format:check` (+ `test`)                            |
| `clean`                   | 운영체제와 상관없이 도는 node 스크립트로 (PowerShell · bash 전용 금지)      |

**`check` 에 `test` 를 넣는 기준** — 외부 서비스(DB · Docker) 없이 돌면 넣는다. 아니면 빼고 CI 가 따로 돈다.
`format:check` 를 처음 넣을 때는 **`pnpm format` 결과를 커밋 하나로 먼저 담는다** — 안 그러면 `check` 가 바로 깨진다.

앱 하나만 다루는 명령은 `pnpm --filter <앱> <동작>` 으로도 부를 수 있다. 루트에는 **자주 쓰는 것만** 줄임 명령으로 둔다.

## 4. 앱 안의 이름

앱의 `package.json` 은 도구의 표준 이름만 쓴다 — `dev` · `build` · `start` · `preview` · `lint` · `typecheck` · `test`.
모드는 변형으로 붙인다 — `build:dev` · `build:live` · `dev:debug` · `start:worker`.

## 5. 예 — 프런트 · 백엔드 두 앱

```jsonc
// 루트 package.json
{
  "dev": "pnpm run \"/^dev:(frontend|backend)$/\"",
  "dev:frontend": "pnpm --filter @app/frontend dev",
  "dev:backend": "pnpm --filter @app/backend dev",
  "build": "pnpm -r build",
  "build:frontend:live": "pnpm --filter @app/frontend build:live",
  "start:backend": "pnpm --filter @app/backend start",
  "deploy:frontend:live": "pnpm build:frontend:live && bash apps/frontend/deploy.sh live",
  "db:migrate": "pnpm --filter @app/backend migrate",
  "lint": "eslint apps packages --no-error-on-unmatched-pattern",
  "typecheck": "pnpm -r typecheck",
  "format:check": "prettier --check .",
  "check": "pnpm lint && pnpm typecheck && pnpm format:check"
}
```

## 6. 이름을 바꿀 때

**서버가 부르는 이름부터 찾는다.** 배포 스크립트 · pm2 · CI · Dockerfile 이 `pnpm <이름>` 을 부르면 이름을 바꾸는 커밋에 함께 담는다 —
안 그러면 다음 배포에서 서버가 안 뜬다. 그다음 README · `docs/` · `CLAUDE.md` · `.claude/settings.json` 의 허용 목록을 고친다.

```sh
grep -rnE "pnpm (run )?<옛 이름>" . --exclude-dir=node_modules --exclude-dir=.git
```
