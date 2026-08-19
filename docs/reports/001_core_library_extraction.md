# 001. core 4종 범용 React 라이브러리 추출 — 산출물 / 인수인계

- 관련 문서: [요구사항](../requirements/001_core_library_extraction.md) · [작업 계획](../plans/001_core_library_extraction.md) · [검증](../verification/001_core_library_extraction.md)
- 상태: **P0~P3 완료 / P4(npm 배포) 대기**
- 최종 작업일: 2026-08-19

> **다른 PC에서 이어받는 경우 이 문서부터 읽으면 된다.** 아래 §5(이어받는 법)와 §6(미결 사항)이 핵심이다.

---

## 1. 무엇을 만들었나

`black-message` / `usertics` / `chain-wallet-service` 세 저장소가 각자 복사본으로 들고 있던 `src/core` 를
하나로 합쳐 **npm 배포 가능한 React 라이브러리 4종**으로 만들었다.

| 패키지                | 내용                                                                        | 크기(pack) |
| --------------------- | --------------------------------------------------------------------------- | ---------- |
| `@txstack/ui`         | `Tx*` 컴포넌트 27종 (Tailwind v4, 다크모드)                                 | 130.5kB    |
| `@txstack/hooks`      | `useUrlQuery` · `useStateForObject` · `useSafePolling` · `useObjectChanged` | 9.1kB      |
| `@txstack/route-meta` | 라우트 정의에서 라우터·GNB 를 함께 파생                                     | 7.5kB      |
| `@txstack/network`    | axios 클라이언트 (React 비의존)                                             | 8.5kB      |

추가로 `apps/playground` — 4개 패키지를 서로 물려 검증하는 샘플 앱 12화면 (배포하지 않음).

### 엔트리 구조

```
@txstack/ui              코어 (ag-grid / react-day-picker 로드 안 함)
@txstack/ui/aggrid       TxAgGrid          — optional peer: ag-grid-community, ag-grid-react
@txstack/ui/daypicker    TxDayPicker 계열   — optional peer: react-day-picker, dayjs
@txstack/hooks           react 만 필요
@txstack/hooks/router    useUrlQuery       — optional peer: react-router-dom
```

---

## 2. 주요 설계 결정 (사용자 확정)

| 항목                         | 결정                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| 저장소 구조                  | **단일 pnpm 모노레포**. npm 에는 4개로 따로 배포 (changesets)  |
| npm scope                    | `@txstack` — `@txkit` 은 npm 선점됨(Web3 lib)                  |
| GitHub 저장소 이름           | `txstack` (`@` 는 저장소 이름에 못 쓴다)                       |
| 배포                         | public + `alpha` 태그로 시작                                   |
| 무거운 의존                  | subpath 로 분리 + `peerDependenciesMeta.optional`              |
| `@txstack/network`           | 전역 axios 제거 후 재설계 — 인증·401·봉투해제를 전부 옵션 주입 |
| 역이식(원본 3개 저장소 전환) | 별도 요구사항 `002` 로 분리                                    |

---

## 3. 검증 결과 (요약)

전부 통과. 상세는 [검증 문서](../verification/001_core_library_extraction.md).

- `pnpm check` (lint + 5개 프로젝트 typecheck) / `pnpm build` / `npm pack --dry-run`
- **번들 격리** — 코어 엔트리에 ag-grid·react-day-picker·dayjs **0건**. playground 프로덕션 청크: 코어 508KB vs AgGridPage 1.2MB
- **lodash 제거 동치** — `themeMerge`(21건) · `orderByKey`(16건) 를 실제 lodash 와 대조해 전부 일치
- **브라우저 실동작** — 12화면 콘솔 에러 0건, network 옵션 주입·route-meta 필터링·URL 쿼리 타입변환 확인

### 이관 중 발견해 고친 결함 5건

원본에도 있던 결함 3건 포함. 목록은 검증 문서 §3.

---

## 4. 배포 상태

**npm 미배포.** npm 에는 아무것도 올라가지 않았다. git 은 `github.com/code7004/txstack` 에 초기 커밋 + `.gitattributes` 커밋까지 push 완료 (2026-08-19).

원본 3개 저장소는 **읽기만 했고 수정하지 않았다.**

---

## 5. 다른 PC에서 이어받는 법

### 5-1. 환경 준비

전송 시 `node_modules`(304MB, pnpm 심볼릭 링크 407개)와 `.git` 은 제외한다. 나머지는 1.8MB 다.

**`git init` 을 `pnpm i` 보다 먼저** 해야 한다. `pnpm i` 가 `prepare: husky` 를 실행하는데 git 저장소가 없으면 훅 설치가 실패한다.

```sh
git init -b main
pnpm i          # Node 24.14.0 / pnpm >=10 필요
pnpm check      # 통과하면 이관 정상
pnpm dev        # playground → http://localhost:5310
```

### 5-2. 첫 커밋

commitlint(husky)가 Conventional Commits + 한글을 검사한다.

```sh
git add .
git commit -m "feat: txstack 라이브러리 초기 구성 (ui/hooks/route-meta/network + playground)"
```

### 5-3. Claude 가 읽어야 할 순서

1. `CLAUDE.md` — 작업 규약 (패키지 경계, Tailwind 제약, 배포 절차)
2. 이 문서 §6 — 미결 사항
3. `docs/plans/001_core_library_extraction.md` — Phase 표(P0~P6), 3-way 병합 판정 근거, 검증 결과
4. `docs/verification/001_core_library_extraction.md` — 수용 기준 매핑, 발견 결함

---

## 6. 미결 사항 (이어서 할 일)

### 6-1. 결정 사항 · 남은 사용자 작업

| 항목                       | 내용                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`TxForm.DayPicker` API** | ✅ **확정(2026-08-19) — 현행 subpath 분리 유지.** `@txstack/ui/daypicker` 의 `TxFormDayPicker` / `TxFormDayPickerRange` 를 쓴다. 코어 통합을 택하지 않은 결정적 이유는 설치 용량(4.1MB)이 아니라 `TxDayPicker` 가 `react-day-picker/dist/style.css` 를 import 한다는 점이다 — 코어에 넣으면 버튼 하나만 쓰는 소비자의 번들러도 node_modules CSS import 를 처리할 수 있어야 한다. 프로덕션 청크는 84KB 로 ag-grid(1.2MB)만큼 무겁지 않으므로, 번들 크기만으로는 분리 근거가 약하다는 점도 함께 기록해 둔다. 대안 C(서브패스에서 `TxForm` 확장 재export)는 breaking 이 아니므로 002 이식 중 호출부 부담이 크면 그때 추가할 수 있다 |
| git remote                 | ✅ 완료 — `https://github.com/code7004/txstack.git`. 4개 패키지 + 루트 `package.json` 에 `repository`(+`directory`)·`homepage`·`bugs` 반영                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| npm org                    | ⬜ **남음** — npmjs.com 에 org(또는 사용자명) **`txstack`** 생성 필요. P4 배포 직전까지만 있으면 된다                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

### 6-2. 다음 Phase

- **P4 — npm 배포 v0.1.0-alpha**
  1. npm org `txstack` 생성 · `npm login`
  2. ~~`package.json` 에 `repository` 필드 추가~~ ✅ 완료 (2026-08-19)
  3. `pnpm changeset` → `pnpm release:version` → `pnpm release:publish`
  4. 빈 Vite 앱에 설치해 Tailwind `@source` 유무 대조 (README 경고가 실제로 맞는지)
  5. ag-grid 미설치 상태에서 `@txstack/ui` 코어만 동작하는지 확인
  - ⚠ **npm publish 는 되돌릴 수 없다. 사용자가 명시적으로 요청할 때만 실행한다.**

- **P5 (선택)** — Storybook 9, GitHub Actions CI, Tailwind 사전 컴파일 CSS, vitest 회귀 테스트

- **P6 / 요구사항 002** — 원본 3개 저장소 역이식 (`src/core` 삭제 → npm 의존). **원본 저장소가 있는 PC에서만 가능하다.**

### 6-3. 남겨둔 판단

| 항목                                         | 상태                                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `useTxAgGridOption`                          | 미이관. 원본이 도메인 필드명·앱 컴포넌트를 하드코딩한다. 범용화하려면 재설계 필요      |
| `TxCoolTable`                                | `@deprecated` 상태 그대로 이관. `TxAgGrid` 로 대체 권장                                |
| chain-wallet-service `TxDropdownMulti` JSDoc | 미반영. 그쪽 버전이 기능적으로 구버전이라 문서가 현재 API 와 어긋날 수 있어 건너뛰었다 |
| 자동화 테스트                                | 없음. 동치 검증은 일회성 스크립트로만 수행                                             |

---

## 7. 놓치기 쉬운 함정 (반복 확인용)

1. **Tailwind `@source`** — 소비 앱이 `@source "…/node_modules/@txstack/ui/dist"` 를 안 넣으면 스타일이 전부 purge 된다.
2. **ag-grid `ModuleRegistry`** — 소비 앱이 `registerModules([AllCommunityModule])` 를 빠뜨리면 그리드가 빈 화면(error #272).
3. **playground 의 Vite alias** — `@txstack/*` 를 소스로 alias 한다. 없으면 라이브러리 한 줄 수정마다 빌드+재시작이 필요하다. 배포 계약은 `tsc` 가 `exports`→`dist/*.d.ts` 로 검증하므로 그대로 유지된다.
4. **git 커밋 날짜로 최신판을 판정하지 말 것** — black-message 는 폴더 리네임으로 전 파일 날짜가 2026-08-07 로 덮여 있다. 내용 diff 로 봐야 한다.
5. **배럴과 default export** — `export *` 는 default 를 실어 나르지 않는다. 새 컴포넌트를 추가할 때 default export 만 두면 패키지에서 접근 불가가 된다.
