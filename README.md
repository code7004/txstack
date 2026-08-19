# txstack

React 앱을 위한 범용 라이브러리 모음. UI 컴포넌트 · 훅 · 라우트 메타 · HTTP 클라이언트를 각각 독립 패키지로 배포한다.

| 패키지                                         | 설명                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| [`@txstack/ui`](./packages/ui)                 | `Tx*` UI 컴포넌트 (Tailwind v4 기반, 다크모드 지원)                  |
| [`@txstack/hooks`](./packages/hooks)           | 범용 React 훅 (`useUrlQuery`, `useStateForObject`, `useSafePolling`) |
| [`@txstack/route-meta`](./packages/route-meta) | 라우트 메타 정의 · 렌더러 · 네비게이션 파생                          |
| [`@txstack/network`](./packages/network)       | axios 기반 HTTP 클라이언트 (React 비의존)                            |

## 설치

```sh
pnpm add @txstack/ui @txstack/hooks @txstack/route-meta @txstack/network
```

`react` / `react-dom` / `react-router-dom` 는 peerDependency 다. 소비 앱에 이미 있어야 한다.

### ⚠ Tailwind v4 설정 (필수)

`@txstack/ui` 의 스타일은 Tailwind 클래스 문자열이다. **아래 `@source` 지정이 없으면 클래스가 purge 되어 스타일이 전혀 적용되지 않는다.**

```css
@import "tailwindcss";
@source "../node_modules/@txstack/ui/dist";
```

다크모드는 `dark:` variant(class 전략) 기준이다.

## 개발

```sh
pnpm i
pnpm dev      # playground 실행
pnpm check    # lint + typecheck
pnpm build    # packages/* 전체 빌드
```

## 문서

- 요구사항·계획·검증: [`docs/`](./docs)
- 작업 규약: [`CLAUDE.md`](./CLAUDE.md)

## 라이선스

MIT
