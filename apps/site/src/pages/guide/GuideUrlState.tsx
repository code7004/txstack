import { useUrlQuery } from "@txstack/hooks/useUrlQuery";
import { TxAlert, TxButton, TxPagination, TxSearchInput } from "@txstack/ui";
import { Link, useLocation } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../../components/Page";

const muted = "text-slate-600 dark:text-slate-300";

const STATUS = [
  { value: "all", label: "전체" },
  { value: "active", label: "활동" },
  { value: "left", label: "탈퇴" }
] as const;

/**
 * **이 페이지의 주소가 곧 상태다.** 검색어 · 상태 · 페이지를 바꾸면 주소창이 바뀌고,
 * 새로고침하거나 주소를 다른 사람에게 보내도 같은 조건으로 열린다.
 */
function FilterDemo() {
  const [query, setQuery] = useUrlQuery({ defaults: { q: "", status: "all", page: 1 } });
  const { search } = useLocation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TxSearchInput placeholder="이름 검색" aria-label="이름 검색" defaultValue={query.q} className="w-48" onSubmitText={(q) => setQuery({ q, page: 1 })} onClear={() => setQuery({ q: "", page: 1 })} />
        {STATUS.map((item) => (
          <TxButton key={item.value} label={item.label} variant={query.status === item.value ? "primary" : "secondary"} onClick={() => setQuery({ status: item.value, page: 1 })} />
        ))}
      </div>

      <TxPagination currentPage={query.page} totalRows={120} pageSize={10} onChangePage={(page) => setQuery({ page })} />

      <div className="flex flex-col gap-1 text-sm">
        <span className="text-slate-500 dark:text-slate-400">지금 주소</span>
        <code className="break-all">{search || "(조건 없음)"}</code>
        <span className="text-slate-500 dark:text-slate-400">
          읽은 값: <code>{JSON.stringify(query)}</code>
        </span>
      </div>
    </div>
  );
}

export function GuideUrlState() {
  return (
    <Page
      title="URL State"
      lead={
        <>
          목록의 검색어, 필터, 페이지 같은 조건을 주소에 담습니다. <code>@txstack/hooks</code>의 <code>useUrlQuery</code>를 사용합니다.
        </>
      }
    >
      <Block title="왜 주소에 담나요">
        <p className={muted}>
          조건을 컴포넌트 상태(<code>useState</code>)에만 두면 새로고침하거나 상세 화면에 갔다가 돌아왔을 때 조건이 사라집니다. 주소에 담아 두면 그대로 남고, 주소를 복사해 다른 사람에게 보내도 같은 화면이 열립니다.
        </p>
      </Block>

      <Block title="직접 해 보기">
        <p className={muted}>아래 조건을 바꾸면 이 페이지의 주소창이 함께 바뀝니다. 바꾼 뒤 새로고침해 보세요.</p>
        <Demo>
          <FilterDemo />
        </Demo>
      </Block>

      <Block title="1. 기본값 정하기">
        <p className={muted}>
          <code>useState</code>처럼 쓰되, 기본값을 객체로 넘깁니다. 주소에 값이 없으면 기본값을 씁니다. 처음 들어왔을 때는 주소를 건드리지 않고, <code>setQuery</code>를 부를 때만 주소에 적습니다.
        </p>
        <CodeBlock title="src/MemberList.tsx">{`import { useUrlQuery } from "@txstack/hooks/useUrlQuery";

const [query, setQuery] = useUrlQuery({
  defaults: { q: "", status: "all", page: 1 }
});

query.page;   // 숫자 — 기본값이 숫자라서 주소의 "3"을 3으로 읽습니다`}</CodeBlock>
        <TxAlert variant="info" title="기본값의 타입대로 읽습니다">
          주소에는 모든 값이 글자로 들어가지만, 기본값이 숫자면 숫자로, <code>true</code>/<code>false</code>면 불리언으로 되돌려 줍니다. 기본값에 없는 키는 결과에도 없습니다.
        </TxAlert>
      </Block>

      <Block title="2. 바꾸기">
        <p className={muted}>바꿀 값만 넘깁니다. 나머지 조건은 그대로 남습니다.</p>
        <CodeBlock title="조건을 바꾸면 1페이지로">{`setQuery({ q: "kim", page: 1 });                 // ?q=kim&status=all&page=1
setQuery({ status: "active", page: 1 });         // ?q=kim&status=active&page=1
setQuery((prev) => ({ page: prev.page + 1 }));   // ?q=kim&status=active&page=2`}</CodeBlock>
        <p className={muted}>검색 조건을 바꿀 때는 페이지를 1로 함께 돌려 주세요. 3페이지를 보다가 조건을 바꾸면 결과가 3페이지보다 적어 빈 화면이 나올 수 있습니다.</p>
      </Block>

      <Block title="3. 조건이 바뀌면 다시 불러오기">
        <p className={muted}>
          <code>query</code>를 의존성으로 두고 목록을 불러옵니다. 뒤로 가기를 눌러 주소가 바뀌어도 같은 경로로 다시 불러옵니다.
        </p>
        <CodeBlock title="src/MemberList.tsx">{`useEffect(() => {
  api.get<Page<Member>>("/members", query).then(setRows);
}, [query]);`}</CodeBlock>
      </Block>

      <Block title="뒤로 가기는 어떻게 되나요">
        <p className={muted}>
          기본으로 조건을 바꿀 때 방문 기록을 새로 쌓지 않고 현재 주소를 바꿉니다. 필터를 여러 번 바꾼 뒤 뒤로 가기를 누르면 이전 화면으로 바로 돌아갑니다. 조건마다 기록을 남기려면 <code>replace: false</code>를 넘깁니다.
        </p>
      </Block>

      <Block title="객체 상태를 다룰 때 — useObjectState">
        <p className={muted}>
          주소에 담을 필요가 없는 입력 폼 같은 상태에는 <code>useObjectState</code>를 씁니다. 바꿀 필드만 넘기면 나머지는 그대로 유지됩니다.
        </p>
        <SideBySide>
          <CodeBlock title="useState">{`setForm((prev) => ({ ...prev, name: "kim" }));
// ...prev를 빠뜨리면 나머지 필드가 사라집니다`}</CodeBlock>
          <CodeBlock title="useObjectState">{`import { useObjectState } from "@txstack/hooks/useObjectState";

const [form, setForm] = useObjectState({ name: "", email: "" });
setForm({ name: "kim" });   // email은 그대로`}</CodeBlock>
        </SideBySide>
      </Block>

      <p className={muted}>
        옵션 전체는{" "}
        <Link to="/api/hooks" className="underline">
          API › hooks
        </Link>
        에 정리해 두었습니다.
      </p>
    </Page>
  );
}
