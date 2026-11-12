# @txstack/fns

관리자 화면을 만들다 보면 프로젝트마다 똑같은 함수를 또 쓰게 됩니다. 숫자에 콤마 찍기, "최근 7일" 기간 만들기,
전화번호 가리기, 폼 빈칸 검사 같은 것들이요. `@txstack/fns` 는 그런 함수를 한곳에 모아 둔 패키지입니다.

React 를 쓰지 않고 런타임 의존성도 없습니다. 브라우저 전용 함수 몇 개를 빼면 Node 에서도 그대로 동작합니다.

```sh
npm install @txstack/fns
```

## 한눈에 보기

```ts
import { formatNumber, formatCompact, lastDays, maskPhone, checkForm, elapsed } from "@txstack/fns";

formatNumber(1234567); // "1,234,567"
formatNumber(null, { fallback: "-" }); // "-"  — 값이 비어 있을 때 보여 줄 글자
formatCompact(12000, { locale: "ko-KR" }); // "1.2만"

const [start, end] = lastDays(7); // 오늘을 포함한 최근 7일 (첫날 0시 ~ 오늘 23:59:59)

maskPhone("01012345678"); // "010****5678"

elapsed(90); // "1m 30s"

checkForm({ name: "", phone: "010-12" }, { phone: { pattern: /^010-\d{4}-\d{4}$/, message: "전화번호 형식이 아닙니다" } });
// { name: "name is empty" }  — 빈칸을 먼저 보고, 다 채워졌으면 형식을 봅니다
```

함수는 모두 루트(`@txstack/fns`)에서 이름으로 가져옵니다. 패키지 안에서 이름이 겹치지 않게 지어 두었기 때문에,
`date` · `file` · `form` 처럼 앱에서 흔히 쓰는 변수 이름과 부딪히지 않습니다.

## 들어 있는 것

| 묶음       | 이럴 때 씁니다                                         | 함수                                                                                                                 |
| ---------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `num`      | 숫자 · 비율 · 용량을 화면에 보여 줄 때                 | `formatNumber` · `formatPercent` · `formatCompact` · `formatBytes` · `toNumber` · `isNumeric`                        |
| `date`     | 조회 기간을 만들거나, 경과 시간을 글로 바꿀 때         | `lastDays` · `dayRange` · `elapsed` · `splitSeconds` · `parseYmd` · `isoWeek` · `parseTimestamps` · `localTimeZone`  |
| `form`     | 제출 전에 빈칸과 형식을 검사할 때                      | `checkForm` · `checkEmpty` · `checkPattern`                                                                          |
| `phone-kr` | 한국 휴대폰 번호를 정리 · 검증 · 마스킹할 때           | `normalizePhone` · `parseMobile` · `maskPhone` · `maskIfPhone` · `validatePhones` · `dedupePhones` · `excludePhones` |
| `async`    | 저장 버튼의 로딩 상태를 다룰 때                        | `withLoading` · `sleep`                                                                                              |
| `obj`      | 바뀐 필드만 서버에 보낼 때                             | `diffObject` · `undefinedToNull`                                                                                     |
| `arr`      | 정해 둔 순서대로 정렬할 때                             | `sortByOrder`                                                                                                        |
| `str`      | 이름마다 다른 색을 줄 때                               | `hashColor` · `paletteColor` · `PALETTE` · `emailLocalPart` · `hasSpecialChars` · `hasNonAscii`                      |
| `rand`     | 목업 데이터를 만들 때 (암호용으로 쓰면 안 됩니다)      | `randomInt` · `randomFloat` · `randomDate` · `randomPick` · `randomIp` · `shortId`                                   |
| `math`     | 보간 · 회전 같은 간단한 계산                           | `lerp` · `lerpVector` · `rotate` · `toRadians` · `toDegrees`                                                         |
| `browser`  | 쿠키 · 스타일 주입 · 파일 읽기와 내려받기 (브라우저만) | `getCookie` · `setCookie` · `removeCookie` · `injectCSS` · `removeCSS` · `readTextFile` · `downloadFile`             |

가져오는 범위를 좁히고 싶다면 묶음 단위 진입점도 있습니다. 루트와 같은 함수입니다.

```ts
import { maskPhone } from "@txstack/fns/phone-kr";
import { readTextFile } from "@txstack/fns/browser/file";
```

## 조금 더 자세히

**포맷 함수는 빈 값에도 기본 표시값을 돌려줍니다.** `null` · `undefined` · `NaN` 은 0 으로 보고 포맷합니다
(`"0"` · `"0.0%"` · `"0 B"`). 대신 `"-"` 를 보여 주고 싶다면 `formatNumber` · `formatPercent` · `formatCompact` 에 `fallback` 을 넘기면 됩니다. 로케일을 정하지 않으면 실행 환경의 것을 따릅니다.

**폼 검사는 첫 번째 문제 하나만 알려 줍니다.** `checkForm` 은 문제가 없으면 `null`, 있으면 `{ 필드: 메시지 }` 를 돌려줍니다.
앞뒤 공백만 있는 문자열과 빈 배열은 빈 값으로 봅니다. `0` 과 `false` 는 값이 있는 것으로 봅니다.

**로딩 표시와 오류 처리를 한 번에 감쌉니다.** `withLoading` 은 시작할 때 `onLoading(true)`, 끝나면 성공이든 실패든 `onLoading(false)` 를 부릅니다.
오류를 어떻게 알릴지는 정하지 않습니다. `onError` 를 주면 거기서 오류 처리를 끝내고, 주지 않으면 오류를 그대로 다시 던집니다.

```ts
const save = withLoading(api.save, { onLoading: setSaving, onError: (e) => toast.error(String(e)) });
await save(form);
```

**lodash 에 이미 있는 것은 만들지 않았습니다.** `pick` · `isEqual` · `clamp` · `sortBy` 같은 함수가 필요하면 lodash 를 함께 쓰세요.
`diffObject` 처럼 비교 함수를 받는 곳에는 `_.isEqual` 을 그대로 넘길 수 있습니다.

## 지원 환경

- ESM 전용입니다. `require()` 로는 불러올 수 없습니다.
- `browser` 묶음(쿠키 · CSS · 파일)은 `document` 같은 브라우저 API 를 씁니다. 그 밖의 함수는 Node 에서도 돌아갑니다.
- TypeScript 타입 선언이 함께 들어 있습니다.

## 같은 시리즈

[`@txstack/ui`](https://www.npmjs.com/package/@txstack/ui) · [`@txstack/hooks`](https://www.npmjs.com/package/@txstack/hooks) ·
[`@txstack/route-meta`](https://www.npmjs.com/package/@txstack/route-meta) · [`@txstack/axios`](https://www.npmjs.com/package/@txstack/axios)

문서와 예제: <https://code7004.github.io/txstack/>

## 라이선스

MIT
