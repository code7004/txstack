import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Page } from "../../components/Page";

export function ApiHooks() {
  return (
    <Page title="@txstack/hooks" lead="화면마다 반복해서 작성하게 되는 범용 훅 두 가지를 담았습니다. 훅마다 진입점이 따로 있어서 import 경로가 곧 훅 이름입니다.">
      <Block title="useObjectState — object state with partial updates">
        <CodeBlock title="import">{`import { useObjectState } from "@txstack/hooks/useObjectState";`}</CodeBlock>

        <CodeBlock title="사용법">{`const [form, setForm] = useObjectState({ name: "", email: "", agree: false });

setForm({ name: "홍길동" });          // 나머지 필드는 그대로
setForm((prev) => ({ agree: !prev.agree }));`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <code>useState</code>로 객체를 다루면{" "}
          <code>
            setForm(prev =&gt; ({"{"} ...prev, name {"}"}))
          </code>
          를 매번 작성해야 합니다.{" "}
          <strong>
            <code>...prev</code>를 빠뜨리면 나머지 필드가 경고 없이 사라집니다.
          </strong>{" "}
          이 훅은 바꿀 필드만 넘기면 나머지를 그대로 유지합니다.
        </p>
      </Block>

      <Block title="useUrlQuery — the URL query as state">
        <CodeBlock title="import">{`import { useUrlQuery } from "@txstack/hooks/useUrlQuery";   // peer: react-router-dom`}</CodeBlock>

        <CodeBlock title="사용법">{`const [query, setQuery] = useUrlQuery({
  defaults: { q: "", page: 1, sort: "stars" }
});

setQuery({ q: "react", page: 1 });   // ?q=react&page=1&sort=stars
setQuery((prev) => ({ page: prev.page + 1 }));`}</CodeBlock>

        <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300">
          <p>
            <strong>기본값의 타입대로 읽습니다.</strong> <code>page: 1</code>이면 <code>?page=2</code>를 숫자 <code>2</code>로 읽습니다. 기본값이 <code>undefined</code>라서 타입을 알 수 없으면 <code>queryTypes</code>로 지정합니다.
          </p>
          <p>
            <strong>반환되는 키는 기본값이 정합니다.</strong> 기본값에 없는 키는 주소에 있어도 결과에 들어오지 않습니다(<code>urlKeys</code>로 지정한 키는 예외).
          </p>
          <p>
            <strong>
              <code>replace</code>의 기본값은 <code>true</code>입니다.
            </strong>{" "}
            필터를 바꿀 때마다 방문 기록이 쌓이면 이전 화면으로 돌아가기 위해 뒤로 가기를 여러 번 눌러야 하기 때문입니다.
          </p>
        </div>

        <CodeBlock title="그 밖의 옵션">{`useUrlQuery({
  defaults,
  urlKeys: ["q", "page"],        // 기본값에는 없지만 주소에서 읽을 키
  queryTypes: { since: "string" },
  postParse: (q) => (q.page < 1 ? { page: 1 } : {}),   // 읽은 값을 보정
  encode: true,                  // 쿼리 전체를 base64url 문자열 하나로 감춥니다
  replace: false
});`}</CodeBlock>

        <TxAlert variant="info" title="이 사이트에서 쓰고 있습니다">
          <strong>Example</strong>의 검색 화면이 이 훅을 씁니다. 검색어, 페이지, 정렬이 주소에 담겨 있어서 새로고침하거나 링크를 공유해도 같은 화면이 열립니다.
        </TxAlert>
      </Block>

      <Block title="Hooks we left out">
        <p className="text-slate-600 dark:text-slate-300">
          <code>useDebounce</code>, <code>useLocalStorage</code> 같은 훅은 담지 않았습니다. <strong>이미 널리 쓰이는 라이브러리가 많고</strong>, 앱마다 원하는 동작이 조금씩 달라서 결국 각자 작성하게 되기 때문입니다.
        </p>
      </Block>
    </Page>
  );
}
