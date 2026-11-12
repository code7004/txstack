# txstack

여러 프로젝트에서 재사용할 수 있는 범용 React 라이브러리 세트.

| 패키지                                       | 역할                                          | React |
| -------------------------------------------- | --------------------------------------------- | ----- |
| [`@txstack/ui`](packages/ui)                 | Tx\* UI 컴포넌트                              | O     |
| [`@txstack/route-meta`](packages/route-meta) | 라우트를 메타데이터 트리로 관리               | O     |
| [`@txstack/hooks`](packages/hooks)           | 범용 React 훅 + URL 쿼리 상태                 | O     |
| [`@txstack/axios`](packages/axios)           | axios 래퍼 — 인증·에러·봉투 정책을 주입받는다 | **X** |
| [`@txstack/fns`](packages/fns)               | 작은 함수 모음 — 포맷 · 날짜 · 폼 · 전화번호  | **X** |

React 관리 화면을 빠르게 만들기 위해, 실제 서비스 세 곳에 복사돼 있던 반복 코드를 독립 패키지로 정리했다.
다섯 패키지 모두 npm 에 배포되어 있고, 서비스 세 곳이 운영 환경에서 쓰고 있다.

```sh
pnpm add @txstack/ui   # 필요한 패키지만 골라 설치한다
```

- **가이드 · 예제 · API** — <https://code7004.github.io/txstack/>
- **컴포넌트 카탈로그(Storybook)** — <https://code7004.github.io/txstack/storybook/>
- **개발 문서** — [`docs/README.md`](docs/README.md). 무엇을 만드는지, 어디까지 왔는지, 다음에 뭘 할 차례인지가 거기 있다.

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
