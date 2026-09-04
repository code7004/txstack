# 001 · TxButton

> 누르면 뭔가 일어나는 자리.

|             |                                                               |
| ----------- | ------------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                                 |
| 내보내는 것 | `TxButton`                                                    |
| 소스        | [`packages/ui/src/TxButton/`](../../packages/ui/src/TxButton) |
| 테스트      | 41개                                                          |

## 개발 목적

앱마다 다시 만들던 버튼 하나를 표준으로 삼는다. **이 저장소의 이행 기준이자 레퍼런스**다 — 클래스 이름 · `data-*` 스타일 훅 · 토큰 규칙이 여기서 정해져 나머지가 전부 따른다. 비동기 작업 중 연타를 막는 일도 여기서 한 번만 푼다.

## 기능

- `onClick` 이 **Promise 를 반환하면** 해제될 때까지 스피너가 뜨고 버튼이 잠긴다. 연타해도 한 번만 실행된다
- 동기 `onClick` 은 로딩 상태로 들어가지 않는다 — 스피너가 깜빡이지 않는다
- **`type` 기본값은 `"button"`** 이다. 폼 제출 버튼은 `type="submit"` 을 명시한다

### 쓰는 법

```tsx
<TxButton label="확인" />
<TxButton label="삭제" variant="danger" onClick={async () => { await remove(); }} />
<TxButton type="submit" label="제출" />
```

색·반경은 CSS 변수로 바꾼다 — 앱 전체는 `:root { --tx-color-primary: … }`,
이 컴포넌트만은 `.tx-button { --tx-button-bg: … }`.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxButton/`
- [x] **테스트** — 41개
- [x] **스토리** — `TxButton.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`
