# 001. core 4종 범용 React 라이브러리 추출 — 작업 계획

- 관련 요구사항: [001 core 4종 범용 React 라이브러리 추출](../requirements/001_core_library_extraction.md)
- 상태: **P0~P3 완료 / P4(npm 배포) 대기**
- 작성일: 2026-08-19 (최종 갱신 2026-08-19)

---

## 1. 이름 / 저장소 결정

| 항목          | 결정                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| 폴더          | `C:\America\Sources\txstack`                                                  |
| npm scope     | `@txstack`                                                                    |
| 패키지        | `@txstack/ui` · `@txstack/hooks` · `@txstack/route-meta` · `@txstack/network` |
| git repo 이름 | `txstack`                                                                     |

**근거**

- 기존 컴포넌트 접두사가 `Tx*` 이므로 브랜드 연속성이 있다.
- npm 조회 결과 `txstack` / `@txstack/*` **모두 미사용** (2026-08-19 확인).
- 1순위 후보였던 `@txkit` 은 **이미 선점됨** (`@txkit/core`, `@txkit/react` — Web3 라이브러리). 사용 불가.
- `@tx-ui` 는 4개 중 하나가 tx-ui 라서 `@tx-ui/tx-ui` 가 되어 탈락.
- 대안(사내 브랜딩 선호 시): `@ai-carrot/*` 도 미사용. **2026-08-19 사용자가 `@txstack` 으로 확정.**

---

## 2. 요구사항 5번 답 — 별도 프로젝트 4개 vs 단일 모노레포

### 결론: **단일 pnpm 모노레포 + `packages/*` 4개 + `apps/playground` 1개**

npm 에는 **4개 패키지로 따로 배포**한다. "따로 배포"와 "따로 저장소"는 다른 문제이고, 저장소는 하나가 맞다.

**단일 모노레포 근거**

1. **패키지 간 의존이 실재한다.** `@txstack/ui` 는 `@txstack/hooks` 를 쓰고(TxForm/TxAgGrid 내부 상태), playground 는 4개를 동시에 쓴다. 저장소가 갈리면 `npm link` / `file:` 지옥이 되고, 한 줄 고칠 때마다 4번 publish 해야 검증된다.
2. **툴체인이 이미 루트 소유 구조다.** black-message 규약이 "ESLint/Prettier 설정은 루트가 소유" 인데, 저장소 4개면 이 규약이 4벌로 복제된다 — 지금 해결하려는 문제를 그대로 재생산한다.
3. **playground 가 4개를 한 화면에서 검증해야 한다** (R5). 저장소가 갈리면 playground 를 어디에 둘지가 즉시 문제가 된다.
4. **독립 버전은 changesets 로 이미 해결된다.** 한 저장소에서 패키지별로 다른 semver 를 매기고 개별 publish 하는 건 표준 워크플로다. 모노레포라고 버전이 묶이지 않는다.

**모노레포의 비용 (감수)**

- CI 에서 "바뀐 패키지만 빌드" 를 하려면 filter 설정이 필요하다 → `pnpm --filter` 로 처리, Phase 5.
- 저장소 하나가 커진다 → 현재 총 125 파일 수준이라 문제 없음.

### 최종 트리

```
txstack/
├── CLAUDE.md                     # black-message 에서 이식 후 재작성
├── package.json                  # private:true, 루트 워크스페이스
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.js              # 루트 소유
├── prettier.config.js            # 루트 소유
├── commitlint.config.mjs
├── .changeset/
├── docs/                         # V 모델 (requirements/plans/verification/reports/rules)
├── packages/
│   ├── hooks/                    # @txstack/hooks
│   ├── route-meta/               # @txstack/route-meta
│   ├── network/                  # @txstack/network
│   └── ui/                       # @txstack/ui
└── apps/
    └── playground/               # Vite 샘플 앱 (배포 X, private)
```

---

## 3. 소스 3-way 비교 결과 (R3 근거)

측정 방법: CRLF·따옴표 스타일 정규화 후 `diff -w`. 저장소별 최종 커밋 = black-message `2026-08-18` / usertics `2026-08-14` / chain-wallet-service `2026-06-21`.

> **주의**: git 커밋 날짜는 신뢰할 수 없다. black-message 는 2026-08-07 에 `@core → core` 폴더 리네임(ecb8423)이 있어 **모든 파일의 커밋 날짜가 그날로 덮여 있다**. 그래서 날짜가 아니라 **내용 diff** 로 판정했다.

### 3-1. tx-ui — 베이스: **black-message**, 단 3건은 usertics 에서 흡수

| 컴포넌트                                                                                                                                                    | BM~UT diff | BM~CW diff | 판정                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- | ----------------------------------------------------------------- |
| `TxContextMenu`                                                                                                                                             | UT 전용    | 없음       | **usertics 에서 신규 편입** (4파일/164L)                          |
| `TxDayPicker`                                                                                                                                               | 89줄       | 10줄       | **usertics 우세** (386L vs BM 329L) — 수동 병합 필요              |
| `TxDropMenu`                                                                                                                                                | 30줄       | 8줄        | **usertics 우세** (213L vs BM 193L) — 수동 병합 필요              |
| `TxDropdown`                                                                                                                                                | 10줄       | **224줄**  | BM 채택. 단 CW 가 694L 로 더 큼 → **CW 쪽 추가분 수동 확인 필요** |
| `TxAgGrid`                                                                                                                                                  | 17줄       | 187줄      | BM 채택 (670L, 최신 기능 포함)                                    |
| `TxToolTip`                                                                                                                                                 | 0줄        | 105줄      | BM 채택 (132L vs CW 91L)                                          |
| `TxCoolTable`                                                                                                                                               | 5줄        | 38줄       | BM 채택                                                           |
| `TxInput`                                                                                                                                                   | 12줄       | 35줄       | BM 채택                                                           |
| `TxTextarea`                                                                                                                                                | 5줄        | 23줄       | BM 채택                                                           |
| `TxButton`                                                                                                                                                  | 12줄       | 6줄        | BM 채택 (diff 내용 확인 후)                                       |
| `TxLayout` `TxForm` `TxCard` `TxCheckBox` `TxSlidePanel` `TxTabs` `TxHeader` `TxIcons` `TxTheme` `TxFlex` `TxSpinner` `TxCapsLockCheck` `TxClipboardButton` | 0줄        | 소폭       | **BM = UT 동일**. 그대로 이관                                     |

- chain-wallet-service 와의 diff 대부분은 **prettier `singleQuote` 차이일 뿐** 실내용 차이가 아니다. 위 표는 따옴표 정규화 후 수치다.
- **tx-ui 는 `@/` 별칭 import 가 0건**이다. 외부 import 는 전부 npm 패키지(react, react-dom, react-router-dom, ag-grid-\*, framer-motion, react-day-picker, dayjs, lodash, clsx, tailwind-merge). → **패키지화 장애물 없음.**

### 3-2. hooks — 베이스: **black-message + chain-wallet-service 병합**

| 파일                                               | 출처                                                    |
| -------------------------------------------------- | ------------------------------------------------------- |
| `useUrlQuery`                                      | black-message (253L, 최신)                              |
| `useStateForObject`                                | black-message (76L)                                     |
| `useSafePolling`                                   | **chain-wallet-service 전용** → 편입                    |
| `index.ts`                                         | chain-wallet-service 형태(배럴) 채택                    |
| `useObjectChanged`                                 | **usertics `@core/hooks` 에서 편입** (아래 판정 참고)   |
| `useCurrentRoute` `useObjectDiff` `useUpdateState` | usertics `@core` 레거시 → **제외**. 판정 근거는 아래 표 |

**usertics `@core/hooks` 4종 최종 판정** (2026-08-19, 원본 대조 후 결정 — 계획서의 "사용처 확인 후 판단" 항목을 닫음)

| 훅                 | usertics 사용처 | 판정                                                                                                                                                                                                                                                                            |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useObjectChanged` | 4곳             | ✅ **편입.** 바뀐 필드만 콜백으로 넘기는 범용 훅. lodash `isEqual` 을 자체 `deepEqual` 로 대체하고, 인라인 콜백에도 effect 가 헛돌지 않게 `callbackRef` 적용                                                                                                                    |
| `useUpdateState`   | 4곳             | ❌ **제외.** `useStateForObject` 의 전신이다 — 병합·shallowEqual 로직이 동일하고, black-message 판이 `postParse` 를 더 갖는다. 잃는 기능은 "다음 상태 동기 반환" 하나인데, setState 업데이터 안에서 바깥 변수에 대입하는 방식이라 StrictMode 이중 호출에 취약해 계승하지 않았다 |
| `useCurrentRoute`  | 5곳             | ❌ **제외.** `route-meta` 의 `useCurrentRouteNode` 가 상위호환이다 — 타입이 `RouteTree` 로 잡혀 있고, 부모 경로 누적(`normalizePath`)과 wildcard fallback 이 있다. usertics 판은 `Record<string, any>` 에 그 둘이 없다                                                          |
| `useObjectDiff`    | 0곳             | ❌ **제외.** 사용처가 없고, `prev.current` 를 렌더 중에 읽으면서 갱신은 `useEffect` 에서 하는 구조라 반환값이 신뢰할 수 없다                                                                                                                                                    |

### 3-3. route-meta — 베이스: **black-message**

- black-message 와 chain-wallet-service 가 `hooks/index/renderer/types/utils` **완전 동일** (각 102/36/23/57/94L).
- black-message 에만 `README.md`(171L)가 있다 → 그대로 이식해 패키지 README 기반으로 쓴다.
- usertics 에는 없음.

### 3-4. network — 베이스: **chain-wallet-service 구조 + black-message 의미론** (⚠ 유일한 재설계 대상)

| 항목          | black-message `http.ts` (29L)                 | chain-wallet-service `api.*` (326L)        |
| ------------- | --------------------------------------------- | ------------------------------------------ |
| 인스턴스      | **전역 `axios` 직접 사용**                    | `initAxios(baseURL)` / `getAxios()` 팩토리 |
| 인터셉터      | 앱 쪽 `core/ExAxios` 가 소유 (패키지 밖)      | `attachInterceptors()` 로 패키지 내부 소유 |
| 응답 처리     | 공통 봉투 `res.data.body` 언랩                | `res.data` 그대로                          |
| 타입          | **전역(ambient) `IAxiosResponse<T>` 에 의존** | `api.types.ts` 로 자립                     |
| 파일 다운로드 | `getBlob` / `getText` 보유                    | 없음                                       |

**문제**: black-message 판은 라이브러리로 못 쓴다. (a) 전역 axios 싱글턴 강제, (b) 앱 전역 타입 `IAxiosResponse` 참조, (c) 인증/401 로직이 패키지 밖(`ExAxios`)에 있음.

**설계 방향**

```ts
// 자립형 인스턴스 (CW 구조)
const api = createHttpClient({
  baseURL: "/api",
  withCredentials: true,
  getToken: () => sessionStorage.getItem("token"), // 인증 주입을 옵션으로
  onUnauthorized: () => store.dispatch(logout()), // 401 처리를 옵션으로
  unwrap: (res) => res.data.body // 봉투 해제를 옵션으로 (기본값: res.data)
});

api.get<T>() / post / put / patch / del / getBlob / getText;
```

- 전역 싱글턴은 **하위호환용 `initAxios`/`getAxios` 로만 남기고**, 기본 API 는 인스턴스 기반으로 한다.
- 봉투 언랩은 `unwrap` 옵션으로 뽑아 서비스마다 다른 응답 규약을 흡수한다.
- `@txstack/network` 는 **React 비의존** (axios 만) 으로 유지한다.

---

## 4. 패키지 설계

### 4-1. 의존 방향 (순환 금지)

```
@txstack/network         → (axios)                    React 무관
@txstack/hooks           → (react)
@txstack/hooks/router    → (react, react-router-dom)  ← 서브패스
@txstack/route-meta      → (react, react-router-dom)
@txstack/ui              → @txstack/hooks + npm deps
```

- `ui → hooks` 만 내부 의존을 허용한다. 나머지 3개는 서로 참조하지 않는다.
- `workspace:*` 로 개발하고, publish 시 changesets 가 실제 버전으로 치환한다.

> **P1 에서 계획과 달라진 점 — `hooks` 의 라우터 분리**
> 착수 시점에 `useUrlQuery` 가 `react-router-dom` 의 `useSearchParams` 를 쓴다는 걸 확인했다.
> 위 표대로 `hooks → (react)` 만으로는 성립하지 않는다.
> 그래서 루트 배럴(`@txstack/hooks`)은 react 전용(`useStateForObject`, `useSafePolling`)으로 두고,
> `useUrlQuery` 는 **`@txstack/hooks/router` 서브패스**로 분리했다. `react-router-dom` 은 optional peer 다.
> Q3 에서 승인된 subpath 원칙을 그대로 적용한 것이며, Next.js·TanStack Router 사용자도
> `@txstack/hooks` 를 설치할 수 있게 된다.

### 4-2. peerDependencies 원칙

`react`, `react-dom`, `react-router-dom`, `ag-grid-community`, `ag-grid-react` 는 **전부 peerDependencies**.
(소비 앱에 이미 있고, 중복 설치되면 hooks/Context 가 깨진다.)

### 4-3. ⚠ `@txstack/ui` 의존성 비대 문제 — subpath exports 로 분리

현재 tx-ui 를 통째로 배포하면 `ag-grid-community` + `ag-grid-react` + `framer-motion` + `react-day-picker` + `dayjs` + `lodash` 가 전부 딸려온다. TxButton 하나 쓰려는 소비자에게 과한 비용이고, ag-grid 는 라이선스 계층까지 얽힌다.

**대응**

```jsonc
"exports": {
  ".":           "./dist/index.js",       // 경량 코어 (grid/daypicker 제외)
  "./aggrid":    "./dist/aggrid.js",      // ag-grid 를 optional peer 로
  "./daypicker": "./dist/daypicker.js",   // react-day-picker 를 optional peer 로
  "./styles.css": "./dist/styles.css"
}
```

- `peerDependenciesMeta` 에 `optional: true` 지정.
- `lodash` 는 tx-ui 전체에서 **import 2건뿐** → 네이티브로 치환해 의존성 제거.
- `dayjs` 는 TxDayPicker/TxAgGrid 포맷에만 쓰임 → subpath 쪽으로 몰아넣는다.

### 4-4. ⚠ Tailwind v4 소비자 요구사항 (놓치기 쉬운 함정)

tx-ui 테마는 런타임 CSS 가 아니라 **Tailwind 클래스 문자열**이다. 소비 앱의 Tailwind 가 `node_modules` 안의 dist 를 스캔하지 않으면 **클래스가 전부 purge 되어 스타일이 안 먹는다.**

- 소비자 CSS 에 `@source "../node_modules/@txstack/ui/dist";` 를 요구하고, README 최상단에 명시한다.
- `dark:` variant 를 쓰므로 다크모드 전략(class 기반)도 문서화한다.
- 대안(장기): 빌드 시 클래스를 실제 CSS 로 뽑아 `styles.css` 를 동봉 → Phase 5 검토. 초기엔 `@source` 방식으로 간다.

### 4-5. 빌드 / 배포 툴체인

| 항목        | 선택                                                                        |
| ----------- | --------------------------------------------------------------------------- |
| 번들러      | `tsup` (4개 패키지 공통, esbuild + dts)                                     |
| 포맷        | **ESM only** (`"type": "module"`), React 19 전제                            |
| 타입        | `dts: true`, 각 패키지 `tsconfig.json` 은 루트 base 상속                    |
| 버전/배포   | `changesets` → `pnpm changeset` / `changeset version` / `changeset publish` |
| 접근        | scoped 패키지이므로 `--access public` 필수                                  |
| sideEffects | `false` (CSS 동봉 시 해당 파일만 예외)                                      |

---

## 5. 요구사항 6번 답 — sample / storybook 형태

### 결론: **playground 앱 먼저(필수), Storybook 은 v0.1.0 이후 판단(선택)**

**Phase 3 (필수) — `apps/playground`**

- Vite + React 19 + Tailwind v4 단일 앱. `private: true`, npm 배포 안 함.
- **4개 패키지를 서로 물려서 dogfooding 한다**:
  - `@txstack/route-meta` 가 playground 자체의 네비게이션을 구성 → route-meta 가 곧 샘플이자 테스트
  - `@txstack/network` 로 mock API 호출 섹션 (로딩/에러/401/blob 다운로드 시나리오)
  - `@txstack/hooks` 는 `useUrlQuery` 로 탭 상태를 URL 에 유지 (usertics 스토리북이 이미 이 패턴)
  - `@txstack/ui` 컴포넌트 카탈로그
- **시드 코드 존재**: usertics `src/core/tx-ui-storybook/` 에 이미 7개 스토리 파일(index, AgGrid, Button, Dropdown, Form, Input, Json)이 있다. 이걸 이식해 출발점으로 쓴다.
- **이식 시 제거할 것**: 현 스토리북은 `redux` 의존(`darkMode` 상태)과 `@/store`, `@/config/RouteData` 를 참조한다. → 로컬 state + `TxTheme` 로 치환해 앱 종속을 끊는다.
- 미커버 컴포넌트(TxCard/TxCoolTable/TxLayout/TxModal/TxSlidePanel/TxTabs/TxToolTip/TxContextMenu 등)는 신규 작성.

**Phase 5 (선택) — Storybook 9**

- 장점: 컴포넌트별 문서·a11y·시각 회귀, npm 소비자용 공개 문서 사이트.
- 비용: 설정 + 스토리 40여 개 작성 + CI. playground 와 내용이 상당 부분 중복된다.
- **판단 기준**: 외부(사내 밖) 소비자가 생기거나 컴포넌트 수가 더 늘면 도입. v0.1.0 시점엔 과투자.

---

## 6. 요구사항 7번 답 — docs / CLAUDE.md 이식 계획

black-message 가 최신이므로 그쪽을 원본으로 하되, **그대로 복사하면 안 된다** (도메인·서버·DB 내용이 절반 이상).

### 6-1. `CLAUDE.md`

| 유지                                                             | 삭제                               | 신규                            |
| ---------------------------------------------------------------- | ---------------------------------- | ------------------------------- |
| pnpm 전용 / Node 24.14.0 / pnpm>=10                              | 백엔드·DB·마이그레이션 전 항목     | 패키지 경계 규칙 (의존 방향)    |
| 커밋·푸시는 사용자 요청 시에만                                   | EC2 배포·`deploy-ec2.sh`·서버 주소 | npm 배포 절차 (changesets)      |
| Conventional Commits + 한글                                      | `messages` 대용량 도메인 가드레일  | peerDeps / subpath exports 규칙 |
| ESLint/Prettier 루트 소유                                        | 파일컷팅·번호집계 등 도메인 규약   | Tailwind v4 소비자 요구사항     |
| V 모델 docs 구조 (rules/requirements/plans/verification/reports) | `docs/temp`                        | breaking change 판정 기준       |
| 구현 순서 원칙 (UX 먼저 → 승인 → 구현)                           | —                                  | —                               |

### 6-2. `docs/`

- 폴더 5종 스켈레톤 + `docs/rules/README.md` 인덱스 이식. **(스켈레톤 생성 완료)**
- 이식할 rules: `19_FRONTEND_ROLE_SEPARATION_GUIDE` (이 라이브러리의 설계 근거 문서), `02_MONOREPO_STRUCTURE` (재작성).
- 이식하지 않을 rules: `04`, `09`~`18`, `20` (백엔드/DB/배포/도메인).
- 신규 rules 예정: `01_PACKAGE_BOUNDARIES`, `02_MONOREPO_STRUCTURE`, `03_PUBLISHING_AND_VERSIONING`, `04_TX_UI_CONVENTIONS` (theme/`themeMerge`/`cm`/`data-tag` 패턴), `05_TAILWIND_V4_CONSUMER_SETUP`.
- `route-meta/README.md`(171L) 와 `tx-ui/ReadMe.md` 는 각 패키지 README 로 승격.

---

## 7. 작업 항목 (Phase)

| Phase     | 내용                                                                                                                        | 산출물                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **P0** ✅ | 저장소 스캐폴딩: git init, pnpm workspace, tsconfig.base, eslint/prettier/commitlint/husky, changesets, CLAUDE.md·docs 이식 | **완료** — 루트 툴체인 동작, `pnpm lint`·`format:check` 통과        |
| **P1** ✅ | 무의존 3종 이관: `hooks` / `route-meta` / `network`. network 는 §3-4 대로 재설계                                            | **완료** — 3개 패키지 빌드 + `.d.ts` + `npm pack` dry-run OK (§8-1) |
| **P2** ✅ | `ui` 이관: black-message 베이스 + usertics 3건 병합(§3-1) + peerDeps/subpath 분리 + lodash 제거                             | **완료** — 3엔트리 빌드 OK, optional peer 격리 검증, 130.5kB (§8-2) |
| **P3** ✅ | `apps/playground`: usertics 스토리북 이식 + 앱 종속 제거 + 미커버 컴포넌트 스토리 추가 + 4패키지 dogfooding                 | **완료** — 12개 화면, 브라우저 실동작 검증 (§8-3)                   |
| **P4**    | npm 배포 `v0.1.0`: scope 등록, `--access public`, README/LICENSE, 외부 프로젝트에서 설치 검증                               | npm 4개 패키지 게시, 설치 스모크 테스트 통과                        |
| **P5**    | (선택) Storybook 9, GitHub Actions CI, Tailwind 사전 컴파일 CSS                                                             | 별도 요구사항으로 분리                                              |
| **P6**    | (별도 요구사항) 원본 3개 저장소 역이식 — `src/core` 삭제 → npm 의존으로 전환                                                | 요구사항 R7. **본 계획 범위 밖**                                    |

---

## 8. 검증 방법

| 대상       | 검증                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 전체       | `pnpm lint` / `pnpm typecheck` (전 패키지 `tsc --noEmit`)                                  |
| 각 패키지  | `pnpm build` 후 `dist/*.js` + `dist/*.d.ts` 생성 확인, `npm pack --dry-run` 파일 목록 확인 |
| 의존 방향  | `hooks`/`route-meta`/`network` 의 `dist` 에 `@txstack/` import 가 0건인지 grep 확인        |
| peerDeps   | 빈 Vite 앱에 `pnpm add @txstack/ui` 만 설치 → ag-grid 미설치 상태에서 TxButton 렌더 확인   |
| Tailwind   | 소비 앱에서 `@source` 지정 전/후 스타일 적용 여부 대조                                     |
| playground | 4개 섹션(UI/Hooks/RouteMeta/Network) 수동 시나리오. 다크모드 토글, URL 쿼리 유지 확인      |
| 회귀       | black-message 의 실제 화면 1개를 playground 에 복제해 동일 렌더 확인 (P2 종료 시)          |

### 8-1. P0 · P1 검증 결과 (2026-08-19 수행)

| 항목                 | 결과                                                                                                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm i`             | ✅ 경고 0건 (peer 경고 해소를 위해 `@types/node` 추가)                                                                                                                                                                             |
| `pnpm lint`          | ✅ 통과                                                                                                                                                                                                                            |
| `pnpm format:check`  | ✅ 통과                                                                                                                                                                                                                            |
| `pnpm -r typecheck`  | ✅ hooks / route-meta / network 3종 통과                                                                                                                                                                                           |
| `pnpm build`         | ✅ 3종 ESM + `.d.ts` 생성                                                                                                                                                                                                          |
| 내부 의존 유출       | ✅ 3종 dist 에 `@txstack/` import 0건 (network 의 2건은 에러 메시지 문자열)                                                                                                                                                        |
| peer external 유지   | ✅ dist import 가 `react` / `react-router-dom` / `axios` 바레 스펙만 남음 — 번들에 포함되지 않음                                                                                                                                   |
| Vite 종속 제거       | ✅ `import.meta.env` / `VITE_` 잔존 0건 (주석 설명 제외)                                                                                                                                                                           |
| `npm pack --dry-run` | ✅ hooks 9.1kB / route-meta 7.5kB / network 8.5kB. `dist` + `README.md` + `LICENSE` 만 포함                                                                                                                                        |
| network 동작 스모크  | ✅ 빌드된 dist 를 직접 import 해 10개 항목 통과 — unwrap 봉투 해제, `getToken` → Authorization 헤더 주입, 401 → `onUnauthorized` 호출, `parseApiError` 정규화, `getText` 는 unwrap 우회, 유틸 3종, 싱글턴 미초기화 시 명시적 throw |

**P1 에서 발견해 고친 것 (원본 그대로 옮겼다면 깨졌을 것들)**

1. `import.meta.env.VITE_API_DEBUG` — Vite 전용. 소비자가 Next.js/Node/Jest 면 깨진다 → `debug` 옵션으로 주입.
2. `window.location.origin` — SSR/Node 에서 `window` 없음 → 폴백 origin 처리.
3. 인증 헤더·401 처리가 패키지 밖(`ExAxios`)에 있던 것 → `getToken` / `onUnauthorized` 옵션으로 편입.
4. 전역 ambient `IAxiosResponse` 의존 → `unwrap` 옵션 + 자체 타입 export.
5. `GetTableQueryDto` — 앱 도메인 타입이라 제외.

### 8-2. P2 검증 결과 (2026-08-19 수행)

| 항목                          | 결과                                                                                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                  | ✅ lint + 4개 패키지 typecheck 통과                                                                                                                                                    |
| `pnpm build`                  | ✅ `@txstack/ui` 3개 엔트리(index/aggrid/daypicker) + 공용 청크 + `.d.ts`                                                                                                              |
| **optional peer 격리 (핵심)** | ✅ 코어 진입점(`index.js` + 공용 청크)의 전이 의존이 `react` `react-dom` `react-router-dom` `framer-motion` `clsx` `tailwind-merge` **뿐**. ag-grid / react-day-picker / dayjs **0건** |
| 서브패스 의존                 | ✅ `aggrid.js` → ag-grid-community·ag-grid-react / `daypicker.js` → react-day-picker·dayjs                                                                                             |
| 코드 중복                     | ✅ `splitting: true` 로 공용 청크(111KB) 1벌. 서브패스가 코어를 복제하지 않음                                                                                                          |
| `npm pack --dry-run`          | ✅ 130.5kB / 16 파일 (`dist` + `README.md` + `LICENSE`)                                                                                                                                |
| **`themeMerge` 동치 검증**    | ✅ lodash `mergeWith` 실물과 대조. merge/override × 9 케이스 + 경계 3건 = **21건 전부 일치**. base 미변형 확인                                                                         |
| **`orderByKey` 동치 검증**    | ✅ lodash `orderBy` 실물과 대조. asc/desc × 8 케이스 = **16건 전부 일치** (undefined/null 위치, 정렬 안정성 포함)                                                                      |

**3-way 병합 최종 판정** (§3-1 계획 대비)

| 대상                                     | 판정                                                                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `TxContextMenu`                          | ✅ usertics 에서 신규 편입 (계획대로)                                                                                                   |
| `TxDayPickerRange` + `TxDayPicker.types` | ✅ usertics 채택 — `onSubmit`/`onSubmitNums` 확정 플로우와 render-prop `header` 추가                                                    |
| `TxDropMenu`                             | ✅ usertics 채택 — hover 닫힘에 120ms 유예 (트리거→패널로 마우스가 이동하는 중에 닫히던 문제)                                           |
| `TxDropdown`                             | ❌ **BM 유지.** CW 가 24줄 더 길지만 전부 JSDoc 주석이고, 실제로는 BM 에만 `onSubmitInternal`/`onCloseInternal` 확정·취소 플로우가 있다 |
| `TxButton.theme`                         | ❌ BM 유지 — usertics 판은 프로젝트 취향 팔레트이고 `dark:` variant 를 잃었다                                                           |
| `TxAgGrid`                               | ❌ BM 유지 — `QuartzDarkBlue` 테마가 BM 에만 있다                                                                                       |
| `TxModal`                                | ❌ BM 유지 — `containerClassName`/`bodyClassName` 이 BM 에만 있다                                                                       |
| `TxLoading`                              | ❌ BM 유지 — usertics 판(`text != undefined`)은 로딩이 안 꺼지는 버그. BM 주석에 그 이력이 남아 있다                                    |
| `TxJsonTree`                             | ❌ BM 유지 — usertics 의 `if (!value) return <></>` 는 `0`/`false`/`""` 를 숨긴다                                                       |
| `TxInput` (`id=` 하드코딩)               | ❌ 거부 — 라이브러리에서 DOM id 고정은 중복 렌더 시 id 충돌                                                                             |
| `*.types.ts`                             | ❌ BM 유지 — `verbatimModuleSyntax` 상 `import type` 필요                                                                               |

**P2 에서 발견해 고친 것**

1. **`TxCoolTable` 이 tx-ui 폴더 밖을 참조**하고 있었다 (`../../extensions` → 1000줄짜리 앱 유틸). 필요한 `createCSS`/`shortUID` 두 개만 `tx-ui.dom.ts` 로 내부 이관. → 계획 §3-1 의 "`@/` 별칭 import 0건" 은 맞았지만 **상대경로 탈출은 놓쳤던 항목**이다.
2. `lodash` 제거 — `themeMerge`(mergeWith), `TxCoolTable`(difference/orderBy). 위 표대로 동치 검증.
3. `dayjs` 제거 (코어) — `TxDropdown.utils.numberToPeriod` 를 네이티브 `Date` 로. dayjs 는 daypicker 서브패스에만 남는다.
4. 원본 오타 `TxDayPickekRange` → `TxDayPickerRange` 로 정정, 기존 이름은 `@deprecated` 별칭 유지.

**P2 에서 발생한 공개 API 변경** (소비자 마이그레이션 필요)

| 변경                                                             | 이유                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `TxForm.DayPicker` → `TxFormDayPicker` (`@txstack/ui/daypicker`) | 코어 배럴이 `react-day-picker` 를 import 하면 optional peer 가 성립 불가 |
| `TxForm.DayPickerRange` → `TxFormDayPickerRange`                 | 위와 동일                                                                |
| `TxAgGrid` → `@txstack/ui/aggrid`                                | Q3 승인 사항                                                             |

### 8-3. P3 검증 결과 (2026-08-19 수행, 브라우저 실동작)

`apps/playground` — Vite + React 19 + Tailwind v4, 12개 화면. usertics `core/tx-ui-storybook` 7파일을 시드로 쓰되 redux·`@/store`·`$t` 등 앱 종속을 전부 제거했다.

| 항목                          | 결과                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                  | ✅ lint + 5개 프로젝트 typecheck 통과                                                                                                         |
| 프로덕션 빌드                 | ✅ `vite build` 성공                                                                                                                          |
| Tailwind `@source`            | ✅ 지정 시 스타일 적용. 다크/라이트 토글 시 `html.dark` 와 배경색이 함께 바뀜                                                                 |
| **서브패스 격리 (프로덕션)**  | ✅ 청크 분리 확인 — 코어 `index` 508KB / `AgGridPage` **1.2MB** / `DayPickerPage` 84KB. 코어 청크에 `AgGridReact`·`createGrid` **0건**        |
| route-meta                    | ✅ "선언 14개 → 메뉴 노출 11개". `enabled:false` / `meta.hidden` / `index:true` 가 정확히 제외됨                                              |
| hooks `useUrlQuery`           | ✅ `?keyword=abc&page=3&onlyActive=true` → `{keyword:"abc", page:3(number), onlyActive:true(boolean)}` 타입 변환 정확                         |
| network                       | ✅ 봉투 해제(`body` 안쪽만), 토큰 주입(`Bearer demo-token`이 서버 수신 헤더로 확인), 401 → `onUnauthorized` 로그 적재, `parseApiError` 정규화 |
| TxAgGrid                      | ✅ 3행 렌더, `valueFormatter` 적용(`1,250,000`)                                                                                               |
| **TxCoolTable 정렬 (실동작)** | ✅ desc `[∅, 3120000, 1250000, 840000]` / asc `[840000, 1250000, 3120000, ∅]` — lodash `orderBy` 의 null 위치 규칙과 일치                     |
| 콘솔 에러                     | ✅ 전 화면 0건                                                                                                                                |

**P3 에서 발견해 고친 것 (3건 모두 실제 결함)**

1. **`TxSpinner` / `TxClipboardButton` / `TxInputLike` 가 패키지에서 접근 불가였다.** default export 만 있는데 배럴이 `export *` 만 해서 실려 나가지 않았다. 원본에서는 소비자가 `@/core/tx-ui/TxSpinner` 처럼 파일 경로로 직접 import 해서 드러나지 않던 문제다. 배럴에 이름 붙여 재export.
2. **`TxDropdown` 이 `onChangeText`/`onChangeNumb`/`onChangeValue` 를 DOM 으로 흘렸다.** `TxDropdownBase` 가 `...props` 를 `<div>` 에 spread 해서 React 가 "Unknown event handler property" 경고를 냈다. `TxDropdownMulti` 는 원래 핸들러를 분리하고 있었고 단일 쪽만 빠져 있었다. 같은 패턴으로 수정.
3. **playground 의 `routes ↔ Shell` 순환 import.** HMR 진입 순서에 따라 `Cannot access 'Shell' before initialization` 로 깨졌다. 페이지 트리를 `menu.tsx` 로 분리하고, 하위 페이지에는 `Outlet context` 로 트리를 내려 해소.

**P3 에서 확인된 소비자 요구사항 (README 반영)**

- **ag-grid 모듈 등록은 소비 앱 책임이다.** `ModuleRegistry.registerModules([AllCommunityModule])` 를 빠뜨리면 그리드가 빈 화면으로 뜬다(ag-grid error #272). 라이브러리가 대신 등록하면 필요한 모듈만 고르거나 enterprise 를 쓰는 선택지를 뺏으므로 문서화로 처리했다.
- **`useTxAgGridOption` 은 라이브러리에 넣지 않았다.** 원본(usertics)의 그 훅은 도메인 필드명(`roi`, `referral`, `uptimeSec`)과 앱 컴포넌트(`TableFieldUsername`)를 하드코딩하고 URL 쿼리를 읽는다. playground 는 `option` 을 평범한 객체로 직접 만든다.
- **playground 는 `@txstack/*` 를 소스로 alias 한다.** 없으면 `dist` 를 소비해 라이브러리 한 줄 수정마다 빌드+재시작이 필요하다(tsup 청크 해시 변경으로 Vite 모듈 그래프가 깨짐). 배포 계약은 `tsc` 가 `exports` → `dist/*.d.ts` 로 해석하므로 그대로 검증된다.

---

## 9. 결정 사항 (2026-08-19 사용자 확정)

| #   | 질문                                                                               | 결정                                                    |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Q1  | npm scope 를 `@txstack` 으로 확정할지, 사내 브랜딩 `@ai-carrot` 으로 갈지          | ✅ **`@txstack` 확정**                                  |
| Q2  | npm **public** 배포인지 **private**(유료) 인지                                     | ✅ **public + `alpha` 태그로 시작** (`--access public`) |
| Q3  | `@txstack/ui` 에서 ag-grid / react-day-picker 를 subpath 로 분리하는 데 동의하는지 | ✅ **분리** (§4-3)                                      |
| Q4  | network 를 §3-4 대로 재설계(전역 axios 제거)하는 데 동의하는지                     | ✅ **재설계** (§3-4)                                    |
| Q5  | P6(원본 저장소 역이식)까지 이번에 볼지, 별도 요구사항으로 뺄지                     | 별도 요구사항 `002` 로 분리 (기본안 유지)               |
| Q6  | git remote(GitHub org/repo) 를 어디에 둘지                                         | 🔄 진행 중 — 저장소 이름은 **`txstack`** (§9-1)         |

### 9-1. 저장소 / 레지스트리 이름 정리

`@txstack` 과 `txstack` 은 **서로 다른 곳에 등록하는 다른 이름**이다.

| 대상          | 이름                 | 비고                                                                                              |
| ------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| GitHub 저장소 | `txstack`            | `@` 와 `/` 는 저장소 이름에 못 쓴다. 로컬 폴더명과 동일하게 맞춘다                                |
| npm scope     | `@txstack`           | npmjs.com 에서 **org 또는 사용자명 `txstack`** 을 별도로 만들어야 한다. 공개 패키지용 org 는 무료 |
| 패키지        | `@txstack/ui` 외 3종 | scope 소유자만 publish 할 수 있다                                                                 |

- npm org 는 P4(배포) 전까지만 있으면 된다. 지금 만들 필요는 없다.
- remote 가 정해지면 각 `package.json` 에 `repository` 필드를 추가한다. 현재는 비어 있다.

---

## 10. 리스크

| 리스크                                                       | 영향 | 대응                                                                  |
| ------------------------------------------------------------ | ---- | --------------------------------------------------------------------- |
| Tailwind purge 로 소비자 스타일 미적용                       | 高   | README 최상단 `@source` 명시 + P4 스모크 테스트 항목에 포함           |
| tx-ui 3-way 병합 시 회귀 (TxDayPicker/TxDropMenu/TxDropdown) | 中   | 해당 3건은 diff 를 눈으로 읽고 병합. playground 에 회귀 시나리오 작성 |
| `TxAgGrid` 가 ag-grid 35.x 메이저에 강결합                   | 中   | peerDeps 범위를 넓히지 말고 `^35` 로 고정, 별도 subpath 로 격리       |
| 원본 3개 저장소가 계속 각자 수정되어 다시 갈라짐             | 中   | P4 직후 P6(역이식)을 빠르게 붙인다. 지연될수록 병합 비용 증가         |
| ESM only 로 CJS 소비자 배제                                  | 低   | 소비처가 전부 Vite+ESM. 요청 시 tsup `format: ["esm","cjs"]` 로 확장  |
