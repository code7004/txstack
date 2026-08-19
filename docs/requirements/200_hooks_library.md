# 200. `@txstack/hooks` (트랙 2)

- 로드맵: [ROADMAP](../ROADMAP.md)
- 하위 트랙: [2-1 기본](../plans/201_hooks_basics.md) · [2-2 문서](../plans/202_hooks_docs.md) · [2-3 고도화](../plans/203_hooks_advanced.md)

## 배경 / 목적

훅 4종 — `useUrlQuery` · `useStateForObject` · `useSafePolling` · `useObjectChanged`.
가장 작은 패키지지만 **가장 많이 쓰일 가능성이 높다.** React 만 있으면 되고 UI 취향을 강요하지 않는다.

`useUrlQuery` 에서 타입 추론 붕괴 결함이 이미 한 번 나왔다(2026-08-19 수정). 훅은 타입이 곧 API 라서,
**타입 수준 회귀가 런타임 테스트로 안 잡힌다**는 점이 이 패키지의 특성이다.

## 요구사항 (수용 기준)

| ID  | 요구사항                         | 수용 기준                                                    |
| --- | -------------------------------- | ------------------------------------------------------------ |
| H1  | 타입 회귀를 컴파일 타임에 잡는다 | 추론이 무너지면 `pnpm typecheck` 가 실패한다 (일부 **완료**) |
| H2  | 옵션이 전부 검증된다             | `encode` 등 미커버 옵션에 테스트가 있다                      |
| H3  | 훅을 문서에서 볼 수 있다         | 각 훅의 옵션·반환·주의점이 문서에 있고 예제가 동작한다       |
| H4  | 라우터 결합을 최소로 유지한다    | 루트 배럴은 `react-router-dom` 없이 동작한다 (**완료**)      |
| H5  | 앱 가정이 없다                   | 전역 상태·특정 라우터 API 에 기대지 않는다                   |

## 영향 범위

- `packages/hooks` 전체
- `apps/playground` 의 `/hooks` 화면
- 배포물: 타입만 바뀌어도 공개 API 다 — changeset 필수

## 제약 / 비고

- `react-router-dom` 은 **optional peer** 다. `@txstack/hooks/router` 서브패스에서만 쓴다.
  Next.js·TanStack Router 사용자도 이 패키지를 쓸 수 있어야 한다.
- `NoInfer` 사용으로 **TypeScript 5.4 이상**이 필요하다. 하한을 올릴 때는 rules 03 을 갱신한다.
- 훅은 Storybook 에 컴포넌트로 올릴 수 없다. 문서 수단을 따로 정해야 한다(2-2 에서 판단).
