# TxButton

> **플로우 S1 산출물.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md) · **파일럿 2차**
> 상태: **1차는 S1~S4 + 🧑 확인 + S6 까지 갔다. 2026-08-25 에 `↩` 로 되돌렸다** — [20_design](../20_design.md) 의 CSS 전환.
> **여기서 확정했던 커스터마이징 3단(`className`/`theme`/`TxThemeProvider`)은 폐기됐다** — §5 Q1 참고.
> 이 문서가 `TxButton` 의 단일 진실 공급원이다.

현재 코드: `packages/ui/src/TxButton/TxButton.tsx` · `TxButton.theme.ts` · `index.ts` ·
`TxButton.test.tsx` (20개) · `TxButton.stories.tsx` (`Form/TxButton`, 6개)

## 진행

| 단계 | 내용                                           | job ID            | 상태 | 비고                                                    |
| ---- | ---------------------------------------------- | ----------------- | ---- | ------------------------------------------------------- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝                | `001-TxButton-S1` | ✅   | 커스터마이징 방식 확정 → §5                             |
| `S2` | 구현 = 감사 결과 반영 🤖                       | `001-TxButton-S2` | ↩    | 1차 완료(D1–D7) → §8. **`TxThemeProvider` 는 제거된다** |
| `S3` | 테스트 🤖                                      | `001-TxButton-S3` | ↩    | 1차 20개 → §11. `theme` 병합 테스트가 사라진다          |
| `S4` | 스토리북 🤖                                    | `001-TxButton-S4` | ↩    | 1차 6개 → §12. `CustomizingProvider` 가 바뀐다          |
| 🧑   | **사용자 확인** — Storybook 에서 직접 만져본다 | —                 | ↩    | 1차 통과(2026-08-25) → §10. 2차에서 다시 받는다         |
| `S5` | 문서 사이트 🤖                                 | `001-TxButton-S5` | ⏸    | `903` 도구 미정으로 보류 (TxSpinner 와 같은 사유)       |
| `S6` | 에이전트 가이드 🤖                             | `001-TxButton-S6` | ↩    | 1차 작성. 커스터마이징 절이 통째로 바뀐다               |

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

**값은 토큰으로 바꾼다.** 그러면 `hover`·`focus`·`.dark` 가 **저절로 따라온다.**

```css
/* 앱 전체 — 이 한 줄이면 5종 variant 가 다 따라온다 */
:root {
  --tx-color-primary: #7c3aed;
}

/* 새 variant 를 늘리는 법 */
.tx-button[data-variant="warning"] {
  --tx-button-bg: #f59e0b;
  --tx-button-fg: #000;
}
```

> **1차에는 여기에 함정이 있었다.** 테마 값이 Tailwind 클래스 문자열이라
> `className="bg-yellow-500"` 을 줘도 `hover:bg-blue-600`·`dark:bg-blue-600` 이 남아
> **평상시만 노랑**이 됐다. 소비자가 조건 여섯 개를 직접 적어야 했다 (게이트에서 나온 것 ① → §10).
> **토큰으로 오면서 그 함정이 사라졌다** — `hover`·`dark` 는 같은 변수를 읽으므로 한 곳만 바꾸면 된다.
> 이게 [20_design §2](../20_design.md) 의 CSS 전환을 민 근거 중 하나다.

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
