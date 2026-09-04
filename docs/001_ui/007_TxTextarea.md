# 007 · TxTextarea

> 여러 줄 입력.

|             |                                                                   |
| ----------- | ----------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                     |
| 내보내는 것 | `TxTextarea`                                                      |
| 소스        | [`packages/ui/src/TxTextarea/`](../../packages/ui/src/TxTextarea) |
| 테스트      | 29개                                                              |

## 개발 목적

여러 줄 입력. `TxInput` 의 껍데기를 그대로 쓰고 **내용만큼 늘어나는 높이**를 더한다.

## 기능

- `onChangeText` — 값이 바뀔 때마다
- `onBlurText` — 포커스가 빠질 때
- `autoGrow` — 내용에 맞춰 높이가 늘어난다

`value` 를 주면 controlled, 안 주면 uncontrolled 다. 둘 다 `ref.getValue()` 로 현재 값을 읽는다.

### 쓰는 법

```tsx
<TxTextarea placeholder="내용" onChangeText={setBody} />
<TxTextarea autoGrow rows={2} />
```

**껍데기는 `TxInput` 과 같은 것을 쓴다** — `.tx-input` 클래스를 함께 건다.
폼 안에 나란히 놓았을 때 테두리·배경·포커스 링이 어긋나면 안 되기 때문이다.
원본은 각자 그려서 **텍스트영역만 배경이 없었다** (다크모드에서 부모가 비쳤다).

## 개발 항목

- [x] **구현** — `packages/ui/src/TxTextarea/`
- [x] **테스트** — 29개
- [x] **스토리** — `TxTextarea.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

**`.tx-input` 클래스를 함께 걸고 높이만 되돌린다.** 원본은 껍데기를 따로 그리다
`TxClassBase`(배경·글자색)를 빠뜨려서 **텍스트영역만 배경이 없었다** — 다크모드에서 부모가 비쳤고
입력한 글자는 `gray-500` 으로 흐렸다. 클래스를 공유하면 그렇게 갈라질 자리가 없다.

**이게 `TxInput` 에서 정한 규칙의 첫 적용이다** — "껍데기를 함께 쓰는 컴포넌트는
`.tx-input` 을 같이 건다". `TxInputLike` 에 이어 두 번째다.

콜백도 정리했다. 원본의 `onChangedText` 는 **값 변경 · Enter · blur 세 곳에서** 불렸다.
textarea 에서 Enter 는 줄바꿈이라 `change` 로 이미 오는데 같은 값으로 한 번 더 왔고,
blur 는 값이 안 바뀌어도 왔다. `onChangeText`(`TxInput` 과 같은 이름) + `onBlurText` 로 갈랐다.

**`autoGrow` 는 신규다.** 내용에 맞춰 높이가 늘고 줄어든다. 켜면 손잡이(`resize`)가 사라진다 —
둘이 같이 있으면 타이핑할 때마다 사용자가 맞춰 둔 높이가 덮인다.
