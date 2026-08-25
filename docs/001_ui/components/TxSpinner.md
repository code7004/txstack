# TxSpinner

> **플로우 S1 산출물.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md) · 파일럿 1차
> 상태: **S1·S2·S3 완료 (2026-08-25).** 이 문서가 `TxSpinner` 의 단일 진실 공급원이다.

현재 코드: `packages/ui/src/TxSpinner/TxSpinner.tsx` (구현 + props 타입) · `index.ts` (재수출) ·
`TxSpinner.test.tsx` (13개) · `TxSpinner.stories.tsx` (S4 에서 개편)

## 진행

| 단계 | 내용                            | job ID             | 상태 | 비고                                                    |
| ---- | ------------------------------- | ------------------ | ---- | ------------------------------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝 | `001-TxSpinner-S1` | ✅   | Q1~Q4 결정 완료                                         |
| `S2` | 구현 = 감사 결과 반영 🤖        | `001-TxSpinner-S2` | ✅   | D1–D5 · A1–A3 · C1~C7 처리. changeset 작성됨. 검증은 §9 |
| `S3` | 테스트 🤖                       | `001-TxSpinner-S3` | ✅   | 13개. jsdom 한계 발견 → §11                             |
| `S4` | 스토리북 🤖                     | `001-TxSpinner-S4` |      | `901` 양식을 여기서 만든다                              |
| `S5` | 문서 사이트 🤖                  | `001-TxSpinner-S5` |      | `903` 골격을 여기서 만든다                              |
| `S6` | Claude 가이드 🤖                | `001-TxSpinner-S6` |      | `904` 골격을 여기서 만든다                              |

## 1. 목적

**로딩 중임을 알리는 회전 아이콘 하나.** 그 이상은 하지 않는다.

- 소비자가 직접 하면: SVG 를 구해오고, `animate-spin` 을 붙이고, 색·크기 상속을 맞추고,
  `role="status"` 와 장식용 분기(A2), `prefers-reduced-motion`(A3) 을 매번 다시 판단해야 한다.
- 그 판단을 한 번만 하고 **어느 프로젝트에서든 같은 이름·같은 props 로 꺼내 쓰는 것**이 존재 이유다.

**책임 범위: 순수 인라인 아이콘.** 문구·오버레이·표시 여부 판단은 `TxLoading` 이 담당한다 (§5 Q2).
글자 옆에 놓거나 버튼 안에 넣는 용도이며, 그 자리에서 **폰트 크기와 색을 상속**받는다.

## 2. 공개 API

```ts
// packages/ui/src/TxSpinner/TxSpinner.tsx
import type { SVGProps } from "react";

export interface TxSpinnerProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** 크기. number 는 px 로 해석한다. 기본 "1em" — 부모 font-size 를 따른다 */
  size?: number | string;
  /** 장식용으로 쓸 때 켠다. role·aria-label 을 빼고 aria-hidden 을 붙인다 */
  decorative?: boolean;
}

export const TxSpinner: (props: TxSpinnerProps) => JSX.Element;
```

`SVGProps` 의 나머지(`style` · `onClick` · `aria-label` · `width` · `height` …)는 그대로 통과한다.

| 항목               | 값                                                                        | 근거  |
| ------------------ | ------------------------------------------------------------------------- | ----- |
| export             | **named** (`export const TxSpinner`)                                      | C1    |
| 타입 이름          | `TxSpinnerProps` — **`I` 접두 없음**                                      | §5 Q1 |
| `size` 기본값      | `"1em"`                                                                   | §5 Q3 |
| `className` 기본값 | **없음.** 내부 클래스와 `cm()` 으로 병합한다                              | D2    |
| 스크린리더 문구    | `aria-label` 기본 `"Loading"`. 소비자가 `aria-label` 로 덮는다            | A1    |
| 애니메이션         | `animate-spin` + `prefers-reduced-motion` 시 **느려진다 (멈추지 않는다)** | A3    |
| DOM 표식           | `data-tag="TxSpinner"`                                                    | C4    |

### 파일 구조

```
packages/ui/src/TxSpinner/
├─ TxSpinner.tsx          구현 + TxSpinnerProps
├─ TxSpinner.stories.tsx  Feedback/TxSpinner (스토리 3개 이상)
├─ TxSpinner.test.tsx     S3 에서 생성
└─ index.ts               재수출만 (C2)
```

`.types.ts` 는 만들지 않는다 — props 가 2개뿐이라 파일을 나누면 읽는 비용만 늘어난다.
`.theme.ts` 도 만들지 않는다 (§3).

## 3. 커스터마이징 지점

| 무엇      | 어떻게                                          | 비고                                               |
| --------- | ----------------------------------------------- | -------------------------------------------------- |
| 색        | 부모의 `text-*` 를 상속 (`fill="currentColor"`) | **기본 방식. 유지 확정** — 아무것도 안 해도 맞는다 |
| 크기      | `size` prop, 또는 부모 `font-size`              | `size` 미지정 시 `1em`                             |
| 클래스    | `className` — 내부 기본값과 **병합**된다        | 교체 아님. `w-*` 로 크기를 덮는 것도 가능          |
| 접근성    | `aria-label` 교체 / `decorative` 로 끄기        | A1 · A2                                            |
| 그 외 SVG | `style` · `viewBox` · 이벤트 등 전부 통과       |                                                    |

**`.theme.ts` 를 두지 않는다.** 이 컴포넌트에는 variant 도 slot 도 없고 클래스 문자열이 하나뿐이라,
theme 객체를 만들면 키 1개짜리 껍데기가 된다. 다만 **파일럿 2차 `TxButton` 이 "모든 컴포넌트가 theme 을 노출한다"로
결론내면 그때 추가한다** — 추가는 minor 라 되돌릴 필요가 없다 (C3 은 이 사유로 닫는다).

## 4. 현행 코드 감사

판정: **수정** (폐기 아님 — `TxButton` 이 내부 기본값으로 쓰고 있고, 소비자도 직접 쓴다)

### 결함

| ID  | 내용                                                                                                                                                                                 | 근거                                                                                                      | S2 처리                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| D1  | **`size` 가 폭에 적용되지 않는다.** 기본 `className="w-full"` 이 `width` 속성을 이긴다 (CSS 선언 > presentation attribute). 폭은 100%, 높이만 `size`. 인라인 배치 시 형제를 밀어낸다 | 첫 실사용에서 소비자가 `className="w-auto"` 로 되돌렸다 — `apps/playground/src/pages/UiButtonPage.tsx:40` | 기본 `className` 제거. **회귀 테스트 최우선** |
| D2  | **`className` 을 주면 기본 클래스가 교체된다.** 기본값 파라미터라 병합되지 않는다. 색만 바꾸려 해도 레이아웃 기본값이 사라진다                                                       | `index.tsx:15` — `className = "w-full items-center"`                                                      | 기본값 제거 → `cm()` 이 병합을 맡는다         |
| D3  | `items-center` 는 무효 클래스. `<svg>` 는 `display:inline` 이라 `align-items` 가 적용되지 않는다. `TxButton` 안에서도 svg 는 flex **아이템**이라 무효                                | `index.tsx:15`                                                                                            | 제거                                          |
| D4  | **주석이 거짓이다.** `// ex: "2em" \| "24px" \| "w-6 h-6"` — `w-6 h-6` 은 `width` 속성값으로 들어가 무효. 사람과 에이전트 모두 오해한다 (`904` 관점에서 특히 위험)                   | `index.tsx:4`                                                                                             | 주석 교체. 크기 조절 경로 2개를 명시          |
| D5  | **스토리가 기본 동작을 보여주지 못한다.** `args: { className: "" }` 가 기본값을 덮어쓴다. `docs.description.component` 는 `"…"` 플레이스홀더 그대로                                  | `TxSpinner.stories.tsx:8,11`                                                                              | S4 에서 전면 개편                             |

### 접근성

| ID  | 내용                                                                                                                                              | S2 처리                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A1  | `aria-label="Loading..."` 하드코딩 영어. props 로 덮을 수는 있지만 기본값이 언어를 강제한다                                                       | 기본값은 `"Loading"` 으로 두되(라벨 없는 live region 이 더 나쁘다) **문서에 교체법을 명시**. 새 prop 은 추가하지 않는다 |
| A2  | **장식용 스위치가 없다.** `TxButton` 처럼 label 이 이미 있는 곳에서 `role="status"` + label 이 중복 안내된다. `aria-hidden` 로 끌 수단이 필요하다 | `decorative` prop 추가. `TxButton` 의 기본 `loading` 을 `<TxSpinner decorative />` 로 교체                              |
| A3  | `prefers-reduced-motion` 미대응. `animate-spin` 이 무조건 돈다. **`TxLoading` 의 `animate-bounce` 도 같다 → 라이브러리 공통 항목**                | 아래 "라이브러리 공통 규칙" 참고                                                                                        |

**라이브러리 공통 규칙 (A3):** 모션을 **끄지 않고 늦춘다.** 스피너를 멈추면 "로딩 중"이라는 정보 자체가 사라진다.
`animate-spin motion-reduce:[animation-duration:2s]` 형태를 기본으로 하고, `TxLoading` 의 `animate-bounce` 도 같은 원칙을 따른다.
`prefers-reduced-motion` 대응은 현재 저장소 전체에 **0건**이므로, 여기서 만드는 것이 첫 선례다.

> S2 검증 항목: 이 저장소의 Tailwind v4 + `@source` 설정에서 `motion-reduce:[animation-duration:2s]` 가
> 실제로 CSS 로 생성되는지 확인한다. 안 되면 `motion-reduce:animate-[spin_2s_linear_infinite]` 로 대체.

### 규약 이탈 (라이브러리 내 다수 관행과 불일치)

| ID  | 내용                                                                                                             | 이 저장소의 다수 관행                           | S2 처리                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| C1  | **default export.** 배럴에 특례 재수출 블록이 필요하다 (`index.ts:40~46`)                                        | 구현 컴포넌트 26종 중 default 는 4종뿐          | named 로 전환. `src/index.ts` 의 특례 줄에서 TxSpinner 만 제거 |
| C2  | **구현이 `index.tsx` 안에 있다.** [03_CONVENTIONS](../../00_foundation/03_CONVENTIONS.md) "배럴은 재수출만" 위반 | `TxSpinner.tsx` + `index.ts` 분리               | 분리                                                           |
| C3  | `.theme.ts` 없음                                                                                                 | 26종 중 18종이 `*.theme.ts` + `themeMerge` 체계 | **추가하지 않는다** — 사유는 §3                                |
| C4  | `data-tag` 없음                                                                                                  | 28개 파일이 `data-tag="Tx*"` 를 붙인다          | 추가                                                           |
| C5  | 스토리 `title: "TxSpinner"` — 그룹 없음. **26종 중 유일**                                                        | 전부 `Group/Name` (`Feedback/TxLoading` 등)     | `Feedback/TxSpinner`                                           |
| C6  | `import React from "react"` — `jsx: "react-jsx"` 이므로 런타임 import 불필요                                     | `import type { SVGProps } from "react"` 로 충분 | 교체                                                           |
| C7  | 스토리 1개 — 전 컴포넌트 최소치                                                                                  | 대부분 3개 이상                                 | S4 에서 3개 이상                                               |

### 테스트

| ID  | 내용                                                                   |
| --- | ---------------------------------------------------------------------- |
| T1  | ~~**테스트 없음.**~~ **S3 에서 해소.** `TxSpinner.test.tsx` 13개 → §11 |

## 5. 설계 결정 (2026-08-25 합의)

> `20_design.md` 가 아직 없다. **파일럿 2차 `TxButton` 이 끝나면 Q1·Q3 은 그쪽으로 승격한다** — 전 패키지 규약이기 때문이다.

| ID  | 질문                                        | 결정                                                             |
| --- | ------------------------------------------- | ---------------------------------------------------------------- |
| Q1  | 타입 이름에 `I` 접두를 쓸 것인가            | **쓰지 않는다.** `TxSpinnerProps`                                |
| Q2  | `TxSpinner` 와 `TxLoading` 의 관계          | **TxSpinner = 순수 아이콘. `TxLoading` 이 내부에서 그것을 쓴다** |
| Q3  | `size` 의 타입                              | **`number \| string`, 기본 `"1em"`.** number 는 px               |
| Q4  | 인라인 SVG path 를 `TxIcons` 로 옮길 것인가 | **옮기지 않는다.** `TxSpinner` 안에 유지                         |

### Q1 — `I` 접두 폐지

코드에는 `ITx*` 가 53개, `TxLoadingProps` 가 1개다. [03_CONVENTIONS §3](../../00_foundation/03_CONVENTIONS.md) 은 "`I` 를 붙이지 않는다"로
써 있었다. **규약이 맞고 코드가 틀렸다**로 판정한다.

- 이 라이브러리가 파는 것은 **예측 가능성**이다. `TxSpinner` 를 알면 `TxSpinnerProps` 를 추측할 수 있어야 한다
- React·MUI·Radix 등 생태계 표준이 `XxxProps` 다
- 아직 alpha 다. 지금이 제일 싸고, 나중에 하면 major 다

**마이그레이션은 컴포넌트별 S2 에 끌고 다니지 않는다.** 53개를 한 번에 바꾸는 **기계적 일괄 리네임 커밋 1개**로 끝낸다
(job `001-typenames`, [30_tasks.md](../30_tasks.md) 의 "공통 job"). 중간 상태로 오래 두면 새로 쓰는 코드가 어느 쪽을 따를지 매번 헷갈린다.

버린 대안: deprecated 별칭(`export type ITxSpinnerProps = TxSpinnerProps`) 유지 — 공개 API 가 2배가 되고, 지우는 시점이 결국 major 다.

### Q2 — 로딩 시각 언어를 하나로

`TxLoading` 은 자체 `Dots` 를 쓰고 `TxSpinner` 를 쓰지 않는데, 스토리 설명은 "스피너에 문구와 전체화면 옵션을 얹은 것"이다.
**설명이 맞고 구현이 틀렸다**로 판정한다.

- 역할 분리: `TxSpinner` = 회전 아이콘 / `TxLoading` = 문구 + 표시 여부 판단 + `fullScreen` 오버레이
- `TxLoading` 의 `Dots` 를 `TxSpinner` 로 교체하면 로딩 시각 언어가 하나가 된다 (`TxButton` 도 이미 `TxSpinner` 를 쓴다)

**이 결정은 `TxLoading` 쪽 변경이다.** `001-TxSpinner-S2` 범위가 아니라 **`001-TxLoading-S1/S2` 에 인계**한다
(겉모습이 바뀌므로 그쪽 changeset 에서 다룬다). 여기서는 `TxSpinner` 가 **문구·오버레이를 갖지 않는다**는 것만 확정한다.

### Q3 — `size` 는 CSS 길이, 기본 `1em`

- `TxIcons` 의 모든 아이콘이 `width="1em" height="1em"` 이다. **크기를 폰트 크기로 상속**받는 것이 이 라이브러리의 기존 방식이고,
  색을 `text-current` 로 상속받는 방식과 짝이 맞는다. 버튼 안에서 글자 크기에 자동으로 맞는다
- `number` 는 px 로 해석한다 (`size={24}`). SVG `width` 속성의 기본 해석과 같다

버린 대안:

- **토큰 `sm|md|lg`** — 라이브러리가 크기 스케일을 소유해야 하고, Tailwind `text-*` 로 이미 되는 일을 중복한다
- **`size` 제거** — "쉬운 사용법" 기준에서 후퇴하고, D4 가 남긴 혼란(px 인지 클래스인지)이 소비자에게 그대로 간다
- **기본 `2em` 유지** — `TxIcons` 와 크기 규약이 갈라진다. 기본값이 작아지는 것은 alpha 단계에서 감수하고 changeset 에 명시한다

### Q4 — SVG 는 제자리

소비자가 `TxSpinner` 하나뿐이라 중복이 없다. `TxIcons` 로 옮기면 `IconSpinner` 라는 공개 API 가 하나 더 생기는데,
그걸 원하는 사용자가 아직 없다 — [03_CONVENTIONS §4](../../00_foundation/03_CONVENTIONS.md) "혹시 필요할까봐 export 하지 않는다".

버린 대안: 12스포크를 더 작은 원호 SVG 로 교체 (~1/10 크기) — 겉모습이 바뀌는 별개 판단이라 S2 범위에 넣지 않는다.
번들 1.4KB 는 지금 문제가 아니다.

## 6. 사용 예제

**흔한 케이스** — 아무것도 주지 않는다. 글자 크기와 색을 상속받는다.

```tsx
import { TxSpinner } from "@txstack/ui";

<p className="flex items-center gap-2 text-sm text-gray-600">
  <TxSpinner />
  불러오는 중
</p>;
```

**커스터마이징** — 크기·색·안내 문구를 바꾼다. `className` 은 기본 클래스를 지우지 않는다.

```tsx
<TxSpinner size={24} className="text-blue-500" aria-label="주문 내역을 불러오는 중" />
```

**장식용** — 옆에 이미 읽을 문구가 있어 스크린리더가 두 번 말하면 안 될 때.

```tsx
<button disabled className="flex items-center gap-2">
  <TxSpinner decorative />
  저장 중
</button>
```

## 7. 하지 않는 것

- **문구·설명 텍스트** — `TxLoading` 이 한다
- **전체화면 오버레이·배경 딤** — `TxLoading fullScreen`
- **표시 여부 판단** (`visible`, 빈 배열 규약, 지연 표시 delay, 타임아웃) — 소비자 또는 `TxLoading`
- **진행률(determinate) 표시** — `%` 를 아는 로딩은 다른 컴포넌트다. 필요해지면 그때 만든다
- **스피너 종류 선택** (dots · bars · pulse) — 시각 언어는 하나로 간다 (§5 Q2)
- **크기·색 스케일 소유** — Tailwind 클래스와 상속에 맡긴다

## 8. S2 처리 결과 (2026-08-25)

| 항목         | 처리                                                                                  | 파일                                            |
| ------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| C1 · C2      | `TxSpinner.tsx` 로 분리, named export. `index.ts` 는 `export * from "./TxSpinner"` 만 | `TxSpinner.tsx` · `index.ts`                    |
| Q1 · C6      | `TxSpinnerProps`, `import type { SVGProps } from "react"`                             | `TxSpinner.tsx:1,4`                             |
| D1 · D2 · D3 | 기본 `className` 제거 → `cm()` 병합. `w-full` · `items-center` 사라짐                 | `TxSpinner.tsx:41`                              |
| C4           | `data-tag="TxSpinner"`                                                                | `TxSpinner.tsx:36`                              |
| Q3 · D4      | `size?: number \| string` 기본 `"1em"`. 거짓 주석 교체                                | `TxSpinner.tsx:6`                               |
| A1 · A2      | `decorative` 분기. 끄면 `role="status"`+`aria-label="Loading"`, 켜면 `aria-hidden`    | `TxSpinner.tsx:30`                              |
| A3           | `motion-reduce:[animation-duration:2s]` — 멈추지 않고 늦춘다                          | `TxSpinner.tsx:41`                              |
| C1 (배럴)    | `src/index.ts` 의 default 특례 재수출에서 `TxSpinner` 줄 제거                         | `packages/ui/src/index.ts`                      |
| A2 (적용)    | `TxButton` 기본 `loading` → `<TxSpinner decorative />`, import 도 named 로            | `packages/ui/src/TxButton/index.tsx:4,41`       |
| D1 (증거)    | 소비자 우회 `className="w-auto"` 제거                                                 | `apps/playground/src/pages/UiButtonPage.tsx:40` |
| D5           | **부분 처리.** 기본값을 덮던 `args` 만 걷어냈다. 제목·설명·스토리 수(C5·C7)는 **S4**  | `TxSpinner.stories.tsx`                         |

`.changeset/tidy-spinner-surface.md` 작성 (`minor`).

> **미결 하나.** 기존 changeset `lucky-props-export.md` 가 이 타입을 `ITxSpinnerProps` 로 적고 있다.
> Q1 결정으로 사실이 아니게 됐다. 되돌리지 않고 새 changeset 에 "이쪽이 최신"이라고 명시해 뒀다.
> **한 릴리스 안에 상충하는 두 항목이 남는 게 싫으면 `lucky-props-export.md` 쪽을 고쳐야 한다 — 사용자 판단.**

## 9. S2 검증 기록

> `40_verification.md` 는 아직 만들지 않는다. [02_WORKFLOW §2](../../00_foundation/02_WORKFLOW.md) 문서 순서상
> `10_requirements.md`(수용 기준)가 비어 있어 결과를 매핑할 대상이 없다. 그때까지 컴포넌트 단위 기록은 여기 남긴다.

| 검증                                      | 결과                                                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm check` (lint + typecheck + test)    | ✅ 통과. 56 tests / 4 files                                                                               |
| `pnpm build`                              | ✅ 통과. `dist/index.d.ts` 에 `TxSpinner` · `type TxSpinnerProps` 방출. `ITxSpinnerProps` 소멸 확인       |
| A3 — `motion-reduce` 클래스 CSS 생성 여부 | ✅ **해결됨.** 아래 참고. 대체안(`animate-[spin_2s_linear_infinite]`) 불필요                              |
| D1 — 렌더 크기                            | ✅ playground `/ui/button`, `size="1.5em"` → 실측 **24×24**. 부모 폭 998px 에 끌려가지 않는다             |
| A2 — `TxButton` 안 중복 안내              | ✅ 로딩 중 스피너에 `aria-hidden="true"`, `role`·`aria-label` 없음. 버튼에는 `aria-label="async (700ms)"` |
| 콘솔 에러                                 | ✅ 없음                                                                                                   |
| 스크린샷                                  | ⚠️ **못 찍음** — 이 환경에서 브라우저 페인이 표시되지 않아 프레임이 합성되지 않는다. DOM 실측으로 대체    |
| D2 — `className` 병합                     | ⏭ **S3 로.** 실사용처가 `className` 을 주지 않아 렌더로 확인할 수 없다. 회귀 테스트로 못박는다            |
| `pnpm storybook:dev` 렌더                 | ⏭ **S4 로.** 스토리 자체가 개편 대상이라 지금 보는 의미가 적다. 타입 검사는 `pnpm check` 에 포함됨        |

A3 확인 방법과 증거 — playground 를 빌드해 생성된 CSS 를 직접 확인했다.

```
@media(prefers-reduced-motion:reduce){.motion-reduce\:\[animation-duration\:2s\]{animation-duration:2s}}
```

Tailwind v4 의 arbitrary property 가 `@source "../../../packages/ui/src"` 스캔을 통해 정상 생성된다.
**소비 앱이 `@source` 를 빠뜨리면 이 규칙도 함께 사라진다** — [04_TOOLING §6](../../00_foundation/04_TOOLING.md) 제약 그대로다.

## 11. S3 테스트 (2026-08-25)

`packages/ui/src/TxSpinner/TxSpinner.test.tsx` — 13개. **`ui` 의 첫 컴포넌트 렌더 테스트다.**

`vitest.config.ts` 를 함께 고쳤다. `ui` 가 node 환경에 묶여 있어 렌더 테스트가 돌 수 없었다.
패키지째 jsdom 으로 옮기지 않고 **확장자로 갈랐다** — `*.test.ts` 는 node(순수 로직), `*.test.tsx` 는 jsdom(렌더).
패키지째 옮기면 유틸이 DOM 에 기대는지 아닌지가 가려진다.

### 이 단계에서 알게 된 것 — **jsdom 은 D1 을 볼 수 없다**

처음 쓴 테스트는 `size` 가 `width`·`height` 속성 둘 다로 나가는지 확인했다. **결함을 되살려도 통과했다.**
당연하다 — 옛 구현도 두 속성은 똑같이 내보냈고, 문제는 `w-full` 이 CSS 캐스케이드에서 `width` 를 이긴 것이었다.
jsdom 에는 Tailwind CSS 가 없으니 그 승부 자체가 일어나지 않는다.

그래서 **D1 의 회귀 감시를 "기본 클래스에 크기 유틸(`w-` `h-` `size-` `min/max-*`)이 하나도 없다" 로 바꿨다.**
크기 유틸이 다시 들어오는 순간 D1 이 되살아나므로, 원인을 직접 지키는 셈이다.
같은 이유로 D2 테스트도 성격을 고쳐 적었다 — S2 에서 기본값 자체를 없애 증상이 사라졌으므로
회귀 감시가 아니라 **계약 가드**다.

> **`902` 로 넘기는 관찰.** "컴포넌트 테스트를 어디까지 할 것인가"(`902-04`)의 답에 직결된다.
> 렌더된 실제 크기·색·레이아웃은 이 계층에서 검증할 수 없다. **CSS 가 걸린 것은 스토리(`901`)나
> 브라우저 검증의 몫**이고, 테스트는 **그 결함의 원인이 되는 입력**을 지키는 데 쓰는 편이 낫다.

### 테스트가 실제로 잡는지 확인했다

통과만으로는 근거가 안 되므로 결함을 하나씩 **주입해서** 확인했다. 5개 전부 잡혔고,
**주입마다 정확히 1개만 깨졌다** — 테스트가 서로 과결합돼 있지 않다는 뜻이다.

| 주입한 회귀                                    | 잡은 테스트                                    |
| ---------------------------------------------- | ---------------------------------------------- |
| 옛 기본 `className="w-full items-center"` 부활 | 기본 클래스가 크기를 건드리지 않는다 (D1 · D3) |
| `decorative` 분기 제거                         | decorative 는 안내를 끈다 (A2)                 |
| `motion-reduce:` 제거                          | 모션 저감에서 멈추지 않고 늦춘다 (A3)          |
| 기본 `size` 를 `2em` 으로                      | size 를 주지 않으면 1em 이다 (Q3)              |
| `data-tag` 제거                                | data-tag 를 붙인다 (C4)                        |

`@testing-library/jest-dom` 은 도입하지 않았다. 속성·클래스 확인에는 기본 matcher 로 충분하다.
RTL 자동 cleanup 은 `globals` 를 켜야 등록되므로 `afterEach(cleanup)` 을 파일에서 직접 붙였다 — **양식 후보.**

## 12. 다음 단계

`001-TxSpinner-S4` — 스토리북. `901` 양식을 여기서 만든다. 남은 것은 **D5·C5·C7**:
제목을 `Feedback/TxSpinner` 로, `docs.description.component` 의 `"…"` 플레이스홀더 교체, 스토리 3개 이상.
§6 의 예제 3개가 그대로 스토리 후보다.

인계 사항:

- **`001-TxLoading-S1`** — `Dots` → `TxSpinner` 교체 (§5 Q2)
- **`001-typenames`** — `ITx*` 53개 일괄 리네임 (§5 Q1)
- **`001-TxButton-S1`** — `.theme.ts` 를 전 컴포넌트 필수로 할지 결정. 그 결과가 C3 을 다시 연다
