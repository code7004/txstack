# 001 진행 보드 — @txstack/ui

> **컴포넌트 하나가 작업 항목이다.** 규칙은 [06_COMPONENT_FLOW](../00_foundation/06_COMPONENT_FLOW.md).
> 상태 표기: 없음(미착수) · `🔄`(진행중·확인중) · `✅`(완료·통과) · `↩`(2차 개선으로 되돌림) · `⏸`(보류) · `❌`(폐기)

전체 **26 항목** × 6단계.

> **숫자는 여기서 관리하지 않는다.** 인벤토리 열은 **미착수 항목의 규모 파악용**이고
> 2026-08-25 자동 수집값 그대로 둔다. **작업이 끝난 항목은 `✓` 로 바꾼다** —
> 테스트 개수·줄 수·스토리 개수는 **컴포넌트 문서 한 곳만 소유한다.**
> 같은 숫자를 보드·README·컴포넌트 문서에 흩어 두다가 두 번 어긋났다 (2026-08-26).

## 새 창을 여는 법

```
docs/README.md 와 docs/001_ui/components/09_TxInput.md 를 읽고 001-TxInput-S1 ~ S4 까지 진행해줘.
```

한 창에서 **한 항목의 `S1`~`S4`(1차)** 를 이어 돈다. 끝나면 🧑 확인 게이트에서 멈추고 창을 닫는다.
게이트를 통과하면 `S5`·`S6` 를 새 창에서 한다.

## 단계

| 단계 | 내용                                                                     | 양식 소유                            |
| ---- | ------------------------------------------------------------------------ | ------------------------------------ |
| `S1` | 문서 = 명세 + 현행 코드 감사 (유지/수정/폐기 판정)                       | `001`                                |
| `S2` | 구현 = 감사 결과 반영                                                    | `001`                                |
| `S3` | 테스트                                                                   | [902](../902_testing/README.md)      |
| `S4` | 스토리북 — **[문구 규칙](../901_storybook/20_design.md) 을 먼저 읽는다** | [901](../901_storybook/README.md)    |
| `S5` | 문서 사이트                                                              | [903](../903_docs_site/README.md)    |
| `S6` | 에이전트 가이드                                                          | [904](../904_claude_guide/README.md) |

## 진행 순서

**위에서 아래로 내려간다.** 그룹 안에서는 순서를 바꿔도 된다.

이 순서가 **컴포넌트 문서 파일 이름의 번호**다 — `components/01_TxSpinner.md` … `26_TxDayPicker.md`.
폴더를 열면 다음에 뭘 할 차례인지 바로 보인다 → [components/README.md](components/README.md)

### A. 파일럿

플로우 절차와 커스터마이징 방침을 여기서 확정한다. **나머지는 이게 끝나기 전에 시작하지 않는다.**

> **2026-08-25 — 둘 다 `↩` 로 되돌렸다.** [20_design](20_design.md) 에서 **스타일을 Tailwind 클래스
> 문자열에서 CSS 로 바꾸기로** 했기 때문이다. `S1`(명세·감사)은 그대로 유효하고, `S2`~`S4` 를 새 방침으로 다시 돈다.
>
> **파일럿이 제 일을 한 것이다** — 24종에 박히기 전에 방향이 틀렸다는 걸 찾았다.
> 되돌린 작업이 아깝지만 **26종에 퍼진 뒤였다면 훨씬 비쌌다.**
>
> 2차 S2 에서 같이 처리할 것: **미배포 changeset**이 `TxThemeProvider`·Tailwind 테마를 알리고 있다.
> **아직 배포된 버전이 없으니 지금은 고쳐 쓸 수 있다.** `tidy-spinner-surface` 는 처리됐고
> (`plain-styles-entry` 신설), ~~`brave-buttons-theme` 이 `TxButton` 2차 S2 에 남아 있다~~
> → **다시 썼다 (2026-08-26).**
>
> **`TxSpinner` 2차는 끝났다 (2026-08-25).** 🧑 확인 대기 — 상세는 [TxSpinner §16~§20](components/01_TxSpinner.md).
>
> **`TxButton` 2차도 끝났고 🧑 확인까지 통과했다 (2026-08-26).** 상세는 [TxButton §14~§20](components/02_TxButton.md).
> **파일럿 2종이 이걸로 다 닫혔다 — B 그룹부터 시작할 수 있다.**
> 여기서 **전역 토큰 11개(`001-tokens`)가 정해졌고**, **설계 결함이 둘 나와 고쳤다** —
> 라이브러리 CSS 가 캐스케이드 레이어 밖에 있어 `className` 이 무시되던 것(`001-css-layer`), 그리고
> `--tx-color-primary` 를 바꿔도 `hover` 가 안 따라오던 것(`001-statelayer`).
> **둘 다 테스트가 초록인 상태에서 나왔다** — 브라우저 실측과 테마 스파이크가 각각 하나씩 잡았다.
> 규약: [20_design §4·§5-1](20_design.md). **나머지 24종이 이 결정 위에서 돈다.**

| 컴포넌트    | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                                               | 문서                                    |
| ----------- | --- | --- | --- | --- | --- | --- | --- | ---------------------------------------------------------------------- | --------------------------------------- |
| `TxSpinner` | ✅  | ✅  | ✅  | ✅  | ✅  | ⏸   | ✅  | **CSS✓** · types(동거) · **test✓** · tag✓ · **스토리✓** · named export | [TxSpinner](components/01_TxSpinner.md) |
| `TxButton`  | ✅  | ✅  | ✅  | ✅  | ✅  | ⏸   | ✅  | **CSS✓** · types(동거) · **test✓** · tag✓ · **스토리✓**                | [TxButton](components/02_TxButton.md)   |

### B. 파일럿에 묶인 것

파일럿의 결정이 그대로 걸리는 항목. 바로 뒤에 붙인다.

| 컴포넌트    | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                               | 문서                                    |
| ----------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------------ | --------------------------------------- |
| `TxLoading` |     |     |     |     |     |     |     | 43행 · theme✗ · types✓ · test✗ · tag✓ · 스토리3        | [TxLoading](components/03_TxLoading.md) |
| `TxTheme`   |     |     |     |     |     |     |     | 24행 · theme✗ · types✗ · test✗ · tag✗ · **스토리없음** | [TxTheme](components/04_TxTheme.md)     |

### C. 존치 판정 먼저

**S1 에서 폐기될 수 있다.** 먼저 잘라내면 뒤가 가벼워진다.

| 컴포넌트            | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                                            | 문서                                                    |
| ------------------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| `TxCoolTable`       |     |     |     |     |     |     |     | 1031행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4                   | [TxCoolTable](components/05_TxCoolTable.md)             |
| `TxFlex`            |     |     |     |     |     |     |     | 7행 · theme✗ · types✗ · test✗ · tag✓ · 스토리3                      | [TxFlex](components/06_TxFlex.md)                       |
| `TxClipboardButton` |     |     |     |     |     |     |     | 6행 · theme✗ · types✗ · test✗ · tag✗ · 스토리2 · **default export** | [TxClipboardButton](components/07_TxClipboardButton.md) |
| `TxIcons`           |     |     |     |     |     |     |     | 80행 · theme✗ · types✗ · test✗ · tag✗ · **스토리없음**              | [TxIcons](components/08_TxIcons.md)                     |

### D. 폼 계열

`TxInput` 이 이 계열의 기준이 된다. 그 다음은 같은 규약의 반복이라 🤖 비중이 커진다.

| 컴포넌트          | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                                              | 문서                                                |
| ----------------- | --- | --- | --- | --- | --- | --- | --- | --------------------------------------------------------------------- | --------------------------------------------------- |
| `TxInput`         |     |     |     |     |     |     |     | 315행 · theme✓ · types✓ · test✗ · tag✓ · 스토리9 · **default export** | [TxInput](components/09_TxInput.md)                 |
| `TxTextarea`      |     |     |     |     |     |     |     | 105행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4                      | [TxTextarea](components/10_TxTextarea.md)           |
| `TxCheckBox`      |     |     |     |     |     |     |     | 85행 · theme✓ · types✓ · test✗ · tag✓ · 스토리5                       | [TxCheckBox](components/11_TxCheckBox.md)           |
| `TxDropdown`      |     |     |     |     |     |     |     | 689행 · theme✓ · types✓ · test✗ · tag✓ · 스토리7                      | [TxDropdown](components/12_TxDropdown.md)           |
| `TxCapsLockCheck` |     |     |     |     |     |     |     | 60행 · theme✗ · types✗ · test✗ · tag✗ · 스토리3                       | [TxCapsLockCheck](components/13_TxCapsLockCheck.md) |
| `TxForm`          |     |     |     |     |     |     |     | 251행 · theme✓ · types✓ · test✗ · tag✓ · 스토리5                      | [TxForm](components/14_TxForm.md)                   |

### E. 오버레이

열림/닫힘·포커스·바깥클릭 규약이 공통이다. 한 항목에서 정하면 나머지가 따라온다.

| 컴포넌트        | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                         | 문서                                            |
| --------------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------ | ----------------------------------------------- |
| `TxModal`       |     |     |     |     |     |     |     | 91행 · theme✓ · types✗ · test✗ · tag✓ · 스토리4  | [TxModal](components/15_TxModal.md)             |
| `TxSlidePanel`  |     |     |     |     |     |     |     | 158행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 | [TxSlidePanel](components/16_TxSlidePanel.md)   |
| `TxDropMenu`    |     |     |     |     |     |     |     | 217행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 | [TxDropMenu](components/17_TxDropMenu.md)       |
| `TxToolTip`     |     |     |     |     |     |     |     | 135행 · theme✗ · types✗ · test✗ · tag✓ · 스토리5 | [TxToolTip](components/18_TxToolTip.md)         |
| `TxContextMenu` |     |     |     |     |     |     |     | 168행 · theme✓ · types✓ · test✗ · tag✓ · 스토리3 | [TxContextMenu](components/19_TxContextMenu.md) |

### F. 레이아웃 · 내비

| 컴포넌트   | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                         | 문서                                  |
| ---------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------ | ------------------------------------- |
| `TxLayout` |     |     |     |     |     |     |     | 403행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 | [TxLayout](components/20_TxLayout.md) |
| `TxHeader` |     |     |     |     |     |     |     | 28행 · theme✓ · types✗ · test✗ · tag✓ · 스토리3  | [TxHeader](components/21_TxHeader.md) |
| `TxCard`   |     |     |     |     |     |     |     | 170행 · theme✓ · types✓ · test✗ · tag✓ · 스토리5 | [TxCard](components/22_TxCard.md)     |
| `TxTabs`   |     |     |     |     |     |     |     | 111행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 | [TxTabs](components/23_TxTabs.md)     |

### G. 데이터 · 무거운 의존

subpath 격리가 걸린 항목이 있다. 마지막에 둔다.

| 컴포넌트      | S1  | S2  | S3  | S4  | 🧑  | S5  | S6  | 인벤토리                                                                        | 문서                                        |
| ------------- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| `TxJsonTree`  |     |     |     |     |     |     |     | 249행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4                                | [TxJsonTree](components/24_TxJsonTree.md)   |
| `TxAgGrid`    |     |     |     |     |     |     |     | 679행 · theme✓ · types✓ · test✗ · tag✓ · 스토리4 · **default export** · subpath | [TxAgGrid](components/25_TxAgGrid.md)       |
| `TxDayPicker` |     |     |     |     |     |     |     | 399행 · theme✓ · types✓ · test✗ · tag✗ · 스토리8 · subpath                      | [TxDayPicker](components/26_TxDayPicker.md) |

## 공통 job (컴포넌트에 속하지 않는 것)

파일럿에서 나온 **전 패키지 결정**을 기계적으로 반영하는 job. 컴포넌트별 S2 에 끌고 다니지 않는다.

| job ID           | 내용                                                                                                                                                         | 상태 | 근거                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | -------------------------------------------------------------------------- |
| `001-styles-css` | ~~**자체 CSS 를 `dist/styles.css` 로 번들**~~ → **✅ 2026-08-25.** `scripts/build-css.mjs` · `@txstack/ui/styles.css` export · `npm pack` 확인               | ✅   | [TxSpinner §16](components/01_TxSpinner.md)                                |
| `001-tokens`     | ~~**전역 토큰(`--tx-*`) 정의**~~ → **✅ 2026-08-26.** `src/tokens.css` · 11개 · `.dark` 재정의. 늘리는 건 쓰는 컴포넌트가 생길 때                            | ✅   | [20_design §5](20_design.md)                                               |
| `001-css-layer`  | ~~**라이브러리 CSS 를 `@layer tx` 로**~~ → **✅ 2026-08-26.** `styles.css` · `build-css.mjs` · 두 앱 진입점. 소비자는 레이어 순서 한 줄                      | ✅   | [TxButton §17](components/02_TxButton.md)                                  |
| `001-statelayer` | ~~**상태 색을 파생으로**~~ → **✅ 2026-08-26.** `-hover` 짝 토큰 폐기, `color-mix` 로 배경에서 계산. **`color-mix()` 지원 하한이 정해졌다**                  | ✅   | [20_design §5-1](20_design.md) · [TxButton §19](components/02_TxButton.md) |
| `001-typenames`  | `ITx*` 나머지 → `Tx*Props` **일괄 리네임 1커밋.** 기계적 치환. 공개 타입이 바뀌므로 changeset 동반                                                           |      | [TxSpinner §5 Q1](components/01_TxSpinner.md#q1--i-접두-폐지)              |
| `001-r4-sass`    | ~~**`R4` 를 Sass 소비자로 검증**~~ → **✅ 2026-08-26.** tarball 을 빈 Vite+sass 앱에 설치해 통과. 어두운 배경 hover 결함 1건을 찾아 탈출구를 규약으로 올렸다 | ✅   | [10_requirements §3](10_requirements.md)                                   |

## 완료 조건

- 한 항목은 **6단계가 다 `✅` 이면 끝**이다. 다시 열지 않는다
- `❌` 폐기는 정당한 결과다. S1 에서 끝나고 제거는 S2 에서 한다 (**제거는 major**)
- 단계를 건너뛰면 **비고에 사유를 남긴다**
