# TxTheme

> **플로우 S1~S6 작업 항목.** [06_COMPONENT_FLOW](../../00_foundation/06_COMPONENT_FLOW.md)
> 상태: **미착수**

## 새 창에서 시작하는 법

```
docs/README.md 와 docs/001_ui/components/TxTheme.md 를 읽고 001-TxTheme-S1 부터 진행해줘.
```

단계를 하나 끝내면 이 문서의 진행 표와 [30_tasks.md](../30_tasks.md) 보드를 함께 갱신한다.

## 진행

| 단계 | 내용                            | job ID           | 상태 | 비고 |
| ---- | ------------------------------- | ---------------- | ---- | ---- |
| `S1` | 문서 = 명세 + 현행 코드 감사 🤝 | `001-TxTheme-S1` |      |      |
| `S2` | 구현 = 감사 결과 반영 🧑/🤖     | `001-TxTheme-S2` |      |      |
| `S3` | 테스트 🤖                       | `001-TxTheme-S3` |      |      |
| `S4` | 스토리북 🤖                     | `001-TxTheme-S4` |      |      |
| `S5` | 문서 사이트 🤖                  | `001-TxTheme-S5` |      |      |
| `S6` | Claude 가이드 🤖                | `001-TxTheme-S6` |      |      |

표기: 없음(미착수) · `🔄` · `✅` · `⏸` · `❌`

## 1. 현재 코드 인벤토리 (자동 수집 · 2026-08-25)

| 항목           | 값                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 위치           | `packages/ui/src/TxTheme/`                                                                                                                                   |
| 코드 행수      | 24행 (스토리 제외)                                                                                                                                           |
| 파일           | `TxThemeProvider.tsx` · `index.ts`                                                                                                                           |
| named export   | `TxClassBase` · `TxClassTheme` · `TxClassBorder` · `TxClassBorderColor` · `TxClassHover` · `TxClassFieldWrapperBase` · `TxClassFocus` · `TxContextMenuTheme` |
| default export | 없음                                                                                                                                                         |
| props 타입     | **공개 타입 없음**                                                                                                                                           |
| `.theme.ts`    | **없음**                                                                                                                                                     |
| `.types.ts`    | **없음**                                                                                                                                                     |
| 테스트         | **없음**                                                                                                                                                     |
| `data-tag`     | **없음**                                                                                                                                                     |
| 스토리         | **없음**                                                                                                                                                     |

### 착수 전에 알아야 할 것

- 공유 클래스 상수 묶음 (`TxClassBase`·`TxClassFocus` 등). 컴포넌트가 아니다
- **이름 충돌**: `TxContextMenuTheme` 을 여기서도 정의한다 (`TxContextMenu.theme.ts` 와 중복)
- 스토리 없음 — S4 대상이 아닐 수 있다. 대신 S5 에서 반드시 다룬다
- **커스터마이징 체계의 뿌리.** 파일럿 2차(TxButton) 결정이 여기에 반영된다

## 2. 목적 🤝

왜 있나. 없으면 소비자가 무엇을 직접 해야 하나.

## 3. 공개 API 🤝

props · 콜백 시그니처. [03_CONVENTIONS](../../00_foundation/03_CONVENTIONS.md) 의 이름 규칙을 따른다.

## 4. 커스터마이징 지점 🤝

어디까지 바꿀 수 있나. **파일럿 2차 `TxButton` 에서 확정한 방침을 따른다.**

## 5. 현행 코드 감사 (S1 핵심)

판정: **유지 / 수정 / 폐기** ← 결론을 여기 적는다

| ID  | 분류 | 내용 | 근거 (파일:행) |
| --- | ---- | ---- | -------------- |
|     |      |      |                |

분류는 `결함` · `접근성` · `규약이탈` · `설계질문` 로 나눈다.
양식 예시는 [TxSpinner.md](TxSpinner.md) 를 본다.

## 6. 사용 예제 🤝

흔한 케이스 1개 + 커스터마이징 케이스 1개. **복붙 가능해야 한다.**

## 7. 하지 않는 것 🤝

범위 밖.
