# txstack

여러 프로젝트에서 재사용할 수 있는 **범용 React 라이브러리 세트**. npm 에 개별 배포한다.

이 문서가 저장소의 출발점이다. **무엇을 만드는지 · 어디까지 왔는지 · 다음에 뭘 할 차례인지**가 여기 있다.

---

## 왜 만드는가

같은 UI 컴포넌트와 같은 axios 설정을 세 프로젝트(`black-message` · `usertics` · `chain-wallet-service`)가
각자 복사해 쓰고 있었다. 고칠 일이 생기면 세 번 고쳐야 하고, 세 곳이 조금씩 달라졌다.

그래서 **공통분모만 뽑아 도메인 지식 없는 라이브러리로 분리**한다.
핵심 판정 기준은 하나다 — **네 번째 프로젝트가 그대로 설치해 쓸 수 있는가.**
못 쓴다면 그건 앱 코드지 라이브러리가 아니다.

## 4개 패키지

| 번호  | 패키지                | 한 줄 목적                                             | React | 문서                                |
| ----- | --------------------- | ------------------------------------------------------ | ----- | ----------------------------------- |
| `001` | `@txstack/ui`         | Tx\* 컴포넌트. 쉬운 사용법, 쉬운 커스터마이징          | O     | [001_ui](001_ui.md)                 |
| `002` | `@txstack/route-meta` | 라우트를 메타데이터 트리로 선언 → 라우터·메뉴·현재위치 | O     | [002_route_meta](002_route_meta.md) |
| `003` | `@txstack/hooks`      | 의존 없는 범용 훅 + URL 쿼리를 상태처럼                | O     | [003_hooks](003_hooks.md)           |
| `004` | `@txstack/axios`      | axios 래퍼. 인증·에러·봉투 정책을 주입받는다           | **X** | [004_axios](004_axios.md)           |

새 PC 에서 세팅하려면 [900_setup](900_setup.md) 을 본다.

### 경계 — 이게 흐려지면 라이브러리가 아니다

**의존 방향은 `ui → hooks` 하나뿐이다.**

```
       ui ──▶ hooks
  route-meta        axios
   (서로 참조하지 않는다)
```

- `hooks` / `route-meta` / `axios` 는 **서로를 import 하지 않는다.** 셋 다 독립 설치 가능해야 한다.
- `axios` 는 **React 를 모른다.** 훅도 컨텍스트도 없다. Node 스크립트에서도 돌아가야 한다.
- **런타임 정책은 패키지가 정하지 않는다.** 토큰을 어디서 읽는지, 401 에 무엇을 할지,
  응답 봉투가 `{ body }` 인지 `{ data }` 인지는 전부 **옵션으로 주입받는다.**
- **앱 전역 타입·전역 변수에 의존하지 않는다.** `import.meta.env` 를 패키지가 직접 읽지 않는다.
- **무거운 선택적 의존(`ag-grid`, `react-day-picker`)은 서브패스로 분리한다.**
  루트 배럴을 import 한 소비자는 그것들을 설치하지 않아도 동작해야 한다.

---

## 현재 상태

**2026-08-27 — 저장소를 비우고 문서부터 다시 시작했다.**

이전 구현 전체(4개 패키지 소스 · Storybook · playground)와 git 커밋 53개는
원격의 **`legacy` 브랜치**에 보존되어 있다.
`../txstack_temp` 에 **별도 클론으로 꺼내 읽기 전용으로 참조한다** (워크트리가 아니다).
원격 저장소(`github.com/code7004/txstack`)의 히스토리도 이때 리셋했다.

다시 시작한 이유는 코드가 나빠서가 아니라 **문서가 코드보다 앞서 나갔기 때문**이다.
직전 문서 체계는 1,800줄이었는데 실제 정리된 컴포넌트는 4개였다.
그래서 이번에는 **코드가 생긴 만큼만 문서가 자란다.**

| 영역          | 상태                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 문서          | **완료** — 이 문서 + 패키지별 4장                                                                                                               |
| 모노레포 설정 | **완료** — pnpm workspace · tsconfig · eslint · prettier · vitest · tsup                                                                        |
| `axios`       | **이식 완료** — 테스트 29개 통과                                                                                                                |
| `hooks`       | **이식 완료** — 테스트 25개 통과                                                                                                                |
| `route-meta`  | **이식 완료** — 테스트 21개 통과                                                                                                                |
| `ui`          | 기반 4개 + Form 10개 + `TxPopup` · `TxAgGrid` · `TxPagination` · `TxModal` · `TxDialog` · `TxTabs` · `TxCard` · `TxTooltip` · 메뉴 2종 · `TxSlidePanel` · `TxJsonTree` · `TxAlert` · `TxToast` · `TxCollapsible` · `TxAccordion` · `TxBadge` · `TxSkeleton` · `TxDivider` · `TxProgress` · `TxEmptyState` · `TxGrid` · `TxCopyButton` · 폼 컨트롤 7종 · `TxScrollArea` · `TxBreadcrumb` · `TxAppShell` — 테스트 1553개 통과 (`TxDayPicker` 하나가 빨갛다, 아래 참조) |
| `apps/*`      | **storybook 있음** — playground 는 아직 없다                                                                                                    |
| 배포 도구     | **changesets 붙였다** — 네 패키지 모두 `0.1.0`. husky · commitlint 는 아직 (사람이 둘 이상 커밋할 때)                                          |

`pnpm build` 가 **진입점 8개**(`ui` 3 · `hooks` 2 · `axios` 2 · `route-meta` 1)를
ESM + `.d.ts` 로 내고, `pnpm check`(lint · typecheck · test)가 통과한다.

### 버전은 changesets 가 매긴다

구현이 0줄일 때는 안 넣었다 — 커밋 훅도 버전도 그때는 마찰만 된다. **붙이는 시점을
"첫 `export` 가 확정될 때" 로 잡아 두었고, 그때가 왔다.** 네 패키지 모두 `0.1.0` 이다.

```sh
pnpm changeset           # 무엇이 어떻게 바뀌었는지 적는다
pnpm changeset:version   # 쌓인 것을 모아 버전을 올리고 CHANGELOG 를 쓴다
pnpm release             # 빌드하고 배포한다 — 사용자가 명시적으로 요청할 때만
```

**커밋 메시지와 changeset 은 읽는 사람이 다르다.** 커밋은 "왜 그렇게 했나" 를 남기고
(이 저장소의 커밋이 유난히 긴 이유다), changeset 은 **소비자에게 무엇이 달라졌는지**를
남긴다. 자세한 것은 [.changeset/README.md](../.changeset/README.md).

아직 `0.x` 라 **`minor` 가 깨지는 변경도 담는다**(semver 가 그렇다). 그래도 깨지는 것은
`major` 로 적어 둔다 — `1.0.0` 이 되는 날 그 기록이 그대로 뜻을 갖는다.

husky · commitlint 는 아직이다. **사람이 둘 이상 커밋하기 시작할 때** 붙인다.

## 다음 할 일

**`ui` 만 남았고, 이행 계획은 [001_ui](001_ui.md) 가 소유한다.**

0차(스타일 파이프라인) · 1차(기반 4개) · **2차(Form 클러스터)가 끝났다.**
`TxButton` 이 이후 전부의 레퍼런스다.

1. **4차 · 5차 — 새로 만든 것들.** 5차 후보 18개 중 **17개가 끝났다.**
   **여기서부터는 이식이 아니다.** 3차까지로 원본 26개 중 24개가 왔고, 그 결과 목록이
   **업무 화면 쪽으로 쏠려 있다** — 폼 10개 · 그리드 · 드롭다운 · 모달 · 메뉴.
   순서는 의존이 정한다: **`TxAlert`(완료) → `TxToast`(완료) → `TxCollapsible`(완료) → `TxAccordion`(완료)
   → `TxBadge`(완료) → `TxSkeleton`(완료).** **여섯이 끝났다.** 다음 후보 18개를 [001_ui](001_ui.md) 의 "5차 후보군" 에 정리해
   두었다 — **아직 결정이 아니라 목록이고**, 겹침 넷(`TxBadge` 이름 · `TxAppShell`↔`TxLayout` ·
   `TxStepper` 이름 · `TxDivider` 부활)은 **전부 정했다.**
   먼저 만들기로 한 다섯(`TxDivider` · `TxProgress` · `TxEmptyState` · `TxGrid` ·
   `TxCopyButton`)에 이어 **폼 컨트롤 묶음 일곱**(`TxRadio`/`TxRadioGroup` · `TxSwitch` ·
   `TxTag` Chip 흡수 · `TxBadge` · `TxNumberInput` · `TxSlider` · `TxFileUpload`)까지 끝났다.
   `TxSwitch` 를 가르면서 **`TxCheckBox` 의 `variant` 는 걷어냈다.**
   남은 넷의 순서를 정했다 — `TxScrollArea`(완료) → `TxBreadcrumb`(완료) →
   `TxAppShell`(완료) → **`TxTable`.** **18개 중 17개가 끝났고 `TxTable` 만 남았다.**
   `TxAppShell` 은 **슬롯을 prop 으로 받고**(자식을 뒤지지 않는다 — `TxCard` · `TxLayout`
   이 이미 부러진 방식이다) 이름은 **방향으로 간다** — `header` · `top` · `left` · `right` ·
   `bottom` · `footer`. 좁아지면 **같은 `left` 노드**가 서랍으로 가고, `left`·`right`·`bottom`
   은 **끌어서 크기를 바꾸고 접었다 편다** — 자리마다 `panels` 한 곳에 적는다.
   크기 조절과 `visible` 은 `TxLayout` 에서 되살린 것이고, **독립 부품이 아니라 셸이
   맡기로 정했다**(폭 소유권이 갈리고, 본문 최소 폭은 셸만 안다). `bottom` 의 폭은 **`bottomSpan` 으로 고른다** — `좌 · (본문 · 아래) · 우`(기본,
   AWS 콘솔 쪽)이거나 좌우까지 아우르는 전체 폭(VS Code 쪽).
   `TxAlert` 이 **상태색 네 갈래(`info`·`success`·`warning`·`danger`)의 기준**을 세웠고,
   그 어휘를 `TxToast` · `TxBadge` 가 물려받는다.
   미룬 것(`TxTicker` · `TxCarousel` · `TxNavBar` …), 자른 것, 그리고 함께 정한
   **`--tx-color-success` 토큰 추가**는 [001_ui](001_ui.md) 의 "4차" 절이 갖는다.

   지금까지 이식한 것 — 기반 4개 · Form 클러스터 10개 · `TxAgGrid`(쪽 번호를
   `TxPagination` 으로 갈랐다) · `TxModal`(네이티브 `<dialog>`) · `TxDialog`(신규,
   `alert`·`confirm`) · `TxTabs` · `TxCard` · `TxTooltip` · 메뉴 2종(속은 `TxMenuShell`
   하나) · `TxSlidePanel` · `TxJsonTree`(목적에서 다시 짰다). 함께 정한 것 둘 —
   `framer-motion` 은 **CSS 로 걷어내고**, 라우터 링크는 **컴포넌트를 주입받는다**(기본 `<a>`).
   peer 는 지금의 `react` · `react-dom` + optional 둘에서 늘리지 않는다.

2. **다음 순서는 이렇게 정했다.** ← 여기서 이어받는다

   1. **`TxDayPicker` 결함부터** — 달력이 **고른 날의 달이 아니라 오늘 달로 열린다.**
      `TxDayPicker.test.tsx:108` 이 지금 빨갛다(`expected '2026-09-20' to contain '2026-08-20'`).
      `defaultValue={new Date(2026, 7, 15)}` 를 줬는데 트리거만 8월이고 패널은 9월로 열린다.
      **오늘이 8월일 때만 우연히 통과하던 테스트라 9월로 넘어오며 드러났다.** 날짜에
      기대는 다른 테스트가 또 있는지도 같이 훑는다
   2. **미룬 5차 항목** — `TxTicker` · `TxCarousel` · `TxAvatar` · 메가메뉴
   3. **마지막이 `TxTable`** — **어디까지가 `TxAgGrid` 몫인지**를 정해야 해서 맨 뒤다.
      `columns` 를 ag-grid `colDef` 의 부분집합으로 잡을지가 첫 갈림길이고,
      `ag-grid-community` 가 MIT 인 것은 확인해 뒀다

3. **3차의 마지막 `TxLayout` 은 잘랐다.** 앱 사용 0회에 447줄이고, 크기 조절되는 패널은
   IDE 재주다. 5차의 **`TxAppShell`**(`header`·`top`·`left`·`right`·`bottom`·`footer`)이 그 자리를 대신한다 —
   한 화면에 셸이 둘일 일이 없다. **이식은 26개 중 23개로 끝났다.**
4. **`tailwind-merge` 를 뗐고 `TxInputLike` 는 감추기로 정했다.** 둘 다 밀려 있던 결정이다.
   `twMerge` 는 우리 컴포넌트가 Tailwind 를 한 곳도 싣지 않아 정리할 충돌이 없었다 —
   소비자 `className` 이 이기는 것은 `@layer tx` 덕분이다. **런타임 의존은 `clsx` 하나다.**
5. playground 는 아직 없다. Storybook 은 세웠다 (`pnpm storybook:dev`, 포트 6310).

### 이식은 복사가 아니다

`axios` 659줄에서 **경계 규칙 위반 3건**(쿠키 기본값, 콘솔 오염, Node 미지원)과
**동작 결함 1건**(FormData 업로드가 깨짐)이 나왔다. 사실이 아닌 주석도 하나 있었다 —
`delete` 가 예약어라 `del` 을 썼다는 것인데, 객체 메서드명으로는 유효하다.

`hooks` 333줄에서는 **무한 반복의 원인**이 나왔다. `useUrlQuery` 가 상태 변경마다 URL 로
되쓰는 `useEffect` 를 돌렸는데, `setSearchParams` 의 identity 가 매번 바뀌는 탓에 그 effect 가
자기 자신을 다시 트리거했다. URL 을 단일 출처로 바꿔 effect 자체를 없앴다.

`route-meta` 391줄에서는 **라우터와 어긋나는 매칭**이 나왔다. 경로 매칭을 자체 정규식으로
구현해 순회 순서에 의존했고, `/users/:id` 가 `/users/new` 를 가로챘다 — 화면과 타이틀·
브레드크럼이 갈리는 버그다. `matchRoutes` 에 위임해 없앴다. 테스트가 하나도 없던 부분이다.

`ui` 의 `TxForm` 240줄에서는 **배선이 통째로 없는 것**이 나왔다. 캡션이 `<label>` 이 아니라
어떤 컨트롤과도 이어지지 않았고, 에러는 `aria-invalid` 도 `aria-describedby` 도 없이 화면에만 떴다.
`labelWidth` 는 읽는 쪽이 없어 **아무 일도 하지 않았는데 그것을 보여주는 스토리가 있었다.**

**그러니 다음 패키지도 파일을 옮기기 전에 전부 읽는다.** 옮긴 뒤에 고치면 무엇이 원본이고
무엇이 판단이었는지 구분되지 않는다. 고친 내역은 각 패키지 문서의 "이식하며 고친 것" 에 남긴다.

## 문서 규칙

- **이 폴더는 얇게 유지한다.** 패키지당 1장, 그 이상은 필요해질 때 만든다.
- **패키지 문서는 설명이 아니라 예제 코드로 쓴다.** 사용법 스니펫이 곧 API 합의서다.
- **상태(현재 상태 · 다음 할 일)는 이 문서 한 곳에만 쓴다.** 여러 곳에 쓰면 반드시 어긋난다.
- 아직 만들지 않은 것을 만든 것처럼 쓰지 않는다. **없으면 "없음" 이라고 쓴다.**
