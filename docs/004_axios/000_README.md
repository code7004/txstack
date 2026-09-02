# 004 · `@txstack/axios`

**axios 래퍼. 인증 · 에러 · 응답봉투 · 로깅 정책을 옵션으로 주입받는다.**

React 를 모른다. 훅도 컨텍스트도 없다. Node 스크립트에서도 그대로 돌아간다.
`axios >=1.6` 은 peerDependency 다.

**이식 완료.** 각 장은 초안이 아니라 실제 공개 API 다.
저장소 전체의 상태와 다음 할 일은 [docs/README](../README.md) 가 갖는다.

## 무엇을 해결하는가

세 프로젝트가 각자 axios 인스턴스를 만들면서 매번 같은 것을 다시 짰다 —
Authorization 헤더 붙이기, 401 이면 로그아웃, `res.data.body` 벗기기, 개발 중 요청 로그.

문제는 그 네 가지가 **프로젝트마다 조금씩 다르다**는 것이다. 봉투 모양이 다르고, 401 처리도 다르다.
그래서 이 패키지는 **그 정책들을 결정하지 않는다. 주입받는다.**

## 진입점

| 진입점 | 내용 |
| --- | --- |
| `@txstack/axios` | `createHttpClient` · `attachInterceptors` · 유틸 |
| `@txstack/axios/singleton` | `initHttpClient` 계열 — **권장하지 않는다** |

## 개발 리스트

**5개가 끝났다. 테스트 31개.** 번호는 만들고 쓰는 차례다.

| 번호 | 무엇 | 하는 일 | 테스트 |
| --- | --- | --- | --- |
| 001 | [`createHttpClient`](001_createHttpClient.md) | 클라이언트를 만든다 — 정책 주입이 전부 여기 | 15 |
| 002 | [`HttpClient`](002_HttpClient.md) | 요청을 보낸다 — `get` · `post` · `getBlob` … | ↑ |
| 003 | [로깅](003_logging.md) | 요청·응답을 콘솔 밖으로. 가릴 것은 가리고 | 5 |
| 004 | [싱글턴 서브패스](004_singleton.md) | 옮겨오는 동안의 호환 계층 | 4 |
| 005 | [유틸과 타입](005_utils.md) | `parseApiError` 계열 순수 함수와 공개 타입 | 4 |

## 이식하며 고친 것

원본 659줄을 그대로 옮기지 않았다. **경계 규칙 위반 3건**(쿠키 기본값 · 콘솔 오염 ·
Node 미지원)과 **동작 결함 1건**(FormData 업로드가 깨짐)이 나왔다. 자세한 것은 각 장의
"정한 것 · 고친 것" 이 갖는다.

| 무엇 | 어디 |
| --- | --- |
| `withCredentials` 기본값 · `Content-Type` 고정 · 콘솔 오염 · `IApiResponse` | [001](001_createHttpClient.md) |
| `getBlob` 이 Node 에서 안 돌던 것 · `del()` → `delete()` | [002](002_HttpClient.md) |
| `debug` 가 수집 불가였던 것 · `params` 마스킹 | [003](003_logging.md) |
| 싱글턴이 루트 배럴에 있던 것 · 재호출 시 옵션을 버리던 것 | [004](004_singleton.md) |

## 검증

테스트 31개. 원본 18개를 옮기고 위 변경분을 덮는 11개를 더했다.
`vitest` 의 `node` 프로젝트에서 돈다 — **React 없이 도는 것이 테스트로 증명된다.**

## 남은 것

- [ ] `removeUndefined` 의 이름 · `isTokenExpired` 의 자리 · `IApiError` 의 `I` 접두사 —
      [005_utils](005_utils.md)

## 문서 규칙

- **공개 API 한 덩이에 문서 하나.** 파일 이름은 `NNN_이름.md`, 번호는 쓰는 차례다
- **문서는 설명이 아니라 예제 코드로 쓴다.** 사용법 스니펫이 곧 API 합의서다
- **상태는 [docs/README](../README.md) 한 곳에만 쓴다**
