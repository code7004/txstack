# 007 · About 초안 (사이트 미반영)

> 사이트 `About` 에 들어갈 내용의 **초안과 구조**다. **저장소에서 확인할 수 있는 것만** 적었다.
> 경력 · 성과 수치 · 사용 사례처럼 확인할 수 없는 것은 맨 아래 **질문 목록**으로 뺐다.
> 공개 사이트에 올릴 때는 소비자 프로젝트 이름을 싣지 않는다(Home 의 `STORY` 와 같은 원칙).

각 문단 끝의 `근거` 는 그 내용을 확인한 자리다. 사이트에 옮길 때 지운다.

---

## 1. 어디서 시작했나

같은 UI 컴포넌트와 같은 HTTP(axios) 설정을 여러 서비스가 각자 복사해 쓰고 있었다. 고칠 일이 생기면
서비스마다 다시 고쳐야 했고, 복사본들은 조금씩 서로 달라졌다. 그래서 공통된 부분만 뽑아
**어느 서비스의 도메인도 모르는 라이브러리**로 분리했다. 판단 기준은 하나 — 다음 프로젝트가 설치만으로
그대로 쓸 수 있는가. 못 쓴다면 라이브러리가 아니라 앱 코드다.

근거: `docs/README.md` "왜 만드는가", `apps/site/src/pages/Home.tsx` 의 `STORY`

이전 구현(53개 커밋)은 `legacy` 브랜치에 보존되어 있고, 지금 코드는 그것을 **하나씩 열어 읽고 정리해
옮긴 것**이다. 옮기며 고친 결함은 각 컴포넌트 문서의 "이식하며 고친 것" 에 남아 있다
(예: 선언만 있고 읽지 않던 `colWidths`, 행 데이터를 복사해 순번을 심던 순번 열, UI 에 박혀 있던 백엔드 상한 `10000`).

근거: `CLAUDE.md` "프로젝트 개요", `docs/001_ui/015_TxAgGrid.md`

## 2. 왜 네 패키지인가

| 패키지                | 맡는 일                                                     | React      |
| --------------------- | ----------------------------------------------------------- | ---------- |
| `@txstack/ui`         | Tx\* 컴포넌트 49종. 스타일시트 한 줄, 디자인은 CSS 변수     | 필요       |
| `@txstack/route-meta` | 라우트를 메타데이터 트리 하나로 — 라우터 · 메뉴 · 현재 위치 | 필요       |
| `@txstack/hooks`      | 범용 훅 + URL 쿼리를 상태처럼                               | 필요       |
| `@txstack/axios`      | 정책을 주입받는 HTTP 클라이언트                             | **불필요** |

나눈 이유는 **필요한 것만 설치하게** 하기 위해서다. 의존 방향은 `ui → hooks` 하나만 허용하고,
`hooks` · `route-meta` · `axios` 는 서로를 import 하지 않는다. `axios` 는 React 를 모르므로 Node 스크립트에서도 쓴다.

근거: `docs/README.md` "4개 패키지" · "경계", 각 `packages/*/package.json` 의 `peerDependencies`

## 3. 라이브러리가 책임지는 것과 앱에 남긴 것

| 라이브러리가 한다                           | 앱이 정한다(옵션으로 넘긴다)                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| 토큰을 요청에 붙이는 일, 401 을 감지하는 일 | 토큰을 어디서 읽나(`getToken`), 401 에 무엇을 하나(`onUnauthorized`)          |
| 응답에서 본문을 꺼내는 자리                 | 응답 봉투의 모양(`unwrap`) — `{ body }` 인지 `{ data }` 인지                  |
| 오류를 한 형태로 읽는 함수(`parseApiError`) | 그 오류를 어디에 어떻게 보여 주나                                             |
| 요청 로그의 민감한 값 가리기                | 무엇을 가릴지(`maskFields`), 로그를 어디로 보낼지(`onRequest` · `onResponse`) |
| 메뉴에서 권한 없는 항목을 빼는 일           | 권한 판정(`getNavigableRoutes` 의 `canAccess`)                                |
| 쪽 번호 계산                                | 마지막 쪽의 상한(`maxPage`) — 서버만 아는 사정                                |
| 컴포넌트의 모양                             | 색 · 모서리 · 간격(`--tx-*` 토큰), 놓이는 자리(`className`)                   |

패키지는 앱의 전역(ambient) 타입이나 전역 변수, `import.meta.env` 를 읽지 않는다. 소비자 앱에는 그 전역이 없기 때문이다.

근거: `docs/README.md` "경계", `packages/axios/src/types.ts`, `packages/route-meta/src/utils.ts`,
`docs/001_ui/016_TxPagination.md`, `docs/001_ui/001_TxButton.md`

## 4. 설계 이유

**CSS 변수(토큰).** 컴포넌트 CSS 는 색을 직접 쓰지 않고 `--tx-*` 토큰만 참조한다. hover · pressed 색은
배경색에서 `color-mix` 로 계산하므로, 강조색 한 줄을 바꾸면 상태 색과 다크 모드가 따라온다. 다크 모드 분기는
토큰 파일 한 곳에만 있다. 이 사이트도 컴포넌트 CSS 를 한 줄도 덮어쓰지 않고 토큰만으로 디자인했다.
근거: `packages/ui/src/tokens.css`, `packages/ui/src/TxButton/TxButton.css`, `apps/site/src/theme.css`, 각 컴포넌트의 "CSS 계약" 테스트

**`@layer tx`.** 모든 컴포넌트 스타일이 `tx` 레이어 안에 있어서, 앱이 레이어 밖에 쓴 클래스나 Tailwind
유틸리티(`@layer theme, base, tx, components, utilities`)가 항상 이긴다.
근거: `packages/ui/src/styles.css`, `apps/site/src/tailwind.css`

**선택적 의존은 서브패스로.** 표(`ag-grid`)와 달력(`react-day-picker`)은 `@txstack/ui/aggrid` ·
`@txstack/ui/daypicker` 로 분리하고 optional peer 로 둔다. 루트에서 import 해도 그 둘은 로드되지 않는다.
근거: `packages/ui/package.json` 의 `exports` · `peerDependenciesMeta`, `packages/ui/src/daypicker.ts`

**라우트 메타데이터.** 라우트를 트리 하나로 선언하면 라우터 등록(`buildRouteObjects`) · 메뉴(`getNavigableRoutes`) ·
현재 위치(`useCurrentRouteNode`)가 모두 거기서 나온다. 메뉴와 라우트를 따로 고치다 어긋나는 일을 없앤다.
`meta` 는 라우터로 넘기지 않는다 — 정의와 실행을 나눈다.
근거: `packages/route-meta/src/index.ts`, `apps/site/src/routes.tsx`, `apps/demo/src/routes.tsx`

**URL 이 상태다.** `useUrlQuery` 는 기본값의 타입으로 주소의 값을 복원한다(`page: 1` 이면 `?page=2` 를 숫자로).
목록의 조건을 주소에 담아 새로고침 · 공유 · 뒤로 가기가 그대로 된다.
근거: `packages/hooks/src/useUrlQuery.ts`, `docs/003_hooks/002_useUrlQuery.md`

## 5. 어떻게 검증하나

- `pnpm check` — lint · 타입 검사 · 테스트(2026-10-15 기준 1,827개). CSS 는 jsdom 이 못 보므로 **CSS 파일을 글자로 읽어 계약을 검사**한다
- **이 문서 사이트가 첫 소비자다.** 주소창 · 새로고침 · 딥링크 · 진짜 요청은 테스트가 못 겪는다. 사이트를 만들며 드러난 결함과
  라이브러리 쪽 해결이 `docs/005_site.md` "만들며 드러난 것" 에 남아 있다(예: 서랍이 이동해도 안 닫힘, 동작 버튼 열을 붙일 길이 없음, 좁은 화면의 쪽 번호)
- **데모 앱(`apps/demo`)은 빌드된 패키지(`dist`)를 쓴다** — npm 에서 받은 것과 같은 모양으로 돈다

근거: `package.json` scripts, `docs/005_site.md`, `apps/demo/vite.config.ts`

## 6. 현재 한계와 계획

- **npm 에 아직 배포하지 않았다.** 네 패키지 모두 `0.1.0` 이고, 지금은 저장소에서 빌드한 `.tgz` 로 설치한다
- 배포 전에 정할 이름이 남아 있다 — `removeUndefined` · `isTokenExpired` 의 자리 · `IApiError` 의 `I` 접두사, `urlKeys` 로 읽은 키의 타입
- `hooks` 는 이전 구현의 훅 4개 중 2개만 옮겼다. 나머지는 쓸 자리가 생기면 옮긴다
- 지금 단계는 **기존 서비스에 적용해 완성도를 올리는 것**이고, npm 배포는 그 다음이다
- 영문 문서는 아직 없다

근거: `docs/README.md` "현재 상태" · "다음 할 일", `docs/006_adoption.md`

## 7. 직접 담당한 범위 — 확인 필요

저장소의 작업 규칙(`CLAUDE.md`)과 커밋 기록으로 확인되는 것은 이렇다.

- 개발에 **Claude Code(AI)** 를 함께 썼다. 커밋 다수에 `Co-Authored-By: Claude` 가 있다
- 규칙상 역할이 나뉘어 있다 — 전체 설계 합의 · **새 컴포넌트의 첫 구현** · 소비자 프로젝트에 적용하는 일 · 화면 확인은 사람이,
  같은 패턴의 반복 · 테스트 · 정리 · 문서는 AI 가 맡는다. 공개 API 형태는 예제 코드로 먼저 합의한다

**이 항목은 그대로 싣지 말고 아래 질문에 답한 뒤 쓴다.** 포트폴리오에서 가장 먼저 확인받는 부분이다.

---

## 질문 목록 — 저장소로 확인할 수 없는 것

**사람과 경력**

1. 이름 · 한 줄 소개(직무, 연차) · 사진 사용 여부 — `Profile.tsx` 의 `PROFILE`
2. 공개할 연락처와 링크(GitHub 외에 블로그 · 이메일 · LinkedIn 등)

**성과와 사용 사례**

3. txstack(또는 이전 구현)을 실제로 쓰는 서비스가 몇 개이고, 공개 사이트에 **어디까지 밝혀도 되는지**(이름 · 업종 · 규모)
4. 줄어든 코드 · 작업 시간 · 결함처럼 **수치로 말할 수 있는 성과**가 있는지, 있다면 측정 근거
5. 이전 구현(`legacy`)은 언제부터, 몇 개 서비스에서 쓰였는지

**직접 담당한 범위**

6. 설계 · 구현 · 테스트 · 문서 중 직접 한 것과 AI 와 함께 한 것을 About 에 **어떻게 밝힐지**(밝히는 수준과 문구)
7. 이전 구현(`legacy` 53개 커밋)은 혼자 만든 것인지, 팀 작업이었는지
8. 세 서비스에 적용하는 작업(`docs/006_adoption.md`)의 진행 정도 — 어디까지 끝났나

**계획**

9. npm 배포 목표 시점, 1.0 의 기준
10. 영문 문서를 언제 할지
