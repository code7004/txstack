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

### ⚠️ Tailwind `@source` — 빠뜨리면 스타일이 전부 사라진다

이 라이브러리의 테마는 런타임 CSS 가 아니라 **Tailwind 클래스 문자열**이다.
소비 앱의 Tailwind 가 패키지 안을 스캔하지 않으면 그 클래스들이 purge 되어 **아무 스타일도 안 남는다.**

앱의 CSS 진입 파일에 넣는다.

```css
@import "tailwindcss";
@source "../node_modules/@txstack/ui/dist";
```

- 경로는 그 CSS 파일 기준의 상대 경로다. 모노레포면 실제 `node_modules` 위치에 맞춘다
- **스타일이 하나도 안 먹으면 십중팔구 이 줄이 없는 것이다.** 다른 원인을 찾기 전에 여기부터 본다
- 다크모드는 `dark:` variant(class 전략) 기준이다

---

## 2. 전 컴포넌트 공통 규칙

| 규칙        | 내용                                                                      |
| ----------- | ------------------------------------------------------------------------- |
| import      | 전부 배럴에서. `import { TxSpinner } from "@txstack/ui"`                  |
| 이름        | 컴포넌트는 `Tx` 접두, props 타입은 `<컴포넌트명>Props` (`I` 접두 없음)    |
| `className` | **기본 클래스와 병합된다. 교체가 아니다.** 충돌하는 것만 밀어낸다         |
| 색          | 대체로 부모에게서 상속한다. 부모에 `text-*` 를 주는 쪽이 먼저다           |
| DOM 찾기    | 모든 컴포넌트가 `data-tag="<컴포넌트명>"` 을 붙인다. 테스트 셀렉터로 쓴다 |

### 하지 말 것

- **없는 prop 을 만들어 쓰지 않는다.** 이 문서에 없고 `.d.ts` 에도 없으면 없는 것이다
- **서브패스를 임의로 만들지 않는다.** 공개된 진입점은 `@txstack/ui` · `@txstack/ui/aggrid` · `@txstack/ui/daypicker` 셋뿐이다
- **`dist` 내부 파일을 직접 import 하지 않는다** (`@txstack/ui/dist/...` 금지)
- **`@source` 없이 "스타일이 안 나온다" 를 다른 원인으로 진단하지 않는다**

---

## 3. 컴포넌트

> **검증이 끝난 것만 싣는다.** 여기 없는 컴포넌트는 패키지에 있어도 아직 명세가 확정되지 않았다.
> 그런 건 `.d.ts` 를 보고 쓰되, 동작이 바뀔 수 있다고 가정한다.

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
