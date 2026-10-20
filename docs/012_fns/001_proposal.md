# 012 · `@txstack/fns` 제안 — 세 프로젝트의 extensions/util 분석

> **결정 기록이다.** 이 문서로 범위 · 이름 · 원칙을 합의했고, 그 뒤 구현했다(2026-10-20).
> **최종 공개 API 는 [000_README](000_README.md) 가 갖는다** — 구현하며 바뀐 이름(`exclude` 의
> `excluded`, `math.toSin`/`toCos` 제거 등)은 여기 고치지 않았다.
>
> **이름은 뒤에 다시 바꿨다(2026-10-20).** 아래 §5 의 "그룹 진입점 + 짧은 이름(`num.format`)" 은 소비자에 붙여 보니
> 앱의 변수 이름(`file` · `date` · `form`)과 부딪혀, **고유한 함수 이름 + 루트 진입점**(`formatNumber` · `readTextFile`)으로 갔다.
> 이유는 [000_README](000_README.md) 의 "이름" 절.

---

## 1. 현황 — 같은 파일이 네 벌

| 파일                                                      | 줄   | 관계                                                          |
| --------------------------------------------------------- | ---- | ------------------------------------------------------------- |
| `usertics/apps/frontend/src/core/extensions.ts`           | 1103 | **가장 최신본.** 아래 분석의 기준                             |
| `chain-wallet-service/apps/portal/src/core/extensions.ts` | 1072 | 따옴표·포맷 차이 + `checkForm` 계열이 구버전                  |
| `black-message/apps/frontend/src/core/extensions.ts`      | 1069 | chain-wallet 과 포맷만 다름                                   |
| `usertics/apps/frontend/src/@core/Extension.ts`           | 1063 | 구버전 사본 (`@core` → `core` 이관 중 남은 것)                |
| `black-message/apps/frontend/src/core/Extension.js`       | 503  | JS 원조 버전. `classNames` · `maskPhone` · `maskKeyword` 추가 |
| `black-message/apps/frontend/src/core/util.ts`            | 255  | 전화번호 · 파일 다운로드 (도메인)                             |
| `usertics/apps/frontend/src/@core/util.ts`                | 128  | 위의 축소판                                                   |
| `usertics/apps/parser/src/@core/utils/extentions.js`      | 29   | `rand` · `randInt` · `toUTCFromKST` (백엔드 JS)               |

export 목록은 네 `extensions.ts` 가 **완전히 같다** (usertics 최신본만 `num2*` 4개 추가).
즉 이미 "복사해 쓰는 패키지" 상태이고, 버전이 갈라지기 시작했다 — 분리할 이유로 충분하다.

---

## 2. 분류 — 들어갈 것

괄호 안 숫자는 **사용 파일 수 (BM / CW / UT)**. 단어 단위 grep 이라 `rand` · `href` ·
`timeZone` 처럼 흔한 이름은 과대 집계됐을 수 있다.

### `num` — 숫자 판정·변환·포맷

| 현재                                                                   | 제안                    | 비고                                                                                                 |
| ---------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `isNumeric` (0/0/1) · `isNumber` (0/0/2)                               | `isNumeric`             | `isNumber` 는 `parseInt` 기반이라 `"12abc"` 도 true. **하나로 합친다**                               |
| `safeNumber` (0/0/0)                                                   | `toNumber(v, fallback)` | `_.toNumber` 는 fallback 이 없고 `null` → 0 이라 동작이 다르다. 유지                                 |
| `isInRange` (0/0/2)                                                    | **제외 → `_.inRange`**  | lodash 원칙. 단 `_.inRange` 는 **끝값 미포함**이고 경계를 생략할 수 없다 — usertics 2곳 이관 시 주의 |
| `numberWithDelimiter` · `toFormattedNumber` · `num2str` · `num2String` | `format(n, opts?)`      | **4개가 같은 일.** `Intl.NumberFormat` 하나로                                                        |
| `num2Percent` (0/0/1)                                                  | `percent(n, digits=1)`  |                                                                                                      |
| `compactFormatter` (0/0/8)                                             | `compact(n, opts?)`     | `ko-KR` 고정 → `locale` 옵션으로                                                                     |
| `formatBytes` (1/0/3)                                                  | `bytes(n, decimals=2)`  |                                                                                                      |

### `rand` — 랜덤 · ID (목업 데이터에 주로 쓰임)

| 현재                                         | 제안                              | 비고                              |
| -------------------------------------------- | --------------------------------- | --------------------------------- |
| `rand` · `randInt` · `randDate` · `randPick` | `float` · `int` · `date` · `pick` | bias/weight 옵션 유지             |
| `randIP` (0/0/1)                             | `ip`                              |                                   |
| `shortUID` (2/1/2)                           | `shortId`                         | JSDoc 의 `pow` 인자는 실제로 없다 |

### `date` — 날짜 · 기간 (**dayjs 의존 제거**)

| 현재                                                       | 제안                                    | 비고                                                          |
| ---------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| `numberToPeriod` (1/1/3) · `numberToStartEndDate` (0/1/23) | `dayRange(start, end)` → `[Date, Date]` | **같은 계산 두 벌.** 하나로 만들고 `.getTime()` 은 호출부에서 |
| `timeZone` (0/0/25)                                        | `localTimeZone()`                       | 모듈 로드 시 평가하는 상수 → 함수로 (SSR·테스트 안전)         |
| `yyyymmddToTime` · `getISOWeekKey`                         | `parseYmd` · `isoWeek`                  |                                                               |
| `parseTimestamps` (0/0/0)                                  | `parseTimestamps`                       | JSDoc 예시(날짜 문자열)와 실제 동작(숫자 파싱)이 다르다       |
| `splitSeconds` (1/0/2)                                     | `splitSeconds`                          | `"일"` 하드코딩 → 라벨 주입                                   |
| `elapsedTimeToLabel` (1/1/1)                               | `elapsed(sec, { t })`                   | i18n 함수 주입 방식은 그대로 좋다                             |

### `obj` · `arr`

| 현재                                | 제안                                | 비고                                                                                                                                                                             |
| ----------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `diffObject` (0/0/4)                | `obj.diff(prev, next, isEqual?)`    | `diff` 자체는 lodash 에 없어서 넣는다. **깊은 비교는 lodash 에 있으므로 만들지 않는다** — 비교 함수를 주입받고 기본은 `Object.is`. lodash 를 쓰는 소비자는 `_.isEqual` 을 넘긴다 |
| `mapping` (0/0/0)                   | **제외 → `_.pick`**                 | 없는 키를 `null` 로 채우는 차이뿐                                                                                                                                                |
| `intergrity` (0/0/0)                | `obj.undefinedToNull`               | 오타 + 타입이 `Record<string, object>` 라 숫자 값도 못 받는다                                                                                                                    |
| `keyCopy` (0/0/0)                   | **제외**                            | `Object.assign(target, source)` 와 같다                                                                                                                                          |
| `numSort` (0/0/0)                   | **제외 → `_.sortBy` / `_.orderBy`** |                                                                                                                                                                                  |
| `sortByOrder` · `sortArray` (0/0/0) | `arr.sortByOrder` 하나로            | "지정한 순서대로" 정렬은 lodash 에 없다. `sortArray` 는 결과에 `index` 필드를 섞어 넣고, `sortByOrder` 는 원본을 변형한다 → 복사본 반환으로 통일                                 |

### `str` — 문자열 (**결정: 넣는다**)

| 현재                       | 제안                    | 비고                                              |
| -------------------------- | ----------------------- | ------------------------------------------------- |
| `stringToHex` (0/0/0)      | `hashColor(s)`          | 문자열 → 고정 색. 빈 값이면 `#407adf`             |
| `numberToHex` (0/0/0)      | `paletteColor(n)`       | 15색 팔레트 순환                                  |
| `emailToId` (0/0/0)        | `emailLocalPart(email)` | `@` 가 없으면 지금은 `""` 를 준다 → 원문 반환으로 |
| `hasSpecialChars` (0/0/0)  | `hasSpecialChars`       |                                                   |
| `containsNonAscii` (0/0/2) | `hasNonAscii`           |                                                   |

### `phone-kr` — 한국 전화번호 (**결정: 넣는다**)

한국 번호 형식은 "블랙/문자/지갑" 같은 **업무** 도메인이 아니라 **로케일** 지식이라 패키지 경계 안으로 본다.
이름에 `kr` 을 박아 범위를 분명히 한다. `parseUserData` 는 black-message 의 데이터 형식이라 여전히 뺀다.

| 현재 (BM util.ts · Extension.js)             | 제안                                  | 비고                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normalizePhoneNumber` (4/0/0)               | `normalize`                           | `+82`, `82-010`, 앞자리 생략 처리                                                                                                                        |
| `validPhoneNumber` (1/0/0)                   | `parseMobile` → `string \| null`      | `false` 대신 `null`                                                                                                                                      |
| `maskPhone` (2/0/0)                          | `mask`                                | `NODE_ENV === 'development'` 이면 마스킹 안 하는 분기는 **정책이라 제거** — 소비자가 정한다                                                              |
| `maskKeyword` (1/0/0)                        | `maskIfPhone`                         |                                                                                                                                                          |
| `validate/dedupe/excludePhone*Async` (3/0/0) | `validateMany` · `dedupe` · `exclude` | 1만 건씩 끊어 이벤트 루프를 양보하는 구조는 유지. usertics `@core/util.ts` 의 `dedupe` 는 반환 형태가 다르다 → BM 쪽(`{ uniques, duplicates }`)으로 통일 |

### `form` — 폼 검증 (usertics 최신 제네릭 버전 기준)

`checkEmptyFields` · `checkRegexFields` · `checkForm` (0/1/5). chain-wallet 은 구버전
시그니처라 이관 시 반환 타입이 `Record<'message', string>` → `Partial<Record<keyof T, string>> | null`
로 바뀐다. **소비자 쪽 수정이 필요한 유일한 그룹.**

### `math` — 보간 · 회전 (현재 미사용)

`lerp` · `lerpVector2` · `toRadians` · `toSin` · `toCos` · `toRotation`. 범용성은 확실하지만
세 프로젝트 어디서도 안 쓰지만 **1차에 포함한다** (3절 결정).

### `async`

| 현재                     | 제안                                      | 비고                                                                                                                 |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `waitForSeconds` (2/1/5) | `sleep(ms)`                               | 이름은 seconds 인데 ms 를 받는다                                                                                     |
| `networkWrapper` (0/1/4) | `withLoading(fn, { onLoading, onError })` | 지금은 `alert('처리 할수 없습니다.')` 를 직접 띄운다 — **정책을 패키지가 정하면 안 된다** (axios 패키지와 같은 원칙) |

### `browser` — DOM 필요 (서브패스 분리 필수)

| 현재                                        | 제안                        | 비고                                                                                        |
| ------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| `setCookie` · `getCookie` (0/0/2)           | `cookie.set` · `cookie.get` | `smartParse` 가 `"00123"` 을 숫자 123 으로 바꾼다 — JSON 저장으로 단순화 권장               |
| `createCSS` · `createCSSWithPseudo` (1/1/1) | `injectCSS` 하나로          | `React.CSSProperties` 타입 의존 제거. `startsWith(selector)` 라 `.a` 가 `.ab` 규칙을 지운다 |
| `readTextFileAsync` (3/0/0)                 | `readText(file)`            |                                                                                             |
| `downloadMessageFile` (BM util.ts, 3)       | `downloadText(name, lines)` | `alert` 제거, `.txt` 고정 해제                                                              |

---

## 3. 넣지 않을 것

**도메인 지식** — CLAUDE.md 의 "블랙/문자/지갑/유저타입" 금지에 걸린다. 각 프로젝트에 남긴다.

| 함수                                  | 이유                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| `oddPriceFormat` · `oddPredictMoney`  | 배당률 계산 (베팅 도메인). 0회 사용 → 지워도 됨                                    |
| `getMoneyColor` · `MoneyColorVariant` | 입출금 도메인 + Tailwind 클래스 하드코딩                                           |
| `num2Money`                           | `₩` 하드코딩. `num.format(n, { style: 'currency', currency: 'KRW' })` 로 대체 가능 |
| `toHashRrouterUrl`                    | `/Landing` 하드코딩                                                                |
| `parseUserData`                       | black-message 데이터 포맷                                                          |
| `toUTCFromKST`                        | 운영사 DB 의 KST 저장 버그 보정용 (parser 전용, JS)                                |
| `randImageUri`                        | picsum.photos 외부 서비스 고정. 0회 사용                                           |

**대체재가 이미 있는 것**

| 함수                                | 대체                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `classNames` (3/2/4)                | `clsx` — `@txstack/ui` 가 이미 의존한다                                                          |
| `href` (3/2/9)                      | `@txstack/hooks/useUrlQuery`. `?i=i&` 마커 방식은 이식하지 않는다                                |
| `toEscapeForSQL`                    | **클라이언트에서 SQL 이스케이프는 잘못된 계층이다.** 서버의 파라미터 바인딩으로. 0회 사용 → 삭제 |
| `mapping` · `numSort` · `isInRange` | lodash (`_.pick` · `_.sortBy` · `_.inRange`) — 아래 원칙                                         |

**lodash 원칙 (결정): lodash 에 있는 것은 만들지 않는다.** 같은 이름·비슷한 동작의 함수를 두 벌 두면
소비자가 어느 쪽을 써야 할지 헷갈린다. 판정은 "lodash 함수로 **같은 결과**를 낼 수 있는가" 다.
bias 가중치가 있는 `rand.int`(vs `_.random`)나 fallback 이 있는 `toNumber` 처럼
lodash 로 대신할 수 없는 기능이 있으면 넣는다.
패키지는 lodash 를 **의존하지 않는다** — chain-wallet-service 엔 lodash 가 없다.

**미사용 (세 프로젝트 모두 0회)** — `math` 전체, `sortArray`, `sortByOrder`,
`safeNumber`, `parseTimestamps`, `intergrity`, `createCSSWithPseudo` 등.

**결정: 1차에 포함한다.** "네 번째 프로젝트" 기준으로 범용이면 넣는다. 다만 쓰는 곳이 없어
소비자 화면이 검증해 주지 않으므로, **이 함수들은 vitest 가 유일한 검증이다** — 2절 표의
동작을 테스트로 고정하고, 원본 JSDoc 예시(`toRotation` 90° 회전 등)도 테스트 케이스로 옮긴다.
`keyCopy` 처럼 표준 API 와 같은 것은 여전히 넣지 않는다.

---

## 4. 이관 중 고칠 버그 (현재 세 프로젝트에 모두 있음)

1. **`numberWithDelimiter("1234.5678")` → `"1,234.5,678"`** — 소수부에도 콤마가 들어간다.
2. **`isNumber("12abc")` → `true`** — `parseInt` 기반.
3. **`createCSS`** 가 `.a` 규칙을 넣을 때 `.ab` 규칙을 먼저 지울 수 있다 (`startsWith` 비교).
4. **`formatBytes`** — 1 PB 이상이면 단위가 `undefined`.
5. **`getCookie`** — 문자열 `"00123"`·`"true"` 를 저장하면 숫자/불리언으로 돌아온다.
6. **`getMoneyColor`** — `dart:text-red-500` 오타 두 곳 (패키지엔 안 들어가지만 프로젝트에서 고칠 것).
7. **`sortByOrder`** 는 입력 배열을 변형하고, `numSort` 는 복사본을 정렬한다 — 일관성 없음.

---

## 5. 패키지 구조 제안

`@txstack/axios` 처럼 **React 를 모르는 패키지**. Node(parser 등)에서도 돌아야 한다.
`@txstack/hooks` 처럼 **배럴 없이 그룹마다 서브패스 하나.** 서브패스 이름 = 권장 네임스페이스 이름이다.

```
packages/fns/src/
  num.ts   rand.ts   date.ts   obj.ts   arr.ts   str.ts
  form.ts  async.ts  math.ts   phone-kr.ts
  browser/cookie.ts  browser/css.ts  browser/file.ts
```

```jsonc
// package.json
"exports": {
  "./num":  { "types": "./dist/num.d.ts",  "import": "./dist/num.js" },
  "./rand": { ... },
  "./phone-kr": { ... },
  "./browser/cookie": { ... },
  ...
},
"dependencies": {}   // dayjs 제거, lodash 는 쓰지 않는다 (3절 원칙)
```

### 네임스페이스는 import 쪽에서 얻는다

그룹 파일은 평범한 named export 만 갖는다. **네임스페이스 객체를 패키지가 만들지 않는다** —
`export const num = { format, percent }` 형태는 트리셰이킹이 안 된다.

```ts
// ① 네임스페이스로 — 서브패스 이름이 곧 접두어
import * as num from "@txstack/fns/num";
import * as rand from "@txstack/fns/rand";
import * as phone from "@txstack/fns/phone-kr";

num.format(1234567); // "1,234,567"
rand.int(0, 10);
phone.mask("01012345678"); // "010****5678"

// ② 필요한 것만
import { sleep, withLoading } from "@txstack/fns/async";

const save = withLoading(api.save, {
  onLoading: setLoading,
  onError: (e) => toast.error(e.message) // 정책은 소비자가
});
```

`import * as` 는 ES 모듈 네임스페이스라 Vite/Rollup/esbuild 모두 **안 쓴 함수를 제거한다.**
그래서 그룹 안 함수 이름은 접두어 없이 짧게 짓는다 (`numberWithDelimiter` → `num.format`).

---

## 6. 결정 사항

| #   | 항목        | 결정                                                                          |
| --- | ----------- | ----------------------------------------------------------------------------- |
| 1   | 패키지 이름 | **`@txstack/fns`** — React 없는 순수 함수 모음이라는 성격을 이름에 드러낸다   |
| 2   | 1차 범위    | **미사용 범용 함수(`math` 등)까지 포함.** vitest 로 검증한다                  |
| 3   | `str` 그룹  | **넣는다**                                                                    |
| 4   | lodash      | **lodash 에 있는 것은 만들지 않는다.** `diff` 의 깊은 비교는 주입받는다 (3절) |
| 5   | 전화번호    | **`phone-kr` 서브패스로 넣는다**                                              |
| 6   | 이름        | **짧게.** 서브패스·네임스페이스·함수 이름 모두                                |
| 7   | 첫 그룹     | **`num`**                                                                     |

---

## 7. `num` 공개 API — 합의됨

> 예시의 출력은 **실행 환경 로케일이 `ko-KR` 일 때** 기준이다.

```ts
import * as num from "@txstack/fns/num";

// ── 판정 · 변환 ─────────────────────────────────────────
num.isNumeric(123); // true
num.isNumeric("1,234"); // false  — 콤마는 숫자가 아니다
num.isNumeric("12abc"); // false  — 옛 isNumber 는 true 였다
num.isNumeric(" "); // false  — Number(' ') 는 0 이라 옛 isNumeric 은 true 였다
num.isNumeric([]); // false

num.toNumber("123"); // 123
num.toNumber("abc"); // undefined
num.toNumber("abc", 0); // 0       — fallback 을 주면 반환 타입이 number
num.toNumber(null, 0); // 0       — _.toNumber(null) 은 0 이지만 fallback 이 이긴다

// ── 포맷 ────────────────────────────────────────────────
num.format(1234567); // "1,234,567"
num.format(1234.5678); // "1,234.568"  — 옛 함수는 "1,234.5,678"
num.format("1234.5"); // "1,234.5"    — 숫자 문자열도 받는다
num.format(1234.5678, { maximumFractionDigits: 2 }); // "1,234.57"
num.format(12345, { style: "currency", currency: "KRW" }); // "₩12,345"  (num2Money 대체)
num.format(null); // "0"   — 빈 값은 0 으로 포맷
num.format(null, { fallback: "-" }); // "-"

num.percent(0.1234); // "12.3%"   — 입력은 비율(0~1)
num.percent(0.1234, 2); // "12.34%"

num.compact(12000); // "1.2만"   — 환경 로케일
num.compact(12000, { locale: "en-US" }); // "12K"

num.bytes(0); // "0 B"
num.bytes(5_300_000); // "5.05 MB"
num.bytes(2 ** 50); // "1 PB"    — 옛 함수는 "1 undefined"
```

시그니처:

```ts
type Numberish = number | string | null | undefined;
type FormatOptions = Intl.NumberFormatOptions & { locale?: string; fallback?: string };

export function isNumeric(value: unknown): boolean;
export function toNumber(value: unknown): number | undefined;
export function toNumber(value: unknown, fallback: number): number;
export function format(value: Numberish, options?: FormatOptions): string;
export function percent(ratio: Numberish, digits?: number, options?: FormatOptions): string;
export function compact(value: Numberish, options?: FormatOptions): string;
export function bytes(value: Numberish, decimals?: number): string;
```

### 결정 사항

1. **`locale` 기본값 = 실행 환경 로케일** (`Intl` 에 `undefined` 를 넘긴다). 한국어 고정이 필요한
   소비자는 자기 프로젝트에서 한 번 감싼다 — `const krw = (n) => num.format(n, { locale: 'ko-KR' })`.
2. **빈 값은 0 으로 포맷한다.** `null` · `undefined` · `NaN` · 숫자가 아닌 문자열 모두 해당.
   `format` → `"0"`, `percent` → `"0.0%"`, `compact` → `"0"`, `bytes` → `"0 B"`.
   `fallback` 을 주면 0 대신 그 문자열을 그대로 돌려준다. (`toFormattedNumber` 의 `""` 를 쓰던 곳은 `fallback: ''`)
3. **`percent` 는 비율을 받는다** (0.123 → `"12.3%"`). 자릿수는 **고정**이다 — 0.5 → `"50.0%"` (옛 `toFixed(1)` 과 같다).
4. **`bytes` 는 1024 기준, 표기는 `B · KB · MB · GB · TB · PB`.** 음수도 빈 값처럼 `"0 B"`
   (옛 함수는 `"Invalid size"`). `bytes` 는 로케일을 쓰지 않는다 — 소수점이 늘 `.` 이다.

---

## 8. `num` 테스트 케이스 — S3 체크리스트

**로케일 함정:** CI 나 Node 의 기본 로케일은 보통 `en-US` 다. 숫자 모양을 확인하는 테스트는
**`locale` 을 명시**하고, "기본값이 환경 로케일인가" 는 `Intl.NumberFormat().format(x)` 과
**같은지**로 검사한다 (문자열을 하드코딩하지 않는다).

### `isNumeric`

- [ ] `123` · `-1.5` · `0` → true
- [ ] `'123'` · `'-1.5'` · `'1e3'` → true
- [ ] `'12abc'` · `'1,234'` · `'abc'` → false
- [ ] `''` · `' '` · `'\t'` → false
- [ ] `NaN` · `Infinity` · `-Infinity` → false
- [ ] `null` · `undefined` · `[]` · `[1]` · `{}` · `true` → false

### `toNumber`

- [ ] `'123'` → 123, `'-1.5'` → -1.5, `5` → 5
- [ ] `'abc'` · `NaN` · `undefined` → `undefined` (fallback 없음)
- [ ] `'abc', 0` → 0, `null, -1` → -1, `undefined, 7` → 7
- [ ] `'0', 9` → 0 — 0 이 fallback 에 먹히지 않는다
- [ ] 타입: fallback 을 주면 `number`, 안 주면 `number | undefined` (`expectTypeOf`)

### `format`

- [ ] `1234567, { locale: 'ko-KR' }` → `"1,234,567"`
- [ ] `1234.5678, { locale: 'ko-KR' }` → `"1,234.568"` — **소수부에 콤마 없음** (회귀 방지)
- [ ] `-1234.5` → `"-1,234.5"`
- [ ] `'1234.5'` (문자열) → `"1,234.5"`
- [ ] `maximumFractionDigits: 2` 가 그대로 `Intl` 에 전달된다
- [ ] `style: 'currency', currency: 'KRW', locale: 'ko-KR'` → `"₩12,345"`
- [ ] `null` · `undefined` · `NaN` · `'abc'` · `'1,234'` → `"0"`
- [ ] `null, { fallback: '-' }` → `"-"`, `null, { fallback: '' }` → `""`
- [ ] `0, { fallback: '-' }` → `"0"` — 0 은 빈 값이 아니다
- [ ] `locale` 생략 시 `new Intl.NumberFormat().format(1234.5)` 와 같다
- [ ] `fallback` · `locale` 이 `Intl.NumberFormat` 옵션으로 새지 않는다

### `percent`

- [ ] `0.1234` → `"12.3%"`, `0.1234, 2` → `"12.34%"`
- [ ] `0.5` → `"50.0%"` — 자릿수 고정
- [ ] `-0.031` → `"-3.1%"`, `1.5` → `"150.0%"`
- [ ] `null` · `'abc'` → `"0.0%"`, `null, 1, { fallback: '-' }` → `"-"`

### `compact`

- [ ] `12000, { locale: 'ko-KR' }` → `"1.2만"`, `1_000_000` → `"100만"`, `150_000_000` → `"1.5억"`
- [ ] `12000, { locale: 'en-US' }` → `"12K"`
- [ ] `0` · `null` → `"0"`
- [ ] 소수 한 자리까지 (`maximumFractionDigits: 1`), 옵션으로 덮어쓸 수 있다
- [ ] `locale` 생략 시 환경 로케일과 같다

### `bytes`

- [ ] `0` · `null` · `NaN` · `-1` → `"0 B"`
- [ ] `512` → `"512 B"`, `1024` → `"1 KB"`, `1536` → `"1.5 KB"`
- [ ] `5_300_000` → `"5.05 MB"`, `5_300_000, 0` → `"5 MB"`
- [ ] `2 ** 40` → `"1 TB"`, `2 ** 50` → `"1 PB"` — 단위가 `undefined` 가 되지 않는다 (회귀 방지)
- [ ] `2 ** 60` → `"1024 PB"` — PB 에서 멈춘다
- [ ] 소수 끝의 0 은 지운다: `1024 * 1.5` 에 decimals 2 → `"1.5 KB"` (`"1.50 KB"` 아님)
