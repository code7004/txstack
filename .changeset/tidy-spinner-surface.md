---
"@txstack/ui": minor
---

`TxSpinner` 를 명세에 맞춰 정리한다 (`001-TxSpinner-S2`).

`size` 가 폭에 적용되지 않는 결함이 핵심이다. 기본 `className="w-full"` 이 `width` 속성을 이겨
(CSS 선언 > presentation attribute) 폭은 100%, 높이만 `size` 였다. 인라인으로 놓으면 형제를 밀어냈고,
실제로 첫 사용처에서 `className="w-auto"` 로 되돌려 쓰고 있었다.

**공개 API 변경 (소비자 영향 있음)**

- `export default TxSpinner` → **named export** `export { TxSpinner }`.
  배럴을 통해 쓰던 소비자는 영향이 없다 (기존에도 이름으로 재수출하고 있었다).
- props 타입 이름이 **`TxSpinnerProps`** 다 — `I` 접두를 쓰지 않는다.
  같은 릴리스의 "props 인터페이스 3종을 export 한다" 항목이 `ITxSpinnerProps` 로 적고 있는데, **이쪽이 최신이다.**
- `size` 가 `number | string` 을 받는다. number 는 px (`size={24}`).
  **기본값이 `"2em"` → `"1em"` 으로 바뀐다.** `TxIcons` 의 모든 아이콘과 같은 기준이 되어,
  부모의 font-size 를 따라간다. 이전 크기를 유지하려면 `size="2em"` 을 명시한다.
- 기본 클래스가 **`tx-spinner` 하나**다. `className` 은 이걸 교체하지 않고 **덧붙는다** —
  색만 바꾸려다 회전이 사라지지 않는다. 회전 속도는 `--tx-spinner-duration` 으로 바꾼다.
- `decorative` prop 추가. 켜면 `role="status"` · `aria-label` 대신 `aria-hidden` 이 붙는다.
  옆에 이미 읽을 문구가 있는 자리(버튼 안 등)에서 스크린리더 중복 안내를 막는다.
  **소비자가 `role`·`aria-label` 을 함께 주더라도 `decorative` 가 켜져 있으면 버린다** —
  `aria-hidden` 요소에 남은 라벨은 읽히지도 않으면서 마크업만 어지럽힌다.
  꺼져 있을 때는 소비자가 준 `role`·`aria-label` 이 기본값을 이긴다.
  `TxButton` 의 기본 로딩 표시가 `<TxSpinner decorative />` 로 바뀌었다.

**그 밖에**

- 무효 클래스 `items-center` 제거 (`<svg>` 는 flex 컨테이너가 아니다).
- `prefers-reduced-motion` 대응. **회전을 멈추지 않고 늦춘다** — 멈추면 "로딩 중"이라는 정보가 사라진다.
  값은 `--tx-spinner-duration-reduced` 로 열려 있다.
- **색과 크기를 CSS 로 선언하지 않는다.** 색은 부모의 `color`, 크기는 `size` 속성(기본 `1em`)이
  정한다. 라이브러리가 둘 중 하나라도 CSS 로 잡으면 위의 `size` 결함이 그대로 되살아난다.
- 구현을 `index.tsx` 에서 `TxSpinner.tsx` 로 옮기고 배럴은 재수출만 한다. `data-tag="TxSpinner"` 추가.
- `size` 에 `"w-6 h-6"` 을 줄 수 있다고 적힌 거짓 주석을 걷어냈다. 그렇게 주면 `width` 속성값이 되어 무효다.

명세: `docs/001_ui/components/01_TxSpinner.md`
