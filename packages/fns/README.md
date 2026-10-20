# @txstack/fns

화면마다 다시 쓰게 되는 작은 함수 모음. **React 를 모르고 런타임 의존이 없다.**
`browser` 그룹을 부르는 것만 빼면 Node 에서도 그대로 돈다.

```sh
pnpm add @txstack/fns
```

**루트에서 이름으로 가져온다.** 함수 이름이 패키지 안에서 겹치지 않아 앱의 변수 이름(`file` · `date` · `form`)과 부딪히지 않는다.

```ts
import { formatNumber, formatCompact, lastDays, maskPhone, readTextFile } from "@txstack/fns";

formatNumber(1234567); // "1,234,567"
formatCompact(12000, { locale: "ko-KR" }); // "1.2만"
maskPhone("01012345678"); // "010****5678"
const [start, end] = lastDays(14); // 오늘을 포함한 14일
const text = await readTextFile(file);

// 한 이름으로 묶어도 된다
import * as fns from "@txstack/fns";
```

| 그룹 진입점                   | 함수                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `@txstack/fns/num`            | `isNumeric` · `toNumber` · `formatNumber` · `formatPercent` · `formatCompact` · `formatBytes`                        |
| `@txstack/fns/date`           | `dayRange` · `lastDays` · `localTimeZone` · `parseYmd` · `isoWeek` · `parseTimestamps` · `splitSeconds` · `elapsed`  |
| `@txstack/fns/rand`           | `randomFloat` · `randomInt` · `randomDate` · `randomPick` · `randomIp` · `shortId` (목업용, 암호용 아님)             |
| `@txstack/fns/str`            | `hashColor` · `paletteColor` · `PALETTE` · `emailLocalPart` · `hasSpecialChars` · `hasNonAscii`                      |
| `@txstack/fns/obj`            | `diffObject` · `undefinedToNull`                                                                                     |
| `@txstack/fns/arr`            | `sortByOrder`                                                                                                        |
| `@txstack/fns/form`           | `checkForm` · `checkEmpty` · `checkPattern`                                                                          |
| `@txstack/fns/async`          | `sleep` · `withLoading`                                                                                              |
| `@txstack/fns/math`           | `lerp` · `lerpVector` · `toRadians` · `toDegrees` · `rotate`                                                         |
| `@txstack/fns/phone-kr`       | `normalizePhone` · `parseMobile` · `maskPhone` · `maskIfPhone` · `validatePhones` · `dedupePhones` · `excludePhones` |
| `@txstack/fns/browser/cookie` | `getCookie` · `setCookie` · `removeCookie` (브라우저 전용)                                                           |
| `@txstack/fns/browser/css`    | `injectCSS` · `removeCSS` (브라우저 전용)                                                                            |
| `@txstack/fns/browser/file`   | `readTextFile` · `downloadFile` (브라우저 전용)                                                                      |

그룹 진입점은 가져오는 범위를 좁혀 두고 싶을 때 쓴다. 루트와 같은 함수다.

**lodash 에 있는 것(`pick` · `isEqual` · `clamp` · `inRange` · `sortBy` …)은 넣지 않았다.**
포맷 함수는 빈 값(`null` · `NaN` …)을 0 으로 그리고, `fallback` 으로 바꿀 수 있다. 로케일 기본은 실행 환경의 것이다.

ESM 전용이다.
