# @txstack/ui

Tx\* React 컴포넌트. 목표는 두 가지 — **쉬운 사용법, 쉬운 커스터마이징.**

| 진입점                  | 내용               | 추가 peer 의존                      |
| ----------------------- | ------------------ | ----------------------------------- |
| `@txstack/ui`           | 대부분의 컴포넌트  | 없음                                |
| `@txstack/ui/aggrid`    | `TxAgGrid`         | `ag-grid-community` `ag-grid-react` |
| `@txstack/ui/daypicker` | `TxDayPicker` 계열 | `react-day-picker` `dayjs`          |

루트 배럴을 import 한 소비자는 무거운 선택적 의존을 **설치하지 않아도 동작한다.**

스타일은 CSS 커스텀 프로퍼티(`--tx-*`) 토큰으로 커스터마이징한다.
`styles.css` · `tokens.css` 진입점은 **첫 컴포넌트를 이식할 때 함께 추가된다.**

> **아직 배포되지 않았다.** 구현을 이식 중이다. 공개 API 초안은 [docs/001_ui.md](../../docs/001_ui.md).

```sh
pnpm add @txstack/ui react react-dom
```
