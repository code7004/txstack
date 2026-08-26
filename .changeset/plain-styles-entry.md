---
"@txstack/ui": minor
---

**스타일을 자체 CSS 로 낸다.** `@txstack/ui/styles.css` 한 줄이면 기본 스타일이 나온다.

```tsx
import "@txstack/ui/styles.css"; // 앱에서 한 번
```

지금까지 이 패키지의 스타일은 **Tailwind 클래스 문자열**이었다. 그래서 소비자가

```css
@source "../node_modules/@txstack/ui/dist";
```

를 빠뜨리면 클래스가 전부 purge 되어 **아무 스타일도 안 남았고**, 증상(스타일 없음)이
원인(스캔 경로 누락)을 전혀 가리키지 않았다. 더 큰 문제는 그다음이다 —
**커스터마이징을 하려면 소비자도 Tailwind 를 써야 했다.** 범용 라이브러리로서는 실격 조건이다.

이제 값은 **CSS 변수**로 바꾼다. 소비자가 CSS · Sass · Tailwind · CSS Modules 중 무엇을 쓰든 상관없다.

```css
.tx-spinner {
  --tx-spinner-duration: 2s;
}
```

## Tailwind 를 쓴다면 레이어 순서를 한 줄 적는다

`styles.css` 의 내용은 전부 **`tx` 캐스케이드 레이어** 안에 있다. 레이어에 없는 CSS 는 레이어에 있는
CSS 를 **특이도와 무관하게 이기기** 때문이다 — 우리가 레이어 밖에 있으면 소비자가 `className` 으로
무엇을 주든 `.tx-button` 이 정한 속성은 꿈쩍도 하지 않는다.

**순수 CSS · Sass · CSS Modules 를 쓴다면 아무것도 안 해도 된다.** 레이어를 안 쓰는 평범한 CSS 가
항상 이긴다. Tailwind 는 유틸리티가 `@layer utilities` 안에 있으므로 `tx` 의 자리를 알려줘야 한다.

```css
@layer theme, base, tx, components, utilities;

@import "tailwindcss";
@import "@txstack/ui/styles.css";
```

`tx` 를 `base` 앞에 두면 Tailwind preflight 가 버튼의 배경과 여백을 지우고, `utilities` 뒤에 두면
`className` 이 다시 안 먹는다. **그 사이여야 한다.**

**이번 릴리스에 실린 것은 `TxSpinner` 와 `TxButton` 이다.** 나머지 컴포넌트는 아직 Tailwind 클래스
문자열을 쓰고 있어 `@source` 지정이 계속 필요하다. 하나씩 옮기며 그 목록을 줄인다.

- 새 export: `@txstack/ui/styles.css` (사전 빌드 CSS, `dist/styles.css`)
- 선택자 규약: `tx-<kebab-case>` 기본 클래스 + `data-*` 상태. `data-tag` 는 그대로다
- keyframes 이름에는 `tx-` 접두가 붙는다 — 전역 이름공간이라 소비자 앱과 부딪히면 안 된다
- 다크모드는 `.dark` 클래스 전략 그대로다. **컴포넌트 CSS 에 `.dark` 분기를 두지 않고** 토큰만 재정의한다

설계: `docs/001_ui/20_design.md`
