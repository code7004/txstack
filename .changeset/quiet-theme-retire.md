---
"@txstack/ui": minor
---

**공유 Tailwind 클래스 상수(`TxClass*`)를 공개 API 에서 뺀다** (`001-TxTheme-S1`~`S3`).

`TxClassBase` · `TxClassBorder` · `TxClassBorderColor` · `TxClassHover` · `TxClassFocus` ·
`TxClassTheme` · `TxClassFieldWrapperBase` 는 이제 `@txstack/ui` 에서 import 할 수 없다.

이 값들은 **Tailwind 클래스 문자열**이었다. 그래서 소비자가 이걸 받아서 할 수 있는 일은
**Tailwind 를 쓰는 것뿐**이었는데, 이 패키지는 "CSS · Sass · Tailwind · CSS Modules 중 무엇을 쓰든
커스터마이징된다" 를 파는 라이브러리다. **광고와 정반대인 export 였다.**

대체 경로는 이미 있다 — 값은 `--tx-*` CSS 변수로 바꾼다.

```css
:root {
  --tx-color-primary: #7c3aed;
  --tx-radius: 9999px;
}
```

아직 자체 CSS 로 옮기지 않은 컴포넌트가 내부에서 이 상수를 쓰고 있어 **파일 자체는 남아 있다.**
다만 내부 전용이고, 마지막 컴포넌트가 옮겨가면 사라진다.

## `TxContextMenuTheme` 이 이제 올바른 객체다

**같은 이름의 객체가 두 곳에 있었고, 공개된 쪽과 컴포넌트가 쓰는 쪽이 서로 달랐다.**

- 공개된 것: `TxTheme` 안의 사본 — `wrapper` · `item` · `divider` **3개 키**
- 컴포넌트가 쓰는 것: `TxContextMenu.theme.ts` — `disabledItem` 이 더 있는 **4개 키**

`TxContextMenu` 만 자기 테마를 배럴로 내보내지 않고 있었고, 그 빈자리를 엉뚱한 모듈이 같은 이름으로
메우고 있었다. 게다가 `theme` prop 의 타입(`DeepPartial<typeof TxContextMenuTheme>`)은 **4개 키 쪽**을
가리켰다 — **값과 타입이 갈려 있었다.** `disabledItem` 을 덮으려면 타입은 통과하는데 기본값은 없는 상태였다.

이제 `TxContextMenu` 가 자기 테마를 내보내고, 스테일한 사본은 사라졌다.

## 그 밖에

- **`TxClassTheme` 을 없앴다.** `TxClassBase` 와 값이 같은 별칭이었다 ("기존 호환 토큰" 주석이 붙어
  있었지만 이 패키지에는 그 "기존" 이 존재하지 않는다). 내부 소비자 4곳을 `TxClassBase` 로 통일했다.
- **`TxClassFieldWrapperBase` 를 없앴다.** 쓰는 곳이 0곳인 죽은 export 였다.

> `TxTheme` 은 컴포넌트가 아니라 상수 묶음이다. `TxThemeProvider` 는 이전 릴리스 노트대로
> 이미 존재하지 않는다 — 이번 변경과 무관하다.

명세: `docs/001_ui/components/04_TxTheme.md`
