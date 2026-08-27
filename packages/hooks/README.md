# @txstack/hooks

의존이 거의 없는 범용 React 훅.

| 진입점                  | 내용                      | 추가 peer 의존     |
| ----------------------- | ------------------------- | ------------------ |
| `@txstack/hooks`        | `react` 만 있으면 되는 훅 | 없음               |
| `@txstack/hooks/router` | URL 쿼리를 상태처럼       | `react-router-dom` |

루트를 라우터와 분리해야 Next.js·TanStack Router 를 쓰는 소비자도 설치할 수 있다.

> **아직 배포되지 않았다.** 구현을 이식 중이다. 공개 API 초안은 [docs/003_hooks.md](../../docs/003_hooks.md).

```sh
pnpm add @txstack/hooks react
```
