# 032 · TxCopyButton

> 눌러서 글자를 복사하는 버튼.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxCopyButton` |
| 소스 | [`packages/ui/src/TxCopyButton/`](../../packages/ui/src/TxCopyButton) |
| 테스트 | 21개 |

## 개발 목적

눌러서 글자를 복사하고 완료를 알린다. 원본 `TxClipboardButton` 을 되살린 것이고, 그때의 결함 셋을 다 고쳤다.

## 기능

### 쓰는 법

```tsx
<TxCopyButton value={apiKey} />
<TxCopyButton value={() => editor.getValue()} label="설정 복사" variant="secondary" />
```

**복사했는지 알려 준다.** 눌러도 아무 일이 없어 보이면 복사가 됐는지 알 길이 없다 —
잠깐 글자가 바뀌고, 그 소식이 **스크린리더에도 간다.**

겉은 `TxButton` 이 그린다 — `variant` 도 그쪽 것을 그대로 쓴다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxCopyButton/`
- [x] **테스트** — 21개
- [x] **스토리** — `TxCopyButton.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### `TxCopyButton` — 되살리며 원본의 결함 셋을 다 고쳤다

원본 `TxClipboardButton` 은 `<div onClick>` 이라 **키보드로 못 눌렀고, 버튼으로 읽히지
않았고, 복사됐는지 알 길도 없었다.** 겉을 `TxButton` 에 얹어 앞의 둘이 사라졌고,
셋째는 글자를 잠깐 바꾸고 **`role="status"` 로 소식을 따로 보낸다** — 버튼 글자가 바뀌는
것만으로는 마우스로 누른 사람에게 아무 소식이 없다.

**`navigator.clipboard` 는 보안 컨텍스트에서만 있다.** 사내 도구가 평문 http 로 뜨는 일이
흔해서, 없으면 숨긴 `<textarea>` 와 `execCommand` 로 물러선다. 브라우저에서 실패 경로가
실제로 돌았다 — 샌드박스 iframe 이라 둘 다 막혀서 "복사 실패" 가 떴다.

`data-tag` 는 넘기지 않는다. `TxButton` 이 그것을 **계약 속성으로 잠가 두어** 조용히
버려지기 때문이다 — 이것은 버튼이 맞으니 그 표시를 두고, 여기 것은 `.tx-copy-button` 과
`data-state` 가 알린다.

**폭이 튀는 것을 재서 고쳤다.** 처음 기본 실패 문구(`복사하지 못했습니다`)가 `min-width`
8rem 을 넘어 128 → 144.6px 로 흔들렸다. `복사 실패` 로 줄이니 기본 세 글자가 모두 128px
안에 들어 **폭이 아예 움직이지 않는다.**
