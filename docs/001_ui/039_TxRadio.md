# 039 · TxRadio

> 여럿 중 하나를 고르는 자리.

|             |                                                             |
| ----------- | ----------------------------------------------------------- |
| 진입점      | `@txstack/ui`                                               |
| 내보내는 것 | `TxRadio, TxRadioGroup`                                     |
| 소스        | [`packages/ui/src/TxRadio/`](../../packages/ui/src/TxRadio) |
| 테스트      | 24개                                                        |

## 개발 목적

여럿 중 하나를 고른다. **방향키 이동을 브라우저가 하도록** 진짜 `<input type="radio">` 를 쓴다 — 직접 짜면 roving tabindex 를 또 구현해야 한다.

## 기능

```tsx
<TxRadioGroup legend="결제 수단" defaultValue="card" onChange={setPay}>
  <TxRadio value="card" label="카드" />
  <TxRadio value="bank" label="계좌이체" />
</TxRadioGroup>
```

**`TxRadioGroup` 안에 두면 `name` 이 저절로 이어진다.** 그러면 브라우저가 하나만
골라지게 하고, **방향키로 옮겨 다니는 것과 Tab 이 묶음을 한 번만 밟는 것**까지 맡는다 —
손으로 roving tabindex 를 짤 일이 없다.

진짜 `<input type="radio">` 라 `<form>` 안에서 그냥 제출된다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxRadio/`
- [x] **테스트** — 24개
- [x] **스토리** — `TxRadio.stories.tsx`
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

### 방향키 이동을 브라우저가 한다 (`TxRadio`)

후보군에는 "Group 에 방향키 이동(roving tabindex) 포함" 이라 적혀 있었는데, **같은 `name`
을 가진 네이티브 라디오끼리는 브라우저가 이미 그 일을 한다** — ↑↓←→ 로 골라 다니고
Tab 은 묶음을 한 번만 밟는다. 그래서 `TxRadioGroup` 이 하는 일은 **`name` 을 이어 주는
것**뿐이고, 테스트가 `tabIndex` 와 화살표 키 처리가 소스에 없는지를 지킨다.

`<div role="radiogroup">` 이 아니라 **`<fieldset>` + `<legend>`** 다. 그래야 스크린리더가
"결제 수단, 카드, 라디오 버튼, 3개 중 1" 처럼 **묶음 이름과 몇 번째인지를 함께** 읽고,
묶음 잠그기도 `disabled` 하나로 끝난다.
