# 012 · `@txstack/fns`

**화면마다 다시 쓰게 되는 작은 함수 모음.** React 를 모르고 런타임 의존이 없다.
`browser/` 아래를 빼면 Node 에서도 그대로 돈다.

세 프로젝트의 `core/extensions.ts`(네 벌 복사본) · `util.ts` · `Extension.js` 에서 범용인 것만 꺼냈다.
무엇을 넣고 뺐는지, 왜 그렇게 정했는지는 [001_proposal](001_proposal.md) 이 갖는다.

## 진입점 — 경로가 곧 네임스페이스

루트는 없다. **그룹마다 진입점 하나**이고, 받을 때 경로 이름을 네임스페이스로 쓴다.

```ts
import * as num from "@txstack/fns/num";
import * as phone from "@txstack/fns/phone-kr";

num.format(1234567); // "1,234,567"
phone.mask("01012345678"); // "010****5678"
```

`import * as` 는 ES 모듈 네임스페이스라 번들러가 안 쓴 함수를 지운다. 패키지가
`export const num = { … }` 같은 객체를 만들지 않는 이유다 — 그건 트리셰이킹이 안 된다.

| 진입점           | 내용                                                                                                                | 도는 곳  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| `num`            | `isNumeric` · `toNumber` · `format` · `percent` · `compact` · `bytes`                                               | 어디서나 |
| `date`           | `dayRange` · `lastDays` · `localTimeZone` · `parseYmd` · `isoWeek` · `parseTimestamps` · `splitSeconds` · `elapsed` | 어디서나 |
| `rand`           | `float` · `int` · `date` · `pick` · `ip` · `shortId`                                                                | 어디서나 |
| `str`            | `hashColor` · `paletteColor` · `PALETTE` · `emailLocalPart` · `hasSpecialChars` · `hasNonAscii`                     | 어디서나 |
| `obj`            | `diff` · `undefinedToNull`                                                                                          | 어디서나 |
| `arr`            | `sortByOrder`                                                                                                       | 어디서나 |
| `form`           | `check` · `checkEmpty` · `checkPattern`                                                                             | 어디서나 |
| `async`          | `sleep` · `withLoading`                                                                                             | 어디서나 |
| `math`           | `lerp` · `lerpVector` · `toRadians` · `toDegrees` · `rotate`                                                        | 어디서나 |
| `phone-kr`       | `normalize` · `parseMobile` · `mask` · `maskIfPhone` · `validateMany` · `dedupe` · `exclude`                        | 어디서나 |
| `browser/cookie` | `get` · `set` · `remove`                                                                                            | 브라우저 |
| `browser/css`    | `inject` · `remove`                                                                                                 | 브라우저 |
| `browser/file`   | `readText` · `download`                                                                                             | 브라우저 |

각 함수의 시그니처와 예제는 사이트의 **API › fns**(`apps/site/src/pages/api/ApiFns.tsx`)가 갖는다 —
같은 표가 사이트 검색에도 오른다. 이 문서는 정한 것과 옮기는 법만 둔다.

## 정한 것

- **lodash 에 있는 것은 만들지 않는다.** `pick` · `isEqual` · `clamp` · `inRange` · `sortBy` 를 두 벌 두면
  어느 쪽을 써야 할지 헷갈린다. lodash 로 **같은 결과**를 낼 수 없는 것만 넣는다 — bias 가 있는 `rand.int`,
  fallback 이 있는 `num.toNumber`. `obj.diff` 의 깊은 비교도 만들지 않고 **비교 함수를 받는다**(기본 `Object.is`).
  패키지는 lodash 에 의존하지 않는다 — chain-wallet-service 엔 lodash 가 없다.
- **포맷은 빈 값을 0 으로 그린다.** `null` · `undefined` · `NaN` · 숫자 아닌 문자열 → `"0"` · `"0.0%"` · `"0 B"`. `fallback` 으로 바꾼다.
- **로케일 기본은 실행 환경의 것.** 한국어 고정이 필요하면 앱에서 한 번 감싼다.
- **정책을 정하지 않는다.** `withLoading` 은 `alert` 를 띄우지 않고(`onError` 가 없으면 다시 던진다),
  `phone.mask` 는 `NODE_ENV` 를 보지 않는다. axios 패키지와 같은 원칙이다.
- **한국 전화번호는 넣는다.** "블랙/문자/지갑" 같은 업무 도메인이 아니라 로케일 지식이라 경계 안으로 봤다.
  이름에 `kr` 을 박아 범위를 분명히 했다. `parseUserData` 처럼 한 프로젝트의 데이터 형식인 것은 뺐다.
- **테스트 환경을 폴더로 가른다.** `src/browser/` 만 jsdom, 나머지는 node 다(`vitest.config.ts`). browser 밖의
  그룹이 DOM 을 건드리면 테스트가 깨진다. 배포 파일은 `verify:packages` 의 `node-fns` 가 Node 에서 실제로 돌린다.

## 이식하며 고친 것

| 옛 함수                             | 무엇이 틀렸나                                               | 지금                                           |
| ----------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `numberWithDelimiter("1234.5678")`  | `"1,234.5,678"` — 소수부에도 콤마                           | `num.format` → `"1,234.568"`                   |
| `isNumber("12abc")`                 | `true` — `parseInt` 기반                                    | `num.isNumeric` → `false`                      |
| `isNumeric(" ")`                    | `true` — `Number(" ")` 는 0                                 | `false`                                        |
| `formatBytes(2 ** 50)`              | `"1 undefined"`                                             | `num.bytes` → `"1 PB"`                         |
| `stringToHex("kim")`                | 16진 자리를 10진으로 읽어 `"#NaN…"` 같은 색                 | `str.hashColor` — 숫자로만 된 자리는 같은 결과 |
| `getCookie("code")` (`"00123"`)     | 숫자 123 으로 돌아옴                                        | JSON 으로 저장해 문자열 그대로                 |
| `createCSS(".a")`                   | `startsWith` 비교라 `.ab` 규칙을 지움                       | `css.inject` — 선택자를 그대로 비교            |
| `sortByOrder`                       | 원본 배열을 바꿈. `sortArray` 는 결과에 `index` 필드를 섞음 | 새 배열, 필드를 건드리지 않음                  |
| `networkWrapper`                    | `alert("처리 할수 없습니다.")` 를 직접 띄우고 오류를 삼킴   | `withLoading({ onError })`                     |
| `elapsedTimeToLabel` 기본 번역 함수 | 키를 그대로 붙여 `"6.5second"`                              | 기본 단위 `s · m · h · d · mo · y`             |
| `splitSeconds`                      | `"일"` 하드코딩                                             | `dayLabel` 옵션 (기본 `"d "`)                  |
| `compactFormatter`                  | `ko-KR` 고정                                                | `locale` 옵션                                  |
| `timeZone`                          | 모듈을 불러올 때 계산하는 상수                              | `localTimeZone()` 함수                         |
| `parseTimestamps`                   | JSDoc 은 날짜 문자열이라 하고 실제로는 밀리초를 읽음        | 문서를 실제 동작에 맞춤                        |
| `maskPhone("0212345678")`           | 서울 번호를 `021***5678` 로 가림                            | `02****5678`                                   |

## 소비자에서 옮기는 법 — 옛 이름 → 새 이름

옮기는 일은 사용자가 한다([006_adoption](../006_adoption.md)). 아래는 찾아 바꿀 때의 대응표다.

| 옛 (`core/extensions` · `util`)                                                | 새                                                                                             | 주의                                                                                                               |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `waitForSeconds(ms)`                                                           | `sleep(ms)` — `async`                                                                          |                                                                                                                    |
| `rand` · `randInt` · `randDate` · `randPick`                                   | `rand.float` · `int` · `date` · `pick`                                                         | 빈 배열의 `pick` 은 `undefined`                                                                                    |
| `randIP` · `shortUID`                                                          | `rand.ip` · `rand.shortId`                                                                     |                                                                                                                    |
| `numberToStartEndDate(-14, 0)`                                                 | `lastDays(14)` → `.getTime()`                                                                  | **`dayRange(-14, 0)` 이 아니다** — 옛 함수는 시작에 +1 을 했다. `q.periodNum` 이 음수면 `lastDays(-q.periodNum)`   |
| `numberToPeriod(-14, 0)`                                                       | `lastDays(14)`                                                                                 | 같은 주의                                                                                                          |
| `timeZone`                                                                     | `localTimeZone()`                                                                              | 상수 → 함수 호출                                                                                                   |
| `yyyymmddToTime(s)`                                                            | `parseYmd(s)?.getTime()`                                                                       | 잘못된 값이면 `null`                                                                                               |
| `getISOWeekKey(s)`                                                             | `isoWeek(s)`                                                                                   | 잘못된 값이면 `null`                                                                                               |
| `elapsedTimeToLabel(sec, 2, $t)`                                               | `elapsed(sec, { decimals: 2, t: $t })`                                                         | 번역 키(`second` · `minute` …)는 그대로                                                                            |
| `splitSeconds(sec)`                                                            | `splitSeconds(sec, { dayLabel: "일 " })`                                                       | 기본 `dayLabel` 이 `"d "` 다                                                                                       |
| `num2str` · `num2String` · `toFormattedNumber` · `numberWithDelimiter`         | `num.format`                                                                                   | `toFormattedNumber` 는 빈 값에 `""` 였다 → `{ fallback: "" }`                                                      |
| `num2Money(n)`                                                                 | `num.format(n, { style: "currency", currency: "KRW" })`                                        | 옛 것은 `"₩ 1,234"`(공백), Intl 은 `"₩1,234"`                                                                      |
| `num2Percent` · `compactFormatter` · `formatBytes`                             | `num.percent` · `num.compact` · `num.bytes`                                                    | `compact` 를 한국어로 고정하려면 `{ locale: "ko-KR" }`                                                             |
| `isNumber` · `isNumeric` · `safeNumber`                                        | `num.isNumeric` · `num.toNumber`                                                               |                                                                                                                    |
| `isInRange(v, min, max)`                                                       | lodash `_.inRange` 또는 비교식                                                                 | `_.inRange` 는 **끝값 미포함**이고 경계를 생략할 수 없다                                                           |
| `diffObject(a, b)`                                                             | `obj.diff(a, b, _.isEqual)`                                                                    | 비교 함수를 안 주면 배열 · 객체 필드는 늘 다르다고 본다                                                            |
| `mapping` · `keyCopy` · `numSort`                                              | `_.pick` · `Object.assign` · `_.sortBy`                                                        |                                                                                                                    |
| `intergrity` · `sortByOrder` · `sortArray`                                     | `obj.undefinedToNull` · `arr.sortByOrder`                                                      | `sortArray(t, s)` → `arr.sortByOrder(t, s, "name")`                                                                |
| `stringToHex` · `numberToHex`                                                  | `str.hashColor` · `str.paletteColor`                                                           |                                                                                                                    |
| `emailToId` · `containsNonAscii` · `hasSpecialChars`                           | `str.emailLocalPart` · `str.hasNonAscii` · `str.hasSpecialChars`                               |                                                                                                                    |
| `checkEmptyFields(f, ex)` · `checkRegexFields` · `checkForm(f, r, ex)`         | `form.checkEmpty(f, { optional: ex })` · `checkPattern` · `form.check(f, r, { optional: ex })` | 규칙의 `reg` → `pattern`. chain-wallet 의 구버전은 `{ message }` 를 돌려줬다                                       |
| `networkWrapper(fn, setLoading)`                                               | `withLoading(fn, { onLoading: setLoading, onError })`                                          | 알림을 띄우던 자리는 `onError` 에서 직접                                                                           |
| `setCookie` · `getCookie`                                                      | `cookie.set` · `cookie.get` — `browser/cookie`                                                 | 옛 쿠키도 읽힌다(JSON 이 아니면 글자 그대로)                                                                       |
| `createCSS` · `createCSSWithPseudo`                                            | `css.inject` — `browser/css`                                                                   | `"##000"` → `"#000"` 치환은 없앴다                                                                                 |
| `readTextFileAsync` · `downloadMessageFile(name, lines)`                       | `file.readText` · `file.download(name + ".txt", lines)`                                        | 확장자는 부르는 쪽이 붙인다. 빈 내용이면 `alert` 대신 `false` 를 돌려준다                                          |
| `normalizePhoneNumber` · `validPhoneNumber`                                    | `phone.normalize` · `phone.parseMobile`                                                        | 실패 값이 `false` → `null`                                                                                         |
| `maskPhone` · `maskKeyword`                                                    | `phone.mask` · `phone.maskIfPhone`                                                             | 개발 중 안 가리는 분기는 앱에서                                                                                    |
| `validatePhoneNumbersAsync` · `dedupePhoneNumbersAsync` · `excludePhonesAsync` | `phone.validateMany` · `dedupe` · `exclude`                                                    | `exclude` 의 결과 필드 `duplicates` → `excluded`. usertics `@core/util` 의 `dedupe` 는 배열만 돌려줬다             |
| `lerp` · `lerpVector2` · `toRadians` · `toRotation`                            | `math.lerp` · `lerpVector` · `toRadians` · `rotate`                                            | `toRotation({x1,y1,cx,cy,degree})` → `rotate({x,y}, {x,y}, degree)`. `toSin` · `toCos` 는 `Math.sin(toRadians(d))` |

**넣지 않은 것** — `oddPriceFormat` · `oddPredictMoney` · `getMoneyColor` · `toHashRrouterUrl` · `parseUserData` ·
`toUTCFromKST`(도메인), `classNames`(→ `clsx`), `href`(→ `@txstack/hooks/useUrlQuery`),
`toEscapeForSQL`(서버의 파라미터 바인딩으로), `randImageUri`. 이유는 [001_proposal](001_proposal.md) §3.

## 상태

**이식 완료 (2026-10-20).** 진입점 13개, 테스트 176개(node 158 · jsdom 18). 사이트 `API › fns` 가 첫 소비자다.
소비자 프로젝트 적용은 아직이다.
