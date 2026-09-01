# 009 · TxCapsLockCheck

> 비밀번호를 칠 때 Caps Lock 이 켜져 있으면 알려 준다.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxCapsLockCheck` |
| 소스 | [`packages/ui/src/TxCapsLockCheck/`](../../packages/ui/src/TxCapsLockCheck) |
| 테스트 | 22개 |

## 개발 목적

비밀번호 칸에서 늘 필요한 경고 하나. **감싼 칸만 감시한다** — 원본은 문서 전체를 듣고 있어 손대지 않은 칸에도 경고가 떴다.

## 기능

```tsx
<TxCapsLockCheck>
  <TxInput type="password" placeholder="비밀번호" />
</TxCapsLockCheck>
```

**감싼 입력창 안에서 키를 누를 때만 반응한다.** 그래서 화면 다른 곳에서 타이핑하다
Caps Lock 을 켜도 손대지 않은 칸에 경고가 뜨지 않는다.

경고가 뜨면 입력창과 이어 준다(`aria-describedby`) — 스크린리더가 그 칸에서 바로 안내한다.
창을 벗어나거나 포커스가 빠지면 경고를 내린다.

색·글자 크기는 CSS 변수로 바꾼다 — `.tx-capslock { --tx-capslock-color: … }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxCapsLockCheck/`
- [x] **테스트** — 22개
- [x] **스토리** — `TxCapsLockCheck.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

원본은 `window` 에 키 리스너를 붙였다. **화면 어디서 타이핑하든 반응해서**, 로그인 폼을
띄워 둔 채 다른 곳에서 Caps Lock 을 켜면 손대지도 않은 비밀번호 칸에 경고가 켜졌다.

**입력창을 `children` 으로 감싸는 구조로 바꿨다.** 감싼 안에서 누른 키만 듣고,
경고가 뜨면 `aria-describedby` 로 그 입력창과 이어 준다 — 스크린리더가 그 칸에서 바로 안내한다.

`role="status"` 영역을 **경고가 뜰 때 비로소 만들던 것**도 고쳤다. live region 은 미리
자리잡고 있어야 안에서 바뀐 내용을 읽어 준다 — 나중에 삽입하면 화면엔 떠도 안 읽힐 수 있다.

`preserveSpace` 는 목적을 달성하지 못하고 있었다. 빈 상태를 `&nbsp;` 로 채웠는데
**그 문단에만 글자 크기 클래스가 안 붙어서**, 경고가 뜨는 순간 막으려던 그 점프가 났다.
높이를 글자 크기와 줄높이에서 계산하도록 바꿨다. `&nbsp;` 도 없앴다 — 스크린리더가 읽는 텍스트 노드다.

`locale` prop 을 없앴다. `text` 를 키로 주고 `locale` 로 번역하는 이중 경로라 어느 쪽이
맞는지 헷갈렸다. 번역된 문구를 `text` 에 그대로 준다.

**남는 한계 하나.** 브라우저는 키를 누를 때만 Caps Lock 상태를 알려 준다. 마우스로 칸을 눌러
들어온 직후에는 알 수 없고 첫 글자를 칠 때 알게 된다. 이건 고칠 수 없다.
