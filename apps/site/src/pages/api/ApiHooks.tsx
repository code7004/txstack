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
          화면마다 반복해서 작성하게 되는 범용 훅입니다. 훅마다 진입점이 따로 있어서 import 경로가 곧 훅 이름입니다. 사용법은{" "}
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
          루트 진입점(<code>@txstack/hooks</code>)은 없습니다. 훅 이름까지 경로에 적어 주세요. 다른 라우터를 쓰는 앱도 <code>useObjectState</code>는 그대로 쓸 수 있습니다.
        </p>
      </Block>

      <Block title="useObjectState">
        <Signature>{`function useObjectState<T extends object>(
  initialValue: T,
  postParse?: (next: T) => Partial<T>
): readonly [T, (patch: Partial<T> | ((prev: T) => Partial<T>)) => void]`}</Signature>
        <p className={muted}>바꿀 필드만 넘기면 나머지 필드는 그대로 남는 객체 상태입니다. 입력 폼이나 화면 안에서만 쓰는 필터에 씁니다.</p>
        <RefLabel>Parameters</RefLabel>
        <RefTable rows={TABLES.hooks.objectStateParams.rows} anchor={tableAnchor(TABLES.hooks.objectStateParams)} />
        <RefLabel>Returns</RefLabel>
        <RefTable head={["Index", "Type", "Identity", "Description"]} rows={TABLES.hooks.objectStateReturns.rows} anchor={tableAnchor(TABLES.hooks.objectStateReturns)} />
        <CodeBlock title="example">{`const [filter, setFilter] = useObjectState(
  { keyword: "", page: 1 },
  (next) => (next.keyword !== "" ? { page: 1 } : {})   // 검색어가 있으면 1페이지로
);

setFilter({ keyword: "kim" });                    // page는 1로 정리됩니다
setFilter((prev) => ({ page: prev.page + 1 }));`}</CodeBlock>
      </Block>

      <Block title="useUrlQuery">
        <Signature>{`function useUrlQuery<T extends object>(
  options: UseUrlQueryOptions<T>
): [T, (patch: Partial<T> | ((prev: T) => Partial<T>)) => void]`}</Signature>
        <p className={muted}>
          URL 쿼리를 상태처럼 읽고 씁니다. 상태를 따로 갖지 않고 매번 주소에서 읽으므로, 뒤로 가기나 주소 직접 입력으로 바뀐 값도 그대로 반영됩니다. <code>react-router-dom</code>의 라우터 안에서 써야 합니다.
        </p>

        <RefLabel>UseUrlQueryOptions</RefLabel>
        <RefTable rows={TABLES.hooks.useurlqueryoptions.rows} anchor={tableAnchor(TABLES.hooks.useurlqueryoptions)} />

        <RefLabel>Returns</RefLabel>
        <RefTable head={["Index", "Type", "Identity", "Description"]} rows={TABLES.hooks.urlQueryReturns.rows} anchor={tableAnchor(TABLES.hooks.urlQueryReturns)} />

        <RefLabel>주소에 쓰고 읽는 규칙</RefLabel>
        <RefTable head={["Case", "Written as", "Read as", "Note"]} rows={TABLES.hooks.urlRules.rows} anchor={tableAnchor(TABLES.hooks.urlRules)} />

        <CodeBlock title="example">{`const [query, setQuery] = useUrlQuery({
  defaults: { q: "", page: 1, sort: "stars" }
});

setQuery({ q: "react", page: 1 });             // ?q=react&page=1&sort=stars
setQuery((prev) => ({ page: prev.page + 1 })); // ?q=react&page=2&sort=stars`}</CodeBlock>
        <p className={muted}>
          <code>loader</code>를 쓰는 data router에서는 주소가 바뀌면 <code>loader</code>가 다시 실행됩니다. 원하지 않으면 해당 라우트의 <code>shouldRevalidate</code>를 조정하세요.
        </p>
      </Block>
    </Page>
  );
}
