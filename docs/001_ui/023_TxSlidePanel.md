# 023 · TxSlidePanel

> 가장자리에서 밀려 나오는 패널(서랍). 상세 보기나 필터 패널에 쓴다.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxSlidePanel` |
| 소스 | [`packages/ui/src/TxSlidePanel/`](../../packages/ui/src/TxSlidePanel) |
| 테스트 | 48개 |

## 개발 목적

가장자리에서 밀려 나오는 서랍. 상세 보기나 필터 패널에 쓴다. `TxModal` 과 다른 것은 **뜨는 자리 하나뿐**이라 나머지 규약을 그대로 물려받는다.

## 기능

**네이티브 `<dialog>` 다.** `TxModal` 과 같은 바탕이라 포커스 트랩 · 닫을 때 포커스
되돌리기 · 배경 비활성화 · 맨 위 층(top layer)을 **브라우저가 맡는다.** 다른 것은
화면 가운데 뜨느냐 가장자리에서 밀려 나오느냐, 그 하나뿐이다.

### 쓰는 법

```tsx
<TxSlidePanel open={open} onClose={() => setOpen(false)} side="right" title="필터">
  <TxForm>…</TxForm>
</TxSlidePanel>
```

**닫는 길은 셋이지만 콜백은 하나다** — 닫기 버튼 · 바깥 클릭 · Escape 가 전부 `onClose` 로 온다.

크기는 CSS 변수 하나로 바꾼다 — `.tx-slide-panel { --tx-slide-panel-size: 28rem }`.
좌우면 폭, 위아래면 높이를 뜻한다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxSlidePanel/`
- [x] **테스트** — 48개
- [x] **스토리** — `TxSlidePanel.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

원본은 `role="dialog" aria-modal="true"` 를 손으로 달고 `framer-motion` 으로 밀었다.
**`TxModal` 에서 이미 답이 나온 문제들이라 `<dialog>` 로 옮기자 한꺼번에 사라졌다** —
포커스 트랩 · 닫을 때 포커스 되돌리기 · 배경 비활성화 · top layer 를 브라우저가 맡는다.
`lockPageScroll` 은 두 컴포넌트가 함께 쓰므로 `tx-ui.utils` 로 옮겼다.

### `aria-modal="true"` 인데 갇히지 않았다

가장 큰 결함이다. **갇혔다고 알려 놓고 Tab 으로 뒤 화면에 나갔다.** 스크린리더는
"이 밖은 없는 셈 치라" 고 듣고 실제로는 밖으로 나가니, 아무 안내도 없는 것보다 나쁘다.
`showOverlay={false}` 일 때도 `true` 라서 그때는 아예 거짓말이었다.

### `top` · `bottom` 이 화면을 통째로 덮고 있었다

`panelClassName` 의 기본값이 `"w-80 h-screen"` 이었다. 위아래 방향은 `positions` 가
`w-screen` 을 얹는데 기본값의 `h-screen` 은 그대로 남아, **위에서 내려오는 서랍이
전체 화면이 됐다.** 크기 손잡이를 하나로 합쳐 없앤 결함이다.

### 크기 손잡이는 `--tx-slide-panel-size` 하나다 (합의)

**좌우면 폭, 위아래면 높이**를 뜻한다. 방향마다 다른 prop 을 외울 것이 없고,
Tailwind 를 안 쓰는 소비자도 크기를 갖는다. 원본은 기본값이 Tailwind 클래스여서
**Tailwind 없는 프로젝트에서는 크기가 아예 없었다** — 범용 라이브러리가 할 일이 아니다.

### 비모달 모드는 잘랐다 (합의)

원본의 `showOverlay={false}` 는 "뒤 화면을 계속 조작하는 서랍" 이었다. 앱 사용 0회였고,
그 모드에서도 `aria-modal="true"` 를 달고 있어 **애초에 뜻대로 동작하지 않았다.**
`<dialog>` 의 `show()` 로 되살릴 수는 있지만 그러면 포커스 트랩이 없고 top layer 밖이라
z-index 층이 하나 더 는다 — **한 컴포넌트가 두 동작을 갖는다.** 요구가 생기면 그때 판단한다.

### `<dialog>` 의 UA 스타일과 겹쳐 자리가 어긋났다 (이식하며 낸 결함)

`right` · `bottom` 서랍이 **화면 가운데쯤에서 밀려 나왔다.** UA 스타일은 `dialog` 에
`left: 0; right: 0` 을, 모달에는 `top: 0; bottom: 0` 까지 준다 — 가운데 놓으려고 그런 것이다.
붙일 변만 얹으면 반대쪽 UA 값이 살아남아 **폭·높이와 함께 과잉 제약**이 되고, 브라우저는
둘 중 하나를 버린다(LTR 에서는 `right`, 세로로는 `bottom`). 그래서 패널이 반대쪽 끝에
자리 잡고, `translate` 가 그것을 화면 안쪽으로 옮겨 놓았다.

`left` · `top` 은 UA 가 이미 주던 값과 같아서 멀쩡했다 — **절반만 맞아서 안 보이던 종류다.**
이제 네 방향이 붙는 변과 **반대쪽 변(`auto`)을 함께** 정한다. 물리 속성으로 양쪽을 다
정하므로 RTL 에서도 UA 의 논리 속성이 새어 들어오지 않는다.

### 그 밖에 고친 것

- **Escape 가 `window` 리스너였다.** 패널이 둘 겹치면 한 번에 둘 다 닫혔다. 이제
  포커스가 패널 안에 갇히므로 `keydown` 은 맨 위의 것에만 올라온다
- **오버레이가 화면을 덮는 `<button aria-label="Close panel">`** 이었다. 탭 순서에 잡히고,
  `closeOnBackdrop={false}` 면 아무 일도 안 하는 버튼이 화면을 덮었다. 문구도 영어 하드코딩이라
  소비자가 못 바꿨다. `::backdrop` 이 대신한다
- **닫기 X 가 `<svg onClick>`** 이었다 — 키보드로 못 닫고 버튼으로 읽히지 않았다 (`TxModal` 과 같은 결함)
- `role="dialog"` 가 오버레이를 자식으로 품은 바깥 `<aside>` 에 붙어 있었고 `title` 과 이어지지 않았다
- `lockScroll` 이 각자 `body.style.overflow` 를 저장·복원해서 **둘이 겹치면 어긋났다.**
  세어 두는 방식으로 바꿨다 (`prop` 도 없앴다 — 화면을 덮는 층이 배경을 흘리게 둘 이유가 없다)
- 패널의 `onClick={(e) => e.stopPropagation()}` — 받을 부모가 없는 죽은 코드였다. 게다가
  실제로 걸려 있었다면 소비자의 부모 클릭 핸들러까지 죽인다
- `showCloseButton` → `hideCloseButton` (`TxModal` 과 이름을 맞췄다)
- `ITxSlidePanel` · `TTxSlidePanelSide` → `TxSlidePanelProps` · `TxSlidePanelSide`
- **`prefers-reduced-motion` 을 지킨다.** 원본은 늘 밀었다
