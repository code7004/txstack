import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";
import { RefLabel, RefTable, Signature } from "../../components/Reference";

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
        <RefTable
          head={["Entry", "Exports", "Peer", "Description"]}
          rows={[
            ["@txstack/hooks/useObjectState", "useObjectState", "react >=18", "객체 상태를 부분 업데이트로 다룹니다"],
            ["@txstack/hooks/useUrlQuery", "useUrlQuery · UseUrlQueryOptions", "react >=18 · react-router-dom >=6", "URL 쿼리를 상태처럼 다룹니다. 이 진입점을 쓸 때만 react-router-dom이 필요합니다"]
          ]}
        />
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
        <RefTable
          rows={[
            ["initialValue", "T", "필수", "처음 값. postParse가 있으면 처음 값에도 적용됩니다"],
            ["postParse", "(next: T) => Partial<T>", "—", "합친 직후 불려 추가로 바꿀 값을 돌려줍니다. 값 정규화나 서로 연결된 필드 정리에 씁니다"]
          ]}
        />
        <RefLabel>Returns</RefLabel>
        <RefTable
          head={["Index", "Type", "Identity", "Description"]}
          rows={[
            ["[0] state", "T", "바뀔 때만 새 객체", "지금 상태"],
            ["[1] update", "(patch) => void", "항상 같은 함수", "부분 객체 또는 (prev) => 부분 객체를 받아 합칩니다. 결과가 이전과 얕은 비교로 같으면 다시 렌더링하지 않습니다"]
          ]}
        />
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
        <RefTable
          rows={[
            ["defaults", "T", "필수", "주소에 값이 없을 때 쓸 기본값. 결과의 키 목록과, 값을 읽을 때의 타입(숫자 · 불리언 · 문자열)이 이것으로 정해집니다"],
            ["urlKeys", "(keyof T)[]", "—", "기본값에는 없지만 주소에서 읽을 키"],
            ["queryTypes", 'Partial<Record<keyof T, "string" | "number" | "boolean">>', "—", "기본값만으로 타입을 정할 수 없을 때(기본값이 undefined 등) 읽는 방법을 직접 지정합니다"],
            ["postParse", "(query: Partial<T>) => Partial<T>", "—", "주소와 기본값을 합친 직후 불려 추가로 바꿀 값을 돌려줍니다"],
            ["replace", "boolean", "true", "true면 방문 기록을 쌓지 않고 지금 주소를 바꿉니다. 조건마다 뒤로 가기로 되돌리려면 false"],
            ["encode", "boolean", "false", "쿼리 전체를 base64url JSON 하나로 감춥니다(?_q=eyJ…)"],
            ["encodeKey", "string", '"_q"', "encode를 켰을 때 쓸 키 이름"]
          ]}
        />

        <RefLabel>Returns</RefLabel>
        <RefTable
          head={["Index", "Type", "Identity", "Description"]}
          rows={[
            ["[0] query", "T", "주소가 바뀔 때만 새 객체", "지금 조건. useEffect 의존성에 그대로 넣어도 됩니다"],
            ["[1] setQuery", "(patch) => void", "항상 같은 함수", "부분 객체 또는 (prev) => 부분 객체를 받아 지금 조건과 합친 뒤 주소에 씁니다"]
          ]}
        />

        <RefLabel>주소에 쓰고 읽는 규칙</RefLabel>
        <RefTable
          head={["Case", "Written as", "Read as", "Note"]}
          rows={[
            ["setQuery 호출", "합친 결과의 모든 키", "—", "기본값과 같은 값도 적습니다. 결과가 이전과 같으면 주소를 바꾸지 않습니다"],
            ["null · undefined", "적지 않음", "기본값", ""],
            ['빈 문자열 ""', "?q=", '""', "빈 값도 키는 남습니다"],
            ["숫자 · 불리언", "?page=2 · ?on=true", "기본값의 타입대로", '기본값이 문자열이면 "2"로 읽습니다'],
            ["배열", "?ids[]=1&ids[]=2", "배열", "같은 키를 두 번 적어도(?ids=1&ids=2) 배열로 읽습니다. 쉼표로는 나누지 않습니다"],
            ["기본값에 없는 키", "—", "결과에 없음", "urlKeys로 지정하면 읽습니다"]
          ]}
        />

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
