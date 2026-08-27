# txstack

여러 프로젝트에서 재사용할 수 있는 범용 React 라이브러리 세트.

| 패키지                | 역할                                          | React |
| --------------------- | --------------------------------------------- | ----- |
| `@txstack/ui`         | Tx\* UI 컴포넌트                              | O     |
| `@txstack/route-meta` | 라우트를 메타데이터 트리로 관리               | O     |
| `@txstack/hooks`      | 범용 React 훅 + URL 쿼리 상태                 | O     |
| `@txstack/network`    | axios 래퍼 — 인증·에러·봉투 정책을 주입받는다 | **X** |

**아직 npm 에 배포되지 않았다.** 4개 패키지 모두 구현 이식 중이다.

문서는 [`docs/README.md`](docs/README.md) 에서 시작한다 — 무엇을 만드는지, 어디까지 왔는지,
다음에 뭘 할 차례인지가 거기 있다.

## 개발

```sh
pnpm install
pnpm check     # lint + typecheck + test
pnpm build     # packages/* 전체 빌드
```

Node `24.14.0` · pnpm `>=10.0.0`. **pnpm 만 사용한다.**

## 라이선스

MIT
