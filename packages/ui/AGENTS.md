# @txstack/ui — 에이전트용 사용 설명

> **이 파일은 npm 패키지에 포함되지 않는다.** 문서 사이트에서 내려받아 쓴다.
> 소스는 코드 옆(`packages/ui/AGENTS.md`)에 두어 컴포넌트를 고칠 때 함께 갱신되게 한다.
>
> **쓰는 법**: 이 파일을 프로젝트에 두고, 프로젝트의 `CLAUDE.md` 또는 `AGENTS.md` 에 한 줄 넣는다.
>
> ```md
> `@txstack/ui` 를 쓸 때는 `docs/txstack-ui.agents.md` 를 먼저 읽는다.
> ```
>
> **버전을 맞춰서 받는다.** 설치한 `@txstack/ui` 버전과 같은 버전의 파일을 받아야 한다.

> **⚠ 이행 중이다 (2026-08-26).** 이 문서는 **지금 코드에 있는 그대로**를 적은 것이다.
> 스타일을 Tailwind 클래스 문자열에서 **자체 CSS + `--tx-*` 토큰**으로 옮기는 중이다.
>
> |                              | 스타일                 | 커스터마이징                           |
> | ---------------------------- | ---------------------- | -------------------------------------- |
> | **`TxSpinner` · `TxButton`** | 자체 CSS               | **CSS 변수.** `theme` prop 이 **없다** |
> | 나머지 24종                  | Tailwind 클래스 문자열 | `theme` prop                           |
>
> **`TxThemeProvider` 는 만들었다가 없앴다.** 코드에 존재하지 않는다 — 쓰면 컴파일이 안 된다.
> 아직 배포된 버전은 없다.

여기 적힌 것이 전부다. **적혀 있지 않은 prop 은 없는 prop 이다.** 만들어 쓰지 않는다.
전체 타입은 `node_modules/@txstack/ui/dist/index.d.ts` 에 있다 — 확실치 않으면 그걸 연다.

---

## 1. 설치하고 반드시 하는 것

```sh
pnpm add @txstack/ui
```

peer 로 `react` `react-dom` `react-router-dom` `framer-motion` 이 필요하다.
`ag-grid-community` · `ag-grid-react` · `dayjs` · `react-day-picker` 는 **선택**이고,
`@txstack/ui/aggrid` · `@txstack/ui/daypicker` 를 쓸 때만 설치한다.

### ⚠️ 스타일 설정 — 셋 다 해야 한다

이행 중이라 **옮긴 컴포넌트와 안 옮긴 컴포넌트가 서로 다른 것을 요구한다.**

**1. `styles.css` 를 import 한다** — `TxSpinner`·`TxButton` 이 이걸로 스타일을 받는다.

```tsx
import "@txstack/ui/styles.css"; // 앱 엔트리에서 한 번
```

**2. Tailwind 를 쓴다면 레이어 순서를 적는다.**

```css
/* src/index.css */
@layer theme, base, tx, components, utilities;

@import "tailwindcss";
```

`tx` 는 **preflight(`base`) 뒤, 유틸리티 앞**이어야 한다. 앞에 두면 preflight 가 버튼의 배경과
여백을 지우고, 뒤에 두면 `className` 이 안 먹는다. 순수 CSS·Sass·CSS Modules 만 쓰면 이 줄은 필요 없다.

**3. `@source` 를 지정한다** — 아직 안 옮긴 24종에 필요하다.

```css
@source "../node_modules/@txstack/ui/dist";
```

이쪽은 스타일이 **Tailwind 클래스 문자열**이라, 소비 앱의 Tailwind 가 패키지 안을 스캔하지 않으면
purge 되어 **아무 스타일도 안 남는다.** 경로는 그 CSS 파일 기준 상대경로다.

### 스타일이 안 나올 때 — 여기부터 본다

| 증상                                | 원인                                  |
| ----------------------------------- | ------------------------------------- |
| `TxSpinner`·`TxButton` 만 안 나온다 | 1번(`styles.css` import)이 없다       |
| 그 둘 말고 전부 안 나온다           | 3번(`@source`)이 없다                 |
| 버튼 배경·여백이 사라졌다           | 2번에서 `tx` 가 `base` **앞**에 있다  |
| `className` 을 줘도 아무 일이 없다  | 2번 줄이 없거나 `tx` 가 유틸리티 뒤다 |

**다크모드는 양쪽 다 `<html>` 에 `dark` 클래스 토글이다.**

---

## 2. 전 컴포넌트 공통 규칙

| 규칙        | 내용                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| import      | 전부 배럴에서. `import { TxSpinner } from "@txstack/ui"`                                       |
| 이름        | 컴포넌트는 `Tx` 접두, props 타입은 `<컴포넌트명>Props` (`I` 접두 없음)                         |
| `className` | **기본 클래스에 덧붙는다. 교체가 아니다.** 여백·너비·정렬에 쓴다. **아래 ⚠ 를 반드시 읽는다**  |
| 색          | 옮긴 2종은 **`--tx-*` 토큰**. 나머지는 `theme`·`className`. `TxSpinner` 만 부모에게서 상속한다 |
| DOM 찾기    | 모든 컴포넌트가 `data-tag="<컴포넌트명>"` 을 붙인다. 테스트 셀렉터로 쓴다                      |

### 커스터마이징 — 옮긴 컴포넌트

`TxSpinner` · `TxButton` 이다. **`theme` prop 이 없다.**

| 무엇을 바꾸나         | 무엇으로                    |
| --------------------- | --------------------------- |
| **값** (색·반경·여백) | **CSS 변수** `--tx-*`       |
| 이 하나의 겉          | `className` (덧붙는다)      |
| 안쪽 슬롯             | `classNames={{ part: "" }}` |

```css
/* 앱 전체 — 이 한 줄이면 hover·눌린 색·포커스 링·다크모드가 전부 따라온다 */
:root {
  --tx-color-primary: #7c3aed;
}

/* 없던 variant 를 만든다 — 배경과 글자만 주면 된다 */
.tx-button[data-variant="brand"] {
  --tx-button-bg: #0f172a;
  --tx-button-fg: #fff;
  --tx-color-state: #fff; /* 배경이 아주 어두울 때만 필요하다 — 아래 */
}
```

**배경이 아주 어둡거나(라이트) 아주 밝으면(다크) hover 가 안 보인다.** 상태 색을 배경에 섞어
만드는데 둘이 가까우면 값이 안 움직인다. `#0f172a` 배경은 hover 가 배경과 **완전히 같게** 나온다.
그 자리에만 `--tx-color-state` 를 반대쪽 색으로 주면 풀린다.

### ⚠ 색은 `className` 으로 바꾸지 않는다 — 토큰으로 바꾼다

**타입도 통과하고 화면도 맞아 보이는데 마우스를 올리면 드러나는 함정이다.**

```tsx
<TxButton className="bg-yellow-500 text-black" /> // ✗ 평상시만 노랑
```

평상시는 노랑(`rgb(240,177,0)`)인데 **마우스를 올리면 파랑(`rgb(53,112,209)`)으로 돌아간다.**
hover 색은 클래스가 아니라 **`--tx-button-bg` 토큰에서 계산**되기 때문이다. 클래스는 그 토큰을 모른다.

```tsx
// ✓ 토큰으로 바꾼다 — hover·pressed 가 저절로 따라온다
<TxButton style={{ "--tx-button-bg": "#eab308", "--tx-button-fg": "#000" } as CSSProperties} />
```

```css
/* ✓ 여러 곳에서 쓸 색이면 variant 를 만든다 */
.tx-button[data-variant="warning"] {
  --tx-button-bg: #eab308;
  --tx-button-fg: #000;
}
```

**`className` 은 우리가 정하지 않는 것에 쓴다** — 여백·너비·그림자·정렬 같은 것. 색·반경은 토큰이다.

### 커스터마이징 — 나머지 24종

`theme` prop 으로 부분 재정의한다. `theme` 은 **갈아끼우기**(문자열 교체),
`className` 은 **덧붙이기**(충돌만 밀어냄)다.

```tsx
<TxCard theme={{ wrapper: "border-emerald-500" }} />
```

이쪽은 값이 Tailwind 클래스 문자열이라 **`className` 으로 색을 바꿀 때 `hover:`·`dark:` 도 같이 줘야 한다.**
`tailwind-merge` 는 조건이 같은 클래스끼리만 충돌로 보기 때문에, `bg-blue-500` 은 밀려나도
`hover:bg-blue-600` 은 그대로 남는다.

**`TxThemeProvider` 는 없다.** 만들었다가 없앴으니 쓰지 않는다 — 전역은 `:root` 토큰이다.

### 하지 말 것

- **없는 prop 을 만들어 쓰지 않는다.** 이 문서에 없고 `.d.ts` 에도 없으면 없는 것이다
- **서브패스를 임의로 만들지 않는다.** 공개된 진입점은 `@txstack/ui` · `@txstack/ui/aggrid` · `@txstack/ui/daypicker` 셋뿐이다
- **`dist` 내부 파일을 직접 import 하지 않는다** (`@txstack/ui/dist/...` 금지)
- **`TxThemeProvider` · `useTxTheme` · `TxButtonTheme` 을 쓰지 않는다.** 코드에 없다
- **스타일이 안 나오는 것을 다른 원인으로 진단하지 않는다.** 위 "스타일이 안 나올 때" 표부터 본다
- **옮긴 컴포넌트의 색을 `className` 으로 바꾸지 않는다.** hover 가 따라오지 않는다

---

## 3. 컴포넌트

> **검증이 끝난 것만 싣는다.** 여기 없는 컴포넌트는 패키지에 있어도 아직 명세가 확정되지 않았다.
> 그런 건 `.d.ts` 를 보고 쓰되, 동작이 바뀔 수 있다고 가정한다.

### TxButton

누르면 뭔가 일어나는 자리. **비동기 작업 중 중복 클릭을 막는 게 이 컴포넌트의 진짜 값이다.**

```tsx
import { TxButton } from "@txstack/ui";

<TxButton
  label="저장"
  onClick={async () => {
    await save();
  }}
/>; // 잠금·스피너가 저절로 붙는다
```

```tsx
// 의미로 고른다
<TxButton label="삭제" variant="danger" />

// 폼 안 — 제출 버튼만 type 을 명시한다
<form onSubmit={hdSubmit}>
  <TxButton label="취소" variant="secondary" onClick={hdCancel} />
  <TxButton label="제출" type="submit" />
</form>
```

| prop         | 타입                                          | 기본값         | 메모                                       |
| ------------ | --------------------------------------------- | -------------- | ------------------------------------------ |
| `label`      | `string`                                      | —              | `children` 을 써도 된다 (`label` 이 우선)  |
| `variant`    | `primary` `secondary` `danger` `ghost` `text` | `"primary"`    | **열려 있다** — CSS 로 이름을 늘릴 수 있다 |
| `type`       | `button` `submit` `reset`                     | **`"button"`** | HTML 기본값(`submit`)과 다르다             |
| `onClick`    | `(e) => Promise<void> \| void`                | —              | Promise 를 반환하면 자동으로 잠긴다        |
| `loading`    | `ReactElement`                                | 장식용 스피너  | 로딩 중 라벨 위에 겹쳐 보여줄 것           |
| `classNames` | `{ label?: string }`                          | —              | 안쪽 슬롯. 바깥 겉은 `className`           |

그 밖의 `ButtonHTMLAttributes` 는 그대로 통과한다. **`theme` prop 은 없다** — 색은 토큰이다.

DOM 은 `<button class="tx-button" data-tag="TxButton" data-variant="…" [data-loading]>` +
안쪽에 `<span class="tx-button__label">` 이다. 바깥에서 조준할 때 쓴다.

**토큰**: `--tx-button-bg` · `-fg` · `-padding` · `-radius` · `-shadow` · `-font-weight` · `-transition`.
`hover`·눌린 색은 `-bg` 에서 계산되므로 **따로 주지 않는다.**

**주의할 것**

- **`type` 기본값이 `"button"` 이다.** 폼을 제출하려면 **`type="submit"` 을 반드시 명시한다.**
  HTML 기본값과 반대이므로, 폼이 제출되지 않으면 여기부터 본다
- **동기 `onClick` 은 로딩 상태로 들어가지 않는다.** 잠금이 필요하면 `async` 로 만들거나 Promise 를 반환한다
- **`aria-label` 을 자동으로 붙이지 않는다.** 글자가 없는 아이콘 버튼이라면 직접 준다
- **`onEnter` prop 은 없다.** 버튼은 포커스 상태에서 Enter 를 누르면 브라우저가 click 을 발생시킨다
- **`color` prop 은 없다.** 색은 **`--tx-*` 토큰**으로 한다. `className` 으로 바꾸면 hover 가 따라오지 않는다 (위 ⚠ 참고)
- `onClick` 이 던진 에러는 콘솔에만 남는다. 소비자가 잡아야 하면 **핸들러 안에서 try/catch 한다**

**이럴 땐 다른 걸 쓴다**

| 하고 싶은 것       | 쓸 것                                                               |
| ------------------ | ------------------------------------------------------------------- |
| 링크로 이동        | `<a>` 를 쓴다. `href` prop 은 없다                                  |
| 아이콘만 있는 버튼 | `children` 에 아이콘 + `aria-label` 을 준다                         |
| 같은 색을 여러 번  | CSS 로 variant 를 만든다 — `.tx-button[data-variant="brand"] { … }` |
| 앱 전체 색 바꾸기  | `:root { --tx-color-primary: … }` 한 줄                             |
| 크기 조절          | 크기 prop 은 없다. `--tx-button-padding` 이나 `className` 으로      |

### TxSpinner

로딩 중임을 알리는 **회전 아이콘 하나.** 문구·전체화면 오버레이·표시 여부 판단은 하지 않는다.

```tsx
import { TxSpinner } from "@txstack/ui";

<TxSpinner />; // 대부분 이걸로 충분하다
```

```tsx
// 크기·색 지정. size 는 CSS 길이 또는 number(px)
<TxSpinner size={24} className="text-blue-500" />

// 옆에 이미 읽을 문구가 있을 때 — 스크린리더 중복 안내를 막는다
<button disabled>
  <TxSpinner decorative /> 저장 중
</button>

// 안내 문구 교체 (기본값은 영어 "Loading")
<TxSpinner aria-label="주문 내역을 불러오는 중" />
```

| prop         | 타입               | 기본값      | 메모                                       |
| ------------ | ------------------ | ----------- | ------------------------------------------ |
| `size`       | `number \| string` | `"1em"`     | number 는 px. **클래스를 주면 안 된다**    |
| `decorative` | `boolean`          | `false`     | 켜면 `aria-hidden`, `role`·라벨은 사라진다 |
| `aria-label` | `string`           | `"Loading"` | `decorative` 가 켜져 있으면 무시된다       |

그 밖의 `SVGProps<SVGSVGElement>` 는 그대로 통과한다.

**주의할 것**

- **`size` 에 Tailwind 클래스를 주면 무효다.** `size="w-6"` 은 `width` 속성값이 되어 아무 일도 안 한다.
  클래스로 크기를 바꾸려면 `className="size-6"` 을 쓴다
- **크기를 안 주는 게 기본 사용법이다.** `1em` + `currentColor` 라 놓인 자리의 글자 크기·색을 따라간다.
  버튼이나 문단 안에서는 아무것도 주지 않는 쪽이 맞다
- `decorative` 는 **옆에 읽을 문구가 이미 있을 때만** 켠다. 스피너만 덩그러니 있는 자리에서 켜면
  스크린리더 사용자에게 로딩 중이라는 사실이 전달되지 않는다
- 모션 저감(`prefers-reduced-motion`)에서는 **멈추지 않고 느려진다.** 의도된 동작이니 고치지 않는다

**이럴 땐 다른 걸 쓴다**

| 하고 싶은 것              | 쓸 것                               |
| ------------------------- | ----------------------------------- |
| 로딩 문구를 같이 보여준다 | `TxLoading`                         |
| 화면 전체를 덮는다        | `TxLoading` 의 `fullScreen`         |
| 버튼 누르면 로딩 표시     | `TxButton` — 내부에서 알아서 띄운다 |
| 진행률(%)을 보여준다      | 이 라이브러리에 없다. 직접 만든다   |
