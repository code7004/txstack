# 커밋 · 브랜치

> 언제 보나: 커밋 · 브랜치 · 푸시 전에.

## 1. 커밋 메시지 — Conventional Commits + 한글

```text
<type>(<scope>): <무엇을 하는지 한 줄>

<왜 — 무엇이 문제였고 무엇을 골랐나. 필요할 때만>
```

```text
feat: TxDropdown 다중선택 지원
fix(hooks): useUrlQuery 가 주소 모양과 상관없이 선언한 타입을 지킨다
chore: txstack 을 link 대신 npm 배포본(^0.1.2)으로 설치한다
```

| type       | 언제                           |
| ---------- | ------------------------------ |
| `feat`     | 쓰는 사람에게 보이는 새 기능   |
| `fix`      | 결함 수정                      |
| `refactor` | 동작은 그대로, 구조만          |
| `docs`     | 문서만                         |
| `test`     | 테스트만                       |
| `chore`    | 의존성 · 설정 · 도구 · 버전    |
| `style`    | 포맷만 (`pnpm format` 결과 등) |

- **제목은 한글로, 무엇을 하는지 쓴다.** "수정" · "업데이트" 처럼 내용 없는 말을 쓰지 않는다
- `scope` 는 고르게 쓸 때만 — 모노레포의 패키지 · 앱 이름(`fix(hooks):`, `feat(dev):`)
- 본문은 **왜**를 쓴다. 무엇을 바꿨는지는 diff 가 갖는다
- commitlint 는 `@commitlint/config-conventional` 에 본문 줄 길이 제한을 끈다 — 표 · 목록 · 링크를 쓸 수 있게
- 제목은 200자까지 받는다(기본 100자). 짧을수록 좋지만, 한글 제목에 범위 · 대상까지 쓰면 100자는 빠듯하다

## 2. 커밋 단위

- **커밋 하나 = 작업 단위 하나.** 기능 하나 · 결함 하나. 계층별로 몰아서(모든 스크립트, 모든 문서) 커밋하지 않는다
- **저장소 둘을 한 일로 묶지 않는다.** 라이브러리와 그것을 쓰는 프로젝트는 각자 커밋한다
- 포맷만 바뀐 대량 변경은 따로 커밋한다 — 리뷰에서 내용 변경이 묻힌다
- 관련 없는 diff 는 담지 않는다. 남이 하던 변경을 되돌리지 않는다

## 3. 커밋 · 푸시 · 배포는 요청할 때만

**기본값은 "사람이 요청할 때만" 이다** — AI 가 스스로 커밋 · 푸시 · 배포 · `npm publish` 하지 않는다. 되돌리기 어렵기 때문이다.
프로젝트가 다르게 정하면(예: 검사가 통과하면 스스로 커밋 · 푸시) 그 결정과 날짜를 `docs/rules/00_DEV_GUIDE_DIFF.md` 에 적는다.

## 4. 브랜치

| 브랜치                                 | 쓰임                                    |
| -------------------------------------- | --------------------------------------- |
| `main`                                 | 배포되는 기준. 서버가 pull 하는 곳      |
| `feat/<짧은-이름>` · `fix/<짧은-이름>` | 여러 커밋에 걸치거나 검토가 필요한 작업 |

- 혼자 하는 작은 수정은 `main` 에 바로 커밋해도 된다. 서버가 `main` 을 pull 하면 **배포 전에 깨지지 않는 상태**만 올린다
- **로컬 경로(`link:` · `file:../..`)가 든 `package.json` · lockfile 을 `main` 에 올리지 않는다** — 서버의 `pnpm install --frozen-lockfile` 이 깨진다

## 5. 커밋 훅

`husky` + `lint-staged` 로 **스테이징한 파일만** `eslint --fix` · `prettier --write` 한다.

- 전체 검사(`pnpm check`)는 훅에 두지 않는다. 느리면 사람이 훅을 끈다
- 훅을 건너뛰지 않는다(`--no-verify` 금지). 훅이 실패하면 원인을 고친다

설정은 `@txstack/dev-guide/lint-staged` · `@txstack/dev-guide/commitlint` 프리셋을 쓴다 (README 「Config presets」). 훅 파일은 이렇게 둔다.

```sh
# .husky/pre-commit
pnpm lint-staged
```

```sh
# .husky/commit-msg
pnpm exec commitlint --edit "$1"
```
