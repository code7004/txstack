# 040 · TxSlider

> 값을 끌어 고르는 자리.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxSlider` |
| 소스 | [`packages/ui/src/TxSlider/`](../../packages/ui/src/TxSlider) |
| 테스트 | 24개 |

## 개발 목적

값을 끌어 고른다. 단일과 범위 둘 다 **네이티브 `<input type="range">`** 위에 세워 키보드와 접근성을 브라우저에게 맡긴다.

## 기능

### 쓰는 법

```tsx
<TxSlider value={volume} onChange={setVolume} max={100} />
<TxSlider value={[10, 80]} onChange={setRange} label={["최소", "최대"]} />
```

**네이티브 `<input type="range">` 다.** 그래서 키보드(←→ · Home · End · PageUp/Down)와
스크린리더 안내(`"50, 슬라이더"`)를 브라우저가 맡는다. 손으로 짠 슬라이더가 가장 자주
빠뜨리는 것이 그 둘이다.

배열을 주면 **손잡이가 둘**이 된다. 겹쳐 놓은 두 `<input>` 이라 키보드도 그대로 되고,
**서로를 넘어가지 않는다** — 시작이 끝보다 커지면 값이 뒤집혀 읽힌다.

겉모습은 CSS 변수로 바꾼다 — `.tx-slider { --tx-slider-thumb-size: 1.5rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxSlider/`
- [x] **테스트** — 24개
- [x] **스토리** — `TxSlider.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### `TxSlider` — 네이티브 `<input type="range">` 둘을 겹친다

키보드(←→ · Home · End · PageUp/Down)와 스크린리더 안내를 브라우저가 맡는다 —
손으로 짠 슬라이더가 가장 자주 빠뜨리는 것이 그 둘이다.

손잡이가 둘이면 **서로를 넘지 못하게** 가둔다(넘으면 값이 뒤집혀 읽힌다). 이름도 둘을
받는다 — 둘 다 "값" 이라고만 하면 어느 쪽을 잡고 있는지 알 수 없다.
