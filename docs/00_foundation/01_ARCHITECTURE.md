# 01 아키텍처와 패키지 경계

> **언제 확인하는가**: 패키지를 추가·분할·이동할 때, 다른 패키지를 참조하려 할 때,
> 소비자 프로젝트에 영향을 주는 결정을 할 때.

## 1. 이 저장소의 형태

pnpm workspace 모노레포. `packages/*` 4종이 **각각 독립적으로 npm 에 배포**된다.
`apps/*` 는 배포하지 않는 검증·문서용이다.

```
txstack/
├─ packages/
│  ├─ ui/          → @txstack/ui          (React 필요)
│  ├─ route-meta/  → @txstack/route-meta  (React + react-router-dom 필요)
│  ├─ hooks/       → @txstack/hooks       (React 필요)
│  └─ network/     → @txstack/network     (React 불필요)
└─ apps/
   ├─ playground/  → 사용 흐름 검증용 샘플 앱 (private)
   └─ storybook/   → 컴포넌트 카탈로그 (private)
```

## 2. 왜 4개로 나누는가

**소비자가 필요한 것만 설치할 수 있어야 한다.** 이게 분할의 유일한 기준이다.

| 패키지       | 이것만 필요한 소비자                                                    |
| ------------ | ----------------------------------------------------------------------- |
| `network`    | React 를 아예 안 쓰는 프로젝트 (Node 스크립트, 서버) 도 쓸 수 있어야 함 |
| `hooks`      | 자체 디자인 시스템을 쓰지만 URL 상태 관리는 빌려 쓰고 싶은 프로젝트     |
| `route-meta` | UI 는 직접 만들지만 라우팅 관리 방식만 가져가고 싶은 프로젝트           |
| `ui`         | 화면을 빠르게 만들어야 하는 프로젝트                                    |

합치면 안 쓰는 의존까지 끌고 온다. **의심되면 나눈다.**

## 3. 의존 방향 (절대 규칙)

```
ui ──▶ hooks
route-meta      (독립)
network         (독립)
```

- **허용되는 패키지 간 의존은 `ui → hooks` 하나뿐이다.**
- `hooks` / `route-meta` / `network` 는 서로를 참조하지 않는다. 순환 금지.
- `ui` 가 `route-meta` 를 참조하고 싶어지면 그건 설계가 틀린 신호다. 필요한 데이터를 props 로 받는다.

## 4. 범용 라이브러리의 조건 (이걸 어기면 배포 못 한다)

### 4-1. 앱 전역(ambient)에 의존하지 않는다

소비자 프로젝트에는 그 전역이 없다. 전역 `$http` · `_` · `$d` · `$t` · `IAxiosResponse` 같은 것을 쓰면 안 된다.
필요한 타입은 **패키지가 직접 export** 한다.

### 4-2. 런타임 정책을 패키지가 결정하지 않는다

인증 토큰을 어디서 읽는지, 401 을 만나면 어디로 보내는지, 응답 봉투가 어떤 모양인지 —
**전부 소비자가 옵션으로 주입한다.** 패키지가 기본값을 강제하면 그 순간 범용성이 죽는다.

### 4-3. 도메인 지식을 넣지 않는다

블랙리스트·문자발송·지갑·유저타입 같은 개념이 패키지 코드에 나타나면 안 된다.
발견하면 **옵션이나 제네릭으로 뽑는다.**

### 4-4. React 는 peerDependency 다

`react` · `react-dom` · `react-router-dom` · `ag-grid-*` 는 **peerDependencies**.
`dependencies` 로 옮기면 소비 앱에서 React 인스턴스가 중복되어 훅이 깨진다.

무거운 선택적 의존(ag-grid, react-day-picker)은 **subpath export** 로 격리하고
`peerDependenciesMeta.optional` 로 표시한다. 설치하지 않은 소비자도 루트 배럴을 쓸 수 있어야 한다.

## 5. 소비자 관점 체크 (변경할 때마다)

새 export 를 추가하거나 시그니처를 바꿀 때 스스로 묻는다.

1. **이 프로젝트를 모르는 사람이 이 이름만 보고 뜻을 알 수 있나?**
2. **우리 앱의 사정이 이 시그니처에 새어 나갔나?** (특정 응답 형태, 특정 라우트 이름, 특정 권한 체계)
3. **설치하지 않은 의존을 요구하지 않나?**
4. **이걸 지우거나 이름을 바꾸면 major 인가?** → [05_RELEASE.md](05_RELEASE.md)

## 6. 미결 사항

새 판에서 아직 확정되지 않은 것들. 해당 주제 문서에서 결론이 나면 여기서 지운다.

| 항목                                                                                                                                           | 어디서 결정하나                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| ~~`@txstack/ui` 의 커스터마이징 방식~~ → **CSS 변수 / `className` / `classNames`** (2026-08-25 결정. `theme`·`TxThemeProvider` 는 폐기)        | [001_ui/20_design §4](../001_ui/20_design.md) |
| ~~Tailwind v4 `@source` purge 제약~~ → **자체 CSS 로 전환해 제약 자체가 사라졌다** (2026-08-25 결정, job `001-styles-css`)                     | [001_ui/20_design §2](../001_ui/20_design.md) |
| `hooks` 의 범위 — `useUrlQuery` 외 3개 훅을 유지할 것인가                                                                                      | `003_hooks/10_requirements.md`                |
| `network` 의 범위 — 401 처리·응답 봉투를 계속 다룰 것인가                                                                                      | `004_network/10_requirements.md`              |
| `route-meta` 의 `scope` 가 무엇을 뜻하는가 (권한? 표시 범위?)                                                                                  | `002_route_meta/10_requirements.md`           |
| 문서 사이트(903)를 무엇으로 세울 것인가 — **Storybook 갈음 안은 버렸다**                                                                       | `903_docs_site/10_requirements.md`            |
| ~~에이전트 가이드의 파일명·원본 위치~~ → **`AGENTS.md`, `packages/<pkg>/` 안(`files` 밖). npm 동봉 안 하고 사이트 다운로드** (2026-08-25 결정) | [904 README](../904_claude_guide/README.md)   |
