# 001-2. 배포 전 완성도 보강 (pre-release hardening)

- 관련 요구사항: [001 요구사항](../requirements/001_core_library_extraction.md)
- 관련 검증: [001 검증](../verification/001_core_library_extraction.md) — 특히 §5(2차 라운드)
- 상위 계획: [001 작업 계획](001_core_library_extraction.md)
- 착수일: 2026-08-19
- 상태: 진행 중

## 배경

`001` 의 P0~P3 은 끝났고 P4(npm 배포)만 남았다. 사용자 결정으로 **배포를 뒤로 미루고 완성도를 먼저 올린다.**
배포는 되돌릴 수 없으므로, 되돌릴 수 있는 동안 최대한 많은 문제를 찾아 두는 것이 이 계획의 목적이다.

출발점은 001 검증 문서 §4 "미수행 / 한계" 다. 그 목록이 그대로 이 계획의 작업 항목이 된다.

## 검증 라운드 (V1~V5)

| ID  | 항목                      | 상태    | 결과 문서   |
| --- | ------------------------- | ------- | ----------- |
| V1  | 소비자 환경 실검증        | ✅ 완료 | 001 검증 §5 |
| V2  | vitest 자동화 회귀 테스트 | ✅ 완료 | 001 검증 §6 |
| V3  | GitHub Actions CI         | ⬜      |             |
| V4  | playground 전 화면 재검증 | ✅ 완료 | 001 검증 §7 |
| V5  | 문서 정합성 · rules 작성  | ⬜      |             |

## 작업 항목

### I1. `useUrlQuery` 타입 추론 수정 — ✅ 완료

V1 에서 발견. `defaults: Partial<T>` → `T`, 나머지 옵션을 `NoInfer<T>` 로 감쌌다.
changeset: `.changeset/tricky-hooks-infer.md` (`@txstack/hooks` minor)

**공개 API 영향** — `UseUrlQueryOptions` 의 형태가 바뀐다. 미배포 상태라 소비자 마이그레이션은 없다.

### I2. ESM 전용임을 문서에 명시 — ✅ 완료

V1-C12 에서 확인: CJS `require()` 는 `ERR_PACKAGE_PATH_NOT_EXPORTED` 로 실패한다.
`exports` 에 `require` 조건이 없으므로 의도된 동작이지만 **어디에도 적혀 있지 않다.**

- 특히 `@txstack/network` 는 React 비의존이라 Node 백엔드(CJS)에서 쓰려는 시도가 나올 수 있다.
- Node 가 내보내는 메시지(`No "exports" main defined`)는 원인을 알려주지 않는다.
- ✅ 4개 패키지 README 에 "## 호환성" 절을 추가했다. Node 의 실제 에러 메시지(`No "exports" main defined`)가 원인을 알려주지 않는다는 점까지 적었다.
- ✅ `docs/rules/03_PUBLISHING_AND_VERSIONING.md` 작성 (rules 인덱스의 "(예정)" 해제).
- ✅ **`main` / `types` 필드는 유지하기로 확정.** 구형 `moduleResolution: node` 소비자로 실측한 결과:
  루트 엔트리는 `types` 필드 덕분에 **해석되고**, 서브패스만 `TS2307` 로 실패한다.
  즉 이 필드들은 구형 설정에서 루트 엔트리만이라도 살려주는 역할을 하므로, 지우면 그 소비자가 전부 깨진다.
  서브패스 제약(`bundler`·`node16`·`nodenext` 필요)은 README 에 명시했다.

### I3. TypeScript 최소 버전 명시 — ✅ 완료

I1 에서 도입한 `NoInfer` 는 **TypeScript 5.4 내장**이다. 그 이전 버전 소비자는 타입이 깨진다.

- ✅ `@txstack/hooks` README 의 "호환성" 절에 명시했다.
- ✅ **프로젝트 전체 하한을 5.4 로 확정**하고 rules 03 에 기록했다. 개별 패키지 README 에는 실제로 해당하는 곳에만 적는다(현재 hooks).
- ✅ rules 03 의 breaking change 판정에 "모듈 형식·해석 요구 변경(TypeScript 최소 버전 상향)" 을 major 사유로 추가했다.

### I4. 소비자 픽스처 자동화 — ⬜

V1 픽스처는 스크래치 디렉터리에만 있어 재현이 수동이다. 회귀를 잡으려면 저장소 자산이어야 한다.

- 조치: `pnpm verify:consumer` 형태의 스크립트로 pack → 임시 앱 설치 → typecheck/build → 격리 검사까지 자동화.
- V3(CI)에 물릴지는 소요 시간(현재 수동 수행 약 2분)을 보고 판단한다.

### I5. 검증 픽스처 작성 원칙 — ⬜

V1 에서 얻은 교훈을 규약으로 남긴다.

> playground 는 라이브러리 저자가 쓰는 코드라 "정답을 아는" 사용법으로 수렴한다.
> `useUrlQuery` 추론 결함이 1차를 통과한 것이 그 결과다(타입 인자를 명시하고 있었다).
> **소비자 픽스처는 일부러 순진하게 써야 한다** — 타입 인자 생략, 기본 옵션, README 예제 그대로.

- 조치: `docs/rules/` 에 검증 원칙으로 기록.

### I6. `removeUndefined` 이름 재검토 — ⬜

V2 에서 드러남. 이름은 `undefined` 만 지울 것처럼 읽히지만 **공백 문자열도 지운다**.
JSDoc 에 명시된 의도된 동작이고 query string 에 빈 파라미터가 붙는 것을 막는 것이 목적이지만,
공개 export 라서 이름만 보고 쓰는 소비자가 값을 잃을 수 있다.

- 현재 동작: `undefined` 와 공백 문자열 제거. `null` · `0` · `false` 는 유지. (테스트로 고정함)
- 선택지: (a) 이름 유지 + README 에 동작 명시, (b) `compactParams` 등으로 개명하고 기존 이름은 deprecated 별칭,
  (c) 동작을 이름에 맞추고 공백 제거는 옵션으로 분리 — **(c) 는 breaking**
- 배포 전이므로 지금이 개명 비용이 가장 싸다. V5(문서 정합성)에서 함께 판단한다.

### I7. 테스트 커버리지 확대 — ⬜

V2 는 핵심 계약 위주로 56건을 깔았다. 남은 구멍:

- `Tx*` 컴포넌트 렌더 테스트 없음 (27종)
- `useUrlQuery` 의 `encode` 옵션 미커버
- `getNestedValue` · `setNestedValue` · `castValue` 미커버
- 커버리지 측정 자체가 없음 (`@vitest/coverage-v8` 미도입)

V4(브라우저 재검증) 결과를 보고 우선순위를 정한다. 렌더 테스트가 playground 수동 확인을 대체할 수 있는지가 판단 기준이다.

### I8. `TxCoolTable` deprecation 경고가 매 렌더마다 찍힌다 — ⬜

V4 에서 발견. 컴포넌트 본문에서 `console.warn` 을 직접 호출해, 렌더마다 실행되고 StrictMode
이중 렌더까지 겹친다. 화면 하나에서 4회가 찍혔다. 소비자 콘솔을 오염시킨다.

- 조치안: 모듈 스코프 플래그로 **프로세스당 1회**만 경고하고, `useEffect` 안으로 옮긴다.
- 렌더 본문의 부수효과 자체가 React 규칙 위반이기도 하다 (동시성 모드에서 호출 횟수가 보장되지 않는다).
- 같은 패턴이 다른 컴포넌트에 있는지 함께 확인한다.

## 검증 방법

- 각 항목 완료 시 `pnpm check` + 해당 라운드의 재현 절차를 001 검증 문서에 추가한다.
- 공개 API 를 바꾼 항목은 changeset 을 함께 남긴다.
