import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";

export function ApiHooks() {
  return (
    <Page title="@txstack/hooks" lead="범용 훅 둘. 화면마다 다시 짜게 되는 것만 담았다.">
      <Block title="useStateForObject — 객체 상태를 부분 병합으로">
        <CodeBlock title="import">{`import { useStateForObject } from "@txstack/hooks";`}</CodeBlock>

        <CodeBlock title="쓰는 법">{`const [form, setForm] = useStateForObject({ name: "", email: "", agree: false });

setForm({ name: "홍길동" });          // 나머지는 그대로
setForm((prev) => ({ agree: !prev.agree }));`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <code>useState</code> 로 객체를 다루면 <code>setForm(prev =&gt; ({"{"} ...prev, name {"}"}))</code> 를 매번 쓰게 된다. <strong>퍼뜨리는 것을 잊으면 나머지 필드가 조용히 사라진다</strong> — 그
          자리를 없앤 훅이다.
        </p>
      </Block>

      <Block title="useUrlQuery — 주소를 화면 상태처럼">
        <CodeBlock title="import">{`import { useUrlQuery } from "@txstack/hooks/router";   // peer: react-router-dom`}</CodeBlock>

        <CodeBlock title="쓰는 법">{`const [query, setQuery] = useUrlQuery({
  defaults: { q: "", page: 1, sort: "stars" }
});

setQuery({ q: "react", page: 1 });   // ?q=react&page=1
setQuery((prev) => ({ page: prev.page + 1 }));`}</CodeBlock>

        <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
          <p>
            <strong>기본값의 타입이 복원 규칙이다.</strong> <code>page: 1</code> 이면 <code>?page=2</code> 를 숫자 <code>2</code> 로 읽는다. 기본값이 <code>undefined</code> 라 타입을 정할 수 없으면{" "}
            <code>queryTypes</code> 로 준다.
          </p>
          <p>
            <strong>반환 상태의 키 집합은 기본값이 정한다.</strong> 주소에 없는 키가 런타임에 생기지 않는다.
          </p>
          <p>
            <strong>
              기본은 <code>replace: true</code>
            </strong>{" "}
            — 필터를 만질 때마다 히스토리가 쌓이면 뒤로가기를 여러 번 눌러야 화면을 벗어난다.
          </p>
        </div>

        <CodeBlock title="그 밖의 옵션">{`useUrlQuery({
  defaults,
  urlKeys: ["q", "page"],        // 주소에 실을 키만 고른다
  queryTypes: { since: "string" },
  postParse: (q) => (q.page < 1 ? { page: 1 } : {}),   // 정규화
  encode: true,                  // 쿼리 전체를 base64url 한 덩어리로 감춘다
  replace: false
});`}</CodeBlock>

        <TxAlert variant="info" title="이 사이트가 쓰고 있다">
          <strong>Example</strong> 의 검색 화면이 이 훅으로 돈다 — 검색어 · 쪽 · 정렬이 주소에 실려 있어서 새로고침해도, 링크를 보내도 같은 화면이 뜬다.
        </TxAlert>
      </Block>

      <Block title="가져오지 않은 것">
        <p className="text-slate-600 dark:text-slate-300">
          <code>useDebounce</code> · <code>useLocalStorage</code> 같은 것은 담지 않았다. <strong>어디에나 있는 것을 우리 이름으로 다시 파는 일</strong>이고, 앱마다 원하는 동작이 조금씩 달라서 결국
          각자 짜게 된다.
        </p>
      </Block>
    </Page>
  );
}
