import * as date from "@txstack/fns/date";
import * as num from "@txstack/fns/num";
import * as phone from "@txstack/fns/phone-kr";
import * as str from "@txstack/fns/str";
import { TxInput } from "@txstack/ui";
import { useState } from "react";
import { CodeBlock } from "../../components/CodeBlock";
import { INSTALL_TITLE, PrePublishNote } from "../../components/PrePublish";
import { Block, Demo, Page } from "../../components/Page";
import { RefLabel, RefTable } from "../../components/Reference";
import { Link } from "react-router-dom";
import { FNS_FORMER, TABLES, formerLabel, formerTarget, tableAnchor, type ApiTable } from "./data";

const muted = "text-slate-600 dark:text-slate-300";

function Table({ table, head }: { table: ApiTable; head?: [string, string, string, string] }) {
  return <RefTable head={head ?? ["Name", "Signature", "Default", "Description"]} rows={table.rows} anchor={tableAnchor(table)} />;
}

/** 입력 하나로 여러 함수의 결과를 나란히 본다 */
function Results({ rows }: { rows: [call: string, result: string][] }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
      {rows.map(([call, result]) => (
        <div key={call} className="contents">
          <dt className="font-mono text-xs text-slate-500 dark:text-slate-400">{call}</dt>
          <dd className="font-mono text-xs break-all">{result}</dd>
        </div>
      ))}
    </dl>
  );
}

const show = (value: unknown) => (typeof value === "string" ? JSON.stringify(value) : String(value));

function NumberTry() {
  const [value, setValue] = useState("1234567.891");

  return (
    <Demo>
      <TxInput aria-label="숫자" value={value} onChangeText={setValue} className="w-64" />
      <Results
        rows={[
          [`num.isNumeric(v)`, show(num.isNumeric(value))],
          [`num.format(v)`, show(num.format(value))],
          [`num.format(v, { style: "currency", currency: "KRW" })`, show(num.format(value, { style: "currency", currency: "KRW" }))],
          [`num.compact(v)`, show(num.compact(value))],
          [`num.compact(v, { locale: "en-US" })`, show(num.compact(value, { locale: "en-US" }))],
          [`num.percent(v)`, show(num.percent(value))],
          [`num.bytes(v)`, show(num.bytes(value))]
        ]}
      />
    </Demo>
  );
}

function PhoneTry() {
  const [value, setValue] = useState("+82 10-1234-5678");
  const color = str.hashColor(value);

  return (
    <Demo>
      <TxInput aria-label="전화번호 또는 아무 글자" value={value} onChangeText={setValue} className="w-64" />
      <Results
        rows={[
          [`phone.normalize(v)`, show(phone.normalize(value))],
          [`phone.parseMobile(v)`, show(phone.parseMobile(value))],
          [`phone.mask(v)`, show(phone.mask(value))],
          [`phone.maskIfPhone(v)`, show(phone.maskIfPhone(value))],
          [`str.hashColor(v)`, show(color)]
        ]}
      />
      <span className="inline-flex items-center gap-2 text-sm">
        <span aria-hidden className="inline-block size-5 rounded-full border" style={{ backgroundColor: color, borderColor: "var(--tx-color-border)" }} />
        <span className={muted}>같은 글자면 늘 같은 색입니다</span>
      </span>
    </Demo>
  );
}

function SecondsTry() {
  const [value, setValue] = useState("90061");
  const seconds = num.toNumber(value, 0);

  return (
    <Demo>
      <TxInput aria-label="초" value={value} onChangeText={setValue} className="w-64" />
      <Results
        rows={[
          [`date.elapsed(v)`, show(date.elapsed(seconds))],
          [`date.splitSeconds(v).formatted`, show(date.splitSeconds(seconds).formatted)],
          [`date.splitSeconds(v, { dayLabel: "일 " }).formatted`, show(date.splitSeconds(seconds, { dayLabel: "일 " }).formatted)]
        ]}
      />
    </Demo>
  );
}

export function ApiFns() {
  return (
    <Page title="@txstack/fns" lead="화면마다 다시 쓰게 되는 작은 함수 모음입니다. React를 쓰지 않고 의존성이 없어서 Node에서도 돌아갑니다. 그룹마다 진입점이 따로 있어서, 경로 이름을 그대로 네임스페이스로 씁니다.">
      <Block title="Install">
        <CodeBlock language="bash" title={INSTALL_TITLE}>{`pnpm add @txstack/fns`}</CodeBlock>
        <PrePublishNote />
        <Table table={TABLES.fns.installEntry} head={["Entry", "Exports", "Runs on", "Description"]} />
        <p className={muted}>
          루트 진입점(<code>@txstack/fns</code>)은 없습니다. <code>browser/</code> 아래는 <code>document</code>를 쓰므로 브라우저에서만 부르고, 나머지는 Node에서도 돌아갑니다.
        </p>
      </Block>

      <Block title="Namespaces">
        <p className={muted}>
          진입점 경로가 곧 네임스페이스 이름입니다. <code>import * as</code>로 받으면 <code>num.format</code>처럼 어느 그룹의 함수인지 드러나고, 쓰지 않은 함수는 번들에서 빠집니다. 필요한 것만 이름으로 가져와도 됩니다.
        </p>
        <CodeBlock title="example">{`import * as num from "@txstack/fns/num";
import * as phone from "@txstack/fns/phone-kr";
import { lastDays } from "@txstack/fns/date";

num.format(1234567);          // "1,234,567"
phone.mask("01012345678");    // "010****5678"
const [start, end] = lastDays(14);`}</CodeBlock>
        <p className={muted}>
          lodash에 있는 기능(<code>pick</code> · <code>isEqual</code> · <code>clamp</code> · <code>inRange</code> · <code>sortBy</code> …)은 넣지 않았습니다. 같은 일을 하는 함수가 두 벌이면 어느 쪽을 써야 할지 헷갈리기 때문입니다.
        </p>
      </Block>

      <Block title="Former names">
        <p className={muted}>
          세 서비스의 <code>core/extensions.ts</code>에서 옮기며 이름을 바꿨습니다. 사이트 검색에 옛 이름을 쳐도 새 함수로 갑니다.
        </p>
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
          <table className="site-stack-table w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--tx-color-muted)" }}>
                <th className="px-3 py-2 text-start font-semibold">Former</th>
                <th className="px-3 py-2 text-start font-semibold">Now</th>
                <th className="px-3 py-2 text-start font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {FNS_FORMER.map((former) => (
                <tr key={former[0]} className="border-t align-top" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">{former[0]}</td>
                  <td data-label="Now" className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                    <Link to={formerTarget(former)} className="underline">
                      {formerLabel(former)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{former[3] ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="num">
        <p className={muted}>
          포맷 함수는 <strong>빈 값을 0으로 그립니다</strong> — <code>null</code> · <code>undefined</code> · <code>NaN</code> · 숫자가 아닌 문자열 모두. 다른 글자가 필요하면 <code>fallback</code>을 주세요. <code>locale</code>을 빼면 실행 환경의
          로케일을 씁니다.
        </p>
        <NumberTry />
        <Table table={TABLES.fns.num} />
        <CodeBlock title="example">{`num.format(1234.5678, { maximumFractionDigits: 2 });  // "1,234.57"
num.format(null);                                     // "0"
num.format(null, { fallback: "-" });                  // "-"
num.percent(0.1234);                                  // "12.3%"
num.compact(12000, { locale: "ko-KR" });              // "1.2만"
num.bytes(5_300_000);                                 // "5.05 MB"

// 한국어로 고정하고 싶다면 앱에서 한 번 감쌉니다
export const won = (n: num.Numberish) => num.format(n, { locale: "ko-KR", style: "currency", currency: "KRW" });`}</CodeBlock>
      </Block>

      <Block title="date">
        <p className={muted}>모든 계산은 실행 환경의 시간대를 씁니다. 기간 함수는 마지막 날을 23:59:59.999까지 넣어서, 그대로 서버의 검색 조건으로 넘길 수 있습니다.</p>
        <SecondsTry />
        <Table table={TABLES.fns.date} />
        <CodeBlock title="example">{`const [start, end] = date.lastDays(14);   // 오늘을 포함한 14일
api.search({ startDate: start.getTime(), endDate: end.getTime(), timeZone: date.localTimeZone() });

date.isoWeek("20251231");                // { year: 2026, week: 1, key: "2026-W01" }
date.elapsed(90, { t: i18n.t });          // t("minute") · t("second") 로 단위를 번역합니다`}</CodeBlock>
      </Block>

      <Block title="rand">
        <p className={muted}>
          목업 데이터를 만들 때 씁니다. <code>bias</code>(0~1)는 쏠릴 자리, <code>weight</code>(0~1, 기본 0.8)는 쏠리는 정도입니다. <code>Math.random</code>을 쓰므로 토큰이나 비밀번호에는 쓰지 마세요.
        </p>
        <Table table={TABLES.fns.rand} />
        <CodeBlock title="example">{`rand.int(0, 100);                       // 0 ~ 99
rand.int(0, 100, 0.9);                  // 90 근처가 자주 나온다
rand.pick(["active", "left"], 0.1);     // 대부분 "active"`}</CodeBlock>
      </Block>

      <Block title="str">
        <Table table={TABLES.fns.str} />
      </Block>

      <Block title="obj · arr">
        <Table table={TABLES.fns.obj} />
        <CodeBlock title="example">{`// 수정 화면에서 바뀐 값만 보낸다
api.update(id, obj.diff(saved, edited, _.isEqual));

arr.sortByOrder(rows, ["high", "medium", "low"], "priority");`}</CodeBlock>
      </Block>

      <Block title="form">
        <p className={muted}>
          <code>TxForm</code>처럼 필드마다 검사를 붙이기 어려운 자리(직접 만든 입력 화면, 일괄 등록)에 씁니다. 첫 번째로 걸린 필드 하나만 알려 줍니다.
        </p>
        <Table table={TABLES.fns.form} />
        <CodeBlock title="example">{`const error = form.check(
  values,
  { email: { pattern: /^\\S+@\\S+$/, message: "이메일 형식이 아닙니다" } },
  { optional: ["memo"], message: (key) => \`\${key}을(를) 입력하세요\` }
);
if (error) return toast.error(Object.values(error)[0]);`}</CodeBlock>
      </Block>

      <Block title="async · math">
        <Table table={TABLES.fns.async} />
        <CodeBlock title="example">{`const save = withLoading(api.save, {
  onLoading: setSaving,
  onError: (error) => toast.error(String(error))   // 알림은 앱이 정합니다
});`}</CodeBlock>
      </Block>

      <Block title="phone-kr">
        <p className={muted}>
          한국 전화번호를 다룹니다. <strong>정규화한 값(숫자만)으로 비교 · 저장하세요.</strong> 하이픈이나 <code>+82</code>가 섞인 원본끼리 비교하면 같은 번호를 다르게 봅니다. 대량 함수는 1만 건마다 이벤트 루프에 양보해서, 수십만 건을 붙여 넣어도
          화면이 멈추지 않습니다.
        </p>
        <PhoneTry />
        <Table table={TABLES.fns.phone} />
      </Block>

      <Block title="browser">
        <p className={muted}>
          <code>@txstack/fns/browser/cookie</code> · <code>/css</code> · <code>/file</code> 세 진입점입니다. 이름이 겹치므로(<code>remove</code>) 네임스페이스로 받으세요.
        </p>
        <RefLabel>cookie · css · file</RefLabel>
        <Table table={TABLES.fns.browser} />
        <CodeBlock title="example">{`import * as cookie from "@txstack/fns/browser/cookie";
import * as css from "@txstack/fns/browser/css";

cookie.set("filters", ["soccer", "baseball"]);
cookie.get("filters", [] as string[]);          // ["soccer", "baseball"]
cookie.set("code", "00123");
cookie.get("code", "");                         // "00123" — 숫자로 바뀌지 않습니다

css.inject("brand", ".btn:hover", { backgroundColor: "#2dd4bf" });`}</CodeBlock>
      </Block>
    </Page>
  );
}
