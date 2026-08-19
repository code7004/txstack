# 03. 배포와 버전 규약

> **언제 확인하나** — 공개 API(export·타입·peerDeps)를 바꾸거나, npm 배포를 하거나, `package.json` 의 엔트리 필드를 손댈 때.

## 모듈 형식: ESM 전용

4개 패키지 모두 **ESM 전용**이다. `exports` 에 `require` 조건을 두지 않는다.

- CommonJS 소비자가 `require()` 하면 `ERR_PACKAGE_PATH_NOT_EXPORTED` 로 실패한다. 이는 의도된 동작이다.
- Node 가 내보내는 메시지는 `No "exports" main defined` 라서 **원인을 알려주지 않는다.** 각 패키지 README 의 "호환성" 절에 명시해 둔다.
- 특히 `@txstack/network` 는 React 비의존이라 Node 백엔드(CJS)에서 쓰려는 시도가 나오기 쉽다. 이 제약을 README 에서 빼지 않는다.

CJS 지원을 추가하려면 듀얼 패키지가 되고, [dual package hazard](https://nodejs.org/api/packages.html#dual-package-hazard)
(같은 모듈이 ESM/CJS 두 인스턴스로 로드되어 상태가 갈라지는 문제)를 떠안는다. 요구가 실제로 생기기 전에는 하지 않는다.

## 엔트리 필드: `exports` + `main` + `types` 를 모두 유지한다

`exports` 가 있으면 Node 는 `main` 을 무시한다. 그래도 `main` / `types` 를 남기는 이유는 **구형 TypeScript 해석기 때문**이다.

`moduleResolution: node`(node10) 소비자로 실측한 결과:

| 대상                               | 결과                                           |
| ---------------------------------- | ---------------------------------------------- |
| 루트 엔트리 (`@txstack/network`)   | ✅ 해석됨 — `types` 필드 덕분                  |
| 서브패스 (`@txstack/ui/daypicker`) | ❌ `TS2307` — `exports` 를 읽지 못해 해석 불가 |

즉 `main`/`types` 는 구형 설정에서 **루트 엔트리만이라도 살려주는** 역할을 한다. 지우면 그 소비자는 전부 깨진다.
서브패스가 필요한 소비자는 `bundler` · `node16` · `nodenext` 로 올려야 하며, 이는 README 에 적는다.

## TypeScript 최소 버전: 5.4

`@txstack/hooks` 의 `useUrlQuery` 옵션 타입이 TypeScript 5.4 에서 추가된 `NoInfer` 를 쓴다.

- 새 API 를 만들 때 5.4 미만에서 깨지는 타입 기능을 쓰면, **해당 패키지 README 에 최소 버전을 반드시 적는다.**
- 프로젝트 전체의 하한은 **5.4** 로 본다. 이보다 높은 기능이 필요하면 그때 이 문서를 갱신한다.

## peerDependencies

- `react` / `react-dom` / `react-router-dom` / `ag-grid-*` 는 **peerDependencies** 다. `dependencies` 로 옮기면 소비 앱에서 React 인스턴스가 중복되어 훅이 깨진다.
- 무거운 선택적 의존은 **subpath export 로 격리하고** `peerDependenciesMeta.optional: true` 로 표시한다.
  - optional 로 표시하면 npm 이 자동 설치하지 않는다. 이 동작을 소비자 픽스처로 검증한다.
- 서브패스를 추가할 때는 **코어 엔트리에 그 의존이 새지 않는지** 빌드 산출물에서 문자열로 확인한다.

## 버전과 배포

- **changesets** 로 패키지별 독립 버전을 매긴다. 모노레포지만 버전은 묶이지 않는다.
- **공개 API(export)를 바꿨다면 changeset 을 함께 작성한다.** 타입만 바뀌어도 공개 API 다.
- scope 패키지이므로 `--access public` 이 필요하다 (`.changeset/config.json` 의 `access: public`).
- `apps/playground` 는 `private: true` 이며 changesets `ignore` 대상이다.

### breaking change 판정

major 로 올리는 경우:

- export 제거 또는 이름 변경
- props 필수화
- peerDependencies 범위 축소, 또는 optional → required 전환
- 기본 동작 변경
- **엔트리 이동** (루트 → 서브패스, 또는 그 반대)
- **모듈 형식·해석 요구 변경** (ESM 정책, TypeScript 최소 버전 상향)

## 배포 전 확인

```sh
pnpm check                 # lint + 전 패키지 typecheck
pnpm build                 # dist/*.js + dist/*.d.ts
npm pack --dry-run         # 각 패키지에서 포함 파일 목록 확인
```

`npm pack` 산출물을 빈 소비 앱에 `file:` 로 설치해 실제 소비자 환경을 재현한다.
**publish 없이 가능하며, 되돌릴 수 없는 배포 전에 반드시 한다.** 절차와 검증 항목은
[001 검증 §5](../verification/001_core_library_extraction.md) 를 따른다.
