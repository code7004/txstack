# @txstack/fns

화면마다 다시 쓰게 되는 작은 함수 모음. **React 를 모르고 런타임 의존이 없다.**
`browser/` 아래를 빼면 Node 에서도 그대로 돈다.

```sh
pnpm add @txstack/fns
```

**그룹마다 진입점이 하나다.** 루트(`@txstack/fns`)는 없고, 경로 이름을 그대로 네임스페이스로 받는다.

```ts
import * as num from "@txstack/fns/num";
import * as phone from "@txstack/fns/phone-kr";
import { lastDays } from "@txstack/fns/date";

num.format(1234567); // "1,234,567"
num.compact(12000, { locale: "ko-KR" }); // "1.2만"
phone.mask("01012345678"); // "010****5678"
const [start, end] = lastDays(14); // 오늘을 포함한 14일
```

| 진입점                        | 내용                                                       |
| ----------------------------- | ---------------------------------------------------------- |
| `@txstack/fns/num`            | 숫자 판정 · 변환 · 포맷 (`format` · `percent` · `bytes` …) |
| `@txstack/fns/date`           | 기간 · ISO 주차 · 경과 시간                                |
| `@txstack/fns/rand`           | 랜덤 값 · 짧은 ID (목업용, 암호용 아님)                    |
| `@txstack/fns/str`            | 문자열 판정 · 문자열에서 만든 색                           |
| `@txstack/fns/obj`            | `diff` · `undefinedToNull`                                 |
| `@txstack/fns/arr`            | `sortByOrder`                                              |
| `@txstack/fns/form`           | 폼 값의 빈 칸 · 형식 검사                                  |
| `@txstack/fns/async`          | `sleep` · `withLoading`                                    |
| `@txstack/fns/math`           | 보간 · 각도 · 2D 회전                                      |
| `@txstack/fns/phone-kr`       | 한국 전화번호 정규화 · 마스킹 · 대량 처리                  |
| `@txstack/fns/browser/cookie` | 쿠키 (브라우저 전용)                                       |
| `@txstack/fns/browser/css`    | 실행 중 CSS 규칙 넣기 (브라우저 전용)                      |
| `@txstack/fns/browser/file`   | 파일 읽기 · 내려받기 (브라우저 전용)                       |

**lodash 에 있는 것(`pick` · `isEqual` · `clamp` · `inRange` · `sortBy` …)은 넣지 않았다.**
포맷 함수는 빈 값(`null` · `NaN` …)을 0 으로 그리고, `fallback` 으로 바꿀 수 있다. 로케일 기본은 실행 환경의 것이다.

ESM 전용이다.
