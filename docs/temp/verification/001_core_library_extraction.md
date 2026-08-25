# 001. core 4종 범용 React 라이브러리 추출 — 검증

- 관련 작업사항: [001 작업 계획](../plans/001_core_library_extraction.md)
- 관련 요구사항: [001 요구사항](../requirements/001_core_library_extraction.md)
- 수행일: 2026-08-19
- 범위: **P0~P3**. P4(npm 배포) 이후 항목은 미수행.

---

## 1. 수용 기준 매핑

| ID  | 요구사항                                    | 결과         | 근거                                                                                                                                 |
| --- | ------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | React 용 범용 라이브러리 (도메인 지식 없음) | ✅ 통과      | `packages/*/src` 에 도메인 용어(블랙/발송/컷팅/providerTag/messagegroup 등) 검색 결과 **0건**. 앱 전역 타입 의존도 제거 (§2-3)       |
| R2  | `core` 4종 이관                             | ✅ 통과      | tx-ui 컴포넌트 27종 **누락 0건**(3개 저장소 합집합 대조). hooks·route-meta·network 완료. 판정 근거는 계획서 §3                       |
| R3  | 가장 최신 파일 베이스                       | ✅ 통과      | 내용 diff 기반 3-way 판정표 = 계획서 §3-1 / §8-2. **git 날짜는 쓰지 않았다**(black-message 폴더 리네임으로 전 파일 날짜가 덮여 있음) |
| R4  | 4종 독립 배포 가능                          | ✅ 통과      | 각 `dist` 에 `@txstack/` 내부 import **0건**. `npm pack --dry-run` 4종 정상. peerDeps 분리                                           |
| R5  | sample/storybook 테스트 페이지              | ✅ 통과      | `apps/playground` 12화면. 브라우저 실동작 검증 = 계획서 §8-3                                                                         |
| R6  | `docs` · `CLAUDE.md` 이식                   | ✅ 통과      | V 모델 5개 폴더 + `CLAUDE.md` 재작성(백엔드/DB/배포/도메인 제거, 패키지 경계·Tailwind·배포 규약 추가). 계획서 §6                     |
| R7  | 기존 3개 저장소가 소비 가능                 | ⏸ **미수행** | 별도 요구사항 `002`(역이식)로 분리. Q5 에서 사용자 확정                                                                              |

---

## 2. 수행 절차 및 결과

### 2-1. 정적 검증 (재현 가능)

```sh
pnpm check    # lint + 5개 프로젝트 typecheck
pnpm build    # packages/* ESM + .d.ts
```

| 항목                     | 결과                                                           |
| ------------------------ | -------------------------------------------------------------- |
| `pnpm lint`              | ✅ 0 error / 0 warning                                         |
| `pnpm format:check`      | ✅ 통과                                                        |
| `pnpm -r typecheck`      | ✅ hooks / route-meta / network / ui / playground 5종          |
| `pnpm build`             | ✅ ESM + DTS 8건 (4패키지 × 2)                                 |
| `npm pack --dry-run`     | ✅ hooks 9.1kB / route-meta 7.5kB / network 8.5kB / ui 130.5kB |
| playground 프로덕션 빌드 | ✅ `vite build` 성공 (순환 import 없음)                        |

### 2-2. 번들 격리 (Q3 결정의 검증)

`packages/ui/dist` 의 실제 import 를 검사했다.

| 엔트리                 | 전이 의존                                                                    |
| ---------------------- | ---------------------------------------------------------------------------- |
| `index.js` + 공용 청크 | react · react-dom · react-router-dom · framer-motion · clsx · tailwind-merge |
| `aggrid.js`            | 위 + ag-grid-community · ag-grid-react                                       |
| `daypicker.js`         | 위 + react-day-picker · dayjs                                                |

**코어 엔트리에 ag-grid / react-day-picker / dayjs 0건.**

playground 프로덕션 청크로도 재확인: 코어 `index` 508KB / `AgGridPage` **1.2MB** / `DayPickerPage` 84KB. 코어 청크에 `AgGridReact`·`createGrid` 문자열 0건.

### 2-3. 동작 동치 검증 (lodash 제거분)

lodash 를 걷어낸 두 함수는 **black-message 의 실제 lodash 를 불러와 원본 구현과 출력을 대조**했다.

| 대상         | 대조 대상          | 케이스                                      | 결과         |
| ------------ | ------------------ | ------------------------------------------- | ------------ |
| `themeMerge` | `lodash.mergeWith` | merge/override × 9 + 경계 3 = 21건          | ✅ 전부 일치 |
| `orderByKey` | `lodash.orderBy`   | asc/desc × 8 = 16건 (undefined·null·안정성) | ✅ 전부 일치 |

`orderByKey` 는 playground `/ui/data` 에서 실제 헤더 클릭으로도 재확인:
desc `[∅, 3120000, 1250000, 840000]` / asc `[840000, 1250000, 3120000, ∅]`.

### 2-4. `@txstack/network` 동작 스모크

빌드된 `dist` 를 직접 import 해 10개 항목 통과 — unwrap 봉투 해제, `getToken` → Authorization 헤더, 401 → `onUnauthorized`, `parseApiError` 정규화, `getText` 의 unwrap 우회, 유틸 3종, 싱글턴 미초기화 시 명시적 throw.

playground `/network` 에서 브라우저로도 재확인: 봉투 해제, `Bearer demo-token` 서버 수신, 401 로그 적재.

### 2-5. 브라우저 수동 시나리오 (playground 12화면)

| 화면          | 확인 내용                                                                   |
| ------------- | --------------------------------------------------------------------------- |
| 전 화면       | 콘솔 에러 **0건**                                                           |
| 다크/라이트   | 토글 시 `html.dark` 와 배경색 동시 변경                                     |
| Tailwind      | `@source` 지정 상태에서 클래스 정상 적용                                    |
| `/route-meta` | 선언 14개 → 메뉴 노출 11개. `enabled:false`·`meta.hidden`·`index:true` 제외 |
| `/hooks`      | `?keyword=abc&page=3&onlyActive=true` → number/boolean 타입 변환 정확       |
| `/ui/aggrid`  | 3행 렌더, `valueFormatter` 적용(`1,250,000`)                                |
| `/ui/data`    | TxJsonTree 가 `0`/`false`/`""` 를 숨기지 않음                               |

---

## 3. 검증 과정에서 발견한 결함 (전부 수정 완료)

| #   | 결함                                                                                   | 발견 단계 |
| --- | -------------------------------------------------------------------------------------- | --------- |
| 1   | `TxCoolTable` 이 tx-ui 폴더 밖(`../../extensions`, 1000줄 앱 유틸)을 참조              | P2        |
| 2   | `TxSpinner`·`TxClipboardButton`·`TxInputLike` 가 default export 만 있어 배럴로 안 나감 | P3        |
| 3   | `TxDropdown` 이 `onChange*` 핸들러를 DOM 으로 유출 (React 경고)                        | P3        |
| 4   | playground `routes ↔ Shell` 순환 import                                                | P3        |
| 5   | `useStateForObject` JSDoc 이 옛 이름(`useUpdateState`)을 가리킴                        | P3 마무리 |

1·2·3 은 **원본 저장소에도 존재하는 결함**이다. 파일 경로로 직접 import 하던 앱 구조에서는 드러나지 않다가, 배럴이 유일한 진입점인 패키지로 바꾸면서 노출됐다.

---

## 4. 미수행 / 한계

- **R7(역이식)** 미수행 — 요구사항 `002` 로 분리.
- **npm publish 실검증 없음** — 실제 게시는 P4. `npm pack --dry-run` 까지만 확인했다.
- **자동화 테스트 없음** — 위 동치 검증은 일회성 스크립트로 수행했고 저장소에 테스트로 남기지 않았다. 회귀 방지가 필요하면 P5 에서 vitest 도입을 검토한다.
- **스크린샷 없음** — 브라우저 패널이 표시되지 않는 환경이라 DOM 조회·콘솔·페이지 텍스트로 검증했다.
- **소비자 환경 실검증 없음** — 외부 프로젝트에 설치해 Tailwind `@source` 유무에 따른 스타일 차이를 대조하는 것은 P4 항목이다.

---

## 5. 2차 검증 라운드 — V1 소비자 환경 실검증

- 수행일: 2026-08-19
- 배경: 위 §4 는 소비자 환경 실검증을 "P4(배포) 항목" 으로 미뤄뒀다. **이 판단은 틀렸다.**
  `npm pack` 산출물을 `file:` 프로토콜로 설치하면 publish 없이 소비자 환경을 그대로 재현할 수 있고,
  오히려 **배포 전에 해야** 의미가 있다. 배포 후 발견하면 되돌릴 수 없다.

### 5-1. 재현 방법

```sh
# 1) 4종 패킹
pnpm build
cd packages/ui && npm pack --pack-destination <OUT> && cd ../..   # hooks / route-meta / network 동일

# 2) 빈 Vite + React 19 + Tailwind v4 앱을 만들고 tgz 를 file: 로 설치
#    (pnpm 이 아니라 npm 으로 설치한다 — 워크스페이스 링크·pnpm 고유 호이스팅을 배제하기 위함)
npm i file:<OUT>/txstack-ui-0.0.0.tgz ...
```

검증 픽스처는 스크래치 디렉터리에 만들었고 저장소에는 남기지 않았다. 재현 자동화는 `001-2` 항목이다.

### 5-2. 결과

| #   | 검증 항목                                                      | 결과   | 근거                                                                                                    |
| --- | -------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| C1  | tarball 내용물                                                 | ✅     | 4종 모두 `dist` + `README` + `LICENSE` + `package.json` 만. `src`·`tsconfig`·`tsup.config` 유입 0건     |
| C2  | optional peer 미설치                                           | ✅     | `ag-grid-community` · `ag-grid-react` · `react-day-picker` · `dayjs` **자동 설치되지 않음**             |
| C3  | 필수 peer 자동 설치                                            | ✅     | `react` · `react-dom` · `react-router-dom` · `framer-motion` · `axios` + deps(`clsx`·`tailwind-merge`)  |
| C4  | 타입 해석 (`moduleResolution: bundler`, `skipLibCheck: false`) | ✅     | `tsc --noEmit` 통과. **타입 인자 없이** 4개 패키지 사용                                                 |
| C5  | 타입 해석 (`moduleResolution: node16`)                         | ✅     | `@txstack/hooks` 단독 픽스처에서 통과                                                                   |
| C6  | **R4 수용 기준** — `@txstack/hooks` 단독 설치                  | ✅     | tx-ui·react-router-dom 없이 설치·타입체크 통과                                                          |
| C7  | `@txstack/network` React 비의존                                | ✅     | react 미설치 Node 환경에서 스모크 8항목 통과 (unwrap·토큰주입·401·parseApiError·유틸3·싱글턴 throw)     |
| C8  | optional peer 없는 상태로 프로덕션 빌드                        | ✅     | `vite build` 성공. 번들에 ag-grid/day-picker 문자열 **0건**                                             |
| C9  | **Tailwind `@source` 유무 대조**                               | ✅     | 있음 **40,800 bytes** / 없음 **4,559 bytes**. `disabled\:opacity-50`·`dark\:hover\:bg-blue-700` 등 소실 |
| C10 | 서브패스 런타임 격리 (실제 설치본)                             | ✅     | 코어 청크 476.93kB(해당 문자열 0건) vs `Heavy` 청크 1,320.51kB                                          |
| C11 | 서브패스 CSS 격리                                              | ✅     | `rdp` 클래스가 코어 CSS 0건 / Heavy CSS 에만 존재 (8.08kB 별도 청크)                                    |
| C12 | CJS `require()`                                                | ⚠ 제약 | `ERR_PACKAGE_PATH_NOT_EXPORTED`. **ESM 전용**이며 문서에 명시가 없다 → `001-2`                          |

**C10 이 이번 라운드의 핵심이다.** playground 는 Vite alias 로 `@txstack/*` 를 소스에 연결하므로,
`exports` 필드를 통한 서브패스 런타임 해석은 지금까지 한 번도 검증된 적이 없었다. 실제 설치본으로 확인했다.

### 5-3. 발견한 결함

| #   | 결함                         | 심각도 | 상태                                          |
| --- | ---------------------------- | ------ | --------------------------------------------- |
| 6   | `useUrlQuery` 타입 추론 붕괴 | 높음   | ✅ 수정 완료 (changeset `tricky-hooks-infer`) |

`queryTypes` / `urlKeys` 가 제네릭 `T` 의 추론 후보라서, 타입 인자를 생략하면 `T` 가 `queryTypes` 의
키만으로 결정되고 값 타입이 전부 `unknown` 이 됐다. `defaults` 를 `Partial<T>` → `T` 로 바꾸고
나머지 옵션을 `NoInfer<T>` 로 감쌌다.

> **이 결함이 1차 검증을 통과한 이유** — playground 가 `useUrlQuery<IDemoQuery>` 로 타입 인자를
> 명시하고 있었다. 샘플 앱이 라이브러리를 "정답을 아는 사람" 처럼 쓰면 추론 결함이 가려진다.
> 소비자 픽스처는 타입 인자를 생략하는 등 **일부러 순진하게** 써야 한다.

### 5-4. 한계

- 브라우저 실렌더 확인은 이 라운드에서 하지 않았다 (V4 항목). 빌드 산출물 정적 분석까지다.
- 픽스처가 스크래치에만 있어 **재현이 수동**이다. 자동화는 `001-2`.
- npm registry 실게시는 여전히 미수행. `file:` 설치는 tarball 전개까지만 동일하고, registry 메타데이터·`publishConfig`·태그 동작은 포함하지 않는다.

---

## 6. 2차 검증 라운드 — V2 자동화 회귀 테스트

- 수행일: 2026-08-19
- 배경: §4 의 "**자동화 테스트 없음**" 을 해소한다. 1차의 동치 검증은 일회성 스크립트로 수행돼
  저장소에 남지 않았고, 따라서 **회귀를 잡을 수단이 0** 이었다.

### 6-1. 구성

vitest 3. 루트 `vitest.config.ts` 하나에서 두 프로젝트로 나눈다.

| 프로젝트 | 환경  | 대상                            | 이유                                                     |
| -------- | ----- | ------------------------------- | -------------------------------------------------------- |
| `node`   | node  | `ui` · `network` · `route-meta` | 순수 로직. **network 가 React 비의존이라는 사실을 유지** |
| `dom`    | jsdom | `hooks`                         | React 렌더가 필요 (`@testing-library/react`)             |

환경을 jsdom 으로 통일하지 않은 것은 의도적이다. 통일하면 `@txstack/network` 가 React 없이
동작한다는 설계 주장이 테스트에서 드러나지 않는다.

`pnpm check` 에 `pnpm test` 를 편입했다 — 이제 `check` 는 lint + typecheck + test 다.

### 6-2. 결과

| 대상                  | 파일                      | 테스트 | 내용                                                                   |
| --------------------- | ------------------------- | ------ | ---------------------------------------------------------------------- |
| `@txstack/ui`         | `src/tx-ui.utils.test.ts` | 12     | `themeMerge`(merge/override/중첩/불변) · `orderByKey`(nil 정렬) · `cm` |
| `@txstack/network`    | `src/client.test.ts`      | 17     | unwrap · 토큰 주입 · 401 · del params/body 분리 · 싱글턴 · 유틸 3종    |
| `@txstack/route-meta` | `src/utils.test.ts`       | 10     | 실행 계층 vs 네비게이션 계층의 **필터 규칙 차이**를 고정               |
| `@txstack/hooks`      | `src/hooks.test.tsx`      | 17     | 4개 훅 + **I1 회귀 방지(컴파일 타임)**                                 |
| **합계**              |                           | **56** | 전부 통과 (3.1s)                                                       |

- 배포 산출물 오염 없음 — `dist/*.js` 에 테스트 코드 0건, `npm pack --dry-run` 파일 목록에 `.test.` 0건.
- 테스트 의존(`vitest`·`jsdom`·`@testing-library/*`)은 루트 devDependencies 에 둔다. 배포되지 않으며
  패키지 `package.json` 을 오염시키지 않는다.

### 6-3. 테스트가 잡아낸 것

라이브러리 결함은 없었다. 다만 **테스트를 쓰는 과정에서 두 가지가 드러났다.**

| 항목                          | 성격        | 처리                                                                                                                                                                           |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `removeUndefined` 의 이름     | API 명확성  | 이름과 달리 **공백 문자열도 지운다**. JSDoc 에 명시된 의도된 동작이지만 이름이 동작보다 좁게 읽힌다 → `001-2` I6 개선 후보                                                     |
| `useSafePolling` 의 스킵 가드 | 테스트 작성 | `advanceTimersByTime(3000)` 으로 한 번에 감으면 tick 3회가 동기적으로 몰려 마이크로태스크가 flush 되지 않고, 2·3번째가 가드에 걸린다. 라이브러리는 정상 — 테스트 주석으로 기록 |

### 6-4. I1 회귀는 컴파일 타임에서 막는다

`useUrlQuery` 추론 결함(§5-3)의 회귀 테스트는 런타임 단언이 아니라 **타입 인자를 생략했다는 사실 자체**다.

```ts
const [query] = useUrlQuery({ defaults: { keyword: "", page: 1, onlyActive: false }, queryTypes: { page: "number" } });
const keyword: string = query.keyword; // 추론이 무너지면 여기서 tsc 가 깨진다
```

추론이 되돌아가면 `pnpm typecheck` 가 실패한다. 런타임 테스트로는 잡을 수 없는 종류의 회귀다.

### 6-5. 한계

- **커버리지 측정 없음.** 핵심 계약 위주로 썼고 전 컴포넌트를 덮지 않았다. `Tx*` 컴포넌트 렌더 테스트는 없다.
- `useUrlQuery` 의 `encode` 옵션, `TxCoolTable` 의 중첩 경로 유틸(`getNestedValue`·`setNestedValue`)은 미커버.
- 브라우저 실렌더는 여전히 V4 소관이다.

---

## 7. 2차 검증 라운드 — V4 playground 브라우저 재검증

- 수행일: 2026-08-19
- 환경: 이관된 PC(W:\Projects\txstack), Vite 7.3.6, `pnpm dev` → http://localhost:5310

### 7-1. 결과

12화면을 SPA 내비게이션으로 순회하며 렌더·콘솔을 확인했다.

| 항목                 | 결과                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| 12화면 렌더          | ✅ 전부 렌더. 콘솔 **에러 0건**                                                            |
| 다크모드             | ✅ 토글 시 `html.dark` 와 배경색 동시 변경 (`oklch(0.129 …)` ↔ `rgb(255,255,255)`), 복원됨 |
| 서브패스 지연로딩    | ✅ `ag-grid` · `react-day-picker` 가 해당 화면 진입 후에만 로드됨                          |
| route-meta 메뉴 파생 | ✅ 좌측 메뉴 12개. `/hidden`(meta.hidden) · `/disabled`(enabled:false) 제외 확인           |
| 콘솔 warning         | ⚠ `TxCoolTable` deprecated 경고 4회 — 의도된 경고지만 **매 렌더마다** 찍힌다 → `001-2` I8  |

### 7-2. 발견

`TxCoolTable` 의 deprecation 경고가 컴포넌트 **본문에서** `console.warn` 으로 호출된다
([TxCoolTable.tsx:66](../../packages/ui/src/TxCoolTable/TxCoolTable.tsx)). 렌더마다 실행되고
StrictMode 이중 렌더까지 겹쳐, 화면 하나에서 4회가 찍혔다. 소비자 콘솔을 오염시킨다.

### 7-3. 한계

- **스크린샷 없음** — 브라우저 패널이 표시되지 않는 환경이라 DOM·계산된 스타일·콘솔로 검증했다. 1차와 동일한 제약이다.
- 시각적 회귀(레이아웃 깨짐, 색 대비)는 이 방법으로 잡히지 않는다. 사람 눈 또는 스냅샷 도구가 필요하다.
- 상호작용은 다크모드 토글까지만 확인했다. 폼 제출·드롭다운 선택·모달 열기 등은 미확인.
