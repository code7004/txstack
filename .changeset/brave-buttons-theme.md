---
"@txstack/ui": minor
---

`TxButton` 을 명세에 맞춰 정리하고 **스타일을 자체 CSS 로 옮긴다** (`001-TxButton-S1`~`S4`).

## 커스터마이징 방식이 바뀌었다 — `theme` 과 Provider 는 없다

같은 릴리스 안에서 방향을 한 번 바꿨다. 배포된 버전이 없으므로 **최종 형태는 이것 하나다.**

```tsx
import { TxButton } from "@txstack/ui";
import "@txstack/ui/styles.css"; // 앱에서 한 번

<TxButton label="저장" onClick={async () => await save()} />;
```

```css
/* 앱 전체 — 5종 variant 가 다 따라온다 */
:root {
  --tx-color-primary: #7c3aed;
  --tx-radius: 9999px;
}

/* 없던 variant 를 추가한다 */
.tx-button[data-variant="brand"] {
  --tx-button-bg: #0f172a;
  --tx-button-fg: #fff;
}
```

값은 **CSS 변수**로, 이 버튼 하나는 `className`, 안쪽 라벨은 `classNames={{ label }}` 로 바꾼다.
셋은 겹치지 않는다. **hover · 눌린 색 · 포커스 링 · 다크모드가 전부 그 한 줄에서 따라온다** —
클래스 문자열 시절에는 조건마다 하나씩 덮어야 했다.

- **`theme` prop 을 없앴다.** `TxButtonTheme` · `TxButtonThemeOverride` 도 함께 사라진다
- **`TxThemeProvider` · `useTxTheme` · `TxThemeOverrides` 를 없앴다.** 전역 브랜딩이 `:root` 한 줄이면
  되는데 Provider 를 두면 같은 일을 하는 경로가 둘이 된다
- **소비자가 Tailwind 를 쓸 필요가 없다.** CSS · Sass · Tailwind · CSS Modules 중 무엇이든 상관없다

## 새 전역 토큰 (`--tx-*`)

`tokens.css` 가 패키지에 처음 들어간다. 값은 이행 전 팔레트와 같아 **겉모습은 바뀌지 않는다.**

| 토큰                                         | 쓰임                  |
| -------------------------------------------- | --------------------- |
| `--tx-color-primary`                         | 주 동작               |
| `--tx-color-danger`                          | 파괴적 동작           |
| `--tx-color-muted`                           | 표면이 있는 보조 요소 |
| `--tx-color-text` · `--tx-color-on-accent`   | 글자                  |
| `--tx-color-state`                           | 상태 레이어에 섞는 색 |
| `--tx-state-hover` · `--tx-state-pressed`    | 섞는 비율 (16% · 28%) |
| `--tx-radius`                                | 모서리                |
| `--tx-focus-ring` · `--tx-focus-ring-offset` | 키보드 포커스 표시    |

**hover 와 눌린 색은 토큰이 아니다 — 배경색에서 계산된다.**

```css
/* 이 한 줄이면 hover·pressed 까지 전부 따라온다 */
:root {
  --tx-color-primary: #7c3aed;
}

/* 새 variant 도 배경만 주면 된다 */
.tx-button[data-variant="brand"] {
  --tx-button-bg: #0f172a;
  --tx-button-fg: #fff;
}
```

역할마다 `-hover` 짝을 두면 색 하나를 바꿀 때 두 개를 맞춰야 하고, 하나를 빠뜨리면
**"평상시만 보라, 마우스를 올리면 파랑"** 이 된다. 상태를 색이 아니라 **비율**로 정해 그 자리를 없앴다.
섞는 색이 다크에서 뒤집히므로 **라이트에서는 진해지고 다크에서는 옅어진다.**

컴포넌트 토큰은 `--tx-button-bg` · `-bg-hover` · `-bg-pressed` · `-fg` · `-padding` · `-radius` ·
`-shadow` · `-font-weight` · `-transition` 이고, 기본값이 위 전역 토큰을 참조한다.
다크모드는 `.dark` 에서 **토큰만 재정의**한다 — 컴포넌트 CSS 에 `.dark` 분기가 한 줄도 없다.

> **`color-mix()` 를 쓴다.** 지원 하한이 2023년 이후 브라우저(Chrome 111 · Safari 16.2 · Firefox 113)다.

## 공개 API 변경 (소비자 영향 있음)

- **`color` prop 을 없앴다.** `variant`(의미)와 `color`(팔레트)가 같은 자리를 다투고 우선순위를
  외워야 했다. 색이 필요하면 토큰이나 `className` 을 쓴다.
- **`onEnter` prop 을 없앴다.** 버튼은 포커스 상태에서 Enter 를 누르면 브라우저가 이미 click 을
  발생시킨다. 지금까지는 `onEnter` 와 `onClick` 이 둘 다 불렸다.
- **`type` 기본값이 `"button"` 이다.** 지금까지는 HTML 기본값인 `submit` 이라
  `TxForm` 안의 모든 버튼이 폼을 제출했다. **제출 버튼은 `type="submit"` 을 명시해야 한다.**
- **`aria-label` 을 자동으로 붙이지 않는다.** `title` 또는 `label` 을 박고 있었다. 보이는 글자가 있는
  버튼에는 불필요하고, `title` 과 `label` 이 다르면 화면과 낭독이 어긋난다.
- **`classNames={{ label }}` 이 생겼다.** 안쪽 라벨만 겨냥하는 자리다.
- props 타입 이름이 **`TxButtonProps`** 다 — `I` 접두를 쓰지 않는다. `TxButtonVariant` 는 그대로 있고
  `(string & {})` 라 **CSS 로 늘린 이름을 그대로 쓸 수 있다.**

## 겉모습·DOM 이 바뀌는 것

- **DOM 이 `class="tx-button"` + `data-variant` + `data-loading` 이다.** 유틸리티 클래스가 사라졌다.
  바깥에서 조준하려면 `.tx-button[data-variant="danger"]` 처럼 쓴다.
- 라벨이 `<span class="tx-button__label">` 로 감싸진다. 로딩 표시는
  `<span class="tx-button__loading">` 로 **라벨 위에 겹친다** — 누르는 순간 버튼 폭이 변하지 않는다.
- **`variant="text"` 가 공통 스타일을 통과한다.** 지금까지 `text` 만 분기로 건너뛰어
  **포커스 링과 disabled 스타일이 없었다** — 키보드 사용자가 포커스 위치를 볼 수 없었다.
- 포커스 표시가 `ring` 대신 **`outline`** 이다. `:focus-visible` 이라 마우스 클릭에는 안 뜬다.
- **hover 가 조금 더 뚜렷하다.** Tailwind 색상 한 단계를 건너뛰던 것과 비슷하거나 그보다 세다.
  약하게/세게 하려면 `--tx-state-hover` 하나만 바꾼다.
- **누를 때 반투명해지지 않는다.** `opacity: 0.5` 대신 배경이 16% 진해진다 — 라벨이 같이 흐려지지 않는다.
- 버튼이 `display: inline-flex` 다. 예전 테마의 `justify-center` 는 display 지정이 없어 무효였다.
- **동기 `onClick` 은 로딩 상태로 들어가지 않는다.** 스피너가 한 프레임 깜빡이던 것이 사라진다.
- 통과 props 가 `data-tag` · `data-variant` · `data-loading` · `type` · `disabled` 를 덮지 못한다.

명세: `docs/001_ui/components/02_TxButton.md`
