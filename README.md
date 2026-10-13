# txstack

여러 프로젝트에서 재사용할 수 있는 범용 React 라이브러리 세트.

| 패키지                                       | 역할                                          | React |
| -------------------------------------------- | --------------------------------------------- | ----- |
| [`@txstack/ui`](packages/ui)                 | Tx\* UI 컴포넌트                              | O     |
| [`@txstack/route-meta`](packages/route-meta) | 라우트를 메타데이터 트리로 관리               | O     |
| [`@txstack/hooks`](packages/hooks)           | 범용 React 훅 + URL 쿼리 상태                 | O     |
| [`@txstack/axios`](packages/axios)           | axios 래퍼 — 인증·에러·봉투 정책을 주입받는다 | **X** |

**아직 npm 에 배포되지 않았다.** 네 패키지 모두 구현은 끝났고, 기존 프로젝트에 적용하며 다듬는 중이다.

문서는 [`docs/README.md`](docs/README.md) 에서 시작한다 — 무엇을 만드는지, 어디까지 왔는지,
다음에 뭘 할 차례인지가 거기 있다.

## 개발

```sh
pnpm install
pnpm check     # lint + typecheck + test
pnpm build     # packages/* 전체 빌드

pnpm storybook:dev   # 컴포넌트 카탈로그
pnpm site:dev        # 소개 사이트 — 가이드 · 예제 · API
```

Node `24.14.0` · pnpm `>=10.0.0`. **pnpm 만 사용한다.**

## 라이선스

MIT
