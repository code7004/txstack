import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { RefLabel, RefTable, Signature } from "../../components/Reference";
import { TABLES, tableAnchor } from "./data";

const muted = "text-slate-600 dark:text-slate-300";

export function ApiHooks() {
  return (
    <Page
      title="@txstack/hooks"
      lead={
        <>
          목록 화면을 만들 때마다 손이 가는 상태 관리를 덜어 주는 훅입니다. 검색 조건처럼 여러 필드를 가진 객체를 바꿀 필드만 넘겨 고치거나(<code>useObjectState</code>), 필터 값을 주소창에 담아 새로고침 · 공유해도 같은 화면이 열리게 합니다(
          <code>useUrlQuery</code>). 화면에 붙이는 순서는{" "}
          <Link to="/docs/guide/url-state" className="underline">
            Guide › URL State
          </Link>
          에 있습니다.
        </>
      }
    >
      <Block title="Install">
        <CodeBlock language="bash" title="sh">{`pnpm add @txstack/hooks`}</CodeBlock>
        <RefTable head={["Entry", "Exports", "Peer", "Description"]} rows={TABLES.hooks.installEntry.rows} anchor={tableAnchor(TABLES.hooks.installEntry)} />
        <p className={muted}>
          훅마다 진입점이 따로 있어서 import 경로가 곧 훅 이름입니다. 루트(<code>@txstack/hooks</code>)에서는 가져올 수 없으니 훅 이름까지 적어 주세요. 쓰지 않는 훅이 요구하는 패키지는 설치하지 않아도 되므로, Next.js나 TanStack Router를 쓰는 앱도{" "}
          <code>useObjectState</code>는 그대로 쓸 수 있습니다.
        </p>
      </Block>

      <Block title="useObjectState">
        <Signature>{`function useObjectState<T extends object>(
  initialValue: T,
  postParse?: (next: T) => Partial<T>
): readonly [T, (patch: Partial<T> | ((prev: T) => Partial<T>)) => void]`}</Signature>
        <p className={muted}>
          <code>useState</code>로 객체를 다루면 <code>{`setFilter({ ...filter, keyword })`}</code>처럼 매번 나머지 필드를 펼쳐 넣어야 합니다. <code>useObjectState</code>는 바꿀 필드만 받아서 합쳐 줍니다. 입력 폼이나, 주소에 남길 필요가 없는 화면 안의
          필터에 씁니다.
        </p>
        <RefLabel>Parameters</RefLabel>
        <RefTable rows={TABLES.hooks.objectStateParams.rows} anchor={tableAnchor(TABLES.hooks.objectStateParams)} />
        <RefLabel>Returns</RefLabel>
        <RefTable head={["Index", "Type", "Identity", "Description"]} rows={TABLES.hooks.objectStateReturns.rows} anchor={tableAnchor(TABLES.hooks.objectStateReturns)} />
        <CodeBlock title="example">{`const [filter, setFilter] = useObjectState({ keyword: "", page: 1 });

setFilter({ keyword: "kim" });                  // page는 그대로 1
setFilter((prev) => ({ page: prev.page + 1 })); // 이전 값을 보고 고칠 수도 있습니다
setFilter({ keyword: "lee", page: 1 });         // 함께 바뀌는 필드는 한 번에 넘깁니다`}</CodeBlock>
        <p className={muted}>
          두 번째 인자 <code>postParse</code>에는 <strong>언제나 지켜야 할 규칙</strong>을 적습니다. 상태를 병합할 때마다 호출되며, 돌려준 필드로 병합 결과를 한 번 더 덮어씁니다. &quot;검색어가 바뀌면 첫 페이지로&quot;처럼 특정 변경에만 따라야 하는
          일은 여기가 아니라 바꾸는 쪽에서 함께 넘기세요. <code>postParse</code>는 무엇이 바뀌었는지 모르기 때문에, 검색어가 있는 동안 페이지를 넘길 수 없게 됩니다.
        </p>
        <CodeBlock title="example — postParse">{`// 시작일이 종료일보다 뒤로 가면 종료일을 따라 옮깁니다
const [range, setRange] = useObjectState(
  { from: "2026-01-01", to: "2026-01-31" },
  (next) => (next.from > next.to ? { to: next.from } : {})
);`}</CodeBlock>
      </Block>

      <Block title="useUrlQuery">
        <Signature>{`function useUrlQuery<T extends object>(
  options: UseUrlQueryOptions<T>
): [T, (patch: Partial<T> | ((prev: T) => Partial<T>)) => void]`}</Signature>
        <p className={muted}>
          검색 조건을 <code>useState</code>에 두면 새로고침하거나 주소를 공유할 때 조건이 사라집니다. <code>useUrlQuery</code>는 조건을 주소창의 쿼리스트링에 담고, 주소를 읽어 다시 객체로 돌려줍니다. 상태를 따로 들지 않고 매번 주소에서 읽기 때문에,
          뒤로 가기나 주소를 직접 고쳐서 바뀐 값도 그대로 반영됩니다. <code>react-router-dom</code>의 라우터 안에서 써야 합니다.
        </p>

        <RefLabel>UseUrlQueryOptions</RefLabel>
        <RefTable rows={TABLES.hooks.useurlqueryoptions.rows} anchor={tableAnchor(TABLES.hooks.useurlqueryoptions)} />

        <RefLabel>Returns</RefLabel>
        <RefTable head={["Index", "Type", "Identity", "Description"]} rows={TABLES.hooks.urlQueryReturns.rows} anchor={tableAnchor(TABLES.hooks.urlQueryReturns)} />

        <RefLabel>URL read · write rules</RefLabel>
        <RefTable head={["Case", "Written as", "Read as", "Note"]} rows={TABLES.hooks.urlRules.rows} anchor={tableAnchor(TABLES.hooks.urlRules)} />

        <CodeBlock title="example">{`const [query, setQuery] = useUrlQuery({
  defaults: { q: "", page: 1, sort: "stars" }
});

setQuery({ q: "react", page: 1 });             // ?q=react&page=1&sort=stars
setQuery((prev) => ({ page: prev.page + 1 })); // ?q=react&page=2&sort=stars`}</CodeBlock>
        <p className={muted}>
          <code>defaults</code>에 없는 키를 <code>urlKeys</code>로 읽는다면 타입을 직접 적어 주세요(<code>{`useUrlQuery<Query>({ ... })`}</code>). <code>defaults</code>에 없는 키는 추론으로 알 수 없어서, 적지 않으면 <code>query.keyword</code>가 타입
          오류가 납니다.
        </p>
        <CodeBlock title="example — urlKeys">{`interface Query { page: number; keyword?: string; status?: number }

const [query, setQuery] = useUrlQuery<Query>({
  defaults: { page: 1 },
  urlKeys: ["keyword", "status"],  // Query에 없는 이름은 타입 오류
  queryTypes: { status: "number" } // 기본값이 없으니 숫자로 읽으라고 알려 줍니다
});

query.status; // number | undefined`}</CodeBlock>
        <p className={muted}>
          <code>loader</code>를 쓰는 data router에서는 주소가 바뀌면 <code>loader</code>가 다시 실행됩니다. 원하지 않으면 해당 라우트의 <code>shouldRevalidate</code>를 조정하세요.
        </p>
      </Block>
    </Page>
  );
}
