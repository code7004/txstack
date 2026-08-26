# TxButton

> **플로우 S1 산출물.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md) · **파일럿 2차**
> 상태: **2차 `S1`~`S4` + 🧑 확인 + `S6` 까지 끝났다 (2026-08-26).** 상세는 §14~§20. 남은 것은 `S5`(⏸) 뿐이다.
> 게이트 직전 테마 스파이크에서 **결함 D8 이 나와 상태 레이어를 도입했다** — §19.
> **여기서 확정했던 커스터마이징 3단(`className`/`theme`/`TxThemeProvider`)은 폐기됐다** — §5 Q1 참고.
> 이 문서가 `TxButton` 의 단일 진실 공급원이다.

현재 코드: `packages/ui/src/TxButton/TxButton.tsx` · `TxButton.css` · `index.ts` ·
`TxButton.test.tsx` (41개) · `TxButton.stories.tsx` (`Form/TxButton`, 6개) ·
전역 토큰 `packages/ui/src/tokens.css`

## 진행

| 단계 | 내용                                           | job ID            | 상태 | 비고                                              |
| ---- | ---------------------------------------------- | ----------------- | ---- | ------------------------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝                | `001-TxButton-S1` | ✅   | 커스터마이징 방식 확정 → §5                       |
| `S2` | 구현 = 감사 결과 반영 🤖                       | `001-TxButton-S2` | ✅   | **2차 완료 → §14.** 1차 기록은 §8                 |
| `S3` | 테스트 🤖                                      | `001-TxButton-S3` | ✅   | **2차 41개 → §15·§19.** 1차 20개는 §11            |
| `S4` | 스토리북 🤖                                    | `001-TxButton-S4` | ✅   | **2차 6개 → §16.** 1차 6개는 §12                  |
| 🧑   | **사용자 확인** — Storybook 에서 직접 만져본다 | —                 | ✅   | **2차 통과 → §20.** 실측 §17 · 스파이크 §19       |
| `S5` | 문서 사이트 🤖                                 | `001-TxButton-S5` | ⏸    | `903` 도구 미정으로 보류 (TxSpinner 와 같은 사유) |
| `S6` | 에이전트 가이드 🤖                             | `001-TxButton-S6` | ✅   | **2차 완료 (2026-08-26).** 삭제된 API 를 걷어냈다 |

> **2026-08-25 — 게이트를 `↩` 로 되돌렸다.** [20_design](../20_design.md) 에서 **스타일을 Tailwind 클래스
> 문자열에서 자체 CSS 로** 바꾸기로 했다. `TxButton` 은 그 방침으로 `S2`~`S4` 를 다시 돈다.
>
> **§2·§3 은 새 방침으로 다시 썼다.** 나머지 `S1`(§1·§4~§7)은 그대로 유효하다 — 목적·감사·접근성·범위 밖
> 판정은 스타일 방식과 무관하다. 아래 `§8` 이후의 처리·검증 기록은 **1차의 기록으로 남긴다.**
> 지우지 않는다 — 왜 이렇게 왔는지가 거기 있다.

## 1. 목적

**누르면 뭔가 일어나는 자리.** 그 이상은 하지 않는다.

- 소비자가 직접 하면: 색·여백·포커스 링·`disabled` 스타일을 매번 다시 정하고,
  **비동기 작업 중 중복 클릭을 막는 코드를 화면마다 다시 쓴다.**
- 후자가 이 컴포넌트의 진짜 값이다. `onClick` 이 Promise 를 반환하면 **잠금과 스피너가 저절로 붙는다.**

## 2. 공개 API

```ts
export interface TxButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label?: string; // 버튼 텍스트. children 을 써도 된다 (label 이 우선)
  variant?: TxButtonVariant; // 기본 "primary". data-variant 로 나가고 CSS 로 늘린다
  loading?: ReactElement; // 로딩 중 보여줄 엘리먼트. 기본은 장식용 스피너
  classNames?: { label?: string }; // 안쪽 슬롯
  onClick?: (e: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
}

export type TxButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "text" | (string & {});
```

| 항목           | 값                                                           | 근거  |
| -------------- | ------------------------------------------------------------ | ----- |
| `type` 기본값  | **`"button"`** — 제출 버튼만 `type="submit"` 을 명시한다     | D1    |
| variant 5종    | `primary` `secondary` `danger` `ghost` `text`. **열려 있다** | §5 Q3 |
| DOM 속성       | `data-variant` · `data-loading` — 바깥에서 조준하는 자리     | §3    |
| `color` prop   | **없앴다.** 색은 토큰 또는 `className` 으로                  | §5 Q2 |
| `onEnter` prop | **없앴다.** 버튼은 Enter 로 이미 click 이 발생한다           | D3    |
| `aria-label`   | **자동으로 붙이지 않는다.** 소비자가 준 것만 통과            | D4    |
| DOM 표식       | `data-tag="TxButton"`                                        |       |

`ButtonHTMLAttributes` 의 나머지(`title` · `form` · `autoFocus` …)는 그대로 통과한다.

## 3. 커스터마이징 지점 — **세 경로, 겹치지 않는다**

규약은 [20_design §4](../20_design.md) 가 소유한다. 여기서는 `TxButton` 의 실제 토큰과 슬롯만 적는다.

```html
<button class="tx-button" data-tag="TxButton" data-variant="primary" data-loading>
  <span class="tx-button__label">저장</span>
</button>
```

| 무엇을 바꾸나         | 무엇으로                 | 예                                        |
| --------------------- | ------------------------ | ----------------------------------------- |
| **값** (색·반경·여백) | **CSS 변수**             | `:root { --tx-color-primary: #7c3aed }`   |
| 이 variant 만         | 클래스 + `data-*` 선택자 | `.tx-button[data-variant="danger"] { … }` |
| 이 버튼 하나의 겉     | `className`              | `<TxButton className="my-cta" />`         |
| 안쪽 라벨             | `classNames={{ label }}` | `classNames={{ label: "truncate" }}`      |

**값은 토큰으로 바꾼다.** 그러면 `hover`·`pressed`·`focus`·`.dark` 가 **저절로 따라온다.**

```css
/* 앱 전체 — 이 한 줄이면 5종 variant 가 다 따라온다 */
:root {
  --tx-color-primary: #7c3aed;
}

/* 새 variant 를 늘리는 법 — 배경과 글자만 준다 */
.tx-button[data-variant="warning"] {
  --tx-button-bg: #f59e0b;
  --tx-button-fg: #000;
}
```

**상태 색은 적지 않는다.** `hover` 와 눌린 색은 `--tx-button-bg` 에서 계산된다 →
[20_design §5-1](../20_design.md). 비율만 바꾸려면 `--tx-state-hover` · `--tx-state-pressed` 다.

> **이 자리에서 같은 함정을 두 번 밟았다.** 1차에는 테마가 Tailwind 클래스 문자열이라
> `className="bg-yellow-500"` 을 줘도 `hover:bg-blue-600` 이 남아 **평상시만 노랑**이 됐다 (§10 ①).
> CSS 로 옮기고 나니 이번엔 `--tx-color-primary` 만 바꾸면 **평상시만 보라**가 됐다 (D8 → §19).
> **메커니즘이 두 번 바뀌는 동안 증상은 같았다** — 상태 색을 따로 들고 있는 한 계속 어긋난다.
> 파생으로 바꾸고 나서야 닫혔다.

## 4. 현행 코드 감사

판정: **수정.** 결함 7건 중 **2건이 무겁다** (D1 폼 오제출 · D2 포커스 링 부재).

### 결함

| ID  | 내용                                                                                                                                                                                       | 근거                                                                                   | S2 처리                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| D1  | **`type` 미지정 → 폼 안의 모든 버튼이 폼을 제출한다.** HTML 기본값이 `submit` 이다. `TxForm` 은 실제 `<form>` 을 렌더한다                                                                  | `TxFormBase.tsx:21` · `TxForm.stories.tsx:60` 이 이미 `type="submit"` 을 명시하고 있다 | 기본값 `"button"`                                           |
| D2  | **`variant="text"` 만 `base` 를 건너뛴다.** `focus-visible:ring`·`disabled:*` 를 전부 잃는다 — **키보드 사용자가 포커스 위치를 볼 수 없다**                                                | `index.tsx:63` 의 `variant === "text" ? ...` 분기                                      | 분기 제거. `text` 가 지울 것은 테마에서 명시적으로 되돌린다 |
| D3  | **`onEnter` 가 중복이다.** 버튼은 포커스 상태에서 Enter 를 누르면 브라우저가 click 을 발생시킨다. 지금은 `onEnter` 와 `onClick` 이 **둘 다** 불린다                                        | `index.tsx:45`                                                                         | prop 폐기                                                   |
| D4  | **`aria-label` 을 자동으로 박는다.** `title \|\| label` 을 넣는다. 보이는 글자가 있는 버튼엔 불필요하고, `title` 과 `label` 이 다르면 화면과 낭독이 어긋난다                               | `index.tsx:71`                                                                         | 자동 설정 중단                                              |
| D5  | **동기 `onClick` 도 로딩으로 감싼다.** `Promise.resolve()` 로 무조건 감싸 스피너가 한 프레임 깜빡인다                                                                                      | `index.tsx:53`                                                                         | thenable 일 때만 잠근다                                     |
| D6  | **`onClick` 의 에러를 `console.error` 로 삼킨다.** 소비자가 못 잡는다. [01_ARCHITECTURE §4-2](../../00_foundation/01_ARCHITECTURE.md) "런타임 정책을 패키지가 결정하지 않는다" 와 어긋난다 | `index.tsx:56`                                                                         | **보류.** 아래 참고                                         |
| D7  | **`ghost`·`text` 가 다크모드에서 배경이 남는다.** `base` 의 `dark:bg-gray-800` 은 `bg-transparent` 로 안 지워진다 — `dark:` 는 별도 규칙이다                                               | `TxButton.theme.ts` variants                                                           | `dark:bg-transparent` 추가                                  |

**D8 은 2차 이후에 나왔다** — CSS 전환이 만든 결함이라 위 표(1차 감사)에 없다.

| ID  | 내용                                                                                                                                                                           | 근거                     | 처리                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | --------------------------------------------------------- |
| D8  | **`--tx-color-primary` 를 바꿔도 hover 가 안 따라온다.** `--tx-button-bg-hover` 가 별개 리터럴 토큰(`--tx-color-primary-hover`)을 읽어서, 색을 바꾸려면 **둘을 짝지어야** 한다 | 테마 스파이크 실측 → §19 | **상태 레이어로 파생.** [20_design §5-1](../20_design.md) |

> **1차 게이트에서 잡은 것과 같은 모양이다.** 그때는 `className="bg-yellow-500"` 만 주면 "평상시만 노랑"
> 이었고, 그걸 고치려고 CSS 로 전환했다. 그런데 `--tx-color-primary` 만 주면 **"평상시만 보라"** 가 됐다.
> **메커니즘만 바뀌고 증상이 돌아왔다.** 문서·changeset·스토리 셋 다 "한 줄이면 된다" 고 적고 있었으므로
> 코드뿐 아니라 그 문장들도 함께 고쳤다.

> **D6 을 보류한 이유.** 고치려면 `onError` prop 을 추가하거나 에러를 다시 던져야 하는데,
> 다시 던지면 unhandled rejection 이 되고 prop 추가는 공개 API 확대다. **어느 쪽도 합의 전이다.**
> 지금은 로그만 남기고 코드에 사유 주석을 달아 뒀다. `TxForm` 계열의 에러 처리와 함께 정하는 게 낫다.

### 규약 이탈 — TxSpinner 에서 정해진 것과 같은 항목

| ID  | 내용                                     | S2 처리                                                                                      |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| C1  | `ITxButtonProps` — `I` 접두              | `TxButtonProps` (TxSpinner §5 Q1)                                                            |
| C2  | 구현이 `index.tsx` 안에 있다             | `TxButton.tsx` + `index.ts` 로 분리                                                          |
| C3  | `import React from "react"` · `React.FC` | 타입만 named import. `React.FC` 제거                                                         |
| C4  | **테마가 비공개였다**                    | `TxButtonTheme` 등을 배럴로 내보낸다. 26종 중 15종은 이미 공개였다 — TxButton 만 빠져 있었다 |

### 남긴 것

- **`label` 과 `children` 이 공존한다** (`label || children`). 둘 다 주면 `children` 이 무시된다.
  이번 결정 목록에 없어서 그대로 뒀다. 정리하려면 별도 합의가 필요하다
- **스토리 그룹이 `Form/`** 이다. 버튼이 폼 전용은 아니라 어색하지만 그룹 체계는 `901-01` 소관이다

## 5. 설계 결정 (2026-08-25 합의) — **파일럿 2차의 본론**

| ID  | 질문                                         | 결정                                                        |
| --- | -------------------------------------------- | ----------------------------------------------------------- |
| Q1  | 커스터마이징 방식                            | ~~theme + `TxThemeProvider` 3단~~ → **뒤집혔다.** 아래 참고 |
| Q2  | `variant` 와 `color` 의 중복                 | **`color` 폐기.** `variant` 만 남긴다                       |
| Q3  | `variant` 를 소비자가 늘릴 수 있게 할 것인가 | **열어둔다.** `(string & {})`                               |
| Q4  | 콜백 이름 규칙                               | **살린다 + 어휘를 5개로 닫는다.** `Item`·`Value` 를 가른다  |

### Q1 — 진짜 구멍은 "theme 이냐 classNames 냐" 가 아니었다

처음에는 `theme` 객체 / `classNames` 슬롯 / CSS 변수 중 고르는 문제로 봤다. **틀린 질문이었다.**

되던 것: 인스턴스 미세 조정(`className`), 인스턴스 내부 슬롯(`theme` prop, 19종).
**안 되던 것: 전역 브랜딩.** "우리 회사 primary 는 보라색" 을 한 번에 먹일 방법이 없었다 —
호출마다 `theme` 을 넘기거나 소비자가 래퍼를 26개 만들어야 했다.
`TxTheme` 모듈은 상수 `export` 라 소비자가 바꿀 수 없다.

**`classNames` 슬롯으로 바꿔도 이 구멍은 그대로 남는다.** 그래서 원래 선택지로는 답이 안 나왔다.

결론: **기존 구조를 유지하고 전역 경로를 하나 더 낸다.**

- 26종 중 19종이 이미 `theme` prop 을 노출하고 24개 파일이 `themeMerge` 를 쓴다 — 바꾸면 전부 재작업이다
- `themeMerge` 는 lodash 없이 구현돼 있고 테스트도 있다
- Provider 는 `useContext` 한 줄 + `themeMerge` 한 번 더가 전부다. **26종 재설계가 없다**

버린 대안:

- **`classNames` 슬롯** — 요즘 관행이고 배울 게 적지만, `variant` 같은 "값 집합"을 담을 곳이 사라지고
  전역 구멍을 못 메운다
- **CSS 변수** — **Tailwind `@source` 제약에서 벗어나는 유일한 길**이라 장기적으로 매력이 있다.
  다만 26종 전면 재설계이고 `dark:`·`hover:` 를 직접 써야 한다.
  → `001_ui/10_requirements` 의 "`@source` 제약을 유지할 것인가" 와 **같은 질문**이므로 거기서 다시 판단한다

#### 그리고 실제로 뒤집혔다 (2026-08-25)

위에서 "거기서 다시 판단한다" 고 미뤄 둔 그 질문을 [10_requirements §3](../10_requirements.md) 에서 열었고,
**버린 대안이던 CSS 변수를 채택했다.** 뒤집힌 이유는 이 결정이 틀려서가 아니라 **질문이 한 겹 얕았기** 때문이다.

- 여기서는 "**전역 브랜딩을 어떻게 먹이나**" 를 물었다. 그 답으로는 Provider 가 맞다
- 다시 물은 것은 "**소비자가 커스터마이징하려면 무엇을 설치해야 하나**" 였다.
  Provider 든 `theme` 이든 값이 Tailwind 클래스 문자열인 한, 답은 **"Tailwind"** 다 —
  범용 라이브러리로서는 그게 실격 조건이다
- CSS 로 오면 전역 브랜딩은 `:root` 한 줄이라 **Provider 가 풀던 문제 자체가 없어진다**

**남겨 둔 이유** — 이 절이 없으면 나중에 "왜 Provider 를 안 만들었지" 를 처음부터 다시 논의하게 된다.
결론은 [20_design §4](../20_design.md) 가 소유한다.

### Q2 — `color` 폐기

`variant`(의미 5종)와 `color`(팔레트 20종)가 같은 자리를 다투고 `color` 가 이겼다.

- **두 prop 이 같은 것을 정하는데 우선순위를 외워야 한다** — "예측 가능성" 과 정반대다
- 20색 × light/dark × hover 클래스가 전부 번들에 들어간다
- 색이 필요하면 `className`·`theme`·이제는 Provider 로도 된다

사용처는 스토리 하나뿐이라 마이그레이션 비용이 거의 없다.

### Q3 — `variant` 를 열어둔다

`theme` 으로 `variants` 에 키를 추가하는 건 원래도 됐는데 **타입만 막혀 있었다** (`keyof typeof`).
반쪽이라 열었다. `(string & {})` 를 유니온에 넣으면 기본 5종 자동완성을 살린 채 임의 문자열도 받는다.

비용: 오타를 타입이 못 잡는다. 그 대가로 `variant="brand"` 가 성립한다.

### Q4 — 콜백 이름 규칙 (추가 합의)

처음에는 "표본이 약하니 `TxInput` 때 정한다" 로 미뤘다. 그런데 **접미어를 왜 만들었는지**를 듣고
`TxInput` 코드를 열어보니 판단이 섰다.

```tsx
const [age, _age] = useState(10);
<TxInput onChangeNumber={_age} />; // 세터를 그대로 꽂는다. 파싱은 컴포넌트가 한다
```

**접미어는 타입 표시가 아니라 "컴포넌트가 대신 해주는 일" 이다.** `TxInput` 은 텍스트 입력 하나에서
세 가지를 만들어 낸다 — `onChangeText`(원본 문자열) · `onChangeNumber`(파싱) · `onChangeInt`(`Math.trunc`).
**타입만으로는 대체할 수 없는 값**이라 살린다.

**결정: 살리되 어휘를 5개로 닫는다.**

| 접미어    | 넘어오는 것                 |
| --------- | --------------------------- |
| (없음)    | **DOM 이벤트** (React 관례) |
| `Text`    | `string`                    |
| `Number`  | `number` (파싱)             |
| `Int`     | `number` (`Math.trunc`)     |
| `Boolean` | `boolean`                   |
| `Item`    | **항목 객체 전체**          |
| `Value`   | 그 항목의 **value 원시값**  |

- **금지**: `Numb` · `Bool` · `Nums` · `Float` (약어이거나 중복)
- **복수형은 배열을 뜻한다.** `onSubmitTexts: (values: string[]) => void`. 이름과 타입이 어긋나면 안 된다
- **시제는 현재형.** `onChangedText` ✗
- **동작이 같은 두 이름을 두지 않는다** — 아래 참고
- `Internal` 이 붙은 내부 콜백은 **공개 props 에 두지 않는다**

`Item` 과 `Value` 를 가른 게 이전 판과 다른 점이다. `TxDropdown` 의 `onChangeValue` 는 실제로
**항목 객체 전체**를 넘기는데, `value` 라는 단어가 원시값과 객체 두 뜻으로 쓰이고 있었다.

> **적용은 각 컴포넌트의 S2 에서 한다.** 공개 콜백 이름을 바꾸는 건 컴포넌트마다 breaking change 라,
> 테스트·스토리를 함께 고칠 수 있는 그 자리에서 하는 게 맞다. 일괄 리네임하지 않는다.

**감사에서 나온 두 건** (해당 컴포넌트 문서에 옮겨 적었다)

- `TxInput` 의 **`onChangeFloat` 와 `onChangeNumber` 는 같은 값을 넘긴다** — 이름만 둘이다
  (`TxInput.tsx:43,45` 가 둘 다 `num`). `Float` 금지의 실제 근거다
- `TxDropdown` 의 **`onChangeInternal`·`onSubmitInternal`·`onCloseInternal` 이 공개 props 에 있다**

## 6. 사용 예제

**흔한 케이스** — 비동기 작업. 잠금과 스피너가 저절로 붙는다.

```tsx
import { TxButton } from "@txstack/ui";

<TxButton
  label="저장"
  onClick={async () => {
    await save();
  }}
/>;
```

**폼 안에서** — 제출 버튼만 `type` 을 명시한다.

```tsx
<form onSubmit={hdSubmit}>
  <TxButton label="취소" variant="secondary" onClick={hdCancel} />
  <TxButton label="제출" type="submit" />
</form>
```

**앱 전체 브랜딩** — CSS 한 곳. 감쌀 컴포넌트가 없다.

```css
/* src/index.css — 앱에서 한 번 */
:root {
  --tx-color-primary: #7c3aed;
}

/* 없던 variant 를 추가한다 */
.tx-button[data-variant="brand"] {
  --tx-button-bg: #000;
  --tx-button-fg: #fff;
}
```

```tsx
<TxButton label="가입" variant="brand" />
```

**이 버튼 하나만** — 소비자가 쓰는 스타일 방식이 무엇이든 통한다.

```tsx
<TxButton label="저장" className="my-save-btn" />        // 순수 CSS·Sass
<TxButton label="저장" className="shadow-lg" />          // Tailwind 쓰는 프로젝트
<TxButton label="저장" classNames={{ label: "truncate" }} /> // 안쪽 슬롯
```

## 7. 하지 않는 것

- **아이콘 슬롯** (`iconLeft` 등) — `children` 으로 넣는다. 필요해지면 그때 만든다
- **크기 토큰** (`size="sm"`) — 여백은 `--tx-button-*` 토큰이나 `className` 으로. 크기 스케일을 라이브러리가 소유하지 않는다
- **링크 버튼** (`href`) — `<a>` 는 버튼이 아니다. 라우팅은 소비자 몫이다
- **버튼 그룹 · 토글 버튼** — 별도 컴포넌트다
- **에러 처리 정책** — D6 참고. 로그만 남긴다

## 8. S2 처리 결과 (2026-08-25)

| 항목          | 처리                                                                | 파일                                 |
| ------------- | ------------------------------------------------------------------- | ------------------------------------ |
| **Q1 (신설)** | `TxThemeProvider` · `useTxTheme` · `TxThemeOverrides`. **3단 병합** | `TxTheme/TxThemeProvider.tsx`        |
| Q2            | `color` prop 과 `TxButtonTheme.colors` 20종 제거                    | `TxButton.tsx` · `TxButton.theme.ts` |
| Q3            | `TxButtonVariant = keyof … \| (string & {})`                        | `TxButton.theme.ts`                  |
| D1            | `type = "button"` 기본값                                            | `TxButton.tsx`                       |
| D2            | `variant === "text"` 분기 제거. `base` 를 전 variant 가 통과        | `TxButton.tsx` · `.theme.ts`         |
| D3 · D4       | `onEnter` 폐기, `aria-label` 자동 설정 중단                         | `TxButton.tsx`                       |
| D5            | `isThenable` 로 Promise 일 때만 잠근다                              | `TxButton.tsx`                       |
| D7            | `ghost`·`text` 에 `dark:bg-transparent`                             | `TxButton.theme.ts`                  |
| C1~C4         | `TxButtonProps` · 파일 분리 · React import 정리 · 테마 공개         | 전부                                 |

빈 스텁이던 `packages/ui/src/TxTheme/TxThemeProvider.tsx` 를 채웠다 — 초기 커밋 때 자리만 잡혀 있었다.

**`TxThemeOverrides` 는 타입 전용 import 로 각 컴포넌트의 덮어쓰기 타입을 모은다.** 런타임에는 지워지므로
`TxTheme → TxButton.theme → TxTheme` 순환이 생기지 않는다. 컴포넌트를 연결할 때마다 한 줄씩 추가한다.
**지금은 `TxButton` 만 연결돼 있다.**

## 9. S2 검증 기록

| 검증             | 결과                                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`     | ✅ 91 tests / 7 files                                                                                                                                                       |
| `pnpm build`     | ✅ `TxButtonProps` · `TxButtonTheme` · `TxButtonVariant` · `TxButtonThemeOverride` · `TxThemeProvider` · `TxThemeOverrides` · `useTxTheme` 방출. `ITxButtonProps` 소멸 확인 |
| 3단 병합 (실물)  | ✅ Storybook `커스터마이징` 스토리 실측 — 기본 blue → Provider violet → 인스턴스 emerald. 새 variant `brand` 는 검정                                                        |
| D2 (실물)        | ✅ 5개 variant 전부 `focus-visible:ring-2` 보유, 여백 8px 균일                                                                                                              |
| D7 — 다크 (실물) | ✅ 테마 토글을 다크로 켜고 실측 — `ghost`·`text` **투명**, `secondary` gray-700, `primary` blue-600                                                                         |

> **한 번 잘못 짚었다.** 처음에는 콘솔로 프리뷰 `documentElement` 에 `.dark` 를 직접 넣고 쟀는데
> 버튼이 반응하지 않아 "미해결 관찰" 로 적었다. **검사 방법이 틀린 것이었다** —
> `preview.tsx` 의 데코레이터가 `classList.toggle("dark", theme === "dark")` 로 매 렌더 되돌린다.
>
> **Storybook 에는 이미 테마 토글이 있다** (툴바 ☀/🌙, 또는 `&globals=theme:dark`).
> 다크 검증은 그걸로 한다. **도구가 이미 제공하는 경로를 두고 직접 DOM 을 만지면 이런 착오가 난다.**

## 10. 🧑 사용자 확인 결과 — **통과 (2026-08-25)**

Storybook 에서 직접 만져보고 승인. **되돌리지 않았다(`↩` 아님).** 확인 중 2건이 나와 통과 전에 반영했다.

`text` 에 여백이 생긴 것, `type` 기본값 변경, 3단 병합, `TxThemeProvider` 라는 이름 —
**전부 현행 유지로 정리됐다.** 이로써 공개 API 와 **26종에 퍼질 커스터마이징 방식이 확정됐다.**

### 게이트에서 나온 것 ① — `className` 만으로는 색이 반만 바뀐다

> "버튼이 여러 개 나열될 때 노랑 바탕에 검은 글씨를 쓰고 싶을 때도 있잖아"

`<TxButton className="bg-yellow-500 text-black" />` 이 평상시만 노랑이 되는 문제다. §3 의 ⚠ 참고.

**판정: 고치지 않는다. 문서로 안내한다** (2026-08-25).

검토한 대안 —

| 대안                                                     | 버린 이유                                                |
| -------------------------------------------------------- | -------------------------------------------------------- |
| 색 없는 `variant="plain"` 추가                           | prop 표면이 늘고, "언제 plain 을 쓰나" 를 또 배워야 한다 |
| `className` 에 `bg-*` 가 있으면 variant 색을 통째로 뺀다 | **className 을 읽고 동작을 바꾸는 마법.** 예측이 어렵다  |
| 팔레트 prop 부활 (`tone` 등)                             | 방금 `color` 를 없앤 이유(의미/팔레트 중복)로 되돌아간다 |

**같은 색을 여러 번 쓸 거면 애초에 variant 를 하나 만드는 게 맞다** — 그게 3단 구조가 있는 이유다.
일회성 하나 때문에 API 를 늘리지 않는다. 대신 **함정이라는 걸 세 군데에 적었다** —
이 명세 §3, 스토리 설명, `packages/ui/AGENTS.md`.

### 게이트에서 나온 것 ② — 커스터마이징 스토리를 둘로 갈랐다

원래 `커스터마이징` 하나에 `className`·`theme`·Provider 를 다 쌓아 뒀다.
**범위가 다른 이야기를 한 화면에 올리니 "나는 지금 어느 경우인가" 가 안 보였다.**

`CustomizingClass` 와 `CustomizingProvider` 로 나눴다. 소비자가 **자기 상황부터 고르고** 들어온다.
`class` 쪽에 ✗/✓ 를 나란히 놓아 **마우스만 올리면 함정이 드러나게** 했다 — 글로 읽는 것보다 빠르다.

> **`901` 로 넘기는 관찰** (`901-03` 필수 구성 재료): **스토리는 기능이 아니라 "경우" 로 가른다.**
> 손잡이를 다 보여주는 스토리 하나보다, 소비자가 처한 상황별로 나눈 둘이 낫다.

## 11. S3 테스트

`TxButton.test.tsx` — 20개. **결함 7건을 하나씩 주입해 전부 잡히는 것을 확인했다.**

| 주입한 회귀                    | 잡은 테스트                                         |
| ------------------------------ | --------------------------------------------------- |
| `type` 기본값 제거             | type 기본값이 button 이다 (D1) 외 2건               |
| `text` 만 `base` 건너뛰기 부활 | 모든 variant 가 base 를 통과한다 (D2)               |
| `aria-label` 자동설정 부활     | aria-label 을 자동으로 붙이지 않는다 (D3)           |
| `disabled` 에 `cursor-wait`    | disabled 는 cursor-wait 가 아니다 (D4)              |
| 동기도 로딩 처리 부활          | 동기 onClick 은 로딩 상태로 들어가지 않는다 (D5)    |
| `dark:bg-transparent` 제거     | 표면을 지우는 variant 는 다크모드에서도 지운다 (D7) |
| Provider 전역 경로 무시        | TxThemeProvider 가 전역 기본값이 된다 외 2건        |

> **변이 테스트에서 사고가 하나 있었다.** 되돌리기를 `git checkout` 으로 했는데
> `TxButton.tsx` 는 아직 untracked 라 안 되돌아가고, 반대로 `TxThemeProvider.tsx` 는
> 추적 중인 **빈 스텁**으로 되돌아가 구현이 날아갔다. 복구해서 다시 돌렸다.
> **`902` 로 넘기는 교훈: 변이 테스트는 파일을 실제로 복사해 두고 되돌린다.** `git checkout` 은 새 파일에 쓸 수 없다.

D5 는 첫 변이가 **결함을 재현하지 못해 통과했다.** 동기 `setState` 두 번은 React 가 배치해 렌더가 생기지 않는다.
원래 결함 모양(`Promise.resolve()` 로 무조건 감싸기)으로 바꾸고서야 잡혔다 —
**변이가 결함을 진짜로 재현하는지도 확인해야 한다.**

## 12. S4 스토리북

`Form/TxButton` — 6개. TxSpinner S4 에서 만든 양식을 그대로 적용했다.

| 스토리                    | 보여주는 것                                               | 컨트롤   |
| ------------------------- | --------------------------------------------------------- | -------- |
| `Playground`              | 5개 prop 전부 살아 있다                                   | **live** |
| `Variant`                 | 의미 5종                                                  | 꺼짐     |
| `Loading`                 | 비동기 잠금 · 동기는 안 잠김 · 비활성                     | 꺼짐     |
| `InForm`                  | **`type` 기본값이 실제로 폼을 안 건드리는 것**            | 꺼짐     |
| **`CustomizingClass`**    | 이 버튼 하나만. **`hover:`·`dark:` 함정을 ✗/✓ 로 나란히** | 꺼짐     |
| **`CustomizingProvider`** | 앱 전체. 3단 우선순위 + 없던 variant 추가                 | 꺼짐     |

`VARIANTS` 를 하드코딩하지 않고 `Object.keys(TxButtonTheme.variants)` 로 뽑는다 —
테마에 variant 를 추가하면 스토리가 저절로 따라온다.

**커스터마이징을 한 스토리에 몰았다가 둘로 갈랐다** (게이트 피드백). 범위가 다른 이야기를
한 화면에 쌓으니 "나는 지금 어느 경우인가" 가 안 보였다. 이제 소비자가 자기 상황부터 고르고 들어온다.

- `class` — 흔한 경우. 여기에 **함정을 ✗/✓ 로 나란히** 놓아 마우스만 올려 보면 차이가 드러난다
- `Provider` — 같은 색을 여러 번 쓸 때. **`className` 반복 대신 variant 를 만드는 길**을 보여준다

## 13. 인계 사항

- **`001-TxLoading-S1`** — `Dots` → `TxSpinner` 교체 (TxSpinner §5 Q2)
- **`001-typenames`** — `ITx*` 나머지 일괄 리네임. `TxButton`·`TxSpinner` 는 이미 정리됨
- **나머지 24종 S2** — [20_design](../20_design.md) 대로 `<Name>.css` 를 만든다. **`useTxTheme` 은 쓰지 않는다**
- **`901-04`** — 스토리북 다크 토글. §9 의 미해결 관찰이 여기 걸린다
- **`902`** — 변이 테스트 절차(파일 복사 후 되돌리기 · 변이가 결함을 재현하는지 확인) → §11
- ~~**`001_ui/10_requirements`** — `@source` 제약 유지 여부~~ → **끝났다.** CSS 로 전환해 제약 자체가 사라졌다 (§5 Q1)
- **`001-TxButton-S2`(2차)** — `TxButton.css` 신설 · `theme`/`TxThemeProvider` 제거 · `data-variant` 로 전환.
  **`.changeset/brave-buttons-theme.md` 를 그때 다시 쓴다** — 지금은 `TxThemeProvider` 를 새 API 로 알리고 있는데,
  배포 전에 없어질 것이다. 아직 배포된 버전이 없어 changelog 를 고쳐 쓸 수 있다
- **`TxInput`** — 콜백 규칙 첫 적용처. `onChangeFloat` 폐기(중복) → 해당 문서에 옮겨 적음
- **`TxDropdown`** — `onChangeNumb`·`onChangeBool` 약어 정리, `*Internal` 비공개화, `onChangeValue` → `onChangeItem`

## 14. S2 (2차) — CSS 전환 (2026-08-26)

[20_design](../20_design.md) 의 두 번째 실물이자, **색을 가진 첫 컴포넌트**다.
그래서 여기서 전역 토큰(`001-tokens`)이 태어났다.

| 항목          | 처리                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| 클래스 문자열 | `TxButtonTheme` 전체 → **`tx-button` 하나 + `data-variant`**                                                 |
| 스타일 소유   | `TxButton.css` 신설. `TxButton.theme.ts` 삭제 (20_design §8 — `.theme.ts` 는 안 만든다)                      |
| 전역 토큰     | `src/tokens.css` 신설 — 12개. 값은 이행 전 팔레트와 같다                                                     |
| 컴포넌트 토큰 | `--tx-button-bg` · `-bg-hover` · `-fg` · `-padding` · `-radius` · `-shadow` · `-font-weight` · `-transition` |
| 폐기          | `theme` prop · `TxThemeProvider` · `useTxTheme` · `TxThemeOverrides` · `TxButtonThemeOverride`               |
| 신설          | `classNames={{ label }}` 슬롯                                                                                |
| `cm()`        | **그대로 둔다.** 24종이 아직 `tailwind-merge` 를 쓴다 — 제거는 이행이 끝난 뒤 한 커밋으로                    |

`TxThemeProvider` 를 쓰던 곳은 `TxButton` **하나뿐**이라 파일째 지웠다.
`TxTheme/index.ts` 의 `TxClass*` 상수는 남겼다 — 아직 24종이 참조한다 (`004_TxTheme` 소관).

### 전역 토큰을 `src/TxTheme/` 이 아니라 `src/tokens.css` 에 뒀다

20_design §9 는 "`TxTheme` 모듈이 토큰 정의로 바뀐다" 고 적었지만, `TxTheme` 은 **존치 판정도 안 난
별도 항목**이고 지금은 Tailwind 상수 뭉치다. 지워질 수도 있는 폴더 안에 패키지 전역 자산을 두는 건
거꾸로다. `styles.css` 옆이 그 자리다. `004_TxTheme` 에서 옮기고 싶으면 그때 옮긴다.

### `.dark` 를 컴포넌트가 모른다

다크모드 재정의가 `tokens.css` 의 `.dark` 블록 **한 곳**에 있다. `TxButton.css` 에는 `.dark` 가
한 글자도 없다. 1차 결함 D7(`ghost`·`text` 가 다크에서 배경이 남던 것)은 `dark:` 를 빼먹어서 났는데,
**컴포넌트가 다크를 아예 모르면 그 실수가 날 자리가 없다.**

### D2 를 구조로 막았다

포커스 링·`disabled`·여백을 **`.tx-button` 만** 소유하고, variant 규칙은 토큰만 갈아끼운다.
1차에서 `text` 가 분기로 공통 스타일을 통째로 건너뛰던 형태가 **구조적으로 불가능해졌다.**

### D6 은 그대로 보류다

`onClick` 에러는 여전히 `console.error` 만 한다. `onError` prop 추가도 재던지기도 합의 전이고,
`TxForm` 계열의 에러 처리와 함께 정하는 게 맞다. 코드에 사유 주석을 남겼다.

## 15. S3 (2차) — 테스트 (2026-08-26)

**20개 → 41개.** `theme`·Provider 3단 테스트 5개가 사라지고, `data-*` 계약과 **CSS 계약** 블록이 생겼다.

`TxSpinner` 와 같은 이유로 CSS 파일을 텍스트로 읽는다 — jsdom 에는 스타일시트가 없고,
이 컴포넌트의 무거운 결함(D2)이 바로 캐스케이드에서 났다. **검사하는 것은 계약뿐이다.**
색값·여백 같은 취향은 검사하지 않는다 — 고칠 때마다 테스트를 고치게 된다.

| 무엇을 못박나                              | 어떻게                                                           |
| ------------------------------------------ | ---------------------------------------------------------------- |
| 포커스 링·disabled 를 variant 가 못 가진다 | `:focus-visible` 셀렉터가 정확히 `.tx-button:focus-visible` 하나 |
| variant 는 색만 바꾼다                     | variant 규칙에 `padding`·`display`·`outline` 등이 없다           |
| 다크 분기가 컴포넌트에 없다                | `TxButton.css` 에 `.dark` 문자열이 없다                          |
| 색이 토큰으로 나가 있다                    | 리터럴 hex 가 한 개도 없다                                       |
| 참조하는 전역 토큰이 전부 정의돼 있다      | `var(--tx-*)` 를 뽑아 `tokens.css` 와 대조                       |
| 캐스케이드 순서                            | `styles.css` 에서 `tokens.css` 가 컴포넌트보다 앞                |
| **레이어 밖으로 안 나간다**                | 모든 `@import` 에 `layer(tx)` 가 붙어 있다 → §17                 |

### 변이 테스트 — 22건, 전부 잡혔다

CSS 5건 · 토큰 6건 · 컴포넌트 8건 · 레이어 3건. **두 건은 처음에 살아남았고 그 자리에서 테스트를 고쳤다.**

| 살아남은 변이                     | 원인                                                  | 대응                                    |
| --------------------------------- | ----------------------------------------------------- | --------------------------------------- |
| `.dark` 에 `padding: 1rem` 추가   | 정규식을 `[^;{]` 로 짜서 `;` 뒤에 붙은 선언을 못 봤다 | 선언을 잘라 **속성 이름**을 하나씩 검사 |
| 통과 props 를 계약 속성 뒤로 이동 | 스프레드 순서를 지키는 테스트가 아예 없었다           | 계약 속성 덮어쓰기 테스트 추가          |

> 두 번째는 **내가 이번에 만든 계약인데 테스트를 안 쓴 것**이다. 변이가 아니었으면 못 봤다.

되돌리기는 `git checkout` 이 아니라 **복사 백업**으로 했다 — S2 가 커밋 전이라 작업물이 날아간다
(`TxSpinner` §17 에서 실제로 밟은 함정).

## 16. S4 (2차) — 스토리북 (2026-08-26)

**6개 → 6개.** 개수는 같지만 커스터마이징 두 개가 통째로 바뀌었다.

| 스토리                  | 무엇을 보이나                                             | 컨트롤 |
| ----------------------- | --------------------------------------------------------- | ------ |
| `Playground`            | 컨트롤로 직접 만진다                                      | 켜짐   |
| `Variant`               | 5종 나열                                                  | 꺼짐   |
| `Loading`               | 비동기 잠금 · 동기 · 비활성                               | 꺼짐   |
| `InForm`                | `type` 기본값이 폼을 안 건드린다                          | 꺼짐   |
| **`CustomizingTokens`** | **신설.** 전역 토큰 · 이 영역만 · **CSS 로 늘린 variant** | 꺼짐   |
| **`CustomizingClass`**  | `className` + **`classNames={{ label }}`**                | 꺼짐   |

`CustomizingProvider` 가 사라지고 `CustomizingTokens` 가 그 자리에 들어왔다.
**1차의 `hover:`·`dark:` ✗/✓ 대비 화면도 사라졌다** — 토큰으로 오면서 그 함정 자체가 없어졌다.

`VARIANTS` 를 `Object.keys(TxButtonTheme.variants)` 로 뽑던 것을 **하드코딩으로 되돌렸다.**
테마 객체가 없어졌고, variant 는 이제 CSS 가 소유한다.

`brand` variant 데모는 스토리 안에 `<style>` 로 **실제 소비자가 쓸 CSS 를 그대로** 넣었다.
설명에 적은 코드와 화면에서 도는 코드가 같아야 한다.

## 17. 브라우저 실측 (2026-08-26) — **여기서 설계 결함이 하나 나왔다**

S3 이 못 하는 층이다. 실제 브라우저에서 확인했다.

| 확인한 것            | 결과                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| variant 5종 (라이트) | `#3b82f6` · `#e5e7eb` · `#ef4444` · 투명 · 투명+밑줄 — **이행 전 색과 같다**                   |
| variant 5종 (다크)   | `#2563eb` · `#374151` · `#dc2626` — **컴포넌트 CSS 에 `.dark` 한 줄 없이** 토큰만으로 따라온다 |
| 적용된 규칙          | `.tx-button` 관련 CSS 규칙이 **정확히 13개.** Tailwind 잔여물 없음                             |
| 포커스 링            | 5종 전부 `2px solid rgb(59,130,246)` · offset `2px` — **D2 가 되살아나지 않았다**              |
| 토큰 재정의          | 영역에 `--tx-color-primary: #7c3aed` → 보라. `--tx-radius: 9999px` 는 `danger` 까지 따라옴     |
| CSS 로 늘린 variant  | `variant="brand"` → `#0f172a`. 컴포넌트를 안 고치고 이름이 늘었다                              |
| 로딩                 | `data-loading=""` · `disabled` · `cursor:wait` · 라벨 `opacity 0.3` · 스피너 정중앙(0,0)       |
| **버튼 폭**          | 로딩 전/중/후 **122px 고정** — 누를 때 옆 버튼이 안 밀린다                                     |
| 스피너               | `aria-hidden="true"` · `role` 없음 — 버튼 라벨과 중복 안내되지 않는다                          |
| `classNames.label`   | `truncate` 로 라벨만 잘린다 (`scrollWidth 187 > 144`)                                          |
| 빌드                 | `dist/styles.css` 가 `@layer tx { … }` 로 감싸여 나간다 (4개 파일)                             |

### 🔴 `className` 이 조용히 무시되고 있었다 — 캐스케이드 레이어

**`className="rounded-full px-6 shadow-lg"` 가 셋 다 안 먹었다.** `w-40`·`truncate` 는 먹었다.

원인은 특이도가 아니라 **레이어**다. Tailwind 유틸리티는 `@layer utilities` 안에 있고 우리 CSS 는
레이어 밖에 있었는데, **비레이어 CSS 는 레이어 CSS 를 특이도·순서와 무관하게 무조건 이긴다.**
그래서 우리가 정하는 속성(반경·여백·그림자)은 전부 무시되고, 우리가 안 정하는 속성(폭·overflow)만 먹었다.

> **되는 속성과 안 되는 속성이 규칙 없이 갈리는 상태**였다. 1차에는 `tailwind-merge` 가
> 한 클래스 문자열 안에서 충돌을 풀어줘 이 구멍이 보이지 않았다 — **CSS 전환이 만든 회귀다.**
> [20_design §1·§4](../20_design.md) 가 `className="shadow-lg"` 를 되는 예로 적고 있었으니
> **설계의 약속이 깨진 상태**였다.

🧑 판정을 받아 **`@layer tx` 로 감쌌다.** 규약은 [20_design §4](../20_design.md) 가 소유한다.

- 레이어 자리도 실물로 두 번 틀렸다. `tx` 를 **`base` 앞**에 두니 Tailwind preflight 가
  버튼의 배경과 여백을 지웠고, **`utilities` 뒤**에 두니 `className` 이 다시 안 먹었다.
  **`base` 와 `utilities` 사이**가 유일한 자리다
- 두 앱(`storybook`·`playground`)의 CSS 진입점에 레이어 순서 한 줄을 넣었다. 소비자도 같은 한 줄이 필요하다
- 고친 뒤 재측정: `rounded-full`·`px-6`·`shadow-lg` **전부 적용**되고 기본 스타일도 살아 있다

### 실측에서 알아 둘 것 — 멈춘 전이(transition) 에 속지 않기

`background-color` 만 옛 값으로 읽히는 일이 두 번 있었다. 브라우저 창이 프레임을 안 그리는 상태라
`transition: background-color 150ms` 가 **시작값에서 멈춰** 있었던 것이다. 컴포넌트 결함이 아니다.

측정할 때는 `transition: none !important` 를 임시로 걸고 읽는다. 이걸 모르면 멀쩡한 걸 고치게 된다.

곁가지로 `background` 단축을 **`background-color` 롱핸드로** 바꿨다. 단축은 `background-image` 등
다른 롱핸드를 매번 초기화한다 — 토큰이 색 하나를 뜻하므로 롱핸드가 맞다.

## 19. 테마 스파이크 → 상태 레이어 도입 (2026-08-26)

게이트 직전에 **"토큰만으로 테마를 갈아끼울 수 있나"** 를 반나절 스파이크로 재봤다.
Material 3 버튼을 목표로 테마 하나를 실제로 씌우고 **버렸다.** 저장소에 안 넣었다.

규칙: 공개 선택자(`.tx-button` · `[data-variant]` · `__label`)에 **토큰만** 재정의한다.
일반 CSS 속성을 쓰고 싶어지는 순간이 곧 토큰이 모자란 자리다.

### 토큰 표면은 넓었다

색 · 20px 반경 · `10px 24px` **비대칭 여백** · variant별 여백 · elevation 0 · 전환 이징까지 전부 토큰으로 갔다.
`--tx-button-padding` 이 단축 속성에 그대로 치환돼 비대칭 여백이 공짜로 된 게 예상 밖의 소득이다.

막힌 것은 5줄이었다.

| ID  | 무엇             | 왜                                            | 판정                                                   |
| --- | ---------------- | --------------------------------------------- | ------------------------------------------------------ |
| B1  | 타이포           | 크기·자간 토큰이 없다 (`font-weight` 만 있다) | **`TxInput` 까지 미룸** — 표본 하나로 스케일 설계 금지 |
| B2  | 높이 · 밀도      | 크기 토큰이 아예 없다 (§7 이 일부러 뺐다)     | 미룸. 재론은 폼 계열에서                               |
| B3  | 테두리           | `border: none` 하드코딩                       | 미룸. `--tx-button-border` 한 개면 열린다              |
| B4  | `text` 밑줄      | `text-decoration` 하드코딩                    | **남긴다.** variant 고유 형태다                        |
| B5  | pressed·disabled | `opacity` 하드코딩                            | pressed 는 **이번에 같이 풀렸다.** disabled 는 유지    |

### 그런데 테마와 무관한 결함이 나왔다 — D8

`--tx-color-primary` 를 바꿔도 **hover 가 안 따라온다.** 순정 라이브러리에서 재현했다.

```
:root { --tx-color-primary: #7c3aed }
→ 평상시 rgb(124,58,237) 보라 · hover rgb(37,99,235) 파랑
```

**스파이크의 진짜 값이 이거였다.** 테마가 가능한지 알아보려다 배포 직전 코드의 결함을 찾았다.
표본 2종으로 "토큰이 충분한가" 를 논증으로 답할 수 없었는데, 한 번 해보니 30분 만에 나왔다.

### 처리 — 상태 색을 파생으로

🧑 판정을 받아 상태 레이어를 도입했다. 규약은 [20_design §5-1](../20_design.md) 이 소유한다.

|                      | 전                         | 후                                    |
| -------------------- | -------------------------- | ------------------------------------- |
| 전역 색 토큰         | 9개 (역할 4 × 짝 + 글자 2) | **5개** + `--tx-color-state` + 비율 2 |
| 역할 하나 추가 비용  | 토큰 2개                   | **1개**                               |
| 새 variant 추가 비용 | 배경 + hover               | **배경 한 줄**                        |
| variant 블록         | 상태 색을 각자 다시 정함   | **배경·글자만**                       |

```css
--tx-button-bg-hover: color-mix(in oklab, var(--tx-color-state) var(--tx-state-hover), var(--tx-button-bg));
```

`--tx-color-state` 를 `--tx-color-text` 로 대신하지 않은 이유: **글자색을 바꿨다고 hover 가 물들면 안 된다.**

### 실측 (2026-08-26)

| 확인한 것     | 결과                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| D8 재발 여부  | `--tx-color-primary: #7c3aed` → hover 가 **보라 파생으로 이동.** 다른 variant 는 그대로 |
| 방향 (라이트) | primary `59,130,246` → `56,121,227` — **진해진다**                                      |
| 방향 (다크)   | primary `37,99,235` → `54,113,237` — **옅어진다.** 섞는 색이 뒤집혀서                   |
| pressed 분리  | ΔL 이 hover 의 약 2배 (primary 8 → 17, secondary 19 → 37)                               |
| 투명 variant  | `ghost`·`text` 는 알파 0.08 → 0.16 으로 나온다. 뒤에 뭐가 깔려도 그 위에 얹힌다         |
| 변이 테스트   | 상태 레이어 관련 6건 추가, **전부 잡힘** (누적 28건)                                    |

### 알고 가는 대가

- **`color-mix()` 의존** — 지원 하한이 2023년 이후 브라우저로 정해졌다. 이건 결정 사항이다
- **비율은 색마다 다르게 보인다** — 같은 16% 라도 `secondary`(밝은 회색)가 강조 계열보다 1.5배 크게 움직인다
- **팔레트 램프 색은 못 낸다** — `blue-500`→`600` 은 채도까지 바꾸는데 파생은 밝기만 움직인다.
  비율을 8·10·12·14·16·18·20% 로 재봤는데 **어느 값도 그 색과 일치하지 않는다** (8% 가 가장 가까웠다)
- **`danger` 의 hover 가 제일 약하다** (ΔL 6). 원래 색이 어두워 검정을 섞어도 밝기가 덜 움직인다

### 비율은 🧑 게이트에서 한 번 올렸다 (8% → 16%)

첫 값은 Material 을 그대로 따라 hover 8% · pressed 16% 였는데, 게이트에서 **"호버 컬러가 약해서 티가 잘 안 난다"**
는 지적을 받았다. 재보니 맞았다.

측정은 **OKLab ΔE** 로 했다. 처음엔 휘도(ΔL)로 봤는데 **밝은 색과 어두운 색을 나란히 비교할 수 없다** —
같은 ΔL 이라도 밝은 바탕에서는 덜 보인다. 섞는 공간이 OKLab 이니 거기서 재는 게 맞다.

|                            | primary   | danger    | secondary |
| -------------------------- | --------- | --------- | --------- |
| 이행 전 (Tailwind 한 단계) | 0.082     | 0.061     | 0.056     |
| 8%                         | 0.035     | 0.040     | 0.058     |
| **16% (채택)**             | **0.070** | **0.077** | **0.115** |

**8% 는 강조 계열에서 예전의 절반이었다.** 16% 로 올려 그 자리를 넘겼고, 라이트/다크 편차도 같이 좁혀졌다
(8% 에서 danger 가 라이트 0.040 / 다크 0.036 → 16% 에서 0.077 / 0.071).

> **같은 비율이 variant 마다 다르게 보인다.** `secondary`(밝은 회색)가 강조 계열보다 1.5배쯤 크게 움직인다 —
> OKLab 에서 밝은 회색이 근검정에서 더 멀기 때문이다. **비율 하나로 전부 균일하게 만들 수는 없다.**
> 균일하게 하려면 상대 색 문법(`oklch(from … calc(l - .06) c h)`)이 필요한데,
> 그건 투명 배경(`ghost`·`text`)에서 알파가 0 이 되어 hover 가 아예 사라진다. **지금은 안 쓴다.**

pressed 는 hover 의 1.75배(28%)로 뒀다. Material 은 10% 지만 저쪽은 ripple 이 같이 있어서 그 값으로 되는데,
그게 없으면 hover 바로 옆 값으로는 눌러도 눌린 줄 모른다. 실측 ΔE 0.124~0.20 으로 hover 와 뚜렷이 갈린다.

### 이 스파이크가 정하지 않은 것

- **프리셋 테마를 제품으로 낼지** — v1 이후. 26종 × N 은 영구 유지비다. 구조만 열어두고 판단은 미룬다
- **Material 을 따를지** — **아니다. 참고서로만 쓴다.** 룩을 목표로 잡으면 MUI 와 정면 비교되고
  거기서 이길 방법이 없다. 이 라이브러리의 값은 행동(`onClick` Promise 잠금, 콜백 어휘)이다
- 타이포 스케일 — **일부러 안 만든다.** 호스트 앱의 글꼴을 이기는 라이브러리는 짐이 된다

## 20. 🧑 사용자 확인 결과 (2차) — **통과 (2026-08-26)**

Storybook 에서 6개 스토리·다크 토글·키보드 포커스를 직접 확인하고 승인했다.

**반려는 없었고 지적이 하나 나왔다** — `hover` 색이 약해 티가 안 난다. 비율을 8% → 16% 로 올려
그 자리에서 닫았다 (측정과 근거는 §19). 컴포넌트 구조나 공개 API 는 손대지 않았다.

### 이 게이트에서 나온 것

1차 게이트는 컴포넌트 결함 2건을 잡았고, 2차 게이트는 **다른 층을 잡았다.**

| 무엇                  | 어디서 나왔나                                                          |
| --------------------- | ---------------------------------------------------------------------- |
| `className` 이 무시됨 | 브라우저 실측 (§17) — 캐스케이드 레이어. **자동 검증으로는 안 보였다** |
| `hover` 가 안 따라옴  | 테마 스파이크 (§19) — D8. 문서가 파는 문장이 거짓이었다                |
| `hover` 가 너무 약함  | **🧑 게이트** — 숫자로는 통과했는데 눈으로는 아니었다                  |

> **셋 다 "테스트가 초록인데 틀린" 것들이다.** 41개 테스트와 변이 28건이 전부 통과한 상태에서
> 브라우저·스파이크·사람의 눈이 각각 하나씩 잡았다. **게이트를 사람이 보는 이유가 이것이다.**

### 확정된 것

| 항목       | 결과                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| 공개 API   | `label` · `variant` · `loading` · `classNames` · `onClick` + `ButtonHTMLAttributes`   |
| DOM        | `.tx-button` + `data-tag` · `data-variant` · `data-loading` · `__label` · `__loading` |
| 전역 토큰  | 11개. 상태 색은 **파생** (§19)                                                        |
| 캐스케이드 | `@layer tx` — Tailwind 소비자는 레이어 순서 한 줄                                     |
| 지원 하한  | `color-mix()` — 2023년 이후 브라우저                                                  |
| 테스트     | 41개 · 변이 28건                                                                      |
| 스토리     | 6개 (`Form/TxButton`)                                                                 |

**파일럿 2종이 이걸로 다 닫혔다.** 나머지 24종은 이 두 컴포넌트가 굳힌 모양을 따른다.

## 21. 인계 사항 (2차)

- ~~**`packages/ui/README.md` · `AGENTS.md`**~~ → **✅ 2026-08-26.** 삭제된 API 를 걷어내고
  `styles.css`·레이어·`@source` 를 셋으로 갈라 적었다. `AGENTS.md` 는 `TxThemeProvider` 를
  권장 경로로 가르치고 있어 특히 위험했다
- **나머지 24종 S2** — `.theme.ts` 를 지우고 `<Name>.css` 를 만든다. **토큰이 모자라면 `tokens.css` 에 늘린다**
- **`001-tokens`** — 11개로 시작했다. 표면색(`--tx-color-surface`)은 아직 없다 — 카드·모달이 필요해질 때 만든다
- **`901-04`** — Storybook 다크 토글은 `<html class="dark">` 를 건드린다. 토큰 전략과 맞다
