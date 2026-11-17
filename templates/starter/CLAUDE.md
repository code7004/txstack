# CLAUDE.md

<프로젝트 한 줄 소개>.

## 개발 기준

이 프로젝트는 **`@txstack/dev-guide`** 를 따른다. 규칙은 설치된 버전에 있다 —
`node_modules/@txstack/dev-guide/llms.txt` (목차), `rules/` (스크립트 · 커밋 · 작업 공간 · 용어 · 코드), `process/` (문서 프로세스 · AI 와 일하는 법).
dev-guide 와 다르게 하는 것은 [docs/rules/00_DEV_GUIDE_DIFF.md](docs/rules/00_DEV_GUIDE_DIFF.md) 에만 적는다.

## UI 는 txstack 을 먼저 쓴다

이 프로젝트의 UI 컴포넌트는 `@txstack/ui` 다. 화면 요소를 만들기 전에 txstack 가이드를 읽는다.
가이드는 설치된 버전과 같다 — `apps/frontend/node_modules/@txstack/ui/ai/rules.md` (규칙 · 결정표),
`apps/frontend/node_modules/@txstack/ui/ai/llms.txt` (컴포넌트 목록), 컴포넌트 한 장은 `apps/frontend/node_modules/@txstack/ui/ai/docs/001_ui/`.

- 버튼 · 입력 · collapsible · 카드 · tag · 모달 · 토스트 · 드롭다운 · GNB · app shell 은 **Tx\* 컴포넌트를 쓴다.**
  `<button>` · `<details>` · 손으로 짠 모달 · 토스트 · 드롭다운 · 카드를 만들지 않는다
- 컴포넌트를 쓰기 전에 그 컴포넌트 문서 한 장을 읽는다
- 겉모습은 `--tx-*` 토큰으로 바꾼다. 컴포넌트 CSS(`.tx-*`)를 덮지 않고 `!important` 를 쓰지 않는다
- 컴포넌트가 못 하는 것만 직접 만들고, 그 자리에 `// txstack-gap: <무엇> — <이유>` 를 남긴다
- eslint `react/forbid-elements` 경고를 끌 때는 이유를 같이 적는다

## 시작하기

`CURRENT.md` → `docs/README.md` 순서로 읽는다. 지금 상태와 다음 할 일은 `CURRENT.md` 가 갖는다 — 이 문서에 상태를 쓰지 않는다.

## 이 프로젝트 고유의 것

- 앱: `apps/frontend` — 화면 (Vite · React · Tailwind · `@txstack/ui`), `apps/backend` — API (NestJS)
- 도메인 규칙: <docs/rules/NN_… 링크>
- 배포: <docs/project/NN_… 링크>

## 검증 명령

```sh
pnpm check   # lint + typecheck + format:check (+ test)
pnpm build
```
