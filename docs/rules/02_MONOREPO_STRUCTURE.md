# 02. 모노레포 구조와 스크립트 규약

> **언제 확인하나** — 패키지나 앱을 추가할 때, 루트에 스크립트를 만들 때, 워크스페이스 설정을 바꿀 때.

---

## 1. 두 종류만 있다

| 위치         | 성격                | 규칙                                            |
| ------------ | ------------------- | ----------------------------------------------- |
| `packages/*` | **npm 에 배포된다** | 공개 API·버전·changeset 관리 대상               |
| `apps/*`     | **배포하지 않는다** | `"private": true` 필수. 검증·문서 도구일 뿐이다 |

현재 — `packages`: ui · hooks · route-meta · network / `apps`: playground · storybook

**앱은 패키지를 검증하는 수단이지 산출물이 아니다.** 앱에서 편해지자고 패키지 API 를 바꾸지 않는다.

## 2. 워크스페이스 설정이 왜 그런가

`.npmrc` 의 각 줄은 의도가 있다. 지우면 조용히 깨진다.

| 설정                           | 이유                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `auto-install-peers=false`     | **소비자 환경(peer 미설치)을 그대로 재현**한다. 자동 설치되면 optional peer 설계가 검증되지 않는다 |
| `shamefully-hoist=false`       | 선언하지 않은 의존을 import 하면 **즉시 깨지도록** 한다 (유령 의존성 방지)                         |
| `link-workspace-packages=true` | 워크스페이스 내부 패키지를 `workspace:` 프로토콜로 연결한다                                        |

`pnpm-workspace.yaml` 의 `onlyBuiltDependencies` 는 빌드 스크립트 실행을 허용할 패키지 목록이다.
pnpm 10.0.0 은 이 위치를 아직 읽지 않아 경고가 뜨지만, esbuild 는 플랫폼 패키지에 바이너리가 들어 있어
실제 동작에는 문제가 없다.

## 3. 스크립트 네이밍 규약

### 3-1. 세 가지 형태만 쓴다

| 형태                           | 뜻                             | 예                                                          |
| ------------------------------ | ------------------------------ | ----------------------------------------------------------- |
| `<동작>`                       | **워크스페이스 전체**에 적용   | `build` · `lint` · `typecheck` · `test` · `check`           |
| `<대상\|영역>:<동작>[:<변형>]` | 대상이나 도구 영역이 있는 동작 | `storybook:dev` · `release:version` · `backend:migrate:dev` |
| `<동작>:<변형>`                | 전체 동작의 **다른 모드**      | `lint:fix` · `test:watch` · `format:check`                  |

**판정은 첫 segment 로 한다.**

- 첫 segment 가 **명사**(워크스페이스 이름 또는 도구 영역)면 → 대상형
- 첫 segment 가 **동사**면 → 변형형

`storybook:dev` 는 `storybook` 이 명사(앱 이름)라 대상형이고,
`test:watch` 는 `test` 가 동사라 변형형이다. **읽는 순서대로 판정된다.**

### 3-2. 왜 대상을 앞에 두는가

1. **생태계에서 더 흔하다** — `db:migrate` · `db:seed` · `docker:up` · `prisma:generate` 처럼
   **영역:동작**이 가장 널리 퍼진 형태다. Nx 도 `project:target` 순서다
2. **네임스페이스 관례에 맞다** — 일반에서 구체로 좁힌다 (`com.example.app`, BEM `block__element--modifier`)
3. **단계가 늘어나도 읽힌다** — `backend:migrate:dev` 는 자연스럽지만
   `dev:backend:migrate` 는 읽히지 않는다
4. **다른 저장소와 통일된다.** 저장소가 여럿일 때 규칙이 갈리는 비용이 규칙 자체의 우열보다 크다

> 이전 판(2026-08-19 오전)은 동사를 앞에 뒀다. 근거는 "알파벳순으로 같은 동작이 모인다" 였는데,
> **워크스페이스 전체 동작은 접두어가 없어서 애초에 대상별 명령과 섞이지 않는다.**
> 그 이점이 `dev` / `dev:playground` 정도에만 걸려 근거가 얇았다. 같은 날 뒤집었다.

부수 효과로 형태가 4개에서 3개로 줄었다. 이전 판에서는 `release:version`(영역:동작)과
`dev:storybook`(동사:대상)이 같은 모양이면서 뜻이 반대라 어색했는데, 그것이 해소된다.

### 3-3. 별칭

가장 자주 쓰는 명령 하나에만 짧은 별칭을 둔다. 별칭은 **실제 스크립트를 호출**한다.

```json
"dev": "pnpm playground:dev",
"playground:dev": "pnpm --filter @txstack/playground dev",
"storybook:dev": "pnpm --filter @txstack/storybook dev",
"storybook:build": "pnpm --filter @txstack/storybook build"
```

명령을 복제하지 않는다. 복제하면 한쪽만 고쳐져 갈라진다.

`dev` 는 규칙상 "워크스페이스 전체 dev" 로 읽히지만 실제로는 playground 하나를 띄운다.
**JS 생태계에서 `pnpm dev` 가 반사적으로 쓰이는 명령이라 예외로 둔 것**이며,
`package.json` 에서 별칭임이 드러나게 적는다. **어느 것이 기본인지 애매하면 별칭을 두지 않는다.**

### 3-4. 워크스페이스 안쪽 이름은 접두어 없이 통일한다

각 패키지·앱의 `scripts` 는 `dev` · `build` · `typecheck` 처럼 **접두어 없는 공통 이름**을 쓴다.

| 위치         | 갖는 스크립트                              |
| ------------ | ------------------------------------------ |
| `packages/*` | `build` · `typecheck`                      |
| `apps/*`     | `dev` · `build` · `typecheck` (+`preview`) |

이름이 통일돼야 `pnpm -r typecheck` 처럼 **전체를 한 번에 부르는 것**이 성립한다.
루트가 특정 대상을 부를 때는 `--filter` 를 쓴다.

### 3-5. 하지 않는 것

- 루트에 워크스페이스 스크립트의 **내용을 복제**하지 않는다. `--filter` 로 부른다
- 같은 동작에 **두 이름**을 두지 않는다 (`test` 와 `unit` 을 같이 두지 않는다)
- 앱 전용 도구를 **루트 `build`** 에 넣지 않는다. `build` 는 `packages/*` 만 돈다

## 4. 새 패키지를 추가할 때

1. `packages/<이름>/package.json` — `@txstack/<이름>`, `"type": "module"`, `files: ["dist","README.md","LICENSE"]`
2. `exports` · `main` · `types` 구성 ([rules 03](03_PUBLISHING_AND_VERSIONING.md))
3. `repository`(+`directory`) · `homepage` · `bugs`
4. `scripts` 는 `build` · `typecheck`
5. `tsconfig.json` 은 루트 `tsconfig.base.json` 을 extends
6. `tsup.config.ts` — 무거운 선택적 의존은 subpath 엔트리로 분리
7. README · LICENSE
8. **의존 방향을 확인한다** — `ui → hooks` 하나만 허용, 순환 금지

## 5. 새 앱을 추가할 때

1. `apps/<이름>/package.json` — **`"private": true` 필수**
2. `scripts` 는 `dev` · `build` · `typecheck`
3. 루트에 `<이름>:dev` 추가 (정적 산출물이 필요하면 `<이름>:build` 도)
4. `.claude/launch.json` 에 항목 추가 (포트 지정)
5. **changesets 는 손댈 것이 없다** — 아래 참조

### changesets 와 private 앱

`.changeset/config.json` 에 `"privatePackages": false` 가 있다.
**private 패키지는 버전·태그 대상에서 자동으로 빠진다.**

과거에는 `ignore: ["@txstack/playground"]` 로 앱을 하나씩 적었는데, `storybook` 을 추가할 때
빠뜨려서 불일치가 생겼다. **목록을 손으로 관리하면 반드시 드리프트한다.**

## 6. 개발 도구는 루트가 소유한다

`eslint` · `prettier` · `typescript` · `tsup` · `vitest` · `storybook` 은 **루트 devDependencies** 다.

이유는 두 가지다.

- 설정이 하나여야 결과가 일관된다 (CLAUDE.md 의 "ESLint/Prettier 설정은 루트가 소유한다")
- **테스트·스토리 파일이 `packages/*/src` 안에 살기 때문**이다. 도구가 앱에만 있으면
  pnpm 의 엄격한 `node_modules` 구조에서 패키지가 해석하지 못해 `TS2307` 로 깨진다
  (Storybook 도입 때 실제로 겪었다 — [rules 06 §2-8](06_STORYBOOK_SETUP.md))

앱 전용 런타임 의존(`vite` · `@tailwindcss/vite` 등)은 해당 앱에 둔다.

## 관련 문서

- [rules 03](03_PUBLISHING_AND_VERSIONING.md) — 배포·버전·엔트리 필드
- [rules 06](06_STORYBOOK_SETUP.md) — Storybook 구성
- [000 §3](../requirements/000_product_definition.md) — 왜 패키지를 4개로 나누는가
