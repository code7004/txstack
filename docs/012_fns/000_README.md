# 012 · `@txstack/fns`

**화면마다 다시 쓰게 되는 작은 함수 모음.** React 를 모르고 런타임 의존이 없다.
`browser/` 그룹을 부르는 것만 빼면 Node 에서도 그대로 돈다.

세 프로젝트의 `core/extensions.ts`(네 벌 복사본) · `util.ts` · `Extension.js` 에서 범용인 것만 꺼냈다.
무엇을 넣고 뺐는지, 왜 그렇게 정했는지는 [001_proposal](001_proposal.md) 이 갖는다.

## 진입점 — 루트에서 이름으로

```ts
import { formatNumber, lastDays, readTextFile } from "@txstack/fns";

formatNumber(1234567); // "1,234,567"
const [start, end] = lastDays(14); // 오늘을 포함한 14일
const text = await readTextFile(file); // file 은 앱의 상태 변수 그대로
```

**함수 이름은 패키지 안에서 겹치지 않는다.** 그래서 루트(`@txstack/fns`) 하나에서 전부 가져오고,
원하면 `import * as fns from "@txstack/fns"` 로 묶어 쓴다. 그룹 진입점도 그대로 있다 — 범위를 좁혀 두고 싶을 때.

| 진입점           | 내용                                                                                                                 | 도는 곳  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- | -------- |
| (루트)           | 아래 전부                                                                                                            | 어디서나 |
| `num`            | `isNumeric` · `toNumber` · `formatNumber` · `formatPercent` · `formatCompact` · `formatBytes`                        | 어디서나 |
| `date`           | `dayRange` · `lastDays` · `localTimeZone` · `parseYmd` · `isoWeek` · `parseTimestamps` · `splitSeconds` · `elapsed`  | 어디서나 |
| `rand`           | `randomFloat` · `randomInt` · `randomDate` · `randomPick` · `randomIp` · `shortId`                                   | 어디서나 |
| `str`            | `hashColor` · `paletteColor` · `PALETTE` · `emailLocalPart` · `hasSpecialChars` · `hasNonAscii`                      | 어디서나 |
| `obj`            | `diffObject` · `undefinedToNull`                                                                                     | 어디서나 |
| `arr`            | `sortByOrder`                                                                                                        | 어디서나 |
| `form`           | `checkForm` · `checkEmpty` · `checkPattern`                                                                          | 어디서나 |
| `async`          | `sleep` · `withLoading`                                                                                              | 어디서나 |
| `math`           | `lerp` · `lerpVector` · `toRadians` · `toDegrees` · `rotate`                                                         | 어디서나 |
| `phone-kr`       | `normalizePhone` · `parseMobile` · `maskPhone` · `maskIfPhone` · `validatePhones` · `dedupePhones` · `excludePhones` | 어디서나 |
| `browser/cookie` | `getCookie` · `setCookie` · `removeCookie`                                                                           | 브라우저 |
| `browser/css`    | `injectCSS` · `removeCSS`                                                                                            | 브라우저 |
| `browser/file`   | `readTextFile` · `downloadFile`                                                                                      | 브라우저 |

**시그니처 · 함수마다 예제 · 옛 이름 대응표는 사이트의 API › fns 가 갖는다** — 이 문서에 다시 쓰지 않는다.

| 무엇              | 어디                                                                       | 지키는 테스트                                                                  |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 시그니처 표       | `apps/site/src/pages/api/data.ts` 의 `TABLES.fns`                          | `api.test.ts` — export 가 빠짐없이 실리는가                                    |
| 함수마다 예제     | `apps/site/src/pages/api/fnsExamples.ts`                                   | `fnsExamples.test.ts` — 함수마다 하나씩, `// →` 의 값을 **실제로 실행해 비교** |
| 옛 이름 → 새 이름 | `apps/site/src/pages/api/data.ts` 의 `FNS_FORMER` (사이트 검색에도 오른다) | `api.test.ts` — 새 이름이 표에 있는가                                          |

## 이름 — 왜 고유한 이름인가 (2026-10-20)

처음에는 **그룹 진입점 + 짧은 이름**(`import * as num from "@txstack/fns/num"` → `num.format`)으로 갔다.
소비자에 붙여 보니 불편했다 — 네임스페이스 이름이 앱의 흔한 변수와 부딪힌다. 실제로 black-message 의
`UserCompareModal` 에서 상태 변수 `file` 이 `import * as file` 을 가렸다. `date` · `form` · `phone` · `css` 도 마찬가지다.
그리고 `get` · `set` · `remove` · `inject` · `format` 은 이름으로 가져오면 뜻이 안 보여 늘 네임스페이스가 필요했다.

**함수 이름을 패키지 안에서 고유하게 바꾸고 루트 진입점을 두었다**(lodash · date-fns · es-toolkit 방식).
이름으로 가져와도 뜻이 보이고, `import * as fns` 로 묶는 것도 공짜로 따라온다. 바뀐 이름 상당수는
**옛 이름으로 돌아갔다**(`getCookie` · `setCookie` · `formatBytes` · `maskPhone`) — 소비자가 고칠 곳이 줄었다.

**루트는 그룹의 합이다.** 두 그룹이 같은 이름을 내보내면 `export *` 가 그 이름을 조용히 빼 버리므로
`src/index.test.ts` 가 "루트의 export = 그룹 export 의 합, 겹침 없음" 을 지킨다.

## 정한 것

- **lodash 에 있는 것은 만들지 않는다.** `pick` · `isEqual` · `clamp` · `inRange` · `sortBy` 를 두 벌 두면
  어느 쪽을 써야 할지 헷갈린다. lodash 로 **같은 결과**를 낼 수 없는 것만 넣는다 — bias 가 있는 `randomInt`,
  fallback 이 있는 `toNumber`. `diffObject` 의 깊은 비교도 만들지 않고 **비교 함수를 받는다**(기본 `Object.is`).
  패키지는 lodash 에 의존하지 않는다 — chain-wallet-service 엔 lodash 가 없다.
- **포맷은 빈 값을 0 으로 그린다.** `null` · `undefined` · `NaN` · 숫자 아닌 문자열 → `"0"` · `"0.0%"` · `"0 B"`. `fallback` 으로 바꾼다.
- **로케일 기본은 실행 환경의 것.** 한국어 고정이 필요하면 앱에서 한 번 감싼다.
- **정책을 정하지 않는다.** `withLoading` 은 `alert` 를 띄우지 않고(`onError` 가 없으면 다시 던진다),
  `maskPhone` 은 `NODE_ENV` 를 보지 않는다. axios 패키지와 같은 원칙이다.
- **한국 전화번호는 넣는다.** "블랙/문자/지갑" 같은 업무 도메인이 아니라 로케일 지식이라 경계 안으로 봤다.
  진입점 이름에 `kr` 을 박아 범위를 분명히 했다. `parseUserData` 처럼 한 프로젝트의 데이터 형식인 것은 뺐다.
- **루트에 browser 함수가 섞여도 된다.** 불러오는 것만으로는 `document` 를 건드리지 않는다 —
  `index.test.ts`(node) 와 `verify:packages` 의 `node-fns` 가 확인한다.
- **테스트 환경을 폴더로 가른다.** `src/browser/` 만 jsdom, 나머지는 node 다(`vitest.config.ts`).

## 이식하며 고친 것

| 옛 함수                             | 무엇이 틀렸나                                               | 지금                                           |
| ----------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `numberWithDelimiter("1234.5678")`  | `"1,234.5,678"` — 소수부에도 콤마                           | `formatNumber` → `"1,234.568"`                 |
| `isNumber("12abc")`                 | `true` — `parseInt` 기반                                    | `isNumeric` → `false`                          |
| `isNumeric(" ")`                    | `true` — `Number(" ")` 는 0                                 | `false`                                        |
| `formatBytes(2 ** 50)`              | `"1 undefined"`                                             | `"1 PB"`                                       |
| `stringToHex("kim")`                | 16진 자리를 10진으로 읽어 `"#NaN…"` 같은 색                 | `hashColor` — 숫자로만 된 자리는 같은 결과     |
| `getCookie("code")` (`"00123"`)     | 숫자 123 으로 돌아옴                                        | JSON 으로 저장해 문자열 그대로                 |
| `createCSS(".a")`                   | `startsWith` 비교라 `.ab` 규칙을 지움                       | `injectCSS` — 선택자를 그대로 비교             |
| `sortByOrder`                       | 원본 배열을 바꿈. `sortArray` 는 결과에 `index` 필드를 섞음 | 새 배열, 필드를 건드리지 않음                  |
| `networkWrapper`                    | `alert("처리 할수 없습니다.")` 를 직접 띄우고 오류를 삼킴   | `withLoading({ onError })`                     |
| `elapsedTimeToLabel` 기본 번역 함수 | 키를 그대로 붙여 `"6.5second"`                              | `elapsed` — 기본 단위 `s · m · h · d · mo · y` |
| `splitSeconds`                      | `"일"` 하드코딩                                             | `dayLabel` 옵션 (기본 `"d "`)                  |
| `compactFormatter`                  | `ko-KR` 고정                                                | `formatCompact` 의 `locale` 옵션               |
| `timeZone`                          | 모듈을 불러올 때 계산하는 상수                              | `localTimeZone()` 함수                         |
| `parseTimestamps`                   | JSDoc 은 날짜 문자열이라 하고 실제로는 밀리초를 읽음        | 문서를 실제 동작에 맞춤                        |
| `maskPhone("0212345678")`           | 서울 번호를 `021***5678` 로 가림                            | `02****5678`                                   |

## 소비자에서 옮길 때 — 놓치기 쉬운 것

전체 대응표는 사이트 **API › fns › Former names**(검색창에 옛 이름을 쳐도 된다). 그중 동작이 달라 손이 더 가는 것:

- **`numberToStartEndDate(-14, 0)` → `lastDays(14)`.** `dayRange(-14, 0)` 이 **아니다** — 옛 함수는 시작에 하루를 더했다.
  `q.periodNum` 처럼 음수를 넘기던 곳은 `lastDays(-q.periodNum)`. 결과가 `[Date, Date]` 이므로 `.getTime()` 은 부르는 쪽에서
- `timeZone`(상수) → `localTimeZone()`(호출)
- `toFormattedNumber` 는 빈 값에 `""` 였다 → `formatNumber(v, { fallback: "" })`
- `num2Money` 는 `"₩ 1,234"`(공백), `formatNumber(n, { style: "currency", currency: "KRW" })` 는 `"₩1,234"`
- `diffObject(a, b)` 는 이제 비교 함수를 안 주면 배열 · 객체 필드를 늘 다르다고 본다 → `diffObject(a, b, _.isEqual)`
- `isInRange` → lodash `_.inRange` 는 **끝값을 포함하지 않고** 경계를 생략할 수 없다
- `checkForm(f, r, ex)` → `checkForm(f, r, { optional: ex })`, 규칙의 `reg` → `pattern`. chain-wallet 의 구버전은 `{ message }` 를 돌려줬다
- `validPhoneNumber` 의 실패 값 `false` → `parseMobile` 은 `null`
- `excludePhonesAsync` 의 결과 필드 `duplicates` → `excludePhones` 는 `excluded`. usertics `@core/util` 의 `dedupe` 는 배열만 돌려줬다
- `downloadMessageFile(name, lines)` → `downloadFile(name + ".txt", lines)`. 빈 내용이면 `alert` 대신 `false`
- `maskPhone` 이 개발 중에 가리지 않던 분기는 앱으로 — `import.meta.env.DEV ? phone : maskPhone(phone)`

**넣지 않은 것** — `oddPriceFormat` · `oddPredictMoney` · `getMoneyColor` · `toHashRrouterUrl` · `parseUserData` ·
`toUTCFromKST`(도메인), `classNames`(→ `clsx`), `href`(→ `@txstack/hooks/useUrlQuery`),
`toEscapeForSQL`(서버의 파라미터 바인딩으로), `randImageUri`. 이유는 [001_proposal](001_proposal.md) §3.

## 상태

**이식 완료 (2026-10-20).** 루트 + 그룹 진입점 13개. 사이트 `API › fns` 가 첫 소비자이고,
black-message 의 `UserCompareModal` 이 `readTextFile` 로 첫 화면 적용을 시작했다.
