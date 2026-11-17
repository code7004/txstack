# CLAUDE.md

<프로젝트 한 줄 소개>.

## 개발 기준

이 프로젝트는 **`@txstack/dev-guide`** 를 따른다. 규칙은 설치된 버전에 있다 —
`node_modules/@txstack/dev-guide/llms.txt` (목차), `rules/` (스크립트 · 커밋 · 작업 공간 · 코드), `process/` (문서 프로세스 · AI 와 일하는 법).
dev-guide 와 다르게 하는 것은 [docs/rules/00_DEV_GUIDE_DIFF.md](docs/rules/00_DEV_GUIDE_DIFF.md) 에만 적는다.

## 시작하기

`CURRENT.md` → `docs/README.md` 순서로 읽는다. 지금 상태와 다음 할 일은 `CURRENT.md` 가 갖는다 — 이 문서에 상태를 쓰지 않는다.

## 이 프로젝트 고유의 것

- 앱: <apps/… — 역할>
- 도메인 규칙: <docs/rules/NN_… 링크>
- 배포: <docs/project/NN_… 링크>

## 검증 명령

```sh
pnpm check   # lint + typecheck + format:check (+ test)
pnpm build
```
