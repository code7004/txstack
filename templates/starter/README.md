# starter

[`@txstack/dev-guide`](https://code7004.github.io/txstack/docs/dev-guide) 를 따르는 새 프로젝트 골격입니다.
txstack 저장소의 `templates/starter` 에 있고, dev-guide · `@txstack/ui` 를 배포하기 전에 이 골격이 그대로 통과하는지 검증합니다.
복사하면 바로 `pnpm dev` 로 화면과 API 가 뜨고, `pnpm check` 가 통과하는 상태에서 시작합니다.

| 자리            | 담은 것                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `apps/frontend` | Vite · React · TypeScript · Tailwind v4 · React Compiler · `@txstack/ui` — 빈 화면 하나       |
| `apps/backend`  | NestJS — `GET /health` 하나. 환경 변수가 틀리면 시작하지 않습니다                             |
| `packages/`     | 비어 있습니다. 둘 이상의 앱이 함께 쓸 것이 생기면 만듭니다                                    |
| `docs/`         | dev-guide 의 여섯 칸 구조 (`project · rules · requirements · plans · verification · reports`) |
| 설정            | eslint · prettier · commitlint · lint-staged — 모두 dev-guide 프리셋을 불러옵니다             |

규칙은 이 저장소에 없습니다. 설치된 `node_modules/@txstack/dev-guide` 가 원본이고, 이 저장소는 그것을 따르기만 합니다.

## 새 프로젝트 만들기

이력 없이 한 번 복사합니다. 복사한 뒤에는 txstack 과 이어지지 않습니다 — 규칙은 dev-guide 버전을 올려 받습니다.

```sh
pnpm dlx degit code7004/txstack/templates/starter my-service
cd my-service
git init
pnpm install
cp apps/backend/.env.example apps/backend/.env
pnpm dev
```

`http://localhost:5173` 에서 버튼을 누르면 backend 의 `/health` 응답이 보입니다.

그다음 `<…>` 표시를 채웁니다.

1. `package.json` 의 `name` · `description`
2. `CLAUDE.md` · `AGENTS.md` 첫 줄의 프로젝트 소개
3. `CURRENT.md` 의 프로젝트 이름 · 기준일
4. `docs/project/01_PROJECT_OVERVIEW.md` 의 서비스 소개

앱 이름(`frontend` · `backend`)을 바꾸면 루트 `package.json` 의 스크립트 · `eslint.config.js` 의 경로 · `CLAUDE.md` 를 함께 고칩니다.

## 명령

| 명령                                     | 하는 일                                           |
| ---------------------------------------- | ------------------------------------------------- |
| `pnpm dev`                               | frontend(5173) · backend(3000) 를 함께 띄웁니다   |
| `pnpm dev:frontend` · `pnpm dev:backend` | 하나만 띄웁니다                                   |
| `pnpm check`                             | lint · typecheck · 포맷 검사 — 커밋 전에 돌립니다 |
| `pnpm build`                             | 전부 빌드합니다                                   |
| `pnpm build:frontend:live`               | 운영 모드로 frontend 를 빌드합니다                |
| `pnpm start:backend`                     | 빌드한 backend 를 운영 방식으로 띄웁니다          |
| `pnpm clean`                             | `node_modules` · `dist` 를 지웁니다               |

이름 규칙은 dev-guide `rules/scripts.md` 를 따릅니다.

## 고르지 않은 것

필요한 프로젝트가 더합니다. 더할 때 고른 이유를 그 작업 문서에 적습니다.

- **라우터 · 서버 상태** (`react-router-dom` · `@tanstack/react-query`) — 화면 구조에 따라 고릅니다
- **DB** (Prisma 등) — 스크립트는 `db:migrate` · `db:generate` 처럼 `db:` 로 묶습니다
- **나머지 txstack 패키지** — `@txstack/axios` · `hooks` · `route-meta` · `fns`
- **Sass · 테스트 도구**
