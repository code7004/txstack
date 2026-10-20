/**
 * **`@txstack/fns` 의 함수마다 예제 하나.** API › fns 가 표 아래에 그린다.
 *
 * 쓰는 법:
 * - 첫 줄의 `import` 부터 그대로 복사해 쓸 수 있게 쓴다. 가져오는 곳은 루트(`@txstack/fns`)다
 * - 빈 줄로 나뉜 덩어리 중 **`식; // → 값` 줄이 있는 덩어리는 `fnsExamples.test.ts` 가 실제로 실행해
 *   값이 맞는지 본다.** 문서의 결과가 코드와 어긋날 수 없다. 로케일에 따라 달라지는 값은 `locale` 을 적는다
 * - `// → ` 가 없는 덩어리는 화면 · 앱 안에서의 쓰임새다. 실행하지 않는다(`api` · `toast` 처럼 앱의 것을 쓴다)
 * - 브라우저 그룹(`browser/*`)은 실행하지 않는다
 *
 * 키는 진입점 이름(`num` · `phone-kr` · `browser/file` …) → 함수 이름. 순서는 API 표의 순서다.
 */
export const FNS_EXAMPLES: Record<string, Record<string, string>> = {
  num: {
    isNumeric: `import { isNumeric } from "@txstack/fns";

isNumeric("1.5"); // → true
isNumeric("1e3"); // → true
isNumeric("1,234"); // → false
isNumeric("12abc"); // → false
isNumeric(" "); // → false

// 입력값 검사
if (!isNumeric(amount)) return alert("숫자만 입력하세요");`,

    toNumber: `import { toNumber } from "@txstack/fns";

toNumber("123"); // → 123
toNumber("abc"); // → undefined
toNumber("abc", 0); // → 0
toNumber(null, 0); // → 0

// 주소 쿼리 · 입력값을 숫자로 — fallback 을 주면 타입이 number 로 좁혀진다
const page = toNumber(searchParams.get("page"), 1);`,

    formatNumber: `import { formatNumber } from "@txstack/fns";

formatNumber(1234567); // → "1,234,567"
formatNumber("1234.5"); // → "1,234.5"
formatNumber(1234.5678, { maximumFractionDigits: 2 }); // → "1,234.57"
formatNumber(12345, { locale: "ko-KR", style: "currency", currency: "KRW" }); // → "₩12,345"
formatNumber(null); // → "0"
formatNumber(null, { fallback: "-" }); // → "-"

// 표의 금액 칸
<td>{formatNumber(row.amount)}</td>;`,

    formatPercent: `import { formatPercent } from "@txstack/fns";

formatPercent(0.1234); // → "12.3%"
formatPercent(0.1234, 2); // → "12.34%"
formatPercent(0.5); // → "50.0%"
formatPercent(null); // → "0.0%"

// 전환율 = 전환 / 방문
<span>{formatPercent(stats.converted / stats.visited)}</span>;`,

    formatCompact: `import { formatCompact } from "@txstack/fns";

formatCompact(12000, { locale: "ko-KR" }); // → "1.2만"
formatCompact(150000000, { locale: "ko-KR" }); // → "1.5억"
formatCompact(12000, { locale: "en-US" }); // → "12K"

// 카드의 큰 숫자 — locale 을 빼면 브라우저의 언어를 따른다
<strong>{formatCompact(totalUsers)}</strong>;`,

    formatBytes: `import { formatBytes } from "@txstack/fns";

formatBytes(512); // → "512 B"
formatBytes(1536); // → "1.5 KB"
formatBytes(5300000); // → "5.05 MB"
formatBytes(5300000, 0); // → "5 MB"

// 업로드할 파일 크기
<small>{formatBytes(file.size)}</small>;`
  },

  date: {
    dayRange: `import { dayRange } from "@txstack/fns";

const now = new Date(2025, 5, 18, 15, 30);
dayRange(-1, -1, now).map((d) => d.toLocaleString("sv")); // → ["2025-06-17 00:00:00", "2025-06-17 23:59:59"]
dayRange(0, 6, now).map((d) => d.toLocaleDateString("sv")); // → ["2025-06-18", "2025-06-24"]

// 어제 하루 — now 를 빼면 지금 기준
const [start, end] = dayRange(-1, -1);`,

    lastDays: `import { lastDays } from "@txstack/fns";

const now = new Date(2025, 5, 18, 15, 30);
lastDays(14, now).map((d) => d.toLocaleString("sv")); // → ["2025-06-05 00:00:00", "2025-06-18 23:59:59"]
lastDays(1, now).map((d) => d.toLocaleDateString("sv")); // → ["2025-06-18", "2025-06-18"]

// 최근 2주 검색 — 옛 numberToStartEndDate(-14, 0)
const [start, end] = lastDays(14);
api.search({ startDate: start.getTime(), endDate: end.getTime() });`,

    localTimeZone: `import { localTimeZone } from "@txstack/fns";

localTimeZone() === Intl.DateTimeFormat().resolvedOptions().timeZone; // → true

// 서버가 날짜별로 집계할 때 기준 시간대를 함께 보낸다 — 한국이면 "Asia/Seoul"
axios.post("/api/v1/aggs/search", { startDate, endDate, timeZone: localTimeZone() });`,

    parseYmd: `import { parseYmd } from "@txstack/fns";

parseYmd("20251231")?.toLocaleDateString("sv"); // → "2025-12-31"
parseYmd("20250230"); // → null
parseYmd("2025-12-31"); // → null

// 옛 yyyymmddToTime(s)
const time = parseYmd(row.date)?.getTime();`,

    isoWeek: `import { isoWeek } from "@txstack/fns";

isoWeek("20251231"); // → { year: 2026, week: 1, key: "2026-W01" }
isoWeek("20250618"); // → { year: 2025, week: 25, key: "2025-W25" }
isoWeek("nope"); // → null

// 주 단위로 묶기
const byWeek = Object.groupBy(rows, (row) => isoWeek(row.date)?.key ?? "unknown");`,

    parseTimestamps: `import { lastDays, parseTimestamps } from "@txstack/fns";

parseTimestamps("1716300000000,1718700000000")?.map((d) => d.getTime()); // → [1716300000000, 1718700000000]
parseTimestamps("1716300000000%2C1718700000000")?.length; // → 2
parseTimestamps("abc"); // → null

// 주소의 ?period=시작,끝 을 기간으로. 없으면 최근 7일
const [start, end] = parseTimestamps(searchParams.get("period")) ?? lastDays(7);`,

    splitSeconds: `import { splitSeconds } from "@txstack/fns";

splitSeconds(90061); // → { days: 1, hours: 1, minutes: 1, seconds: 1, formatted: "1d 01:01:01" }
splitSeconds(3723).formatted; // → "01:02:03"
splitSeconds(90061, { dayLabel: "일 " }).formatted; // → "1일 01:01:01"
splitSeconds(61, { pad: false }).formatted; // → "0:1:1"

// 남은 시간 표시
<span>{splitSeconds(remainSeconds, { dayLabel: "일 " }).formatted}</span>;`,

    elapsed: `import { elapsed } from "@txstack/fns";

elapsed(6.5, { decimals: 1 }); // → "6.5s"
elapsed(90); // → "1m 30s"
elapsed(3665); // → "1h 1m"
elapsed(86400 * 3); // → "3d"

const ko = { second: "초", minute: "분", hour: "시간", day: "일", month: "달", year: "년", just_now: "방금" };
elapsed(90, { t: (key) => ko[key] }); // → "1분 30초"

// i18n 의 번역 함수를 그대로 넘긴다 — 키는 second · minute · hour · day · month · year · just_now
<span>{elapsed(row.durationSeconds, { decimals: 0, t: i18n.t })}</span>;`
  },

  rand: {
    randomFloat: `import { randomFloat } from "@txstack/fns";

randomFloat(0, 100, 0.9, 1); // → 90
randomFloat(0, 100, 0, 1); // → 0

// bias 로 쏠리게 한다 — 0.9 면 90 근처가 자주 나온다(weight 기본 0.8)
const score = randomFloat(0, 100, 0.9);`,

    randomInt: `import { randomInt } from "@txstack/fns";

randomInt(0, 10) < 10; // → true
randomInt(5, 6); // → 5

// 목업 데이터 — 나이는 20~59, 젊은 쪽으로 쏠리게
const rows = Array.from({ length: 50 }, (_, id) => ({ id, age: randomInt(20, 60, 0.3) }));`,

    randomDate: `import { randomDate } from "@txstack/fns";

randomDate(new Date(2025, 0, 1), new Date(2026, 0, 1)).getFullYear(); // → 2025

// 최근 쪽으로 쏠린 가입일
const joinedAt = randomDate(new Date(2024, 0, 1), new Date(), 1);`,

    randomPick: `import { randomPick } from "@txstack/fns";

randomPick(["only"]); // → "only"
randomPick([]); // → undefined

// 대부분 "active" — bias 0 은 앞쪽으로 쏠린다
const status = randomPick(["active", "paused", "left"], 0, 0.9);`,

    randomIp: `import { randomIp } from "@txstack/fns";

/^\\d{1,3}(\\.\\d{1,3}){3}$/.test(randomIp()); // → true

// 접속 기록 목업
const log = { ip: randomIp(), at: new Date() };`,

    shortId: `import { shortId } from "@txstack/fns";

shortId() !== shortId(); // → true

// 화면 안에서만 쓰는 키 — 행 추가
setRows((rows) => [...rows, { key: shortId(), name: "" }]);`
  },

  str: {
    hashColor: `import { hashColor } from "@txstack/fns";

hashColor("123456"); // → "#456789"
hashColor(""); // → "#407adf"
hashColor("kim@example.com") === hashColor("kim@example.com"); // → true

// 이름마다 늘 같은 색의 아바타
<span style={{ backgroundColor: hashColor(user.email) }}>{user.name[0]}</span>;`,

    paletteColor: `import { PALETTE, paletteColor } from "@txstack/fns";

paletteColor(0); // → "#EF4444"
paletteColor(3); // → "#3B82F6"
paletteColor(15); // → "#EF4444"
PALETTE.length; // → 15

// 차트 계열마다 색
const colored = series.map((item, index) => ({ ...item, color: paletteColor(index) }));`,

    emailLocalPart: `import { emailLocalPart } from "@txstack/fns";

emailLocalPart("kim@example.com"); // → "kim"
emailLocalPart("no-at-sign"); // → "no-at-sign"

// 표시 이름이 없을 때
const name = user.nickname || emailLocalPart(user.email);`,

    hasSpecialChars: `import { hasSpecialChars } from "@txstack/fns";

hasSpecialChars("abc@123"); // → true
hasSpecialChars("hello_world 1"); // → false

// 비밀번호 규칙
if (!hasSpecialChars(password)) return "특수문자를 하나 이상 넣어 주세요";`,

    hasNonAscii: `import { hasNonAscii } from "@txstack/fns";

hasNonAscii("password1!"); // → false
hasNonAscii("비밀번호"); // → true

// 한글 입력기가 켜진 채로 비밀번호를 친 경우를 막는다
if (hasNonAscii(password)) return "영문 · 숫자 · 특수문자만 쓸 수 있습니다";`
  },

  obj: {
    diffObject: `import { diffObject } from "@txstack/fns";

diffObject({ name: "kim", age: 20 }, { name: "kim", age: 21 }); // → { age: 21 }
diffObject({ tags: ["a"] }, { tags: ["a"] }); // → { tags: ["a"] }

// 수정 화면에서 바뀐 값만 보낸다. 배열 · 객체 필드는 깊은 비교 함수를 넘긴다(lodash 면 _.isEqual)
const changed = diffObject(saved, edited, _.isEqual);
if (Object.keys(changed).length > 0) await api.update(id, changed);`,

    undefinedToNull: `import { undefinedToNull } from "@txstack/fns";

undefinedToNull({ name: "kim", memo: undefined }); // → { name: "kim", memo: null }

// JSON 으로 보내면 undefined 필드는 빠진다 — "지운다" 를 보내려면 null 로
await api.update(id, undefinedToNull(form));`
  },

  arr: {
    sortByOrder: `import { sortByOrder } from "@txstack/fns";

const rows = [{ p: "low" }, { p: "etc" }, { p: "high" }, { p: "medium" }];
sortByOrder(rows, ["high", "medium", "low"], "p").map((row) => row.p); // → ["high", "medium", "low", "etc"]
sortByOrder(rows, ["high", "medium", "low"], "p", "desc").map((row) => row.p); // → ["low", "medium", "high", "etc"]

// 꺼내는 함수도 받는다 — 옛 sortArray(menus, order)
const sorted = sortByOrder(menus, order, (menu) => menu.name);`
  },

  form: {
    checkForm: `import { checkForm } from "@txstack/fns";

const rules = { email: { pattern: /^\\S+@\\S+$/, message: "이메일 형식이 아닙니다" } };
checkForm({ name: "", email: "x" }, rules); // → { name: "name is empty" }
checkForm({ name: "kim", email: "x" }, rules); // → { email: "이메일 형식이 아닙니다" }
checkForm({ name: "kim", email: "a@b" }, rules); // → null

// 저장 버튼에서
const error = checkForm(values, rules, { optional: ["memo"] });
if (error) return toast.error(Object.values(error)[0]);`,

    checkEmpty: `import { checkEmpty } from "@txstack/fns";

checkEmpty({ name: " ", age: 0 }); // → { name: "name is empty" }
checkEmpty({ tags: [] }); // → { tags: "tags is empty" }
checkEmpty({ name: "", memo: "" }, { optional: ["name", "memo"] }); // → null
checkEmpty({ name: "" }, { message: (key) => key + "을(를) 입력하세요" }); // → { name: "name을(를) 입력하세요" }`,

    checkPattern: `import { checkPattern } from "@txstack/fns";

const rules = { phone: { pattern: /^010-\\d{4}-\\d{4}$/, message: "010-0000-0000 형식으로" } };
checkPattern({ phone: "010-12" }, rules); // → { phone: "010-0000-0000 형식으로" }
checkPattern({ phone: "" }, rules); // → null
checkPattern({ phone: "010-1234-5678" }, rules); // → null`
  },

  async: {
    sleep: `import { sleep } from "@txstack/fns";

const started = Date.now();
await sleep(100); // 0.1초 기다린다
Date.now() - started >= 90; // → true

// 폴링 사이의 간격(기본 1000ms) — 옛 waitForSeconds(ms)
while (!(await api.isDone(jobId))) await sleep(2000);`,

    withLoading: `import { withLoading } from "@txstack/fns";

const loading: boolean[] = [];
const save = withLoading(async (id: number) => ({ id, saved: true }), { onLoading: (value) => loading.push(value) });
await save(7); // → { id: 7, saved: true }
loading; // → [true, false]

// 화면에서는 — 알림은 앱이 정한다. onError 를 빼면 오류를 다시 던진다
const submit = withLoading(api.save, { onLoading: setSaving, onError: (e) => toast.error(String(e)) });`
  },

  math: {
    lerp: `import { lerp } from "@txstack/fns";

lerp(0, 10, 0.5); // → 5
lerp(100, 200, 0.25); // → 125
lerp(0, 10, 1.5); // → 15`,

    lerpVector: `import { lerpVector } from "@txstack/fns";

lerpVector({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5); // → { x: 5, y: 10 }

// 매 프레임 목표 지점으로 10%씩 다가간다
position = lerpVector(position, target, 0.1);`,

    toRadians: `import { toRadians } from "@txstack/fns";

toRadians(180) === Math.PI; // → true
Math.sin(toRadians(30)).toFixed(2); // → "0.50"`,

    toDegrees: `import { toDegrees } from "@txstack/fns";

toDegrees(Math.PI); // → 180
toDegrees(Math.atan2(1, 1)); // → 45`,

    rotate: `import { rotate } from "@txstack/fns";

const p = rotate({ x: 10, y: 0 }, { x: 0, y: 0 }, 90);
[Math.round(p.x), Math.round(p.y)]; // → [0, 10]

// 중심(cx, cy)을 축으로 바늘 끝 좌표
const tip = rotate({ x: cx, y: cy - radius }, { x: cx, y: cy }, angle);`
  },

  "phone-kr": {
    normalizePhone: `import { normalizePhone } from "@txstack/fns";

normalizePhone("010-1234-5678"); // → "01012345678"
normalizePhone("+82 10 1234 5678"); // → "01012345678"
normalizePhone("1012345678"); // → "01012345678"
normalizePhone("02-123-4567"); // → "021234567"`,

    parseMobile: `import { parseMobile } from "@txstack/fns";

parseMobile("+82 10-1234-5678"); // → "01012345678"
parseMobile("02-123-4567"); // → null

// 저장 · 비교는 정규화한 값으로
const mobile = parseMobile(input);
if (!mobile) return alert("휴대폰 번호가 아닙니다");`,

    maskPhone: `import { maskPhone } from "@txstack/fns";

maskPhone("010-1234-5678"); // → "010****5678"
maskPhone("0212345678"); // → "02****5678"
maskPhone("12345"); // → "12345"

// 개발 중에 가리지 않으려면 부르는 쪽에서
const shown = import.meta.env.DEV ? row.phone : maskPhone(row.phone);`,

    maskIfPhone: `import { maskIfPhone } from "@txstack/fns";

maskIfPhone("010-1234-5678"); // → "010****5678"
maskIfPhone("kim"); // → "kim"

// 검색어를 화면에 다시 보여 줄 때
<span>"{maskIfPhone(keyword)}" 검색 결과</span>;`,

    validatePhones: `import { validatePhones } from "@txstack/fns";

await validatePhones(["010-1234-5678", "nope", "1012345678"]); // → { valid: ["01012345678", "01012345678"], invalid: ["nope"] }

// 붙여 넣은 번호 목록 — 1만 건마다 화면에 양보하므로 수십만 건도 멈추지 않는다
const { valid, invalid } = await validatePhones(text.split(/\\r?\\n/));`,

    dedupePhones: `import { dedupePhones, validatePhones } from "@txstack/fns";

await dedupePhones(["01011112222", "01011112222", "01033334444"]); // → { uniques: ["01011112222", "01033334444"], duplicates: ["01011112222"] }

// 정규화는 하지 않는다 — validatePhones 를 먼저 거친다
const { uniques } = await dedupePhones((await validatePhones(lines)).valid);`,

    excludePhones: `import { excludePhones } from "@txstack/fns";

await excludePhones(["01011112222", "01033334444"], ["01033334444"]); // → { remains: ["01011112222"], excluded: ["01033334444"] }

// 수신 거부 번호를 뺀다 — 두 번째 인자는 배열이든 Set 이든
const { remains } = await excludePhones(targets, new Set(blockedPhones));`
  },

  "browser/cookie": {
    getCookie: `import { getCookie } from "@txstack/fns";

getCookie("page", 1); // 저장한 2, 없으면 1
getCookie("filters", [] as string[]); // ["soccer", "baseball"]
getCookie("code", ""); // "00123" 을 저장했으면 "00123" — 숫자로 바뀌지 않는다`,

    setCookie: `import { setCookie } from "@txstack/fns";

setCookie("page", 2);
setCookie("filters", ["soccer", "baseball"]);
setCookie("token", "abc", { days: 1, sameSite: "Strict" });`,

    removeCookie: `import { removeCookie } from "@txstack/fns";

removeCookie("token");
removeCookie("token", { path: "/admin" }); // 저장할 때 path 를 바꿨다면 같은 값을`
  },

  "browser/css": {
    injectCSS: `import { injectCSS } from "@txstack/fns";

// 인라인 style 로는 안 되는 :hover · ::before 에
injectCSS("brand", ".brand-button:hover", { backgroundColor: brandColor });
injectCSS("brand", ".badge::before", { content: '"●"', color: "#22c55e" });
injectCSS("brand", ":root", { "--brand": brandColor }); // 같은 선택자는 그 자리에서 바뀐다`,

    removeCSS: `import { injectCSS, removeCSS } from "@txstack/fns";

// 화면을 떠날 때 넣었던 규칙을 통째로 지운다
useEffect(() => {
  injectCSS("brand", ".brand-button:hover", { backgroundColor: brandColor });
  return () => removeCSS("brand");
}, [brandColor]);`
  },

  "browser/file": {
    readTextFile: `import { readTextFile } from "@txstack/fns";

const [file, setFile] = useState<File>();

<input type="file" accept=".txt,.csv" onChange={(e) => setFile(e.target.files?.[0])} />;

async function onCompare() {
  if (!file) return;
  const text = await readTextFile(file); // 파일 내용 전체를 문자열로
  const lines = text.split(/\\r?\\n/).filter(Boolean);
}`,

    downloadFile: `import { downloadFile } from "@txstack/fns";

downloadFile("numbers.txt", ["01011112222", " 01033334444 ", ""]); // 줄마다 다듬고 빈 줄은 뺀다
downloadFile("report.csv", "name,age\\nkim,20", "text/csv;charset=utf-8");
downloadFile("data.json", new Blob([JSON.stringify(data)], { type: "application/json" }));

// 내려받을 것이 없으면 false
if (!downloadFile("빈파일.txt", [])) alert("다운로드할 데이터가 없습니다.");`
  }
};
