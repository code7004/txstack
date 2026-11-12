import { elapsed, formatBytes, formatCompact, formatNumber, formatPercent, hashColor, isNumeric, maskIfPhone, maskPhone, normalizePhone, parseMobile, splitSeconds, toNumber } from "@txstack/fns";
import { TxInput } from "@txstack/ui";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";
import { RefLabel, RefTable } from "../../components/Reference";
import { slug } from "../../lib/slug";
import { FNS_FORMER, TABLES, formerTarget, tableAnchor, type ApiTable } from "./data";
import { FNS_EXAMPLES } from "./fnsExamples";

const muted = "text-slate-600 dark:text-slate-300";

function Table({ table, head }: { table: ApiTable; head?: [string, string, string, string] }) {
  return <RefTable head={head ?? ["Name", "Signature", "Default", "Description"]} rows={table.rows} anchor={tableAnchor(table)} />;
}

/**
 * 함수마다 예제 하나(`fnsExamples.ts`). `// →` 뒤의 값은 `fnsExamples.test.ts` 가 실제로 실행해 맞춰 본 것이다.
 * 함수 이름마다 앵커(`#example-formatnumber`)가 붙는다.
 */
function Examples({ groups }: { groups: string[] }) {
  const entries = groups.flatMap((group) => Object.entries(FNS_EXAMPLES[group] ?? {}));

  return (
    <>
      <RefLabel>Examples</RefLabel>
      <div className="flex flex-col gap-3">
        {entries.map(([name, code]) => (
          <div key={name} id={`example-${slug(name)}`} className="site-anchor">
            <CodeBlock title={name}>{code}</CodeBlock>
          </div>
        ))}
      </div>
    </>
  );
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
          [`isNumeric(v)`, show(isNumeric(value))],
          [`formatNumber(v)`, show(formatNumber(value))],
          [`formatNumber(v, { style: "currency", currency: "KRW" })`, show(formatNumber(value, { style: "currency", currency: "KRW" }))],
          [`formatCompact(v)`, show(formatCompact(value))],
          [`formatCompact(v, { locale: "en-US" })`, show(formatCompact(value, { locale: "en-US" }))],
          [`formatPercent(v)`, show(formatPercent(value))],
          [`formatBytes(v)`, show(formatBytes(value))]
        ]}
      />
    </Demo>
  );
}

function PhoneTry() {
  const [value, setValue] = useState("+82 10-1234-5678");
  const color = hashColor(value);

  return (
    <Demo>
      <TxInput aria-label="전화번호 또는 아무 글자" value={value} onChangeText={setValue} className="w-64" />
      <Results
        rows={[
          [`normalizePhone(v)`, show(normalizePhone(value))],
          [`parseMobile(v)`, show(parseMobile(value))],
          [`maskPhone(v)`, show(maskPhone(value))],
          [`maskIfPhone(v)`, show(maskIfPhone(value))],
          [`hashColor(v)`, show(color)]
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
  const seconds = toNumber(value, 0);

  return (
    <Demo>
      <TxInput aria-label="초" value={value} onChangeText={setValue} className="w-64" />
      <Results
        rows={[
          [`elapsed(v)`, show(elapsed(seconds))],
          [`splitSeconds(v).formatted`, show(splitSeconds(seconds).formatted)],
          [`splitSeconds(v, { dayLabel: "일 " }).formatted`, show(splitSeconds(seconds, { dayLabel: "일 " }).formatted)]
        ]}
      />
    </Demo>
  );
}

export function ApiFns() {
  return (
    <Page
      title="@txstack/fns"
      lead="숫자에 콤마 찍기, 최근 7일 기간 만들기, 전화번호 가리기, 폼 빈칸 검사처럼 프로젝트마다 또 쓰게 되는 함수를 모았습니다. React를 쓰지 않고 의존성도 없어서 Node에서도 그대로 돌아갑니다. 함수마다 그대로 복사해 쓸 수 있는 예제가 있습니다."
    >
      <Block title="Install">
        <CodeBlock language="bash" title="sh">{`pnpm add @txstack/fns`}</CodeBlock>
        <Table table={TABLES.fns.installEntry} head={["Entry", "Exports", "Runs on", "Description"]} />
      </Block>

      <Block title="Import">
        <p className={muted}>
          함수는 모두{" "}
          <strong>
            루트(<code>@txstack/fns</code>)에서 이름으로
          </strong>{" "}
          가져옵니다. 이름을 <code>formatNumber</code> · <code>readTextFile</code> · <code>getCookie</code>처럼 겹치지 않게 지어 두어서, 앱에서 흔히 쓰는 <code>file</code> · <code>date</code> · <code>form</code> 같은 변수 이름과 부딪히지 않습니다.
          쓰지 않은 함수는 번들에 들어가지 않습니다.
        </p>
        <CodeBlock title="example">{`import { formatNumber, lastDays, readTextFile } from "@txstack/fns";

formatNumber(1234567);                 // "1,234,567"
const [start, end] = lastDays(14);     // 오늘을 포함한 14일
const text = await readTextFile(file); // file 은 앱의 상태 변수 그대로

// 한 이름으로 묶어 쓰고 싶다면
import * as fns from "@txstack/fns";
fns.formatNumber(1234567);`}</CodeBlock>
        <p className={muted}>
          가져오는 범위를 좁히고 싶다면 묶음 단위 진입점(<code>@txstack/fns/num</code> · <code>@txstack/fns/browser/file</code> …)을 써도 됩니다. 루트와 같은 함수입니다. <code>browser</code> 묶음은 <code>document</code>를 쓰기 때문에 브라우저에서만
          부르세요. 루트에서 import 하는 것만으로는 Node에서도 문제없습니다.
        </p>
        <p className={muted}>
          lodash에 이미 있는 것(<code>pick</code> · <code>isEqual</code> · <code>clamp</code> · <code>inRange</code> · <code>sortBy</code> …)은 만들지 않았습니다. 같은 일을 하는 함수가 두 벌이면 어느 쪽을 써야 할지 헷갈리니까요. 필요하면 lodash를
          함께 쓰세요.
        </p>
        <p className={muted}>
          아래 예제에서 <code>{"// →"}</code> 뒤의 값은 테스트가 예제를 실제로 실행해 맞춰 본 결과입니다.
        </p>
      </Block>

      <Block title="num">
        <p className={muted}>
          숫자 · 비율 · 용량을 화면에 보여 줄 때 씁니다. <code>null</code> · <code>undefined</code> · <code>NaN</code> 처럼 <strong>값이 비어 있으면 0으로 보고 포맷한 문자열</strong>을 돌려줍니다. 대신 <code>&quot;-&quot;</code>를 보여 주고 싶다면{" "}
          <code>fallback</code>을 넘기세요. <code>locale</code>을 정하지 않으면 실행 환경의 것을 따릅니다. 늘 원화로 보여 줄 거라면 앱에서 한 번 감싸 두면 편합니다 —{" "}
          <code>{`const won = (n) => formatNumber(n, { locale: "ko-KR", style: "currency", currency: "KRW" })`}</code>.
        </p>
        <NumberTry />
        <Table table={TABLES.fns.num} />
        <Examples groups={["num"]} />
      </Block>

      <Block title="date">
        <p className={muted}>조회 기간을 만들거나 경과 시간을 글로 바꿀 때 씁니다. 시간대는 실행 환경의 것을 따릅니다. 기간 함수는 마지막 날을 23:59:59.999까지 채워 주므로, 결과를 그대로 서버의 검색 조건으로 넘기면 됩니다.</p>
        <SecondsTry />
        <Table table={TABLES.fns.date} />
        <Examples groups={["date"]} />
      </Block>

      <Block title="rand">
        <p className={muted}>
          목업 데이터를 만들 때 씁니다. <code>bias</code>(0~1)는 쏠릴 자리, <code>weight</code>(0~1, 기본 0.8)는 쏠리는 정도입니다. <code>Math.random</code>을 쓰므로 토큰이나 비밀번호에는 쓰지 마세요.
        </p>
        <Table table={TABLES.fns.rand} />
        <Examples groups={["rand"]} />
      </Block>

      <Block title="str">
        <Table table={TABLES.fns.str} />
        <Examples groups={["str"]} />
      </Block>

      <Block title="obj · arr">
        <Table table={TABLES.fns.obj} />
        <Examples groups={["obj", "arr"]} />
      </Block>

      <Block title="form">
        <p className={muted}>
          <code>TxForm</code>처럼 필드마다 검사를 붙이기 어려운 자리(직접 만든 입력 화면, 일괄 등록)에 씁니다. 첫 번째로 걸린 필드 하나만 알려 줍니다.
        </p>
        <Table table={TABLES.fns.form} />
        <Examples groups={["form"]} />
      </Block>

      <Block title="async · math">
        <Table table={TABLES.fns.async} />
        <Examples groups={["async", "math"]} />
      </Block>

      <Block title="phone-kr">
        <p className={muted}>
          한국 전화번호를 다룹니다. <strong>정규화한 값(숫자만)으로 비교 · 저장하세요.</strong> 하이픈이나 <code>+82</code>가 섞인 원본끼리 비교하면 같은 번호를 다르게 봅니다. 대량 함수는 1만 건마다 이벤트 루프에 양보해서, 수십만 건을 붙여 넣어도
          화면이 멈추지 않습니다.
        </p>
        <PhoneTry />
        <Table table={TABLES.fns.phone} />
        <Examples groups={["phone-kr"]} />
      </Block>

      <Block title="browser">
        <p className={muted}>
          <code>document</code>를 쓰는 함수입니다. 브라우저에서만 부르세요. 그룹 진입점은 <code>@txstack/fns/browser/cookie</code> · <code>/css</code> · <code>/file</code>입니다.
        </p>
        <Table table={TABLES.fns.browser} />
        <Examples groups={["browser/cookie", "browser/css", "browser/file"]} />
      </Block>

      <Block title="Former names">
        <p className={muted}>
          세 서비스의 <code>core/extensions.ts</code>에서 옮기며 이름을 바꿨습니다. 사이트 검색에 옛 이름을 쳐도 새 함수로 갑니다. <code>getCookie</code> · <code>formatBytes</code> · <code>maskPhone</code>처럼 이름이 그대로인 것은 싣지 않았습니다.
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
                      {former[2]}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{former[3] ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>
    </Page>
  );
}
