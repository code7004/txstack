# 036 · TxProgress

> 얼마나 왔는지 보여 주는 막대.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxProgress` |
| 소스 | [`packages/ui/src/TxProgress/`](../../packages/ui/src/TxProgress) |
| 테스트 | 32개 |

## 개발 목적

얼마나 왔는지 보여 주는 막대. **아는 것만 그린다** — 끝을 모르는 기다림은 `TxLoading` · `TxSpinner` 몫이다. 모르는데 막대를 그리면 아는 척이 된다.

## 기능

### 쓰는 법

```tsx
<TxProgress value={72} label="업로드" />
<TxProgress value={3} max={5} variant="success" showValue />
```

**얼마나 왔는지 아는 것만 그린다.** 끝이 언제인지 모르는 기다림은 `TxLoading` ·
`TxSpinner` 가 맡는다 — 진행률을 모르는데 막대를 그리면 **어디까지 왔는지 아는 척**이 된다.

갈래는 `TxAlert` · `TxToast` · `TxTag` 와 같은 어휘다.

겉모습은 CSS 변수로 바꾼다 — `.tx-progress { --tx-progress-height: 0.5rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxProgress/`
- [x] **테스트** — 32개
- [x] **스토리** — `TxProgress.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### `TxProgress` — 아는 것만 그린다

`determinate` 전용이다. 끝을 모르는 기다림은 `TxLoading` · `TxSpinner` 가 맡는다 —
**모르는데 막대를 그리면 아는 척**이 된다.

`<progress>` 를 쓰지 않았다. 브라우저마다 겉모습을 바꾸는 길이 달라 토큰 하나로 맞출 수 없다 —
값은 `role="progressbar"` 와 `aria-value*` 로 그대로 전한다. **범위를 넘는 값은 잘라서
화면과 읽히는 값을 같게** 한다. `showValue` 에 함수를 주면 `aria-valuetext` 도 그 글자로 나간다
(`3/5` 를 퍼센트로 읽으면 뜻이 달라진다).
