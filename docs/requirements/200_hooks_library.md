# 200. `@txstack/hooks` (트랙 2)

- 로드맵: [ROADMAP](../ROADMAP.md) · 제품 정의: [000 §2-3](000_product_definition.md)
- 하위 트랙: [2-1 축소·재설계](../plans/201_hooks_reshape.md) · [2-2 문서](../plans/202_hooks_docs.md) · [2-3 고도화](../plans/203_hooks_advanced.md)
- **2026-08-19 재정의됨** — 훅 4종 → 2종, `useUrlQuery` API 대폭 축소

## 배경 / 목적

원본 3개 저장소의 실사용을 세어 보니 4종의 무게가 크게 달랐다.

| 훅                  | 원본 사용 | 처리     |
| ------------------- | --------- | -------- |
| `useUrlQuery`       | 35개 파일 | **유지** |
| `useStateForObject` | 35개 파일 | **유지** |
| `useObjectChanged`  | 4개 파일  | 제거     |
| `useSafePolling`    | 2개 파일  | 제거     |

두 훅이 해결하는 문제:

- **`useStateForObject`** — 객체 상태의 부분 갱신. `setObj({ ...obj, a: 10 })` 대신 `setObj({ a: 10 })`
- **`useUrlQuery`** — URL 쿼리(`?a=10&b=apple&c=true`)를 객체로 오가게 한다. `searchParams` 의 편의 버전

`useUrlQuery` 는 기성 대안(nuqs)이 있으나, **기본값 객체 하나로 타입까지 결정되는 간결함**과
**추가 의존 0** 이 트레이드오프가 된다. 근거는 [000 §2-3](000_product_definition.md).

## 범위

**포함** — 위 두 훅. `useUrlQuery` 는 `postParse` · `replace` · `encode` 세 옵션만 갖는다.

**제외** — 폴링 · 객체 변화 감지 · `queryTypes` · `urlKeys` · `afterParse`.

## 요구사항 (수용 기준)

| ID  | 요구사항                         | 수용 기준                                                                |
| --- | -------------------------------- | ------------------------------------------------------------------------ |
| H1  | 타입 회귀를 컴파일 타임에 잡는다 | 추론이 무너지면 `pnpm typecheck` 가 실패한다 (`useUrlQuery` 는 **완료**) |
| H2  | 추론이 한 곳에서만 일어난다      | 기본값이 1번 인자, 옵션은 `NoInfer` 로 감싼 2번 인자                     |
| H3  | 남은 옵션이 전부 검증된다        | `postParse` · `replace` · `encode` 에 테스트가 있다                      |
| H4  | 라우터 결합을 최소로 유지한다    | 루트 배럴은 `react-router-dom` 없이 동작한다 (**완료**)                  |
| H5  | 앱 가정이 없다                   | 전역 상태·특정 라우터 API 에 기대지 않는다                               |
| H6  | 훅을 문서에서 볼 수 있다         | 옵션·반환·주의점이 문서에 있고 예제가 실제로 동작한다                    |

## 영향 범위

- `packages/hooks` — 훅 2종 제거, `useUrlQuery` 시그니처 변경
- `apps/playground` 의 `/hooks` 화면
- 트랙 9-3(역이식): 원본 35개 호출부를 기계적으로 치환한다
- 배포물: 미배포라 소비자 마이그레이션은 없다. changeset 은 남긴다

## 제약 / 비고

- `react-router-dom` 은 **optional peer** 다. `@txstack/hooks/router` 서브패스에서만 쓴다.
  Next.js·TanStack Router 사용자도 이 패키지를 쓸 수 있어야 한다.
- `NoInfer` 사용으로 **TypeScript 5.4 이상**이 필요하다.
- 훅은 Storybook 에 컴포넌트로 올릴 수 없다. 문서 수단을 따로 정한다(2-2).
- **패키지를 나누지 않는다.** 의존 프로파일 차이는 subpath 로 이미 해결돼 있다.
