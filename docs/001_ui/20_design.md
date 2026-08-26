# 001 설계 — `@txstack/ui`

> **언제 확인하는가**: 컴포넌트를 구현·수정할 때(S2), 공개 API 를 늘리려 할 때, 새 컴포넌트를 만들 때.
> 확정: **2026-08-25** (파일럿 2종을 돌린 뒤). 선행: [10_requirements](10_requirements.md).

**이 문서가 26종 전부의 형태를 정한다.** 여기 어긋나는 컴포넌트는 S2 에서 맞춘다.

## 1. 소비자가 보는 모습

설계는 내부 구조가 아니라 **"소비자가 어떻게 쓰는가"** 로 정한다. 그래서 예제가 먼저다.

```tsx
import { TxButton } from "@txstack/ui";
import "@txstack/ui/styles.css"; // 한 번만

<TxButton label="저장" onClick={async () => await save()} />;
```

**앱 전체 테마** — CSS 한 곳. Tailwind 도 Sass 도 필요 없다.

```css
:root {
  --tx-color-primary: #7c3aed;
  --tx-radius: 9999px;
}
```

**이 버튼 하나만** — 소비자가 쓰는 스타일 방식이 무엇이든 `className` 은 통한다.

```tsx
<TxButton label="저장" className="my-save-btn" />        // 순수 CSS·Sass
<TxButton label="저장" className="shadow-lg" />          // Tailwind 쓰는 프로젝트
<TxButton label="저장" classNames={{ label: "truncate" }} /> // 안쪽 슬롯
```

**바깥에서 조준** — 클래스와 `data-*` 로.

```css
.tx-button[data-variant="danger"] {
  --tx-button-bg: #b91c1c;
}
```

## 2. 스타일은 **CSS 로 쓴다** — Tailwind 를 라이브러리에서 뺀다

### 결정

**라이브러리 스타일은 자체 CSS 다.** 소비자는 `styles.css` 하나를 import 하고,
**CSS · Sass · Tailwind · CSS Modules 중 무엇을 쓰든 커스터마이징할 수 있다.**

### 왜 바꾸나

이전 판은 테마 값이 **Tailwind 클래스 문자열**이었다. 그래서 **소비자가 Tailwind 를 써야 커스터마이징이 됐다.**
`docs/README.md` 가 파는 것은 "여러 프로젝트에서 재사용할 수 있는 범용 라이브러리" 인데,
Tailwind 를 요구하는 순간 그건 **"Tailwind 프로젝트 전용"** 이다.

> **이건 shadcn 모델이었다.** shadcn 이 Tailwind 로 도배돼 있어도 되는 건 **코드를 소비자 저장소에 복사**하기
> 때문이다. 이미 Tailwind 가 있고 직접 고칠 수 있다. **우리는 npm 에 배포한다** — 그쪽 세계(MUI·Mantine·Radix Themes)는
> 거의 다 CSS 변수를 쓴다. `@source` 함정도, `hover:`·`dark:` 가 안 지워지던 것도 **그 불일치의 증상**이었다.

### 버린 대안

| 대안                                          | 버린 이유                                                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Tailwind 클래스 문자열 유지 (+ 사전 빌드 CSS) | `@source` 는 막지만 **소비자가 커스터마이징하려면 여전히 Tailwind 가 필요**하다. 두 스타일시트 순서 충돌도 남는다 |
| Tailwind 로 쓰되 값만 CSS 변수로 (하이브리드) | 공수는 가장 적다. 그러나 **라이브러리가 Tailwind 에 묶인 사실은 그대로**고, 결국 두 체계를 다 알아야 한다         |

**비용은 알고 간다** — 18개 `.theme.ts` 와 26종을 다시 쓴다. 라이브러리 안에서 Tailwind 의 저작 속도와
기성 스케일을 잃고, 토큰 이름·단계를 직접 설계해야 한다. **지금이 제일 싸다** — 게이트를 통과한 건 2종뿐이다.

## 3. 선택자 규약 — 기본 클래스 + `data-*`

```html
<button class="tx-button" data-tag="TxButton" data-variant="primary" data-loading>…</button>
```

| 무엇        | 규칙                                           | 예                                         |
| ----------- | ---------------------------------------------- | ------------------------------------------ |
| 기본 클래스 | `tx-<kebab-case>` — 컴포넌트당 하나            | `.tx-button` · `.tx-spinner`               |
| 안쪽 요소   | `tx-<name>__<part>`                            | `.tx-button__label`                        |
| 상태 · 변종 | **`data-*` 속성**                              | `[data-variant="danger"]` `[data-loading]` |
| DOM 표식    | `data-tag="<컴포넌트명>"` — **기존 관행 유지** | `data-tag="TxButton"`                      |

**왜 `data-*` 인가.** 이미 28개 파일이 `data-tag` 를 달고 있고 문서에 "셀렉터로 쓴다"고 적혀 있다.
새 관행을 발명하지 않는다. 상태가 늘어도 클래스명이 폭발하지 않고, React 쪽에서 prop 을 그대로 내려주면 된다.

- **`data-tag` 는 그대로 둔다.** 값은 공개 export 이름과 정확히 일치한다
- 불리언 상태는 값 없는 속성으로 (`data-loading`), 값이 있는 것만 `="…"`
- 버린 대안: **BEM**(`.tx-button--primary`) — 관습적이지만 상태 조합마다 클래스가 늘고 `data-tag` 관행과 따로 논다

## 4. 커스터마이징 — 세 경로, 겹치지 않는다

| 무엇을 바꾸나         | 무엇으로                    | 소비자에게 필요한 것 |
| --------------------- | --------------------------- | -------------------- |
| **값** (색·간격·반경) | **CSS 변수** `--tx-*`       | 아무것도             |
| 이 인스턴스의 겉      | `className`                 | 자기 스타일 방식     |
| 안쪽 슬롯             | `classNames={{ part: "" }}` | 자기 스타일 방식     |

**값은 토큰으로만 바꾼다.** 그래야 `hover`·`focus`·`dark` 가 **저절로 따라온다** —
상태별 클래스를 하나씩 덮던 문제가 여기서 사라진다.

### `theme` prop 과 `TxThemeProvider` 는 **폐기한다**

파일럿 2차에서 만들었지만 **CSS 로 오면서 존재 이유를 잃었다.** 전역 테마가 `:root` 한 줄이면 되는데
Provider 를 두면 **같은 일을 하는 경로가 둘**이 되고, 소비자가 배울 게 늘어난다.

- `theme?: <Name>ThemeOverride` → 없앤다
- `TxThemeProvider` · `useTxTheme` · `TxThemeOverrides` → 없앤다
- `themeMerge` · `TxClass*` 상수 → 쓰이지 않는다
- **`cm()` 의 `tailwind-merge` 도 불필요해진다.** 라이브러리가 유틸리티 클래스를 내지 않으므로 충돌이 없다 →
  `clsx` 만으로 충분하다. `tailwind-merge` 의존을 뺄 수 있다

> 하루 만에 버리는 게 아깝지만, **26종에 박히고 나면 훨씬 비싸다.** 파일럿의 목적이 이것이다 —
> 24종을 돌리기 전에 틀린 방향을 찾는 것. 근거: [TxButton §5 Q1](components/02_TxButton.md)

## 5. 토큰 규약

**두 단계**다. 컴포넌트 토큰의 기본값이 전역 토큰을 참조한다.

```css
:root {
  /* 전역 — 소비자가 제일 먼저 만지는 것 */
  --tx-color-primary: #3b82f6;
  --tx-color-danger: #ef4444;
  --tx-color-surface: #ffffff;
  --tx-color-text: #111827;
  --tx-radius: 0.375rem;
  --tx-focus-ring: 2px solid #3b82f6;
}

.tx-button {
  /* 컴포넌트 — 전역을 받아쓰되 따로 덮을 수도 있다 */
  --tx-button-bg: var(--tx-color-primary);
  --tx-button-fg: #fff;
  background: var(--tx-button-bg);
  color: var(--tx-button-fg);
}
```

| 종류     | 형태                               | 예                                   |
| -------- | ---------------------------------- | ------------------------------------ |
| 전역     | `--tx-<카테고리>-<이름>`           | `--tx-color-primary` · `--tx-radius` |
| 컴포넌트 | `--tx-<component>-<속성>[-<상태>]` | `--tx-button-bg-hover`               |

- **컴포넌트 토큰은 전역을 기본값으로 받는다.** 소비자는 전역 하나만 바꿔도 전체가 따라온다
- **토큰 이름은 공개 API 다.** 지우거나 바꾸면 major → [05_RELEASE](../00_foundation/05_RELEASE.md)
- **필요해질 때 늘린다.** 안 쓰는 토큰을 미리 설계하지 않는다 — 틀린 채로 굳는다

## 6. 다크모드

**`.dark` 클래스 전략을 유지한다.** 기존 앱 동작과 같고, 소비자가 토글 시점을 통제할 수 있다.

```css
.dark {
  --tx-color-surface: #1f2937;
  --tx-color-text: #f3f4f6;
}
```

**컴포넌트 CSS 에 `.dark` 분기를 흩뿌리지 않는다.** 토큰만 재정의하면 전부 따라온다 —
이게 클래스 문자열 시절과 가장 크게 달라지는 점이다.

## 7. 이름 규약

파일·심볼 공통 규칙은 [03_CONVENTIONS](../00_foundation/03_CONVENTIONS.md) 가 소유한다. 여기서는 `Tx*` 고유분만 정한다.

| 대상       | 규칙                               | 예                       |
| ---------- | ---------------------------------- | ------------------------ |
| 컴포넌트   | `Tx<PascalCase>`                   | `TxButton`               |
| props 타입 | `<컴포넌트명>Props` — **`I` 없음** | `TxButtonProps`          |
| 변종 타입  | `<컴포넌트명>Variant`              | `TxButtonVariant`        |
| 슬롯 키    | 안쪽 요소 이름과 일치              | `classNames={{ label }}` |

### 콜백 이름

```
on + <동작> + [<값 형태>] + [s]
```

접미어는 타입 표시가 아니라 **"컴포넌트가 대신 해주는 일"** 이다 — `onChangeNumber={_age}` 로
세터를 그대로 꽂을 수 있는 게 그 값이고, 타입만으로는 대체되지 않는다.

| 접미어    | 넘어오는 것                 |
| --------- | --------------------------- |
| (없음)    | **DOM 이벤트** (React 관례) |
| `Text`    | `string`                    |
| `Number`  | `number` (파싱)             |
| `Int`     | `number` (`Math.trunc`)     |
| `Boolean` | `boolean`                   |
| `Item`    | 항목 객체 전체              |
| `Value`   | 그 항목의 원시값            |

- **금지**: `Numb` · `Bool` · `Nums` (약어) · `Float` (`Number` 와 값이 같다) · 과거형(`onChangedText`)
- **복수형은 배열을 뜻한다.** 이름과 타입이 어긋나면 안 된다
- **동작이 같은 두 이름을 두지 않는다**
- `*Internal` 은 공개 props 에 두지 않는다
- 동작 어휘: `Change` · `Submit` · `Blur` · `Focus` · `Click` · `KeyDown` · `Close` · `Clear` · `Open` · `Add` · `Edit` · `Delete`.
  **`Exit` 은 쓰지 않는다** — 닫힘은 `Close` 하나다

## 8. 파일 구조

```
packages/ui/src/TxButton/
├─ TxButton.tsx          구현 + props 타입
├─ TxButton.css          이 컴포넌트의 스타일 + 토큰 기본값
├─ TxButton.test.tsx     회귀 테스트
├─ TxButton.stories.tsx  Storybook
└─ index.ts              재수출만
```

- **컴포넌트가 CSS 를 import 하지 않는다.** 빌드가 전부 모아 `dist/styles.css` 로 낸다 (`001-styles-css`).
  소비자는 한 번만 import 하고, SSR·번들러 환경에 따라 깨지는 경로를 만들지 않는다
- 대가: **소비자가 안 쓰는 컴포넌트의 CSS 도 받는다.** UI 라이브러리에선 통상적인 거래다
- `.types.ts` · `.utils.ts` 는 **다른 파일이 참조할 때만** 나눈다. 크기가 기준이 아니다
- `.theme.ts` 는 **더 이상 만들지 않는다** (`TxSpinner` C3 은 이걸로 닫힌다)

## 9. 이행 — 어떻게 옮기나

**일괄 재작성하지 않는다.** 각 컴포넌트의 S2 에서 옮긴다. 보드가 멈추지 않는 게 중요하다.

| 대상                       | 어떻게                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| **`TxSpinner`·`TxButton`** | **게이트를 `↩` 로 되돌린다.** 이 문서 기준으로 S2~S4 를 다시 돈다 |
| 나머지 24종                | 각자의 첫 S2 에서 이 문서대로 만든다 — 두 번 일하지 않는다        |
| `TxTheme` 모듈             | 토큰 정의(`tokens.css`)로 바뀐다. `TxClass*` 상수는 사라진다      |
| `001-styles-css`           | **성격이 바뀐다** — Tailwind 컴파일이 아니라 자체 CSS 번들        |

`↩` 는 실패가 아니다 ([06_COMPONENT_FLOW §4](../00_foundation/06_COMPONENT_FLOW.md)).
**파일럿이 제 일을 한 것이다** — 24종에 박히기 전에 방향이 틀렸다는 걸 찾았다.

## 10. 이 문서가 정하지 않는 것

| 항목                       | 어디서                                                  |
| -------------------------- | ------------------------------------------------------- |
| 컴포넌트별 props·동작      | 각 `components/<Name>.md` (S1)                          |
| 존치 / 폐기 판정           | 각 컴포넌트 S1 감사                                     |
| CSS 번들 빌드 방법         | job `001-styles-css`                                    |
| 전역 토큰의 실제 색값·단계 | 첫 컴포넌트를 옮길 때 정한다 — **미리 설계하지 않는다** |
