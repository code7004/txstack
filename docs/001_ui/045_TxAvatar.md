# 045 · TxAvatar

> 사람 한 명을 나타내는 동그란 칸.

|             |                                                               |
| ----------- | ------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                 |
| 내보내는 것 | `TxAvatar, TxAvatarGroup`                                     |
| 소스        | [`packages/ui/src/TxAvatar/`](../../packages/ui/src/TxAvatar) |
| 테스트      | 28개                                                          |

## 개발 목적

사람 한 명을 나타내는 칸. **사진이 없거나 깨져도 빈칸이 남지 않는다** — 이니셜로, 그것도 없으면 아이콘으로 떨어진다.

## 기능

### 쓰는 법

```tsx
<TxAvatar src={user.photo} name="김재훈" />   // 사진, 못 불러오면 이니셜
<TxAvatar name="김재훈" />                    // 이니셜 — "재훈"
<TxAvatar />                                  // 사람 아이콘

<TxAvatar name="김재훈" size="lg" shape="square" />
<TxAvatar name="김재훈" onClick={openProfile} />
```

**떨어지는 순서는 사진 → 이니셜 → 아이콘**이다. 사진 주소를 줬는데 못 불러와도
빈칸이 남지 않는다.

`name` 하나가 **이니셜의 원본이자 스크린리더가 읽는 이름**이다. 사진이 떨어져도
읽히는 것이 바뀌지 않는다.

크기 셋 말고 다른 크기가 필요하면 토큰으로 준다 —
`<TxAvatar style={{ "--tx-avatar-size": "5rem" }} />`.

**접속 중 표시 같은 점은 `TxBadge` 로 얹는다** — `<TxBadge dot variant="success"><TxAvatar …/></TxBadge>`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxAvatar/`
- [x] **테스트** — 28개
- [x] **스토리** — `TxAvatar.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

```tsx
<TxAvatar src={user.photo} name="김재훈" />   // 사진, 못 불러오면 이니셜
<TxAvatar name="김재훈" />                    // 이니셜 — "재훈"
<TxAvatar />                                  // 사람 아이콘
<TxAvatar icon={<Robot />} />

<TxAvatar name="김재훈" size="lg" shape="square" />
<TxAvatar name="김재훈" style={{ "--tx-avatar-size": "5rem" }} />
<TxAvatar name="김재훈" onClick={openProfile} />   // <button> 이 된다

<TxAvatarGroup max={3}>…</TxAvatarGroup>            // 넘치면 뒤에 `+2` 한 칸
```

정한 것들.

- **이니셜 규칙은 셋이다** (사용자 결정) — 띄어 쓴 이름은 **덩어리마다 첫 글자**
  (`"Jaehoon Kim"` → `"JK"`), 붙여 쓴 **한글**은 **뒤 두 글자**(`"김재훈"` → `"재훈"`),
  붙여 쓴 **라틴**은 첫 글자 하나(`"Jaehoon"` → `"J"`). 셋째를 따로 두지 않으면
  `"Jaehoon"` 이 `"on"` 이 된다 — 뒤쪽이 부르는 이름인 것은 한글 쪽 사정이다.
  글자는 코드 포인트로 자른다(이모지가 반쪽으로 잘리지 않는다)
- **`alt` 를 받지 않는다. `name` 하나가 이름이다.** 사진이 떨어져도 읽히는 것이 바뀌면
  안 되고, 안쪽(사진·이니셜·아이콘)은 전부 `aria-hidden` 이라 **같은 사람이 두 번
  불리지 않는다.** `name` 이 없으면 `role` 도 주지 않는다 — 읽을 것이 없는데 `role="img"`
  를 주면 "이미지" 라고만 읽힌다
- **사진 주소가 바뀌면 다시 시도한다.** 한 번 못 불러온 상태로 굳으면 목록에서 자리를
  돌려 쓰는 아바타가 **남의 실패를 물려받는다**
- **이름으로 배경색을 만들지 않는다.** 이름 해시로 색을 고르려면 팔레트를 발명해야 하고
  다크에서 대비를 다시 맞춰야 한다. 중립색 하나로 두고 **색은 토큰**으로 준다
- **접속 중 표시(`status`)를 갖지 않는다.** 점을 찍는 일은 `TxBadge` 가 `dot` ·
  `placement` 로 이미 한다. 같은 것을 둘이 가지면 소비자가 무엇을 골라야 하는지 모른다
- **크기는 토큰 하나에서 나온다** — `--tx-avatar-size`. 글자 크기도 겹침도 그 값에
  비례하므로 `size` 셋 밖의 크기도 토큰 하나로 끝난다. CSS 계약 테스트가 이걸 지킨다
- **겹침 기본값은 칸의 0.2 배다.** MUI · Ant Design 이 40px 아바타에 8px 을 겹치는 것과
  같은 값이다. 0.3 으로 두면 **두 글자 이니셜의 뒷글자가 다음 칸에 가린다** — Storybook 에서
  보고 내렸다. 겹침 테두리는 `border` 가 아니라 그림자다(테두리는 칸 크기를 바꿔서
  겹친 것과 안 겹친 것의 지름이 달라진다)
- **`+2` 칸도 읽힌다** — "외 2명". 남은 사람이 있다는 것이 보는 사람에게만 보이면 안 된다.
  `moreLabel` 로 바꾼다
