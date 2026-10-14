import { useEffect, useState } from "react";
import { useUrlQuery } from "@txstack/hooks/useUrlQuery";
import { TxAlert, TxDropdown, TxPagination, TxSearchInput, TxSkeleton, TxTag } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { Block, Page } from "../components/Page";
import { searchRepos, toMessage, type Repo, type RepoSort } from "../lib/github";

const SORTS = [
  { name: "관련도순", value: "best-match" },
  { name: "스타 많은 순", value: "stars" },
  { name: "최근 업데이트순", value: "updated" }
] as const;

const PER_PAGE = 10;

/** GitHub 은 검색 결과를 1000개까지만 준다. 그 밖의 쪽을 누르면 422 다 */
const MAX_PAGE = Math.floor(1000 / PER_PAGE);

const stars = (count: number) => (count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count));

export function Examples() {
  /**
   * **조회 조건이 주소에 있다.** 새로고침해도, 링크를 붙여 보내도 같은 화면이 뜬다 —
   * `useUrlQuery` 가 `?q=...&page=2&sort=stars` 를 상태처럼 다룬다.
   *
   * 기본값의 타입이 복원 규칙이 된다: `page: 1` 이라 `?page=2` 를 숫자로 읽는다.
   */
  const [query, setQuery] = useUrlQuery({
    defaults: { q: "react hooks", page: 1, sort: "stars" as RepoSort }
  });

  const [rows, setRows] = useState<Repo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let alive = true;

    setError(undefined);

    // 빈 검색어에는 422 가 온다. 보내지 않는 편이 맞다 — 실패를 보여 줄 것이 없다
    if (!query.q.trim()) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    searchRepos({ q: query.q, page: query.page, perPage: PER_PAGE, sort: query.sort })
      .then((data) => {
        if (!alive) return;

        setRows(data.items);
        setTotal(Math.min(data.total_count, 1000));
      })
      .catch((cause) => {
        if (!alive) return;

        setError(toMessage(cause).message);
        setRows([]);
        setTotal(0);
      })
      .finally(() => alive && setLoading(false));

    // 화면을 떠난 뒤 도착한 응답은 버린다. 조건을 빨리 바꾸면 순서가 뒤바뀔 수 있다
    return () => {
      alive = false;
    };
  }, [query.q, query.page, query.sort]);

  /** 조건이 바뀌면 늘 1쪽으로. 조건과 쪽을 한 곳에서 바꾼다 */
  const search = (patch: { q?: string; sort?: RepoSort }) => setQuery({ ...patch, page: 1 });

  return (
    <Page title="Example" lead="GitHub 검색 API를 실제로 호출하는 예제입니다. 검색어와 정렬을 바꾸고 페이지를 넘겨 보세요. 인증 없이 호출하므로 1분에 10번 넘게 검색하면 GitHub이 요청을 막는데, 이때 나오는 오류 화면도 일부러 그대로 보여 줍니다.">
      <Block title="GitHub repository search">
        <div className="flex flex-wrap items-center gap-2">
          <TxSearchInput placeholder="검색어 입력 후 Enter" aria-label="저장소 검색" className="w-64" defaultValue={query.q} onSubmitText={(value) => search({ q: value })} onClear={() => search({ q: "" })} />

          <TxDropdown data={SORTS} value={query.sort} aria-label="정렬" className="w-40" onChangeText={(value) => search({ sort: (value ?? "best-match") as RepoSort })} />

          <span className="text-sm text-slate-500 dark:text-slate-400">{loading ? "검색 중…" : `${total.toLocaleString()}개`}</span>

          <code className="ms-auto font-mono text-xs text-slate-500 dark:text-slate-400">
            ?q={query.q || "—"}&amp;page={query.page}&amp;sort={query.sort}
          </code>
        </div>

        {error && (
          <TxAlert variant="danger" title="요청에 실패했습니다">
            {error}
          </TxAlert>
        )}

        {!error && !query.q && (
          <TxAlert variant="info" title="검색어를 입력해 주세요">
            GitHub은 빈 검색어로 검색할 수 없어서, 검색어가 없으면 요청을 보내지 않습니다.
          </TxAlert>
        )}

        <div className="flex flex-col gap-2">
          {loading
            ? Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="rounded-lg border p-4" style={{ borderColor: "var(--tx-color-border)" }}>
                  <TxSkeleton lines={2} />
                </div>
              ))
            : rows.map((repo) => (
                <article
                  key={repo.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:border-[color:var(--tx-color-primary-strong)]"
                  style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={repo.html_url} className="font-mono text-sm font-semibold hover:underline" target="_blank" rel="noreferrer">
                      {repo.full_name}
                    </a>
                    <TxTag>★ {stars(repo.stargazers_count)}</TxTag>
                    {repo.language && <TxTag>{repo.language}</TxTag>}
                    <span className="ms-auto text-xs text-slate-500 dark:text-slate-400">{repo.pushed_at.slice(0, 10)}</span>
                  </div>

                  {repo.description && <p className="text-sm text-slate-600 dark:text-slate-300">{repo.description}</p>}
                </article>
              ))}
        </div>

        <div className="flex justify-center">
          <TxPagination currentPage={query.page} totalRows={total} pageSize={PER_PAGE} maxPage={MAX_PAGE} onChangePage={(page) => setQuery({ page })} />
        </div>
      </Block>

      <Block title="Query conditions in the URL">
        <p className="text-slate-600 dark:text-slate-300">
          위에서 검색어를 바꾸거나 페이지를 넘기면 <strong>주소도 함께 바뀝니다.</strong> 새로고침하거나 이 주소를 다른 사람에게 보내도 같은 화면이 열립니다. <code>useUrlQuery</code>가 주소의 쿼리를 상태처럼 다루므로 조건을 저장할 상태를 따로 만들
          필요가 없습니다.
        </p>

        <CodeBlock title="Example.tsx">{`const [query, setQuery] = useUrlQuery({
  defaults: { q: "react hooks", page: 1, sort: "stars" as RepoSort }
});

// 기본값의 타입대로 값을 읽습니다 — page: 1이므로 ?page=2를 숫자로 읽습니다
// 조건이 바뀌면 1페이지로 돌아갑니다
const search = (patch) => setQuery({ ...patch, page: 1 });`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>기본적으로 히스토리를 쌓지 않습니다</strong>(<code>replace: true</code>). 그래서 조건을 열 번 바꿔도 <strong>뒤로 가기 한 번이면 이 페이지를 벗어납니다</strong>. 히스토리를 쌓으면 이전 페이지로 돌아가기 위해 뒤로 가기를 열 번 눌러야
          합니다.
        </p>

        <p className="text-slate-600 dark:text-slate-300">
          조건을 하나씩 되돌릴 수 있게 하려면 <code>replace: false</code>를 넘기세요. 이때는 뒤로 가기를 누르면 <strong>직전 조건</strong>으로 돌아갑니다. 어느 방식이 맞는지는 화면에 따라 정하면 됩니다.
        </p>
      </Block>

      <Block title="The app sets the request policy">
        <p className="text-slate-600 dark:text-slate-300">
          이 페이지의 요청은 <code>@txstack/axios</code>로 만든 클라이언트가 보냅니다. <strong>토큰, 401 처리, 응답 형식은 라이브러리가 정하지 않고</strong> 앱이 옵션으로 넘깁니다.
        </p>

        <CodeBlock title="lib/github.ts">{`export const github = createHttpClient({
  baseURL: "https://api.github.com",
  timeout: 10_000,
  headers: { Accept: "application/vnd.github+json" },

  // API 응답이 { body: T } 형식이라면 여기서 실제 데이터만 꺼냅니다
  // unwrap: (data) => data.body,

  // 토큰을 어디에 저장할지도 앱이 정합니다
  getToken: () => undefined,
  onUnauthorized: () => logout()
});

const data = await github.get<RepoSearch>("/search/repositories", { q, page, per_page: 10 });`}</CodeBlock>

        <TxAlert variant="warning" title="오류는 한 가지 형태로 받습니다">
          <code>parseApiError</code>는 네트워크 끊김, 시간 초과, 서버의 오류 응답을 모두 <code>{"{ statusCode, message }"}</code> 형태로 맞춰 줍니다. 위에서 1분에 10번 넘게 검색하면 GitHub이 403을 돌려주고, 검색 결과 자리에 오류 안내가 표시됩니다.
          직접 확인해 보세요.
        </TxAlert>
      </Block>
    </Page>
  );
}
