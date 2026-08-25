# 04. `Tx*` 컴포넌트 규약

> **언제 확인하나** — `Tx*` 컴포넌트를 추가하거나, props·콜백·테마·`data-tag` 를 손댈 때.

이 문서의 규칙은 하나의 목적에 봉사한다 — **배울 것을 적게 만드는 것.**
`@txstack/ui` 가 파는 것은 "얇은 통제권"이고([000 §2-1](../requirements/000_product_definition.md)),
컴포넌트마다 이름이 갈리면 그 논거가 무너진다.

---

## 1. 파일 구조

```
TxCard/
├── index.ts            배럴. 공개 진입점
├── TxCard.tsx          컴포넌트
├── TxCard.types.ts     props 인터페이스
├── TxCard.theme.ts     테마 객체
├── TxCard.utils.ts     순수 함수 (있을 때만)
└── TxCard.hook.ts      훅 (있을 때만)
```

작은 컴포넌트는 `index.tsx` 하나로 끝내도 된다 (`TxFlex` · `TxSpinner`).
**파일을 나누는 기준은 크기가 아니라 재사용**이다 — 타입·테마를 다른 파일이 참조하면 나눈다.

## 2. 이름 규칙

| 대상             | 규칙                 | 예                             |
| ---------------- | -------------------- | ------------------------------ |
| 컴포넌트         | `Tx<PascalCase>`     | `TxButton` · `TxDropdownMulti` |
| props 인터페이스 | `I<컴포넌트명>Props` | `ITxButtonProps`               |
| 테마 객체        | `<컴포넌트명>Theme`  | `TxButtonTheme`                |
| 타입 별칭        | `T<이름>`            | `TTxSlidePanelSide`            |

**props 인터페이스는 반드시 export 한다.** 소비자가 래퍼를 만들 때 참조해야 한다
(2026-08-19 에 `TxCapsLockCheck` · `TxSpinner` · `TxTooltip` 3종이 누락돼 있던 것을 고쳤다).

## 3. 콜백 이름 규약 (2026-08-19 확정)

```
on + <동작> + [<값 형태>] + [s]
```

### 3-1. 동작 어휘

| 동작                                             | 언제                          |
| ------------------------------------------------ | ----------------------------- |
| `Change`                                         | 값이 바뀔 때마다              |
| `Submit`                                         | 사용자가 명시적으로 확정할 때 |
| `Blur` · `Focus` · `Click` · `Enter` · `KeyDown` | DOM 이벤트                    |
| `Close` · `Clear` · `Open`                       | 상태 전환                     |
| `Add` · `Edit` · `Delete`                        | 항목 조작                     |

**`Exit` 은 쓰지 않는다.** 닫힘은 `Close` 하나다.

### 3-2. 값 형태 접미어 — 약어를 쓰지 않는다

| 접미어    | 넘어오는 것                 |
| --------- | --------------------------- |
| (없음)    | **DOM 이벤트** 또는 기본 값 |
| `Text`    | `string`                    |
| `Number`  | `number`                    |
| `Int`     | `number` (정수 절삭)        |
| `Boolean` | `boolean`                   |
| `Value`   | 항목 객체 전체              |

**금지** — `Numb` · `Bool` · `Nums` · `Float`

`Float` 를 금지하는 이유는 약어라서가 아니라 **`Number` 와 동작이 같기 때문**이다
(`TxInput` 에서 둘 다 파싱한 값을 그대로 넘긴다). `Int` 는 `Math.trunc` 를 대신해 주므로 남긴다.

### 3-3. 복수형은 배열을 뜻한다

```ts
onChangeText: (value: string) => void;    // 단수
onSubmitTexts: (values: string[]) => void; // 복수 = 배열
```

**이름과 타입이 어긋나면 안 된다.** `onSubmitText: (values: string[]) => void` 같은 형태는 금지다.

### 3-4. 시제는 현재형

`onChangedText` ✗ → `onChangeText`

### 3-5. 접미어 없는 `onChange` 는 DOM 이벤트다

`<input>` · `<textarea>` 계열은 React 관례를 따른다. 값이 필요하면 접미어를 쓴다.

```ts
onChange?: (e: ChangeEvent<HTMLInputElement>) => void; // 이벤트
onChangeText?: (value: string) => void;                // 값
```

### 3-6. 내부 전용 콜백은 공개하지 않는다

`onChangeInternal` 처럼 이름에 `Internal` 이 붙은 것이 public props 에 있으면 잘못이다.

## 4. 테마

모든 컴포넌트는 `theme` prop 을 받는다.

```ts
theme?: DeepPartial<typeof TxCardTheme>;
```

```ts
const stableTheme = useMemo(() => themeMerge(TxCardTheme, theme, "override"), [theme]);
```

| 정책         | 동작                                     |
| ------------ | ---------------------------------------- |
| `"merge"`    | 문자열을 `cm()` 으로 **합친다** (기본값) |
| `"override"` | 문자열을 **교체한다**                    |

- 테마 값은 **Tailwind 클래스 문자열**이다. 런타임 CSS 를 만들지 않는다
- `cm()` 은 `clsx` + `tailwind-merge` 다. 충돌하는 Tailwind 클래스는 **뒤의 것이 이긴다**
- 소비자가 `theme={{ key: "" }}` 로 **기본 스타일을 끄는 것**이 실사용 주력이다. 빈 문자열을 허용해야 한다

## 5. `data-tag`

바깥에서 요소를 조준할 수 있게 모든 렌더 요소에 붙인다.

| 규칙                                    | 예                       |
| --------------------------------------- | ------------------------ |
| 값은 **공개 export 이름과 정확히 일치** | `TxModal` (❌ `TxPopup`) |
| 하위 요소는 **점 표기**                 | `TxCard.Content`         |
| 접두어는 `Tx` 고정                      | ❌ `TXCoolTable`         |

붙여쓰기(`TxCardContent`)와 점 표기(`TxForm.Label`)가 섞여 있으면 소비자가 셀렉터를 외울 수 없다.
**점 표기로 통일한다.**

> **실측된 위반 (2026-08-19)** — 트랙 1-1 에서 정리한다.
>
> | 현재                                                                               | 있어야 할 값                    | 위치                                          |
> | ---------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------- |
> | `TxPopup`                                                                          | `TxModal`                       | `TxModal/TxModal.tsx`                         |
> | `TxCardRoot` · `TxCardCaption` · `TxCardContent` · `TxCardHeader` · `TxCardFooter` | `TxCard` · `TxCard.Caption` · … | `TxCard/TxCard.tsx`                           |
> | `TxDropdownItems`                                                                  | `TxDropdown.Items`              | `TxDropdown/TxDropdownBase.tsx`               |
> | `TxJsonTreeNode`                                                                   | `TxJsonTree.Node`               | `TxJsonTree/TxJsonTree.tsx`                   |
> | `TxAgGridPagination`                                                               | `TxAgGrid.Pagination`           | `TxAgGrid/TxAgGridPagination.tsx`             |
> | `TXCoolTable.*` · `TxPagenation`                                                   | —                               | `TxCoolTable/*` — **제거 예정이라 자동 해소** |

## 6. import 은 배럴을 거치지 않는다

컴포넌트가 자기 패키지 배럴(`".."`)에서 값을 가져오면 **순환**이 된다.
정의한 모듈에서 직접 가져온다.

```ts
import { cm, themeMerge } from "../tx-ui.utils"; // ✅
import { TxClassBorderColor } from "../TxTheme"; // ✅
import { cm, themeMerge } from ".."; // ❌ 순환
```

2026-08-19 에 41개 파일이 이 문제를 갖고 있었다. Storybook 이 컴포넌트를 직접 진입점으로 삼자
`Cannot access 'TxClassBorderColor' before initialization` 으로 죽으면서 드러났다.
playground 는 배럴로 진입해 초기화 순서가 우연히 맞아 가려져 있었다.

## 관련 문서

- [rules 02](02_MONOREPO_STRUCTURE.md) — 패키지·앱 구조와 스크립트
- [rules 06](06_STORYBOOK_SETUP.md) — 스토리 작성
- [000 §2-1](../requirements/000_product_definition.md) — `@txstack/ui` 가 파는 것
- [트랙 1-1](../plans/101_ui_basics.md) — 위 위반들의 정리 job
