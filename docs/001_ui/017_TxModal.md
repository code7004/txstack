# 017 · TxModal

> 화면을 덮고 뜨는 창.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxModal` |
| 소스 | [`packages/ui/src/TxModal/`](../../packages/ui/src/TxModal) |
| 테스트 | 35개 |

## 개발 목적

화면을 덮고 뜨는 창. 네이티브 `<dialog>` 로 옮겨 **포커스 가둠 · 백드롭 · Escape 를 브라우저에게 맡긴다** — 손으로 짜면 반드시 빠지는 것들이다.

## 기능

**네이티브 `<dialog>` 다.** 그래서 포커스 트랩 · 닫을 때 포커스 되돌리기 · 배경 비활성화 ·
맨 위 층(top layer)을 **브라우저가 맡는다.** 손으로 짠 트랩이 중첩 모달이나 동적 내용에서
새는 일이 없고, `overflow: hidden` 조상에 잘리지도 않는다.

### 쓰는 법

```tsx
<TxModal open={open} onClose={() => setOpen(false)} title="비밀번호 변경">
  <TxForm>…</TxForm>
  <TxModal.Footer>
    <TxButton label="취소" variant="secondary" onClick={() => setOpen(false)} />
    <TxButton label="저장" onClick={save} />
  </TxModal.Footer>
</TxModal>
```

**닫는 길은 셋이지만 콜백은 하나다** — 닫기 버튼 · 바깥 클릭 · Escape 가 전부 `onClose` 로 온다.

겉모습은 CSS 변수로 바꾼다 — `.tx-modal { --tx-modal-width: 40rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxModal/`
- [x] **테스트** — 35개
- [x] **스토리** — `TxModal.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

원본 78줄에서 **접근성 결함 셋**이 한꺼번에 나왔다. 포커스 트랩이 없어 열린 모달에서 Tab 이
배경으로 새어 나갔고, 포커스를 모달로 옮기지도 닫을 때 되돌리지도 않았으며,
닫기 아이콘이 `<div>`(SVG)에 `onClick` 이라 키보드로 누를 수 없었다.

**`<dialog>` + `showModal()` 로 옮겨서 앞의 둘을 브라우저에 넘겼다.** 덤으로 top layer 에
올라가므로 포털도 z-index 토큰도 필요 없다 — `overflow: hidden` 조상에 잘리지 않고,
`TxPopup` 이 `--tx-popup-z` 를 들고 있는 것과 다른 점이다. 손으로 짠 트랩은 중첩 모달과
동적 내용에서 새기 쉬운데 그 부담을 지지 않는다.

**`TxPopup` 을 쓰지 않는다.** 그쪽은 앵커에 붙어 뜨는 층이라 하는 일이 다르다.
겹치는 건 `createPortal` 두 줄뿐인데 `<dialog>` 는 그것도 필요 없다. (3차에서 정하기로 했던 항목이다.)

**jsdom 에는 `showModal` 이 없다**(30.0.1 에서 확인). 그래서 있는지 보고 없으면 `open` 속성으로
연다 — 트랩은 없지만 내용은 그려지므로 **소비자가 jsdom 에서 테스트해도 깨지지 않는다.**

### `cancel` 이벤트에만 기대면 안 된다 — 사용자가 잡았다

Escape 가 **아무 일도 하지 않았다.** `<dialog>` 의 `cancel` 이벤트만 듣고 있었는데, 그건
DOM 이벤트가 아니라 **브라우저가 판단해서 보내는 close request** 라서 끼워 넣은 화면
(Storybook 의 iframe)이나 자동화 도구에서는 오지 않는다. 처음 옮길 때 "실물 Escape 는
확인하지 못했다" 고 적어 둔 바로 그 자리다.

이제 `keydown` 을 **직접 받는다.** 포커스가 창 안에 갇혀 있으므로 키는 반드시 `<dialog>` 로
올라온다. 기본 동작을 막는 것도 그대로 중요하다 — 안 막으면 브라우저가 스스로 닫아서
창은 사라졌는데 `open` 은 `true` 로 남는다.

`cancel` 경로도 남겨 뒀다(두 경로가 다 오는 환경이 있다). 대신 **닫아 달라는 요청을 한 번만
흘려보낸다** — 소비자의 `onClose` 가 두 번 불리면 저장이나 라우팅이 두 번 일어난다.

`closeOnEscape` 가 생겼다. 끄는 자리는 답을 받아야만 하는 창인데, **`TxDialog` 는 켠 채로 둔다** —
네이티브 `confirm` 도 Escape 를 `false` 로 보기 때문이다.

### 닫는 길 — 두 컴포넌트가 다르다

| 닫는 길                | `TxModal` | `TxDialog`                    |
| ---------------------- | --------- | ----------------------------- |
| 닫기 버튼(X)           | 있다      | **없다** — 취소 버튼과 겹친다 |
| 바깥(어두운 바탕) 클릭 | 닫힌다    | **막는다**                    |
| Escape                 | 닫힌다    | 닫힌다 → `false`              |

바깥 클릭만 막는 이유는 **잘못 누른 것이 "취소를 골랐다" 가 되면 안 되기** 때문이다.
Escape 는 그와 달리 분명한 의사표시다. **스토리 문서가 이 표와 어긋나 있었다** — 사실에 맞췄다.

### 화면과 상태가 갈리지 않게

Escape 를 브라우저가 스스로 처리하면 창은 닫히는데 `open` 은 `true` 로 남는다.
`cancel` 의 기본 동작을 막고 `onClose` 만 부른다 — **닫는 것은 소비자가 `open` 을 내려서 한다.**

원본은 Escape 를 `window` 에서 들어서 **겹쳐 뜬 모달이 한 번에 다 닫혔다.** 이제 브라우저가
맨 위 모달에만 close request 를 보낸다.

### 그 밖에 고친 것

- **`id="txpopup-title"` 하드코딩** — 모달이 둘이면 `aria-labelledby` 가 겹쳤다. `useId` 로 바꿨다
- **`data-tag="TxPopup"`** — TxModal 인데 이름이 TxPopup 이었다 (복붙)
- **제목이 없으면 닫기 버튼째 사라졌다.** 앱의 `PartnerList` 가 실제로 제목 없이 쓰는데,
  `preventOutside` 까지 켜면 닫는 길이 ESC 하나였다. 지금은 제목과 무관하게 닫기 버튼이 있다
- **배경 스크롤이 안 잠겼다.** `<dialog>` 도 이건 안 해 준다. 겹쳐 뜰 수 있으므로 **세어 둔다** —
  안쪽이 닫혀도 바깥이 남아 있으면 풀리지 않는다
- 안쪽에 걸린 `onClick={(e) => e.stopPropagation()}` 제거. 바깥 클릭은 `event.target` 이
  `<dialog>` 자신인지로 가린다 — `TxDropdown` 에서 고쳤던 것과 같은 결함이었다
- `preventOutside` → `closeOnBackdrop`. **부정형 prop 을 만들지 않는다**
- `visible`/`onExit` → `open`/`onClose` (`TxPopup`·`TxDropdown` 과 같은 이름)

### framer-motion 을 걷어낸 첫 사례

여닫히는 페이드는 `@starting-style` 과 `transition-behavior: allow-discrete` 로 한다.
`::backdrop` 도 같은 방식으로 흐려진다. **애니메이션 라이브러리 하나를 peer 에서 뺀 값이다.**
`--tx-modal-duration: 0ms` 면 움직임 없이 즉시 뜬다.

전역 토큰이 하나 늘었다 — `--tx-color-backdrop`. **다크모드에서 뒤집지 않는다**:
라이트든 다크든 "뒤를 가린다" 는 뜻이 같다.
