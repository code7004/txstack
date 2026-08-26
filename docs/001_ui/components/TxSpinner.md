# TxSpinner

> **플로우 S1 산출물.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md) · 파일럿 1차
> 상태: **S1~S4 + 🧑 확인 + S6 완료 (2026-08-25). 남은 것은 S5(문서 사이트) 하나뿐이고, `903` 미정으로 ⏸ 보류다.**
> **공개 API 는 게이트에서 확정됐다.**
> 이 문서가 `TxSpinner` 의 단일 진실 공급원이다.

현재 코드: `packages/ui/src/TxSpinner/TxSpinner.tsx` (구현 + props 타입) · `index.ts` (재수출) ·
`TxSpinner.test.tsx` (15개) · `TxSpinner.stories.tsx` (`Feedback/TxSpinner`, 5개)

## 진행

| 단계 | 내용                                           | job ID             | 상태 | 비고                                                     |
| ---- | ---------------------------------------------- | ------------------ | ---- | -------------------------------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝                | `001-TxSpinner-S1` | ✅   | Q1~Q4 결정 완료                                          |
| `S2` | 구현 = 감사 결과 반영 🤖                       | `001-TxSpinner-S2` | ✅   | D1–D5 · A1–A3 · C1~C7 처리. changeset 작성됨. 검증은 §9  |
| `S3` | 테스트 🤖                                      | `001-TxSpinner-S3` | ✅   | 15개. jsdom 한계 발견 → §11                              |
| `S4` | 스토리북 🤖                                    | `001-TxSpinner-S4` | ✅   | 스토리 5개(플레이그라운드 포함) → §12                    |
| 🧑   | **사용자 확인** — Storybook 에서 직접 만져본다 | —                  | ✅   | **통과 (2026-08-25).** 2건 잡아 고친 뒤 승인 → §12       |
| `S5` | 문서 사이트 🤖                                 | `001-TxSpinner-S5` | ⏸    | **`903` 도구 미정으로 보류.** S6 를 먼저 했다 → §15      |
| `S6` | 에이전트 가이드 🤖                             | `001-TxSpinner-S6` | ✅   | `packages/ui/AGENTS.md`. **동봉 안 함으로 재결정** → §14 |

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

**단, `decorative` 가 켜지면 `role`·`aria-label` 은 소비자가 준 값이라도 버린다.** 둘을 같이 주는 건 모순이고,
`aria-hidden` 요소에 남은 라벨은 읽히지도 않으면서 마크업만 어지럽힌다. 꺼져 있을 때는 소비자 값이 기본값을 이긴다.

| 항목               | 값                                                                        | 근거  |
| ------------------ | ------------------------------------------------------------------------- | ----- |
| export             | **named** (`export const TxSpinner`)                                      | C1    |
| 타입 이름          | `TxSpinnerProps` — **`I` 접두 없음**                                      | §5 Q1 |
| `size` 기본값      | `"1em"`                                                                   | §5 Q3 |
| `className` 기본값 | **없음.** 내부 클래스와 `cm()` 으로 병합한다                              | D2    |
| 스크린리더 문구    | `aria-label` 기본 `"Loading"`. 소비자가 `aria-label`·`role` 로 덮는다     | A1    |
| 애니메이션         | `animate-spin` + `prefers-reduced-motion` 시 **느려진다 (멈추지 않는다)** | A3    |
| DOM 표식           | `data-tag="TxSpinner"`                                                    | C4    |

### 파일 구조

```
packages/ui/src/TxSpinner/
├─ TxSpinner.tsx          구현 + TxSpinnerProps
├─ TxSpinner.stories.tsx  Feedback/TxSpinner (스토리 5개)
├─ TxSpinner.test.tsx     회귀 테스트 15개
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

| 항목         | 처리                                                                                                 | 파일                                            |
| ------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| C1 · C2      | `TxSpinner.tsx` 로 분리, named export. `index.ts` 는 `export * from "./TxSpinner"` 만                | `TxSpinner.tsx` · `index.ts`                    |
| Q1 · C6      | `TxSpinnerProps`, `import type { SVGProps } from "react"`                                            | `TxSpinner.tsx:1,4`                             |
| D1 · D2 · D3 | 기본 `className` 제거 → `cm()` 병합. `w-full` · `items-center` 사라짐                                | `TxSpinner.tsx:41`                              |
| C4           | `data-tag="TxSpinner"`                                                                               | `TxSpinner.tsx:36`                              |
| Q3 · D4      | `size?: number \| string` 기본 `"1em"`. 거짓 주석 교체                                               | `TxSpinner.tsx:6`                               |
| A1 · A2      | `decorative` 분기. 끄면 `role="status"`+`aria-label="Loading"`, 켜면 `aria-hidden`                   | `TxSpinner.tsx:30`                              |
| A3           | `motion-reduce:[animation-duration:2s]` — 멈추지 않고 늦춘다                                         | `TxSpinner.tsx:41`                              |
| C1 (배럴)    | `src/index.ts` 의 default 특례 재수출에서 `TxSpinner` 줄 제거                                        | `packages/ui/src/index.ts`                      |
| A2 (적용)    | `TxButton` 기본 `loading` → `<TxSpinner decorative />`, import 도 named 로                           | `packages/ui/src/TxButton/index.tsx:4,41`       |
| D1 (증거)    | 소비자 우회 `className="w-auto"` 제거                                                                | `apps/playground/src/pages/UiButtonPage.tsx:40` |
| D5           | **부분 처리.** 기본값을 덮던 `args` 만 걷어냈다. 제목·설명·스토리 수(C5·C7)는 **S4 에서 완료 → §12** | `TxSpinner.stories.tsx`                         |

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

## 12. S4 스토리북 (2026-08-25)

`TxSpinner.stories.tsx` 전면 개편. **D5 · C5 · C7 이 여기서 닫힌다.**

| 스토리               | 보여주는 것                                                                          | 컨트롤   |
| -------------------- | ------------------------------------------------------------------------------------ | -------- |
| **`플레이그라운드`** | **직접 만져보는 자리.** 4개 prop 모두 살아 있고 즉시 반영된다                        | **live** |
| `기본`               | 아무것도 주지 않은 상태. **args 로 기본값을 덮지 않는다** (D5)                       | 꺼짐     |
| `크기`               | 두 갈래 — 부모 `text-*` 상속 vs `size`. 윗줄은 같은 `<TxSpinner />` 가 셋으로 보인다 | 꺼짐     |
| `색`                 | `currentColor` 상속 vs `className` 직접 지정                                         | 꺼짐     |
| `장식용`             | `decorative` 유무의 차이, `TxButton` 안에서의 실제 쓰임                              | 꺼짐     |

- 제목 `Feedback/TxSpinner` — `TxLoading`·`TxClipboardButton` 과 같은 그룹 (C5)
- `docs.description.component` 의 `"…"` 플레이스홀더를 실제 설명으로 교체 (D5).
  **"주의점부터 적는다"** — `size` 에 클래스를 주면 안 된다는 것(D4 의 재발 방지)이 앞쪽에 온다
- `argTypes` 에 `size`·`decorative`·`className`·`aria-label` 4개 모두 설명을 달았다

### 처음 판은 만질 수 없었다 — 게이트가 잡은 것 ①

첫 S4 산출물은 스토리 5개를 전부 **보여주기용**으로 짰다. `render: () => …` 를 쓰니 args 가 무시돼서
**컨트롤 패널을 만져도 아무 일이 일어나지 않았다.** `기본` 만 args 를 받았는데, 그마저 `args` 를 비워 둬서
모든 컨트롤이 "Set string" 버튼으로 접혀 있었다 — 패널이 비어 보인다.

D5("args 로 기본값을 덮지 않는다")를 **과잉 적용한 것**이다. D5 의 취지는 "의미 있는 기본값을 덮지 마라"였는데,
S2 에서 기본 `className` 자체를 없앴으므로 이제 덮을 기본값이 없다. 오히려 args 를 채워야 플레이그라운드가 된다.

고친 방식:

- **`플레이그라운드` 를 첫 스토리로 세우고 args 를 채웠다.** `render: (args) => …` 로 받아서 컨트롤이 즉시 반영된다
- 눈에 안 보이는 prop(`decorative`·`aria-label`)은 **스크린리더가 뭐라고 읽는지를 한 줄로 표시**했다.
  안 그러면 토글해도 아무 변화가 없어 보인다
- 비교용 스토리(`기본`·`크기`·`색`·`장식용`)는 `controls: { disable: true }` 로 **컨트롤 탭 자체를 없앴다.**
  죽은 손잡이를 보여주지 않는다
- `안내_문구_교체` 스토리는 없앴다 — 플레이그라운드의 `aria-label` 컨트롤이 그 역할을 한다

### `decorative` 가 `aria-label` 을 못 버리고 있었다 — 게이트가 잡은 것 ②

플레이그라운드에서 `aria-label="Loading"` 이 들어간 채로 `decorative` 를 켜 보니
**`aria-label` 이 그대로 남았다.** `{...props}` 를 `{...a11y}` 뒤에 펼친 탓에 소비자가 준 값이 살아남은 것이다.

명세 §2 는 "`role`·`aria-label` 을 빼고 `aria-hidden` 을 붙인다" 라고 적혀 있으니 **구현이 명세를 어긴 상태**였다.
`aria-hidden` 요소의 라벨은 읽히지도 않아 실害는 없지만, 마크업이 거짓말을 한다.

`role` 과 `aria-label` 을 구조분해로 따로 꺼내 **장식용일 때는 소비자가 준 값이라도 버리도록** 고쳤다.
꺼져 있을 때는 여전히 소비자 값이 기본값을 이긴다. 회귀 테스트 2개 추가 (13 → **15개**).

> S3 테스트는 이걸 못 잡았다. `<TxSpinner decorative />` 단독만 검사했고 **`decorative` + `aria-label` 조합**은
> 짚지 않았기 때문이다. 조합에서 나오는 결함은 사람이 만지다 나온다 — 게이트가 있는 이유가 이거다.

### 여기서 D1 이 처음으로 **실물로** 증명됐다

S3 이 못 하던 층이다. 실제 브라우저 + 실제 Tailwind 에서 `크기` 스토리의 스피너 6개를 실측했다.

| 준 것                | 렌더된 크기 |
| -------------------- | ----------- |
| `text-xs` 부모       | 12 × 12     |
| `text-base` 부모     | 16 × 16     |
| `text-2xl` 부모      | 24 × 24     |
| `size="1.5em"`       | 21 × 21     |
| `size={32}`          | 32 × 32     |
| `className="size-8"` | 32 × 32     |

**6개 전부 정사각형**이고 폰트 크기 상속이 설계대로 동작한다. 옛 구현이었다면 폭이 컨테이너 전체였다.
`className="size-8"` 이 `size` 를 이기는 것도 확인됐다 — §3 의 "클래스로 크기를 덮을 수 있다" 가 사실이다.

`장식용` 스토리에서 두 스피너의 ARIA 도 실측했다 — 기본은 `role="status"`+`aria-label="Loading"`,
`decorative` 는 `aria-hidden="true"` 에 둘 다 없음.

> **`901` 로 넘기는 관찰** (`901-02`·`901-03` 재료):
>
> 1. **스토리는 "props 를 하나씩 보여주는 것"이 아니라 "판단 기준을 보여주는 것"이 낫다.**
>    `크기` 스토리의 값은 크기 목록이 아니라 **"두 갈래 중 어느 쪽을 쓸 것인가"** 다.
> 2. **CSS 가 걸린 결함의 검증처는 여기다.** 테스트(`902`)는 원인을, 스토리(`901`)는 결과를 지킨다.
>    D1 이 그 경계를 실제로 그었다 — §11 과 함께 읽어야 한다.
> 3. `docs.description.component` 는 **주의점부터** 적었다. 소비자가 틀리는 지점이 감사에 이미 있다(D4).

## 13. 🧑 사용자 확인 결과 — **통과 (2026-08-25)**

Storybook 에서 직접 만져보고 승인. **되돌리지 않았다(`↩` 아님).**

확인 과정에서 2건이 나왔고 통과 전에 고쳤다 — §12 참고.

1. 스토리를 만질 수 없었다 (컨트롤이 죽어 있었다) → `플레이그라운드` 신설
2. `decorative` 가 소비자의 `aria-label` 을 못 버렸다 → 구현 수정 + 회귀 테스트 2개

**남겨둔 판단 — 다시 열지 않는다.** 확인 때 함께 물었고 현행 유지로 정리됐다.

| 물어본 것                | 결과                                               |
| ------------------------ | -------------------------------------------------- |
| 기본 크기 `1em`          | 유지 (이전 `2em` 에서 줄인 것 그대로)              |
| 12스포크 SVG 모양        | 유지 — §5 Q4 의 "원호로 교체"는 계속 버린 대안이다 |
| `aria-label` 영어 기본값 | 유지. 소비자가 `aria-label` 로 덮는다              |

**이로써 공개 API 가 확정됐다.** S5·S6 은 이 명세를 그대로 옮겨 쓰면 된다.

## 14. S6 Claude 가이드 (2026-08-25)

`packages/ui/AGENTS.md` — `904` 골격을 여기서 만들었다. **S5 보다 먼저 했다** (사유는 §15).

### 배포 방식이 바뀌었다

`904` README 는 "패키지에 동봉한다 **(확정)**" 이었는데 **뒤집었다.** 새 방식은 **문서 사이트에서 다운로드.**

근거: **동봉해도 어차피 자동으로 안 읽힌다.** `node_modules/*/CLAUDE.md` 는 자동 로드되지 않으므로
소비자가 자기 `CLAUDE.md` 에서 가리켜야 하는 건 동봉이든 다운로드든 같다. 그렇다면 동봉으로 얻는 게
크지 않고 패키지 무게와 `files` 관리 부담만 남는다.

- 소스는 `packages/ui/AGENTS.md` — **패키지 폴더 안이지만 `files` 밖**이라 npm 에 안 실린다
  (`npm pack --dry-run` 으로 확인). 코드 옆에 둬야 컴포넌트를 고칠 때 같이 갱신된다
- 복사 파이프라인을 만들지 않는다. 사이트가 이 파일을 그대로 서빙한다
- **잃는 것: 버전 일치.** 동봉이면 설치 버전과 자동으로 맞았다.
  → `903` 에 "가이드를 버전별로 받을 수 있어야 한다" 를 요구사항으로 넘겼다

### 담은 것 — "타입이 못 하는 말만"

`dist/index.d.ts` 가 이미 패키지에 들어간다. **시그니처를 문서에 베끼면 갱신 지점이 둘이 되고 갈린다** —
실제로 changeset 하나가 `ITxSpinnerProps` 로 어긋나 있었다. 타입은 빌드마다 자동으로 맞지만 문서는 사람이 고친다.

그래서 가이드는 타입이 말해주지 못하는 것만 담았다.

| 담은 것                       | 왜                                                                      |
| ----------------------------- | ----------------------------------------------------------------------- |
| Tailwind `@source` 설정       | **빠뜨리면 스타일이 전부 사라진다.** 이 패키지 최대의 함정              |
| `size="w-6"` 은 무효          | **타입은 통과하는데 동작을 안 한다.** D4 가 사람·에이전트 둘 다 속인 것 |
| 언제 다른 걸 쓰나             | 문구 필요 → `TxLoading`, 버튼 로딩 → `TxButton`. 오용을 앞에서 막는다   |
| `decorative` 를 켜면 안 될 때 | 스피너만 있는 자리에서 켜면 로딩 사실이 전달되지 않는다                 |
| 하지 말 것                    | 없는 prop 발명, 서브패스 임의 생성, `dist` 직접 import                  |
| props 표                      | **자주 쓰는 3개만.** "전체는 `.d.ts` 를 보라" 로 넘긴다                 |

게재 기준도 정했다 — **게이트를 통과한 컴포넌트만 싣는다.** (Storybook 은 전부 싣지만, 가이드는 다르다 — 검증 안 된 API 를 에이전트에게 사실처럼 주지 않는다.)
검증 안 된 API 를 에이전트에게 사실처럼 주지 않는다.

### 아직 안 한 것

- **실제 검증** — 에이전트에게 이 파일만 주고 코드를 쓰게 해보는 것. 지금은 컴포넌트가 1종뿐이라
  통과해도 가이드가 좋아서인지 문제가 쉬워서인지 갈리지 않는다. **3~4종 쌓인 뒤** (`904-06`)
- **분량 상한** — 같은 이유로 판단 표본이 없다
- **배포** — `903` 대기 (`904-05b`)

## 15. 다음 단계

`001-TxSpinner-S5` — 문서 사이트. **`903` 은 코드가 아예 없어서, 사이트를 무엇으로 세울지가
🤝 결정으로 먼저 걸린다.** S6 를 먼저 한 이유가 이것이다 (플로우 §5 "생략·순서 변경은 사유를 남긴다").

정리된 판단 재료:

- Storybook 하나로 갈음하는 안은 **버렸다.** 패키지 4종 중 `ui` 만 맞고, Storybook 은 이미
  🧑 확인 게이트라는 역할을 받아서 게재 기준이 둘로 갈린다
- 사이트가 져야 할 것: 설치·`@source` 안내 · 패키지 4종 대등하게 · 검색 · **가이드 버전별 다운로드**(§14)
- 도구는 마지막에 고른다 — `903` README 가 정한 순서다

인계 사항:

- **`001-TxLoading-S1`** — `Dots` → `TxSpinner` 교체 (§5 Q2)
- **`001-typenames`** — `ITx*` 53개 일괄 리네임 (§5 Q1)
- **`001-TxButton-S1`** — `.theme.ts` 를 전 컴포넌트 필수로 할지 결정. 그 결과가 C3 을 다시 연다
