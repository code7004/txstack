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
