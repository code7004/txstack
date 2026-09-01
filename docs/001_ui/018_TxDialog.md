# 018 · TxDialog

> 네이티브 `alert` · `confirm` 을 대신하는 확인창. **어디서든 부른다** —

| | |
| --- | --- |
| 진입점 | `@txstack/ui` |
| 내보내는 것 | `TxDialog` |
| 소스 | [`packages/ui/src/TxDialog/`](../../packages/ui/src/TxDialog) |
| 테스트 | 21개 |

## 개발 목적

브라우저의 `alert` · `confirm` 을 대신한다. 그쪽은 문구를 바꿀 수 없고 흐름을 끊는다. **컴포넌트 밖에서도 부를 수 있어야** 해서 store + host 구조다.

## 기능

컴포넌트 안이든, axios 인터셉터든, 그냥 유틸 함수든.

```tsx
await TxDialog.alert("처리할 수 없습니다.");

if (await TxDialog.confirm("로그아웃 하시겠습니까?")) signOut();

const ok = await TxDialog.confirm({
  title: "콜백 재시도",
  message: "실패한 콜백 전체를 재시도합니다.",
  tone: "danger",
  confirmLabel: "재시도"
});
```

**네이티브와 다른 점은 하나, `await` 가 필요하다는 것이다.** 브라우저에서 자바스크립트를
멈춰 세울 방법이 없다. 그래서 `if (!confirm(…)) return` 은 `if (!(await …)) return` 이 된다.

창은 `TxModal` 이 그린다 — 포커스 트랩·Escape·바깥 클릭이 거기서 해결돼 있다.
**`confirm` 에서 Escape 와 바깥 클릭은 취소로 친다.**

여러 번 연달아 불러도 **겹치지 않고 차례로** 뜬다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxDialog/`
- [x] **테스트** — 21개
- [x] **스토리** — `TxDialog.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

원본에 없다. **앱이 네이티브 `alert` 을 15곳, `confirm` 을 5곳에서 쓰고 있어서** 만들었다.
`TxModal` 이 막 끝난 참이라 그 위에 얹는 값이 쌌다.

```tsx
await TxDialog.alert("처리할 수 없습니다.");
if (await TxDialog.confirm("로그아웃 하시겠습니까?")) signOut();
```

**바뀌는 것은 하나, `await` 다.** 브라우저에서 자바스크립트를 멈춰 세울 방법이 없다.
`if (!confirm(…)) return` 은 `if (!(await …)) return` 이 된다.

### 훅이 아니라 함수인 이유

React 다운 방식은 Provider + 훅이지만, 앱의 `alert` 하나가 **`core/extensions.ts` 안**에 있다.
axios 인터셉터에서 "세션이 만료됐습니다" 를 띄우는 자리도 마찬가지다 — **컴포넌트가 아닌 곳에서는
훅을 쓸 수 없다.** 그래서 어디서든 import 해서 부르는 형태로 만들고, 처음 부르는 순간
자기 React 루트를 만들어 띄운다.

**이게 가능한 것은 겉모습이 전부 `:root` 의 토큰이기 때문이다.** 별도 루트에 띄워도 테마가
그대로 따라온다 — ThemeProvider 를 요구하는 라이브러리였다면 못 했을 방식이다.

이름이 `TxDialog` 하나인 것도 이유가 있다. 배럴 테스트가 **모든 공개 이름이 `Tx` 로 시작할 것**을
강제하므로 `txAlert` 같은 이름은 쓸 수 없다.

### 정한 것들

- **줄 세운다.** 셋을 한 번에 불러도 겹쳐 뜨지 않고 차례로 뜬다 — 사람은 한 번에 하나만 답한다
- **바깥을 눌러도 닫히지 않는다.** 네이티브가 그렇듯 답하기 전에는 안 닫힌다 —
  `confirm` 에서 바깥을 잘못 누르면 조용히 "취소를 골랐다" 가 되어 버린다. 그건 답이 아니다.
  바깥 클릭으로 닫히는 창이 필요하면 그건 `TxModal` 의 일이다
- **취소 · Escape 가 `false`** 다. 네이티브 `confirm` 과 같다
- **오른쪽 위 X 가 없다.** 취소 버튼과 뜻이 같은 길이 둘이면 답이 둘로 보인다.
  `TxModal` 에 `hideCloseButton` 을 더해 껐다 — **확인·취소가 답을 받는 창**에만 쓰는 옵션이다
- **줄바꿈(`\n`)을 그대로 보인다.** 앱의 문구에 실제로 들어 있어서, 한 줄로 뭉치면 옮겨 온 문구가 망가진다
- `tone: "danger"` 로 확인 버튼을 붉게 한다. 되돌릴 수 없는 동작을 알리는 자리다
- 문구는 `TxDialog.configure({ labels })` 로 앱 전체를 한 번에 바꾼다
- **import 만으로 DOM 을 건드리지 않는다.** 안 쓰는 소비자에게 빈 요소를 남기지 않고,
  서버에서 import 해도 안전하다
