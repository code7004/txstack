# 031 · TxBadge

> 무언가에 붙는 알림 점·개수.

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxBadge` |
| 소스 | [`packages/ui/src/TxBadge/`](../../packages/ui/src/TxBadge) |
| 테스트 | 26개 |

## 개발 목적

무언가에 얹히는 알림 점 · 개수. 감싼 것의 자리를 밀지 않고 모서리에 앉는다. 혼자 서는 이름표는 `TxTag` 다.

## 기능

### 쓰는 법

```tsx
<TxBadge count={3}>
  <TxButton label="알림" variant="secondary" />
</TxBadge>

<TxBadge dot label="새 소식 있음">
  <TxIconBell />
</TxBadge>
```

**혼자 서는 이름표는 `TxTag` 다.** 이쪽은 **무언가에 얹히는** 것이라, 감싼 것의 자리를
밀지 않고 모서리에 겹쳐 앉는다.

**숫자만으로는 무엇의 수인지 알 수 없다.** 기본 안내는 `"알림 3개"` 인데, 무엇의
알림인지는 `label` 로 준다 — `"읽지 않은 메일 3개"`.

겉모습은 CSS 변수로 바꾼다 — `.tx-badge { --tx-badge-size: 1.25rem }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxBadge/`
- [x] **테스트** — 26개
- [x] **스토리** — `TxBadge.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### 이름을 `TxBadge` 에서 `TxTag` 로 바꿨다 (결정됨)

처음에는 `TxBadge` 로 만들었다. 5차 목록을 정리하면서 **`TxBadge` 라는 이름이 두 물건
사이에서 갈린다**는 것이 드러났다.

- MUI · Chakra · Ant Design — `Badge` 는 **알림 점·카운트**(아이콘 위에 붙는 작은 표시)
- shadcn/ui · Bootstrap — `Badge` 는 **상태 라벨**(지금 만든 것)

**둘을 둘로 부르는 모형이 일관된다.** 상태 라벨은 `TxTag`(Ant Design 의 `Tag`, MUI 의 `Chip`),
`TxBadge` 는 알림 점·카운트로 비워 둔다. 업계 이름을 따르기로 한 기준(`TxAlert` · `TxToast`)이
여기서도 같은 답을 낸다 — **배포 전이라 값이 기계적인 이름 바꿈뿐이었다.**

### `TxBadge` 는 얹히는 것이다

`TxTag` 는 혼자 서고 이쪽은 **무언가에 얹힌다.** 감싼 것의 자리를 밀지 않고 모서리에
겹쳐 앉으며, **알림 위를 눌러도 감싼 버튼이 눌린다**(`pointer-events: none`).

**숫자만으로는 무엇의 수인지 알 수 없다.** 보이는 숫자는 장식으로 두고, 화면에서만
감춘 글자가 `"알림 3개"` 를 말한다 — `label` 로 `"읽지 않은 메일 3개"` 처럼 바꾼다.

자리는 **네 변을 전부 정한다.** 붙일 모서리만 얹으면 반대쪽이 `auto` 로 남지 않아
어긋난다 — `TxSlidePanel` · `TxToast` 에서 두 번 지나온 자리라 이번엔 처음부터 그렇게 했다.

여기서는 배경을 갈래색으로 꽉 채운다(`TxTag` 는 안 채웠다). 알림 점은 눈에 띄는 것이
일이기 때문인데, 대신 **`success` · `warning` 만 글자색을 따로 정한다** — 그 둘은
라이트/다크에서 밝기가 뒤집혀 흰 글자를 얹을 수 없다.
