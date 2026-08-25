---
"@txstack/ui": minor
---

`TxButton` 을 명세에 맞춰 정리하고 **전역 테마 경로(`TxThemeProvider`)를 만든다** (`001-TxButton-S1`~`S4`).

## 새로 생긴 것 — `TxThemeProvider`

지금까지 `theme` prop 은 **인스턴스 단위**뿐이었다. 브랜드 색 하나를 앱 전체에 입히려면
호출마다 `theme` 을 넘기거나 래퍼 컴포넌트를 26개 만들어야 했다.

```tsx
<TxThemeProvider theme={{ TxButton: { variants: { primary: "bg-violet-600 text-white hover:bg-violet-700" } } }}>
  <App />
</TxThemeProvider>
```

- 테마는 **라이브러리 기본 → Provider 전역 → 인스턴스 `theme` prop** 순으로 합쳐진다. 뒤가 이긴다
- **감싸지 않아도 동작한다.** Provider 는 선택이다
- 새 export: `TxThemeProvider` · `TxThemeProviderProps` · `TxThemeOverrides` · `useTxTheme`
- 지금은 `TxButton` 만 연결돼 있다. 나머지 컴포넌트는 각자의 정리 단계에서 붙는다

## 공개 API 변경 (소비자 영향 있음)

- **`color` prop 을 없앴다.** `variant`(의미)와 `color`(팔레트)가 같은 자리를 다투고
  우선순위를 외워야 했다. 20색 팔레트 클래스도 전부 번들에 들어가 있었다.
  색이 필요하면 `className` 또는 `theme` 을 쓴다. `TxButtonTheme.colors` 도 함께 사라진다.
- **`onEnter` prop 을 없앴다.** 버튼은 포커스 상태에서 Enter 를 누르면 브라우저가 이미 click 을
  발생시킨다. 지금까지는 `onEnter` 와 `onClick` 이 둘 다 불렸다. `onClick` 하나로 충분하다.
- **`type` 기본값이 `"button"` 이다.** 지금까지는 HTML 기본값인 `submit` 이라
  `TxForm` 안의 모든 버튼이 폼을 제출했다. **제출 버튼은 `type="submit"` 을 명시해야 한다.**
- **`aria-label` 을 자동으로 붙이지 않는다.** `title` 또는 `label` 을 `aria-label` 로 박고 있었다.
  보이는 글자가 있는 버튼에는 불필요하고, `title` 과 `label` 이 다르면 화면과 낭독이 어긋난다.
- props 타입 이름이 **`TxButtonProps`** 다 — `I` 접두를 쓰지 않는다.
- `TxButtonTheme` · `TxButtonVariant` · `TxButtonThemeOverride` 를 새로 내보낸다.
  테마를 덮어쓰려면 모양을 알아야 하는데 그동안 `TxButton` 만 테마가 비공개였다.
- **`variant` 가 열렸다.** `theme` 으로 `variants` 에 키를 추가하면 `variant="brand"` 처럼 그대로 쓸 수 있다.

## 겉모습이 바뀌는 것

- **`variant="text"` 가 `base` 를 통과한다.** 지금까지 `text` 만 분기로 건너뛰어
  **포커스 링(`focus-visible:ring`)과 disabled 스타일이 없었다** — 키보드 사용자가 포커스 위치를 볼 수 없었다.
  대신 `text` 에 여백(`p-2`)과 기본 글자색이 생긴다.
- **`ghost`·`text` 가 다크모드에서도 배경이 투명해진다.** `base` 의 `dark:bg-gray-800` 은
  `bg-transparent` 하나로 지워지지 않는다 — `dark:` 는 별도 variant 라 서로 다른 규칙이다.
- **동기 `onClick` 은 로딩 상태로 들어가지 않는다.** 스피너가 한 프레임 깜빡이던 것이 사라진다.
- **`disabled` 만으로는 `cursor-wait` 가 붙지 않는다.** 로딩과 비활성은 다른 상태다.

명세: `docs/001_ui/components/TxButton.md`
