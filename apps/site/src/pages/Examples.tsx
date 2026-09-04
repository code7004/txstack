import { useEffect, useState } from "react";
import { useUrlQuery } from "@txstack/hooks/router";
import { TxAlert, TxDropdown, TxPagination, TxSearchInput, TxSkeleton, TxTag } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { Block, Page } from "../components/Page";
import { searchRepos, toMessage, type Repo, type RepoSort } from "../lib/github";

const SORTS = [
  { name: "관련도", value: "best-match" },
  { name: "스타 많은 순", value: "stars" },
  { name: "최근 갱신", value: "updated" }
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
    <Page title="Example" lead="공개 API 를 실제로 부르는 화면. 조회 조건은 주소에 실려 뒤로가기가 동작한다.">
      <Block title="GitHub 저장소 검색">
        <div className="flex flex-wrap items-center gap-2">
          <TxSearchInput placeholder="검색어를 넣고 Enter" aria-label="저장소 검색" className="w-64" defaultValue={query.q} onSubmitText={(value) => search({ q: value })} onClear={() => search({ q: "" })} />

          <TxDropdown data={SORTS} value={query.sort} aria-label="정렬" className="w-40" onChangeText={(value) => search({ sort: (value ?? "best-match") as RepoSort })} />

          <span className="text-sm text-slate-500 dark:text-slate-400">{loading ? "찾는 중…" : `${total.toLocaleString()}개`}</span>

          <code className="ms-auto font-mono text-xs text-slate-500 dark:text-slate-400">
            ?q={query.q || "—"}&amp;page={query.page}&amp;sort={query.sort}
          </code>
        </div>

        {error && (
          <TxAlert variant="danger" title="요청이 실패했다">
            {error}
          </TxAlert>
        )}

        {!error && !query.q && (
          <TxAlert variant="info" title="검색어를 넣어 보라">
            GitHub 는 빈 검색어를 받지 않는다. 그래서 이 화면은 요청을 아예 보내지 않는다.
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

      <Block title="주소가 상태다">
        <p className="text-slate-600 dark:text-slate-300">
          위에서 검색어를 바꾸고 쪽을 넘겨 보라 — <strong>주소가 함께 바뀐다.</strong> 새로고침해도, 이 주소를 남에게 보내도 같은 화면이 뜬다. 조건을 담아 둘 곳을 따로 만들지 않아도 된다.
        </p>

        <CodeBlock title="Example.tsx">{`const [query, setQuery] = useUrlQuery({
  defaults: { q: "react hooks", page: 1, sort: "stars" as RepoSort }
});

// 기본값의 타입이 복원 규칙이다 — page: 1 이라 ?page=2 를 숫자로 읽는다
// 조건이 바뀌면 늘 1쪽으로
const search = (patch) => setQuery({ ...patch, page: 1 });`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <strong>기본은 히스토리를 쌓지 않는다</strong>(<code>replace: true</code>). 그래서 조건을 열 번 만져도 <strong>뒤로가기 한 번이면 이 화면을 벗어난다</strong> — 쌓으면 이전 화면으로 나가려고 열 번을 눌러야 한다.
        </p>

        <p className="text-slate-600 dark:text-slate-300">
          조건 하나하나를 되돌릴 수 있게 하려면 <code>replace: false</code> 다. 그때는 뒤로가기가 <strong>직전 조건</strong>으로 돌아간다 — 어느 쪽이 맞는지는 화면이 정한다.
        </p>
      </Block>

      <Block title="요청은 정책을 주입받는다">
        <p className="text-slate-600 dark:text-slate-300">
          이 화면의 요청은 <code>@txstack/axios</code> 로 만든 클라이언트가 보낸다. <strong>토큰 · 401 처리 · 응답 봉투를 라이브러리가 정하지 않는다</strong> — 앱이 옵션으로 준다.
        </p>

        <CodeBlock title="lib/github.ts">{`export const github = createHttpClient({
  baseURL: "https://api.github.com",
  timeout: 10_000,
  headers: { Accept: "application/vnd.github+json" },

  // 회사 API 가 { body: T } 봉투면 이 자리에
  // unwrap: (data) => data.body,

  // 토큰을 어디에 두는지도 앱이 정한다
  getToken: () => undefined,
  onUnauthorized: () => logout()
});

const data = await github.get<RepoSearch>("/search/repositories", { q, page, per_page: 10 });`}</CodeBlock>

        <TxAlert variant="warning" title="에러도 한 형태로 온다">
          <code>parseApiError</code> 는 네트워크 끊김 · 시간 초과 · 서버 본문을 전부 <code>{"{ statusCode, message }"}</code> 로 정규화한다. 위 검색을 분당 10회 넘게 하면 GitHub 이 403 을 주는데, 그 자리에서 이 안내가 뜬다 — 직접 눌러 보라.
        </TxAlert>
      </Block>
    </Page>
  );
}
