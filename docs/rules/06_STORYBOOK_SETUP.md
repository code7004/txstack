# 06. Storybook 구성과 스토리 작성

> **언제 확인하나** — 스토리를 추가·수정하거나, `apps/storybook` 의 설정을 건드릴 때.
> 처음 스토리를 써 보는 경우 이 문서를 먼저 읽는다.

이 문서는 **레시피가 아니라 계약**이다. "이렇게 복사하라" 가 아니라 "각 조각이 왜 있고, 없으면
무엇이 깨지는가" 를 적는다. 조각의 이유를 알면 구성을 스스로 다시 세울 수 있다.

---

## 1. 전체 그림

```
apps/storybook/                  ← 도구만 담는다. 배포되지 않는다 (private: true)
├── .storybook/
│   ├── main.ts                  스토리 위치 · 애드온 · Vite 설정
│   └── preview.tsx              전역 데코레이터 · 툴바 · 파라미터
├── src/tailwind.css             Tailwind 진입점 + @source
├── package.json                 dev/build 스크립트, 실행에 필요한 런타임 의존
└── tsconfig.json                스토리 파일까지 typecheck 대상에 포함

packages/ui/src/TxButton/
├── index.tsx                    컴포넌트
└── TxButton.stories.tsx         ← 스토리는 컴포넌트 옆에 산다
```

핵심 배치 결정 두 가지.

| 결정                                       | 이유                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Storybook 은 **별도 앱**(`apps/storybook`) | 도구가 배포물에 섞이면 안 된다. `packages/ui` 에 넣으면 storybook 의존이 패키지에 붙는다                   |
| 스토리는 **`packages/ui/src` 안**          | 카탈로그가 컴포넌트와 같이 움직여야 갱신 누락이 없다. 그리고 `packages/ui` 의 `tsc` 가 스토리까지 검사한다 |

---

## 2. 조각별 계약

### 2-1. `main.ts` — `stories` 글롭

```ts
stories: ["../../../packages/ui/src/**/*.stories.tsx"];
```

`.storybook/` 기준 상대경로다. 앱 밖(`packages/`)을 가리키는 것이 이 구성의 특징이다.

> **없으면** — 스토리를 하나도 못 찾아 사이드바가 빈다.

### 2-2. `main.ts` — `addons: ["@storybook/addon-docs"]`

props 표를 타입에서 자동 생성하는 **autodocs** 가 이 애드온에 들어 있다.

> **없으면** — 스토리에 `tags: ["autodocs"]` 를 달아도 **아무 일도 일어나지 않는다.**
> 에러가 나지 않고 조용히 docs 페이지가 0개가 된다.
> 실제로 27종을 다 등재하고 나서야 `/index.json` 의 `docs` 가 0인 것을 발견했다.
>
> **Storybook 9 까지는 essentials 에 포함돼 있었고, 10 에서 별도 패키지로 분리됐다.**
> 다른 버전의 예제를 참고할 때 이 차이를 조심한다.

확인 방법 — 개발 서버에서 `/index.json` 을 열어 `type: "docs"` 항목이 컴포넌트 수만큼 있는지 본다.

### 2-3. `main.ts` — `viteFinal` 의 Tailwind 플러그인

```ts
viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
```

Storybook 이 만든 Vite 설정에 Tailwind v4 플러그인을 **덧붙인다.** 통째로 교체하면 Storybook 자신의
플러그인이 사라져 동작하지 않는다.

> **없으면** — CSS 가 전혀 생성되지 않아 모든 스토리가 스타일 없이 렌더된다.

### 2-4. `main.ts` — `alias` 로 소스에 연결

```ts
{ find: /^@txstack\/ui$/, replacement: pkg("ui/src/index.ts") }
```

`@txstack/ui` 를 `dist` 가 아니라 **소스**로 붙인다. playground 와 같은 이유다.

> **없으면** — Storybook 이 `dist` 를 소비하므로, 컴포넌트를 한 줄 고칠 때마다
> `pnpm build` + 서버 재시작이 필요하다. tsup 이 청크 해시를 바꿔 모듈 그래프도 깨진다.

**그래도 배포 계약은 계속 검증된다.** `tsc` 는 이 alias 를 쓰지 않고 `package.json` 의
`exports` → `dist/*.d.ts` 로 해석하므로, 서브패스나 타입이 깨지면 `pnpm typecheck` 가 잡는다.

서브패스(`/aggrid`, `/daypicker`)도 각각 alias 를 걸어야 한다. 루트만 걸면 서브패스는 `dist` 를 본다.

### 2-5. `src/tailwind.css` — `@source` (가장 자주 놓치는 것)

```css
@import "tailwindcss";
@source "../../../packages/ui/src";
@custom-variant dark (&:where(.dark, .dark *));
```

`@txstack/ui` 의 테마는 런타임 CSS 가 아니라 **Tailwind 클래스 문자열**이다.
Tailwind v4 는 스캔 대상을 스스로 정하는데, **`node_modules` 와 프로젝트 밖은 훑지 않는다.**

> **없으면** — 클래스가 전부 purge 되어 카탈로그의 스타일이 사라진다.
> 소비자 환경에서 실측한 차이: **40,800 bytes → 4,559 bytes (9배)**.
>
> 소비 앱에도 똑같은 제약이 걸린다 — `packages/ui/README.md` 의 경고가 그것이다.

`@custom-variant dark` 는 다크모드를 **class 전략**으로 쓰겠다는 선언이다.
없으면 `dark:` 가 OS 설정(`prefers-color-scheme`)을 따라가 툴바 토글이 먹지 않는다.

⚠ **Tailwind v4 는 프로젝트 루트를 자동 스캔한다.** 이전 빌드의 `dist/` 가 남아 있으면 그것까지
스캔해 결과가 오염된다. `@source` 효과를 측정할 때는 빌드 사이에 `dist` 를 지운다.

### 2-6. `preview.tsx` — 테마 데코레이터

```tsx
const ThemeCanvas = ({ theme, children }) => {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <div className="… bg-white dark:bg-slate-900">{children}</div>;
};

const withTheme: Decorator = (Story, context) => (
  <ThemeCanvas theme={context.globals.theme}>
    <Story />
  </ThemeCanvas>
);
```

**소비자와 같은 방식(`<html class="dark">`)으로 건다.** 그래야 테마 검증이 의미를 갖는다.
스토리 캔버스는 iframe 이라 그 안의 `documentElement` 에 클래스가 붙는다.

> ⚠ **데코레이터 함수 안에서 훅을 직접 부르면 안 된다.** `react-hooks/rules-of-hooks` 에 걸린다.
> 데코레이터는 컴포넌트가 아니라서 React 가 훅 소유자를 식별하지 못한다.
> 위처럼 **대문자로 시작하는 실제 컴포넌트**로 분리한다.

### 2-7. `preview.tsx` — `globalTypes` 툴바

`theme` 전역을 툴바 드롭다운으로 노출한다. `context.globals.theme` 로 읽는다.
스토리마다 다크/라이트 버전을 따로 만들 필요가 없어진다.

### 2-8. 의존을 **루트** devDependencies 에 두는 이유

`storybook` · `@storybook/react-vite` · `@storybook/addon-docs` 는 **루트**에 있다.

스토리 파일이 `packages/ui/src` 에 사는데, 이 의존이 `apps/storybook` 에만 있으면
pnpm 의 엄격한 `node_modules` 구조에서 `packages/ui` 가 해석하지 못한다.

> **없으면** — `TS2307: Cannot find module '@storybook/react-vite'` 로 `pnpm typecheck` 가 깨진다.
> 실제로 첫 스토리를 쓰자마자 겪었다.

vitest 를 루트에 두는 것과 같은 방침이다. **개발 도구는 루트가 소유한다.**

### 2-9. `tsconfig.json` — 스토리를 검사 대상에 넣는다

```json
"include": ["src", ".storybook", "../../packages/ui/src/**/*.stories.tsx"]
```

스토리도 타입 검사를 받는다. **스토리는 컴포넌트 API 의 첫 소비자**라, 여기서 깨지면
소비자에게도 깨진다. `packages/ui` 의 `tsc` 도 `src` 전체를 보므로 이중으로 걸린다.

---

## 3. 스토리 작성 계약

`TxButton.stories.tsx` 가 표준이다. 새 스토리는 이 형태를 따른다.

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TxButton } from ".";

const meta = {
  title: "Form/TxButton", //  그룹/컴포넌트명
  component: TxButton,
  tags: ["autodocs"], //  props 표 자동 생성
  parameters: {
    docs: { description: { component: "…" } } //  주의점부터 적는다
  },
  args: { label: "확인" }, //  기본값 — 첫 스토리가 바로 조작 가능해진다
  argTypes: {
    variant: { control: "select", options: [...] },
    theme: { control: false } //  조작이 무의미한 것은 끈다
  }
} satisfies Meta<typeof TxButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
```

### 3-1. 그룹

`title` 의 앞부분이 사이드바 그룹이 된다. 현재 6개를 쓴다.

`Form` · `Data` · `Overlay` · `Layout` · `Feedback` · `Date ↗`

`↗` 는 **서브패스 컴포넌트**(`@txstack/ui/aggrid`, `/daypicker`)라는 표시다.

### 3-2. 스토리 구성 순서

1. **`기본`** — `args` 만 있는 최소형. 컨트롤로 조작하는 용도
2. **변형 축별 나열** (`Variant`, `Color`, `Size`) — 한눈에 비교
3. **상태** (`비활성`, `로딩`, `에러`)
4. **`테마_덮어쓰기`** — `theme` prop 으로 부분 교체. **`Tx*` 공통 규약이라 전 컴포넌트에 넣는다**

### 3-3. `docs.description` 에는 주의점을 먼저 쓴다

props 표는 자동 생성되므로 **타입에서 안 보이는 것**만 쓴다.

> 예: "`variant` 와 `color` 를 둘 다 주면 `color` 가 이긴다",
> "`onClick` 이 Promise 를 반환하면 해제될 때까지 자동으로 로딩 상태가 된다"

### 3-4. 제어 컴포넌트는 래퍼로 감싼다

`render` 화살표 함수 안에서 `useState` 를 부르면 `rules-of-hooks` 에 걸린다.
2-6 과 같은 이유다.

```tsx
const Controlled = (args: ITxInput) => {
  const [value, setValue] = useState("");
  return <TxInput {...args} value={value} onChangeText={setValue} />;
};

export const 기본: Story = { render: (args) => <Controlled {...args} /> };
```

---

## 4. 실제로 걸렸던 함정

27종을 등재하면서 겪은 것들이다. 처음 쓸 때 같은 데서 막힐 수 있다.

| 증상                                                    | 원인 · 해결                                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 필수 prop 이 있으면 `render` 만 있는 스토리가 타입 에러 | meta 의 `args` 에 기본값을 채운다. `children: null` 도 포함                                                                    |
| `decorators` 를 쓰면 `TS2742`(비이식적 타입)            | `satisfies Meta<…>` 대신 `const meta: Meta<typeof X> = {…}` 명시 주석을 쓴다                                                   |
| `as const` 배열이 리터럴로 좁혀져 `useState` 와 안 맞음 | 드롭다운 `data` 등은 `const X: string[] = [...]` 로 선언한다                                                                   |
| 테마 키가 없다고 나옴                                   | 컴포넌트마다 테마 키 이름이 다르다. `TxInput` 은 `wrapper`, `TxTabs` 는 `headActive` 다. 테마 파일을 먼저 본다                 |
| ag-grid / day-picker 스토리가 빈 화면                   | 서브패스 청크가 늦게 도착한다. 자동 검증 시 **2.5초 이상** 기다린다. 지연로딩이 동작한다는 증거이기도 하다                     |
| `Cannot access 'X' before initialization`               | 컴포넌트가 패키지 배럴(`".."`)에서 값을 가져오면 순환이 된다. 정의 모듈에서 직접 가져온다 (`rules/01_PACKAGE_BOUNDARIES` 예정) |

---

## 5. 직접 세워 볼 때의 순서

구성을 처음부터 다시 만든다면 이 순서가 막히지 않는다.

1. `apps/storybook` 에 `package.json`(private) + `dev`/`build` 스크립트
   루트에서 부를 수 있도록 `dev:storybook` · `build:storybook` 도 함께 추가한다
2. 루트에 `storybook` · `@storybook/react-vite` · `@storybook/addon-docs` 설치 (2-8)
3. `.storybook/main.ts` — `stories` · `framework` 만으로 먼저 띄운다
4. 스토리 하나를 만들어 **사이드바에 뜨는지** 확인 (스타일은 아직 깨져 있다)
5. `tailwind.css` + `viteFinal` 의 `tailwindcss()` 추가 → 스타일이 살아난다 (2-3, 2-5)
6. `alias` 추가 → 컴포넌트 수정이 HMR 로 즉시 반영되는지 확인 (2-4)
7. `addon-docs` 추가 → `/index.json` 에 `docs` 항목이 생기는지 확인 (2-2)
8. `preview.tsx` 의 테마 데코레이터 + 툴바 (2-6, 2-7)

**각 단계마다 무엇이 달라지는지 눈으로 확인하는 것**이 이 순서의 목적이다.
한 번에 다 넣으면 어느 조각이 무엇을 했는지 알 수 없다.

## 관련 문서

- [003 요구사항](../requirements/003_component_catalog_and_guide.md) — 카탈로그를 만드는 이유
- [1-2 계획](../plans/102_ui_catalog.md) — 직접 작성해 볼 job (`U2-02` · `U2-04`)
- [003 검증](../verification/003_component_catalog_and_guide.md) — 27종 등재 결과와 발견한 결함
