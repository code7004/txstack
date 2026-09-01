# 003 · `@txstack/hooks`

**의존이 거의 없는 범용 React 훅.**

`react` 만 있으면 되는 훅은 루트 배럴에, `react-router-dom` 이 필요한 훅은 `/router`
서브패스에 둔다. 루트를 라우터와 분리해야 Next.js · TanStack Router 를 쓰는 소비자도
이 패키지를 설치할 수 있다.

**이식 완료.** 각 장은 초안이 아니라 실제 공개 API 다.
저장소 전체의 상태와 다음 할 일은 [docs/README](../README.md) 가 갖는다.

## 진입점

| 진입점 | 내용 | 추가 peer |
| --- | --- | --- |
| `@txstack/hooks` | `useStateForObject` | 없음 |
| `@txstack/hooks/router` | `useUrlQuery` | `react-router-dom` |

## 개발 리스트

**2개가 끝났다. 테스트 25개.** 번호는 만든 차례다.

| 번호 | 훅 | 무엇 | 테스트 |
| --- | --- | --- | --- |
| 001 | [`useStateForObject`](001_useStateForObject.md) | 객체 상태를 부분 병합으로 다룬다 | 6 |
| 002 | [`useUrlQuery`](002_useUrlQuery.md) `/router` | URL 쿼리스트링을 화면 상태처럼 쓴다 | 19 |

## 가져오지 않은 것

- **`useObjectChanged`** — 객체가 바뀌면 바뀐 필드만 콜백으로 주던 훅
- **`useSafePolling`** — 이전 호출이 끝나기 전에 겹치지 않는 폴링

둘 다 temp 에 남아 있다. 필요해지면 그때 같은 방식으로 옮긴다.

## 검증

테스트 25개. `vitest` 의 `dom` 프로젝트(jsdom)에서 `MemoryRouter` 로 실제 주소 변화를
관찰한다. 무한 반복으로 이어지던 두 지점이 회귀 테스트로 박혀 있다 —
[002_useUrlQuery](002_useUrlQuery.md) 의 "정한 것 · 고친 것".

## 남은 것

- [ ] 훅이 두 개고 루트 배럴에는 하나뿐이다. 이대로 독립 패키지를 유지할지, 아니면
      `useStateForObject` 를 `ui` 로 넣고 `useUrlQuery` 만 남길지는 다시 본다
- [ ] `urlKeys` 로 읽은 키는 타입이 따라오지 않는다 — [002_useUrlQuery](002_useUrlQuery.md)

## 문서 규칙

- **훅 하나에 문서 하나.** 파일 이름은 `NNN_이름.md`, 번호는 만든 차례다
- **문서는 설명이 아니라 예제 코드로 쓴다.** 사용법 스니펫이 곧 API 합의서다
- **상태는 [docs/README](../README.md) 한 곳에만 쓴다**
